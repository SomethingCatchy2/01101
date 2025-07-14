import { gameState } from './persistence.js';
import { showNotification } from './utils.js';
// Remove invalid imports from je.js. UI update functions should be handled by orchestrator or utils if needed.

// --- Dice/Commit Constants ---
const MISSED_WIN_PENALTY = 25;
const BASE_WIN_AMOUNT = 100;
const COMMIT_FAIL_PENALTY = 50;
const WIN_STREAK_BONUS_MULTIPLIER_BASE = 0.1; // 10% bonus per streak
const NAP_GAIN_AMOUNT = 10;
const NAP_LOSS_AMOUNT = 15;

// --- Dice/Commit Logic ---
export function rollDice() {
    if (document.getElementById('roll-dice-btn').disabled) return;
    if (gameState.nextRollChance) handleNextRoll(); // Handle nap effects first

    // Check for penalty BEFORE rolling new dice if a win was available from the PREVIOUS roll state
    const potentialPointsBeforeRoll = gameState.dice.length === 4 ? gameState.dice.reduce((a, b) => a + b, 0) + gameState.bonusPoints : 0;
    if (potentialPointsBeforeRoll === 24 && !gameState.alreadyCounted) {
        gameState.missedWins++;
        gameState.moneyLost += MISSED_WIN_PENALTY;
        addNotification(`Penalty: -$${MISSED_WIN_PENALTY.toFixed(2)} for not committing previous 24!`, "loss");
        gameState.alreadyCounted = true; // Mark penalty as applied FOR THE PREVIOUS POTENTIAL WIN
    }

    gameState.dice = Array.from({
        length: 4
    }, () => Math.floor(Math.random() * 6) + 1);
    gameState.totalRolls++;
    gameState.alreadyCounted = false; // Reset for the new roll's potential win state
    gameState.moneyLost += 1; // Cost to roll

    updateElementText("dice-rolls", gameState.dice.join(", "));
    updateElementText("total-rolls", gameState.totalRolls);

    const bonusThisRoll = calculateBonus(); // This now handles the reset logic internally
    const potentialTotal = updateTotalPoints(); // Update display

    updateMoneyDisplay(); // Update money and button states
}

export function calculateBonus() {
    // Calculates bonus for the CURRENT gameState.dice.
    // If this roll yields 0 bonus, resets accumulated bonusPoints to 0.
    // Otherwise, adds this roll's bonus to the accumulated total.
    if (gameState.dice.length !== 4) return 0;

    const counts = {};
    let matchBonus = 0;
    let hasMatch = false;
    gameState.dice.forEach(num => {
        if (num !== 6) {
            counts[num] = (counts[num] || 0) + 1;
        }
    });
    Object.values(counts).forEach(count => {
        if (count >= 2) {
            matchBonus += (count - 1);
            hasMatch = true;
        }
    });

    const sortedUniqueDice = [...new Set(gameState.dice)].sort((a, b) => a - b);
    let runBonus = 0;
    let maxRunLength = 0;
    let currentRunLength = 0;
    for (let i = 0; i < sortedUniqueDice.length; i++) {
        if (i > 0 && sortedUniqueDice[i] === sortedUniqueDice[i - 1] + 1) {
            currentRunLength++;
        } else {
            currentRunLength = 1;
        }
        maxRunLength = Math.max(maxRunLength, currentRunLength);
    }
    if (maxRunLength >= 3) {
        runBonus = maxRunLength - 2;
    }

    let currentRollBonus = (hasMatch || runBonus > 0) ? (matchBonus + runBonus) : 0;

    // Apply lucky charm: adds +1 to bonus if any bonus was generated
    if (gameState.luckyCharmActive && currentRollBonus > 0) {
        currentRollBonus += 1;
    }

    // Apply dice bonus multiplier from "Premium Dice" upgrade
    if (gameState.diceBonusMultiplier && gameState.diceBonusMultiplier !== 1 && currentRollBonus > 0) {
        currentRollBonus = Math.floor(currentRollBonus * gameState.diceBonusMultiplier);
    }


    // --- NEW RESET LOGIC ---
    if (currentRollBonus === 0) {
        // If no bonus points were generated this roll, reset the accumulated total.
        gameState.bonusPoints = 0;
    } else {
        // Otherwise, add this roll's bonus to the accumulated total.
        gameState.bonusPoints += currentRollBonus;
    }
    // --- END NEW RESET LOGIC ---

    // Update the display AFTER applying the logic
    updateElementText("bonus-points", gameState.bonusPoints);

    return currentRollBonus; // Return bonus generated *this* roll for logging
}

export function updateTotalPoints() {
    // Updates the "Potential Total" display based on current dice and accumulated bonus
    if (gameState.dice.length !== 4) {
        updateElementText("total-points", "-");
        return 0; // Return 0 or some indicator if no dice
    }
    const diceSum = gameState.dice.reduce((a, b) => a + b, 0);
    const totalPoints = diceSum + gameState.bonusPoints;
    updateElementText("total-points", totalPoints);

    return totalPoints; // Return the calculated total for logging
}

export function commit() {
    if (document.getElementById('commit-btn').disabled) return;
    if (gameState.dice.length === 0) {
        addNotification("Roll the dice first!", "info");
        return;
    }

    const diceSum = gameState.dice.reduce((a, b) => a + b, 0);
    // Use the accumulated bonus points for the final check
    const totalPoints = diceSum + gameState.bonusPoints;

    if (totalPoints === 24) {
        gameState.consecutiveWins++;
        const currentWinStreakMultiplier = gameState.winStreakMultiplier || 1;
        const streakBonus = gameState.consecutiveWins * WIN_STREAK_BONUS_MULTIPLIER_BASE * currentWinStreakMultiplier;
        const winnings = BASE_WIN_AMOUNT + streakBonus;
        gameState.moneyEarned += winnings;
        gameState.wins++;
        updateElementText("wins", gameState.wins);
        addNotification(`COMMIT SUCCESS! Score: 24 (${diceSum} + ${gameState.bonusPoints}). Streak: ${gameState.consecutiveWins}x. Earned $${winnings.toFixed(2)}.`, "win");
        // unlock Upgrades tab on first win
        if (gameState.wins === 1) {
            const upBtn = document.getElementById("upgrades-tab-button");
            if (upBtn) upBtn.style.display = "";
            addNotification("Upgrades unlocked!", "win");
        }
    } else {
        gameState.moneyLost += COMMIT_FAIL_PENALTY;
        gameState.consecutiveWins = 0; // Reset streak on fail
        addNotification(`COMMIT FAILED! Score: ${totalPoints} (${diceSum} + ${gameState.bonusPoints}). Needed 24. Lost $${COMMIT_FAIL_PENALTY.toFixed(2)}. Streak reset.`, "loss");
    }

    // --- CRITICAL: Reset accumulated bonus points AFTER commit ---
    gameState.bonusPoints = 0;
    updateElementText("bonus-points", gameState.bonusPoints); // Update display to 0

    updateMoneyDisplay(); // Update money totals & button states
    resetDiceAfterCommit(); // Clear the dice display
}

export function resetDiceAfterCommit() {
    // Clears dice display and related flags after a commit attempt
    gameState.dice = [];
    gameState.alreadyCounted = false; // Reset penalty flag as the commit resolved the situation
    updateElementText("dice-rolls", "-");
    updateElementText("total-points", "-"); // Clear potential total display until next roll
    updateButtonStates(); // Re-enable/disable buttons as needed
}

export function handleNextRoll() {
    // This function remains the same, handling nap results before a roll
    if (!gameState.nextRollChance) return;

    let gainAmount = NAP_GAIN_AMOUNT;
    let lossAmount = NAP_LOSS_AMOUNT;

    if (gameState.napEffectivenessMultiplier && gameState.napEffectivenessMultiplier !== 1) {
        gainAmount = Math.floor(gainAmount * gameState.napEffectivenessMultiplier);
        lossAmount = Math.floor(lossAmount * gameState.napEffectivenessMultiplier); // Assuming multiplier also makes bad naps worse, or adjust as needed
    }

    if (gameState.nextRollChance === "gain") {
        gameState.moneyEarned += gainAmount;
        addNotification(`Well Rested bonus applied: +$${gainAmount.toFixed(2)}`, "finish-success");
    } else if (gameState.nextRollChance === "lose") {
        gameState.moneyLost += lossAmount;
        addNotification(`Poor Nap penalty applied: -$${lossAmount.toFixed(2)}`, "finish-fail");
    }
    gameState.nextRollChance = null;
    // updateMoneyDisplay() will be called by rollDice shortly after
}

// --- NEW DICE GAME LOGIC ---
// Only one rollDice function is exported per module. Ensure no duplicate export exists.

export function commitToDice() {
    if (gameState.dice.rolled) {
        if (gameState.dice.value > 3) {
            const winnings = gameState.dice.value * 5;
            gameState.money += winnings;
            showNotification(`You won $${winnings.toFixed(2)}!`);
        } else {
            showNotification("You lost!");
        }
        gameState.dice.rolled = false;
        gameState.dice.value = 0;
        updateMoney();
        updateDiceResult();
        updateDiceCommitButton();
    }
}
