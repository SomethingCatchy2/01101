// ageing.js
import { gameState } from './game_state.js';
import { updateElementText, showMessage, updateMoneyDisplay } from './utils.js';

export function initAgeing() {
  updateElementText("age-display", gameState.age);
  updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
  setInterval(increaseAge, 5 * 60 * 1000); // Increase age every 5 minutes
  setInterval(checkClothing, 60 * 1000); // Check clothing every minute
}

function increaseAge() {
  gameState.age++;
  gameState.clothesPrice = 10 + (gameState.age * gameState.age);
  updateElementText("age-display", gameState.age);
  updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
}

export function buyClothes() {
  if (gameState.netMoney >= gameState.clothesPrice) {
    gameState.netMoney -= gameState.clothesPrice;
    gameState.moneyLost += gameState.clothesPrice;
    gameState.lastClothingChange = Date.now();
    updateMoneyDisplay();
    showMessage("New clothes purchased!");
  } else {
    showMessage("Not enough money for new clothes.");
  }
}

function checkClothing() {
  const timeSinceLastChange = Date.now() - gameState.lastClothingChange;
  if (timeSinceLastChange > (3 * 60 * 1000)) { // 3 minutes
    showMessage("Arrested for public indecency! Fined $500.");
    gameState.moneyLost += 500;
    gameState.netMoney -= 500;
    updateMoneyDisplay();
  }
}