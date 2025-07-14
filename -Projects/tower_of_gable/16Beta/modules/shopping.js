import { gameState } from './persistence.js';
import { showNotification, updateText } from './utils.js';
// Remove invalid imports from je.js. UI update functions should be handled by orchestrator or utils if needed.

export const itemDefinitions = {
    "Guard Dog": { cost: 500, description: "A loyal companion that lowers muggability." },
    "Security Camera": { cost: 250, description: "Deters thieves, lowering muggability." },
    "Fancier Clothes": { cost: 1000, description: "Improves your appearance for certain jobs." },
    "Basic Computer": { cost: 800, description: "Allows you to apply for better jobs." },
    "Book on Programming": { cost: 150, description: "Unlocks new job opportunities." },
};


// --- Shopping Constants ---
const hatShopGrid = document.getElementById('hat-shop-grid');
const jacketShopGrid = document.getElementById('jacket-shop-grid');
const shirtShopGrid = document.getElementById('shirt-shop-grid');
const pantsShopGrid = document.getElementById('pants-shop-grid');
const shoesShopGrid = document.getElementById('shoes-shop-grid');
const socksShopGrid = document.getElementById('socks-shop-grid');
const equipHatSelect = document.getElementById('equip-hat-select');
const equipJacketSelect = document.getElementById('equip-jacket-select');
const equipShirtSelect = document.getElementById('equip-shirt-select');
const equipPantsSelect = document.getElementById('equip-pants-select');
const equipShoesSelect = document.getElementById('equip-shoes-select');
const equipSocksSelect = document.getElementById('equip-socks-select');


// --- Shopping Logic (Expanded) ---
export function initShopping() {
    // Check elements exist (simplified)
    if (!hatShopGrid || !equipHatSelect) {
        console.error("Shopping grid or equipment select not found. Shopping disabled.");
        return;
    }
    populateShopGrids();
    addEquipmentListeners();
    updateEquipmentSelectors(); // Load initial selections
    updateOwnedItemButtons(); // Update initial button states
}

function populateShopGrids() {
    hatShopGrid.innerHTML = '';
    jacketShopGrid.innerHTML = '';
    shirtShopGrid.innerHTML = '';
    pantsShopGrid.innerHTML = '';
    shoesShopGrid.innerHTML = '';
    socksShopGrid.innerHTML = '';

    Object.entries(itemDefinitions).forEach(([key, item]) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.innerHTML = `
            <h4>${item.name}</h4>
            <div class="cost">Cost: $${item.cost.toFixed(2)}</div>
            <div class="description">${item.description}</div>
            <div class="item-stats">Muggability: ${item.muggability > 0 ? '+' : ''}${item.muggability}</div>
            <button id="buy-${key}" class="buy-btn">Buy</button>
        `;

        // Add to correct grid
        if (item.type === 'hat') hatShopGrid.appendChild(itemDiv);
        else if (item.type === 'jacket') jacketShopGrid.appendChild(itemDiv);
        else if (item.type === 'shirt') shirtShopGrid.appendChild(itemDiv);
        else if (item.type === 'pants') pantsShopGrid.appendChild(itemDiv);
        else if (item.type === 'shoes') shoesShopGrid.appendChild(itemDiv);
        else if (item.type === 'socks') socksShopGrid.appendChild(itemDiv);


        document.getElementById(`buy-${key}`).addEventListener('click', () => buyItem(key));
    });
}


function addEquipmentListeners() {
    equipHatSelect.onchange = (event) => equipItem(event.target.value, 'hat');
    equipJacketSelect.onchange = (event) => equipItem(event.target.value, 'jacket');
    equipShirtSelect.onchange = (event) => equipItem(event.target.value, 'shirt');
    equipPantsSelect.onchange = (event) => equipItem(event.target.value, 'pants');
    equipShoesSelect.onchange = (event) => equipItem(event.target.value, 'shoes');
    equipSocksSelect.onchange = (event) => equipItem(event.target.value, 'socks');
}


export function buyItem(itemKey) {
    const item = itemDefinitions[itemKey];
    if (!item) {
        console.error(`Item with key ${itemKey} not found.`);
        return;
    }

    if (gameState.ownedItems[itemKey]) {
        addNotification(`You already own the ${item.name}.`, "info");
        return;
    }

    if (gameState.netMoney >= item.cost) {
        gameState.moneyLost += item.cost;
        gameState.ownedItems[itemKey] = true;
        addNotification(`Purchased ${item.name} for $${item.cost.toFixed(2)}!`, "win");
        updateMoneyDisplay();
        updateEquipmentSelectors();
        updateOwnedItemButtons();
    } else {
        addNotification(`Not enough money to buy ${item.name}.`, "loss");
    }
}

export function updateEquipmentSelectors() {
    const selects = {
        hat: equipHatSelect,
        jacket: equipJacketSelect,
        shirt: equipShirtSelect,
        pants: equipPantsSelect,
        shoes: equipShoesSelect,
        socks: equipSocksSelect
    };
    const equipped = {
        hat: gameState.equippedHat,
        jacket: gameState.equippedJacket,
        shirt: gameState.equippedShirt,
        pants: gameState.equippedPants,
        shoes: gameState.equippedShoes,
        socks: gameState.equippedSocks
    };

    // Clear existing options but keep the "None" option
    Object.entries(selects).forEach(([type, selectElement]) => {
        // Store the "None" option if it exists
        const noneOption = selectElement.querySelector('option[value=""]');
        selectElement.innerHTML = ''; // Clear all
        if (noneOption) {
            selectElement.appendChild(noneOption); // Add it back
        }
    });


    // Add owned items to the dropdowns
    Object.keys(gameState.ownedItems).forEach(key => {
        const item = itemDefinitions[key];
        if (item && selects[item.type]) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = item.name;
            selects[item.type].appendChild(option);
        }
    });

    // Set the current selection
    Object.entries(equipped).forEach(([type, currentKey]) => {
        if (selects[type]) {
            selects[type].value = currentKey || "";
        }
    });
}


export function updateOwnedItemButtons() {
    Object.keys(itemDefinitions).forEach(key => {
        const btn = document.getElementById(`buy-${key}`);
        if (btn) {
            btn.disabled = gameState.ownedItems[key] === true;
            if (btn.disabled) {
                btn.textContent = "Owned";
            }
        }
    });
    // Hide default item buttons if they exist
    ['buy-genericShirt', 'buy-genericPants'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = 'none';
    });
}


export function equipItem(itemKey, itemType) {
    itemKey = itemKey || null; // Handle empty string from select
    const isMandatory = itemType === 'shirt' || itemType === 'pants';
    const stateKey = `equipped${capitalizeFirstLetter(itemType)}`;

    // Prevent unequipping mandatory items
    if (!itemKey && isMandatory) {
        addNotification(`You must wear ${itemType === 'shirt' ? 'a shirt' : 'pants'}!`, "loss");
        // Revert the UI select to the previously equipped mandatory item
        const selectElement = (itemType === 'shirt') ? equipShirtSelect : equipPantsSelect;
        selectElement.value = gameState[stateKey]; // Revert UI select
        return;
    }


    if (itemKey === gameState[stateKey]) return; // No change

    const newItem = itemKey ? itemDefinitions[itemKey] : null;
    const newItemName = newItem ? newItem.name : "nothing";

    // Update state
    gameState[stateKey] = itemKey;

    addNotification(`Equipped ${newItemName} as ${itemType}.`, 'info');
    recalculateAndDisplayMuggability(); // Update effective muggability
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
