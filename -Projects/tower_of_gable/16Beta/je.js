import { gameState, loadGame, saveGame, resetGame, initialGameState } from './modules/persistence.js';
import { showNotification, updateText, updateHTML, debounce } from './modules/utils.js';
import { getMuggability, attemptMugging } from './modules/muggability.js';
import { itemDefinitions, buyItem } from './modules/shopping.js';
import { handleBirthday } from './modules/ageing.js';
import { jobDefinitions, setJob, doWork } from './modules/work.js';
import { locationTaxes, setLocation, payTaxes } from './modules/location_taxes.js';
import { sleep, wakeUp, takeNap, faint } from './modules/hobbies.js';
import { setupTabs, makeShopCollapsible } from './modules/ui_enhancements.js';
import { rollDice, commitToDice } from './modules/dice.js';
import { upgradeDefinitions, buyUpgrade } from './modules/upgrades.js';
import { enableCheats } from './modules/cheats.js';

// --- Global Namespace for HTML interaction ---
window.game = {
    buyItem,
    setJob,
    doWork,
    setLocation,
    sleep,
    wakeUp,
    takeNap,
    rollDice,
    commitToDice,
    buyUpgrade,
    saveGame,
    loadGame,
    resetGame
};

// --- UI Update Functions ---
function updateAllDynamicText() {
    updateMoney();
    updateAge();
    updateTime();
    updateLocationDisplay();
    updateEquipment();
    updateJobDisplay();
    updateHealth();
    updateEnergy();
    updateSanity();
    updateAwake();
    updateMomPresent();
    updateMuggabilityDisplay();
    updateShop();
    updateUpgrades();
    updateDiceResult();
    updateDiceCommitButton();
}

export function updateMoney() {
    updateText('money-value', gameState.money.toFixed(2));
}
export function updateAge() {
    updateText('age-value', gameState.age);
}
function updateTime() {
    updateText('time-value', gameState.time.toLocaleString());
}
function updateLocationDisplay() {
    updateText('location-value', gameState.location);
}
function updateEquipment() {
    updateText('equipment-value', gameState.items.join(', ') || 'None');
}
function updateJobDisplay() {
    updateText('job-value', gameState.job || 'Unemployed');
}
export function updateHealth() {
    updateText('health-value', gameState.health);
}
export function updateEnergy() {
    updateText('energy-value', gameState.energy);
}
export function updateSanity() {
    updateText('sanity-value', gameState.sanity);
}
export function updateAwake() {
    document.getElementById('sleep-button').style.display = gameState.isAwake ? 'inline-block' : 'none';
    document.getElementById('wakeup-button').style.display = gameState.isAwake ? 'none' : 'inline-block';
}
export function updateMomPresent() {
    document.getElementById('mom-present-value').textContent = gameState.momPresent ? 'Yes' : 'No';
}
function updateMuggabilityDisplay() {
    updateText('muggability-value', getMuggability());
}
function updateShop() {
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';
    for (const itemName in itemDefinitions) {
        const item = itemDefinitions[itemName];
        const button = document.createElement('button');
        button.textContent = `${itemName} - $${item.cost}`;
        if (gameState.money < item.cost || gameState.items.includes(itemName)) {
            button.disabled = true;
        }
        button.onclick = () => buyItem(itemName);
        shopItems.appendChild(button);
    }
}
function updateUpgrades() {
    const upgradesContainer = document.getElementById('upgrades-container');
    upgradesContainer.innerHTML = '';
    for (const upgradeName in upgradeDefinitions) {
        const upgrade = upgradeDefinitions[upgradeName];
        const button = document.createElement('button');
        button.textContent = `${upgradeName} - $${upgrade.cost}`;
        if (gameState.money < upgrade.cost || gameState.upgrades.includes(upgradeName)) {
            button.disabled = true;
        }
        button.onclick = () => buyUpgrade(upgradeName);
        upgradesContainer.appendChild(button);
    }
}
export function updateDiceResult() {
    updateText('dice-result', gameState.dice.value || '-');
}
export function updateDiceCommitButton() {
    document.getElementById('commit-dice-button').disabled = !gameState.dice.rolled;
}


// --- Game Loop and Initialization ---
function gameTick() {
    const now = new Date();
    const timeDiff = now - new Date(gameState.time);

    // Update game time
    gameState.time = now;

    // Ageing
    if (now.getDate() !== new Date(gameState.time).getDate()) {
        handleBirthday();
    }

    // Passive state changes
    if (gameState.isAwake) {
        gameState.energy -= 0.1;
        gameState.hunger += 0.1;
        gameState.thirst += 0.1;
    } else {
        gameState.energy += 0.5;
    }

    // Check for fainting
    faint();

    // Random events
    if (Math.random() < 0.01) {
        attemptMugging();
    }

    // Update UI periodically
    updateAllDynamicText();
}

function init() {
    // Load game or start new
    loadGame();

    // Setup UI
    setupTabs();
    makeShopCollapsible();

    // Add event listeners to buttons that are not dynamically created
    document.getElementById('do-work-button').onclick = () => doWork();
    document.getElementById('sleep-button').onclick = () => sleep();
    document.getElementById('wakeup-button').onclick = () => wakeUp();
    document.getElementById('nap-button').onclick = () => takeNap();
    document.getElementById('roll-dice-button').onclick = () => rollDice();
    document.getElementById('commit-dice-button').onclick = () => commitToDice();
    document.getElementById('save-button').onclick = () => saveGame();
    document.getElementById('load-button').onclick = () => loadGame();
    document.getElementById('reset-button').onclick = () => resetGame();


    // Start game loop
    setInterval(gameTick, 1000);

    // Enable cheats in console
    enableCheats();

    console.log("Game Initialized");
}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', init);
