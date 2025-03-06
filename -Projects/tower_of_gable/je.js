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

// Create a fixed message display element for user notifications
const messageDisplay = document.createElement("div");
messageDisplay.style.position = "fixed";
messageDisplay.style.top = "10px";
messageDisplay.style.left = "50%";
messageDisplay.style.transform = "translateX(-50%)";
messageDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
messageDisplay.style.color = "white";
messageDisplay.style.padding = "10px 20px";
messageDisplay.style.borderRadius = "5px";
messageDisplay.style.zIndex = "1000";
messageDisplay.style.display = "none";
document.body.appendChild(messageDisplay);

// Function to show a temporary message to the user
function showMessage(message, duration = 3000) {
  messageDisplay.textContent = message;
  messageDisplay.style.display = "block";
  if (messageTimeout) clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    messageDisplay.style.display = "none";
  }, duration);
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
    document.getElementById(id).disabled = anyWorkInProgress;
  });
  // Commit button is enabled only when dice have been rolled and no work is active
  document.getElementById("commit-btn").disabled = (anyWorkInProgress || dice.length === 0);
}

// Function to roll 4 dice and update game stats
function rollDice() {
  // Prevent new roll if any work is in progress
  if (workInProgress || officeWorkInProgress || stapleWorkInProgress || napWorkInProgress) return;

  // If a nap effect is active, process its impact on the next roll
  if (nextRollChance) {
    handleNextRoll();
  }

  // Roll 4 dice and update roll count
  dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  totalRolls++;
  alreadyCounted = false;
  document.getElementById("dice-rolls").textContent = dice.join(", ");
  document.getElementById("total-rolls").textContent = totalRolls;

  calculateBonus();
  updateTotalPoints();
  updateMoneyDisplay();

  // Adjust net money: subtract $1 per roll
  netMoney -= 1;
  updateButtonStates();
}

// Calculate bonus points based on dice matches and runs
function calculateBonus() {
  const counts = {};
  let roundBonus = 0;
  dice.forEach(num => counts[num] = (counts[num] || 0) + 1);
  let hasMatch = false;
  Object.values(counts).forEach(count => {
    if (count > 1) {
      roundBonus += count - 1;
      hasMatch = true;
    }
  });
  // Check for consecutive numbers (run) in sorted dice array
  dice.sort((a, b) => a - b);
  let runLength = 1;
  for (let i = 1; i < dice.length; i++) {
    if (dice[i] === dice[i - 1] + 1) {
      runLength++;
      if (runLength > 2) {
        roundBonus++;
      }
    } else {
      runLength = 1;
    }
  }
  // Update bonus points if any match or run found; otherwise reset to 0
  bonusPoints = (!hasMatch && runLength === 1) ? 0 : bonusPoints + roundBonus;
  document.getElementById("bonus-points").textContent = bonusPoints;
}

// Compute and display total points (dice sum plus bonus)
function updateTotalPoints() {
  const totalPoints = dice.reduce((a, b) => a + b, 0) + bonusPoints;
  document.getElementById("total-points").textContent = totalPoints;

  // If total points equal 24 and commit hasn’t been registered, count as a missed win
  if (totalPoints === 24 && !alreadyCounted) {
    missedWins++;
    moneyLost += 500;
    document.getElementById("missed-wins").textContent = missedWins;
    showMessage("Claim your win, or lose $500 by not committing! (not scam, wink wink.)");
    alreadyCounted = true;
  }
  updateMoneyDisplay();
}

// Update money display based on current game stats
function updateMoneyDisplay() {
  netMoney = moneyEarned - moneyLost - totalRolls;
  document.getElementById("money-earned").textContent = moneyEarned;
  document.getElementById("money-lost").textContent = moneyLost;
  document.getElementById("net-money").textContent = netMoney;
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
    document.getElementById("wins").textContent = wins;
    showMessage(`You win! Streak: ${consecutiveWins}x. Earned $${winnings}`);
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
  document.getElementById("dice-rolls").textContent = "-";
  document.getElementById("bonus-points").textContent = "0";
  document.getElementById("total-points").textContent = "-";
  updateButtonStates();
}

// Function to simulate working in the mines with a progress bar effect
function workInMines() {
  if (workInProgress || netMoney <= -100) {
    if (netMoney <= -10000) showMessage("The IRS invoked taxes. You need to pay your debts before working!");
    return;
  }
  workInProgress = true;
  updateButtonStates();
  showMessage("Working in the mines...", 10000);
  const loadingBar = document.createElement("div");
  loadingBar.style.height = "10px";
  loadingBar.style.backgroundColor = "#f00";
  loadingBar.style.transition = "width 10s linear";
  loadingBar.style.width = "0%";
  document.body.appendChild(loadingBar);
  setTimeout(() => loadingBar.style.width = "100%", 0);
  setTimeout(() => {
    // Random outcomes for working in the mines
    const outcomes = [
      { value: 0, message: "You found nothing in the mines today." },
      { value: 100, message: "You found some copper worth $100!" },
      { value: 500, message: "You found silver ore worth $500!" },
      { value: 1000, message: "You found gold! Earned $1000!" },
      { value: -200, message: "Minor injury in the mines. Medical bills: $200." },
      { value: getRandomInt(1000, 5000), message: "You found a rare gem!" },
      {value: 0, message:"You found your sence of humur! Its a small rug. Net $0"},
      {value: -100, message:"You found a highly valuable relic lost to time. IRS takes it. Lose $100 because of shipping costs."}
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
    loadingBar.remove();
  }, 10000);
}

// Similar work functions for office work, stapling tables, and napping follow the same pattern...
// They disable buttons, display a progress bar, update money earned or lost, and then re-enable controls.

// Handle nap effect for bonus or penalty on the next roll
function takeNap() {
  if (napWorkInProgress || netMoney <= -100) {
    if (netMoney <= -10000) showMessage("The IRS invoked taxes. You need to pay your debts before napping!");
    return;
  }
  napWorkInProgress = true;
  updateButtonStates();
  showMessage("Taking a nap...", 5000);
  const loadingBar = document.createElement("div");
  loadingBar.style.height = "10px";
  loadingBar.style.backgroundColor = "#ff0";
  loadingBar.style.transition = "width 5s linear";
  loadingBar.style.width = "0%";
  document.body.appendChild(loadingBar);
  setTimeout(() => loadingBar.style.width = "100%", 0);
  setTimeout(() => {
    nextRollChance = Math.random() < 0.5 ? "gain" : "lose";
    const resultMessage = nextRollChance === "gain" ? 
      "You had a good dream!" : 
      "You had a nightmare!";
    showMessage(resultMessage);
    napWorkInProgress = false;
    updateButtonStates();
    loadingBar.remove();
  }, 5000);
}

// Apply the nap effect on the next roll
function handleNextRoll() {
  if (nextRollChance === "gain") {
    const gainAmount = Math.abs(netMoney) * 0.77;
    moneyEarned += gainAmount;
    showMessage(`Dream bonus! Earned $${gainAmount.toFixed(2)}`);
  } else if (nextRollChance === "lose") {
    const lossAmount = Math.abs(netMoney) * 0.77;
    moneyLost += lossAmount;
    showMessage(`Nightmare penalty! Lost $${lossAmount.toFixed(2)}`);
  }
  nextRollChance = null;
}

// Utility to generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Periodically check for bankruptcy
function checkBankruptcy() {
  if (netMoney <= -1000) {
    showMessage("BANKRUPTCY! Game over. Refresh to start again.", 0);
    document.querySelectorAll("button").forEach(btn => btn.disabled = true);
  }
}

// Initialize game: attach event listeners and show welcome message
function initGame() {
  updateButtonStates();
  document.getElementById("roll-dice-btn").addEventListener("click", rollDice);
  document.getElementById("commit-btn").addEventListener("click", commit);
  document.getElementById("work-in-mines-btn").addEventListener("click", workInMines);
  document.getElementById("work-in-office-btn").addEventListener("click", workInOfficeJob);
  document.getElementById("work-staple-tables-btn").addEventListener("click", workInStapleTables);
  document.getElementById("take-nap-btn").addEventListener("click", takeNap);
  document.getElementById("commit-btn").disabled = true;
  setInterval(checkBankruptcy, 1000);
  showMessage("Welcome to the Tower of Gable", 5000);
}

// Set up the game on page load
window.addEventListener("load", initGame);
