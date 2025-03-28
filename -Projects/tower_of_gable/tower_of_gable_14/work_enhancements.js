// work_enhancements.js
import { gameState } from './game_state.js';
import { updateButtonStates, showMessage, startProgressBar, updateMoneyDisplay } from './utils.js';

let dogWalkerWorkInProgress = false; // Local work in progress flag

export function initWorkEnhancements() {
  // No specific initialization needed right now for work enhancements, but can add later
}

export function workAsDogWalker() {
  if (dogWalkerWorkInProgress || gameState.netMoney <= -100) { // Using netMoney from gameState
    return;
  }

  dogWalkerWorkInProgress = true;
  updateButtonStates(); // Assuming updateButtonStates is in utils.js and handles all work types
  showMessage("Walking dogs...", 6000); // Shorter duration for testing

  startProgressBar(6000); // Assuming startProgressBar is in utils.js

  setTimeout(() => {
    const outcomes = [
      { value: 150, message: "Walked a pack of happy pups! Earned $150." },
      { value: -75, message: "A dog ran away and you got fined! Lost $75." },
      { value: 250, message: "Found a lost wallet while dog walking! Earned $250." },
      { value: 0, message: "Just a normal dog walking day. No extra earnings." }
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    if (outcome.value < 0) {
      gameState.moneyLost -= outcome.value;
    } else {
      gameState.moneyEarned += outcome.value;
    }

    showMessage(outcome.message);
    updateMoneyDisplay(); // Assuming updateMoneyDisplay is in utils.js
    dogWalkerWorkInProgress = false;
    updateButtonStates(); // Update button states after work is done
  }, 6000);
}