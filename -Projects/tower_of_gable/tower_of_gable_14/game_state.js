// game_state.js
export const gameState = {
    // ... (previous properties like wins, money, etc.) ...
    isWorkingMines: false,
    isWorkingOffice: false,
    isWorkingStaples: false,
    isTakingNap: false,
    isWalkingDog: false,
    isSleepingHobby: false,
    nextRollChance: null,
    age: 4,
    clothesPrice: 10 + (4 * 4),
    lastClothingChange: Date.now(),
    currentLocation: "North Carolina",
  
    // --- Muggability & Equipment ---
    muggability: 50, // Starting muggability
    lastSleepOrNapTime: Date.now(), // Track sleep/nap for muggability
    ownedItems: {}, // Object to store keys of owned items (e.g., { basicCap: true, knightHelm: true })
    equippedHat: null, // Key of the equipped hat item, or null
    equippedJacket: null, // Key of the equipped jacket item, or null
    // -----------------------------
  
    sleepLevel: 100,
    slaves: 0,
    momNagCount: 0,
  };
  
  // For console debugging (optional but helpful)
  window.gameState = gameState;