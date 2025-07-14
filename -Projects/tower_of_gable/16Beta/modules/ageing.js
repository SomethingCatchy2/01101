import { gameState } from './persistence.js';
import { updateElementText, addNotification, showNotification } from './utils.js';
import { calculateAndApplyTaxes } from './location_taxes.js';

// --- Ageing Constants ---
const AGE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MOM_NAG_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MOM_RANT_THRESHOLD = 12; // After 12 nags (1 hour)

// --- Ageing Logic ---
export function initAgeing() {
    updateElementText("age-display", gameState.age);
    setInterval(increaseAge, AGE_INTERVAL);
    setInterval(momNag, MOM_NAG_INTERVAL);
}

export function increaseAge() {
    gameState.age++;
    gameState.clothesPrice = 15 + (gameState.age * 5); // Update price internally
    updateElementText("age-display", gameState.age);
    addNotification(`Happy Birthday! You are now ${gameState.age}.`, 'info');
    calculateAndApplyTaxes(); // Trigger taxes on birthday
}

export function momNag() {
    gameState.momNagCount++;
    if (gameState.momNagCount < MOM_RANT_THRESHOLD) {
        const nags = ["Mom: Go shower.", "Mom: Have you showered recently?", "Don't forget you need to shower...", "Mom: You need to shower."];
        addNotification(nags[Math.floor(Math.random() * nags.length)], "mom");
    } else {
        const hours = Math.floor(gameState.momNagCount * 5 / 60);
        const rant = `Mom: Okay, listen here! PLEASE, for the towers sake! GO TAKE A SHOWER! The neighbors are complaining! The dog DIED because you walked in the room! It has been ${gameState.age - 4} Years! Just... shower! PLEASE!`;
        addNotification(rant, "mom-rant");
    }
}

// Birthday handler for orchestrator (should only be exported once, if needed)
// Remove duplicate or unnecessary exports.
