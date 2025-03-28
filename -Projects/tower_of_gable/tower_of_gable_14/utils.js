// utils.js
import { gameState } from './game_state.js'; // Import gameState needed by updateMoneyDisplay

// Helper function to safely update element text content
export function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    } else {
      console.error(`Element with ID "${id}" not found`);
    }
  }

  // Function to show a temporary message to the user
export function showMessage(message, duration = 3000) {
    const messageDisplay = document.getElementById("message-display"); // Assuming messageDisplay is globally accessible
    if (!message) return;

    messageDisplay.textContent = message;
    messageDisplay.style.display = "block";

    if (window.messageTimeout) { // Accessing messageTimeout from the global scope (je.js)
      clearTimeout(window.messageTimeout);
    }

    if (duration > 0) {
      window.messageTimeout = setTimeout(() => { // Storing messageTimeout in the global scope
        messageDisplay.style.display = "none";
      }, duration);
    }
  }

  // Helper function to start the progress bar
export function startProgressBar(duration) {
    const progressBar = document.getElementById("progress-bar"); // Assuming progressBar is globally accessible
    if (!progressBar) return;

    progressBar.style.width = "0%";
    progressBar.style.transition = `width ${duration}ms linear`;

    void progressBar.offsetWidth; // Force reflow

    progressBar.style.width = "100%";
  }

// ***** MOVED AND EXPORTED FROM je.js *****
export function updateMoneyDisplay() {
    // Calculate netMoney within gameState directly
    gameState.netMoney = gameState.moneyEarned - gameState.moneyLost - gameState.totalRolls;

    updateElementText("money-earned", gameState.moneyEarned.toFixed(2));
    updateElementText("money-lost", gameState.moneyLost.toFixed(2));
    updateElementText("net-money", gameState.netMoney.toFixed(2));
}
// ***** END MOVED FUNCTION *****


  // Update button states (assuming it needs to be utility, otherwise move back to je.js)
export function updateButtonStates() {
    // Determine if any work/hobby is in progress by checking relevant flags
    // Note: These global flags need to be accessible, e.g., attached to window or part of gameState
    const anyWorkInProgress = gameState.workInProgress || gameState.officeWorkInProgress || gameState.stapleWorkInProgress || gameState.napWorkInProgress || window.dogWalkerWorkInProgress || window.sleepHobbyInProgress;

    const buttons = [
      "roll-dice-btn",
      "commit-btn",
      "work-in-mines-btn",
      "work-in-office-btn",
      "work-staple-tables-btn",
      "take-nap-btn",
      "work-dog-walker-btn",
      "sleep-hobby-btn",
      "buy-clothes-btn",
      "buy-sunglasses-btn",
      "reset-game-btn"
    ];

    buttons.forEach(id => {
      const button = document.getElementById(id);
      if (button) {
        button.disabled = anyWorkInProgress;
      }
    });

    const commitBtn = document.getElementById("commit-btn");
    if (commitBtn) {
      commitBtn.disabled = (anyWorkInProgress || gameState.dice.length === 0);
    }

    // Also handle the status box display based on anyWorkInProgress
    const statusBox = document.getElementById("status-box");
    const statusMessage = document.getElementById("status-message");
    if (statusBox && statusMessage) {
        statusBox.style.display = anyWorkInProgress ? "block" : "none";
        statusMessage.textContent = anyWorkInProgress ? "Working..." : "Idle";
    }

    // Ensure reset button is always enabled unless specifically disabled elsewhere
    const resetBtn = document.getElementById("reset-game-btn");
    if (resetBtn && !anyWorkInProgress) { // Only enable if nothing else is running
        resetBtn.disabled = false;
    } else if (resetBtn) {
        resetBtn.disabled = true; // Disable reset if any work is in progress
    }
}