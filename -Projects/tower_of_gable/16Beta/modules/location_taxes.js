import { gameState } from './persistence.js';
import { showNotification } from './utils.js';
// Remove invalid imports from je.js. UI update functions should be handled by orchestrator or utils if needed.

// --- Location & Tax Constants ---
export const locationTaxes = {
    "Cardboard Box": 0,
    "Shady Alley": 1,
    "Quiet Suburb": 10,
    "Downtown Apartment": 100
};

// --- Location & Tax Logic ---
export function setLocation(newLocation) {
    gameState.location = newLocation;
    showNotification(`You moved to ${newLocation}.`);
    updateLocation();
}

export function payTaxes() {
    const tax = locationTaxes[gameState.location];
    if (gameState.money >= tax) {
        gameState.money -= tax;
        showNotification(`You paid $${tax.toFixed(2)} in taxes.`);
        updateMoney();
    } else {
        showNotification("You can't afford to pay taxes! You might get evicted...");
    }
}
