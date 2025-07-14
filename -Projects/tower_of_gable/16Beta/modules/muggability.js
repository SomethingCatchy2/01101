import { gameState } from './persistence.js';
import { addNotification, showNotification, updateElementText } from './utils.js';
// Remove invalid imports from je.js. UI update functions should be handled by orchestrator or utils if needed.

// --- Muggability Constants ---
const MUGGABILITY_UPDATE_INTERVAL = 5 * 1000; // Every 5 seconds
const MUGGABILITY_FLUCTUATION_RANGE = 5;
const MUGGABILITY_BASE_INCREASE_PER_NAP = 2;
const MUGGABILITY_BASE_INCREASE_PER_SLEEP = 5;
const MUGGABILITY_RESET_REDUCTION = 25; // How much base muggability is reduced after a major event
const MAJOR_MUGGING_THRESHOLD = 90; // Chance to trigger a major mugging event
const MUGGING_BASE_LOSS_PERCENT = 0.20; // 20% of current money
const MUGGING_MIN_LOSS = 25;
const MUGGING_MAX_LOSS = 500;


// --- Muggability Logic (Revamped) ---
export function initMuggability() {
    gameState.baseMuggability = gameState.baseMuggability || 10;
    gameState.muggabilityFluctuation = gameState.muggabilityFluctuation || 0;
    gameState.lastSleepOrNapTime = gameState.lastSleepOrNapTime || Date.now();
    recalculateAndDisplayMuggability();
    setInterval(updateMuggabilityFluctuation, MUGGABILITY_UPDATE_INTERVAL);
    setInterval(checkMajorMuggingEvent, 60 * 1000); // Check for major mugging every minute
}

export function calculateEffectiveMuggability() {
    let effectiveMuggability = gameState.baseMuggability + gameState.muggabilityFluctuation;

    // Factor in clothing
    const items = [gameState.equippedHat, gameState.equippedJacket, gameState.equippedShirt, gameState.equippedPants, gameState.equippedShoes, gameState.equippedSocks];
    items.forEach(key => {
        if (key && itemDefinitions[key]) {
            effectiveMuggability += itemDefinitions[key].muggability;
        }
    });

    // Factor in sleep level (more tired = more vulnerable)
    const sleepEffect = (100 - gameState.sleepLevel) / 10; // Up to +10 muggability
    effectiveMuggability += sleepEffect;

    // Apply repellent upgrade
    if (gameState.mugRepellentActive) {
        effectiveMuggability *= 0.85; // 15% reduction
    }


    return Math.max(0, Math.min(100, Math.round(effectiveMuggability)));
}

export function updateMuggabilityFluctuation() {
    const change = (Math.random() * MUGGABILITY_FLUCTUATION_RANGE * 2) - MUGGABILITY_FLUCTUATION_RANGE;
    gameState.muggabilityFluctuation = Math.round(change);
    recalculateAndDisplayMuggability();
}

export function updateMuggabilityDisplay() {
    const effectiveMuggability = calculateEffectiveMuggability();
    updateElementText("muggability-display", `${effectiveMuggability}%`);
    // Optional: Add a descriptor based on the level
    let descriptor = "Low";
    if (effectiveMuggability > 40) descriptor = "Medium";
    if (effectiveMuggability > 70) descriptor = "High";
    if (effectiveMuggability > 90) descriptor = "Critical";
    updateElementText("muggability-descriptor", descriptor);
}

export function checkMajorMuggingEvent() {
    const effectiveMuggability = calculateEffectiveMuggability();
    if (effectiveMuggability > MAJOR_MUGGING_THRESHOLD) {
        const chance = Math.random() * 100;
        if (chance < (effectiveMuggability - MAJOR_MUGGING_THRESHOLD) * 2) { // Scale chance
            triggerMugging();
        }
    }
}

export function recalculateAndDisplayMuggability() {
    // This function is a catch-all to be called whenever a factor changes
    updateMuggabilityDisplay();
}

export function triggerMugging() {
    addNotification("You are being confronted by a mugger!", "loss");

    setTimeout(() => {
        const lossPercent = MUGGING_BASE_LOSS_PERCENT;
        let moneyToLose = Math.floor(gameState.netMoney * lossPercent);
        moneyToLose = Math.max(MUGGING_MIN_LOSS, Math.min(moneyToLose, MUGGING_MAX_LOSS));

        if (gameState.netMoney > 0) {
            gameState.moneyLost += moneyToLose;
            addNotification(`The mugger stole $${moneyToLose.toFixed(2)}!`, "loss");
            updateMoneyDisplay();
        } else {
            addNotification("The mugger saw you had no money and just laughed.", "info");
        }

        // Reset base muggability
        gameState.baseMuggability = Math.max(0, gameState.baseMuggability - MUGGABILITY_RESET_REDUCTION);
        recalculateAndDisplayMuggability();
        addNotification(`The experience made you more cautious. Muggability reduced.`, "info");
    }, 1500); // Delay for confrontation message
}

export function triggerFaintMugging() { //for fainting
    addNotification("A figure approaches while you're passed out...", "loss");

    // Reduce base muggability immediately
    gameState.baseMuggability = Math.max(0, gameState.baseMuggability - MUGGABILITY_RESET_REDUCTION);
    updateMuggabilityDisplay(); // Show the reduced base value right away

    setTimeout(() => {
        const lossPercent = MUGGING_BASE_LOSS_PERCENT / 2; // Less loss for fainting
        let moneyToLose = Math.floor(gameState.netMoney * lossPercent);
        moneyToLose = Math.max(MUGGING_MIN_LOSS / 2, Math.min(moneyToLose, MUGGING_MAX_LOSS / 2));

        if (gameState.netMoney > 0) {
            gameState.moneyLost += moneyToLose;
            addNotification(`You wake up to find your pockets lighter. Lost $${moneyToLose.toFixed(2)}.`, "loss");
            updateMoneyDisplay();
        } else {
            addNotification("You wake up, thankfully with nothing stolen.", "info");
        }
    }, 1500); // Delay for confrontation message
}


export function recordSleepOrNap() {
    gameState.lastSleepOrNapTime = Date.now();
    recalculateAndDisplayMuggability(); // Update display based on potential sleep level change effect
}

export function getMuggability() {
    let muggability = 50;
    if (gameState.money > 1000) muggability += 10;
    if (gameState.money > 10000) muggability += 10;
    if (gameState.location === "Shady Alley") muggability += 20;
    if (gameState.location === "Quiet Suburb") muggability -= 20;
    if (gameState.items.includes("Guard Dog")) muggability -= 30;
    if (gameState.items.includes("Security Camera")) muggability -= 20;
    return Math.max(0, Math.min(100, muggability));
}

export function attemptMugging() {
    if (Math.random() * 100 < getMuggability()) {
        const moneyLost = Math.floor(gameState.money * (Math.random() * 0.5 + 0.1));
        gameState.money -= moneyLost;
        showNotification(`You were mugged and lost $${moneyLost.toFixed(2)}!`);
        updateMoney();
    }
}
