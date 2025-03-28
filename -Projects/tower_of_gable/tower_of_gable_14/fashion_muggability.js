// fashion_muggability.js
import { gameState } from './game_state.js';
import { updateElementText, showMessage, updateMoneyDisplay } from './utils.js';

const fashionItems = {
  sunglasses: { name: "Sunglasses", price: 50, muggability: 5 },
  // ... more items can be added here
};

export function initFashionMuggability() {
  updateMuggabilityDisplay(); // Initial muggability display
}

export function buySunglasses() {
  const itemKey = "sunglasses";
  const item = fashionItems[itemKey];

  if (gameState.netMoney >= item.price) {
    gameState.netMoney -= item.price;
    gameState.moneyLost += item.price;
    gameState.equippedItems[itemKey] = item; // Equip the sunglasses
    gameState.muggability += item.muggability; // Increase muggability
    updateMoneyDisplay();
    updateMuggabilityDisplay();
    showMessage(`Bought and equipped ${item.name}! Muggability increased.`);
  } else {
    showMessage("Not enough money to buy sunglasses.");
  }
}

function updateMuggabilityDisplay() {
  updateElementText("muggability-display", gameState.muggability);
}