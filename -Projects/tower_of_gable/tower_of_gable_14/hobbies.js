// hobbies.js
import { gameState } from './game_state.js';
import { updateElementText, showMessage, updateButtonStates, addNotification } from './utils.js';
import { recordSleepOrNap, recalculateMuggability } from './muggability.js'; // <<< Import helpers

export function initHobbies() {
  updateElementText("sleep-level", gameState.sleepLevel);
  setInterval(updateSleep, 60 * 1000);
}

export function sleepHobby() {
  if (gameState.isSleepingHobby) return;

  gameState.isSleepingHobby = true;
  updateButtonStates();
  addNotification("Going to sleep for a while...", "start");
  recordSleepOrNap(); // <<< Record time here

  const duration = 10000;

  setTimeout(() => {
    gameState.sleepLevel = Math.min(gameState.sleepLevel + 50, 100);
    updateElementText("sleep-level", gameState.sleepLevel);
    addNotification("You feel well-rested after sleeping!", "finish-success");
    gameState.isSleepingHobby = false;
    updateButtonStates();
    recalculateMuggability(); // Update muggability after sleep ends
  }, duration);
}

// ... (updateSleep and faint functions remain the same) ...
function updateSleep() { /* ... */ }
function faint() { /* ... */ }