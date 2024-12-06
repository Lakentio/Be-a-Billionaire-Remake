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
    return unlockedAchievements.length > 0 ? unlockedAchievements[0] : null;
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
    
    // Add custom item indicator if it's a custom item
    if (item.isCustom) {
        card.classList.add('custom-item');
    }

    const imageContainer = document.createElement('div');
    imageContainer.className = 'item-image-container';
    
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name;
    image.className = 'item-image';
    
    // Add edit and delete buttons for custom items
    if (item.isCustom) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'custom-item-buttons';
        
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.title = 'Edit Item';
        editButton.onclick = (e) => {
            e.stopPropagation();
            editCustomItem(item);
        };
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = 'Delete Item';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                deleteCustomItem(item);
            }
        };
        
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        imageContainer.appendChild(buttonContainer);
    }
    
    imageContainer.appendChild(image);
    card.appendChild(imageContainer);
    
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
    
    buyButton.addEventListener('click', () => {
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
            
            // Play purchase sound
            sounds.purchase.play();
            
            // Show fun fact
            showFunFact(item.price);
            
            // Check achievements with sound
            const newAchievement = checkAchievements();
            if (newAchievement) {
                sounds.achievement.play();
            }
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
    
    card.appendChild(infoDiv);
    
    return card;
}

// Function to delete custom item
function deleteCustomItem(item) {
    // Remove from customItems array
    customItems = customItems.filter(customItem => customItem.name !== item.name);
    
    // Remove from items array
    const itemIndex = items.findIndex(i => i.name === item.name);
    if (itemIndex > -1) {
        items.splice(itemIndex, 1);
    }
    
    // Update localStorage
    localStorage.setItem('customItems', JSON.stringify(customItems));
    
    // Re-render items
    renderItems(items);
    
    // Show success message
    const factElement = document.createElement('div');
    factElement.className = 'fun-fact';
    factElement.textContent = `"${item.name}" has been deleted!`;
    document.body.appendChild(factElement);
    setTimeout(() => {
        factElement.classList.add('fade-out');
        setTimeout(() => factElement.remove(), 500);
    }, 4000);
}

// Function to edit custom item
async function editCustomItem(item) {
    // Populate form with current values
    document.getElementById('editItemOriginalName').value = item.name;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemPrice').value = item.price;
    document.getElementById('editItemCategory').value = item.category;
    
    // Show current image
    editImagePreview.innerHTML = `<img src="${item.image}" alt="Current Image">`;
    
    // Show modal
    editItemModal.style.display = 'block';
}

// Close edit modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === editItemModal) {
        editItemModal.style.display = 'none';
    }
});

// Close button for edit modal
const editModalCloseButton = editItemModal.querySelector('.close');
editModalCloseButton.addEventListener('click', () => {
    editItemModal.style.display = 'none';
});

// Edit image preview
editItemImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            editImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle edit form submission
editItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const originalName = document.getElementById('editItemOriginalName').value;
    const name = document.getElementById('editItemName').value;
    const price = parseFloat(document.getElementById('editItemPrice').value);
    const category = document.getElementById('editItemCategory').value;
    const imageFile = document.getElementById('editItemImage').files[0];

    // Find item in arrays
    const customItemIndex = customItems.findIndex(item => item.name === originalName);
    const itemIndex = items.findIndex(item => item.name === originalName);

    if (customItemIndex === -1 || itemIndex === -1) {
        alert('Error: Item not found');
        return;
    }

    // Get image (either new or keep existing)
    let imageData;
    if (imageFile) {
        imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    } else {
        imageData = customItems[customItemIndex].image;
    }

    // Create updated item
    const updatedItem = {
        name,
        price,
        category,
        image: imageData,
        isCustom: true
    };

    // Update arrays
    customItems[customItemIndex] = updatedItem;
    items[itemIndex] = updatedItem;

    // Update localStorage
    localStorage.setItem('customItems', JSON.stringify(customItems));

    // Refresh display
    renderItems(items);
    
    // Reset form and close modal
    editItemForm.reset();
    editImagePreview.innerHTML = '';
    editItemModal.style.display = 'none';

    // Show success message
    const factElement = document.createElement('div');
    factElement.className = 'fun-fact';
    factElement.textContent = `Successfully updated "${name}"!`;
    document.body.appendChild(factElement);
    setTimeout(() => {
        factElement.classList.add('fade-out');
        setTimeout(() => factElement.remove(), 500);
    }, 4000);
});

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

// Sound effects
const sounds = {
    purchase: new Audio('https://assets.mixkit.co/active_storage/sfx/2058/2058-preview.mp3'),
    achievement: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
};

// Random fun facts about money
const funFacts = [
    "This amount could buy {number} average homes in the US!",
    "You could pay for {number} college students' tuition with this money!",
    "This is equivalent to {number} years of average salary!",
    "You could buy {number} Tesla Model 3s with this amount!",
];

function showFunFact(amount) {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    let number;
    
    // Calculate relevant numbers based on the amount
    if (fact.includes("homes")) {
        number = Math.round(amount / 400000); // Average home price
    } else if (fact.includes("college")) {
        number = Math.round(amount / 35000); // Average yearly tuition
    } else if (fact.includes("salary")) {
        number = Math.round(amount / 50000); // Average yearly salary
    } else if (fact.includes("Tesla")) {
        number = Math.round(amount / 40000); // Tesla Model 3 price
    }
    
    const formattedFact = fact.replace("{number}", number.toLocaleString());
    
    const factElement = document.createElement('div');
    factElement.className = 'fun-fact';
    factElement.textContent = formattedFact;
    document.body.appendChild(factElement);
    
    setTimeout(() => {
        factElement.classList.add('fade-out');
        setTimeout(() => factElement.remove(), 500);
    }, 4000);
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

init();
