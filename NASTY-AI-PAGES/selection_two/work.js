let officeWorkInProgress = false;
let workInProgress = false;
let moneyEarned = 0; // Global variable for money
let netMoney = 0;

function workInMines() {
    if (workInProgress || moneyEarned <= -100) return; // Prevent work if already working or low money

    workInProgress = true;

    // Simulate mining job, update the money earned after the work
    setTimeout(() => {
        let randomOutcome = Math.random();
        if (randomOutcome < 0.2) {
            alert("You found nothing in the mines.");
        } else if (randomOutcome < 0.4) {
            moneyEarned += 100;
            alert("You found a small gem worth $100.");
        } else if (randomOutcome < 0.59) {
            moneyEarned += 1000;
            alert("You found a large gem worth $1000!");
        } else if (randomOutcome < 0.79) {
            moneyEarned += 10;
            alert("You found a small gem worth $10.");
        } else if (randomOutcome < 0.99) {
            moneyEarned += 75;
            alert("You found a rare gem worth $75.");
        } else {
            let randomMoney = Math.floor(Math.random() * (40000 - (-10000) + 1)) + (-10000);
            moneyEarned += randomMoney;
            if (randomMoney < 0) {
                alert("A cave-in occurred! You have hospital bills to pay: " + randomMoney);
            } else {
                alert("You found a rare gem worth $" + randomMoney);
            }
        }

        // Update the money display
        updateMoneyDisplay();
        workInProgress = false;
        netMoney += moneyEarned;
        updateNetMoneyDisplay();
    }, 10000); // 10 seconds of work
}

function workInOfficeJob() {
    if (officeWorkInProgress || moneyEarned <= -100) return; // Prevent work if already working or low money

    officeWorkInProgress = true;

    // Simulate office job, update the money earned after the work
    setTimeout(() => {
        moneyEarned += 5;
        updateMoneyDisplay();
        officeWorkInProgress = false;
        netMoney += 5;
        updateNetMoneyDisplay();
    }, 7000); // 7 seconds of work
}

function updateMoneyDisplay() {
    document.getElementById("money-earned").textContent = moneyEarned;
}

function updateNetMoneyDisplay() {
    document.getElementById("net-money").textContent = netMoney;
}
