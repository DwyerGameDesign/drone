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
const passiveEffectsList = document.getElementById('passive-effects-list');

// Initialize the game
function initGame() {
    console.log('Initializing game...');
    game = new DroneManGame();
    updateUI();
}

// Update UI elements
function updateUI() {
    console.log('Updating UI...');
    turnCounter.textContent = currentTurn;
    
    // Update resource bars and values
    const soulPercentage = (game.resources.soul / 10) * 100;
    const connectionsPercentage = (game.resources.connections / 10) * 100;
    
    soulBar.style.width = `${soulPercentage}%`;
    connectionsBar.style.width = `${connectionsPercentage}%`;
    
    soulValue.textContent = game.resources.soul;
    connectionsValue.textContent = game.resources.connections;
    moneyValue.textContent = game.resources.money;
    
    // Update resource bar colors based on values
    soulBar.style.backgroundColor = game.resources.soul <= 3 ? '#e74c3c' : '#9b59b6';
    connectionsBar.style.backgroundColor = game.resources.connections <= 3 ? '#e74c3c' : '#3498db';
    
    // Update path cards
    updatePathCard(pathACard, game.currentPaths.a[0]);
    updatePathCard(pathBCard, game.currentPaths.b[0]);
    
    // Update card states based on affordability
    updateCardAffordability(pathA, game.currentPaths.a[0]?.cost || 0);
    updateCardAffordability(pathB, game.currentPaths.b[0]?.cost || 0);

    // Update passive effects
    updatePassiveEffects();
}

// Update a path card's content
function updatePathCard(cardElement, card) {
    if (!card) {
        console.error('No card data provided');
        return;
    }
    
    console.log('Updating path card:', card);
    
    cardElement.innerHTML = `
        <div class="card-title">${card.title}</div>
        <div class="card-description">${card.description}</div>
    `;
}

// Update passive effects display
function updatePassiveEffects() {
    passiveEffectsList.innerHTML = '';
    
    if (game.passiveEffects.length === 0) {
        passiveEffectsList.innerHTML = `
            <div class="passive-effect">
                No passive effects active
            </div>
        `;
        return;
    }
    
    for (const effect of game.passiveEffects) {
        const effectElement = document.createElement('div');
        effectElement.className = `passive-effect ${effect.type}`;
        effectElement.textContent = `${effect.name}: ${effect.description}`;
        passiveEffectsList.appendChild(effectElement);
    }
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
function handlePathSelect(path) {
    console.log('Path selected:', path);
    
    const success = game.choosePath(path);
    if (!success) {
        showCannotAffordMessage();
        return;
    }
    
    currentTurn++;
    
    // Check game over conditions
    if (currentTurn > MAX_TURNS || game.gameOver) {
        endGame();
    } else {
        updateUI();
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
        handlePathSelect('a');
    } else {
        showCannotAffordMessage();
    }
});

pathB.addEventListener('click', () => {
    if (!pathB.classList.contains('disabled')) {
        handlePathSelect('b');
    } else {
        showCannotAffordMessage();
    }
});

restartButton.addEventListener('click', () => {
    currentTurn = 1;
    gameOverScreen.style.display = 'none';
    initGame();
});

// Start the game
document.addEventListener('DOMContentLoaded', initGame);