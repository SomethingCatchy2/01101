// muggability.js
import { gameState } from './game_state.js';
import { itemDefinitions } from './items.js';
import { addNotification, updateElementText, updateMoneyDisplay } from './utils.js';

const MUGGABILITY_UPDATE_INTERVAL = 5000; // 5 seconds
const SLEEP_DEPRIVATION_THRESHOLD = 10 * 60 * 1000; // 10 minutes without sleep/nap

export function initMuggability() {
    // Ensure lastSleepOrNapTime is initialized if loading old save
    gameState.lastSleepOrNapTime = gameState.lastSleepOrNapTime || Date.now();
    updateElementText("muggability-display", gameState.muggability); // Initial display
    setInterval(updateMuggability, MUGGABILITY_UPDATE_INTERVAL);
}

function updateMuggability() {
    let change = 0;

    // 1. Base random fluctuation
    change += Math.random() < 0.5 ? -1 : 1; // +/- 1

    // 2. Sleep Deprivation
    const timeSinceSleep = Date.now() - gameState.lastSleepOrNapTime;
    if (timeSinceSleep > SLEEP_DEPRIVATION_THRESHOLD) {
        change += 3; // Increase faster if sleep deprived
        if(Math.random() < 0.1) { // Small chance for extra notification
             addNotification("You look tired and vulnerable...", "info");
        }
    } else {
        // Slight decrease if recently slept
         change -= 1;
    }

    // 3. Equipment Effects (Call helper function)
    change += calculateEquipmentMuggabilityEffect();

    // 4. Crime Effects (Placeholder for future)
    // if (gameState.committedCrimeRecently) { change += 5; }

    // Apply change
    gameState.muggability += change;

    // Clamp between 0 and 100
    gameState.muggability = Math.max(0, Math.min(100, Math.round(gameState.muggability))); // Round to avoid decimals

    // Update UI
    updateElementText("muggability-display", gameState.muggability);

    // Check for mugging event
    if (gameState.muggability >= 100) {
        triggerMugging();
    }
}

// Function called by equipItem in shopping.js AND by the interval
export function recalculateMuggability() {
    // This function could potentially just call updateMuggability,
    // but for immediate effect after equipping, we might just recalculate the equipment part.
    // Let's just call the main update function for simplicity.
    updateMuggability();
}


function calculateEquipmentMuggabilityEffect() {
    let effect = 0;
    if (gameState.equippedHat && itemDefinitions[gameState.equippedHat]?.effects?.muggability) {
        effect += itemDefinitions[gameState.equippedHat].effects.muggability;
    }
    if (gameState.equippedJacket && itemDefinitions[gameState.equippedJacket]?.effects?.muggability) {
        effect += itemDefinitions[gameState.equippedJacket].effects.muggability;
    }
    return effect;
}


function triggerMugging() {
    addNotification("Someone is trying to mug you!", "loss");
    const successRate = 0.75; // 75% chance mugger succeeds

    if (Math.random() < successRate) {
        // Mugger succeeds
        const moneyToLose = Math.floor(gameState.netMoney / 2); // Lose 50%
        if (moneyToLose > 0) {
            gameState.moneyLost += moneyToLose;
            addNotification(`Mugging successful! You lost $${moneyToLose.toFixed(2)}.`, "loss");
            updateMoneyDisplay();
        } else {
            addNotification("Mugging successful... but you had no money to steal!", "info");
        }
    } else {
        // Mugger fails
        addNotification("You managed to scare off the mugger!", "finish-success");
    }

    // Reset muggability regardless of outcome
    gameState.muggability = 50;
    updateElementText("muggability-display", gameState.muggability); // Update UI immediately
}

// Helper to be called when player sleeps or naps
export function recordSleepOrNap() {
    gameState.lastSleepOrNapTime = Date.now();
}