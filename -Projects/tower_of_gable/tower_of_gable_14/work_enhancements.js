// work_enhancements.js
import { gameState } from './game_state.js';
import { updateButtonStates, addNotification, updateMoneyDisplay } from './utils.js'; // Import addNotification

export function initWorkEnhancements() { }

export function workAsDogWalker() {
  // Use the specific flag from gameState
  if (gameState.isWalkingDog || gameState.netMoney <= -100) {
    return;
  }

  gameState.isWalkingDog = true; // Set flag
  updateButtonStates();
  addNotification("Started walking dogs.", "start"); // Use addNotification

  const duration = 6000; // 6 seconds

  setTimeout(() => {
    // --- Balanced Outcomes ---
    const outcomes = [
      { value: 120, message: "Walked a pack of happy pups! Reliable work." }, // Slightly buffed
      { value: -75, message: "A dog ran away and you got fined!" },
      { value: 200, message: "Found a lost wallet while dog walking!" }, // Kept
      { value: 80, message: "Just a normal dog walking day. Steady pay." }, // Added okay outcome
      { value: -20, message: "Stepped in dog poop. Cleaning cost you." } // Added small negative
    ];
    // --- End Balanced Outcomes ---

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    let notificationType = 'info';

    if (outcome.value < 0) {
      gameState.moneyLost -= outcome.value; // moneyLost is positive loss
      notificationType = 'finish-fail';
    } else {
      gameState.moneyEarned += outcome.value;
      notificationType = 'finish-success';
    }

    // Use addNotification for finish message
    addNotification(`Finished walking dogs. ${outcome.message} (${outcome.value >= 0 ? '+' : ''}$${outcome.value.toFixed(2)})`, notificationType);
    updateMoneyDisplay();
    gameState.isWalkingDog = false; // Clear flag
    updateButtonStates();
  }, duration);
}