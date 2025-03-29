// work_enhancements.js
// Example for adding new work types. Handles Dog Walker job.
import { gameState } from './game_state.js';
import { updateButtonStates, addNotification, updateMoneyDisplay } from './utils.js';

const JOB_DURATION = 6000; // 6 seconds

/**
 * Initializes anything specific for these work types (currently none).
 */
export function initWorkEnhancements() { }

/**
 * Starts the Dog Walker job if not already running and not in debt.
 */
export function workAsDogWalker() {
  if (gameState.isWalkingDog || isInDebt()) { // Check specific flag & debt
    return;
  }

  gameState.isWalkingDog = true; // Set flag
  updateButtonStates();
  addNotification("Started walking dogs.", "start");

  setTimeout(() => {
    // Balanced Outcomes
    const outcomes = [
      { value: 120, message: "Walked a pack of happy pups! Reliable work." },
      { value: -75, message: "A dog ran away and you got fined!" },
      { value: 200, message: "Found a lost wallet while dog walking!" },
      { value: 80, message: "Just a normal dog walking day. Steady pay." },
      { value: -20, message: "Stepped in dog poop. Cleaning cost you." }
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    let notificationType = 'info';

    if (outcome.value < 0) {
      gameState.moneyLost -= outcome.value; // Remember moneyLost is positive value of loss
      notificationType = 'finish-fail';
    } else {
      gameState.moneyEarned += outcome.value;
      notificationType = 'finish-success';
    }

    addNotification(`Finished walking dogs. ${outcome.message} (${outcome.value >= 0 ? '+' : ''}$${outcome.value.toFixed(2)})`, notificationType);
    updateMoneyDisplay();
    gameState.isWalkingDog = false; // Clear flag
    updateButtonStates();
  }, JOB_DURATION);
}

// Simple debt check (could be moved to utils if used more broadly)
function isInDebt() {
  // Allow work unless severely in debt? Adjust threshold as needed.
  if (gameState.netMoney <= -500) {
     addNotification("Significant debt restricts taking on new jobs.", "loss");
    return true;
  }
  return false;
}