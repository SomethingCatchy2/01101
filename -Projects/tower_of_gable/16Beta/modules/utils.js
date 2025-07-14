// --- Content from utils.js ---
export function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

export function showMessage(message, duration = 3000) {
    const messageElement = document.getElementById("message");
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.display = "block";
        setTimeout(() => {
            messageElement.style.display = "none";
        }, duration);
    }
}

export function addNotification(message, type = 'info') {
    const log = document.getElementById("log");
    if (!log) return;

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    log.appendChild(notification);

    // Scroll to the bottom
    log.scrollTop = log.scrollHeight;

    // Limit the number of notifications
    const MAX_VISIBLE_NOTIFICATIONS = 100; // Keep a good amount of history
    while (log.children.length > MAX_VISIBLE_NOTIFICATIONS) {
        log.removeChild(log.firstChild);
    }
}

export function checkBankruptcy() {
    if (gameState.netMoney <= -500) {
        document.getElementById("main-content").style.display = "none";
        document.getElementById("bankruptcy-screen").style.display = "block";
        addNotification("You have declared bankruptcy!", "loss");
        return true;
    }
    return false;
}

export function updateMoneyDisplay() {
    const netMoney = gameState.moneyEarned - gameState.moneyLost;
    gameState.netMoney = netMoney; // Update the global state
    updateElementText("money-earned", gameState.moneyEarned.toFixed(2));
    updateElementText("money-lost", gameState.moneyLost.toFixed(2));
    updateElementText("net-money", netMoney.toFixed(2));
    checkBankruptcy();
    updateButtonStates(); // Update button states whenever money changes
}

export function isInSignificantDebt() {
    const inDebt = gameState.netMoney < 0;
    if (inDebt) {
        addNotification("You are in debt! Most actions are unavailable.", "loss");
    }
    return inDebt;
}

export function updateButtonStates() {
    // Gable buttons
    document.getElementById('roll-dice-btn').disabled = gameState.isWorking || gameState.isSleepingHobby || gameState.isTakingNap;
    document.getElementById('commit-btn').disabled = gameState.isWorking || gameState.isSleepingHobby || gameState.isTakingNap;

    // Work buttons
    const workButtons = ['work-mines-btn', 'work-office-btn', 'work-staples-btn', 'walk-dog-btn'];
    workButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = gameState.isWorking || gameState.isSleepingHobby || gameState.isTakingNap;
    });


    // Hobby buttons
    document.getElementById('sleep-btn').disabled = gameState.isWorking || gameState.isSleepingHobby || gameState.isTakingNap;
    document.getElementById('nap-btn').disabled = gameState.isWorking || gameState.isSleepingHobby || gameState.isTakingNap;

    // Disable if in significant debt
    if (isInSignificantDebt()) {
        workButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });
        document.getElementById('sleep-btn').disabled = true;
        document.getElementById('nap-btn').disabled = true;
    }
}

export function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

export function updateText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

export function updateHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
    }
}

export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}
