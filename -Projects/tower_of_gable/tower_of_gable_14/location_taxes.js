// location_taxes.js
import { gameState } from './game_state.js';
import { updateElementText, showMessage, updateMoneyDisplay } from './utils.js';

const locations = {
  "North Carolina": {
    hospitalStay: 2511,
    totalTax: 0.15, // 15% - Example value, adjust as needed
    name: "North Carolina"
  },
  // Add more locations later if needed
};

export function initLocationTaxes() {
  updateElementText("location-display", locations[gameState.currentLocation].name); // Display location name
  setInterval(calculateTaxes, 5 * 60 * 1000); // Calculate taxes every 5 minutes
}

function calculateTaxes() {
  const locationData = locations[gameState.currentLocation];
  const taxAmount = gameState.netMoney * locationData.totalTax;
  if (taxAmount > 0) { // Only apply tax if netMoney is positive or zero
    gameState.moneyLost += taxAmount;
    gameState.netMoney -= taxAmount;
    updateMoneyDisplay();
    showMessage(`Paid taxes: $${taxAmount.toFixed(2)}`);
  }
}