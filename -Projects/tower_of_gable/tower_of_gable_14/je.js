// je.js
import { gameState } from './game_state.js';
import { initAgeing, buyClothes } from './ageing.js';
import { workAsDogWalker, initWorkEnhancements } from './work_enhancements.js';
import { initLocationTaxes } from './location_taxes.js';
import { initHobbies, sleepHobby } from './hobbies.js';
import { initFashionMuggability, buySunglasses } from './fashion_muggability.js'; // Can remove buySunglasses if done via shop now
// --- NEW IMPORTS ---
import { itemDefinitions } from './items.js';
import { initShopping, updateEquipmentSelectors, updateOwnedItemButtons } from './shopping.js';
import { initMuggability, recordSleepOrNap, recalculateMuggability } from './muggability.js';
// -------------------
import { updateElementText, showMessage, updateMoneyDisplay, addNotification, updateButtonStates } from './utils.js';

// DOM elements
const notificationLog = document.getElementById('notification-log');
const bankruptcyResetBtn = document.getElementById('bankruptcy-reset-btn');
window.messageTimeout = null;

// --- Update Work/Nap/Sleep functions to record time ---
function takeNap() {
     if (gameState.isTakingNap || isInDebt()) return;
    gameState.isTakingNap = true;
    updateButtonStates();
    addNotification("Taking a short nap.", "start");
    recordSleepOrNap(); // <<< Record time here
    const duration = 5000;
    setTimeout(() => {
        gameState.nextRollChance = Math.random() < 0.5 ? "gain" : "lose";
        const resultMessage = gameState.nextRollChance === "gain" ? "You feel rested." : "You had a weird dream.";
         addNotification(`Finished nap. ${resultMessage} Effect applies on next roll.`, "info");
        gameState.isTakingNap = false;
        updateButtonStates();
        recalculateMuggability(); // Update muggability after nap ends
    }, duration);
}

// Ensure sleepHobby also records sleep time (modify in hobbies.js or call here)
// Let's modify hobbies.js directly for consistency...
// (Modification shown below in Section VI)


// --- Load Game (Add new state properties) ---
function loadGame() {
  try {
    const savedData = localStorage.getItem('towerOfGableData');
    if (savedData) {
      const loadedState = JSON.parse(savedData);
      // Use Object.assign for cleaner merging, ensuring defaults
      Object.assign(gameState, loadedState);

      // Ensure defaults for potentially missing newer properties in old saves
      gameState.muggability = gameState.muggability ?? 50;
      gameState.lastSleepOrNapTime = gameState.lastSleepOrNapTime || Date.now();
      gameState.ownedItems = gameState.ownedItems || {};
      gameState.equippedHat = gameState.equippedHat || null;
      gameState.equippedJacket = gameState.equippedJacket || null;
      gameState.momNagCount = gameState.momNagCount || 0;
      // Ensure work flags default to false if missing
      gameState.isWorkingMines = gameState.isWorkingMines || false;
      gameState.isWorkingOffice = gameState.isWorkingOffice || false;
      gameState.isWorkingStaples = gameState.isWorkingStaples || false;
      gameState.isTakingNap = gameState.isTakingNap || false;
      gameState.isWalkingDog = gameState.isWalkingDog || false;
      gameState.isSleepingHobby = gameState.isSleepingHobby || false;


      // Update UI based on loaded state
      updateElementText("wins", gameState.wins);
      updateElementText("total-rolls", gameState.totalRolls);
      updateMoneyDisplay(); // Handles money earned/lost/net
      updateElementText("age-display", gameState.age);
      updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
      updateElementText("location-display", gameState.currentLocation);
      updateElementText("sleep-level", gameState.sleepLevel);
      updateElementText("muggability-display", gameState.muggability); // Update muggability display
      updateElementText("slaves", gameState.slaves);
      updateElementText("bonus-points", gameState.bonusPoints);
      updateElementText("dice-rolls", gameState.dice.length > 0 ? gameState.dice.join(", ") : "-");
      updateElementText("total-points", gameState.dice.length > 0 ? (gameState.dice.reduce((a,b)=>a+b,0) + gameState.bonusPoints) : "-");


      addNotification("Game loaded from previous session.", "info");

      // Update shop UI AFTER main load
      // Need to ensure shopping elements are ready - maybe delay slightly or ensure initShopping runs after load completes fully
      // For simplicity, call directly here. If issues arise, use setTimeout(..., 0)
      updateEquipmentSelectors();
      updateOwnedItemButtons();
      recalculateMuggability(); // Ensure muggability reflects loaded equipment/state

    } else {
       // Update UI for initial state if no save
       updateMoneyDisplay();
       updateElementText("muggability-display", gameState.muggability);
       // ... update other initial UI elements ...
    }
  } catch (e) {
    console.error("Could not load saved game:", e);
    resetGameAll();
  }
}

// --- Reset Game (Add new state properties) ---
function resetGameAll() {
    // Reset gameState to initial values including new ones
     Object.assign(gameState, {
        wins: 0, consecutiveWins: 0, missedWins: 0, bonusPoints: 0, totalRolls: 0,
        moneyEarned: 0, moneyLost: 0, netMoney: 0, dice: [], alreadyCounted: false,
        isWorkingMines: false, isWorkingOffice: false, isWorkingStaples: false,
        isTakingNap: false, isWalkingDog: false, isSleepingHobby: false,
        nextRollChance: null, age: 4, clothesPrice: 10 + (4 * 4),
        lastClothingChange: Date.now(), currentLocation: "North Carolina",
        muggability: 50, lastSleepOrNapTime: Date.now(), // Reset muggability state
        ownedItems: {}, equippedHat: null, equippedJacket: null, // Reset items/equipment
        sleepLevel: 100, slaves: 0, momNagCount: 0
    });

    // Update all UI elements
    updateElementText("wins", gameState.wins);
    updateElementText("total-rolls", gameState.totalRolls);
    updateMoneyDisplay();
    updateElementText("dice-rolls", "-");
    updateElementText("bonus-points", "0");
    updateElementText("total-points", "-");
    updateElementText("age-display", gameState.age);
    updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
    updateElementText("location-display", gameState.currentLocation);
    updateElementText("sleep-level", gameState.sleepLevel);
    updateElementText("muggability-display", gameState.muggability); // Reset display
    updateElementText("slaves", gameState.slaves);

    // Clear notification log
    if (notificationLog) notificationLog.innerHTML = '';

    // Reset Shop UI
    updateEquipmentSelectors(); // Clear and reset dropdowns
    populateShopGrids(); // Re-enable all buy buttons (done by initShopping/populateShopGrids)
    updateOwnedItemButtons(); // Ensure buttons reflect fresh state (none owned)


    // Hide bankruptcy button, ensure others are potentially enabled
    if(bankruptcyResetBtn) bankruptcyResetBtn.style.display = 'none';
    updateButtonStates();

    // Clear saved game data
    localStorage.removeItem('towerOfGableData');

    addNotification("Game Reset to Beginning!", "info");
}


// --- Initialize Game (Add new inits) ---
function initGame() {
  loadGame(); // Load state first

  // Initialize modules
  initAgeing();
  initWorkEnhancements();
  initLocationTaxes();
  initHobbies();
  // initFashionMuggability(); // Can be removed if sunglasses are bought via shop now
  initShopping(); // <<< Initialize Shopping UI
  initMuggability(); // <<< Initialize Muggability System

  // Add event listeners (Ensure work functions are accessible)
  // Temporary fix: Make work functions global for button mapping
   window.workInMines = workInMines;
   window.workInOfficeJob = workInOfficeJob;
   window.workInStapleTables = workInStapleTables;
   // window.takeNap = takeNap; // takeNap is defined within je.js
   window.buyClothes = buyClothes; // Assuming from ageing.js

  const buttonMappings = {
    "roll-dice-btn": rollDice,
    "commit-btn": commit,
    "work-in-mines-btn": window.workInMines,
    "work-in-office-btn": window.workInOfficeJob,
    "work-staple-tables-btn": window.workInStapleTables,
    "take-nap-btn": takeNap, // Use local function
    "work-dog-walker-btn": workAsDogWalker, // Imported
    "sleep-hobby-btn": sleepHobby, // Imported
    "buy-clothes-btn": window.buyClothes, // Assuming global from ageing.js for now
    "buy-sunglasses-btn": () => buyItem('sunglasses'), // Use buyItem directly if sunglasses in items.js
    "bankruptcy-reset-btn": resetGameAll
  };

   // Remove sunglasses button if it's part of the main shop now
    const sunglassesBtn = document.getElementById('buy-sunglasses-btn');
    if (sunglassesBtn && itemDefinitions['sunglasses']) { // Check if sunglasses defined in items.js
       sunglassesBtn.style.display = 'none'; // Hide the dedicated button
       delete buttonMappings['buy-sunglasses-btn']; // Remove mapping
   } else if (sunglassesBtn) {
       // Keep old sunglasses button if not in items.js
       buttonMappings['buy-sunglasses-btn'] = buySunglasses; // Assuming imported
   }


  Object.entries(buttonMappings).forEach(([id, func]) => {
    const button = document.getElementById(id);
    if (button) {
      button.onclick = func;
    } else if (id !== 'buy-sunglasses-btn') { // Don't warn if sunglasses button was intentionally removed
       console.error(`Button with ID "${id}" not found`);
    }
  });

  updateButtonStates(); // Set initial button states

  // Start intervals
  setInterval(saveGame, 60000);
  setInterval(checkBankruptcy, 1000);
  setInterval(momNag, 5 * 60 * 1000);
  // Muggability interval is started in initMuggability()

  addNotification("Welcome to the Tower of Gable - WebV14.1", "info");
}

// --- Keep necessary functions defined globally or ensure imports ---
// (workInMines, workInOfficeJob, workInStapleTables, isInDebt, etc. definitions from previous response go here)
// ...
function workInMines() { /* ... implementation ... */ }
function workInOfficeJob() { /* ... implementation ... */ }
function workInStapleTables() { /* ... implementation ... */ }
function isInDebt() { /* ... implementation ... */ }
function handleNextRoll() { /* ... implementation ... */ }
function momNag() { /* ... implementation ... */ }
function checkBankruptcy() { /* ... implementation ... */ }
function rollDice() { /* ... implementation ... */ }
function calculateBonus() { /* ... implementation ... */ }
function commit() { /* ... implementation ... */ }
function resetDice() { /* ... implementation ... */ }
function updateTotalPoints() { /* ... implementation ... */ }
// ... and any other functions previously defined directly in je.js that are still needed

window.addEventListener("load", initGame); // Start the game