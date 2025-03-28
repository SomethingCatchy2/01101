// utils.js
import { gameState } from './game_state.js';

// Helper function to safely update element text content
export function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    } else {
      // console.warn(`Element with ID "${id}" not found for text update.`);
    }
  }

// Function to show a temporary message (Top Banner - Keep?)
export function showMessage(message, duration = 3000) { /* ... unchanged ... */ }

// --- Notification Function ---
export function addNotification(message, type = 'info') { /* ... unchanged ... */ }

// --- updateMoneyDisplay (Ensure Export) ---
export function updateMoneyDisplay() { /* ... unchanged ... */ }


// --- Update Button States (WITH NULL CHECKS) ---
export function updateButtonStates() {
    const isAnyJobRunning = gameState.isWorkingMines || gameState.isWorkingOffice || gameState.isWorkingStaples || gameState.isTakingNap || gameState.isWalkingDog || gameState.isSleepingHobby;
    const canRollOrCommit = !gameState.isWorkingMines && !gameState.isWorkingStaples && !gameState.isTakingNap && !gameState.isWalkingDog && !gameState.isSleepingHobby;

    // Helper function for setting disabled state safely
    const safelySetDisabled = (id, isDisabled) => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = isDisabled;
        } else {
             console.warn(`Button with ID '${id}' not found during updateButtonStates.`);
        }
    };

    // Disable individual job buttons
    safelySetDisabled('work-in-mines-btn', gameState.isWorkingMines);
    safelySetDisabled('work-in-office-btn', gameState.isWorkingOffice);
    safelySetDisabled('work-staple-tables-btn', gameState.isWorkingStaples);
    safelySetDisabled('take-nap-btn', gameState.isTakingNap);
    safelySetDisabled('work-dog-walker-btn', gameState.isWalkingDog);
    safelySetDisabled('sleep-hobby-btn', gameState.isSleepingHobby);

    // Disable Dice/Commit
    safelySetDisabled('roll-dice-btn', !canRollOrCommit);
    safelySetDisabled('commit-btn', !canRollOrCommit || gameState.dice.length === 0); // <-- Error was likely here

    // Disable general purpose buttons
    safelySetDisabled('buy-clothes-btn', isAnyJobRunning);
    safelySetDisabled('buy-sunglasses-btn', isAnyJobRunning); // This ID might not exist if button removed

    // Note: Bankruptcy button state is handled separately
}