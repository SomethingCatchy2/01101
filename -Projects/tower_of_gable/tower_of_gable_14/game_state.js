// game_state.js
// Central object holding the entire game's state.

export const gameState = {
  // Core Game Stats
  wins: 0,
  consecutiveWins: 0,
  missedWins: 0,
  bonusPoints: 0,
  totalRolls: 0,
  dice: [], // Current dice roll (array of numbers)
  alreadyCounted: false, // Flag to prevent multiple missed win penalties per roll

  // Money
  moneyEarned: 0,
  moneyLost: 0, // Note: Stored as a positive number representing amount lost
  netMoney: 0,

  // Work/Action Flags (for parallel execution)
  isWorkingMines: false,
  isWorkingOffice: false,
  isWorkingStaples: false,
  isTakingNap: false,
  isWalkingDog: false,
  isSleepingHobby: false, // For the longer sleep action

  // Special Effects
  nextRollChance: null, // Stores 'gain' or 'lose' from nap outcome

  // Player Progression/Status
  age: 4,
  clothesPrice: 10 + (4 * 4), // Initial price based on age 4
  lastClothingChange: Date.now(), // Timestamp for clothing requirement check (currently unused by mechanics)
  currentLocation: "North Carolina", // Default location
  sleepLevel: 100, // Player's energy/sleepiness (0-100)
  slaves: 0, // Player slave count (if feature enabled)
  momNagCount: 0, // Counter for Mom's nagging interval

  // Muggability & Equipment
  muggability: 50, // Player's risk of being mugged (0-100), STARTS AT 50
  lastSleepOrNapTime: Date.now(), // Timestamp of last rest for muggability calculation
  ownedItems: {}, // Stores keys of purchased items (e.g., { knightHelm: true, cloak: true })
  equippedHat: null, // Key (string) of the equipped hat from items.js, or null
  equippedJacket: null, // Key (string) of the equipped jacket from items.js, or null
};

// Expose gameState globally for easy console debugging (optional, remove for production)
window.gameState = gameState;