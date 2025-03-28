// je.js (Modified Main File)
import { gameState } from './game_state.js';
import { initAgeing, buyClothes } from './ageing.js';
// Import work related things - NOTE: We need a better way to handle these global flags like dogWalkerWorkInProgress
// For now, we might need to declare them globally or pass them around, which isn't ideal.
// Let's make dogWalkerWorkInProgress global for now (bad practice, but fixes the immediate issue)
window.dogWalkerWorkInProgress = false;
import { workAsDogWalker, initWorkEnhancements } from './work_enhancements.js';
import { initLocationTaxes } from './location_taxes.js';
// Same issue with sleepHobbyInProgress
window.sleepHobbyInProgress = false;
import { initHobbies, sleepHobby } from './hobbies.js';
import { initFashionMuggability, buySunglasses } from './fashion_muggability.js';
// Import ALL needed functions from utils.js
import { updateElementText, showMessage, updateMoneyDisplay, startProgressBar, updateButtonStates } from './utils.js';


// DOM elements for status display (Keep these)
const statusBox = document.getElementById("status-box");
const statusMessage = document.getElementById("status-message");
const progressBar = document.getElementById("progress-bar");

// Create a fixed message display element for user notifications (Keep this)
const messageDisplay = document.createElement("div");
messageDisplay.id = "message-display";
document.body.appendChild(messageDisplay);
// Make messageTimeout global so utils.js can clear it
window.messageTimeout = null;


// Function to roll 4 dice and update game stats
function rollDice() {
  // Check global work flags
  if (gameState.workInProgress || gameState.officeWorkInProgress || gameState.stapleWorkInProgress || gameState.napWorkInProgress || window.dogWalkerWorkInProgress || window.sleepHobbyInProgress) {
    return;
  }

  if (gameState.nextRollChance) {
    handleNextRoll();
  }

  gameState.dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  gameState.totalRolls++;
  gameState.alreadyCounted = false;

  updateElementText("dice-rolls", gameState.dice.join(", "));
  updateElementText("total-rolls", gameState.totalRolls);

  calculateBonus();
  updateTotalPoints(); // This will call updateMoneyDisplay internally if needed
  // gameState.netMoney -= 1; // Cost of roll is implicitly handled in updateMoneyDisplay now
  updateMoneyDisplay(); // Explicitly update money after roll cost
  updateButtonStates();
}

// Calculate bonus points
function calculateBonus() {
  if (gameState.dice.length === 0) return;

  const counts = {};
  let roundBonus = 0;

  gameState.dice.forEach(num => {
    counts[num] = (counts[num] || 0) + 1;
  });

  let hasMatch = false;

  Object.values(counts).forEach(count => {
    if (count > 1) {
      roundBonus += count - 1;
      hasMatch = true;
    }
  });

  const sortedDice = [...gameState.dice].sort((a, b) => a - b);
  let maxRunLength = 1;
  let currentRunLength = 1;

  for (let i = 1; i < sortedDice.length; i++) {
    if (sortedDice[i] === sortedDice[i - 1] + 1) {
      currentRunLength++;
      maxRunLength = Math.max(maxRunLength, currentRunLength);
    } else if (sortedDice[i] !== sortedDice[i - 1]) {
      currentRunLength = 1;
    }
  }

  if (maxRunLength >= 3) {
    roundBonus += maxRunLength - 2;
  }

  gameState.bonusPoints = (!hasMatch && maxRunLength < 3) ? 0 : gameState.bonusPoints + roundBonus;
  updateElementText("bonus-points", gameState.bonusPoints);
}

// Compute and display total points
function updateTotalPoints() {
  if (gameState.dice.length === 0) {
    updateElementText("total-points", "-");
    return;
  }

  const totalPoints = gameState.dice.reduce((a, b) => a + b, 0) + gameState.bonusPoints;
  updateElementText("total-points", totalPoints);

  if (totalPoints === 24 && !gameState.alreadyCounted) {
    gameState.missedWins++;
    gameState.moneyLost += 500; // moneyLost is positive for losses
    updateElementText("missed-wins", gameState.missedWins);
    showMessage("Claim your win, or lose $500 by not committing! (not scam, wink wink.)");
    gameState.alreadyCounted = true;
    updateMoneyDisplay(); // Update money display after missed win penalty
  }
}


// Commit current roll
function commit() {
  // Check global work flags
  if (gameState.workInProgress || gameState.officeWorkInProgress || gameState.stapleWorkInProgress || gameState.napWorkInProgress || window.dogWalkerWorkInProgress || window.sleepHobbyInProgress) {
      return;
  }
  if (gameState.dice.length === 0) {
    showMessage("Roll the dice first!");
    return;
  }

  const totalPoints = gameState.dice.reduce((a, b) => a + b, 0) + gameState.bonusPoints;

  if (totalPoints === 24) {
    gameState.consecutiveWins++;
    const winnings = 1500 * gameState.consecutiveWins;
    gameState.moneyEarned += winnings;
    gameState.wins++;
    updateElementText("wins", gameState.wins);
    showMessage(`You win! Streak: ${gameState.consecutiveWins}x. Earned $${winnings.toFixed(2)}`);
  } else {
    gameState.moneyLost += 100; // moneyLost is positive for losses
    gameState.consecutiveWins = 0;
    showMessage("Gable Failed, lost $100. Total does not equal 24.");
  }

  updateMoneyDisplay();
  resetGame(); // Resets dice/bonus, updates buttons
}

// Reset dice/bonus for next round
function resetGame() {
  gameState.dice = [];
  gameState.bonusPoints = 0;
  updateElementText("dice-rolls", "-");
  updateElementText("bonus-points", "0");
  updateElementText("total-points", "-");
  updateButtonStates();
}

// Random Int Utility (Keep or move to utils if preferred)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Work Functions (Keep - modify to use global flags if needed)
function workInMines() {
  if (gameState.workInProgress || isInDebt()) return;
  gameState.workInProgress = true;
  updateButtonStates();
  showMessage("Working in the mines...", 10000);
  startProgressBar(10000);
  setTimeout(() => { /* ... outcome logic ... */
    // Inside outcome logic:
    if (outcome.value < 0) {
      gameState.moneyLost -= outcome.value; // moneyLost tracks positive losses
    } else {
      gameState.moneyEarned += outcome.value;
    }
    showMessage(outcome.message);
    updateMoneyDisplay();
    gameState.workInProgress = false;
    updateButtonStates();
  }, 10000);
}

function workInOfficeJob() {
    if (gameState.officeWorkInProgress || isInDebt()) return;
    gameState.officeWorkInProgress = true;
    updateButtonStates();
    showMessage("Working in the office...", 7000);
    startProgressBar(7000);
    setTimeout(() => { /* ... outcome logic ... */
        if (outcome.value < 0) {
            gameState.moneyLost -= outcome.value; // moneyLost tracks positive losses
        } else {
            gameState.moneyEarned += outcome.value;
        }
        showMessage(outcome.message);
        updateMoneyDisplay();
        gameState.officeWorkInProgress = false;
        updateButtonStates();
    }, 7000);
}

function workInStapleTables() {
    if (gameState.stapleWorkInProgress || isInDebt()) return;
    gameState.stapleWorkInProgress = true;
    updateButtonStates();
    showMessage("Stapling tables...", 5000);
    startProgressBar(5000);
    setTimeout(() => { /* ... outcome logic ... */
        if (outcome.value < 0) {
            gameState.moneyLost -= outcome.value; // moneyLost tracks positive losses
        } else {
            gameState.moneyEarned += outcome.value;
        }
        showMessage(outcome.message);
        updateMoneyDisplay();
        gameState.stapleWorkInProgress = false;
        updateButtonStates();
    }, 5000);
}

// Check Debt
function isInDebt() {
  if (gameState.netMoney <= -100) {
    showMessage(gameState.netMoney <= -5000
      ? "The IRS will take your assets! You need to pay your debts before re-entering the workforce!"
      : "You are close to bankrupsy.");
    return true;
  }
  return false;
}

// Take Nap
function takeNap() {
  if (gameState.napWorkInProgress || isInDebt()) return;
  gameState.napWorkInProgress = true;
  updateButtonStates();
  showMessage("Taking a nap...", 5000);
  startProgressBar(5000);
  setTimeout(() => {
    gameState.nextRollChance = Math.random() < 0.5 ? "gain" : "lose";
    const resultMessage = gameState.nextRollChance === "gain" ? "Well Rested" : "Poor Nap";
    showMessage(resultMessage);
    gameState.napWorkInProgress = false;
    updateButtonStates();
  }, 5000);
}

// Apply Nap Effect
function handleNextRoll() {
  const baseAmount = Math.min(Math.abs(gameState.netMoney), 1000);
  const effectAmount = baseAmount * 0.15;
  let gainAmount = 0;
  let lossAmount = 0;

  if (gameState.nextRollChance === "gain") {
    gainAmount = effectAmount + 50;
    gameState.moneyEarned += gainAmount;
    showMessage(`You are Well Rested. Earned $${gainAmount.toFixed(2)}`);
  } else if (gameState.nextRollChance === "lose") {
    lossAmount = effectAmount + 50;
    gameState.moneyLost += lossAmount; // moneyLost tracks positive losses
    showMessage(`A poor nap! Lost $${lossAmount.toFixed(2)}`);
  }
  gameState.nextRollChance = null;
  updateMoneyDisplay(); // Update display after nap effect
}


// Bankruptcy Check
function checkBankruptcy() {
  if (gameState.netMoney <= -10000) {
    showMessage("BANKRUPTCY! The IRS took all your assets remaining. Refresh page to start again.", 0);
    document.querySelectorAll("button").forEach(btn => btn.disabled = true);
  }
}

// Save Game
function saveGame() {
  try {
    // Need to save the global flags too if we keep them global
    const stateToSave = {
        ...gameState,
        dogWalkerWorkInProgress: window.dogWalkerWorkInProgress,
        sleepHobbyInProgress: window.sleepHobbyInProgress
    };
    localStorage.setItem('towerOfGableData', JSON.stringify(stateToSave));
  } catch (e) {
    console.error("Could not save game state:", e);
  }
}

// Load Game
function loadGame() {
  try {
    const savedData = localStorage.getItem('towerOfGableData');
    if (savedData) {
      const loadedState = JSON.parse(savedData);

      // Copy saved gameState properties
      for (const key in gameState) {
        if (loadedState.hasOwnProperty(key)) {
          gameState[key] = loadedState[key];
        }
      }
      // Restore global flags
      window.dogWalkerWorkInProgress = loadedState.dogWalkerWorkInProgress || false;
      window.sleepHobbyInProgress = loadedState.sleepHobbyInProgress || false;


      // Re-initialize location data based on loaded state (if needed, location data isn't saved currently)
      const locationData = locations[gameState.currentLocation] || locations["North Carolina"]; // Fallback


      // Update UI based on loaded state
      updateElementText("wins", gameState.wins);
      updateElementText("missed-wins", gameState.missedWins || 0); // Ensure missedWins exists
      updateElementText("total-rolls", gameState.totalRolls);
      updateMoneyDisplay();
      updateElementText("age-display", gameState.age);
      updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
      updateElementText("location-display", locationData.name);
      updateElementText("sleep-level", gameState.sleepLevel);
      updateElementText("muggability-display", gameState.muggability);
      updateElementText("slaves", gameState.slaves || 0); // Ensure slaves exists

      showMessage("Game loaded from previous session", 3000);
    } else {
        // If no saved data, ensure UI reflects initial state
        updateMoneyDisplay(); // Ensure initial money display is correct
        updateElementText("age-display", gameState.age);
        updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
        updateElementText("location-display", locations[gameState.currentLocation].name);
        updateElementText("sleep-level", gameState.sleepLevel);
        updateElementText("muggability-display", gameState.muggability);
        updateElementText("slaves", gameState.slaves);
    }
  } catch (e) {
    console.error("Could not load saved game:", e);
    // Reset to default state if loading fails?
     resetGameAll();
  }
}


// Full Game Reset
function resetGameAll() {
    // Reset all gameState variables
    Object.assign(gameState, {
        wins: 0, consecutiveWins: 0, missedWins: 0, bonusPoints: 0, totalRolls: 0,
        moneyEarned: 0, moneyLost: 0, netMoney: 0, dice: [], alreadyCounted: false,
        workInProgress: false, officeWorkInProgress: false, stapleWorkInProgress: false,
        napWorkInProgress: false, nextRollChance: null, age: 4,
        clothesPrice: 10 + (4 * 4), lastClothingChange: Date.now(), currentLocation: "North Carolina",
        muggability: 0, equippedItems: {}, sleepLevel: 100, slaves: 0
    });
    // Reset global flags
    window.dogWalkerWorkInProgress = false;
    window.sleepHobbyInProgress = false;


    // Update UI elements
    updateElementText("wins", gameState.wins);
    updateElementText("missed-wins", gameState.missedWins);
    updateElementText("total-rolls", gameState.totalRolls);
    updateMoneyDisplay(); // This handles money earned/lost/net
    updateElementText("dice-rolls", "-");
    updateElementText("bonus-points", "0");
    updateElementText("total-points", "-");
    updateElementText("age-display", gameState.age);
    updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
    updateElementText("location-display", gameState.currentLocation); // Use gameState value
    updateElementText("sleep-level", gameState.sleepLevel);
    updateElementText("muggability-display", gameState.muggability);
    updateElementText("slaves", gameState.slaves);

    // Ensure buttons are correctly enabled/disabled
    updateButtonStates();
    // Clear any lingering messages
    if (window.messageTimeout) clearTimeout(window.messageTimeout);
    messageDisplay.style.display = "none";

    showMessage("Game Reset to Beginning!", 3000);
    // Clear saved game data
    localStorage.removeItem('towerOfGableData');
}


// Initialize Game
function initGame() {
  loadGame(); // Load first
  initAgeing();
  initWorkEnhancements();
  initLocationTaxes();
  initHobbies();
  initFashionMuggability();


  const buttonMappings = {
    "roll-dice-btn": rollDice,
    "commit-btn": commit,
    "work-in-mines-btn": workInMines,
    "work-in-office-btn": workInOfficeJob,
    "work-staple-tables-btn": workInStapleTables,
    "take-nap-btn": takeNap,
    "work-dog-walker-btn": workAsDogWalker,
    "sleep-hobby-btn": sleepHobby,
    "buy-clothes-btn": buyClothes,
    "buy-sunglasses-btn": buySunglasses,
    "reset-game-btn": resetGameAll
  };

  Object.entries(buttonMappings).forEach(([id, func]) => {
    const button = document.getElementById(id);
    if (button) {
      // Remove previous listener if any to prevent duplicates on potential re-init
      // button.removeEventListener("click", func); // This might be too complex if func refs change
      button.onclick = func; // Simpler way for this setup
    } else {
      console.error(`Button with ID "${id}" not found`);
    }
  });

  updateButtonStates(); // Update buttons after loading and init

  // Use requestAnimationFrame or similar for smoother checks if needed, but setInterval is fine
  setInterval(saveGame, 60000);
  setInterval(checkBankruptcy, 1000);

  showMessage("Welcome to the Tower of Gable - WebV14", 5000);
}

// Need location data accessible for loadGame and init
const locations = {
  "North Carolina": {
    hospitalStay: 2511,
    totalTax: 0.15,
    name: "North Carolina"
  },
};

window.addEventListener("load", initGame);