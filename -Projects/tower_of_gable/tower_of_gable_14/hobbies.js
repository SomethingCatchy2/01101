// hobbies.js
// Handles hobby actions like the longer Sleep action.
import { gameState } from './game_state.js';
import { updateElementText, addNotification, updateButtonStates, updateMoneyDisplay } from './utils.js'; // Added updateMoneyDisplay
import { recordSleepOrNap, recalculateMuggability } from './muggability.js'; // Import muggability helpers

const SLEEP_DURATION = 10000; // 10 seconds
const SLEEP_RECOVERY = 50; // How much sleep level recovers
const SLEEP_UPDATE_INTERVAL = 60 * 1000; // Decrease sleep level every minute
const FAINT_PENALTY = 50; // Small money loss on fainting

/**
 * Initializes sleep display and starts the passive sleep level decrease timer.
 */
export function initHobbies() {
  updateElementText("sleep-level", gameState.sleepLevel);
  setInterval(updateSleepPassive, SLEEP_UPDATE_INTERVAL);
}

/**
 * Starts the longer Sleep hobby action.
 */
export function sleepHobby() {
  if (gameState.isSleepingHobby) return; // Already sleeping

  gameState.isSleepingHobby = true;
  updateButtonStates();
  addNotification("Going to sleep for a while...", "start");
  recordSleepOrNap(); // Record the start time for muggability calculation

  setTimeout(() => {
    gameState.sleepLevel = Math.min(gameState.sleepLevel + SLEEP_RECOVERY, 100); // Recover sleep, cap at 100
    updateElementText("sleep-level", gameState.sleepLevel);
    addNotification("You feel well-rested after sleeping!", "finish-success");
    gameState.isSleepingHobby = false; // Clear flag
    updateButtonStates();
    recalculateMuggability(); // Update muggability after sleeping
  }, SLEEP_DURATION);
}

/**
 * Passively decreases sleep level over time if not actively sleeping or napping.
 * Triggers warnings and fainting.
 */
function updateSleepPassive() {
  // Only decrease sleep if not actively using the 'Sleep' or 'Nap' button actions
  if (!gameState.isSleepingHobby && !gameState.isTakingNap) {
    gameState.sleepLevel = Math.max(gameState.sleepLevel - 1, 0); // Decrease sleep, min 0
    updateElementText("sleep-level", gameState.sleepLevel);

    // Notifications for low sleep / fainting
    if (gameState.sleepLevel === 20) {
      addNotification("Feeling tired...", "info");
    } else if (gameState.sleepLevel === 5) {
       addNotification("Barely keeping your eyes open...", "info");
    } else if (gameState.sleepLevel <= 0) {
        // Check if already fainted recently to prevent spam
        if (!gameState.isFainted) { // Add a temporary flag if needed, or check sleep level != 0 before calling
           faint(); // Trigger fainting
        }
    } else {
        // If sleep level recovers above 0, reset any fainting flag
        // gameState.isFainted = false;
    }
  }
}

/**
 * Handles the fainting event when sleep level reaches zero.
 */
function faint() {
  // Check if already fainted or sleep level is > 0 to prevent multiple triggers
  if (gameState.sleepLevel > 0 /* || gameState.isFainted */ ) {
      return;
  }

  // gameState.isFainted = true; // Set a flag if needed
  addNotification(`You fainted from exhaustion! Lost $${FAINT_PENALTY.toFixed(2)}.`, "loss");
  gameState.moneyLost += FAINT_PENALTY; // Apply penalty
  gameState.sleepLevel = 15; // Wake up very groggy
  updateElementText("sleep-level", gameState.sleepLevel);
  updateMoneyDisplay();
  // Note: Player might faint while a job is running.
  // Currently, the job will complete, but buttons are disabled via updateButtonStates.
  // Consider if fainting should interrupt jobs (more complex).
  updateButtonStates(); // Update buttons in case fainting affects availability
}
