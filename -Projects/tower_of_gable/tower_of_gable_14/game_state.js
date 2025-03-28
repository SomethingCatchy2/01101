// game_state.js
export const gameState = {
    wins: 0,
    consecutiveWins: 0,
    missedWins: 0,
    bonusPoints: 0,
    totalRolls: 0,
    moneyEarned: 0,
    moneyLost: 0,
    netMoney: 0,
    dice: [],
    alreadyCounted: false,
  
    // --- Individual Work Flags ---
    isWorkingMines: false,
    isWorkingOffice: false,
    isWorkingStaples: false,
    isTakingNap: false,
    isWalkingDog: false,
    isSleepingHobby: false,
    // --- End Work Flags ---
  
    nextRollChance: null, // For nap outcome
    age: 4,
    clothesPrice: 10 + (4 * 4),
    lastClothingChange: Date.now(),
    currentLocation: "North Carolina",
    muggability: 0,
    equippedItems: {},
    sleepLevel: 100,
    slaves: 0,
    momNagCount: 0, // Counter for Mom's nagging
  };