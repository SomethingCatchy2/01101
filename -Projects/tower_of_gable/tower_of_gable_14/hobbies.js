// hobbies.js
import { gameState } from './game_state.js';
import { updateElementText, showMessage } from './utils.js';
import { updateButtonStates, startProgressBar } from './utils.js'; // Re-import needed utils

let sleepHobbyInProgress = false; // Local hobby in progress flag

export function initHobbies() {
  updateElementText("sleep-level", gameState.sleepLevel);
  setInterval(updateSleep, 60 * 1000); // Update sleep every minute
}

export function sleepHobby() {
  if (sleepHobbyInProgress) return;

  sleepHobbyInProgress = true;
  updateButtonStates(); // Disable buttons during sleep
  showMessage("Taking a long sleep...", 10000); // Longer duration for sleep

  startProgressBar(10000);

  setTimeout(() => {
    gameState.sleepLevel = Math.min(gameState.sleepLevel + 50, 100); // Increase sleep level, max 100
    updateElementText("sleep-level", gameState.sleepLevel);
    showMessage("You feel well-rested!");
    sleepHobbyInProgress = false;
    updateButtonStates(); // Re-enable buttons after sleep
  }, 10000);
}


function updateSleep() {
  if (!sleepHobbyInProgress) { // Only decrease sleep if not actively sleeping
    gameState.sleepLevel = Math.max(gameState.sleepLevel - 1, 0); // Decrease sleep, min 0
    updateElementText("sleep-level", gameState.sleepLevel);
    if (gameState.sleepLevel <= 20) {
      showMessage("Feeling tired..."); // Low sleep warning
    }
    if (gameState.sleepLevel <= 0) {
      faint(); // Trigger fainting if sleep level reaches 0
    }
  }
}

function faint() {
  showMessage("You fainted from exhaustion!");
  // Add fainting consequences later (e.g., mugging, health penalty)
}