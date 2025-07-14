import { showNotification } from './utils.js';
// Removed invalid import. updateAllDynamicText should be called by orchestrator after loadGame.

export let gameState = {};

export const initialGameState = {
    money: 10,
    age: 16,
    time: new Date(),
    location: "Cardboard Box",
    items: [],
    job: null,
    health: 100,
    energy: 100,
    hunger: 0,
    thirst: 0,
    sanity: 100,
    isAwake: true,
    momPresent: true,
    muggability: 50,
    upgrades: [],
    dice: {
        rolled: false,
        value: 0
    }
};

export function saveGame() {
    localStorage.setItem('towerOfGableSave', JSON.stringify(gameState));
    showNotification("Game Saved!");
}

export function loadGame() {
    const savedGame = localStorage.getItem('towerOfGableSave');
    if (savedGame) {
        const loadedState = JSON.parse(savedGame);
        // Ensure date objects are correctly parsed
        loadedState.time = new Date(loadedState.time);
        Object.assign(gameState, loadedState);
        showNotification("Game Loaded!");
    } else {
        Object.assign(gameState, initialGameState);
        showNotification("No save game found, starting new game.");
    }
    // Orchestrator should update UI after loadGame.
}

export function resetGame() {
    if (confirm("Are you sure you want to reset your game? All progress will be lost.")) {
        localStorage.removeItem('towerOfGableSave');
        Object.assign(gameState, initialGameState);
        // Full reload to ensure clean state
        location.reload();
    }
}

// Initialize gameState
Object.assign(gameState, initialGameState);
