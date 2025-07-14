// --- UI Enhancement Logic ---
export function initUIEnhancements() {
    initTabs(); // Initialize tabs first
    initCollapsibleShop();
}

export function initCollapsibleShop() {
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
    } else {
        console.error("Collapsible shop elements not found!");
    }
}

export function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const defaultTab = 'gable'; // Default tab
    let activeTabId;

    // Helper: Find first visible tab button
    function getFirstVisibleTabId() {
        for (const btn of tabButtons) {
            if (btn.style.display !== 'none') {
                return btn.dataset.tab;
            }
        }
        return defaultTab;
    }

    // On load, get stored tab, but fallback to visible/default if needed
    activeTabId = localStorage.getItem('activeTabId') || defaultTab;
    // If the stored tab is hidden, fallback to first visible
    let currentActiveButton = document.querySelector(`.tab-button[data-tab="${activeTabId}"]`);
    if (!currentActiveButton || currentActiveButton.style.display === 'none') {
        activeTabId = getFirstVisibleTabId();
    }

    function switchTab(tabId) {
        // Only switch if the tab button is visible
        const btn = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (!btn || btn.style.display === 'none') {
            tabId = getFirstVisibleTabId();
        }

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
        localStorage.setItem('activeTabId', tabId);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.style.display !== 'none') {
                switchTab(button.dataset.tab);
            }
        });
    });

    switchTab(activeTabId);
}

export function setupTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(tab).style.display = 'block';
        });
    });
    // Initially show the first tab
    document.getElementById('main-tab').style.display = 'block';
}

export function makeShopCollapsible() {
    const shopContainer = document.getElementById('shop-container');
    const h2 = shopContainer.querySelector('h2');
    const shopItems = document.getElementById('shop-items');

    h2.addEventListener('click', () => {
        if (shopItems.style.display === 'none') {
            shopItems.style.display = 'block';
            h2.textContent = 'Shop (Click to Collapse)';
        } else {
            shopItems.style.display = 'none';
            h2.textContent = 'Shop (Click to Expand)';
        }
    });
}
