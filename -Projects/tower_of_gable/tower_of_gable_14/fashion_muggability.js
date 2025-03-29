// fashion_muggability.js
// Handles buying specific fashion items that affect muggability.
// NOTE: This file seems somewhat redundant with the main items/shopping system.
// Consider integrating these items into items.js and using the main shopping UI.
// Keeping it separate for now based on original structure.

import { gameState } from './game_state.js';
import { updateElementText, showMessage, updateMoneyDisplay } from './utils.js';
import { recalculateMuggability } from './muggability.js'; // Need to trigger recalc

// Example Item - Should ideally be defined in items.js
const fashionItems = {
  sunglasses: { name: "Sunglasses", price: 50, type: 'fashion', effects: { muggability: 5 } }, // Example effect
  // ... more single-purchase fashion items could go here
};

// Check if this needs an init function separate from main shopping
export function initFashionMuggability() {
  // This might not be needed if muggability display is handled elsewhere.
  // updateMuggabilityDisplay(); // Initial muggability display
  // Create buttons dynamically if needed, or assume they exist in HTML
  // setupFashionButtons();
}

// Example function to buy a specific item (sunglasses)
// This pattern is less flexible than the main shopping system.
export function buySunglasses() {
  const itemKey = "sunglasses";
  const item = fashionItems[itemKey];

  // Check if item exists and is valid
  if (!item) {
    console.error("Sunglasses definition missing in fashion_muggability.js");
    return;
  }

  // Check if already owned (using main gameState.ownedItems)
  if (gameState.ownedItems[itemKey]) {
      showMessage(`You already own ${item.name}.`);
      return;
  }

  // Check cost
  if (gameState.netMoney >= item.price) {
    gameState.moneyLost += item.price; // Track loss
    gameState.ownedItems[itemKey] = true; // Mark as owned

    // APPLY effects directly (less flexible than equip system)
    // This assumes buying = immediate permanent effect, which conflicts with equip system
    // gameState.muggability += item.effects.muggability || 0; // Direct modification - BAD IDEA with equip system

    updateMoneyDisplay();
    // updateMuggabilityDisplay(); // Let the main muggability system handle updates
    recalculateMuggability(); // Trigger recalc due to potential implicit effect change (though this item isn't 'equippable' in the main system)

    showMessage(`Bought ${item.name}! Check your style.`, 3000);

    // Disable the specific buy button if it exists
    const button = document.getElementById('buy-sunglasses-btn'); // Assuming a button exists with this ID
    if (button) {
        button.disabled = true;
        button.textContent = `${item.name} (Owned)`;
    }

  } else {
    showMessage(`Not enough money to buy ${item.name}. Need $${item.price.toFixed(2)}.`);
  }
}

// This function is likely redundant now as muggability is displayed in the main stats box.
// function updateMuggabilityDisplay() {
//   updateElementText("muggability-display", gameState.muggability);
// }

// Example setup if buttons were needed dynamically
/*
function setupFashionButtons() {
    const container = document.getElementById('fashion-items-container'); // Assume a container exists
    if (!container) return;

    Object.entries(fashionItems).forEach(([key, item]) => {
        const button = document.createElement('button');
        button.id = `buy-${key}-btn`; // e.g., buy-sunglasses-btn
        button.textContent = `Buy ${item.name} ($${item.price.toFixed(2)})`;

        if (gameState.ownedItems[key]) {
            button.disabled = true;
            button.textContent = `${item.name} (Owned)`;
        }

        button.onclick = () => {
             // Need a way to call the correct buy function based on key
             if (key === 'sunglasses') buySunglasses();
             // Add more items here... this is inflexible
        };
        container.appendChild(button);
    });
}
*/