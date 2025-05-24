const audio = document.getElementById('myAudio');

      function playAudio() {
        audio.play();
      }

      function pauseAudio() {
        audio.pause();
      }

      function stopAudio() {
        audio.pause();
        audio.currentTime = 0;
      }

      function setVolume(value) {
        audio.volume = value;
      }
    
    // --- START OF CONSOLIDATED JAVASCRIPT ---

    // --- Configuration Constants ---
    const SIGNIFICANT_DEBT_THRESHOLD = -5000;
    const BANKRUPTCY_THRESHOLD = -10000;
    const MISSED_WIN_PENALTY = 125;
    const COMMIT_FAIL_PENALTY = 75;
    // const WIN_STREAK_BONUS_MULTIPLIER = 300; // Will be replaced by a base and a multiplier in gameState
    let WIN_STREAK_BONUS_MULTIPLIER_BASE = 300; // Changed to let and renamed
    const BASE_WIN_AMOUNT = 1000;
    const NAP_GAIN_AMOUNT = 85;
    const NAP_LOSS_AMOUNT = 65;
    const SAVE_GAME_KEY = 'towerOfGableData_v15_2'; // VERSION UPDATE
    const GAME_VERSION_STRING = "WebV15.2"; // VERSION UPDATE

    // Muggability Constants
    const MUGGABILITY_FLUCTUATION_INTERVAL = 10000; // How often muggability randomly fluctuates (milliseconds)
    const MAJOR_MUGGING_CHECK_INTERVAL = (Math.floor(Math.random() * 6) + 3) * 60 * 1000; // How often a major mugging event is checked (3-8 minutes, milliseconds)
    const MUGGING_SUCCESS_RATE = 0.65; // Chance of a mugging succeeding (0 to 1)
    const MONEY_LOSS_PERCENTAGE = 0.45; // Percentage of net money lost in a successful mugging (0 to 1)
    const MUGGABILITY_RESET_REDUCTION = 30; // Amount muggability is reduced by after a mugging event
    const SLEEP_MUGGABILITY_THRESHOLD_LOW = 62; // Sleep level below which muggability is penalized
    const SLEEP_MUGGABILITY_THRESHOLD_HIGH = 94; // Sleep level above which muggability is rewarded
    const SLEEP_MUGGABILITY_PENALTY = 9; // Muggability penalty when sleep is low
    const SLEEP_MUGGABILITY_BONUS = -4; // Muggability bonus when sleep is high

    // --- Content from game_state.js ---
    const gameState = {
      // Core Game Stats
      wins: 0, consecutiveWins: 0, missedWins: 0,
      bonusPoints: 0, // Accumulates, resets on commit OR if roll yields 0 bonus.
      totalRolls: 0, dice: [], alreadyCounted: false,
      // Money
      moneyEarned: 0, moneyLost: 0, netMoney: 0,
      // Work/Action Flags
      isWorkingMines: false, isWorkingOffice: false, isWorkingStaples: false, isTakingNap: false, isWorkingDog: false, isSleepingHobby: false,
      // Special Effects
      nextRollChance: null,
      // Player Progression/Status
      age: 4, clothesPrice: 15 + (4 * 5), lastClothingChange: Date.now(), currentLocation: "North Carolina",
      sleepLevel: 100, slaves: 0, momNagCount: 0,
      // Muggability & Equipment
      baseMuggability: 50, lastSleepOrNapTime: Date.now(),
      ownedItems: { genericShirt: true, genericPants: true },
      equippedHat: null, equippedJacket: null, equippedShirt: 'genericShirt',
      equippedPants: 'genericPants', equippedShoes: null, equippedSocks: null,
      // Upgrade-related state properties
      purchasedUpgrades: [],
      availableUpgrades: [],
      diceBonusMultiplier: 1,
      miningEfficiencyMultiplier: 1,
      staplingSpeedMultiplier: 1,
      sleepRecoveryMultiplier: 1,
      winStreakMultiplier: 1,
      taxReductionMultiplier: 1,
      luckyCharmActive: false,
      mugRepellentActive: false,
      officeJobMultiplier: 1,
      dogWalkerMultiplier: 1,
      napEffectivenessMultiplier: 1,
      // Counters for prerequisites
      officeJobsCompleted: 0,
      dogWalksCompleted: 0,
      napsTaken: 0,
    };
    window.gameState = gameState; // Make globally accessible for debug/potential extensions

    // --- Content from items.js ---
    const calculateCost = (base) => base * 8 + 25 * gameState.age / 2;
    const itemDefinitions = {
      // Helms
      knightHelm: { name: "Knight Helm", cost: calculateCost(15), type: 'hat', effects: { muggability: -10 } },
      constructionHelm: { name: "Hard Hat", cost: calculateCost(8), type: 'hat', effects: { muggability: -4 } },
      hophatHelm: { name: "Bunny Ears", cost: calculateCost(5), type: 'hat', effects: { muggability: -2 } },
      potHelm: { name: "Pot Lid", cost: calculateCost(2), type: 'hat', effects: { muggability: -1 } },
      footballHelm: { name: "Football Helmet", cost: calculateCost(12), type: 'hat', effects: { muggability: -6 } },
      vikingHelm: { name: "Viking Helmet (Horns)", cost: calculateCost(14), type: 'hat', effects: { muggability: -7 } },
      spaceHelm: { name: "Space Helmet", cost: calculateCost(20), type: 'hat', effects: { muggability: -10 } },
      divingHelm: { name: "Old Diving Helmet", cost: calculateCost(18), type: 'hat', effects: { muggability: -9 } },
      basicCap: { name: "Basic Cap", cost: calculateCost(3), type: 'hat', effects: {} },
      beanie: { name: "Beanie", cost: calculateCost(4), type: 'hat', effects: { muggability: +1 } },
      fedora: { name: "Fedora", cost: calculateCost(7), type: 'hat', effects: { muggability: +2 } },
      topHat: { name: "Top Hat", cost: calculateCost(10), type: 'hat', effects: { muggability: +3 } },
      cowboyHat: { name: "Cowboy Hat", cost: calculateCost(9), type: 'hat', effects: { muggability: -1 } },
      propellerHat: { name: "Propeller Hat", cost: calculateCost(6), type: 'hat', effects: { muggability: -1 } },
      wizardHat: { name: "Wizard Hat", cost: calculateCost(13), type: 'hat', effects: { muggability: +2 } },
      chefHat: { name: "Chef Hat", cost: calculateCost(5), type: 'hat', effects: {} },
      ushanka: { name: "Ushanka", cost: calculateCost(11), type: 'hat', effects: {} },
      sombrero: { name: "Sombrero", cost: calculateCost(10), type: 'hat', effects: { muggability: -1 } },
      partyHat: { name: "Party Hat", cost: calculateCost(1), type: 'hat', effects: {} },
      bowlerHat: { name: "Bowler Hat", cost: calculateCost(8), type: 'hat', effects: { muggability: +1 } },
      crown: { name: "Plastic Crown", cost: calculateCost(4), type: 'hat', effects: {} },
      santaHat: { name: "Santa Hat", cost: calculateCost(6), type: 'hat', effects: {} },
      pirateHat: { name: "Pirate Hat", cost: calculateCost(12), type: 'hat', effects: { muggability: +3 } },
      // Jackets
      cloak: { name: "Mysterious Cloak", cost: calculateCost(12), type: 'jacket', effects: { muggability: -5 } },
      trenchCoat: { name: "Shady Trench Coat", cost: calculateCost(10), type: 'jacket', effects: { muggability: +5 } },
      leatherJacket: { name: "Leather Jacket", cost: calculateCost(15), type: 'jacket', effects: { muggability: +3 } },
      denimJacket: { name: "Denim Jacket", cost: calculateCost(8), type: 'jacket', effects: {} },
      hoodie: { name: "Hoodie", cost: calculateCost(7), type: 'jacket', effects: { muggability: +2 } },
      blazer: { name: "Blazer", cost: calculateCost(14), type: 'jacket', effects: { muggability: +1 } },
      puffyJacket: { name: "Puffy Jacket", cost: calculateCost(11), type: 'jacket', effects: { muggability: +1 } },
      rainCoat: { name: "Rain Coat", cost: calculateCost(9), type: 'jacket', effects: {} },
      labCoat: { name: "Lab Coat", cost: calculateCost(13), type: 'jacket', effects: { muggability: -2 } },
      vest: { name: "Vest", cost: calculateCost(6), type: 'jacket', effects: { muggability: -1 } },
      bomberJacket: { name: "Bomber Jacket", cost: calculateCost(16), type: 'jacket', effects: { muggability: +2 } },
      trackJacket: { name: "Track Jacket", cost: calculateCost(8), type: 'jacket', effects: {} },
      cardigan: { name: "Cardigan", cost: calculateCost(9), type: 'jacket', effects: { muggability: -1 } },
      poncho: { name: "Poncho", cost: calculateCost(7), type: 'jacket', effects: { muggability: -1 } },
      straitjacket: { name: "Straitjacket", cost: calculateCost(20), type: 'jacket', effects: { muggability: -10 } },
      highVisJacket: { name: "High-Vis Jacket", cost: calculateCost(5), type: 'jacket', effects: { muggability: -3 } },
      tuxedoJacket: { name: "Tuxedo Jacket", cost: calculateCost(25), type: 'jacket', effects: { muggability: +6 } },
      furCoat: { name: "Fake Fur Coat", cost: calculateCost(22), type: 'jacket', effects: { muggability: +7 } },
      motorcycleJacket: { name: "Motorcycle Jacket", cost: calculateCost(17), type: 'jacket', effects: { muggability: -4 } },
      // Shirts
      genericShirt: { name: "Generic Shirt", cost: 0, type: 'shirt', effects: { muggability: +2 }, nonBuyable: true },
      plainTee: { name: "Plain T-Shirt", cost: calculateCost(3), type: 'shirt', effects: { muggability: +1 } },
      graphicTee: { name: "Graphic T-Shirt", cost: calculateCost(5), type: 'shirt', effects: { muggability: +2 } },
      poloShirt: { name: "Polo Shirt", cost: calculateCost(8), type: 'shirt', effects: { muggability: 0 } },
      buttonDown: { name: "Button-Down Shirt", cost: calculateCost(12), type: 'shirt', effects: { muggability: -1 } },
      flannelShirt: { name: "Flannel Shirt", cost: calculateCost(10), type: 'shirt', effects: { muggability: 0 } },
      hawaiianShirt: { name: "Hawaiian Shirt", cost: calculateCost(9), type: 'shirt', effects: { muggability: -10 } },
      flanal: { name: "Flanal", cost: calculateCost(6), type: 'shirt', effects: { muggability: +3 } },
      turtleneck: { name: "Turtleneck", cost: calculateCost(11), type: 'shirt', effects: { muggability: -2 } },
      // Pants
      genericPants: { name: "Generic Pants", cost: 0, type: 'pants', effects: { muggability: +2 }, nonBuyable: true },
      jeans: { name: "Jeans", cost: calculateCost(10), type: 'pants', effects: { muggability: 0 } },
      khakis: { name: "Khakis", cost: calculateCost(12), type: 'pants', effects: { muggability: -1 } },
      cargoPants: { name: "Cargo Pants", cost: calculateCost(11), type: 'pants', effects: { muggability: +1 } },
      sweatpants: { name: "Sweatpants", cost: calculateCost(8), type: 'pants', effects: { muggability: +2 } },
      dressPants: { name: "Dress Pants", cost: calculateCost(15), type: 'pants', effects: { muggability: -2 } },
      shorts: { name: "Shorts", cost: calculateCost(7), type: 'pants', effects: { muggability: +3 } },
      overalls: { name: "Overalls", cost: calculateCost(13), type: 'pants', effects: { muggability: -4 } },
      trackPants: { name: "Track Pants", cost: calculateCost(9), type: 'pants', effects: { muggability: +1 } },
      // Shoes
      sneakers: { name: "Sneakers", cost: calculateCost(9), type: 'shoes', effects: { muggability: 0 } },
      dressShoes: { name: "Dress Shoes", cost: calculateCost(14), type: 'shoes', effects: { muggability: +1 } },
      boots: { name: "Work Boots", cost: calculateCost(12), type: 'shoes', effects: { muggability: -2 } },
      sandals: { name: "Sandals", cost: calculateCost(5), type: 'shoes', effects: { muggability: +3 } },
      flipFlops: { name: "Flip Flops", cost: calculateCost(3), type: 'shoes', effects: { muggability: +4 } },
      runningShoes: { name: "Running Shoes", cost: calculateCost(11), type: 'shoes', effects: { muggability: -1 } },
      clogs: { name: "Clogs", cost: calculateCost(7), type: 'shoes', effects: { muggability: +2 } },
      steelToeBoots: { name: "Steel Toe Boots", cost: calculateCost(16), type: 'shoes', effects: { muggability: -4 } },
      // Socks
      ankleSocks: { name: "Ankle Socks", cost: calculateCost(2), type: 'socks', effects: { muggability: +1 } },
      crewSocks: { name: "Crew Socks", cost: calculateCost(3), type: 'socks', effects: { muggability: 0 } },
      kneeHighSocks: { name: "Knee High Socks", cost: calculateCost(4), type: 'socks', effects: { muggability: -1 } },
      woolSocks: { name: "Wool Socks", cost: calculateCost(5), type: 'socks', effects: { muggability: -1 } },
      patternedSocks: { name: "Patterned Socks", cost: calculateCost(4), type: 'socks', effects: { muggability: +1 } },
      noShowSocks: { name: "No-Show Socks", cost: calculateCost(2), type: 'socks', effects: { muggability: +2 } },
      socksWithSandals: { name: "Socks WITH Sandals", cost: calculateCost(1), type: 'socks', effects: { muggability: -5 } },
    };

    // --- Content from utils.js ---
    function updateElementText(id, text) {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
      else console.warn(`Element with ID ${id} not found for update.`);
    }
    function showMessage(message, duration = 3000) {
      const messageDisplay = document.getElementById("message-display");
      if (!messageDisplay || !message) return;
      messageDisplay.textContent = message;
      messageDisplay.style.display = "block";
      if (window.messageTimeout) clearTimeout(window.messageTimeout);
      if (duration > 0) {
        window.messageTimeout = setTimeout(() => {
          if (messageDisplay) messageDisplay.style.display = "none";
        }, duration);
      }
    }
    function addNotification(message, type = 'info') {
      const log = document.getElementById('notification-log');
      if (!log) {
        console.error("Notification log element not found!");
        return;
      }

      const entry = document.createElement('p');
      entry.textContent = message;
      entry.className = `notification-${type}`;
      log.appendChild(entry); // Add to the bottom

      // Remove old notifications to maintain the box size
      const MAX_VISIBLE_NOTIFICATIONS = 10; // Adjust as needed
      while (log.children.length > MAX_VISIBLE_NOTIFICATIONS) {
        log.removeChild(log.firstChild);
      }
    }
    function checkBankruptcy() {
      if (gameState.netMoney <= BANKRUPTCY_THRESHOLD) {
        showMessage(`BANKRUPTCY! Your net worth is $${gameState.netMoney.toFixed(2)}. Game Over. You can reset the game.`, 0); // 0 duration = persistent
        // Most buttons will be disabled by updateButtonStates, which is called by updateMoneyDisplay
        // Ensure the reset button is explicitly enabled if it's not handled by updateButtonStates logic for bankruptcy
        const resetButton = document.getElementById('bankruptcy-reset-btn');
        if (resetButton) resetButton.disabled = false;
      }
    }
    function updateMoneyDisplay() {
      gameState.netMoney = gameState.moneyEarned - gameState.moneyLost - gameState.totalRolls;
      updateElementText("money-earned", gameState.moneyEarned.toFixed(2));
      updateElementText("money-lost", gameState.moneyLost.toFixed(2));
      updateElementText("net-money", gameState.netMoney.toFixed(2));
      checkBankruptcy(); // Check if bankrupt state is triggered
      updateButtonStates(); // Update button enabled/disabled states

      // Add this line to refresh upgrade affordability status whenever money changes
      renderUpgrades(); // Refresh the upgrade UI to reflect current affordability
    }
    function isInSignificantDebt() {
      return gameState.netMoney < SIGNIFICANT_DEBT_THRESHOLD;
    }
    function updateButtonStates() {
      const isAnyJobRunning = gameState.isWorkingMines || gameState.isWorkingOffice || gameState.isWorkingStaples || gameState.isTakingNap || gameState.isWorkingDog || gameState.isSleepingHobby;
      const inDebt = isInSignificantDebt();
      const isBankrupt = gameState.netMoney <= BANKRUPTCY_THRESHOLD;

      const safelySetDisabled = (id, isDisabled) => {
        const element = document.getElementById(id);
        if (element && element.id !== 'bankruptcy-reset-btn') { // Exclude reset button
          element.disabled = isDisabled;
        } else if (!element && id !== 'bankruptcy-reset-btn') {
          console.warn(`Button with ID ${id} not found for disabling.`);
        }
      };

      // Handle bankruptcy first - disable almost everything except reset
      if (isBankrupt) {
        const actionButtons = document.querySelectorAll('.actions-box button, .shop-grid button');
        actionButtons.forEach(btn => safelySetDisabled(btn.id, true));
        const equipSelects = document.querySelectorAll('.equipment-select select');
        equipSelects.forEach(sel => safelySetDisabled(sel.id, true));
        // Reset button remains enabled (handled elsewhere)
        return; // Stop further processing if bankrupt
      }

      // Handle Debt Restrictions
      if (inDebt) {
        // Only notify if the state *changes* to debt? Or is continuous reminder ok? Continuous for now.
        // addNotification(`Significant Debt! ($${gameState.netMoney.toFixed(2)}). Only Dice, Tables, and Dogs available.`, "debt");
        safelySetDisabled('roll-dice-btn', false); // Always allowed (costs money)
        safelySetDisabled('commit-btn', true); // Cannot commit in debt
        safelySetDisabled('work-in-mines-btn', true); // Restricted
        safelySetDisabled('work-in-office-btn', true); // Restricted
        safelySetDisabled('work-staple-tables-btn', gameState.isWorkingStaples); // Allowed if not running
        safelySetDisabled('work-dog-walker-btn', gameState.isWalkingDog); // Allowed if not running
        safelySetDisabled('take-nap-btn', true); // Restricted
        safelySetDisabled('sleep-hobby-btn', true); // Restricted
      } else {
        // Normal Operation - Enable/disable based on running jobs
        safelySetDisabled('work-in-mines-btn', gameState.isWorkingMines);
        safelySetDisabled('work-in-office-btn', gameState.isWorkingOffice);
        safelySetDisabled('work-staple-tables-btn', gameState.isWorkingStaples);
        safelySetDisabled('take-nap-btn', gameState.isTakingNap);
        safelySetDisabled('work-dog-walker-btn', gameState.isWalkingDog);
        safelySetDisabled('sleep-hobby-btn', gameState.isSleepingHobby);

        // Roll/Commit depend on other jobs running
        const canRollOrCommit = !isAnyJobRunning;
        safelySetDisabled('roll-dice-btn', !canRollOrCommit);
        safelySetDisabled('commit-btn', !canRollOrCommit || gameState.dice.length === 0);
      }

      // Update buy buttons based on ownership (applies regardless of debt, unless bankrupt)
      updateOwnedItemButtons();
      // Ensure equip selects are enabled (unless bankrupt)
      const equipSelects = document.querySelectorAll('.equipment-select select');
      equipSelects.forEach(sel => safelySetDisabled(sel.id, false));
    }

    // --- Content from muggability.js (Revamped) ---
    function initMuggability() {
      gameState.lastSleepOrNapTime = gameState.lastSleepOrNapTime || Date.now();
      gameState.baseMuggability = Math.max(0, Math.min(100, Math.round(gameState.baseMuggability ?? 50)));
      updateMuggabilityDisplay();
      setInterval(updateMuggabilityFluctuation, MUGGABILITY_FLUCTUATION_INTERVAL);
      setInterval(checkMajorMuggingEvent, MAJOR_MUGGING_CHECK_INTERVAL);
      // addNotification("Muggability system initialized.", "info"); // Less verbose
    }
    function calculateEffectiveMuggability() {
      let effectiveMuggability = gameState.baseMuggability;
      // 1. Sleep Effect
      if (gameState.sleepLevel < SLEEP_MUGGABILITY_THRESHOLD_LOW) {
        effectiveMuggability += SLEEP_MUGGABILITY_PENALTY;
      } else if (gameState.sleepLevel > SLEEP_MUGGABILITY_THRESHOLD_HIGH) {
        effectiveMuggability += SLEEP_MUGGABILITY_BONUS;
      }
      // 2. Equipment Effect (All Slots)
      const equippedItems = [gameState.equippedHat, gameState.equippedJacket, gameState.equippedShirt, gameState.equippedPants, gameState.equippedShoes, gameState.equippedSocks];
      equippedItems.forEach(key => {
        if (key && itemDefinitions[key]?.effects?.muggability) {
          effectiveMuggability += itemDefinitions[key].effects.muggability;
        }
      });
      // 3. Mug Repellent Effect
      if (gameState.mugRepellentActive) {
        effectiveMuggability *= 0.85; // 15% reduction
      }
      // 4. Clamp between 0 and 100
      return Math.max(0, Math.min(100, Math.round(effectiveMuggability)));
    }
    function updateMuggabilityFluctuation() {
      const change = (Math.random() * 3) - 1.5; // +/- 1.5 drift
      gameState.baseMuggability += change;
      gameState.baseMuggability = Math.max(0, Math.min(100, Math.round(gameState.baseMuggability)));
      updateMuggabilityDisplay(); // Update both base and effective display
    }
    function updateMuggabilityDisplay() {
      const effectiveMuggability = calculateEffectiveMuggability();
      updateElementText("muggability-base-display", gameState.baseMuggability);
      updateElementText("muggability-effective-display", effectiveMuggability);
    }
    function checkMajorMuggingEvent() {
      const effectiveMuggability = calculateEffectiveMuggability();
      addNotification(`You notice a shadowed figure...`, "muggability");
      if (Math.random() * 100 < effectiveMuggability) {
        triggerMugging();
      } else {
        addNotification("You avoided any trouble this time.", "muggability");
      }
    }
    function recalculateAndDisplayMuggability() {
      // This function is called whenever something *might* change the effective muggability (equip, sleep change)
      updateMuggabilityDisplay();
    }
    function triggerMugging() { //main
      addNotification("The shadow approaches!", "loss");
      // Reduce base muggability immediately
      gameState.baseMuggability = Math.max(0, gameState.baseMuggability - MUGGABILITY_RESET_REDUCTION);
      updateMuggabilityDisplay(); // Show the reduced base value right away

      setTimeout(() => {
        if (Math.random() < MUGGING_SUCCESS_RATE) {
          let moneyToLose = 0;
          if (gameState.netMoney > 0) {
            moneyToLose = Math.floor(gameState.netMoney * MONEY_LOSS_PERCENTAGE);
          }
          if (moneyToLose > 0) {
            gameState.moneyLost += moneyToLose;
            addNotification(`You've been mugged! Lost $${moneyToLose.toFixed(2)}! (${(MONEY_LOSS_PERCENTAGE * 100).toFixed(0)}% of your cash)`, "loss");
            updateMoneyDisplay(); // Update money and potentially trigger bankruptcy/debt states
          } else {
            addNotification("The shadow mugged you... but you're broke! It left looking disapointed.", "info");
          }
        } else {
          addNotification("You scared off the shadow.", "finish-success");
        }
      }, 1500); // Delay for confrontation message
    }
    function triggerFaintMugging() { //for fainting

      // Reduce base muggability immediately
      gameState.baseMuggability = Math.max(0, gameState.baseMuggability - MUGGABILITY_RESET_REDUCTION);
      updateMuggabilityDisplay(); // Show the reduced base value right away

      setTimeout(() => {
        if (Math.random() < MUGGING_SUCCESS_RATE) {
          let moneyToLose = 0;
          if (gameState.netMoney > 0) {
            moneyToLose = Math.floor(gameState.netMoney * MONEY_LOSS_PERCENTAGE);
          }
          if (moneyToLose > 0) {
            gameState.moneyLost += moneyToLose;
            addNotification(`You've been mugged! Lost $${moneyToLose.toFixed(2)}! (${(MONEY_LOSS_PERCENTAGE * 100).toFixed(0)}% of your cash)`, "loss");
            updateMoneyDisplay(); // Update money and potentially trigger bankruptcy/debt states
          } else {
            addNotification("Something mugged you... but you were too poor to be mugged! It left looking disapointed.", "info");
          }
        } else {
          //   addNotification("Your hairline scared off the shadow.", "finish-success");
        }
      }, 1500); // Delay for confrontation message
    }
    function recordSleepOrNap() {
      gameState.lastSleepOrNapTime = Date.now();
      recalculateAndDisplayMuggability(); // Update display based on potential sleep level change effect
    }

    // --- Content from shopping.js (Expanded) ---
    const hatShopGrid = document.getElementById('hat-shop-grid');
    const jacketShopGrid = document.getElementById('jacket-shop-grid');
    const shirtShopGrid = document.getElementById('shirt-shop-grid');
    const pantsShopGrid = document.getElementById('pants-shop-grid');
    const shoesShopGrid = document.getElementById('shoes-shop-grid');
    const socksShopGrid = document.getElementById('socks-shop-grid');
    const equipHatSelect = document.getElementById('equip-hat-select');
    const equipJacketSelect = document.getElementById('equip-jacket-select');
    const equipShirtSelect = document.getElementById('equip-shirt-select');
    const equipPantsSelect = document.getElementById('equip-pants-select');
    const equipShoesSelect = document.getElementById('equip-shoes-select');
    const equipSocksSelect = document.getElementById('equip-socks-select');

    function initShopping() {
      // Check elements exist (simplified)
      if (!hatShopGrid || !equipHatSelect /* ... add others if needed */) { console.error("Shop DOM elements missing!"); return; }
      populateShopGrids();
      addEquipmentListeners();
      updateEquipmentSelectors(); // Load initial selections
      updateOwnedItemButtons(); // Update initial button states
    }
    function populateShopGrids() {
      hatShopGrid.innerHTML = ''; jacketShopGrid.innerHTML = ''; shirtShopGrid.innerHTML = '';
      pantsShopGrid.innerHTML = ''; shoesShopGrid.innerHTML = ''; socksShopGrid.innerHTML = '';
      Object.entries(itemDefinitions).forEach(([key, item]) => {
        if (item.nonBuyable) return;
        const button = document.createElement('button');
        button.textContent = `${item.name} - $${item.cost.toFixed(2)}`;
        button.dataset.itemKey = key; button.id = `buy-${key}`;
        button.onclick = () => buyItem(key);
        switch (item.type) {
          case 'hat': hatShopGrid.appendChild(button); break;
          case 'jacket': jacketShopGrid.appendChild(button); break;
          case 'shirt': shirtShopGrid.appendChild(button); break;
          case 'pants': pantsShopGrid.appendChild(button); break;
          case 'shoes': shoesShopGrid.appendChild(button); break;
          case 'socks': socksShopGrid.appendChild(button); break;
        }
      });
    }
    function addEquipmentListeners() {
      equipHatSelect.onchange = (event) => equipItem(event.target.value, 'hat');
      equipJacketSelect.onchange = (event) => equipItem(event.target.value, 'jacket');
      equipShirtSelect.onchange = (event) => equipItem(event.target.value, 'shirt');
      equipPantsSelect.onchange = (event) => equipItem(event.target.value, 'pants');
      equipShoesSelect.onchange = (event) => equipItem(event.target.value, 'shoes');
      equipSocksSelect.onchange = (event) => equipItem(event.target.value, 'socks');
    }
    function buyItem(itemKey) {
      const item = itemDefinitions[itemKey];
      if (!item) { console.error(`Item not found: ${itemKey}`); return; }
      if (gameState.ownedItems[itemKey]) { addNotification(`Already own ${item.name}.`, 'info'); return; }
      if (gameState.netMoney >= item.cost) {
        gameState.moneyLost += item.cost;
        gameState.ownedItems[itemKey] = true;
        addNotification(`Purchased ${item.name} for $${item.cost.toFixed(2)}!`, 'info');
        updateMoneyDisplay(); // Update money & buttons
        updateEquipmentSelectors(); // Add to dropdown
        updateOwnedItemButtons(); // Disable buy button
      } else {
        addNotification(`Not enough money for ${item.name}. Need $${item.cost.toFixed(2)}, have $${gameState.netMoney.toFixed(2)}.`, 'loss');
      }
    }
    function updateEquipmentSelectors() {
      const selects = { hat: equipHatSelect, jacket: equipJacketSelect, shirt: equipShirtSelect, pants: equipPantsSelect, shoes: equipShoesSelect, socks: equipSocksSelect };
      const equipped = { hat: gameState.equippedHat, jacket: gameState.equippedJacket, shirt: gameState.equippedShirt, pants: gameState.equippedPants, shoes: gameState.equippedShoes, socks: gameState.equippedSocks };

      Object.entries(selects).forEach(([type, selectElement]) => {
        selectElement.innerHTML = ''; // Clear
        const defaultOption = document.createElement('option');
        const isMandatory = type === 'shirt' || type === 'pants';
        const defaultKey = isMandatory ? (type === 'shirt' ? 'genericShirt' : 'genericPants') : null;

        if (isMandatory) {
          defaultOption.value = defaultKey;
          defaultOption.textContent = itemDefinitions[defaultKey].name;
        } else {
          defaultOption.value = ""; defaultOption.textContent = "-- None --";
        }
        selectElement.appendChild(defaultOption);
      });

      Object.keys(gameState.ownedItems).forEach(key => {
        if (gameState.ownedItems[key] && itemDefinitions[key]) {
          const item = itemDefinitions[key];
          const selectElement = selects[item.type];
          if (selectElement) {
            const isMandatory = item.type === 'shirt' || item.type === 'pants';
            const defaultKey = isMandatory ? (item.type === 'shirt' ? 'genericShirt' : 'genericPants') : null;
            // Don't add the generic item again if it was the default placeholder
            if (!isMandatory || key !== defaultKey) {
              const option = document.createElement('option');
              option.value = key; option.textContent = item.name;
              selectElement.appendChild(option);
            }
          }
        }
      });

      Object.entries(equipped).forEach(([type, currentKey]) => {
        const selectElement = selects[type];
        const isMandatory = type === 'shirt' || type === 'pants';
        const defaultKey = isMandatory ? (type === 'shirt' ? 'genericShirt' : 'genericPants') : null;

        if (currentKey && gameState.ownedItems[currentKey] && selectElement.querySelector(`option[value="${currentKey}"]`)) {
          selectElement.value = currentKey; // Select the owned item
        } else {
          // Item not owned or was null
          if (isMandatory) {
            // If mandatory item is somehow not owned/selected, force generic
            if (selectElement.value !== defaultKey) {
              equipItem(defaultKey, type); // This updates state AND calls muggability recalc
              selectElement.value = defaultKey; // Ensure UI matches
            }
          } else {
            // Optional item unequipped or lost
            if (currentKey) equipItem(null, type); // Unequip in state if it was equipped
            selectElement.value = ""; // Select '-- None --'
          }
        }
      });
    }
    function updateOwnedItemButtons() {
      Object.keys(itemDefinitions).forEach(key => {
        const buyButton = document.getElementById(`buy-${key}`);
        const item = itemDefinitions[key];
        if (buyButton && item && !item.nonBuyable) {
          const owned = gameState.ownedItems[key];
          buyButton.disabled = owned; // Disable if owned
          buyButton.textContent = owned ? `${item.name} (Owned)` : `${item.name} - $${item.cost.toFixed(2)}`;
        }
      });
      // Hide default item buttons if they exist
      ['buy-genericShirt', 'buy-genericPants'].forEach(id => {
        const btn = document.getElementById(id); if (btn) btn.style.display = 'none';
      });
    }
    function equipItem(itemKey, itemType) {
      itemKey = itemKey || null; // Handle empty string from select
      const isMandatory = itemType === 'shirt' || itemType === 'pants';
      const stateKey = `equipped${capitalizeFirstLetter(itemType)}`;

      if (!itemKey && isMandatory) {
        addNotification(`You must wear ${itemType === 'shirt' ? 'a shirt' : 'pants'}!`, "loss");
        const selectElement = (itemType === 'shirt') ? equipShirtSelect : equipPantsSelect;
        selectElement.value = gameState[stateKey]; // Revert UI select
        return;
      }

      if (itemKey === gameState[stateKey]) return; // No change

      const newItem = itemKey ? itemDefinitions[itemKey] : null;
      const newItemName = newItem ? newItem.name : "nothing";

      gameState[stateKey] = itemKey; // Update state
      addNotification(`Equipped ${newItemName} as ${itemType}.`, 'info');
      recalculateAndDisplayMuggability(); // Update effective muggability
    }
    function capitalizeFirstLetter(string) { return string.charAt(0).toUpperCase() + string.slice(1); }

    // --- Content from ageing.js ---
    const AGE_INTERVAL = 5 * 60 * 1000;
    const MOM_NAG_INTERVAL = 5 * 60 * 1000;
    const MOM_RANT_THRESHOLD = 12;
    function initAgeing() {
      updateElementText("age-display", gameState.age);
      setInterval(increaseAge, AGE_INTERVAL);
      setInterval(momNag, MOM_NAG_INTERVAL);
    }
    function increaseAge() {
      gameState.age++;
      gameState.clothesPrice = 15 + (gameState.age * 5); // Update price internally
      updateElementText("age-display", gameState.age);
      addNotification(`Happy Birthday! You are now ${gameState.age}.`, 'info');
      calculateAndApplyTaxes(); // Trigger taxes on birthday
    }
    function momNag() { /* ... (no changes needed) ... */
      gameState.momNagCount++;
      if (gameState.momNagCount < MOM_RANT_THRESHOLD) {
        const nags = ["Mom: Go shower.", "Mom: Have you showered recently?", "Don't forget you need to shower...", "Mom: You need to shower."];
        addNotification(nags[Math.floor(Math.random() * nags.length)], "mom");
      } else {
        const hours = Math.floor(gameState.momNagCount * 5 / 60);
        // Note: 'age' variable is not defined here, should use gameState.age
        const rant = `Mom: Okay, listen here! PLEASE, for the towers sake! GO TAKE A SHOWER! The neighbors are complaining! The dog DIED because you walked in the room! It has been ${gameState.age - 4} Years! Just... shower! PLEASE!`;
        addNotification(rant, "mom-rant");
      }
    }

    // --- Content from work_enhancements.js ---
    const DOG_WALKER_JOB_DURATION = 5000;

    // --- START: ADDED MISSING WORK FUNCTIONS ---
    const MINES_JOB_DURATION = 15000;
    const OFFICE_JOB_DURATION = 12000;
    const STAPLE_TABLES_JOB_DURATION = 4000;
    const NAP_DURATION = 5000;
    const SLEEP_DURATION = 10000; // Added missing sleep duration constant


    function workInMines() {
      if (gameState.isWorkingMines || isInSignificantDebt()) { if (isInSignificantDebt()) addNotification("Cannot start this job due to significant debt.", "loss"); return; }
      gameState.isWorkingMines = true; updateButtonStates(); addNotification("Started working in the mines.", "start");
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
        if (outcome.value > 0) { // Apply multiplier only to positive earnings
          finalValue = Math.floor(finalValue * (gameState.miningEfficiencyMultiplier || 1));
        }
        gameState.moneyEarned += finalValue;
        let notificationType = finalValue > 0 ? 'finish-success' : 'info';
        addNotification(`Finished mining. ${outcome.message} (+ $${finalValue.toFixed(2)})`, notificationType);
        updateMoneyDisplay(); gameState.isWorkingMines = false; updateButtonStates();
      }, MINES_JOB_DURATION);
    }

    function workInOfficeJob() {
      if (gameState.isWorkingOffice || isInSignificantDebt()) { if (isInSignificantDebt()) addNotification("Cannot start this job due to significant debt.", "loss"); return; }
      gameState.isWorkingOffice = true; updateButtonStates(); addNotification("Started working in the office.", "start");
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
        if (outcome.value > 0) { // Apply multiplier only to positive earnings
          finalValue = Math.floor(finalValue * (gameState.officeJobMultiplier || 1));
        }
        gameState.moneyEarned += finalValue;
        let notificationType = finalValue > 0 ? 'finish-success' : 'info';
        addNotification(`Finished office work. ${outcome.message} (+ $${finalValue.toFixed(2)})`, notificationType);
        updateMoneyDisplay(); gameState.isWorkingOffice = false; updateButtonStates();
        gameState.officeJobsCompleted = (gameState.officeJobsCompleted || 0) + 1; // Increment counter
      }, OFFICE_JOB_DURATION);
    }

    function workInStapleTables() {
      if (gameState.isWorkingStaples) return; // No debt check for this one as per original logic
      gameState.isWorkingStaples = true; updateButtonStates(); addNotification("Started stapling tables.", "start");
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
        // Assuming staplingSpeedMultiplier affects earnings indirectly by allowing more "jobs"
        // or directly if we interpret "faster" as "more efficient earning in same time"
        // For now, let's assume it doesn't directly multiply earnings here, but could be added.
        // If staplingSpeedMultiplier was meant to increase earnings:
        // if (outcome.value > 0) {
        //   finalValue = Math.floor(finalValue * (gameState.staplingSpeedMultiplier || 1));
        // }
        gameState.moneyEarned += finalValue;
        let notificationType = finalValue > 0 ? 'finish-success' : (finalValue < 0 ? 'finish-fail' : 'info');
        addNotification(`Finished stapling tables. ${outcome.message} (+ $${finalValue.toFixed(2)})`, notificationType);
        updateMoneyDisplay(); gameState.isWorkingStaples = false; updateButtonStates();
      }, STAPLE_TABLES_JOB_DURATION / (gameState.staplingSpeedMultiplier || 1)); // Speed multiplier reduces duration
    }

    function takeNap() {
      if (gameState.isTakingNap || isInSignificantDebt()) { if (isInSignificantDebt()) addNotification("Cannot nap due to debt stress.", "loss"); return; }
      gameState.isTakingNap = true; updateButtonStates(); addNotification("Taking a short nap...", "start");
      recordSleepOrNap(); // Record nap time for muggability
      setTimeout(() => {
        const napOutcome = Math.random();
        let napMessage = "";
        if (napOutcome < 0.6) { // 60% chance of good nap
          gameState.nextRollChance = "gain";
          napMessage = "Feeling refreshed! Next roll might be lucky.";
          addNotification(napMessage, "finish-success");
        } else if (napOutcome < 0.9) { // 30% chance of bad nap

          gameState.nextRollChance = "lose";
          napMessage = "Woke up groggy. Next roll might be unlucky.";
          addNotification(napMessage, "finish-fail");
        } else { // 10% chance of neutral nap
          gameState.nextRollChance = null; // No effect
          napMessage = "Nap was okay. No noticeable effect.";
          addNotification(napMessage, "info");
        }
        gameState.isTakingNap = false; updateButtonStates();
        gameState.napsTaken = (gameState.napsTaken || 0) + 1; // Increment counter
        // Note: Sleep level is not directly affected by nap in this version, only nextRollChance
        recalculateAndDisplayMuggability(); // Recalculate in case sleep level changed passively during nap
      }, NAP_DURATION);
    }
    // --- END: ADDED MISSING WORK FUNCTIONS ---

    function workAsDogWalker() { /* ... (no changes needed) ... */
      // if (gameState.isWalkingDog || isInSignificantDebt()) { if(isInSignificantDebt()) addNotification("Cannot start this job due to significant debt.", "loss"); return; }
      gameState.isWalkingDog = true; updateButtonStates(); addNotification("Started walking dogs.", "start");
      setTimeout(() => {
        const outcomes = [{ value: 120, message: "Walked a pack of happy pups!" }, { value: 0, message: "A dog tried to run away, but you caught it! Wasted time." }, { value: 200, message: "Found a lost wallet!" }, { value: 80, message: "Just a normal day." }, { value: 10, message: "Stepped in poop... but found a dollar!" }, { value: 50, message: "Taught a dog a new trick." }];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let finalValue = outcome.value;
        if (outcome.value > 0) { // Apply multiplier only to positive earnings
          finalValue = Math.floor(finalValue * (gameState.dogWalkerMultiplier || 1));
        }
        gameState.moneyEarned += finalValue;
        let notificationType = finalValue > 0 ? 'finish-success' : 'info';
        addNotification(`Finished walking dogs. ${outcome.message} (+ $${finalValue.toFixed(2)})`, notificationType);
        updateMoneyDisplay(); gameState.isWalkingDog = false; updateButtonStates();
        gameState.dogWalksCompleted = (gameState.dogWalksCompleted || 0) + 1; // Increment counter
      }, DOG_WALKER_JOB_DURATION);
    }

    // --- Content from location_taxes.js ---
    const locations = { "North Carolina": { totalTaxRate: 0.10, name: "North Carolina" } };
    function initLocationTaxes() {
      gameState.currentLocation = gameState.currentLocation || "North Carolina";
      updateElementText("location-display", locations[gameState.currentLocation]?.name || "Unknown");
    }
    function calculateAndApplyTaxes() { // Called by increaseAge
      const locationData = locations[gameState.currentLocation] || locations["North Carolina"];
      if (gameState.netMoney > 0) {
        let currentTaxRate = locationData.totalTaxRate;
        if (gameState.taxReductionMultiplier && gameState.taxReductionMultiplier !== 1) {
          currentTaxRate *= gameState.taxReductionMultiplier;
        }
        const taxAmount = Math.floor(gameState.netMoney * currentTaxRate);
        if (taxAmount > 0) {
          gameState.moneyLost += taxAmount;
          addNotification(`Paid $${taxAmount.toFixed(2)} in yearly taxes for ${locationData.name}. Happy Birthday?`, 'loss');
          updateMoneyDisplay();
        }
      }
    }

    // --- Content from hobbies.js ---
    // const SLEEP_DURATION = 10000; // Already defined
    // const SLEEP_RECOVERY = 50; // Will be replaced
    let SLEEP_RECOVERY_BASE = 50; // Changed to let and renamed
    const SLEEP_UPDATE_INTERVAL = 60 * 1000; // Corrected interval to 1 minute
    const FAINT_PENALTY = 50;
    function initHobbies() {
      updateElementText("sleep-level", gameState.sleepLevel);
      setInterval(updateSleepPassive, SLEEP_UPDATE_INTERVAL);
    }
    function sleepHobby() { /* ... (no changes needed) ... */
      if (gameState.isSleepingHobby || isInSignificantDebt()) { if (isInSignificantDebt()) addNotification("Cannot sleep properly due to debt stress.", "loss"); return; }
      gameState.isSleepingHobby = true; updateButtonStates(); addNotification("Going to sleep for a while...", "start");
      recordSleepOrNap();
      setTimeout(() => {
        let currentSleepRecovery = SLEEP_RECOVERY_BASE;
        if (gameState.sleepRecoveryMultiplier) {
          currentSleepRecovery = Math.floor(currentSleepRecovery * gameState.sleepRecoveryMultiplier);
        }
        gameState.sleepLevel = Math.min(gameState.sleepLevel + currentSleepRecovery, 100);
        updateElementText("sleep-level", gameState.sleepLevel);
        addNotification("You feel well-rested after sleeping!", "finish-success");
        gameState.isSleepingHobby = false; updateButtonStates();
        recalculateAndDisplayMuggability();
      }, SLEEP_DURATION);
    }
    function updateSleepPassive() { /* ... (no changes needed) ... */
      if (!gameState.isSleepingHobby && !gameState.isTakingNap) {
        gameState.sleepLevel = Math.max(gameState.sleepLevel - 1, 0);
        updateElementText("sleep-level", gameState.sleepLevel);
        recalculateAndDisplayMuggability();
        if (gameState.sleepLevel === 20) addNotification("Feeling tired...", "info");

        else if (gameState.sleepLevel === 5) addNotification("Barely keeping your eyes open...", "info");
        else if (gameState.sleepLevel <= 0) { faint(); }
      }
    }
    function faint() { /* ... (no changes needed) ... */
      if (gameState.sleepLevel > 0 || gameState.isTakingNap || gameState.isSleepingHobby) return;
      addNotification(`You fainted from exhaustion! Lost $${FAINT_PENALTY.toFixed(2)}.`, "loss");
      gameState.moneyLost += FAINT_PENALTY; gameState.sleepLevel = 15;
      updateElementText("sleep-level", gameState.sleepLevel); updateMoneyDisplay();
      recalculateAndDisplayMuggability();
      triggerFaintMugging();// Optional: Trigger mugging on fainting
    }

    // --- Content from ui_enhancements.js ---
    function initUIEnhancements() {
      initTabs(); // Initialize tabs first
      initCollapsibleShop();
    }
    function initCollapsibleShop() { /* ... (no changes needed, relies on CSS now) ... */
      const shopToggle = document.getElementById('shop-toggle');
      const shopContent = document.querySelector('.shopping-box .collapsible-content');
      const toggleIndicator = document.querySelector('#shop-toggle .toggle-indicator');
      if (shopToggle && shopContent && toggleIndicator) {
        // Check localStorage to set initial state
        const isCollapsed = localStorage.getItem('shopCollapsed') === 'true';
        shopContent.classList.toggle('collapsed', isCollapsed); // Apply 'collapsed' class if needed
        toggleIndicator.textContent = isCollapsed ? '►' : '▼'; // Set indicator based on state

        // Add click listener to toggle
        shopToggle.addEventListener('click', () => {
          const currentlyCollapsed = shopContent.classList.toggle('collapsed'); // Toggle the class
          toggleIndicator.textContent = currentlyCollapsed ? '►' : '▼'; // Update indicator
          localStorage.setItem('shopCollapsed', currentlyCollapsed); // Save state
        });
      } else { console.error("Collapsible shop elements not found!"); }
    }

    // --- START: Tabbed Interface Logic ---
    function initTabs() {
      const tabButtons = document.querySelectorAll('.tab-button');
      const tabContents = document.querySelectorAll('.tab-content');
      const defaultTab = 'gable'; // Default tab
      let activeTabId = localStorage.getItem('activeTabId_v15_1') || defaultTab; // Use versioned key

      function switchTab(tabId) {
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === tabId + '-tab') {
            content.classList.add('active');
          }
        });
        tabButtons.forEach(button => {
          button.classList.remove('active');
          if (button.dataset.tab === tabId) {
            button.classList.add('active');
          }
        });
        localStorage.setItem('activeTabId_v15_1', tabId); // Use versioned key
        activeTabId = tabId;
      }

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          switchTab(button.dataset.tab);
        });
      });

      // Ensure the initially active tab (from localStorage or default) is shown
      // And fallback if the stored tab ID doesn't correspond to an existing tab button
      let currentActiveButton = document.querySelector(`.tab-button[data-tab="${activeTabId}"]`);
      if (!currentActiveButton) {
        activeTabId = defaultTab; // Fallback to default if stored tab is invalid
      }
      switchTab(activeTabId);
    }
    // --- END: Tabbed Interface Logic ---

    // --- START: UPDATED Dice/Commit Logic with Reset Rule & Chiller Notifications ---
    const bankruptcyResetBtn = document.getElementById('bankruptcy-reset-btn'); // Keep reference

    function rollDice() {
      if (document.getElementById('roll-dice-btn').disabled) return;
      if (gameState.nextRollChance) handleNextRoll(); // Handle nap effects first

      // Check for penalty BEFORE rolling new dice if a win was available from the PREVIOUS roll state
      const potentialPointsBeforeRoll = gameState.dice.length === 4 ? gameState.dice.reduce((a, b) => a + b, 0) + gameState.bonusPoints : 0;
      if (potentialPointsBeforeRoll === 24 && !gameState.alreadyCounted) {
        gameState.missedWins++;
        gameState.moneyLost += MISSED_WIN_PENALTY;
        // Chiller notification for penalty
        addNotification(`Penalty: -$${MISSED_WIN_PENALTY.toFixed(2)} for not committing previous 24!`, "loss");
        gameState.alreadyCounted = true; // Mark penalty as applied FOR THE PREVIOUS POTENTIAL WIN
      }

      gameState.dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      gameState.totalRolls++;
      gameState.alreadyCounted = false; // Reset for the new roll's potential win state
      gameState.moneyLost += 1; // Cost to roll

      updateElementText("dice-rolls", gameState.dice.join(", "));
      updateElementText("total-rolls", gameState.totalRolls);

      const bonusThisRoll = calculateBonus(); // This now handles the reset logic internally
      const potentialTotal = updateTotalPoints(); // Update display

      // Chiller notification for roll result
      let rollMsg = `Rolled: ${gameState.dice.join(", ")}.`;
      if (bonusThisRoll > 0) {
        rollMsg += ` (+${bonusThisRoll} bonus this roll).`;
      }
      rollMsg += ` Total Bonus: ${gameState.bonusPoints}.`;
      rollMsg += ` Potential Score: ${potentialTotal}.`; // Keep potential score shown
      // addNotification(rollMsg, "info");

      updateMoneyDisplay(); // Update money and button states
    }

    function calculateBonus() {
      // Calculates bonus for the CURRENT gameState.dice.
      // If this roll yields 0 bonus, resets accumulated bonusPoints to 0.
      // Otherwise, adds this roll's bonus to the accumulated total.
      if (gameState.dice.length !== 4) return 0;

      const counts = {};
      let matchBonus = 0;
      let hasMatch = false;
      gameState.dice.forEach(num => {
        if (num !== 6) { counts[num] = (counts[num] || 0) + 1; }
      });
      Object.values(counts).forEach(count => {
        if (count >= 2) { matchBonus += (count - 1); hasMatch = true; }
      });

      const sortedUniqueDice = [...new Set(gameState.dice)].sort((a, b) => a - b);
      let runBonus = 0;
      let maxRunLength = 0;
      let currentRunLength = 0;
      for (let i = 0; i < sortedUniqueDice.length; i++) {
        if (i > 0 && sortedUniqueDice[i] === sortedUniqueDice[i - 1] + 1) { currentRunLength++; }
        else { currentRunLength = 1; }
        maxRunLength = Math.max(maxRunLength, currentRunLength);
      }
      if (maxRunLength >= 3) { runBonus = maxRunLength - 2; }

      let currentRollBonus = (hasMatch || runBonus > 0) ? (matchBonus + runBonus) : 0;

      // Apply lucky charm: adds +1 to bonus if any bonus was generated
      if (gameState.luckyCharmActive && currentRollBonus > 0) {
        currentRollBonus += 1;
      }

      // Apply dice bonus multiplier from "Premium Dice" upgrade
      if (gameState.diceBonusMultiplier && gameState.diceBonusMultiplier !== 1 && currentRollBonus > 0) {
        currentRollBonus = Math.floor(currentRollBonus * gameState.diceBonusMultiplier);
      }


      // --- NEW RESET LOGIC ---
      if (currentRollBonus === 0) {
        // If no bonus points were generated this roll, reset the accumulated total.
        if (gameState.bonusPoints > 0) { // Only notify if there *was* a bonus to lose
          //  addNotification("No bonus gained this roll. Accumulated bonus reset.", "info");
        }
        gameState.bonusPoints = 0;
      } else {
        // Otherwise, add this roll's bonus to the accumulated total.
        gameState.bonusPoints += currentRollBonus;
      }
      // --- END NEW RESET LOGIC ---

      // Update the display AFTER applying the logic
      updateElementText("bonus-points", gameState.bonusPoints);

      return currentRollBonus; // Return bonus generated *this* roll for logging
    }

    function updateTotalPoints() {
      // Updates the "Potential Total" display based on current dice and accumulated bonus
      if (gameState.dice.length !== 4) {
        updateElementText("total-points", "-");
        return 0; // Return 0 or some indicator if no dice
      }
      const diceSum = gameState.dice.reduce((a, b) => a + b, 0);
      const totalPoints = diceSum + gameState.bonusPoints;
      updateElementText("total-points", totalPoints);

      // Chiller notification for potential win
      if (totalPoints === 24 && !gameState.alreadyCounted) {
        // addNotification(`Score is 24 (${diceSum} + ${gameState.bonusPoints} bonus)! Commit now?`, "win");
      }
      return totalPoints; // Return the calculated total for logging
    }

    function commit() {
      if (document.getElementById('commit-btn').disabled) return;
      if (gameState.dice.length === 0) {
        addNotification("Roll the dice first!", "info");
        return;
      }

      const diceSum = gameState.dice.reduce((a, b) => a + b, 0);
      // Use the accumulated bonus points for the final check
      const totalPoints = diceSum + gameState.bonusPoints;

      // Chiller commit notifications
      if (totalPoints === 24) {
        gameState.consecutiveWins++;
        const currentWinStreakMultiplier = gameState.winStreakMultiplier || 1;
        const streakBonus = gameState.consecutiveWins * WIN_STREAK_BONUS_MULTIPLIER_BASE * currentWinStreakMultiplier;
        const winnings = BASE_WIN_AMOUNT + streakBonus;
        gameState.moneyEarned += winnings;
        gameState.wins++;
        updateElementText("wins", gameState.wins);
        addNotification(`COMMIT SUCCESS! Score: 24 (${diceSum} + ${gameState.bonusPoints}). Streak: ${gameState.consecutiveWins}x. Earned $${winnings.toFixed(2)}.`, "win");
        // unlock Upgrades tab on first win
        if (gameState.wins === 1) {
          const upBtn = document.getElementById("upgrades-tab-button");
          if (upBtn) upBtn.style.display = "";
          addNotification("Upgrades unlocked!", "win");
        }
      } else {
        gameState.moneyLost += COMMIT_FAIL_PENALTY;
        gameState.consecutiveWins = 0; // Reset streak on fail
        addNotification(`COMMIT FAILED! Score: ${totalPoints} (${diceSum} + ${gameState.bonusPoints}). Needed 24. Lost $${COMMIT_FAIL_PENALTY.toFixed(2)}. Streak reset.`, "loss");
      }

      // --- CRITICAL: Reset accumulated bonus points AFTER commit ---
      gameState.bonusPoints = 0;
      updateElementText("bonus-points", gameState.bonusPoints); // Update display to 0

      updateMoneyDisplay(); // Update money totals & button states
      resetDiceAfterCommit(); // Clear the dice display
    }

    function resetDiceAfterCommit() {
      // Clears dice display and related flags after a commit attempt
      gameState.dice = [];
      gameState.alreadyCounted = false; // Reset penalty flag as the commit resolved the situation
      updateElementText("dice-rolls", "-");
      updateElementText("total-points", "-"); // Clear potential total display until next roll
      updateButtonStates(); // Re-enable/disable buttons as needed
    }

    function handleNextRoll() {
      // This function remains the same, handling nap results before a roll
      if (!gameState.nextRollChance) return;

      let gainAmount = NAP_GAIN_AMOUNT;
      let lossAmount = NAP_LOSS_AMOUNT;

      if (gameState.napEffectivenessMultiplier && gameState.napEffectivenessMultiplier !== 1) {
        gainAmount = Math.floor(gainAmount * gameState.napEffectivenessMultiplier);
        lossAmount = Math.floor(lossAmount * gameState.napEffectivenessMultiplier); // Assuming multiplier also makes bad naps worse, or adjust as needed
      }

      if (gameState.nextRollChance === "gain") {
        gameState.moneyEarned += gainAmount;
        addNotification(`Well Rested bonus applied: +$${gainAmount.toFixed(2)}`, "finish-success");
      } else if (gameState.nextRollChance === "lose") {
        gameState.moneyLost += lossAmount;
        addNotification(`Poor Nap penalty applied: -$${lossAmount.toFixed(2)}`, "finish-fail");
      }
      gameState.nextRollChance = null;
      // updateMoneyDisplay() will be called by rollDice shortly after
    }
    // --- END: UPDATED Dice/Commit Logic ---

    // --- Upgrades System --- 
    // Define upgrade categories
    const UPGRADE_CATEGORIES = {
      DICE: "Dice Improvements",
      WORK: "Work Enhancements",
      SLEEP: "Sleep & Energy",
      SECURITY: "Security & Protection",
      SPECIAL: "Special Abilities"
    };

    // Define all possible upgrades
    const upgradeDefinitions = {
      //   betterDice: {
      //     id: "betterDice",
      //     name: "Premium Dice",
      //     description: "Higher quality dice that increase your bonus points by 50%",
      //     cost: 500,
      //     prerequisite: (state) => state.totalRolls >= 25,
      //     preReqDescription: "Roll dice 25 times",
      //     category: UPGRADE_CATEGORIES.DICE,
      //     effect: (state) => {
      //       state.diceBonusMultiplier = (state.diceBonusMultiplier || 1) * 1.5;
      //       addNotification("Your dice now generate 50% more bonus points!", "win");
      //     }
      //   },
      // luckyCharm: {
      //   id: "luckyCharm",
      //   name: "Lucky Rabbit's Foot",
      //   description: "Slightly increases bonus from matches/runs by +1 if any bonus is generated.",
      //   cost: 350,
      //   prerequisite: (state) => state.wins >= 3,
      //   preReqDescription: "Win 3 times",
      //   category: UPGRADE_CATEGORIES.DICE,
      //   effect: (state) => {
      //     state.luckyCharmActive = true;
      //     addNotification("Your lucky charm tingles with strange energy!", "win");
      //   }
      // },
      efficientMining: {
        id: "efficientMining",
        name: "Mining Efficiency",
        description: "Increases mining earnings by 175%. You found a stack of dynamite.",
        cost: 1000,
        prerequisite: (state) => state.moneyEarned >= 15000,
        preReqDescription: "Earn $15,000 total",
        category: UPGRADE_CATEGORIES.WORK,
        effect: (state) => {
          state.miningEfficiencyMultiplier = (state.miningEfficiencyMultiplier || 1) * 2.75;
          addNotification("You found a stack of dynamite.", "win");
        }
      },
      fasterStapling: {
        id: "fasterStapling",
        name: "Speed Stapler",
        description: "Stapling tables is 30% faster. A Stapling Gun makes every table better.",
        cost: 450,
        prerequisite: (state) => state.isWorkingStaples !== undefined,
        preReqDescription: "Staple tables at least once",
        category: UPGRADE_CATEGORIES.WORK,
        effect: (state) => {
          state.staplingSpeedMultiplier = (state.staplingSpeedMultiplier || 1) * 1.3;
          addNotification("A Stapling Gun makes every table better.", "win");
        }
      },
      deepSleep: {
        id: "deepSleep",
        name: "Deep Sleep Technique",
        description: "Sleeping recovers 30% more energy. Welcome to the 7 week sleep program!",
        cost: 600,
        prerequisite: (state) => state.sleepLevel !== undefined && state.sleepLevel < 30,
        preReqDescription: "Experience severe fatigue (sleep below 30)",
        category: UPGRADE_CATEGORIES.SLEEP,
        effect: (state) => {
          state.sleepRecoveryMultiplier = (state.sleepRecoveryMultiplier || 1) * 1.3;
          addNotification("Welcome to the 7 week sleep program!", "win");
        }
      },
      mugRepellent: {
        id: "mugRepellent",
        name: "Mug Repellent Spray",
        description: "Reduces your effective muggability by 15%. You smell awful.",
        cost: 750,
        prerequisite: (state) => calculateEffectiveMuggability() > 60, // Use the function directly
        preReqDescription: "Have high muggability (effective > 60)",
        category: UPGRADE_CATEGORIES.SECURITY,
        effect: (state) => {
          state.mugRepellentActive = true;
          // state.baseMuggability = Math.max(0, state.baseMuggability - 15); // Old effect
          addNotification("You smell terrible! No one wants mug you.", "win");
        }
      },
      winStreak: {
        id: "winStreak",
        name: "Win Streak Enhancer",
        description: "Increases consecutive win bonus multiplier by 50%",
        cost: 1200,
        prerequisite: (state) => state.consecutiveWins >= 3,
        preReqDescription: "Get 3 consecutive wins",
        category: UPGRADE_CATEGORIES.DICE,
        effect: (state) => {
          // window.WIN_STREAK_BONUS_MULTIPLIER *= 1.5; // Old way
          state.winStreakMultiplier = (state.winStreakMultiplier || 1) * 1.5;
          addNotification("The casino loved your generous bribes! Win streaks pay out more!", "win");
        }
      },
      taxEvasion: {
        id: "taxEvasion",
        name: "Creative Accounting",
        description: "Reduces yearly taxes by 10%. You found some 'loopholes'.",
        cost: 2000,
        prerequisite: (state) => state.age >= 6,
        preReqDescription: "Reach age 6 years old",
        category: UPGRADE_CATEGORIES.SPECIAL,
        effect: (state) => {
          state.taxReductionMultiplier = (state.taxReductionMultiplier && state.taxReductionMultiplier !== 1) ? state.taxReductionMultiplier - 0.9 : 0.9;
          addNotification("Let's just say you found some 'loopholes'!", "win");
        }
      },

      taxEvasion2: {
        id: "taxEvasion2",
        name: "Creative Banking",
        description: "Reduces yearly taxes by an additional 10%. Totaly legal.",
        cost: 2000,
        prerequisite: (state) => state.age >= 13,
        preReqDescription: "Reach age 13 years old",
        category: UPGRADE_CATEGORIES.SPECIAL,
        effect: (state) => {
          state.taxReductionMultiplier = state.taxReductionMultiplier ? state.taxReductionMultiplier - 0.1 : 0.8;
          addNotification("Your offshore accounts are working perfectly!", "win");
        }
      },

      taxEvasion3: {
        id: "taxEvasion3",
        name: "Creative Income",
        description: "Reduces yearly taxes by an additional 10%. Keep is secret, keep it safe.",
        cost: 2000,
        prerequisite: (state) => state.age >= 17,
        preReqDescription: "Reach age 17 years old",
        category: UPGRADE_CATEGORIES.SPECIAL,
        effect: (state) => {
          state.taxReductionMultiplier = state.taxReductionMultiplier ? state.taxReductionMultiplier - 0.1 : 0.7;
          addNotification("They can't tax it if they can't find it.", "win");
        }
      },

      taxEvasion4: {
        id: "taxEvasion4",
        name: "Creative Spending",
        description: "Reduces yearly taxes by an additional 10%. That wan't me, that was my twin.",
        cost: 2000,
        prerequisite: (state) => state.age >= 21,
        preReqDescription: "Reach age 21 years old",
        category: UPGRADE_CATEGORIES.SPECIAL,
        effect: (state) => {
          state.taxReductionMultiplier = state.taxReductionMultiplier ? state.taxReductionMultiplier - 0.1 : 0.6;
          addNotification("Only spend through alternative identities.", "win");
        }
      },

      taxEvasion5: {
        id: "taxEvasion5",
        name: "Creative Dividends",
        description: "Reduces yearly taxes by an additional 10%. It was for a good cause... probably.",
        cost: 2000,
        prerequisite: (state) => state.age >= 43,
        preReqDescription: "Reach age 43 years old",
        category: UPGRADE_CATEGORIES.SPECIAL,
        effect: (state) => {
          state.taxReductionMultiplier = state.taxReductionMultiplier ? state.taxReductionMultiplier - 0.1 : 0.5;
          addNotification("If I am to help the fish; I won't be taxed for it!", "win");
        }
      },

      officeProductivitySuite: {
        id: "officeProductivitySuite",
        name: "Office Productivity Suite",
        description: "Increases office job earnings by 20%. Finaly upgraded from Winodws 8.1.",
        cost: 700,
        prerequisite: (state) => (state.officeJobsCompleted || 0) >= 3,
        preReqDescription: "Complete office job 3 times",
        category: UPGRADE_CATEGORIES.WORK,
        effect: (state) => {
          state.officeJobMultiplier = (state.officeJobMultiplier || 1) * 1.20;
          addNotification("New software, office work more profitable!", "win");
        }
      },
      dogTrainingManual: {
        id: "dogTrainingManual",
        name: "Dog Training Manual",
        description: "Increases dog walking earnings by 30%. Seven dog training manuals.",
        cost: 550,
        prerequisite: (state) => (state.dogWalksCompleted || 0) >= 5,
        preReqDescription: "Walk dogs 5 times",
        category: UPGRADE_CATEGORIES.WORK,
        effect: (state) => {
          state.dogWalkerMultiplier = (state.dogWalkerMultiplier || 1) * 1.30;
          addNotification("Manage dogs more effectively!", "win");
        }
      },
      powerNapTechniques: {
        id: "powerNapTechniques",
        name: "Power Nap Techniques",
        description: "Naps are 25% more powerful (both gains and losses). Seven week nap program.",
        cost: 400,
        prerequisite: (state) => (state.napsTaken || 0) >= 3,
        preReqDescription: "Take 3 naps",
        category: UPGRADE_CATEGORIES.SLEEP,
        effect: (state) => {
          state.napEffectivenessMultiplier = (state.napEffectivenessMultiplier || 1) * 1.25;
          addNotification("Your power naps are now supererer!", "win");
        }
      },
      // NEW: unlocks the Shop tab
      shopAccess: {
        id: "shopAccess",
        name: "Shopping Liscense",
        description: "You discover the local walmart. You could buy things, if you have money.",
        cost: 5000,
        prerequisite: state => state.age >= 6 && state.totalRolls >= 50,
        preReqDescription: "Reach age 6 and roll dice 50 times",
        category: UPGRADE_CATEGORIES.SPECIAL,
        effect: state => {
          const btn = document.getElementById("shop-tab-button");
          if (btn) btn.style.display = "";
          addNotification("Shopping!", "win");
        }
      },
      gableismsAccess: {
        id: "gableismsAccess",
        name: "Gableisms License",
        description: "Hello! Are you do need inspiration?",
        cost: 3000,
        prerequisite: state => state.wins >= 2,
        preReqDescription: "Gable properly 2 times",
        category: UPGRADE_CATEGORIES.SPECIAL,
        effect: state => {
          const btn = document.getElementById("gableisms-tab-button");
          if (btn) btn.style.display = "";
          addNotification("Hello? Are you do lightbulb?", "win");
        }
      },
      statusAccess: {
        id: "statusAccess",
        name: "Stats & Actions Access",
        description: "So you want to work, eh?",
        cost: 2500,
        prerequisite: state => state.age >= 10,
        preReqDescription: "Reach the age of 10. Its not child labor if you are 10...",
        category: UPGRADE_CATEGORIES.SPECIAL,
        effect: state => {
          const btn = document.getElementById("status-tab-button");
          if (btn) btn.style.display = "";
          addNotification("Working.", "win");
        }
      },
    };

    // Initialize upgrades in gameState
    function initUpgrades() {
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

    // Check which upgrades should be available based on prerequisites
    function checkForNewUpgrades() {
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

    // Purchase an upgrade
    function purchaseUpgrade(upgradeId) {
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

      // Notification
      // addNotification(`Purchased upgrade: ${upgrade.name} for $${upgrade.cost.toFixed(2)}!`, "win");
    }

    // Render the upgrades UI
    function renderUpgrades() {
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

            upgradeDiv.addEventListener('click', () => {
              if (canAfford) {
                purchaseUpgrade(upgrade.id);
              } else {
                addNotification(`Cannot afford ${upgrade.name} yet. Need $${upgrade.cost.toFixed(2)}.`, "info");
              }
            });

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
            upgradeDiv.className = 'upgrade-item';
            upgradeDiv.innerHTML = `
                <div class="upgrade-badge">Owned</div>
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

    // Modify the calculateBonus function to use the dice bonus multiplier
    // const originalCalculateBonus = calculateBonus; // No longer needed, direct modification
    // calculateBonus = function() { // No longer needed
    // ...
    // }; // No longer needed

    // Modify workInMines to use mining efficiency multiplier
    // const originalWorkInMines = workInMines; // No longer needed
    // workInMines = function() { // No longer needed
    // ...
    // }; // No longer needed

    // Add initUpgrades to the game initialization
    // const originalInitGame = initGame; // This pattern is fine for initGame itself
    // initGame = function() {
    //  originalInitGame();
    //  initUpgrades();
    // }; // This should be done at the end of the script or where initGame is defined.

    // --- START: Developer Cheat Function & visibility toggle ---
    function activateCheat() {
      if (!confirm("Enable developer cheats?")) return;
      if (confirm("Give all upgrades?")) {
        Object.keys(upgradeDefinitions).forEach(id => {
          if (!gameState.purchasedUpgrades.includes(id)) {
            gameState.purchasedUpgrades.push(id);
            upgradeDefinitions[id].effect(gameState);
          }
        });
        gameState.availableUpgrades = [];
        renderUpgrades();
      }
      const ageInput = prompt("What age would you like to be?", gameState.age);
      const age = parseInt(ageInput, 10);
      if (!isNaN(age)) {
        gameState.age = age;
        updateElementText("age-display", age);
        gameState.clothesPrice = 15 + (gameState.age * 5); // Update clothesPrice
      }
      const moneyInput = prompt("How much money?", gameState.moneyEarned.toFixed(2));
      const money = parseFloat(moneyInput);
      if (!isNaN(money)) {
        gameState.moneyEarned = money;
        gameState.moneyLost = 0;
        updateMoneyDisplay();
      }
      addNotification("Cheats applied.", "info");
    }
    // --- END: Developer Cheat Function & visibility toggle ---

    // --- START: Game Persistence (Save/Load/Reset) ---
    function saveGame() {
      try {
        const dataToSave = { ...gameState, gameVersion: GAME_VERSION_STRING };
        localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(dataToSave));
        // addNotification("Game saved automatically.", "info");
      } catch (error) {
        console.error("Error saving game:", error);
        addNotification("Failed to save game.", "loss");
      }
    }

    function loadGame() {
      try {
        const savedData = localStorage.getItem(SAVE_GAME_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          // Basic version check (can be expanded)
          if (parsedData.gameVersion !== GAME_VERSION_STRING) {
            addNotification(`Save data is from a different version (${parsedData.gameVersion || 'older'}). Starting new game.`, "info");
            resetGameAll(false); // Reset without confirmation if version mismatch
            return;
          }
          Object.assign(gameState, parsedData);
          addNotification("Game loaded successfully.", "info");
        } else {
          // No save data, initialize new game (already handled by default gameState)
          addNotification("No save data found. Starting a new game.", "info");
          // Ensure default items are present for a truly new game
          gameState.ownedItems = { genericShirt: true, genericPants: true };
          gameState.equippedShirt = 'genericShirt';
          gameState.equippedPants = 'genericPants';
        }
      } catch (error) {
        console.error("Error loading game:", error);
        addNotification("Failed to load saved game. Starting new game.", "loss");
        resetGameAll(false); // Reset to a clean state on error
      }
      // Ensure essential UI updates after load or new game start
      updateMoneyDisplay();
      updateElementText("age-display", gameState.age);
      updateElementText("location-display", locations[gameState.currentLocation]?.name || "Unknown");
      updateElementText("sleep-level", gameState.sleepLevel);
      recalculateAndDisplayMuggability();
      // Other UI updates might be needed here depending on loaded state
    }

    function resetGameAll(confirmReset = true) {
      if (confirmReset) {
        if (!confirm(`Are you sure you want to reset all game data? This cannot be undone.`)) {
          return;
        }
      }
      localStorage.removeItem(SAVE_GAME_KEY);
      // Reset gameState to its initial default values (deep copy if complex defaults)
      // For now, a simple re-assignment of the initial object structure is okay
      // but this might need a more robust reset if gameState becomes very complex.
      // Create a fresh default state:
      const defaultState = {
        wins: 0, consecutiveWins: 0, missedWins: 0,
        bonusPoints: 0, totalRolls: 0, dice: [], alreadyCounted: false,
        moneyEarned: 0, moneyLost: 0, netMoney: 0,
        isWorkingMines: false, isWorkingOffice: false, isWorkingStaples: false, isTakingNap: false, isWorkingDog: false, isSleepingHobby: false,
        nextRollChance: null,
        age: 4, clothesPrice: 15 + (4 * 5), lastClothingChange: Date.now(), currentLocation: "North Carolina",
        sleepLevel: 100, slaves: 0, momNagCount: 0,
        baseMuggability: 50, lastSleepOrNapTime: Date.now(),
        ownedItems: { genericShirt: true, genericPants: true },
        equippedHat: null, equippedJacket: null, equippedShirt: 'genericShirt',
        equippedPants: 'genericPants', equippedShoes: null, equippedSocks: null,
        // Upgrade-related state properties
        purchasedUpgrades: [],
        availableUpgrades: [],
        diceBonusMultiplier: 1, miningEfficiencyMultiplier: 1, staplingSpeedMultiplier: 1,
        sleepRecoveryMultiplier: 1, winStreakMultiplier: 1, taxReductionMultiplier: 1,
        luckyCharmActive: false, mugRepellentActive: false, officeJobMultiplier: 1,
        dogWalkerMultiplier: 1, napEffectivenessMultiplier: 1,
        // Counters for prerequisites
        officeJobsCompleted: 0, dogWalksCompleted: 0, napsTaken: 0,
      };
      // Clear current gameState and assign defaults
      for (const key in gameState) { delete gameState[key]; } // Clear existing
      Object.assign(gameState, defaultState); // Assign new defaults

      addNotification("Game has been reset.", "info");

      // Re-initialize UI and systems that depend on a fresh state
      // This is a bit like a mini initGame without the event listeners part
      // but we might need to reload the page to fully reset all aspects.
      // For now, let's just ensure the critical parts are reset:
      updateMoneyDisplay();
      updateElementText("dice-rolls", "-");
      updateElementText("bonus-points", "0");
      updateElementText("total-points", "-");
      updateElementText("wins", "0");
      updateElementText("total-rolls", "0");
      updateElementText("age-display", gameState.age);
      updateElementText("location-display", locations[gameState.currentLocation]?.name || "Unknown");
      updateElementText("sleep-level", gameState.sleepLevel);

      // Re-initialize shop and equipment UI
      populateShopGrids(); // Repopulate shop buttons
      updateEquipmentSelectors(); // Reset dropdowns and equipped items
      updateOwnedItemButtons(); // Update buy button states

      // Re-initialize upgrades UI
      checkForNewUpgrades(); // Check for initially available upgrades
      renderUpgrades();     // Render the upgrade UI

      // hide Shop & Gableisms tabs after reset
      const shopBtn = document.getElementById("shop-tab-button");
      if (shopBtn) shopBtn.style.display = "none";
      const gblBtn = document.getElementById("gableisms-tab-button");
      if (gblBtn) gblBtn.style.display = "none";
      const statusBtn = document.getElementById("status-tab-button");
      if (statusBtn) statusBtn.style.display = "none";

      // hide Upgrades until first win
      const upgradesBtn = document.getElementById("upgrades-tab-button");
      if (upgradesBtn) upgradesBtn.style.display = "none";

      updateButtonStates(); // Ensure buttons reflect initial state

      // If called without confirmation (e.g., version mismatch, load error),
      // we might not want to reload the page, but ensure a clean start.
      // If called by user, a reload can be an option to ensure full clean state.
      if (confirmReset) { // Only reload if user initiated with confirmation
        // window.location.reload(); // Optionally reload for a full reset
      }
    }
    // --- END: Game Persistence ---

    // --- Game Initialization ---
    function initGame() {
      console.log(`Initializing Game ${GAME_VERSION_STRING}...`);
      loadGame(); // Load or initialize new game state & UI

      // persist Upgrades tab visibility after load
      const upgradesBtn = document.getElementById("upgrades-tab-button");
      if (upgradesBtn) upgradesBtn.style.display = gameState.wins >= 1 ? "" : "none";

      // FIXED: Restore tab visibility based on purchased upgrades
      restoreTabVisibility();

      // Initialize systems
      initAgeing();
      initLocationTaxes();
      initHobbies();
      initShopping(); // Must be after tabs if it relies on elements within tabs being visible/accessible
      initMuggability(); // Added this call as it was missing from the original initGame
      initUIEnhancements(); // Calls initTabs and initCollapsibleShop
      initUpgrades(); // Initialize the upgrade system

      // Attach button listeners
      const buttonMappings = {
        "roll-dice-btn": rollDice,
        "commit-btn": commit,
        "work-in-mines-btn": workInMines,
        "work-in-office-btn": workInOfficeJob,
        "work-staple-tables-btn": workInStapleTables,
        "take-nap-btn": takeNap,
        "work-dog-walker-btn": workAsDogWalker,
        "sleep-hobby-btn": sleepHobby,
        "bankruptcy-reset-btn": () => resetGameAll(true),
        "manual-save-btn": () => {
          saveGame();
          addNotification("Game saved manually.", "info");
          // Flash confirmation
          const saveBtn = document.getElementById("manual-save-btn");
          if (saveBtn) {
            saveBtn.innerHTML = "✓ Saved!";
            setTimeout(() => { saveBtn.innerHTML = "Save Game"; }, 1500);
          }
        }
      };

      Object.entries(buttonMappings).forEach(([id, func]) => {
        const button = document.getElementById(id);
        if (button) button.onclick = func;
        else console.warn(`Button with ID "${id}" not found during init.`);
      });

      // Ensure reset button is enabled from the start
      const resetButton = document.getElementById('bankruptcy-reset-btn');
      if (resetButton) resetButton.disabled = false;

      // make cheat button always visible and bind handler
      const cheatBtn = document.getElementById('dev-cheat-btn');
      if (cheatBtn) {
        cheatBtn.style.display = 'inline-block';
        cheatBtn.onclick = activateCheat;
      }

      // Autosave interval
      setInterval(saveGame, 60 * 1000); // Save every 60 seconds

      // Initial bankruptcy check & UI update
      checkBankruptcy();
      updateButtonStates(); // Ensure buttons reflect initial state

      addNotification(`Welcome to the Tower of Gable - ${GAME_VERSION_STRING}`, "info");
      console.log("Game Initialized.");
    }

    // ADD: Function to restore tab visibility based on purchased upgrades
    function restoreTabVisibility() {
      // Check for shop access upgrade
      if (gameState.purchasedUpgrades.includes('shopAccess')) {
        const shopBtn = document.getElementById("shop-tab-button");
        if (shopBtn) shopBtn.style.display = "";
      }

      // Check for gableisms access upgrade
      if (gameState.purchasedUpgrades.includes('gableismsAccess')) {
        const gableismsBtn = document.getElementById("gableisms-tab-button");
        if (gableismsBtn) gableismsBtn.style.display = "";
      }

      // Check for status access upgrade
      if (gameState.purchasedUpgrades.includes('statusAccess')) {
        const statusBtn = document.getElementById("status-tab-button");
        if (statusBtn) statusBtn.style.display = "";
      }
    }

    // --- Start the game ---
    window.addEventListener("load", initGame);

    // --- END OF CONSOLIDATED JAVASCRIPT ---
