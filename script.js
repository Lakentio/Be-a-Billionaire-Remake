// Game state
const storedNetWorth = localStorage.getItem('selectedBillionaireNetWorth');
console.log('Retrieved stored net worth:', storedNetWorth);

let remainingBudget = storedNetWorth ? Number(storedNetWorth) : 100000000000;
console.log('Initial remaining budget:', remainingBudget);

const initialBudget = remainingBudget;
console.log('Initial budget set to:', initialBudget);

// Redirect to menu if no billionaire was selected
if (!storedNetWorth) {
    window.location.href = 'menu.html';
}

const cart = new Map();
const stats = {
    totalPurchases: 0,
    totalSales: 0,
    moneySpent: 0,
    itemsPurchased: new Map()
};

// Achievements system
const achievements = [
    {
        id: 'first_purchase',
        name: 'First Purchase',
        description: 'Buy your first item',
        icon: 'shopping-cart',
        unlocked: false
    },
    {
        id: 'big_spender',
        name: 'Big Spender',
        description: 'Spend over $1 billion in a single purchase',
        icon: 'money-bill-wave',
        unlocked: false
    },
    {
        id: 'collector',
        name: 'Collector',
        description: 'Own at least one of each item',
        icon: 'trophy',
        unlocked: false
    },
    {
        id: 'half_way',
        name: 'Halfway There',
        description: 'Spend 50% of your total budget',
        icon: 'chart-line',
        unlocked: false
    }
];

// Custom items storage
let customItems = JSON.parse(localStorage.getItem('customItems')) || [];

// Items data with categories
const items = [
    {
        name: "iPhone 14 Pro",
        price: 999,
        image: 'assets/iphone16.webp',
        category: "Tech"
    },
    {
        name: "Tesla Model S",
        price: 94900,
        image: 'assets/teslamodel.webp',
        category: "Vehicles"
    },
    {
        name: "Private Island",
        price: 50000000,
        image: 'assets/island.jpg',
        category: "Real Estate"
    },
    {
        name: "Luxury Yacht",
        price: 20000000,
        image: 'assets/yacht.jpeg',
        category: "Vehicles"
    },
    {
        name: "Private Jet",
        price: 30000000,
        image: 'assets/jatpriv.jpg',
        category: "Vehicles"
    },
    {
        name: "NBA Team",
        price: 2400000000,
        image: 'assets/nba.png',
        category: "Entertainment"
    }
];

// Create Item Modal
const createItemButton = document.getElementById('createItemButton');
const createItemModal = document.getElementById('createItemModal');
const createItemForm = document.getElementById('createItemForm');
const imagePreview = document.getElementById('imagePreview');
const itemImage = document.getElementById('itemImage');

// Import/Export Modal
const importExportButton = document.getElementById('importExportButton');
const importExportModal = document.getElementById('importExportModal');
const exportItemsButton = document.getElementById('exportItems');
const importItemsButton = document.getElementById('importItems');
const importFileInput = document.getElementById('importFile');

// Edit Item Modal
const editItemModal = document.getElementById('editItemModal');
const editItemForm = document.getElementById('editItemForm');
const editImagePreview = document.getElementById('editImagePreview');
const editItemImage = document.getElementById('editItemImage');

// Show create item modal
createItemButton.addEventListener('click', () => {
    createItemModal.style.display = 'block';
});

// Show import/export modal
importExportButton.addEventListener('click', () => {
    importExportModal.style.display = 'block';
});

// Close import/export modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === importExportModal) {
        importExportModal.style.display = 'none';
    }
});

// Close button for import/export modal
const importExportCloseButton = importExportModal.querySelector('.close');
importExportCloseButton.addEventListener('click', () => {
    importExportModal.style.display = 'none';
});

// Image preview
itemImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle form submission
createItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const category = document.getElementById('itemCategory').value;
    const imageFile = document.getElementById('itemImage').files[0];

    // Convert image to base64
    const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(imageFile);
    });

    // Create new item
    const newItem = {
        name,
        price,
        category,
        image: base64Image,
        isCustom: true
    };

    // Add to custom items
    customItems.push(newItem);
    localStorage.setItem('customItems', JSON.stringify(customItems));

    // Add to items array and refresh display
    items.push(newItem);
    renderItems(items);
    
    // Reset form and close modal
    createItemForm.reset();
    imagePreview.innerHTML = '';
    createItemModal.style.display = 'none';

    // Show success message
    const factElement = document.createElement('div');
    factElement.className = 'fun-fact';
    factElement.textContent = `Successfully created "${name}"!`;
    document.body.appendChild(factElement);
    setTimeout(() => {
        factElement.classList.add('fade-out');
        setTimeout(() => factElement.remove(), 500);
    }, 4000);
});

// Export items
exportItemsButton.addEventListener('click', () => {
    const dataStr = JSON.stringify(customItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'custom_items.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

// Import items button click
importItemsButton.addEventListener('click', () => {
    importFileInput.click();
});

// Handle import file selection
importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedItems = JSON.parse(e.target.result);
                
                // Validate imported items
                if (!Array.isArray(importedItems)) {
                    throw new Error('Invalid format: Expected an array of items');
                }
                
                // Add imported items
                importedItems.forEach(item => {
                    if (!customItems.some(existing => existing.name === item.name)) {
                        item.isCustom = true;
                        customItems.push(item);
                        items.push(item);
                    }
                });
                
                // Save and refresh
                localStorage.setItem('customItems', JSON.stringify(customItems));
                renderItems(items);
                
                // Show success message
                const factElement = document.createElement('div');
                factElement.className = 'fun-fact';
                factElement.textContent = `Successfully imported ${importedItems.length} items!`;
                document.body.appendChild(factElement);
                setTimeout(() => {
                    factElement.classList.add('fade-out');
                    setTimeout(() => factElement.remove(), 500);
                }, 4000);
            } catch (error) {
                alert('Error importing items: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    importFileInput.value = ''; // Reset input
});

// Load custom items on startup
window.addEventListener('load', () => {
    const savedCustomItems = JSON.parse(localStorage.getItem('customItems')) || [];
    customItems = savedCustomItems;
    items.push(...savedCustomItems);
    renderItems(items);
});

// Dark mode toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark';
    darkModeToggle.innerHTML = document.body.dataset.theme === 'dark' 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Search and filter functionality
const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');

function initializeCategories() {
    const categories = [...new Set(items.map(item => item.category))];
    categories.forEach(category => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.textContent = category;
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
            filterItems();
        });
        categoryFilters.appendChild(tag);
    });
}

function filterItems() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeCategories = Array.from(document.querySelectorAll('.category-tag.active'))
        .map(tag => tag.textContent);
    
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = activeCategories.length === 0 || activeCategories.includes(item.category);
        return matchesSearch && matchesCategory;
    });
    
    renderItems(filteredItems);
}

searchInput.addEventListener('input', filterItems);

// Achievement system
function checkAchievements() {
    const unlockedAchievements = [];

    // First Purchase
    if (!achievements[0].unlocked && stats.totalPurchases > 0) {
        achievements[0].unlocked = true;
        unlockedAchievements.push(achievements[0]);
    }

    // Big Spender
    if (!achievements[1].unlocked && Array.from(cart.entries()).some(([_, quantity]) => quantity * items.find(i => i.name === _).price >= 1000000000)) {
        achievements[1].unlocked = true;
        unlockedAchievements.push(achievements[1]);
    }

    // Collector
    if (!achievements[2].unlocked && items.every(item => cart.get(item.name) > 0)) {
        achievements[2].unlocked = true;
        unlockedAchievements.push(achievements[2]);
    }

    // Half Way
    if (!achievements[3].unlocked && stats.moneySpent >= initialBudget / 2) {
        achievements[3].unlocked = true;
        unlockedAchievements.push(achievements[3]);
    }

    unlockedAchievements.forEach(achievement => showAchievementBanner(achievement));
    updateAchievementsList();
}

function showAchievementBanner(achievement) {
    const banner = document.getElementById('achievements');
    const text = banner.querySelector('.achievement-text');
    text.textContent = `Achievement Unlocked: ${achievement.name}!`;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 3000);
}

function updateAchievementsList(listId = 'achievementsListModal') {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    
    achievements.forEach(achievement => {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = `achievement-item ${achievement.unlocked ? '' : 'locked'}`;
        
        achievementDiv.innerHTML = `
            <i class="fas fa-${achievement.icon}"></i>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
            ${achievement.unlocked ? '<i class="fas fa-check-circle" style="color: var(--primary-green);"></i>' : '<i class="fas fa-lock"></i>'}
        `;
        
        list.appendChild(achievementDiv);
    });
}

// Sound Management
const soundEffects = {
    buy: {
        small: new Audio('audio/coins_small.wav'),
        medium: new Audio('audio/coins_medium.wav'),
        big: new Audio('audio/coins_big.wav')
    },
    sell: {
        small: new Audio('audio/coins_small.wav'),
        medium: new Audio('audio/coins_medium.wav'),
        big: new Audio('audio/coins_big.wav')
    }
};

let isSoundEnabled = true;

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('soundEnabled', isSoundEnabled);
}

function getSoundCategory(amount) {
    if (amount < 1000) return 'small';
    if (amount < 10000) return 'medium';
    return 'big';
}

function playSoundEffect(type, amount) {
    if (isSoundEnabled) {
        const category = getSoundCategory(amount);
        const sound = soundEffects[type][category];
        
        if (sound) {
            sound.play().catch(error => {
                console.warn(`Sound playback failed for ${type} ${category}:`, error);
            });
        }
    }
}

// Statistics tracking
function updateStats() {
    document.getElementById('totalPurchases').textContent = stats.totalPurchases;
    document.getElementById('totalSales').textContent = stats.totalSales;
    document.getElementById('moneySpent').textContent = formatCurrency(stats.moneySpent);
    
    let mostBoughtItem = Array.from(stats.itemsPurchased.entries())
        .reduce((a, b) => a[1] > b[1] ? a : b, ['None', 0])[0];
    document.getElementById('mostBoughtItem').textContent = mostBoughtItem;
}

// Modal handling
const statsButton = document.getElementById('statsButton');
const statsModal = document.getElementById('statsModal');
const achievementsButton = document.getElementById('achievementsButton');
const achievementsModal = document.getElementById('achievementsModal');

statsButton.addEventListener('click', () => {
    statsModal.style.display = 'block';
    updateStats();
});

achievementsButton.addEventListener('click', () => {
    achievementsModal.style.display = 'block';
    updateAchievementsList();
});

// Close modals
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Initialize the app
function init() {
    initializeCategories();
    renderItems(items);
    updateAchievementsList();
}

// Items grid
const itemsGrid = document.getElementById('itemsGrid');

function renderItems(items) {
    itemsGrid.innerHTML = '';
    items.forEach(item => {
        const itemCard = createItemCard(item);
        itemsGrid.appendChild(itemCard);
    });
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;

    // Add delete button ONLY for truly custom items
    if (item.isCustom === true) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-item-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            
            // Confirm deletion
            const confirmDelete = confirm(`Tem certeza que deseja remover "${item.name}"?`);
            if (confirmDelete) {
                removeCustomItem(item.id);
            }
        });
        card.appendChild(deleteButton);
    }

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('item-image-container');
    
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.classList.add('item-image');
    
    imageContainer.appendChild(img);
    
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('item-info');
    
    const name = document.createElement('h3');
    name.classList.add('item-name');
    name.textContent = item.name;
    
    const price = document.createElement('div');
    price.classList.add('item-price');
    price.textContent = formatCurrency(item.price);
    
    const buttonsRow = document.createElement('div');
    buttonsRow.classList.add('buttons-row');
    
    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-button');
    buyButton.textContent = 'Buy';
    
    const sellButton = document.createElement('button');
    sellButton.classList.add('sell-button');
    sellButton.textContent = 'Sell';
    
    // Initially disable sell button if no items owned
    if (!cart.get(item.name)) {
        sellButton.disabled = true;
    }
    
    buyButton.addEventListener('click', (event) => {
        if (remainingBudget >= item.price) {
            const rect = buyButton.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top;
            
            // Animate the button
            buyButton.classList.add('animate');
            setTimeout(() => buyButton.classList.remove('animate'), 400);
            
            // Animate money decrease effect
            animateMoneyDecrease(item.price, x, y);
            
            // Animate the remaining budget
            const oldRemaining = remainingBudget;
            remainingBudget -= item.price;
            animateValue(remainingBudgetElement, oldRemaining, remainingBudget, 500, 'buy');
            
            // Update cart
            const currentQuantity = cart.get(item.name) || 0;
            cart.set(item.name, currentQuantity + 1);
            
            // Update quantity display
            if (quantityDisplay) {
                quantityDisplay.textContent = `Owned: ${cart.get(item.name)}`;
            }
            
            // Enable sell button if we have items
            sellButton.disabled = false;
            
            // Disable buy button if can't afford more
            if (remainingBudget < item.price) {
                buyButton.disabled = true;
            }
            
            // Update stats
            stats.totalPurchases++;
            stats.moneySpent += item.price;
            if (stats.itemsPurchased.has(item.name)) {
                stats.itemsPurchased.set(item.name, stats.itemsPurchased.get(item.name) + 1);
            } else {
                stats.itemsPurchased.set(item.name, 1);
            }
            
            // Check achievements
            checkAchievements();
            playSoundEffect('buy', item.price);
        }
    });
    
    sellButton.addEventListener('click', (event) => {
        const currentQuantity = cart.get(item.name) || 0;
        
        if (currentQuantity > 0) {
            const rect = sellButton.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top;
            
            // Animate the button
            sellButton.classList.add('animate');
            setTimeout(() => sellButton.classList.remove('animate'), 400);
            
            // Animate money increase effect
            const element = document.createElement('div');
            element.className = 'money-increase';
            element.textContent = `+${formatCurrency(item.price)}`;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            document.body.appendChild(element);
            setTimeout(() => element.remove(), 1000);
            
            // Animate the remaining budget
            const oldRemaining = remainingBudget;
            remainingBudget += item.price;
            animateValue(remainingBudgetElement, oldRemaining, remainingBudget, 500, 'sell');
            
            // Update cart
            const newQuantity = currentQuantity - 1;
            if (newQuantity === 0) {
                cart.delete(item.name);
                sellButton.disabled = true;
            } else {
                cart.set(item.name, newQuantity);
            }
            
            // Update quantity display
            if (quantityDisplay) {
                quantityDisplay.textContent = `Owned: ${cart.get(item.name) || 0}`;
            }
            
            // Enable buy button since we have more money
            buyButton.disabled = false;
            
            // Update stats
            stats.totalSales++;
            stats.moneySpent -= item.price;
            if (stats.itemsPurchased.has(item.name)) {
                stats.itemsPurchased.set(item.name, stats.itemsPurchased.get(item.name) - 1);
            } else {
                stats.itemsPurchased.set(item.name, -1);
            }
            playSoundEffect('sell', item.price);
        }
    });
    
    const quantityDisplay = document.createElement('div');
    quantityDisplay.classList.add('quantity-display');
    quantityDisplay.textContent = `Owned: ${cart.get(item.name) || 0}`;
    
    buttonsRow.appendChild(buyButton);
    buttonsRow.appendChild(sellButton);
    
    infoDiv.appendChild(name);
    infoDiv.appendChild(price);
    infoDiv.appendChild(buttonsRow);
    infoDiv.appendChild(quantityDisplay);
    
    card.appendChild(imageContainer);
    card.appendChild(infoDiv);
    
    return card;
}

// Function to remove a custom item
function removeCustomItem(itemId) {
    // Find the index of the item to remove
    const itemIndex = items.findIndex(item => item.id === itemId && item.isCustom);
    
    if (itemIndex !== -1) {
        // Remove the item from the array
        const removedItem = items.splice(itemIndex, 1)[0];
        
        // Refund the item's cost
        remainingBudget += removedItem.price;
        updateBudgetDisplay();
        
        // Re-render the items grid
        renderItems(items);
        
        // Play a sound effect (optional)
        playSoundEffect('sell', removedItem.price);
        
        // Save updated items to local storage
        localStorage.setItem('items', JSON.stringify(items));
        
        // Update customItems array
        const customItemIndex = customItems.findIndex(item => item.id === itemId);
        if (customItemIndex !== -1) {
            customItems.splice(customItemIndex, 1);
            localStorage.setItem('customItems', JSON.stringify(customItems));
        }
    } else {
        console.warn('Attempted to delete a non-custom or non-existent item');
    }
}

// Initialize the display
const totalBudgetElement = document.getElementById('totalBudget');
const remainingBudgetElement = document.getElementById('remainingBudget');
function updateBudgetDisplay() {
    totalBudgetElement.textContent = formatCurrency(initialBudget);
    remainingBudgetElement.textContent = formatCurrency(remainingBudget);
}
updateBudgetDisplay();

// Animate money decrease effect
function animateMoneyDecrease(amount, x, y) {
    const element = document.createElement('div');
    element.className = 'money-decrease';
    element.textContent = `-${formatCurrency(amount)}`;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    document.body.appendChild(element);
    
    setTimeout(() => element.remove(), 1000);
}

// Animate value
function animateValue(element, start, end, duration, animationType) {
    element.classList.add('animate');
    
    // Add color animation class
    if (animationType === 'sell') {
        element.classList.add('sell-animation');
    } else if (animationType === 'buy') {
        element.classList.add('buy-animation');
    }
    
    const range = end - start;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (range * progress);
        element.textContent = formatCurrency(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('animate');
            
            // Remove color animation class
            if (animationType === 'sell') {
                element.classList.remove('sell-animation');
            } else if (animationType === 'buy') {
                element.classList.remove('buy-animation');
            }
        }
    }
    
    requestAnimationFrame(update);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}

// Generate receipt
function generateReceipt() {
    let receiptHTML = '<div class="receipt-items">';
    let totalSpent = 0;

    cart.forEach((quantity, itemName) => {
        const item = items.find(i => i.name === itemName);
        if (item) {
            const itemTotal = item.price * quantity;
            totalSpent += itemTotal;
            receiptHTML += `
                <div class="receipt-item">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">x${quantity}</span>
                    <span class="item-total">${formatCurrency(itemTotal)}</span>
                </div>
            `;
        }
    });

    receiptHTML += '</div>';
    const receiptContent = document.getElementById('receiptContent');
    receiptContent.innerHTML = receiptHTML;
    const totalSpentElement = document.getElementById('totalSpent');
    totalSpentElement.textContent = formatCurrency(totalSpent);
}

// Show modal
const receiptButton = document.getElementById('receiptButton');
const modal = document.getElementById('receiptModal');
receiptButton.onclick = function() {
    generateReceipt();
    modal.style.display = "block";
    // Add show class after a small delay to trigger animation
    setTimeout(() => modal.classList.add('show'), 10);
}

// Close modal
const closeButton = document.querySelector('.close');
closeButton.onclick = function() {
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = "none", 300);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = "none", 300);
    }
}

// Add sound toggle to settings
const soundToggleButton = document.createElement('button');
soundToggleButton.className = 'sound-toggle-button';
soundToggleButton.innerHTML = `<i class="fas fa-${isSoundEnabled ? 'volume-up' : 'volume-mute'}"></i> Sound`;
soundToggleButton.addEventListener('click', () => {
    toggleSound();
    soundToggleButton.innerHTML = `<i class="fas fa-${isSoundEnabled ? 'volume-up' : 'volume-mute'}"></i> Sound`;
});

// Add sound toggle to header buttons
document.querySelector('.header-buttons').appendChild(soundToggleButton);

// Load sound preference from localStorage
const savedSoundPreference = localStorage.getItem('soundEnabled');
if (savedSoundPreference !== null) {
    isSoundEnabled = JSON.parse(savedSoundPreference);
}

init();
