// Initialize game state
let game;
let currentTurn = 1;
const MAX_TURNS = 10;

// DOM Elements
const turnCounter = document.getElementById('turn-counter');
const soulBar = document.getElementById('soul-bar');
const connectionsBar = document.getElementById('connections-bar');
const soulValue = document.getElementById('soul-value');
const connectionsValue = document.getElementById('connections-value');
const moneyValue = document.getElementById('money-value');
const gameMessage = document.getElementById('game-message');
const pathA = document.getElementById('path-a');
const pathB = document.getElementById('path-b');
const pathACard = document.getElementById('path-a-card');
const pathBCard = document.getElementById('path-b-card');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverMessage = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart-button');
const cannotAffordMessage = document.getElementById('cannot-afford-message');

// Initialize the game
function initGame() {
    console.log('Initializing game...');
    game = new DroneManGame();
    updateUI();
    generateNewPaths();
}

// Update UI elements
function updateUI() {
    console.log('Updating UI...');
    turnCounter.textContent = currentTurn;
    
    // Update resource bars and values
    updateResourceUI('soul', soulBar, soulValue);
    updateResourceUI('connections', connectionsBar, connectionsValue);
    
    // Update money
    moneyValue.textContent = game.resources.money;
    
    // Update path cards
    updatePathCard('a', pathACard);
    updatePathCard('b', pathBCard);
    
    // Update card states based on affordability
    updateCardStates();
    
    // Update game message based on turn
    updateGameMessage();
}

// Generate new path choices
function generateNewPaths() {
    console.log('Generating new paths...');
    const [cardA, cardB] = game.generatePathChoices();
    
    if (!cardA || !cardB) {
        console.error('Failed to generate cards:', { cardA, cardB });
        return;
    }
    
    updatePathCard('a', pathACard);
    updatePathCard('b', pathBCard);
    
    // Update card states based on affordability
    updateCardAffordability(pathA, cardA.cost);
    updateCardAffordability(pathB, cardB.cost);
}

// Update a path card's content
function updatePathCard(path, containerElement) {
    const card = game.currentPaths[path][0]; // Get first card for the path
    if (!card) return;
    
    containerElement.innerHTML = `
        <div class="card-title">${card.title}</div>
        <div class="cost-badge ${card.cost < 0 ? 'earn' : ''}">${card.cost < 0 ? `EARN $${-card.cost}` : `$${card.cost}`}</div>
        <div class="album-track">♫ Track: ${card.albumTrack}</div>
        <div class="card-description">${thematicDescriptions[card.id] || generateDescription(card)}</div>
        <div class="card-illustration">[ ${card.title} Illustration ]</div>
    `;
}

// Update card affordability
function updateCardAffordability(cardElement, cost) {
    if (cost > game.resources.money) {
        cardElement.classList.add('disabled');
    } else {
        cardElement.classList.remove('disabled');
    }
}

// Show cannot afford message
function showCannotAffordMessage() {
    cannotAffordMessage.classList.add('show');
    setTimeout(() => {
        cannotAffordMessage.classList.remove('show');
    }, 2000);
}

// Handle path selection
function handlePathSelect(card, isPathA) {
    console.log('Path selected:', isPathA ? 'A' : 'B');
    
    // Check if card is affordable
    if (card.cost > game.resources.money) {
        showCannotAffordMessage();
        return;
    }
    
    // Apply card effects
    game.resources.money -= card.cost;
    game.resources.soul = Math.max(0, Math.min(10, game.resources.soul + card.effects.soul));
    game.resources.connections = Math.max(0, Math.min(10, game.resources.connections + card.effects.connections));
    
    currentTurn++;
    
    // Check game over conditions
    if (currentTurn > MAX_TURNS || game.resources.soul <= 0 || game.resources.connections <= 0) {
        endGame();
    } else {
        updateUI();
        generateNewPaths();
    }
}

// End the game
function endGame() {
    let message = '';
    
    if (game.resources.soul <= 0) {
        message = "Your soul has been crushed by the corporate machine. Game Over.";
    } else if (game.resources.connections <= 0) {
        message = "You've become completely isolated. Game Over.";
    } else {
        message = `Journey complete! Final stats:\nSoul: ${game.resources.soul}/10\nConnections: ${game.resources.connections}/10\nMoney: $${game.resources.money}`;
    }
    
    gameOverMessage.textContent = message;
    gameOverScreen.style.display = 'flex';
}

// Event Listeners
pathA.addEventListener('click', () => {
    if (!pathA.classList.contains('disabled')) {
        handlePathSelect(game.currentPaths[0][0], true);
    } else {
        showCannotAffordMessage();
    }
});

pathB.addEventListener('click', () => {
    if (!pathB.classList.contains('disabled')) {
        handlePathSelect(game.currentPaths[1][0], false);
    } else {
        showCannotAffordMessage();
    }
});

restartButton.addEventListener('click', () => {
    currentTurn = 1;
    game.resetGame();
    gameOverScreen.style.display = 'none';
    initGame();
});

// Start the game
initGame();