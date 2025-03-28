// items.js

// Helper function for costs (can adjust base cost later)
const calculateCost = (base) => base * 10 + 50; // Example cost calculation

export const itemDefinitions = {
    // --- Helms (Decrease Muggability) ---
    knightHelm: { name: "Knight Helm", cost: calculateCost(15), type: 'hat', effects: { muggability: -8 } },
    constructionHelm: { name: "Hard Hat", cost: calculateCost(8), type: 'hat', effects: { muggability: -4 } },
    hophatHelm: { name: "Bunny Ears", cost: calculateCost(5), type: 'hat', effects: { muggability: -2 } }, // Silly helm
    potHelm: { name: "Pot Lid", cost: calculateCost(2), type: 'hat', effects: { muggability: -1 } },
    footballHelm: { name: "Football Helmet", cost: calculateCost(12), type: 'hat', effects: { muggability: -6 } },
    vikingHelm: { name: "Viking Helmet", cost: calculateCost(14), type: 'hat', effects: { muggability: -7 } },
    spaceHelm: { name: "Space Helmet (Visor Up)", cost: calculateCost(20), type: 'hat', effects: { muggability: -10 } },
    divingHelm: { name: "Old Diving Helmet", cost: calculateCost(18), type: 'hat', effects: { muggability: -9 } },

    // --- Other Hats ---
    basicCap: { name: "Basic Cap", cost: calculateCost(3), type: 'hat', effects: {} },
    beanie: { name: "Beanie", cost: calculateCost(4), type: 'hat', effects: { muggability: +1 } }, // Slightly muggable
    fedora: { name: "Fedora", cost: calculateCost(7), type: 'hat', effects: { muggability: +2 } },
    topHat: { name: "Top Hat", cost: calculateCost(10), type: 'hat', effects: { muggability: +3 } }, // Fancy
    cowboyHat: { name: "Cowboy Hat", cost: calculateCost(9), type: 'hat', effects: {} },
    propellerHat: { name: "Propeller Hat", cost: calculateCost(6), type: 'hat', effects: { muggability: -1 } }, // Distracting
    wizardHat: { name: "Wizard Hat", cost: calculateCost(13), type: 'hat', effects: { muggability: +2 } }, // Suspicious
    chefHat: { name: "Chef Hat", cost: calculateCost(5), type: 'hat', effects: {} },
    ushanka: { name: "Ushanka", cost: calculateCost(11), type: 'hat', effects: {} },
    sombrero: { name: "Sombrero", cost: calculateCost(10), type: 'hat', effects: {} },


    // --- Jackets ---
    cloak: { name: "Mysterious Cloak", cost: calculateCost(12), type: 'jacket', effects: { muggability: -5 } }, // Decrease
    trenchCoat: { name: "Shady Trench Coat", cost: calculateCost(10), type: 'jacket', effects: { muggability: +5 } }, // Increase
    leatherJacket: { name: "Leather Jacket", cost: calculateCost(15), type: 'jacket', effects: { muggability: +3 } },
    denimJacket: { name: "Denim Jacket", cost: calculateCost(8), type: 'jacket', effects: {} },
    hoodie: { name: "Hoodie", cost: calculateCost(7), type: 'jacket', effects: { muggability: +2 } }, // Slightly increases
    blazer: { name: "Blazer", cost: calculateCost(14), type: 'jacket', effects: { muggability: +1 } }, // Professional
    puffyJacket: { name: "Puffy Jacket", cost: calculateCost(11), type: 'jacket', effects: {} },
    rainCoat: { name: "Rain Coat", cost: calculateCost(9), type: 'jacket', effects: {} },
    labCoat: { name: "Lab Coat", cost: calculateCost(13), type: 'jacket', effects: {} }, // Looks official
    vest: { name: "Vest", cost: calculateCost(6), type: 'jacket', effects: {} },
    bomberJacket: { name: "Bomber Jacket", cost: calculateCost(16), type: 'jacket', effects: { muggability: +2 } },
    trackJacket: { name: "Track Jacket", cost: calculateCost(8), type: 'jacket', effects: {} },
    cardigan: { name: "Cardigan", cost: calculateCost(9), type: 'jacket', effects: {} },
    poncho: { name: "Poncho", cost: calculateCost(7), type: 'jacket', effects: { muggability: -1 } }, // Harder to grab
    straitjacket: { name: "Straitjacket", cost: calculateCost(20), type: 'jacket', effects: { muggability: -10 } }, // Nobody wants to mug this person
    highVisJacket: { name: "High-Vis Jacket", cost: calculateCost(5), type: 'jacket', effects: { muggability: -2 } }, // Visible, seems official
};