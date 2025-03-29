// ageing.js
// Handles player ageing, associated costs (like clothing), and Mom's nagging.
import { gameState } from './game_state.js';
import { updateElementText, addNotification, updateMoneyDisplay } from './utils.js'; // Use addNotification

const AGE_INTERVAL = 5 * 60 * 1000; // 5 minutes per year
const CLOTHING_INTERVAL = 3 * 60 * 1000; // Check clothing need every 3 minutes
const MOM_NAG_INTERVAL = 5 * 60 * 1000; // Mom nags every 5 minutes
const MOM_RANT_THRESHOLD = 12; // Number of nags before rant (12 * 5min = 1 hour)

/**
 * Initializes the ageing system timers.
 */
export function initAgeing() {
  updateElementText("age-display", gameState.age);
  updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
  setInterval(increaseAge, AGE_INTERVAL);
  // Remove clothing check interval - replaced by Mom Nag
  // setInterval(checkClothing, CLOTHING_INTERVAL);
  setInterval(momNag, MOM_NAG_INTERVAL); // Start Mom's nagging timer
}

/**
 * Increases player age and updates clothing cost.
 */
function increaseAge() {
  gameState.age++;
  // Quadratic scaling for clothes price, adjust formula as needed
  gameState.clothesPrice = 10 + (gameState.age * gameState.age * 0.5); // Slower scaling
  updateElementText("age-display", gameState.age);
  updateElementText("clothes-price", gameState.clothesPrice.toFixed(2));
  addNotification(`Happy Birthday! You are now ${gameState.age}. New clothes cost more!`, 'info');
}

/**
 * Handles the Mom Nag notification logic.
 */
function momNag() {
    gameState.momNagCount++;
    if (gameState.momNagCount < MOM_RANT_THRESHOLD) {
        // Standard nag
        const nags = [
            "Mom: Go take a shower, sweetie, you're starting to smell a bit.",
            "Mom: Honey, have you showered today? It's good for you!",
            "Mom: Don't forget personal hygiene is important! Quick shower?",
            "Mom: Remember that soap I bought? Maybe try using it in the shower?",
            "Mom: Getting a bit whiffy in here, maybe shower time?",
        ];
        addNotification(nags[Math.floor(Math.random() * nags.length)], "mom");
    } else {
        // Rant time
        const hours = Math.floor(gameState.momNagCount * 5 / 60);
        const rant = `Mom: Okay, listen here, young Gabel! It has been ${hours} hour(s) now! This isn't just about smelling nice, it's about being clean and healthy. Think of all the things you touch, the places you go! Washing helps get rid of germs that can make you feel unwell. Plus, feeling clean helps you feel good about yourself! It only takes a few minutes. Please, just hop in the shower, use some soap and water, and get refreshed. Do it for your health, do it for me, just please go shower!`;
        addNotification(rant, "mom-rant");
    }
}

/**
 * Handles buying new clothes. Deducts cost, resets clothing timer (implicitly via Mom Nag).
 */
export function buyClothes() {
  if (gameState.netMoney >= gameState.clothesPrice) {
    gameState.moneyLost += gameState.clothesPrice; // Track loss
    // gameState.lastClothingChange = Date.now(); // No longer needed for arrest check
    addNotification(`Bought new clothes for $${gameState.clothesPrice.toFixed(2)}. Mom might be happier.`, 'info');
    updateMoneyDisplay();
    // Resetting momNagCount could be an incentive?
    // gameState.momNagCount = 0; // Optional: Showering/new clothes resets the nag counter
  } else {
    addNotification(`Not enough money for new clothes ($${gameState.clothesPrice.toFixed(2)}).`, 'loss');
  }
}


// Removed checkClothing function as public indecency arrest is replaced by Mom Nag.