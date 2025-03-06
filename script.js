// DOM elements
const soulBar = document.getElementById('soul-bar');
const connectionsBar = document.getElementById('connections-bar');
const energyBar = document.getElementById('energy-bar');
const moneyBar = document.getElementById('money-bar');
const soulValue = document.getElementById('soul-value');
const connectionsValue = document.getElementById('connections-value');
const energyValue = document.getElementById('energy-value');
const moneyValue = document.getElementById('money-value');
const turnCounter = document.getElementById('turn-counter');
const gameMessage = document.getElementById('game-message');
const pathACards = document.getElementById('path-a-cards');
const pathBCards = document.getElementById('path-b-cards');
const chooseAButton = document.getElementById('choose-a');
const chooseBButton = document.getElementById('choose-b');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverMessage = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart-button');

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
    game.choosePath(path);
    updateUI();
    
    if (game.gameOver) {
        showGameOver();
    }
}

function updateUI() {
    // Update resource bars and values
    updateResourceUI('soul', soulBar, soulValue);
    updateResourceUI('connections', connectionsBar, connectionsValue);
    updateResourceUI('energy', energyBar, energyValue);
    updateResourceUI('money', moneyBar, moneyValue);
    
    // Update turn counter
    turnCounter.textContent = game.currentTurn;
    
    // Update path cards
    updatePathCards('a', pathACards);
    updatePathCards('b', pathBCards);
    
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
            case 'energy':
                barElement.style.backgroundColor = '#2ecc71';
                break;
            case 'money':
                barElement.style.backgroundColor = '#f1c40f';
                break;
        }
    }
    
    // Update value text
    valueElement.textContent = value;
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
        albumTrackElement.style.fontStyle = 'italic';
        albumTrackElement.style.fontSize = '0.8rem';
        albumTrackElement.style.marginBottom = '8px';
        cardElement.appendChild(albumTrackElement);
    }
    
    // Add thematic description if it exists
    if (thematicDescriptions[card.id]) {
        const descriptionElement = document.createElement('div');
        descriptionElement.className = 'card-description';
        descriptionElement.textContent = thematicDescriptions[card.id];
        descriptionElement.style.marginBottom = '10px';
        descriptionElement.style.fontSize = '0.9rem';
        cardElement.appendChild(descriptionElement);
    }
    
    // Add effects
    const effectsElement = document.createElement('div');
    effectsElement.className = 'card-effects';
    
    for (const [resource, change] of Object.entries(card.effects)) {
        if (change === 0) continue; // Skip zero changes
        
        const effectElement = document.createElement('span');
        effectElement.className = `effect ${change > 0 ? 'positive' : 'negative'}`;
        
        // Format display: "+1 Soul" or "-1 Energy"
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