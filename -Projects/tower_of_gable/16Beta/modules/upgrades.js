import { gameState } from './persistence.js';
import { showNotification } from './utils.js';
import { updateMoney, updateUpgrades } from '../je.js';

// --- Upgrades System ---
export const upgradeDefinitions = {
    "Better Begging Bowl": { cost: 50, effect: () => { /* Handled in work logic */ }, description: "Doubles income from begging." },
    "Catchy Jingle": { cost: 100, effect: () => { /* Handled in work logic */ }, description: "Doubles income from lemonade stand." }
};

export function initUpgrades() {
    gameState.purchasedUpgrades = gameState.purchasedUpgrades || [];
    gameState.availableUpgrades = gameState.availableUpgrades || [];

    // Initialize any multipliers needed by upgrades
    gameState.diceBonusMultiplier = gameState.diceBonusMultiplier || 1;
    gameState.miningEfficiencyMultiplier = gameState.miningEfficiencyMultiplier || 1;
    gameState.staplingSpeedMultiplier = gameState.staplingSpeedMultiplier || 1;
    gameState.sleepRecoveryMultiplier = gameState.sleepRecoveryMultiplier || 1;
    gameState.winStreakMultiplier = gameState.winStreakMultiplier || 1;
    gameState.taxReductionMultiplier = gameState.taxReductionMultiplier || 1;
    gameState.luckyCharmActive = gameState.luckyCharmActive || false;
    gameState.mugRepellentActive = gameState.mugRepellentActive || false;
    gameState.officeJobMultiplier = gameState.officeJobMultiplier || 1;
    gameState.dogWalkerMultiplier = gameState.dogWalkerMultiplier || 1;
    gameState.napEffectivenessMultiplier = gameState.napEffectivenessMultiplier || 1;

    // Initialize counters if they don't exist from a save
    gameState.officeJobsCompleted = gameState.officeJobsCompleted || 0;
    gameState.dogWalksCompleted = gameState.dogWalksCompleted || 0;
    gameState.napsTaken = gameState.napsTaken || 0;

    // Do initial check for available upgrades
    checkForNewUpgrades();

    // Set up periodic checks (every 10 seconds)
    setInterval(checkForNewUpgrades, 10000);

    // Render initial upgrade UI
    renderUpgrades();
}

export function checkForNewUpgrades() {
    Object.values(upgradeDefinitions).forEach(upgrade => {
        // Skip if already purchased or already available
        if (gameState.purchasedUpgrades.includes(upgrade.id) ||
            gameState.availableUpgrades.includes(upgrade.id)) {
            return;
        }

        // Check if prerequisites are met
        if (upgrade.prerequisite(gameState)) {
            gameState.availableUpgrades.push(upgrade.id);
            addNotification(`New upgrade available: ${upgrade.name}!`, "win");
            renderUpgrades(); // Update the UI
        }
    });
}

export function purchaseUpgrade(upgradeId) {
    const upgrade = upgradeDefinitions[upgradeId];
    if (!upgrade) return;

    // Check if player can afford it
    if (gameState.netMoney < upgrade.cost) {
        addNotification(`Cannot afford ${upgrade.name}. Need $${upgrade.cost.toFixed(2)}.`, "loss");
        return;
    }

    // Purchase the upgrade
    gameState.moneyLost += upgrade.cost;
    gameState.purchasedUpgrades.push(upgradeId);

    // Remove from available upgrades
    gameState.availableUpgrades = gameState.availableUpgrades.filter(id => id !== upgradeId);

    // Apply the effect
    upgrade.effect(gameState);

    // Update displays
    updateMoneyDisplay();
    renderUpgrades();
}

export function renderUpgrades() {
    const availableContainer = document.getElementById('upgrades-container');
    const purchasedContainer = document.getElementById('purchased-upgrades-container');
    const noUpgradesMsg = document.getElementById('no-upgrades-message');
    const noPurchasedMsg = document.getElementById('no-purchased-upgrades-message');

    if (!availableContainer || !purchasedContainer) {
        console.error("Upgrade containers not found!");
        return;
    }

    // Clear existing content
    availableContainer.innerHTML = '';
    purchasedContainer.innerHTML = '';

    // Group upgrades by category
    const availableByCategory = {};
    const purchasedByCategory = {};

    // Process available upgrades
    if (gameState.availableUpgrades.length === 0) {
        noUpgradesMsg.style.display = 'block';
    } else {
        noUpgradesMsg.style.display = 'none';

        // Group by category
        gameState.availableUpgrades.forEach(id => {
            const upgrade = upgradeDefinitions[id];
            if (!upgrade) return;

            if (!availableByCategory[upgrade.category]) {
                availableByCategory[upgrade.category] = [];
            }
            availableByCategory[upgrade.category].push(upgrade);
        });

        // Create category sections
        Object.keys(availableByCategory).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'upgrade-category';

            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            categoryDiv.appendChild(categoryHeader);

            const upgradeGrid = document.createElement('div');
            upgradeGrid.className = 'upgrade-grid';

            // Add upgrades to this category
            availableByCategory[category].forEach(upgrade => {
                const canAfford = gameState.netMoney >= upgrade.cost;

                const upgradeDiv = document.createElement('div');
                upgradeDiv.className = `upgrade-item ${canAfford ? '' : 'disabled'}`;
                upgradeDiv.innerHTML = `
                    <h4>${upgrade.name}</h4>
                    <div class="cost">Cost: $${upgrade.cost.toFixed(2)}</div>
                    <div class="description">${upgrade.description}</div>
                    ${!canAfford ? `<div class="upgrade-stats">You need $${(upgrade.cost - gameState.netMoney).toFixed(2)} more</div>` : ''}
                `;
                if (canAfford) {
                    upgradeDiv.onclick = () => purchaseUpgrade(upgrade.id);
                }
                upgradeGrid.appendChild(upgradeDiv);
            });

            categoryDiv.appendChild(upgradeGrid);
            availableContainer.appendChild(categoryDiv);
        });
    }

    // Process purchased upgrades
    if (gameState.purchasedUpgrades.length === 0) {
        noPurchasedMsg.style.display = 'block';
    } else {
        noPurchasedMsg.style.display = 'none';

        // Group by category
        gameState.purchasedUpgrades.forEach(id => {
            const upgrade = upgradeDefinitions[id];
            if (!upgrade) return;

            if (!purchasedByCategory[upgrade.category]) {
                purchasedByCategory[upgrade.category] = [];
            }
            purchasedByCategory[upgrade.category].push(upgrade);
        });

        // Create category sections
        Object.keys(purchasedByCategory).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'upgrade-category';

            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            categoryDiv.appendChild(categoryHeader);

            const upgradeGrid = document.createElement('div');
            upgradeGrid.className = 'upgrade-grid';

            // Add upgrades to this category
            purchasedByCategory[category].forEach(upgrade => {
                const upgradeDiv = document.createElement('div');
                upgradeDiv.className = 'upgrade-item purchased';
                upgradeDiv.innerHTML = `
                    <h4>${upgrade.name}</h4>
                    <div class="description">${upgrade.description}</div>
                `;
                upgradeGrid.appendChild(upgradeDiv);
            });

            categoryDiv.appendChild(upgradeGrid);
            purchasedContainer.appendChild(categoryDiv);
        });
    }
}
