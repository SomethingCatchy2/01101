// muggability.js
// Handles the calculation and events related to the player's muggability score.
import { gameState } from './game_state.js';
import { itemDefinitions } from './items.js';
import { addNotification, updateElementText, updateMoneyDisplay } from './utils.js';

const MUGGABILITY_UPDATE_INTERVAL = 5000; // Update every 5 seconds
const SLEEP_DEPRIVATION_THRESHOLD = 10 * 60 * 1000; // 10 minutes without sleep/nap increases risk
const MUGGING_THRESHOLD = 100; // Muggability level at which mugging is triggered
const MUGGING_RESET_VALUE = 50; // Value muggability resets to after a mugging attempt
const MUGGING_SUCCESS_RATE = 0.75; // 75% chance the mugger succeeds
const MONEY_LOSS_PERCENTAGE = 0.50; // Lose 50% of net money if mugged successfully

/**
 * Initializes the muggability system. Sets the interval timer.
 */
export function initMuggability() {
    // Ensure lastSleepOrNapTime is initialized if loading old save or starting fresh
    gameState.lastSleepOrNapTime = gameState.lastSleepOrNapTime || Date.now();
    // Ensure muggability is within bounds on load, defaulting to 50
    gameState.muggability = Math.max(0, Math.min(100, Math.round(gameState.muggability ?? MUGGING_RESET_VALUE)));

    updateElementText("muggability-display", gameState.muggability); // Initial display
    setInterval(updateMuggability, MUGGABILITY_UPDATE_INTERVAL);
}

/**
 * Periodically updates the player's muggability score based on various factors.
 * Clamps the value between 0 and 100 and checks for mugging trigger.
 */
function updateMuggability() {
    let change = 0;

    // 1. Base random fluctuation (+/- 1 or 2)
    change += (Math.random() * 3) - 1.5; // Average change of 0, range ~ +/- 1.5

    // 2. Sleep Deprivation
    const timeSinceSleep = Date.now() - gameState.lastSleepOrNapTime;
    if (timeSinceSleep > SLEEP_DEPRIVATION_THRESHOLD) {
        change += 2.5; // Increase faster if sleep deprived (adjust amount as needed)
        if (Math.random() < 0.05) { // Small chance for extra notification
             addNotification("You look tired, making you an easier target...", "info");
        }
    } else {
        change -= 0.5; // Slight decrease if recently rested
    }

    // 3. Equipment Effects
    change += calculateEquipmentMuggabilityEffect();

    // 4. Crime Effects (Placeholder - Add when crime system exists)
    // Example: if (gameState.recentCrimeScore > 5) { change += 3; }

    // 5. Net Money Effect (Slight increase if very wealthy, slight decrease if very poor)
    if (gameState.netMoney > 10000) {
        change += 0.5; // Look like you have money
    } else if (gameState.netMoney < -1000) {
        change -= 0.5; // Look like you have nothing worth taking
    }


    // Apply change
    gameState.muggability += change;

    // Clamp between 0 and 100 and round
    gameState.muggability = Math.max(0, Math.min(100, Math.round(gameState.muggability)));

    // Update UI
    updateElementText("muggability-display", gameState.muggability);

    // Check for mugging event
    if (gameState.muggability >= MUGGING_THRESHOLD) {
        triggerMugging();
    }
}

/**
 * Recalculates muggability immediately, typically after equipment change or rest.
 */
export function recalculateMuggability() {
    // We want the effect of equipment/rest to be factored in *now*,
    // rather than waiting for the next interval.
    // So, run the calculation logic directly.
    updateMuggability();
}


/**
 * Calculates the combined muggability effect from equipped hat and jacket.
 * @returns {number} The total muggability change from equipment.
 */
function calculateEquipmentMuggabilityEffect() {
    let effect = 0;
    // Safely access effects, default to 0 if item/effect doesn't exist
    effect += itemDefinitions[gameState.equippedHat]?.effects?.muggability ?? 0;
    effect += itemDefinitions[gameState.equippedJacket]?.effects?.muggability ?? 0;
    return effect;
}

/**
 * Handles the mugging event when muggability reaches the threshold.
 * Determines success/failure and applies consequences. Resets muggability.
 */
function triggerMugging() {
    addNotification("Someone menacing approaches you!", "loss"); // Initial warning

    // Add a slight delay for suspense?
    setTimeout(() => {
        if (Math.random() < MUGGING_SUCCESS_RATE) {
            // Mugger succeeds
            let moneyToLose = 0;
            if (gameState.netMoney > 0) { // Only lose if you have positive net money
                 moneyToLose = Math.floor(gameState.netMoney * MONEY_LOSS_PERCENTAGE);
            }

            if (moneyToLose > 0) {
                gameState.moneyLost += moneyToLose; // Add to losses
                addNotification(`MUGGED! They took $${moneyToLose.toFixed(2)}!`, "loss");
                updateMoneyDisplay();
            } else {
                addNotification("They tried to mug you... but you're broke! They left disgusted.", "info");
            }
        } else {
            // Mugger fails
            addNotification("You fought them off! The mugger ran away!", "finish-success");
        }

        // Reset muggability
        gameState.muggability = MUGGING_RESET_VALUE;
        updateElementText("muggability-display", gameState.muggability); // Update UI immediately
    }, 500); // 0.5 second delay
}

/**
 * Updates the timestamp for the last sleep or nap action.
 * Called from sleepHobby and takeNap functions.
 */
export function recordSleepOrNap() {
    gameState.lastSleepOrNapTime = Date.now();
}