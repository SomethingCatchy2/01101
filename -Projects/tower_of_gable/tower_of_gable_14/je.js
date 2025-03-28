// je.js
import { gameState } from './game_state.js';
import { initAgeing, buyClothes } from './ageing.js'; // Assuming ageing.js handles its own momNag logic now
import { workAsDogWalker, initWorkEnhancements } from './work_enhancements.js';
import { initLocationTaxes } from './location_taxes.js';
import { initHobbies, sleepHobby } from './hobbies.js';
import { initFashionMuggability, buySunglasses } from './fashion_muggability.js';
import { updateElementText, showMessage, updateMoneyDisplay, addNotification, updateButtonStates } from './utils.js'; // Import addNotification

// DOM elements
const notificationLog = document.getElementById('notification-log'); // Reference log for potential direct use
const bankruptcyResetBtn = document.getElementById('bankruptcy-reset-btn');

// Make messageTimeout global if showMessage is still used for top banner
window.messageTimeout = null;

// --- Dice Roll Logic (Allow during office work) ---
function rollDice() {
  const canRoll = !gameState.isWorkingMines && !gameState.isWorkingStaples && !gameState.isTakingNap && !gameState.isWalkingDog && !gameState.isSleepingHobby;
  if (!canRoll) {
    addNotification("Cannot roll dice while doing that job!", "info");
    return;
  }

  if (gameState.nextRollChance) {
    handleNextRoll(); // Apply nap effect if pending
  }

  gameState.dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  gameState.totalRolls++;
  gameState.alreadyCounted = false;

  updateElementText("dice-rolls", gameState.dice.join(", "));
  updateElementText("total-rolls", gameState.totalRolls);

  calculateBonus(); // Recalculates and updates bonus points display
  updateTotalPoints(); // Calculates and updates total points display

  gameState.moneyLost += 1; // Cost $1 to roll (Track as positive loss)
  addNotification(`Rolled: ${gameState.dice.join(", ")}. Cost $1.`, "info");
  updateMoneyDisplay();
  updateButtonStates(); // Update buttons after state change
}

// --- Calculate Bonus (Fix for 6s in matches) ---
function calculateBonus() {
  if (gameState.dice.length === 0) return;

  const counts = {};
  let matchBonus = 0;

  // Count non-six dice for matches
  gameState.dice.forEach(num => {
    if (num !== 6) { // *** ONLY COUNT NON-SIXES FOR MATCHES ***
        counts[num] = (counts[num] || 0) + 1;
    }
  });

  let hasMatch = false;
  Object.values(counts).forEach(count => {
    if (count > 1) {
      matchBonus += count - 1; // Bonus for pairs, triples, quads (of non-sixes)
      hasMatch = true;
    }
  });

  // Calculate Run Bonus (including 6s)
  const sortedDiceUnique = [...new Set(gameState.dice)].sort((a, b) => a - b); // Use unique dice for run check
  let runBonus = 0;
  let maxRunLength = 0;
  let currentRunLength = 0;

  for (let i = 0; i < sortedDiceUnique.length; i++) {
      if (i > 0 && sortedDiceUnique[i] === sortedDiceUnique[i - 1] + 1) {
          currentRunLength++;
      } else {
          currentRunLength = 1; // Reset run
      }
      maxRunLength = Math.max(maxRunLength, currentRunLength);
  }

  if (maxRunLength >= 3) {
      runBonus = maxRunLength - 2; // 1 point for run of 3, 2 for run of 4
  }

  // Reset bonus points only if NO match AND NO run this round
  if (!hasMatch && maxRunLength < 3) {
      gameState.bonusPoints = 0;
  } else {
      gameState.bonusPoints += (matchBonus + runBonus);
  }

  updateElementText("bonus-points", gameState.bonusPoints);
}


// --- Commit Logic (Allow during office work) ---
function commit() {
  const canCommit = !gameState.isWorkingMines && !gameState.isWorkingStaples && !gameState.isTakingNap && !gameState.isWalkingDog && !gameState.isSleepingHobby;
   if (!canCommit) {
    addNotification("Cannot commit while doing that job!", "info");
    return;
  }
  if (gameState.dice.length === 0) {
    addNotification("Roll the dice first!", "info");
    return;
  }

  const totalPoints = gameState.dice.reduce((a, b) => a + b, 0) + gameState.bonusPoints;

  if (totalPoints === 24) {
    gameState.consecutiveWins++;
    const winnings = 1500 * gameState.consecutiveWins; // Keep high win for now
    gameState.moneyEarned += winnings;
    gameState.wins++;
    updateElementText("wins", gameState.wins);
    addNotification(`COMMIT SUCCESS! Total is 24! Streak: ${gameState.consecutiveWins}x. Earned $${winnings.toFixed(2)}`, "win");
  } else {
    gameState.moneyLost += 100; // Penalty for failing commit
    gameState.consecutiveWins = 0;
    addNotification(`COMMIT FAILED! Total was ${totalPoints}. Lost $100.`, "loss");
  }

  // Reset bonus points after EVERY commit, win or lose
  gameState.bonusPoints = 0;
  updateElementText("bonus-points", gameState.bonusPoints);

  updateMoneyDisplay();
  resetDice(); // Only resets dice/UI related to roll, not full game
}

// --- Renamed from resetGame to resetDice ---
function resetDice() {
  gameState.dice = [];
  // gameState.bonusPoints = 0; // Bonus reset is now handled in commit()
  gameState.alreadyCounted = false;
  updateElementText("dice-rolls", "-");
  updateElementText("total-points", "-");
  updateButtonStates();
}

// --- Update Total Points (Uses addNotification) ---
function updateTotalPoints() {
  if (gameState.dice.length === 0) {
    updateElementText("total-points", "-");
    return;
  }

  const totalPoints = gameState.dice.reduce((a, b) => a + b, 0) + gameState.bonusPoints;
  updateElementText("total-points", totalPoints);

  // Check for missed win (only if not already counted this roll)
  if (totalPoints === 24 && !gameState.alreadyCounted) {
    gameState.missedWins++;
    gameState.moneyLost += 500; // Penalty
    updateElementText("missed-wins", gameState.missedWins); // Assuming this element exists
    addNotification("You rolled 24! Commit now or lose $500 penalty if you roll again!", "loss");
    gameState.alreadyCounted = true; // Mark as counted for this roll
    updateMoneyDisplay();
  }
}


// --- Apply Nap Effect (Flat Amount) ---
function handleNextRoll() {
  // Flat bonus/penalty for nap
  const gainAmount = 75;
  const lossAmount = 75;

  if (gameState.nextRollChance === "gain") {
    gameState.moneyEarned += gainAmount;
    addNotification(`Well Rested from nap. Earned $${gainAmount.toFixed(2)}`, "finish-success");
  } else if (gameState.nextRollChance === "lose") {
    gameState.moneyLost += lossAmount;
    addNotification(`Poor nap! Lost $${lossAmount.toFixed(2)}`, "finish-fail");
  }
  gameState.nextRollChance = null; // Clear the chance
  updateMoneyDisplay(); // Update money display after effect
}

// --- Mom Nag Logic ---
function momNag() {
    gameState.momNagCount++;
    if (gameState.momNagCount < 12) { // Less than 1 hour
        addNotification("Mom: Go take a shower, sweetie.", "mom");
    } else {
        // Construct the family-friendly rant
        const rant = `Mom: Seriously, honey, it's been ${Math.floor(gameState.momNagCount * 5 / 60)} hour(s)! You really need to think about personal hygiene. It's important for staying healthy and, frankly, for not smelling like... well, like you haven't showered in ${Math.floor(gameState.momNagCount * 5 / 60)} hour(s). Remember how we talked about germs? And making a good impression? Just hop in, quick rinse, use the nice soap I bought. It'll make you feel so much better! Please? For me?`;
        addNotification(rant, "mom-rant");
    }
}

// --- Bankruptcy Check (Show Reset Button) ---
function checkBankruptcy() {
  if (gameState.netMoney <= -10000 && bankruptcyResetBtn.style.display === 'none') { // Only trigger once
    addNotification("BANKRUPTCY! The IRS took all your assets remaining. Game Over.", "loss");

    // Disable all action buttons permanently in this state
    const actionButtons = document.querySelectorAll('.box button:not(#bankruptcy-reset-btn)');
    actionButtons.forEach(btn => btn.disabled = true);

    // Show the reset button
    bankruptcyResetBtn.style.display = 'inline-block'; // Show the button
  }
}

// --- Save Game (Include new state) ---
function saveGame() {
  try {
    // No need to save individual work flags if they are in gameState
    localStorage.setItem('towerOfGableData', JSON.stringify(gameState));
  } catch (e) {
    console.error("Could not save game state:", e);
  }
}

// --- Load Game (Include new state) ---
function loadGame() {
  try {
    const savedData = localStorage.getItem('towerOfGableData');
    if (savedData) {
      const loadedState = JSON.parse(savedData);

      // Copy loaded state into gameState, ensuring defaults for missing properties
      for (const key in gameState) {
        if (loadedState.hasOwnProperty(key)) {
          gameState[key] = loadedState[key];
        }
        // Add default values if a key is missing in saved data but exists in default gameState
        else if (gameState.hasOwnProperty(key) && loadedState[key] === undefined) {
            // gameState already has the default, so no action needed unless explicit reset
            console.warn(`Saved data missing key: ${key}. Using default.`);
        }
      }
       // Ensure any potential missing flags are defaulted to false if loading very old data
       gameState.isWorkingMines = gameState.isWorkingMines || false;
       gameState.isWorkingOffice = gameState.isWorkingOffice || false;
       // ...etc for all work flags
       gameState.momNagCount = gameState.momNagCount || 0;


      // Update UI based on loaded state
      updateElementText("wins", gameState.wins);
      // updateElementText("missed-wins", gameState.missedWins); // Remove if element doesn't exist
      updateElementText("total-rolls", gameState.totalRolls);
      updateMoneyDisplay();
      updateElementText("age-display", gameState.age);
      updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
      updateElementText("location-display", gameState.currentLocation); // Location name assumed to be stored directly now
      updateElementText("sleep-level", gameState.sleepLevel);
      updateElementText("muggability-display", gameState.muggability);
      updateElementText("slaves", gameState.slaves);
      updateElementText("bonus-points", gameState.bonusPoints);
      updateElementText("dice-rolls", gameState.dice.length > 0 ? gameState.dice.join(", ") : "-");
      updateElementText("total-points", gameState.dice.length > 0 ? (gameState.dice.reduce((a,b)=>a+b,0) + gameState.bonusPoints) : "-");


      addNotification("Game loaded from previous session.", "info");
    } else {
        // If no saved data, update UI to reflect initial state
        updateMoneyDisplay();
        updateElementText("age-display", gameState.age);
        updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
        // ... update all other relevant UI elements ...
         updateElementText("slaves", gameState.slaves);
         updateElementText("sleep-level", gameState.sleepLevel);
         // etc.
    }
  } catch (e) {
    console.error("Could not load saved game:", e);
    resetGameAll(); // Reset if loading fails catastrophically
  }
}


// --- Full Game Reset (Hide Bankruptcy Button) ---
function resetGameAll() {
    // Reset gameState to initial values
     Object.assign(gameState, {
        wins: 0, consecutiveWins: 0, missedWins: 0, bonusPoints: 0, totalRolls: 0,
        moneyEarned: 0, moneyLost: 0, netMoney: 0, dice: [], alreadyCounted: false,
        isWorkingMines: false, isWorkingOffice: false, isWorkingStaples: false,
        isTakingNap: false, isWalkingDog: false, isSleepingHobby: false,
        nextRollChance: null, age: 4, clothesPrice: 10 + (4 * 4),
        lastClothingChange: Date.now(), currentLocation: "North Carolina",
        muggability: 0, equippedItems: {}, sleepLevel: 100, slaves: 0, momNagCount: 0
    });


    // Update all UI elements
    updateElementText("wins", gameState.wins);
    // updateElementText("missed-wins", gameState.missedWins); // If exists
    updateElementText("total-rolls", gameState.totalRolls);
    updateMoneyDisplay(); // Handles money display
    updateElementText("dice-rolls", "-");
    updateElementText("bonus-points", "0");
    updateElementText("total-points", "-");
    updateElementText("age-display", gameState.age);
    updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
    updateElementText("location-display", gameState.currentLocation);
    updateElementText("sleep-level", gameState.sleepLevel);
    updateElementText("muggability-display", gameState.muggability);
    updateElementText("slaves", gameState.slaves);

    // Clear notification log
    if (notificationLog) notificationLog.innerHTML = '';

    // Hide bankruptcy button, ensure others are potentially enabled
    if(bankruptcyResetBtn) bankruptcyResetBtn.style.display = 'none';
    updateButtonStates(); // Re-enable buttons based on fresh state

    // Clear saved game data
    localStorage.removeItem('towerOfGableData');

    addNotification("Game Reset to Beginning!", "info");
}


// --- Initialize Game ---
function initGame() {
  loadGame(); // Load state first

  // Initialize modules (if they have init logic beyond event listeners)
  initAgeing();
  initWorkEnhancements();
  initLocationTaxes();
  initHobbies();
  initFashionMuggability();

  // Add event listeners
  const buttonMappings = {
    "roll-dice-btn": rollDice,
    "commit-btn": commit,
    "work-in-mines-btn": workInMines, // Assumes workInMines is globally defined or imported correctly
    "work-in-office-btn": workInOfficeJob, // Same assumption
    "work-staple-tables-btn": workInStapleTables, // Same assumption
    "take-nap-btn": takeNap, // Same assumption
    "work-dog-walker-btn": workAsDogWalker,
    "sleep-hobby-btn": sleepHobby,
    "buy-clothes-btn": buyClothes,
    "buy-sunglasses-btn": buySunglasses,
    "bankruptcy-reset-btn": resetGameAll // Listener for the bankruptcy button
  };

   // Need work functions accessible here - temporary global scope or import all
   // Assuming they are made global or properly imported elsewhere for now
   window.workInMines = workInMines;
   window.workInOfficeJob = workInOfficeJob;
   window.workInStapleTables = workInStapleTables;
   window.takeNap = takeNap;
   // workAsDogWalker, sleepHobby, buyClothes, buySunglasses are imported


  Object.entries(buttonMappings).forEach(([id, func]) => {
    const button = document.getElementById(id);
    if (button) {
      button.onclick = func; // Use onclick for simplicity here
    } else {
      console.error(`Button with ID "${id}" not found`);
    }
  });

  updateButtonStates(); // Set initial button states

  // Start intervals
  setInterval(saveGame, 60000); // Save every minute
  setInterval(checkBankruptcy, 1000); // Check bankruptcy every second
  setInterval(momNag, 5 * 60 * 1000); // Mom nags every 5 minutes

  addNotification("Welcome to the Tower of Gable - WebV14.1", "info");
}

// --- Need work functions defined or imported before initGame ---
// Define workInMines, workInOfficeJob, workInStapleTables, takeNap here
// Or ensure they are correctly imported from their respective modules
// Example structure if defined here:
function workInMines() {
    if (gameState.isWorkingMines || isInDebt()) return;
    gameState.isWorkingMines = true;
    updateButtonStates();
    addNotification("Started working in mines.", "start");
    const duration = 10000;
    setTimeout(() => {
         const outcomes = [
             { value: 150, message: "Found some copper worth $150!" }, // Buffed slightly
             { value: 600, message: "Found silver ore worth $600!" }, // Buffed slightly
             { value: 1200, message: "You found gold! Earned $1200!" }, // Buffed slightly
             { value: -200, message: "Minor injury in the mines. Medical bills: $200." },
             { value: getRandomInt(1000, 4000), message: "You found a rare gem!" }, // Range adjusted
             { value: 0, message: "Found a weird glowing rock. Probably worthless." },
             { value: -100, message: "Cave-in blocked the good veins. Lost $100 in wasted time." },
             { value: -399, message: "Your pickaxe broke! Replacement cost: $399" } // Changed reason
         ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let notificationType = 'info';
        if (outcome.value < 0) { gameState.moneyLost -= outcome.value; notificationType = 'finish-fail'; }
        else { gameState.moneyEarned += outcome.value; notificationType = 'finish-success'; }
        addNotification(`Finished mining. ${outcome.message} (${outcome.value >= 0 ? '+' : ''}$${outcome.value.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingMines = false;
        updateButtonStates();
    }, duration);
}

function workInOfficeJob() {
     if (gameState.isWorkingOffice || isInDebt()) return;
    gameState.isWorkingOffice = true;
    updateButtonStates(); // Disable office button, but allow dice
    addNotification("Started working in office.", "start");
    const duration = 7000;
    setTimeout(() => {
         const outcomes = [
            { value: 250, message: "Regular office work completed. Earned $250." }, // Buffed
            { value: 350, message: "Got a bonus for finishing early! Earned $350." }, // Buffed
            { value: 180, message: "Work was boring but pays the bills. Earned $180." }, // Buffed
            { value: 450, message: "Impressed the boss! Earned $450." }, // Buffed
            { value: -50, message: "Paper cut! Medical expense: $50." },
            { value: 0, message: "Spent the day 'synergizing paradigms'. No real pay." },
            { value: 50, message: "Organized the supply closet. Found $50." },
            // Identity theft seems too extreme, replaced
            { value: -100, message: "Computer crashed. Lost productivity. Docked $100 pay." },
            { value: 300, message: "Covered for a sick coworker. Got overtime pay $300." }
         ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let notificationType = 'info';
        if (outcome.value < 0) { gameState.moneyLost -= outcome.value; notificationType = 'finish-fail'; }
        else { gameState.moneyEarned += outcome.value; notificationType = 'finish-success'; }
        addNotification(`Finished office work. ${outcome.message} (${outcome.value >= 0 ? '+' : ''}$${outcome.value.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingOffice = false;
        updateButtonStates(); // Re-enable office button
    }, duration);
}

function workInStapleTables() {
     if (gameState.isWorkingStaples || isInDebt()) return;
    gameState.isWorkingStaples = true;
    updateButtonStates();
    addNotification("Started stapling tables.", "start");
    const duration = 5000;
    setTimeout(() => {
         const outcomes = [
            { value: 70, message: "You stapled 10 tables. Earned $70." }, // Buffed
            { value: 90, message: "Efficient stapling! $90." }, // Buffed
            { value: 120, message: "Staple Master! Earned $120." }, // Buffed
            { value: -10000, message: "Stapler exploded! Major injury & damages: $10000." }, // Nerfed loss
            { value: 200, message: "Found someone's lost wallet while stapling. Reward: $200!" },
            { value: 0, message: "Ran out of staples halfway through. No pay." },
            { value: -500, message: "Stapled your own hand by accident. Lost $500." }, // Added smaller loss
            { value: 150, message: "Finished early, helped unload the staple truck. Earned $150." },
         ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let notificationType = 'info';
        if (outcome.value < 0) { gameState.moneyLost -= outcome.value; notificationType = 'finish-fail'; }
        else { gameState.moneyEarned += outcome.value; notificationType = 'finish-success'; }
        addNotification(`Finished stapling. ${outcome.message} (${outcome.value >= 0 ? '+' : ''}$${outcome.value.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingStaples = false;
        updateButtonStates();
    }, duration);
}

function takeNap() {
     if (gameState.isTakingNap || isInDebt()) return;
    gameState.isTakingNap = true;
    updateButtonStates();
    addNotification("Taking a short nap.", "start");
    const duration = 5000;
    setTimeout(() => {
        gameState.nextRollChance = Math.random() < 0.5 ? "gain" : "lose"; // 50/50 chance
        const resultMessage = gameState.nextRollChance === "gain" ? "You feel rested." : "You had a weird dream.";
         addNotification(`Finished nap. ${resultMessage} Effect applies on next roll.`, "info");
        // Note: Actual money change happens in handleNextRoll()
        gameState.isTakingNap = false;
        updateButtonStates();
    }, duration);
}

// Define isInDebt before it's used
function isInDebt() {
  if (gameState.netMoney <= -100) {
     addNotification(gameState.netMoney <= -5000
      ? "DEBT WARNING: The IRS is watching! Pay debts before working!"
      : "DEBT WARNING: Close to bankruptcy. Cannot take on risky jobs.", "loss");
    return true;
  }
  return false;
}

// Define getRandomInt if not imported
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.addEventListener("load", initGame); // Start the game