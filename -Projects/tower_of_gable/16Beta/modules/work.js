import { gameState } from './persistence.js';
import { addNotification, showNotification, updateMoneyDisplay, updateButtonStates, isInSignificantDebt } from './utils.js';
import { recordSleepOrNap, recalculateAndDisplayMuggability } from './muggability.js';
// Remove invalid imports from je.js. UI update functions should be handled by orchestrator or utils if needed.

// --- Work Constants ---
const DOG_WALKER_JOB_DURATION = 5000;
const MINES_JOB_DURATION = 15000;
const OFFICE_JOB_DURATION = 12000;
const STAPLE_TABLES_JOB_DURATION = 4000;
const NAP_DURATION = 5000;

// --- Job Definitions ---
export const jobDefinitions = {
    "Beggar": { income: 1, requires: [] },
    "Lemonade Stand": { income: 5, requires: [] },
    "Newspaper Delivery": { income: 10, requires: ["Basic Computer"] },
    "Freelance Coder": { income: 50, requires: ["Basic Computer", "Book on Programming"] }
};

// --- Work Functions ---
export function workInMines() {
    if (gameState.isWorkingMines || isInSignificantDebt()) {
        if (isInSignificantDebt()) return;
    }
    gameState.isWorkingMines = true;
    updateButtonStates();
    addNotification("Started working in the mines.", "start");
    setTimeout(() => {
        const outcomes = [
            { value: 300, message: "Found a decent haul of coal!" },
            { value: 100, message: "Cave-in! Barely escaped with some ore." },
            { value: 500, message: "Struck a vein of gold!" },
            { value: 50, message: "Just a bit of dust and rocks today." },
            { value: 0, message: "Got lost, found nothing." }
        ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let finalValue = outcome.value;
        if (outcome.value > 0) {
            finalValue = Math.floor(finalValue * (gameState.miningEfficiencyMultiplier || 1));
        }
        gameState.moneyEarned += finalValue;
        let notificationType = finalValue > 0 ? 'finish-success' : 'info';
        addNotification(`Finished mining. ${outcome.message} (+ $${finalValue.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingMines = false;
        updateButtonStates();
    }, MINES_JOB_DURATION);
}

export function workInOfficeJob() {
    if (gameState.isWorkingOffice || isInSignificantDebt()) {
        if (isInSignificantDebt()) return;
    }
    gameState.isWorkingOffice = true;
    updateButtonStates();
    addNotification("Started working in the office.", "start");
    setTimeout(() => {
        const outcomes = [
            { value: 250, message: "Filed all the TPS reports!" },
            { value: 50, message: "Paper jam! Spent an hour fixing the copier." },
            { value: 400, message: "Impressed the boss with your spreadsheet skills!" },
            { value: 100, message: "Just another day at the cubicle farm." },
            { value: 0, message: "Slept at your desk, achieved nothing." }
        ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let finalValue = outcome.value;
        if (outcome.value > 0) {
            finalValue = Math.floor(finalValue * (gameState.officeJobMultiplier || 1));
        }
        gameState.moneyEarned += finalValue;
        let notificationType = finalValue > 0 ? 'finish-success' : 'info';
        addNotification(`Finished office work. ${outcome.message} (+ $${finalValue.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingOffice = false;
        updateButtonStates();
        gameState.officeJobsCompleted = (gameState.officeJobsCompleted || 0) + 1; // Increment counter
    }, OFFICE_JOB_DURATION);
}

export function workInStapleTables() {
    if (gameState.isWorkingStaples) return; // No debt check for this one as per original logic
    gameState.isWorkingStaples = true;
    updateButtonStates();
    addNotification("Started stapling tables.", "start");
    setTimeout(() => {
        const outcomes = [
            { value: 75, message: "Stapled a wobbly table. It's less wobbly now." },
            { value: 20, message: "Stapled your thumb. Ouch." },
            { value: 150, message: "Masterfully stapled a complex table arrangement!" },
            { value: 40, message: "A few tables stapled, nothing special." },
            { value: 0, message: "Ran out of staples." }
        ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let finalValue = outcome.value;
        // Stapling speed multiplier affects duration, not earnings directly
        gameState.moneyEarned += finalValue;
        let notificationType = finalValue > 0 ? 'finish-success' : (finalValue < 0 ? 'finish-fail' : 'info');
        addNotification(`Finished stapling tables. ${outcome.message} (+ $${finalValue.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWorkingStaples = false;
        updateButtonStates();
    }, STAPLE_TABLES_JOB_DURATION / (gameState.staplingSpeedMultiplier || 1)); // Speed multiplier reduces duration
}

export function takeNap() {
    if (gameState.isTakingNap || isInSignificantDebt()) {
        if (isInSignificantDebt()) return;
    }
    gameState.isTakingNap = true;
    updateButtonStates();
    addNotification("Taking a short nap...", "start");
    recordSleepOrNap(); // Record nap time for muggability
    setTimeout(() => {
        const napOutcome = Math.random();
        let napMessage = "";
        if (napOutcome < 0.6) {
            napMessage = "You feel refreshed and find $5 in your pocket!";
            gameState.nextRollChance = "gain";
            addNotification(napMessage, "finish-success");
        } else {
            napMessage = "You had a nightmare and feel groggy.";
            gameState.nextRollChance = "lose";
            addNotification(napMessage, "finish-fail");
        }
        gameState.isTakingNap = false;
        updateButtonStates();
        gameState.napsTaken = (gameState.napsTaken || 0) + 1; // Increment counter
        recalculateAndDisplayMuggability(); // Recalculate in case sleep level changed passively during nap
    }, NAP_DURATION);
}

export function workAsDogWalker() {
    if (gameState.isWalkingDog || isInSignificantDebt()) {
        if (isInSignificantDebt()) addNotification("Cannot start this job due to significant debt.", "loss");
        return;
    }
    gameState.isWalkingDog = true;
    updateButtonStates();
    addNotification("Started walking dogs.", "start");
    setTimeout(() => {
        const outcomes = [
            { value: 120, message: "Walked a pack of happy pups!" },
            { value: 0, message: "A dog tried to run away, but you caught it! Wasted time." },
            { value: 200, message: "Found a lost wallet!" },
            { value: 80, message: "Just a normal day." },
            { value: 10, message: "Stepped in poop... but found a dollar!" },
            { value: 50, message: "Taught a dog a new trick." }
        ];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let finalValue = outcome.value;
        if (outcome.value > 0) { // Apply multiplier only to positive earnings
            finalValue = Math.floor(finalValue * (gameState.dogWalkerMultiplier || 1));
        }
        gameState.moneyEarned += finalValue;
        let notificationType = finalValue > 0 ? 'finish-success' : 'info';
        addNotification(`Finished walking dogs. ${outcome.message} (+ $${finalValue.toFixed(2)})`, notificationType);
        updateMoneyDisplay();
        gameState.isWalkingDog = false;
        updateButtonStates();
        gameState.dogWalksCompleted = (gameState.dogWalksCompleted || 0) + 1; // Increment counter
    }, DOG_WALKER_JOB_DURATION);
}

export function setJob(jobName) {
    const job = jobDefinitions[jobName];
    let canTake = true;
    for (const req of job.requires) {
        if (!gameState.items.includes(req)) {
            canTake = false;
            break;
        }
    }

    if (canTake) {
        gameState.job = jobName;
        showNotification(`You are now a ${jobName}.`);
        updateJob();
    } else {
        showNotification("You don't meet the requirements for this job.");
    }
}

export function doWork() {
    if (gameState.job) {
        const income = jobDefinitions[gameState.job].income;
        gameState.money += income;
        showNotification(`You earned $${income.toFixed(2)}.`);
        updateMoney();
    } else {
        showNotification("You need a job to work!");
    }
}
