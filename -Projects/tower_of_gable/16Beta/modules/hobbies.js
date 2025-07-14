import { gameState } from './persistence.js';
import { updateElementText, addNotification, updateMoneyDisplay, updateButtonStates, isInSignificantDebt, showNotification, updateEnergy, updateAwake, updateHealth, updateSanity } from './utils.js';
import { recordSleepOrNap, recalculateAndDisplayMuggability, triggerFaintMugging } from './muggability.js';

// --- Hobby Constants ---
const SLEEP_DURATION = 10000;
const SLEEP_RECOVERY_BASE = 50;
const SLEEP_UPDATE_INTERVAL = 60 * 1000; // 1 minute
const FAINT_PENALTY = 50;

// --- Hobby Logic ---
export function initHobbies() {
    updateElementText("sleep-level", gameState.sleepLevel);
    setInterval(updateSleepPassive, SLEEP_UPDATE_INTERVAL);
}

export function sleepHobby() {
    if (gameState.isSleepingHobby || isInSignificantDebt()) {
        if (isInSignificantDebt()) addNotification("Cannot sleep properly due to debt stress.", "loss");
        return;
    }
    gameState.isSleepingHobby = true;
    updateButtonStates();
    addNotification("Going to sleep for a while...", "start");
    recordSleepOrNap();
    setTimeout(() => {
        let currentSleepRecovery = SLEEP_RECOVERY_BASE;
        if (gameState.sleepRecoveryMultiplier) {
            currentSleepRecovery = Math.floor(currentSleepRecovery * gameState.sleepRecoveryMultiplier);
        }
        gameState.sleepLevel = Math.min(gameState.sleepLevel + currentSleepRecovery, 100);
        updateElementText("sleep-level", gameState.sleepLevel);
        addNotification("You feel well-rested after sleeping!", "finish-success");
        gameState.isSleepingHobby = false;
        updateButtonStates();
        recalculateAndDisplayMuggability();
    }, SLEEP_DURATION);
}

export function updateSleepPassive() {
    if (!gameState.isSleepingHobby && !gameState.isTakingNap) {
        gameState.sleepLevel = Math.max(gameState.sleepLevel - 1, 0);
        updateElementText("sleep-level", gameState.sleepLevel);
        recalculateAndDisplayMuggability();
        if (gameState.sleepLevel === 20) {
            addNotification("Feeling tired...", "info");
        } else if (gameState.sleepLevel === 5) {
            addNotification("You are feeling very sleepy...", "warning");
        } else if (gameState.sleepLevel === 0) {
            faintSleep();
        }
    }
}

// Only one faint function for sleep exhaustion
export function faintSleep() {
    if (gameState.sleepLevel > 0 || gameState.isTakingNap || gameState.isSleepingHobby) return;
    addNotification(`You fainted from exhaustion! Lost $${FAINT_PENALTY.toFixed(2)}.`, "loss");
    gameState.moneyLost += FAINT_PENALTY;
    gameState.sleepLevel = 15;
    updateElementText("sleep-level", gameState.sleepLevel);
    // updateMoneyDisplay and recalculateAndDisplayMuggability should be called by orchestrator if needed
    triggerFaintMugging(); // Optional: Trigger mugging on fainting
}

// Energy-based sleep/nap/faint logic
export function sleep() {
    gameState.energy = 100;
    gameState.isAwake = false;
    showNotification("You are sleeping.");
    updateEnergy();
    updateAwake();
}

export function wakeUp() {
    gameState.isAwake = true;
    showNotification("You woke up.");
    updateAwake();
}

export function takeNap() {
    if (gameState.energy < 80) {
        gameState.energy += 20;
        showNotification("You took a nap and feel refreshed.");
        updateEnergy();
    } else {
        showNotification("You have too much energy for a nap.");
    }
}

// Only one faintEnergy function should exist. If needed, merge logic elsewhere.
