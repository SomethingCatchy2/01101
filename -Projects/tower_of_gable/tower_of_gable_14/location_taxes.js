// location_taxes.js
// Handles location-based effects, primarily taxes (currently very basic).
import { gameState } from './game_state.js';
import { updateElementText, addNotification, updateMoneyDisplay } from './utils.js';

// Example location data - Expand later
const locations = {
  "North Carolina": {
    hospitalStay: 2511, // Example data, not used yet
    totalTaxRate: 0.10, // Example: 10% flat tax on NET money per year
    name: "North Carolina"
  },
  // Add California, New York, etc. later with different rates
};

// Tax interval now matches age interval (apply taxes on birthday)
const TAX_INTERVAL = 5 * 60 * 1000; // Apply tax every game year (5 minutes)

/**
 * Initializes location display and starts the tax interval timer.
 */
export function initLocationTaxes() {
  // Ensure currentLocation exists, default if not
  gameState.currentLocation = gameState.currentLocation || "North Carolina";
  const locationData = locations[gameState.currentLocation] || locations["North Carolina"];

  updateElementText("location-display", locationData.name); // Display location name
  setInterval(calculateAndApplyTaxes, TAX_INTERVAL);
}

/**
 * Calculates and applies taxes based on current location and net money.
 * Called periodically (on player's birthday).
 */
function calculateAndApplyTaxes() {
  const locationData = locations[gameState.currentLocation] || locations["North Carolina"]; // Fallback

  // Only tax if net money is positive
  if (gameState.netMoney > 0) {
      // Calculate tax based on NET money at the time tax is due
      const taxAmount = Math.floor(gameState.netMoney * locationData.totalTaxRate);

      if (taxAmount > 0) {
          gameState.moneyLost += taxAmount; // Add to total losses
          addNotification(`Paid $${taxAmount.toFixed(2)} in yearly taxes for ${locationData.name}. Happy Birthday?`, 'loss'); // Changed type to loss
          updateMoneyDisplay(); // Update net money display
      } else {
           addNotification(`No taxes due this year in ${locationData.name} (Net income too low).`, 'info');
      }
  } else {
      // Notify if no tax due to being broke/in debt
       addNotification(`No taxes due this year in ${locationData.name} (you're broke!).`, 'info');
  }
}

// Function to potentially change location later (via UI or event)
export function changeLocation(newLocationKey) {
    if (locations[newLocationKey]) {
        gameState.currentLocation = newLocationKey;
        updateElementText("location-display", locations[newLocationKey].name);
        addNotification(`Moved to ${locations[newLocationKey].name}. Tax rates may differ.`, 'info');
        // Potentially add cost or time delay for moving later
    } else {
        addNotification(`Invalid location: ${newLocationKey}`, 'loss');
    }
}