// utils.js
import { gameState } from './game_state.js';

// Keep these functions
export function updateElementText(id, text) { /* ... unchanged ... */ }
export function showMessage(message, duration = 3000) { /* ... unchanged ... */ }
// Remove startProgressBar function

// --- NEW Notification Function ---
export function addNotification(message, type = 'info') {
    const log = document.getElementById('notification-log');
    if (!log) return;

    const entry = document.createElement('p');
    entry.textContent = message;
    entry.classList.add(`notification-${type}`); // Add class based on type

    log.appendChild(entry);

    // Auto-scroll to the bottom
    log.scrollTop = log.scrollHeight;

    // Optional: Limit log length (e.g., remove oldest if > 50 entries)
    if (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }
}


// --- MODIFIED Button State Logic ---
export function updateButtonStates() {
    const isAnyJobRunning = gameState.isWorkingMines || gameState.isWorkingOffice || gameState.isWorkingStaples || gameState.isTakingNap || gameState.isWalkingDog || gameState.isSleepingHobby;
    const canRollDice = !gameState.isWorkingMines && !gameState.isWorkingStaples && !gameState.isTakingNap && !gameState.isWalkingDog && !gameState.isSleepingHobby; // Can roll during office work

    // Disable individual job buttons if that job is running
    document.getElementById('work-in-mines-btn').disabled = gameState.isWorkingMines;
    document.getElementById('work-in-office-btn').disabled = gameState.isWorkingOffice;
    document.getElementById('work-staple-tables-btn').disabled = gameState.isWorkingStaples;
    document.getElementById('take-nap-btn').disabled = gameState.isTakingNap;
    document.getElementById('work-dog-walker-btn').disabled = gameState.isWalkingDog;
    document.getElementById('sleep-hobby-btn').disabled = gameState.isSleepingHobby;

    // Disable Dice/Commit based on specific rule
    document.getElementById('roll-dice-btn').disabled = !canRollDice;
    document.getElementById('commit-btn').disabled = !canRollDice || gameState.dice.length === 0;

    // General purpose buttons - disable if *any* job is running? Or allow? Let's allow for now.
    document.getElementById('buy-clothes-btn').disabled = isAnyJobRunning; // Disable during any work
    document.getElementById('buy-sunglasses-btn').disabled = isAnyJobRunning; // Disable during any work

    // Bankruptcy button is handled separately in checkBankruptcy
}