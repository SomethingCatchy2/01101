// shopping.js
// Handles populating the shop UI, buying items, and equipping/unequipping them.
import { gameState } from './game_state.js';
import { itemDefinitions } from './items.js';
import { updateMoneyDisplay, addNotification, updateElementText } from './utils.js';
import { recalculateMuggability } from './muggability.js'; // Needed to update muggability on equip

// Get references to DOM elements for the shop
const hatShopGrid = document.getElementById('hat-shop-grid');
const jacketShopGrid = document.getElementById('jacket-shop-grid');
const equipHatSelect = document.getElementById('equip-hat-select');
const equipJacketSelect = document.getElementById('equip-jacket-select');

/**
 * Initializes the shopping system: populates grids, adds listeners.
 */
export function initShopping() {
    if (!hatShopGrid || !jacketShopGrid || !equipHatSelect || !equipJacketSelect) {
        console.error("Shop DOM elements not found!");
        return;
    }
    populateShopGrids();
    addEquipmentListeners();
    // Initial UI updates based on loaded state are handled by loadGame calling helpers
}

/**
 * Creates and adds buttons for each buyable item to the respective shop grids.
 */
function populateShopGrids() {
    hatShopGrid.innerHTML = ''; // Clear previous buttons
    jacketShopGrid.innerHTML = '';

    Object.entries(itemDefinitions).forEach(([key, item]) => {
        const button = document.createElement('button');
        button.textContent = `${item.name} - $${item.cost.toFixed(2)}`;
        button.dataset.itemKey = key; // Store item key for easy reference
        button.id = `buy-${key}`; // Unique ID for disabling later
        button.onclick = () => buyItem(key); // Set click handler

        // Determine which grid to add the button to
        if (item.type === 'hat') {
            hatShopGrid.appendChild(button);
        } else if (item.type === 'jacket') {
            jacketShopGrid.appendChild(button);
        }
    });
}

/**
 * Adds 'change' event listeners to the equipment dropdown selectors.
 */
function addEquipmentListeners() {
    equipHatSelect.onchange = (event) => equipItem(event.target.value, 'hat');
    equipJacketSelect.onchange = (event) => equipItem(event.target.value, 'jacket');
}

/**
 * Handles the logic for buying an item. Checks cost, updates state, and UI.
 * @param {string} itemKey - The key of the item to buy from itemDefinitions.
 */
export function buyItem(itemKey) {
    const item = itemDefinitions[itemKey];
    if (!item) {
        console.error(`Item definition not found for key: ${itemKey}`);
        return;
    }

    // Check if already owned
    if (gameState.ownedItems[itemKey]) {
        addNotification(`You already own the ${item.name}.`, 'info');
        return;
    }

    // Check if enough money
    if (gameState.netMoney >= item.cost) {
        gameState.moneyLost += item.cost; // Add to total money lost
        gameState.ownedItems[itemKey] = true; // Mark as owned in game state

        addNotification(`Purchased ${item.name} for $${item.cost.toFixed(2)}!`, 'info');
        updateMoneyDisplay(); // Update displayed money
        updateEquipmentSelectors(); // Add item to the relevant dropdown
        updateOwnedItemButtons(); // Disable the buy button just purchased

    } else {
        addNotification(`Not enough money for ${item.name}. Need $${item.cost.toFixed(2)}, have $${gameState.netMoney.toFixed(2)}.`, 'loss');
    }
}

/**
 * Updates the equipment dropdowns (<select>) to show only owned items.
 * Preserves the currently selected item if possible. Called on load and after buying.
 */
export function updateEquipmentSelectors() {
    // Store current selections to reapply later if possible
    const currentHatKey = gameState.equippedHat;
    const currentJacketKey = gameState.equippedJacket;

    // Clear existing options (keeping the default "-- None --")
    equipHatSelect.innerHTML = '<option value="">-- None --</option>';
    equipJacketSelect.innerHTML = '<option value="">-- None --</option>';

    // Populate dropdowns with items marked as owned in gameState
    Object.keys(gameState.ownedItems).forEach(key => {
        if (gameState.ownedItems[key] && itemDefinitions[key]) { // Check ownership and if definition exists
            const item = itemDefinitions[key];
            const option = document.createElement('option');
            option.value = key;
            option.textContent = item.name;

            // Add to the correct select element
            if (item.type === 'hat') {
                equipHatSelect.appendChild(option);
            } else if (item.type === 'jacket') {
                equipJacketSelect.appendChild(option);
            }
        }
    });

    // Try to re-select the previously equipped item
    // If the previously equipped item key exists as an option, select it
    if (currentHatKey && equipHatSelect.querySelector(`option[value="${currentHatKey}"]`)) {
        equipHatSelect.value = currentHatKey;
    } else {
        gameState.equippedHat = null; // Ensure state matches if item isn't available/owned anymore
        equipHatSelect.value = ""; // Ensure dropdown shows "-- None --"
    }

    if (currentJacketKey && equipJacketSelect.querySelector(`option[value="${currentJacketKey}"]`)) {
        equipJacketSelect.value = currentJacketKey;
    } else {
        gameState.equippedJacket = null; // Ensure state matches
        equipJacketSelect.value = ""; // Ensure dropdown shows "-- None --"
    }
}

/**
 * Iterates through owned items and disables their corresponding buy buttons in the shop grid.
 * Also enables buttons for items not owned. Called on load and after buying/resetting.
 */
export function updateOwnedItemButtons() {
     // Iterate through ALL defined items
     Object.keys(itemDefinitions).forEach(key => {
         const buyButton = document.getElementById(`buy-${key}`);
         const item = itemDefinitions[key];
         if (buyButton && item) {
             // Check if owned in gameState
             if (gameState.ownedItems[key]) {
                 buyButton.disabled = true;
                 buyButton.textContent = `${item.name} (Owned)`; // Update text
             } else {
                 // Not owned, ensure button is enabled and shows price
                 buyButton.disabled = false;
                 buyButton.textContent = `${item.name} - $${item.cost.toFixed(2)}`;
             }
         }
     });
}


/**
 * Handles equipping an item selected from a dropdown.
 * Updates game state and triggers muggability recalculation.
 * @param {string} itemKey - The key of the item selected (or "" for "-- None --").
 * @param {'hat' | 'jacket'} itemType - The type of item being equipped.
 */
function equipItem(itemKey, itemType) {
    const previouslyEquippedKey = (itemType === 'hat') ? gameState.equippedHat : gameState.equippedJacket;

    // Only proceed if the selection actually changed
    if (itemKey === previouslyEquippedKey) { // "" === null is false, so this covers unequip too
        return; // No change
    }

    const newItem = itemKey ? itemDefinitions[itemKey] : null; // Get item definition or null if unequipped
    const newItemName = newItem ? newItem.name : "nothing";

    // Update game state
    if (itemType === 'hat') {
        gameState.equippedHat = itemKey || null; // Store key or null
        addNotification(`Equipped ${newItemName} as hat.`, 'info');
    } else if (itemType === 'jacket') {
        gameState.equippedJacket = itemKey || null;
        addNotification(`Equipped ${newItemName} as jacket.`, 'info');
    }

    // Immediately update muggability based on the change
    recalculateMuggability();
}