// je.js
// Main game logic, initialization, event handling, core mechanics.
import { gameState } from './game_state.js';
import { itemDefinitions } from './items.js';
import { updateElementText, showMessage, updateMoneyDisplay, addNotification, updateButtonStates } from './utils.js';
import { initMuggability, recordSleepOrNap, recalculateMuggability } from './muggability.js';
import { initShopping, updateEquipmentSelectors, updateOwnedItemButtons, buyItem, populateShopGrids } from './shopping.js'; // Added populateShopGrids for reset
import { initAgeing, buyClothes, momNag } from './ageing.js'; // Import momNag for direct call if needed, or rely on interval
import { initWorkEnhancements, workAsDogWalker } from './work_enhancements.js';
import { initLocationTaxes, changeLocation } from './location_taxes.js'; // Import changeLocation if UI added later
import { initHobbies, sleepHobby } from './hobbies.js';


// --- DOM Element References ---
const notificationLog = document.getElementById('notification-log');
const bankruptcyResetBtn = document.getElementById('bankruptcy-reset-btn');
// Make messageTimeout global for utils.js clear function
window.messageTimeout = null;

// --- Core Game Mechanics ---

/**
 * Rolls 4 dice, applies cost, calculates points, updates UI.
 * Restricted based on certain ongoing actions.
 */
function rollDice() {
  // Rule: Can roll unless doing Mines, Staples, Nap, Dog Walk, Sleep Hobby. Office OK.
  const canRoll = !gameState.isWorkingMines && !gameState.isWorkingStaples && !gameState.isTakingNap && !gameState.isWalkingDog && !gameState.isSleepingHobby;
  if (!canRoll) {
    addNotification("Cannot roll dice while doing that job!", "info");
    return;
  }

  // Apply nap effect if pending from previous nap
  if (gameState.nextRollChance) {
    handleNextRoll(); // Applies effect and clears chance
  }

  // Roll dice and update state
  gameState.dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  gameState.totalRolls++;
  gameState.alreadyCounted = false; // Reset missed win check for this roll
  gameState.moneyLost += 1; // Cost $1 to roll (track as positive loss)

  // Update UI and calculations
  updateElementText("dice-rolls", gameState.dice.join(", "));
  updateElementText("total-rolls", gameState.totalRolls);
  calculateBonus(); // Recalculates and updates bonus points display
  updateTotalPoints(); // Calculates and updates total points, checks for missed win

  addNotification(`Rolled: ${gameState.dice.join(", ")}. Cost $1. Total: ${gameState.dice.reduce((a,b)=>a+b,0) + gameState.bonusPoints}, Bonus: ${gameState.bonusPoints}`, "info");
  updateMoneyDisplay(); // Update money display after cost and potential missed win penalty
  updateButtonStates(); // Update button enabled/disabled states
}

/**
 * Calculates bonus points based on current dice roll.
 * Excludes matches of 6s. Includes 6s in runs.
 * Adds to existing bonus unless no bonus condition met this round.
 */
function calculateBonus() {
  if (gameState.dice.length !== 4) return; // Ensure we have 4 dice

  const counts = {};
  let matchBonus = 0;

  // 1. Calculate Match Bonus (excluding 6s)
  gameState.dice.forEach(num => {
    if (num !== 6) { // *** CRITICAL: Ignore 6s for match bonus ***
        counts[num] = (counts[num] || 0) + 1;
    }
  });

  let hasMatch = false;
  Object.values(counts).forEach(count => {
    if (count >= 2) { // Pairs, 3-of-a-kind, 4-of-a-kind (of non-sixes)
      matchBonus += (count - 1); // +1 for pair, +2 for triple, +3 for quad
      hasMatch = true;
    }
  });

  // 2. Calculate Run Bonus (including 6s)
  // Use Set to get unique values, then sort for easier run checking
  const sortedUniqueDice = [...new Set(gameState.dice)].sort((a, b) => a - b);
  let runBonus = 0;
  let maxRunLength = 0;
  let currentRunLength = 0;

  for (let i = 0; i < sortedUniqueDice.length; i++) {
      if (i > 0 && sortedUniqueDice[i] === sortedUniqueDice[i - 1] + 1) {
          currentRunLength++; // Increment run if consecutive
      } else {
          currentRunLength = 1; // Reset run if not consecutive or it's the first die
      }
      maxRunLength = Math.max(maxRunLength, currentRunLength); // Track longest run found
  }

  // Award bonus points for runs of 3 or 4
  if (maxRunLength >= 3) {
      runBonus = maxRunLength - 2; // Run of 3 -> +1 point, Run of 4 -> +2 points
  }

  // 3. Update Total Bonus Points
  // If NO match AND NO run occurred this specific round, reset bonus points to 0
  if (!hasMatch && runBonus === 0) {
      gameState.bonusPoints = 0;
  } else {
      // Otherwise, add the bonus earned this round to the existing total
      gameState.bonusPoints += (matchBonus + runBonus);
  }

  // Update UI
  updateElementText("bonus-points", gameState.bonusPoints);
}

/**
 * Calculates and updates the total points display (Dice Sum + Bonus).
 * Checks for a "missed win" (rolling 24 but not committing).
 */
function updateTotalPoints() {
  if (gameState.dice.length !== 4) {
    updateElementText("total-points", "-");
    return;
  }

  const diceSum = gameState.dice.reduce((a, b) => a + b, 0);
  const totalPoints = diceSum + gameState.bonusPoints;
  updateElementText("total-points", totalPoints);

  // Check for missed win (only if 24 rolled AND not already penalized this roll)
  if (totalPoints === 24 && !gameState.alreadyCounted) {
    gameState.missedWins++;
    gameState.moneyLost += 500; // Penalty for not committing on 24
    // updateElementText("missed-wins", gameState.missedWins); // If element exists
    addNotification("YOU ROLLED 24! Commit now or face a $500 penalty if you roll again!", "loss");
    gameState.alreadyCounted = true; // Mark penalized for this roll
    updateMoneyDisplay(); // Update money immediately due to penalty
  }
}

/**
 * Commits the current dice roll. Awards win if total is 24, penalizes otherwise.
 * Resets bonus points after every commit.
 * Restricted based on certain ongoing actions.
 */
function commit() {
  // Rule: Can commit unless doing Mines, Staples, Nap, Dog Walk, Sleep Hobby. Office OK.
  const canCommit = !gameState.isWorkingMines && !gameState.isWorkingStaples && !gameState.isTakingNap && !gameState.isWalkingDog && !gameState.isSleepingHobby;
   if (!canCommit) {
    addNotification("Cannot commit while doing that job!", "info");
    return;
  }
  if (gameState.dice.length === 0) {
    addNotification("Roll the dice first!", "info");
    return;
  }

  const totalPoints = gameState.dice.reduce((a, b) => a + b, 0) + gameState.bonusPoints;

  if (totalPoints === 24) {
    // --- WIN ---
    gameState.consecutiveWins++;
    // Win amount scaling needs review - let's make it less extreme
    // const winnings = 1500 * gameState.consecutiveWins; // Old scaling
    const baseWin = 1000; // Base amount for winning
    const streakBonus = gameState.consecutiveWins * 250; // Bonus per streak item
    const winnings = baseWin + streakBonus;

    gameState.moneyEarned += winnings;
    gameState.wins++;
    updateElementText("wins", gameState.wins);
    addNotification(`COMMIT SUCCESS! Total is 24! Streak: ${gameState.consecutiveWins}x. Earned $${winnings.toFixed(2)}`, "win");
  } else {
    // --- LOSE ---
    const penalty = 100; // Standard penalty for failed commit
    gameState.moneyLost += penalty;
    gameState.consecutiveWins = 0; // Reset streak on failed commit
    addNotification(`COMMIT FAILED! Total was ${totalPoints} (Needed 24). Lost $${penalty.toFixed(2)}.`, "loss");
  }

  // Reset bonus points AFTER commit attempt (win or lose)
  gameState.bonusPoints = 0;
  updateElementText("bonus-points", gameState.bonusPoints);

  updateMoneyDisplay(); // Update money display
  resetDiceAfterCommit(); // Resets dice & related UI, updates buttons
}

/**
 * Resets dice roll state after a commit or when needed.
 */
function resetDiceAfterCommit() {
  gameState.dice = [];
  gameState.alreadyCounted = false; // Reset missed win flag
  updateElementText("dice-rolls", "-");
  updateElementText("total-points", "-");
  updateButtonStates(); // Re-enable relevant buttons
}

/**
 * Applies the pending effect ('gain' or 'lose') from the last nap.
 * Called automatically before the next dice roll if an effect is pending.
 */
function handleNextRoll() {
  if (!gameState.nextRollChance) return; // No effect pending

  // Flat bonus/penalty for nap effect
  const gainAmount = 75;
  const lossAmount = 75;
  let effectApplied = false;

  if (gameState.nextRollChance === "gain") {
    gameState.moneyEarned += gainAmount;
    addNotification(`Well Rested bonus applied: +$${gainAmount.toFixed(2)}`, "finish-success");
    effectApplied = true;
  } else if (gameState.nextRollChance === "lose") {
    gameState.moneyLost += lossAmount;
    addNotification(`Poor Nap penalty applied: -$${lossAmount.toFixed(2)}`, "finish-fail");
    effectApplied = true;
  }

  gameState.nextRollChance = null; // Clear the pending effect

  if (effectApplied) {
      updateMoneyDisplay(); // Update money display only if effect was applied
  }
}

// --- Work Functions (Defined directly in je.js for simpler scope management for now) ---

/**
 * Simulates working in the mines. Sets flag, uses timeout, applies random outcome.
 */
function workInMines() {
    if (gameState.isWorkingMines || isInDebt('severe')) return; // Check specific flag & severe debt
    gameState.isWorkingMines = true;
    updateButtonStates();
    addNotification("Started working in the mines.", "start");
    const duration = 10000; // 10 seconds
    setTimeout(() => {
         // Balanced outcomes
         const outcomes = [
             { value: 150, message: "Found some copper worth $150." },
             { value: 600, message: "Found silver ore worth $600." },
             { value: 1200, message: "You found gold! Earned $1200!" },
             { value: -200, message: "Minor injury in the mines. Medical bills: $200." },
             { value: getRandomInt(800, 3500), message: "You found a sparkling rare gem!" }, // Adjusted range
             { value: 50, message: "Found some coal. Better than nothing. $50." }, // Added low positive
             { value: -150, message: "Cave-in blocked the main vein. Lost $150 in wasted effort." },
             { value: -400, message: "Your mining helmet lamp broke! Replacement cost: $400." }
         ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let notificationType = 'info';

        if (outcome.value < 0) {
            gameState.moneyLost -= outcome.value; // moneyLost is positive value of loss
            notificationType = 'finish-fail';
        } else {
            gameState.moneyEarned += outcome.value;
            notificationType = 'finish-success';
        }

        addNotification(`Finished mining. ${outcome.message} (${outcome.value >= 0 ? '+' : ''}$${outcome.value.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingMines = false; // Clear flag
        updateButtonStates();
    }, duration);
}

/**
 * Simulates working in the office. Allows dice rolling during work.
 */
function workInOfficeJob() {
     if (gameState.isWorkingOffice || isInDebt('moderate')) return; // Check specific flag & moderate debt
    gameState.isWorkingOffice = true;
    updateButtonStates(); // Update button states (dice/commit remain enabled)
    addNotification("Started working in the office. You can still roll dice!", "start");
    const duration = 7000; // 7 seconds
    setTimeout(() => {
         // Balanced outcomes
         const outcomes = [
            { value: 250, message: "Regular office work completed. Earned $250." },
            { value: 350, message: "Got a bonus for finishing early! Earned $350." },
            { value: 180, message: "Filed TPS reports. Earned $180." }, // Themed outcome
            { value: 450, message: "Impressed the boss with your 'synergy'! Earned $450." },
            { value: -50, message: "Painful paper cut! Medical expense: $50." },
            { value: 0, message: "Attended a mandatory meeting about meetings. No pay." },
            { value: 75, message: "Fixed the coffee machine. Got $75 from the petty cash." },
            { value: -100, message: "Sent an email to the wrong 'reply all'. Docked $100 pay for cleanup." },
            { value: 300, message: "Successfully upsold a client! Commission: $300." } // Positive outcome
         ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let notificationType = 'info';

        if (outcome.value < 0) {
            gameState.moneyLost -= outcome.value;
             notificationType = 'finish-fail';
        } else {
            gameState.moneyEarned += outcome.value;
            notificationType = 'finish-success';
        }

        addNotification(`Finished office work. ${outcome.message} (${outcome.value >= 0 ? '+' : ''}$${outcome.value.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingOffice = false; // Clear flag
        updateButtonStates(); // Update buttons again
    }, duration);
}

/**
 * Simulates working stapling tables. High risk/reward.
 */
function workInStapleTables() {
     if (gameState.isWorkingStaples || isInDebt('moderate')) return; // Check specific flag & moderate debt
    gameState.isWorkingStaples = true;
    updateButtonStates();
    addNotification("Started the glorious task of stapling tables.", "start");
    const duration = 5000; // 5 seconds
    setTimeout(() => {
         // Balanced outcomes (nerfed big loss)
         const outcomes = [
            { value: 70, message: "Stapled 10 tables. Earned $70." },
            { value: 90, message: "Efficient stapling today! $90." },
            { value: 120, message: "Staple Master performance! Earned $120." },
            { value: -5000, message: "Stapler malfunction caused significant damage. -$5000." }, // Nerfed loss amount
            { value: 200, message: "Found a lost company credit card. Reward: $200." }, // Changed finding
            { value: 0, message: "Ran out of staples halfway through the shift. No pay." },
            { value: -300, message: "Stapled your own thumb securely to a table. -$300." }, // Adjusted outcome
            { value: 150, message: "Invented a new, faster stapling technique! Bonus: $150." }, // Positive outcome
         ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let notificationType = 'info';

        if (outcome.value < 0) {
            gameState.moneyLost -= outcome.value;
            notificationType = 'finish-fail';
        } else {
            gameState.moneyEarned += outcome.value;
            notificationType = 'finish-success';
        }

        addNotification(`Finished stapling. ${outcome.message} (${outcome.value >= 0 ? '+' : ''}$${outcome.value.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingStaples = false; // Clear flag
        updateButtonStates();
    }, duration);
}

/**
 * Simulates taking a short nap. Sets up a potential gain/loss on the next roll.
 */
function takeNap() {
     if (gameState.isTakingNap || isInDebt('any')) return; // Check flag & any debt
    gameState.isTakingNap = true;
    updateButtonStates();
    addNotification("Taking a short power nap.", "start");
    recordSleepOrNap(); // Record rest time for muggability

    const duration = 5000; // 5 seconds
    setTimeout(() => {
        // Determine outcome (gain or lose on next roll)
        gameState.nextRollChance = Math.random() < 0.55 ? "gain" : "lose"; // Slightly higher chance of gain? 55/45
        const resultMessage = gameState.nextRollChance === "gain" ? "You feel refreshed." : "You had a stressful dream.";
        addNotification(`Finished nap. ${resultMessage} Effect applies on next roll.`, "info");

        gameState.isTakingNap = false; // Clear flag
        updateButtonStates();
        recalculateMuggability(); // Update muggability after nap
    }, duration);
}

/**
 * Checks if the player is in debt and prevents actions accordingly.
 * @param {'any' | 'moderate' | 'severe'} level - The level of debt check.
 * @returns {boolean} True if the player is in debt at the specified level, false otherwise.
 */
function isInDebt(level = 'any') {
  let threshold = 0;
  let message = "";

  switch (level) {
    case 'severe':
      threshold = -5000;
      message = "SEVERE DEBT: Assets may be seized! Cannot perform high-risk work.";
      break;
    case 'moderate':
      threshold = -500;
      message = "MODERATE DEBT: Risky ventures restricted.";
      break;
    case 'any':
    default:
      threshold = -100; // Allow small negative balance for some actions? Let's keep it strict.
      message = "IN DEBT: Cannot perform this action while in debt.";
      break;
  }

  if (gameState.netMoney <= threshold) {
     addNotification(message, "loss");
    return true;
  }
  return false;
}


// --- Utility & Lifecycle Functions ---

/**
 * Generates a random integer between min and max (inclusive).
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Checks for bankruptcy condition (-10000 net money). Shows reset button if bankrupt.
 */
function checkBankruptcy() {
  const bankruptcyThreshold = -10000;
  const isBankrupt = gameState.netMoney <= bankruptcyThreshold;
  const isButtonVisible = bankruptcyResetBtn && bankruptcyResetBtn.style.display !== 'none';

  if (isBankrupt && !isButtonVisible) {
    // --- Trigger Bankruptcy ---
    addNotification("BANKRUPTCY! The IRS has seized everything! GAME OVER.", "loss");

    // Disable all action buttons EXCEPT the reset button
    const actionButtons = document.querySelectorAll('.box button, .shop-grid button'); // Select all relevant buttons
    actionButtons.forEach(btn => {
        if (btn.id !== 'bankruptcy-reset-btn') {
             btn.disabled = true;
        }
    });

    // Stop all ongoing work timers forcefully? Not easily possible without storing timer IDs.
    // For simplicity, just disable buttons. Work will finish but yield no result if bankruptcy hit mid-work.

    // Show the reset button
    if (bankruptcyResetBtn) bankruptcyResetBtn.style.display = 'inline-block';

  } else if (!isBankrupt && isButtonVisible) {
     // If somehow net money becomes positive again, hide the button (unlikely scenario)
     if (bankruptcyResetBtn) bankruptcyResetBtn.style.display = 'none';
  }
}

/**
 * Saves the current game state to localStorage.
 */
function saveGame() {
  try {
    // gameState now holds all persistent state, including flags and equipment
    localStorage.setItem('towerOfGableData_v14_2', JSON.stringify(gameState)); // Versioned key
    // console.log("Game saved."); // Optional debug message
  } catch (e) {
    console.error("Could not save game state:", e);
    addNotification("Error saving game!", "loss");
  }
}

/**
 * Loads the game state from localStorage. Updates UI accordingly.
 * Includes error handling and defaults for missing properties in old saves.
 */
function loadGame() {
  try {
    const savedData = localStorage.getItem('towerOfGableData_v14_2'); // Use versioned key
    if (savedData) {
      const loadedState = JSON.parse(savedData);

      // Merge loaded state into gameState, ensuring defaults for any missing keys
      // This handles adding new properties in future versions gracefully.
      for (const key in gameState) {
          if (loadedState.hasOwnProperty(key)) {
              gameState[key] = loadedState[key];
          } else {
              // If a key exists in default gameState but not save, keep the default
              console.warn(`Save data missing key: ${key}. Using default value.`);
          }
      }
       // Explicitly ensure muggability starts correctly if save is corrupt/missing it
       gameState.muggability = gameState.muggability ?? 50;
       gameState.lastSleepOrNapTime = gameState.lastSleepOrNapTime || Date.now();


      // --- Update All UI Elements After Loading ---
      updateElementText("wins", gameState.wins);
      updateElementText("total-rolls", gameState.totalRolls);
      updateMoneyDisplay(); // Handles earned/lost/net display
      updateElementText("age-display", gameState.age);
      updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
      updateElementText("location-display", gameState.currentLocation);
      updateElementText("sleep-level", gameState.sleepLevel);
      updateElementText("muggability-display", gameState.muggability);
      updateElementText("slaves", gameState.slaves);
      updateElementText("bonus-points", gameState.bonusPoints);
      updateElementText("dice-rolls", gameState.dice.length > 0 ? gameState.dice.join(", ") : "-");
      updateTotalPoints(); // Recalculate and display total points based on loaded dice/bonus

      // Update shop/equipment UI based on loaded owned/equipped items
      updateEquipmentSelectors(); // Populates dropdowns based on gameState.ownedItems
      updateOwnedItemButtons(); // Disables buy buttons for owned items

      addNotification("Game loaded from previous session.", "info");

    } else {
       // No save data found - Update UI to reflect initial default state
       addNotification("No save data found. Starting fresh.", "info");
       updateMoneyDisplay();
       updateElementText("age-display", gameState.age);
       updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
       updateElementText("location-display", gameState.currentLocation);
       updateElementText("sleep-level", gameState.sleepLevel);
       updateElementText("muggability-display", gameState.muggability);
       updateElementText("slaves", gameState.slaves);
       updateOwnedItemButtons(); // Ensure shop buttons are correctly enabled/disabled
       updateEquipmentSelectors();
    }
  } catch (e) {
    console.error("Could not load saved game:", e);
    addNotification("Failed to load save data. Resetting game.", "loss");
    resetGameAll(); // Reset if loading fails
  }
}


/**
 * Resets the entire game state to its initial values. Clears save data.
 */
function resetGameAll() {
    // --- Reset gameState Object ---
    Object.assign(gameState, {
        // Core Game
        wins: 0, consecutiveWins: 0, missedWins: 0, bonusPoints: 0, totalRolls: 0,
        dice: [], alreadyCounted: false,
        // Money
        moneyEarned: 0, moneyLost: 0, netMoney: 0,
        // Work Flags
        isWorkingMines: false, isWorkingOffice: false, isWorkingStaples: false,
        isTakingNap: false, isWalkingDog: false, isSleepingHobby: false,
        // Effects
        nextRollChance: null,
        // Player Status
        age: 4, clothesPrice: 10 + (4 * 4), lastClothingChange: Date.now(),
        currentLocation: "North Carolina", sleepLevel: 100, slaves: 0, momNagCount: 0,
        // Muggability & Equipment
        muggability: 50, lastSleepOrNapTime: Date.now(),
        ownedItems: {}, equippedHat: null, equippedJacket: null,
    });

    // --- Update All UI Elements ---
    updateElementText("wins", gameState.wins);
    updateElementText("total-rolls", gameState.totalRolls);
    updateMoneyDisplay(); // Handles all money displays
    updateElementText("dice-rolls", "-");
    updateElementText("bonus-points", "0");
    updateElementText("total-points", "-");
    updateElementText("age-display", gameState.age);
    updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
    updateElementText("location-display", gameState.currentLocation);
    updateElementText("sleep-level", gameState.sleepLevel);
    updateElementText("muggability-display", gameState.muggability);
    updateElementText("slaves", gameState.slaves);

    // --- Reset UI Components ---
    if (notificationLog) notificationLog.innerHTML = ''; // Clear notifications
    if (bankruptcyResetBtn) bankruptcyResetBtn.style.display = 'none'; // Hide reset button

    // Reset Shop UI (re-enable buy buttons, clear dropdowns)
    updateOwnedItemButtons(); // Should re-enable all buy buttons as ownedItems is {}
    updateEquipmentSelectors(); // Should reset dropdowns to "-- None --"

    updateButtonStates(); // Ensure action buttons are correctly enabled

    // --- Clear Save Data ---
    localStorage.removeItem('towerOfGableData_v14_2'); // Use versioned key

    addNotification("Game Reset to Beginning!", "info");
}


/**
 * Initializes the game on page load. Loads data, sets up modules, attaches listeners.
 */
function initGame() {
  console.log("Initializing Game V14.2...");
  loadGame(); // Load saved state first (or set defaults)

  // Initialize subsystems
  initAgeing();
  initWorkEnhancements(); // Placeholder if needed
  initLocationTaxes();
  initHobbies();
  initShopping(); // Populates shop, sets equip listeners
  initMuggability(); // Starts muggability updates

  // Add event listeners to buttons
  const buttonMappings = {
    "roll-dice-btn": rollDice,
    "commit-btn": commit,
    "work-in-mines-btn": workInMines,
    "work-in-office-btn": workInOfficeJob,
    "work-staple-tables-btn": workInStapleTables,
    "take-nap-btn": takeNap,
    "work-dog-walker-btn": workAsDogWalker, // Imported from work_enhancements
    "sleep-hobby-btn": sleepHobby, // Imported from hobbies
    "buy-clothes-btn": buyClothes, // Imported from ageing
    "bankruptcy-reset-btn": resetGameAll // Listener for the bankruptcy button
  };

  Object.entries(buttonMappings).forEach(([id, func]) => {
    const button = document.getElementById(id);
    if (button) {
      // Use onclick for simplicity, ensuring only one listener is attached
      button.onclick = func;
    } else {
       console.error(`Button with ID "${id}" not found during init.`);
    }
  });

  // Set initial button states based on loaded/default game state
  updateButtonStates();

  // Start periodic background tasks
  setInterval(saveGame, 60 * 1000); // Save every 60 seconds
  setInterval(checkBankruptcy, 1 * 1000); // Check bankruptcy every second
  // Mom Nag interval is started in initAgeing()
  // Muggability interval is started in initMuggability()

  addNotification("Welcome to the Tower of Gable - WebV14.2", "info");
  console.log("Game Initialized.");
}

// --- Start the game ---
window.addEventListener("load", initGame);