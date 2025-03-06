// DOM elements
const soulBar = document.getElementById('soul-bar');
const connectionsBar = document.getElementById('connections-bar');
const soulValue = document.getElementById('soul-value');
const connectionsValue = document.getElementById('connections-value');
const moneyValue = document.getElementById('money-value');
const turnCounter = document.getElementById('turn-counter');
const gameMessage = document.getElementById('game-message');
const pathACard = document.getElementById('path-a-card');
const pathBCard = document.getElementById('path-b-card');
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
    updatePathCard('a', pathACard);
    updatePathCard('b', pathBCard);
    
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

function updatePathCard(path, containerElement) {
    // Clear existing content
    containerElement.innerHTML = '';
    
    // Get cards for this path
    const cards = game.currentPaths[path];
    if (cards.length === 0) return;
    
    // Use the first card (mobile design shows one card per path)
    const card = cards[0];
    
    // Create card elements
    const cardElement = createCardElement(card);
    containerElement.appendChild(cardElement);
}

function createCardElement(card) {
    const fragment = document.createDocumentFragment();
    
    // Card title
    const titleElement = document.createElement('div');
    titleElement.className = 'card-title';
    titleElement.textContent = card.title;
    fragment.appendChild(titleElement);
    
    // Cost badge
    const costBadge = document.createElement('div');
    
    if ((card.cost || 0) === 0) {
        costBadge.textContent = 'FREE';
        costBadge.className = 'cost-badge free';
    } else if ((card.cost || 0) < 0) {
        costBadge.textContent = `EARN $${Math.abs(card.cost)}`;
        costBadge.className = 'cost-badge earn';
    } else {
        costBadge.textContent = `$${card.cost}`;
        costBadge.className = 'cost-badge';
    }
    
    fragment.appendChild(costBadge);
    
    // Album track reference if exists
    if (card.albumTrack) {
        const albumTrackElement = document.createElement('div');
        albumTrackElement.className = 'album-track';
        albumTrackElement.textContent = `♪ Track: ${card.albumTrack}`;
        fragment.appendChild(albumTrackElement);
    }
    
    // Description
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'card-description';
    
    // Use thematic description if available, otherwise generate based on effects
    if (thematicDescriptions && thematicDescriptions[card.id]) {
        descriptionElement.textContent = thematicDescriptions[card.id];
    } else {
        // Generate description based on card effects
        let description = '';
        if (card.effects) {
            const effects = [];
            if (card.effects.soul > 0) {
                effects.push("enrich your soul");
            } else if (card.effects.soul < 0) {
                effects.push("drain your spirit");
            }
            
            if (card.effects.connections > 0) {
                effects.push("strengthen your connections");
            } else if (card.effects.connections < 0) {
                effects.push("weaken your relationships");
            }
            
            if (effects.length > 0) {
                description = `This will ${effects.join(" and ")}.`;
            }
        }
        
        if (card.cost > 0) {
            description += ` It costs money but could be worth the investment.`;
        } else if (card.cost < 0) {
            description += ` You'll earn money but at what cost to yourself?`;
        }
        
        descriptionElement.textContent = description || "Make your choice.";
    }
    
    fragment.appendChild(descriptionElement);
    
    // Illustration placeholder
    const illustrationElement = document.createElement('div');
    illustrationElement.className = 'card-illustration';
    illustrationElement.textContent = `[ ${card.title} Illustration ]`;
    fragment.appendChild(illustrationElement);
    
    return fragment;
}

function showGameOver() {
    gameOverMessage.textContent = game.gameOverReason;
    gameOverScreen.style.display = 'flex';
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});