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

// Create a message display element
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

// Show message to user
function showMessage(message, duration = 3000) {
  messageDisplay.textContent = message;
  messageDisplay.style.display = "block";
  
  // Clear any existing timeout
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
  
  // Set timeout to hide message
  messageTimeout = setTimeout(() => {
    messageDisplay.style.display = "none";
  }, duration);
}

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
  
  // Enable commit button only when dice have been rolled and no work is in progress
  document.getElementById("commit-btn").disabled = (anyWorkInProgress || dice.length === 0);
}

function rollDice() {
  if (workInProgress || officeWorkInProgress || stapleWorkInProgress || napWorkInProgress) {
    return;
  }

  // Handle nap effect if active
  if (nextRollChance) {
    handleNextRoll();
  }

  dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  totalRolls++;
  alreadyCounted = false;
  document.getElementById("dice-rolls").textContent = dice.join(", ");
  document.getElementById("total-rolls").textContent = totalRolls;

  calculateBonus();
  updateTotalPoints();
  updateMoneyDisplay();
  updateButtonStates();

  // Subtract $1 for each roll
  netMoney -= 1;
}

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

  dice.sort((a, b) => a - b);
  let runLength = 1;
  let hasRun = false;
  for (let i = 1; i < dice.length; i++) {
    if (dice[i] === dice[i - 1] + 1) {
      runLength++;
      if (runLength > 2) {
        roundBonus++;
        hasRun = true;
      }
    } else {
      runLength = 1;
    }
  }

  if (!hasMatch && !hasRun) {
    bonusPoints = 0;
  } else {
    bonusPoints += roundBonus;
  }
  document.getElementById("bonus-points").textContent = bonusPoints;
}

function updateTotalPoints() {
  const totalPoints = dice.reduce((a, b) => a + b, 0) + bonusPoints;
  document.getElementById("total-points").textContent = totalPoints;

  // Update money and other variables
  const equation = dice.join(" + ") + " + " + bonusPoints + " = " + totalPoints;
  if (totalPoints === 24 && !alreadyCounted) {
    missedWins++;
    moneyLost += 500;
    document.getElementById("missed-wins").textContent = missedWins;
    showMessage("Missed Win! Lost $500 by not committing!");
    alreadyCounted = true;
  }
  updateMoneyDisplay();
}

function updateMoneyDisplay() {
  netMoney = moneyEarned - moneyLost - totalRolls;
  document.getElementById("money-earned").textContent = moneyEarned;
  document.getElementById("money-lost").textContent = moneyLost;
  document.getElementById("net-money").textContent = netMoney;
}

function commit() {
  if (dice.length === 0) {
    showMessage("Roll the dice first!");
    return;
  }
  
  const totalPoints = dice.reduce((a, b) => a + b, 0) + bonusPoints;

  if (totalPoints === 24) {
    consecutiveWins++;
    let multiplier = consecutiveWins;
    let winnings = 1500 * multiplier; 
    moneyEarned += winnings;
    wins++;
    document.getElementById("wins").textContent = wins;
    showMessage(`You win! Streak: ${consecutiveWins}x. Earned $${winnings}`);
  } else {
    moneyLost += 100;
    consecutiveWins = 0;
    showMessage(`Wrong! Lost $100. Total does not equal 24.`);
  }
  updateMoneyDisplay();
  resetGame();
}

function resetGame() {
  dice = [];
  bonusPoints = 0;
  document.getElementById("dice-rolls").textContent = "-";
  document.getElementById("bonus-points").textContent = "0";
  document.getElementById("total-points").textContent = "-";
  updateButtonStates();
}

// Using original loading bar style
function workInMines() {
  if (workInProgress || netMoney <= -100) {
    if (netMoney <= -100) {
      showMessage("You need to pay your debts before working!");
    }
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

  setTimeout(() => {
    loadingBar.style.width = "100%";
  }, 0);

  setTimeout(() => {
    // More balanced outcomes
    const outcomes = [
      { value: 0, message: "You found nothing in the mines today." },
      { value: 100, message: "You found some copper worth $100!" },
      { value: 500, message: "You found silver ore worth $500!" },
      { value: 1000, message: "You found gold! Earned $1000!" },
      { value: -200, message: "Minor injury in the mines. Medical bills: $200." },
      { value: getRandomInt(1000, 5000), message: "You found a rare gem!" }
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

function workInOfficeJob() {
  if (officeWorkInProgress || netMoney <= -100) {
    if (netMoney <= -100) {
      showMessage("You need to pay your debts before working!");
    }
    return;
  }

  officeWorkInProgress = true;
  updateButtonStates();
  showMessage("Working in the office...", 7000);

  const loadingBar = document.createElement("div");
  loadingBar.style.height = "10px";
  loadingBar.style.backgroundColor = "#00f";
  loadingBar.style.transition = "width 7s linear";
  loadingBar.style.width = "0%";
  document.body.appendChild(loadingBar);

  setTimeout(() => {
    loadingBar.style.width = "100%";
  }, 0);

  setTimeout(() => {
    moneyEarned += 5;
    showMessage("Office work complete. Earned $5");
    updateMoneyDisplay();
    officeWorkInProgress = false;
    updateButtonStates();
    loadingBar.remove();
  }, 7000);
}

function workInStapleTables() {
  if (stapleWorkInProgress || netMoney <= -100) {
    if (netMoney <= -100) {
      showMessage("You need to pay your debts before working!");
    }
    return;
  }

  stapleWorkInProgress = true;
  updateButtonStates();
  showMessage("Stapling tables...", 5000);

  const loadingBar = document.createElement("div");
  loadingBar.style.height = "10px";
  loadingBar.style.backgroundColor = "#0f0";
  loadingBar.style.transition = "width 5s linear";
  loadingBar.style.width = "0%";
  document.body.appendChild(loadingBar);

  setTimeout(() => {
    loadingBar.style.width = "100%";
  }, 0);

  setTimeout(() => {
    moneyEarned += 10;
    showMessage("Tables stapled successfully. Earned $10");
    updateMoneyDisplay();
    stapleWorkInProgress = false;
    updateButtonStates();
    loadingBar.remove();
  }, 5000);
}

function takeNap() {
  if (napWorkInProgress || netMoney <= -100) {
    if (netMoney <= -100) {
      showMessage("You need to pay your debts before napping!");
    }
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

  setTimeout(() => {
    loadingBar.style.width = "100%";
  }, 0);

  setTimeout(() => {
    nextRollChance = Math.random() < 0.5 ? "gain" : "lose";
    const resultMessage = nextRollChance === "gain" ? 
      "You had a good dream! Next roll will give you 77% more money!" : 
      "You had a nightmare! Next roll will cost you 77% of your money!";
    showMessage(resultMessage);
    napWorkInProgress = false;
    updateButtonStates();
    loadingBar.remove();
  }, 5000);
}

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
  nextRollChance = null; // Reset for the next roll
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if player is bankrupt
function checkBankruptcy() {
  if (netMoney <= -1000) {
    showMessage("BANKRUPTCY! Game over. Refresh to start again.", 0);
    document.querySelectorAll("button").forEach(btn => btn.disabled = true);
  }
}

// Initialize the game
function initGame() {
  updateButtonStates();
  
  // Add event listeners
  document.getElementById("roll-dice-btn").addEventListener("click", rollDice);
  document.getElementById("commit-btn").addEventListener("click", commit);
  document.getElementById("work-in-mines-btn").addEventListener("click", workInMines);
  document.getElementById("work-in-office-btn").addEventListener("click", workInOfficeJob);
  document.getElementById("work-staple-tables-btn").addEventListener("click", workInStapleTables);
  document.getElementById("take-nap-btn").addEventListener("click", takeNap);
  
  // Start with the commit button disabled
  document.getElementById("commit-btn").disabled = true;
  
  // Check bankruptcy on any update
  setInterval(checkBankruptcy, 1000);
  
  // Welcome message
  showMessage("Welcome to the Work Simulation Game!", 5000);
}

// Initialize the game when the page loads
window.addEventListener("load", initGame);