// je.js
// Global game state variables
let wins = 0;
let consecutiveWins = 0;
let missedWins = 0;
let bonusPoints = 0;
let totalRolls = 0;
let moneyEarned = 0;
let moneyLost = 0;
let netMoney = 0;
let dice = [];
let alreadyCounted = false;
let workInProgress = false;
let officeWorkInProgress = false;
let stapleWorkInProgress = false; 
let napWorkInProgress = false;
let nextRollChance = null;
let messageTimeout = null;

// DOM elements for status display
const statusBox = document.getElementById("status-box");
const statusMessage = document.getElementById("status-message");
const progressBar = document.getElementById("progress-bar");

// Create a fixed message display element for user notifications
const messageDisplay = document.createElement("div");
messageDisplay.id = "message-display";
document.body.appendChild(messageDisplay);

// Function to show a temporary message to the user
function showMessage(message, duration = 3000) {
  if (!message) return;
  
  messageDisplay.textContent = message;
  messageDisplay.style.display = "block";
  
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
  
  if (duration > 0) {
    messageTimeout = setTimeout(() => {
      messageDisplay.style.display = "none";
    }, duration);
  }
}

// Helper function to safely update element text content
function updateElementText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  } else {
    console.error(`Element with ID "${id}" not found`);
  }
}

// Update the enabled/disabled state of buttons based on game actions
function updateButtonStates() {
  const anyWorkInProgress = workInProgress || officeWorkInProgress || stapleWorkInProgress || napWorkInProgress;
  const buttons = [
    "roll-dice-btn", 
    "commit-btn", 
    "work-in-mines-btn", 
    "work-in-office-btn", 
    "work-staple-tables-btn", 
    "take-nap-btn"
  ];
  
  buttons.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.disabled = anyWorkInProgress;
    }
  });
  
  // Commit button is enabled only when dice have been rolled and no work is active
  const commitBtn = document.getElementById("commit-btn");
  if (commitBtn) {
    commitBtn.disabled = (anyWorkInProgress || dice.length === 0);
  }
  
  // Update status box visibility
  if (statusBox) {
    statusBox.style.display = anyWorkInProgress ? "block" : "none";
    if (anyWorkInProgress) {
      statusMessage.textContent = "Working...";
    } else {
      statusMessage.textContent = "Idle";
    }
  }
}

// Function to start a work progress bar
function startProgressBar(duration) {
  if (!progressBar) return;
  
  progressBar.style.width = "0%";
  progressBar.style.transition = `width ${duration}ms linear`;
  
  // Force reflow before setting width to 100%
  void progressBar.offsetWidth;
  
  progressBar.style.width = "100%";
}

// Function to roll 4 dice and update game stats
function rollDice() {
  // Prevent new roll if any work is in progress
  if (workInProgress || officeWorkInProgress || stapleWorkInProgress || napWorkInProgress) {
    return;
  }

  // If a nap effect is active, process its impact on the next roll
  if (nextRollChance) {
    handleNextRoll();
  }

  // Roll 4 dice and update roll count
  dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  totalRolls++;
  alreadyCounted = false;
  
  updateElementText("dice-rolls", dice.join(", "));
  updateElementText("total-rolls", totalRolls);

  calculateBonus();
  updateTotalPoints();
  updateMoneyDisplay();

  // Adjust net money: subtract $1 per roll
  netMoney -= 1;
  updateButtonStates();
}

// Calculate bonus points based on dice matches and runs
function calculateBonus() {
  if (dice.length === 0) return;

  const counts = {};
  let roundBonus = 0;
  
  // Count occurrences of each die value
  dice.forEach(num => {
    counts[num] = (counts[num] || 0) + 1;
  });
  
  let hasMatch = false;
  
  // Calculate bonus for repeated numbers
  Object.values(counts).forEach(count => {
    if (count > 1) {
      roundBonus += count - 1;
      hasMatch = true;
    }
  });
  
  // Check for consecutive numbers (run) in sorted dice array
  const sortedDice = [...dice].sort((a, b) => a - b);
  let maxRunLength = 1;
  let currentRunLength = 1;
  
  for (let i = 1; i < sortedDice.length; i++) {
    if (sortedDice[i] === sortedDice[i - 1] + 1) {
      currentRunLength++;
      maxRunLength = Math.max(maxRunLength, currentRunLength);
    } else if (sortedDice[i] !== sortedDice[i - 1]) {
      // Only reset run length if not the same number
      currentRunLength = 1;
    }
  }
  
  // Add bonus points for runs of 3 or more
  if (maxRunLength >= 3) {
    roundBonus += maxRunLength - 2;
  }
  
  // Update bonus points if any match or run found; otherwise reset to 0
  bonusPoints = (!hasMatch && maxRunLength < 3) ? 0 : bonusPoints + roundBonus;
  updateElementText("bonus-points", bonusPoints);
}

// Compute and display total points (dice sum plus bonus)
function updateTotalPoints() {
  if (dice.length === 0) {
    updateElementText("total-points", "-");
    return;
  }
  
  const totalPoints = dice.reduce((a, b) => a + b, 0) + bonusPoints;
  updateElementText("total-points", totalPoints);

  // If total points equal 24 and commit hasn't been registered, count as a missed win
  if (totalPoints === 24 && !alreadyCounted) {
    missedWins++;
    moneyLost += 500;
    updateElementText("missed-wins", missedWins);
    showMessage("Claim your win, or lose $500 by not committing! (not scam, wink wink.)");
    alreadyCounted = true;
  }
  
  updateMoneyDisplay();
}

// Update money display based on current game stats
function updateMoneyDisplay() {
  netMoney = moneyEarned - moneyLost - totalRolls;
  
  updateElementText("money-earned", moneyEarned.toFixed(2));
  updateElementText("money-lost", moneyLost.toFixed(2));
  updateElementText("net-money", netMoney.toFixed(2));
}

// Commit current roll: win if total points equal 24, otherwise lose money
function commit() {
  if (dice.length === 0) {
    showMessage("Roll the dice first!");
    return;
  }
  
  const totalPoints = dice.reduce((a, b) => a + b, 0) + bonusPoints;
  
  if (totalPoints === 24) {
    consecutiveWins++;
    const winnings = 1500 * consecutiveWins;
    moneyEarned += winnings;
    wins++;
    updateElementText("wins", wins);
    showMessage(`You win! Streak: ${consecutiveWins}x. Earned $${winnings.toFixed(2)}`);
  } else {
    moneyLost += 100;
    consecutiveWins = 0;
    showMessage("Gable Failed, lost $100. Total does not equal 24.");
  }
  
  updateMoneyDisplay();
  resetGame();
}

// Reset dice and bonus for the next round
function resetGame() {
  dice = [];
  bonusPoints = 0;
  updateElementText("dice-rolls", "-");
  updateElementText("bonus-points", "0");
  updateElementText("total-points", "-");
  updateButtonStates();
}

// Utility to generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to simulate working in the mines with a progress bar effect
function workInMines() {
  if (workInProgress || isInDebt()) return;
  
  workInProgress = true;
  updateButtonStates();
  showMessage("Working in the mines...", 10000);
  
  // Use the integrated progress bar
  startProgressBar(10000);
  
  setTimeout(() => {
    // Random outcomes for working in the mines
    const outcomes = [
      { value: 0, message: "You found nothing in the mines today." },
      { value: 100, message: "You found some copper worth $100!" },
      { value: 500, message: "You found silver ore worth $500!" },
      { value: 1000, message: "You found gold! Earned $1000!" },
      { value: -200, message: "Minor injury in the mines. Medical bills: $200." },
      { value: getRandomInt(1000, 5000), message: "You found a rare gem!" },
      { value: 0, message:"You found your sense of humor! It's a small rug. Net $0" },
      { value: -100, message:"You found a highly valuable relic lost to time. IRS takes it. Lose $100 because of shipping costs." },
      { value: -399, message:"You burned your arm hair on your lantern. Your coworker sued you because of the smell. Lose $399"}
    ];
    
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    if (outcome.value < 0) {
      moneyLost -= outcome.value; // Convert negative to positive for moneyLost
    } else {
      moneyEarned += outcome.value;
    }
    
    showMessage(outcome.message);
    updateMoneyDisplay();
    workInProgress = false;
    updateButtonStates();
  }, 10000);
}

// Function to simulate working in an office
function workInOfficeJob() {
  if (officeWorkInProgress || isInDebt()) return;
  
  officeWorkInProgress = true;
  updateButtonStates();
  showMessage("Working in the office...", 7000);
  
  startProgressBar(7000);
  
  setTimeout(() => {
    // Random outcomes for office work
    const outcomes = [
      { value: 200, message: "Regular office work completed. Earned $200." },
      { value: 300, message: "Got a bonus for finishing early! Earned $300." },
      { value: 150, message: "Work was boring but pays the bills. Earned $150." },
      { value: 400, message: "Impressed the boss! Earned $400." },
      { value: -50, message: "Paper cut! Medical expense: $50." },
      { value: 0, message: "Your coworker took credit for your work. No pay today." },
      { value: 1, message: "Maybe you could get something at the dollar store? gain one hundred pennys."},
      { value: 5000, message: "Your coworker left his ID and SSN on the table. Identity theft WORKED. Gain $5000" },
      { value: 10000, message: "Your coworker left his ID and SSN on the table. Identity theft FAILED. Lost $10000" },
    ];
    
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    if (outcome.value < 0) {
      moneyLost -= outcome.value;
    } else {
      moneyEarned += outcome.value;
    }
    
    showMessage(outcome.message);
    updateMoneyDisplay();
    officeWorkInProgress = false;
    updateButtonStates();
  }, 7000);
}

// Function to simulate stapling tables
function workInStapleTables() {
  if (stapleWorkInProgress || isInDebt()) return;
  
  stapleWorkInProgress = true;
  updateButtonStates();
  showMessage("Stapling tables...", 5000);
  
  startProgressBar(5000);
  
  setTimeout(() => {
    // Random outcomes for stapling tables
    const outcomes = [
      { value: 50, message: "You stapled 10 tables. Earned $50." },
      { value: 75, message: "Stapling tables. $75." },
      { value: 100, message: "Not a failure! Earned $100." },
      { value: -25000, message: "Stapler jammed and hurt your finger. Medical expense: $25000." },
      { value: 200, message: "Found someone's lost wallet while stapling. They gave you $200 reward!" },
      { value: 350, message: "Found someone's lost wallet while stapling. You kept it, $350." },
      { value: 0, message: "The tables were already stapled. No pay today." },
      {value: -1000, message: "Nearly Fired. Charged 1000 Dollour bucks."},
      { value: 1000, message: "You found a mouse! Supper for all! (+$1000)"},
      { value: -200, message: "Lost grandma's spare teeth, -200."},
      
    ];
    
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    if (outcome.value < 0) {
      moneyLost -= outcome.value;
    } else {
      moneyEarned += outcome.value;
    }
    
    showMessage(outcome.message);
    updateMoneyDisplay();
    stapleWorkInProgress = false;
    updateButtonStates();
  }, 5000);
}

// Helper function to check if player is in serious debt
function isInDebt() {
  if (netMoney <= -100) {
    showMessage(netMoney <= -5000
      ? "The IRS will take your assets! You need to pay your debts before re-entering the workforce!"
      : "You are close to bankrupsy.");
    return true;
  }
  return false;
}

// Handle nap effect for bonus or penalty on the next roll
function takeNap() {
  if (napWorkInProgress || isInDebt()) return;
  
  napWorkInProgress = true;
  updateButtonStates();
  showMessage("Taking a nap...", 5000);
  
  startProgressBar(5000);
  
  setTimeout(() => {
    // 50% chance of good dream vs nightmare
    nextRollChance = Math.random() < 0.5 ? "gain" : "lose";
    
    const resultMessage = nextRollChance === "gain" 
      ? "Well Rested" 
      : "Poor Nap";
    
    showMessage(resultMessage);
    napWorkInProgress = false;
    updateButtonStates();
  }, 5000);
}

// Apply the nap effect on the next roll
function handleNextRoll() {
  // Calculate effect based on net money but ensure it's a reasonable amount
  const baseAmount = Math.min(Math.abs(netMoney), 1000);
  const effectAmount = baseAmount * 0.15;
  
  if (nextRollChance === "gain") {
    const gainAmount = effectAmount + 50;
    moneyEarned += gainAmount;
    showMessage(`You are Well Rested. Earned $${gainAmount.toFixed(2)}`);
  } else if (nextRollChance === "lose") {
    const lossAmount = effectAmount + 50;
    moneyLost += lossAmount;
    showMessage(`A poor nap! Lost $${lossAmount.toFixed(2)}`);
  }
  
  nextRollChance = null;
}

// Periodically check for bankruptcy
function checkBankruptcy() {
  if (netMoney <= -10000) {
    showMessage("BANKRUPTCY! The IRS took all your assets remaining. Refresh page to start again.", 0);
    document.querySelectorAll("button").forEach(btn => btn.disabled = true);
  }
}

// Save game state to localStorage
function saveGame() {
  const gameState = {
    wins,
    consecutiveWins,
    missedWins,
    totalRolls,
    moneyEarned,
    moneyLost,
    netMoney
  };
  
  try {
    localStorage.setItem('towerOfGableData', JSON.stringify(gameState));
  } catch (e) {
    console.error("Could not save game state:", e);
  }
}

// Load game state from localStorage
function loadGame() {
  try {
    const savedData = localStorage.getItem('towerOfGableData');
    if (savedData) {
      const gameState = JSON.parse(savedData);
      
      wins = gameState.wins || 0;
      consecutiveWins = gameState.consecutiveWins || 0;
      missedWins = gameState.missedWins || 0;
      totalRolls = gameState.totalRolls || 0;
      moneyEarned = gameState.moneyEarned || 0;
      moneyLost = gameState.moneyLost || 0;
      netMoney = gameState.netMoney || 0;
      
      updateElementText("wins", wins);
      updateElementText("missed-wins", missedWins);
      updateElementText("total-rolls", totalRolls);
      updateMoneyDisplay();
      
      showMessage("Game loaded from previous session", 3000);
    }
  } catch (e) {
    console.error("Could not load saved game:", e);
  }
}

// Initialize game: attach event listeners and show welcome message
function initGame() {
  // Try to load saved game
  loadGame();
  
  // Set up event listeners
  const buttonMappings = {
    "roll-dice-btn": rollDice,
    "commit-btn": commit,
    "work-in-mines-btn": workInMines,
    "work-in-office-btn": workInOfficeJob,
    "work-staple-tables-btn": workInStapleTables,
    "take-nap-btn": takeNap
  };
  
  Object.entries(buttonMappings).forEach(([id, func]) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("click", func);
    } else {
      console.error(`Button with ID "${id}" not found`);
    }
  });
  
  updateButtonStates();
  
  // Save game every minute
  setInterval(saveGame, 60000);
  
  // Check for bankruptcy every second
  setInterval(checkBankruptcy, 1000);
  
  showMessage("Welcome to the Tower of Gable", 5000);
}

// Set up the game on page load
window.addEventListener("load", initGame);