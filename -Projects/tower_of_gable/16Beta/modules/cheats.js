import { gameState } from './persistence.js';
import { upgradeDefinitions } from './upgrades.js';
import { itemDefinitions } from './shopping.js';
import { addNotification, updateMoneyDisplay, updateElementText } from './utils.js';
import { renderUpgrades } from './upgrades.js';
import { updateEquipmentSelectors, updateOwnedItemButtons } from './shopping.js';

// --- Developer Cheat Function ---
export function activateCheat() {
    if (!confirm("Enable developer cheats?")) return;

    // Present options to the user
    const options = [
        { key: "1", label: "Give ALL upgrades" },
        { key: "2", label: "Give ALL items" },
        { key: "3", label: "Set max money" },
        { key: "4", label: "Set max sleep" },
        { key: "5", label: "Set age" },
        { key: "6", label: "Unlock all tabs" },
        { key: "7", label: "Give EVERYTHING (all of the above)" }
    ];
    let menu = "Developer Mode Options:\n";
    options.forEach(opt => {
        menu += `${opt.key}: ${opt.label}\n`;
    });
    menu += "Enter option numbers separated by commas (e.g. 1,2,3):";
    const input = prompt(menu, "7");
    if (!input) return;
    const selected = input.split(",").map(s => s.trim());

    // Helper: Give all upgrades
    function giveAllUpgrades() {
        Object.keys(upgradeDefinitions).forEach(id => {
            if (!gameState.purchasedUpgrades.includes(id)) {
                gameState.purchasedUpgrades.push(id);
                upgradeDefinitions[id].effect(gameState);
            }
        });
        gameState.availableUpgrades = [];
        renderUpgrades();
    }

    // Helper: Give all items
    function giveAllItems() {
        Object.keys(itemDefinitions).forEach(key => {
            gameState.ownedItems[key] = true;
        });
        // Equip best available for each slot
        const equipSlots = {
            hat: null,
            jacket: null,
            shirt: null,
            pants: null,
            shoes: null,
            socks: null
        };
        Object.entries(itemDefinitions).forEach(([key, item]) => {
            if (!equipSlots[item.type] || item.cost > itemDefinitions[equipSlots[item.type]].cost) {
                equipSlots[item.type] = key;
            }
        });
        if (equipSlots.hat) gameState.equippedHat = equipSlots.hat;
        if (equipSlots.jacket) gameState.equippedJacket = equipSlots.jacket;
        if (equipSlots.shirt) gameState.equippedShirt = equipSlots.shirt;
        if (equipSlots.pants) gameState.equippedPants = equipSlots.pants;
        if (equipSlots.shoes) gameState.equippedShoes = equipSlots.shoes;
        if (equipSlots.socks) gameState.equippedSocks = equipSlots.socks;

        updateEquipmentSelectors();
        updateOwnedItemButtons();
    }

    // Helper: Set max money
    function setMaxMoney() {
        gameState.moneyEarned = 9999999;
        gameState.moneyLost = 0;
        updateMoneyDisplay();
    }

    // Helper: Set max sleep
    function setMaxSleep() {
        gameState.sleepLevel = 100;
        updateElementText("sleep-level", gameState.sleepLevel);
    }

    // Helper: Set age
    function setAge() {
        const ageInput = prompt("What age would you like to be?", gameState.age);
        const age = parseInt(ageInput, 10);
        if (!isNaN(age)) {
            gameState.age = age;
            updateElementText("age-display", gameState.age);
        }
    }

    // Helper: Unlock all tabs
    function unlockAllTabs() {
        document.getElementById("upgrades-tab-button").style.display = "";
        document.getElementById("shop-tab-button").style.display = "";
        document.getElementById("gableisms-tab-button").style.display = "";
        document.getElementById("status-tab-button").style.display = "";
    }

    // If "Give EVERYTHING" is selected, do all
    if (selected.includes("7")) {
        giveAllUpgrades();
        giveAllItems();
        setMaxMoney();
        setMaxSleep();
        unlockAllTabs();
    } else {
        // Otherwise, apply selected cheats
        if (selected.includes("1")) giveAllUpgrades();
        if (selected.includes("2")) giveAllItems();
        if (selected.includes("3")) setMaxMoney();
        if (selected.includes("4")) setMaxSleep();
        if (selected.includes("5")) setAge();
        if (selected.includes("6")) unlockAllTabs();
    }


    addNotification("Selected cheats applied.", "info");
}


import { showNotification } from './utils.js';
import { updateAllDynamicText } from '../je.js';

export function enableCheats() {
    window.cheats = {
        addMoney: (amount) => {
            gameState.money += amount;
            showNotification(`Cheat: Added $${amount}`);
            updateAllDynamicText();
        },
        setAge: (age) => {
            gameState.age = age;
            showNotification(`Cheat: Age set to ${age}`);
            updateAllDynamicText();
        }
    };
    showNotification("Cheats enabled. Access with window.cheats in the console.");
}
