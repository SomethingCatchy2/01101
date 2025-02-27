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
let napWorkInProgress = false; // Track if the "Take Nap" job is in progress
let nextRollChance = null; // Store the nap result (gain or lose money)

function rollDice() {
  if (workInProgress || officeWorkInProgress || stapleWorkInProgress || napWorkInProgress) {
    return; // Prevent rolling if the player is working in any job
  }

  dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  totalRolls++;
  alreadyCounted = false;
  document.getElementById("dice-rolls").textContent = dice.join(", ");
  document.getElementById("total-rolls").textContent = totalRolls;

  calculateBonus();
  updateTotalPoints();
  updateMoneyDisplay();

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
  const totalPoints = dice.reduce((a, b) => a + b, 0) + bonusPoints;

  if (totalPoints === 24) {
    consecutiveWins++;
    let multiplier = consecutiveWins;
    let winnings = 1500 * multiplier; 
    moneyEarned += winnings;
    wins++;
    document.getElementById("wins").textContent = wins;
    console.log(`You win! Streak: ${consecutiveWins}x. Earned $${winnings}`);
  } else {
    moneyLost += 100;
    consecutiveWins = 0; 
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
}

function workInMines() {
  if (workInProgress || netMoney <= -100) {
    return;
  }

  workInProgress = true;

  const rollButton = document.querySelector("button[onclick='rollDice()']");
  rollButton.disabled = true;

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
    const outcomes = [0, 100, 1000, 10, 75, getRandomInt(-10000, 40000)];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    if (outcome < 0) {
      console.log(`You fell victim to a cave-in! Hospital bills: $${Math.abs(outcome)}`);
    } else {
      console.log(`You found a rare gem worth $${outcome}`);
    }

    moneyEarned += outcome;
    updateMoneyDisplay();
    workInProgress = false;
    rollButton.disabled = false;
    loadingBar.style.width = "100%";
    setTimeout(() => loadingBar.remove(), 1000);
  }, 10000);
}

function workInOfficeJob() {
  if (officeWorkInProgress || netMoney <= -100) {
    return;
  }

  officeWorkInProgress = true;

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
    updateMoneyDisplay();
    officeWorkInProgress = false;
    loadingBar.style.width = "100%";
    setTimeout(() => loadingBar.remove(), 1000);
  }, 7000); // Duration for office work
}

function workInStapleTables() {
  if (stapleWorkInProgress || netMoney <= -100) {
    return;
  }

  stapleWorkInProgress = true;

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
    updateMoneyDisplay();
    stapleWorkInProgress = false;
    loadingBar.style.width = "100%";
    setTimeout(() => loadingBar.remove(), 1000);
  }, 5000); // Duration for stapling tables
}

function takeNap() {
  if (napWorkInProgress || netMoney <= -100) {
    return;
  }

  napWorkInProgress = true;

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
    nextRollChance = Math.random() < 0.5 ? "gain" : "lose"; // 50% chance to gain or lose 77% of money
    napWorkInProgress = false;
    loadingBar.style.width = "100%";
    setTimeout(() => loadingBar.remove(), 1000);
  }, 5000); // Duration for taking nap
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleNextRoll() {
  if (nextRollChance === "gain") {
    const gainAmount = netMoney * 0.77;
    moneyEarned += gainAmount;
    console.log(`You gained 77% of your money! Earned $${gainAmount}`);
  } else if (nextRollChance === "lose") {
    const lossAmount = netMoney * 0.77;
    moneyLost += lossAmount;
    console.log(`You lost 77% of your money! Lost $${lossAmount}`);
  }
  nextRollChance = null; // Reset for the next roll
}
// Event listener setup for buttons
document.getElementById("roll-dice-btn").addEventListener("click", rollDice);
document.getElementById("commit-btn").addEventListener("click", commit);
document.getElementById("work-in-mines-btn").addEventListener("click", workInMines);
document.getElementById("work-in-office-btn").addEventListener("click", workInOfficeJob);
document.getElementById("work-staple-tables-btn").addEventListener("click", workInStapleTables);
document.getElementById("take-nap-btn").addEventListener("click", takeNap);

// Roll Dice, Work in Mines, Office Job, Staple Tables, Take Nap, and Commit functions remain unchanged
