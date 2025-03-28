// utils.js
// Contains common helper functions used across different game modules.
import { gameState } from './game_state.js';

/**
 * Safely updates the text content of an HTML element by its ID.
 * Logs a warning if the element is not found.
 * @param {string} id - The ID of the HTML element.
 * @param {string|number} text - The text or number to display.
 */
export function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    } else {
      // console.warn(`Element with ID "${id}" not found for text update.`); // Keep console cleaner
    }
}

/**
 * Shows a temporary message in a banner at the bottom of the screen.
 * @param {string} message - The message to display.
 * @param {number} [duration=3000] - How long the message stays (in ms). 0 for permanent.
 */
export function showMessage(message, duration = 3000) {
    const messageDisplay = document.getElementById("message-display");
    if (!messageDisplay || !message) return;

    messageDisplay.textContent = message;
    messageDisplay.style.display = "block";

    // Clear previous timeout if one exists
    if (window.messageTimeout) {
      clearTimeout(window.messageTimeout);
    }

    // Set new timeout if duration is positive
    if (duration > 0) {
      window.messageTimeout = setTimeout(() => {
        if (messageDisplay) messageDisplay.style.display = "none";
      }, duration);
    }
}


/**
 * Adds a message entry to the notification log area.
 * Automatically scrolls to the newest message (top).
 * Limits the log length to prevent excessive DOM elements.
 * @param {string} message - The notification message.
 * @param {string} [type='info'] - The type of notification (e.g., 'info', 'win', 'loss', 'start', 'finish-success', 'finish-fail', 'mom'). Used for CSS styling.
 */
export function addNotification(message, type = 'info') {
    const log = document.getElementById('notification-log');
    if (!log) {
        console.error("Notification log element not found!");
        return;
    }

    const entry = document.createElement('p');
    entry.textContent = message;
    entry.className = `notification-${type}`; // Assign class based on type

    // Insert new messages at the top for chronological order (newest first)
    log.insertBefore(entry, log.firstChild);

    // Limit log length (e.g., remove oldest if > 50 entries)
    const MAX_LOG_ENTRIES = 50;
    while (log.children.length > MAX_LOG_ENTRIES) {
        log.removeChild(log.lastChild); // Remove from the bottom (oldest)
    }

     // Optional: Scroll to top after adding (might be disruptive if user is scrolling)
     // log.scrollTop = 0;
}


/**
 * Updates the display of money (Earned, Lost, Net).
 * Calculates Net Money based on Earned, Lost, and Total Rolls.
 */
export function updateMoneyDisplay() {
    // Calculate netMoney = Earned - Lost - Roll Costs
    // Ensure moneyLost is treated as a positive value representing loss
    gameState.netMoney = gameState.moneyEarned - gameState.moneyLost - gameState.totalRolls;

    updateElementText("money-earned", gameState.moneyEarned.toFixed(2));
    updateElementText("money-lost", gameState.moneyLost.toFixed(2));
    updateElementText("net-money", gameState.netMoney.toFixed(2));
}


/**
 * Updates the enabled/disabled state of various game buttons based on current game state.
 * Checks work flags and dice state. Includes null checks for robustness.
 */
export function updateButtonStates() {
    // Check if any blocking work/action is in progress
    const isAnyJobRunning = gameState.isWorkingMines || gameState.isWorkingOffice || gameState.isWorkingStaples || gameState.isTakingNap || gameState.isWalkingDog || gameState.isSleepingHobby;
    // Rule: Can roll/commit ONLY if not doing Mines, Staples, Nap, Dog Walk, Sleep Hobby. Office work is OK.
    const canRollOrCommit = !gameState.isWorkingMines && !gameState.isWorkingStaples && !gameState.isTakingNap && !gameState.isWalkingDog && !gameState.isSleepingHobby;

    // Helper function for setting disabled state safely
    const safelySetDisabled = (id, isDisabled) => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = isDisabled;
        } else {
             // console.warn(`Button with ID '${id}' not found during updateButtonStates.`); // Less spam
        }
    };

    // --- Update states ---
    // Individual job buttons (in .actions-box)
    safelySetDisabled('work-in-mines-btn', gameState.isWorkingMines);
    safelySetDisabled('work-in-office-btn', gameState.isWorkingOffice);
    safelySetDisabled('work-staple-tables-btn', gameState.isWorkingStaples);
    safelySetDisabled('take-nap-btn', gameState.isTakingNap);
    safelySetDisabled('work-dog-walker-btn', gameState.isWalkingDog);
    safelySetDisabled('sleep-hobby-btn', gameState.isSleepingHobby);

    // Dice & Commit buttons based on specific rule
    safelySetDisabled('roll-dice-btn', !canRollOrCommit);
    safelySetDisabled('commit-btn', !canRollOrCommit || gameState.dice.length === 0);

    // General purpose buttons (Disable if ANY job is running - currently none applicable)
    // safelySetDisabled('buy-clothes-btn', isAnyJobRunning); // Button removed

    // Note: Bankruptcy button state is handled separately in checkBankruptcy (in je.js)
    // Note: Shop buy buttons enabled/disabled state is handled in shopping.js based on ownership/cost
}