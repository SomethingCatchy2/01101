// items.js
// Defines all purchasable items, their properties, costs, and effects.

// Helper function for costs (can adjust base cost later)
// Simple linear cost for now, easy to adjust multiplier/base
const calculateCost = (base) => base * 12 + 40;

export const itemDefinitions = {
    // --- Helms (Decrease Muggability) ---
    knightHelm: { name: "Knight Helm", cost: calculateCost(15), type: 'hat', effects: { muggability: -8 } },
    constructionHelm: { name: "Hard Hat", cost: calculateCost(8), type: 'hat', effects: { muggability: -4 } },
    hophatHelm: { name: "Bunny Ears", cost: calculateCost(5), type: 'hat', effects: { muggability: -2 } }, // Silly helm
    potHelm: { name: "Pot Lid", cost: calculateCost(2), type: 'hat', effects: { muggability: -1 } },
    footballHelm: { name: "Football Helmet", cost: calculateCost(12), type: 'hat', effects: { muggability: -6 } },
    vikingHelm: { name: "Viking Helmet (Horns)", cost: calculateCost(14), type: 'hat', effects: { muggability: -7 } },
    spaceHelm: { name: "Space Helmet", cost: calculateCost(20), type: 'hat', effects: { muggability: -10 } },
    divingHelm: { name: "Old Diving Helmet", cost: calculateCost(18), type: 'hat', effects: { muggability: -9 } },

    // --- Other Hats (Varying Effects) ---
    basicCap: { name: "Basic Cap", cost: calculateCost(3), type: 'hat', effects: {} },
    beanie: { name: "Beanie", cost: calculateCost(4), type: 'hat', effects: { muggability: +1 } }, // Slightly more noticeable/grab-able
    fedora: { name: "Fedora", cost: calculateCost(7), type: 'hat', effects: { muggability: +2 } }, // A certain connotation...
    topHat: { name: "Top Hat", cost: calculateCost(10), type: 'hat', effects: { muggability: +3 } }, // Signifies potential wealth
    cowboyHat: { name: "Cowboy Hat", cost: calculateCost(9), type: 'hat', effects: {} },
    propellerHat: { name: "Propeller Hat", cost: calculateCost(6), type: 'hat', effects: { muggability: -1 } }, // Too silly to mug?
    wizardHat: { name: "Wizard Hat", cost: calculateCost(13), type: 'hat', effects: { muggability: +2 } }, // Draws attention
    chefHat: { name: "Chef Hat", cost: calculateCost(5), type: 'hat', effects: {} },
    ushanka: { name: "Ushanka", cost: calculateCost(11), type: 'hat', effects: {} }, // Warm, maybe less wealthy looking?
    sombrero: { name: "Sombrero", cost: calculateCost(10), type: 'hat', effects: { muggability: -1 } }, // Wide brim awkward
    partyHat: { name: "Party Hat", cost: calculateCost(1), type: 'hat', effects: {} }, // Cheap fun
    bowlerHat: { name: "Bowler Hat", cost: calculateCost(8), type: 'hat', effects: { muggability: +1 } },
    crown: { name: "Plastic Crown", cost: calculateCost(4), type: 'hat', effects: {} },
    santaHat: { name: "Santa Hat", cost: calculateCost(6), type: 'hat', effects: {} },
    pirateHat: { name: "Pirate Hat", cost: calculateCost(12), type: 'hat', effects: { muggability: +3 } }, // Looks for trouble


    // --- Jackets (Varying Effects) ---
    cloak: { name: "Mysterious Cloak", cost: calculateCost(12), type: 'jacket', effects: { muggability: -5 } }, // Concealing
    trenchCoat: { name: "Shady Trench Coat", cost: calculateCost(10), type: 'jacket', effects: { muggability: +5 } }, // Suspicious looking
    leatherJacket: { name: "Leather Jacket", cost: calculateCost(15), type: 'jacket', effects: { muggability: +3 } }, // Tough/expensive looking
    denimJacket: { name: "Denim Jacket", cost: calculateCost(8), type: 'jacket', effects: {} }, // Neutral
    hoodie: { name: "Hoodie", cost: calculateCost(7), type: 'jacket', effects: { muggability: +2 } }, // Common for concealing identity
    blazer: { name: "Blazer", cost: calculateCost(14), type: 'jacket', effects: { muggability: +1 } }, // Professional, maybe has money?
    puffyJacket: { name: "Puffy Jacket", cost: calculateCost(11), type: 'jacket', effects: {} }, // Bulky
    rainCoat: { name: "Rain Coat", cost: calculateCost(9), type: 'jacket', effects: {} }, // Practical
    labCoat: { name: "Lab Coat", cost: calculateCost(13), type: 'jacket', effects: { muggability: -2 } }, // Looks official/busy
    vest: { name: "Vest", cost: calculateCost(6), type: 'jacket', effects: {} }, // Minimal
    bomberJacket: { name: "Bomber Jacket", cost: calculateCost(16), type: 'jacket', effects: { muggability: +2 } }, // Stylish/potentially expensive
    trackJacket: { name: "Track Jacket", cost: calculateCost(8), type: 'jacket', effects: {} }, // Sporty
    cardigan: { name: "Cardigan", cost: calculateCost(9), type: 'jacket', effects: { muggability: -1 } }, // Unassuming
    poncho: { name: "Poncho", cost: calculateCost(7), type: 'jacket', effects: { muggability: -1 } }, // Awkward shape
    straitjacket: { name: "Straitjacket", cost: calculateCost(20), type: 'jacket', effects: { muggability: -10 } }, // Avoid this person
    highVisJacket: { name: "High-Vis Jacket", cost: calculateCost(5), type: 'jacket', effects: { muggability: -3 } }, // Looks like working/no time
    tuxedoJacket: { name: "Tuxedo Jacket", cost: calculateCost(25), type: 'jacket', effects: { muggability: +6 } }, // Clearly has money (or pretends to)
    furCoat: { name: "Fake Fur Coat", cost: calculateCost(22), type: 'jacket', effects: { muggability: +7 } }, // Flashy
    motorcycleJacket: { name: "Motorcycle Jacket", cost: calculateCost(17), type: 'jacket', effects: { muggability: -4 } }, // Looks tough
};