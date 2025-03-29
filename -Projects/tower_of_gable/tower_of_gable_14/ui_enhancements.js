// ui_enhancements.js
// Handles UI interactions like collapsible sections.

/**
 * Initializes UI enhancement features.
 */
export function initUIEnhancements() {
    initCollapsibleShop();
}

/**
 * Adds click listener to the shopping section toggle.
 */
function initCollapsibleShop() {
    const shopToggle = document.getElementById('shop-toggle');
    const shopContent = document.querySelector('.shopping-box .collapsible-content');
    const toggleIndicator = document.querySelector('#shop-toggle .toggle-indicator');

    if (shopToggle && shopContent && toggleIndicator) {
        // Check local storage for initial state (optional persistence)
        const isCollapsed = localStorage.getItem('shopCollapsed') === 'true';
        if (isCollapsed) {
            shopContent.classList.add('collapsed');
            toggleIndicator.textContent = '►'; // Closed state
        } else {
            shopContent.classList.remove('collapsed'); // Ensure it's open if not collapsed
            toggleIndicator.textContent = '▼'; // Open state
        }


        shopToggle.addEventListener('click', () => {
            const currentlyCollapsed = shopContent.classList.toggle('collapsed');
            toggleIndicator.textContent = currentlyCollapsed ? '►' : '▼';

            // Store state in local storage (optional)
            localStorage.setItem('shopCollapsed', currentlyCollapsed);
        });
    } else {
        console.error("Collapsible shop elements not found!");
    }
}