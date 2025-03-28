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
    workInProgress: false,
    officeWorkInProgress: false,
    stapleWorkInProgress: false,
    napWorkInProgress: false,
    nextRollChance: null,
    age: 4,
    clothesPrice: 10 + (4 * 4), // Initial clothes price for age 4
    lastClothingChange: Date.now(),
    currentLocation: "North Carolina",
    muggability: 0,
    equippedItems: {},
    sleepLevel: 100,
    slaves: 0
  };