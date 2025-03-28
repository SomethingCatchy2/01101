// shopping.js
import { gameState } from './game_state.js';
import { itemDefinitions } from './items.js';
import { updateMoneyDisplay, addNotification, updateElementText } from './utils.js'; // Import necessary utils
import { recalculateMuggability } from './muggability.js'; // Import function to update muggability immediately

const hatShopGrid = document.getElementById('hat-shop-grid');
const jacketShopGrid = document.getElementById('jacket-shop-grid');
const equipHatSelect = document.getElementById('equip-hat-select');
const equipJacketSelect = document.getElementById('equip-jacket-select');

export function initShopping() {
    populateShopGrids();
    addEquipmentListeners();
    updateEquipmentSelectors(); // Initial population based on loaded state
    updateOwnedItemButtons(); // Disable buttons for owned items on load
}

function populateShopGrids() {
    if (!hatShopGrid || !jacketShopGrid) return;

    hatShopGrid.innerHTML = ''; // Clear existing
    jacketShopGrid.innerHTML = '';

    for (const key in itemDefinitions) {
        const item = itemDefinitions[key];
        const button = document.createElement('button');
        button.textContent = `${item.name} - $${item.cost.toFixed(2)}`;
        button.dataset.itemKey = key; // Store key in data attribute
        button.id = `buy-${key}`; // Unique ID for disabling
        button.onclick = () => buyItem(key);

        if (item.type === 'hat') {
            hatShopGrid.appendChild(button);
        } else if (item.type === 'jacket') {
            jacketShopGrid.appendChild(button);
        }
    }
}

function addEquipmentListeners() {
    if (equipHatSelect) {
        equipHatSelect.onchange = (event) => equipItem(event.target.value, 'hat');
    }
    if (equipJacketSelect) {
        equipJacketSelect.onchange = (event) => equipItem(event.target.value, 'jacket');
    }
}

export function buyItem(itemKey) {
    const item = itemDefinitions[itemKey];
    if (!item) return;

    if (gameState.ownedItems[itemKey]) {
        addNotification(`You already own ${item.name}.`, 'info');
        return;
    }

    if (gameState.netMoney >= item.cost) {
        gameState.moneyLost += item.cost; // Track loss
        // gameState.netMoney is updated by updateMoneyDisplay
        gameState.ownedItems[itemKey] = true; // Add to owned items

        addNotification(`Purchased ${item.name} for $${item.cost.toFixed(2)}!`, 'info');
        updateMoneyDisplay();
        updateEquipmentSelectors(); // Update dropdowns

        // Disable the buy button
        const buyButton = document.getElementById(`buy-${itemKey}`);
        if (buyButton) {
            buyButton.disabled = true;
            buyButton.textContent = `${item.name} (Owned)`;
        }

    } else {
        addNotification(`Not enough money to buy ${item.name}. Need $${item.cost.toFixed(2)}.`, 'loss');
    }
}

export function updateEquipmentSelectors() {
    if (!equipHatSelect || !equipJacketSelect) return;

    // Store current selections
    const currentHat = equipHatSelect.value;
    const currentJacket = equipJacketSelect.value;

    // Clear existing options (keep the "-- None --")
    equipHatSelect.innerHTML = '<option value="">-- None --</option>';
    equipJacketSelect.innerHTML = '<option value="">-- None --</option>';

    // Populate with owned items
    for (const key in gameState.ownedItems) {
        if (gameState.ownedItems[key] && itemDefinitions[key]) { // Check if owned and definition exists
            const item = itemDefinitions[key];
            const option = document.createElement('option');
            option.value = key;
            option.textContent = item.name;

            if (item.type === 'hat') {
                equipHatSelect.appendChild(option);
            } else if (item.type === 'jacket') {
                equipJacketSelect.appendChild(option);
            }
        }
    }

    // Re-select previously selected or loaded item
    equipHatSelect.value = gameState.equippedHat || ""; // Use loaded state, fallback to empty string for "-- None --"
    equipJacketSelect.value = gameState.equippedJacket || "";
}

// Function to disable buy buttons for already owned items (call on load)
export function updateOwnedItemButtons() {
     for (const key in gameState.ownedItems) {
         if (gameState.ownedItems[key]) { // If item is owned
             const buyButton = document.getElementById(`buy-${key}`);
             if (buyButton) {
                 buyButton.disabled = true;
                 buyButton.textContent = `${itemDefinitions[key]?.name || key} (Owned)`; // Use optional chaining
             }
         }
     }
}


function equipItem(itemKey, itemType) {
    const previousHat = gameState.equippedHat;
    const previousJacket = gameState.equippedJacket;

    if (itemType === 'hat') {
        gameState.equippedHat = itemKey || null; // Set to null if "" selected
        const itemName = itemKey ? itemDefinitions[itemKey]?.name : "nothing";
        addNotification(`Equipped ${itemName} as hat.`, 'info');
    } else if (itemType === 'jacket') {
        gameState.equippedJacket = itemKey || null;
        const itemName = itemKey ? itemDefinitions[itemKey]?.name : "nothing";
        addNotification(`Equipped ${itemName} as jacket.`, 'info');
    }

    // Only recalculate if equipment actually changed
    if (gameState.equippedHat !== previousHat || gameState.equippedJacket !== previousJacket) {
       recalculateMuggability(); // Immediately update muggability based on new equipment
    }
}