// DOM elements
const soulBar = document.getElementById('soul-bar');
const connectionsBar = document.getElementById('connections-bar');
const soulValue = document.getElementById('soul-value');
const connectionsValue = document.getElementById('connections-value');
const moneyValue = document.getElementById('money-value');
const turnCounter = document.getElementById('turn-counter');
const gameMessage = document.getElementById('game-message');
const pathACards = document.getElementById('path-a-cards');
const pathBCards = document.getElementById('path-b-cards');
const pathACost = document.getElementById('path-a-cost');
const pathBCost = document.getElementById('path-b-cost');
const chooseAButton = document.getElementById('choose-a');
const chooseBButton = document.getElementById('choose-b');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverMessage = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart-button');
const cannotAffordMessage = document.getElementById('cannot-afford-message');

// Initialize game instance
let game = new DroneManGame();

// Event listeners
chooseAButton.addEventListener('click', () => {
    handlePathChoice('a');
});

chooseBButton.addEventListener('click', () => {
    handlePathChoice('b');
});

restartButton.addEventListener('click', () => {
    game.resetGame();
    updateUI();
    gameOverScreen.style.display = 'none';
});

// Game functions
function handlePathChoice(path) {
    // Check if player can afford this path
    if (!game.canAffordPath(path)) {
        showCannotAffordMessage();
        return;
    }
    
    const success = game.choosePath(path);
    
    if (success) {
        updateUI();
        
        if (game.gameOver) {
            showGameOver();
        }
    }
}

function showCannotAffordMessage() {
    cannotAffordMessage.classList.add('show');
    
    setTimeout(() => {
        cannotAffordMessage.classList.remove('show');
    }, 2000);
}

function updateUI() {
    // Update resource bars and values
    updateResourceUI('soul', soulBar, soulValue);
    updateResourceUI('connections', connectionsBar, connectionsValue);
    
    // Update money (handled differently)
    moneyValue.textContent = game.resources.money;
    
    // Update turn counter
    turnCounter.textContent = game.currentTurn;
    
    // Update path cards
    updatePathCards('a', pathACards);
    updatePathCards('b', pathBCards);
    
    // Update path costs
    updatePathCost('a', pathACost);
    updatePathCost('b', pathBCost);
    
    // Update button states based on affordability
    updateButtonStates();
    
    // Update game message based on turn
    if (game.currentTurn === 1) {
        gameMessage.textContent = "Your journey begins. Choose your first path.";
    } else if (game.currentTurn <= 5) {
        gameMessage.textContent = "Still early in your journey. What path will you take?";
    } else if (game.currentTurn <= 10) {
        gameMessage.textContent = "Halfway through your journey. Your choices define you.";
    } else if (game.currentTurn <= 15) {
        gameMessage.textContent = "Your journey continues. The end is in sight.";
    } else {
        gameMessage.textContent = "The final stops of your journey. Choose wisely.";
    }
}

function updateResourceUI(resource, barElement, valueElement) {
    const percentage = game.getResourcePercentage(resource);
    const value = game.resources[resource];
    
    // Update bar width
    barElement.style.width = `${percentage}%`;
    
    // Update color based on value
    if (percentage <= 20) {
        barElement.style.backgroundColor = '#e74c3c'; // Danger
    } else if (percentage <= 50) {
        barElement.style.backgroundColor = '#f39c12'; // Warning
    } else {
        // Set back to original color
        switch (resource) {
            case 'soul':
                barElement.style.backgroundColor = '#9b59b6'; 
                break;
            case 'connections':
                barElement.style.backgroundColor = '#3498db';
                break;
        }
    }
    
    // Update value text
    valueElement.textContent = value;
}

function updateButtonStates() {
    // Enable/disable path buttons based on affordability
    chooseAButton.disabled = !game.canAffordPath('a');
    chooseBButton.disabled = !game.canAffordPath('b');
    
    // Add/remove "disabled" class for styling
    if (chooseAButton.disabled) {
        chooseAButton.classList.add('disabled');
    } else {
        chooseAButton.classList.remove('disabled');
    }
    
    if (chooseBButton.disabled) {
        chooseBButton.classList.add('disabled');
    } else {
        chooseBButton.classList.remove('disabled');
    }
}

function updatePathCost(path, costElement) {
    const pathCost = game.calculatePathCost(game.currentPaths[path]);
    
    // Format cost
    if (pathCost === 0) {
        costElement.textContent = "Free";
        costElement.classList.remove('expensive');
    } else if (pathCost < 0) {
        costElement.textContent = `Earn $${Math.abs(pathCost)}`;
        costElement.classList.remove('expensive');
    } else {
        costElement.textContent = `Cost: $${pathCost}`;
        costElement.classList.toggle('expensive', pathCost > game.resources.money);
    }
}

function updatePathCards(path, containerElement) {
    // Clear existing cards
    containerElement.innerHTML = '';
    
    // Get cards for this path
    const cards = game.currentPaths[path];
    
    // Create card elements
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        containerElement.appendChild(cardElement);
    });
}

function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    
    // Add cost indicator
    const costBadge = document.createElement('div');
    costBadge.className = 'card-cost-badge';
    
    if ((card.cost || 0) === 0) {
        costBadge.textContent = 'FREE';
        costBadge.classList.add('free');
    } else if ((card.cost || 0) < 0) {
        costBadge.textContent = `EARN $${Math.abs(card.cost)}`;
        costBadge.classList.add('earn');
    } else {
        costBadge.textContent = `$${card.cost}`;
        costBadge.classList.add('cost');
    }
    
    cardElement.appendChild(costBadge);
    
    // Add title
    const titleElement = document.createElement('div');
    titleElement.className = 'card-title';
    titleElement.textContent = card.title;
    cardElement.appendChild(titleElement);
    
    // Add album track reference if exists
    if (card.albumTrack) {
        const albumTrackElement = document.createElement('div');
        albumTrackElement.className = 'card-album-track';
        albumTrackElement.textContent = `Track: ${card.albumTrack}`;
        cardElement.appendChild(albumTrackElement);
    }
    
    // Add thematic description if it exists
    if (thematicDescriptions[card.id]) {
        const descriptionElement = document.createElement('div');
        descriptionElement.className = 'card-description';
        descriptionElement.textContent = thematicDescriptions[card.id];
        cardElement.appendChild(descriptionElement);
    }
    
    // Add effects
    const effectsElement = document.createElement('div');
    effectsElement.className = 'card-effects';
    
    // Add resource effects
    for (const [resource, change] of Object.entries(card.effects || {})) {
        if (change === 0) continue; // Skip zero changes
        
        const effectElement = document.createElement('span');
        effectElement.className = `effect ${change > 0 ? 'positive' : 'negative'}`;
        
        // Format display: "+1 Soul" or "-1 Connections"
        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
        effectElement.textContent = `${change > 0 ? '+' : ''}${change} ${resourceName}`;
        
        effectsElement.appendChild(effectElement);
    }
    
    cardElement.appendChild(effectsElement);
    return cardElement;
}

function showGameOver() {
    gameOverMessage.textContent = game.gameOverReason;
    gameOverScreen.style.display = 'flex';
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});