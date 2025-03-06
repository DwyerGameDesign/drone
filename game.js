// Game state and core mechanics
class DroneManGame {
    constructor() {
        // Game settings
        this.maxResources = 10;
        this.startingResources = {
            soul: 5,
            connections: 5,
            money: 3 // Starting money as currency
        };
        this.maxTurns = 20; // About 20 train stops in the journey
        
        // Initialize game state
        this.resetGame();
    }
    
    resetGame() {
        // Initialize resources
        this.resources = {
            soul: this.startingResources.soul,
            connections: this.startingResources.connections,
            money: this.startingResources.money
        };
        
        // Game progression
        this.currentTurn = 1;
        this.gameOver = false;
        this.gameOverReason = "";
        
        // Current paths/choices
        this.currentPaths = {
            a: [],
            b: []
        };
        
        // Generate initial paths
        this.generatePaths();
    }
    
    generatePaths() {
        // Generate path A (tends toward resource-positive, money-negative)
        this.currentPaths.a = [this.getRandomCard(true)];
        
        // Generate path B (tends toward resource-negative, money-positive)
        this.currentPaths.b = [this.getRandomCard(false)];
    }
    
    getRandomCard(isPathA) {
        // Filter cards based on path type
        const availableCards = cardDefinitions.filter(card => {
            if (isPathA) {
                // Path A: Tends to cost money but give resources
                return card.cost > 0 || 
                       (card.effects.soul > 0 || card.effects.connections > 0);
            } else {
                // Path B: Tends to earn money but cost resources
                return card.cost < 0 || 
                       (card.effects.soul < 0 || card.effects.connections < 0);
            }
        });

        if (availableCards.length === 0) {
            console.error('No available cards found for path:', isPathA ? 'A' : 'B');
            return null;
        }

        // Select random card
        return availableCards[Math.floor(Math.random() * availableCards.length)];
    }
    
    canAffordPath(path) {
        const cards = this.currentPaths[path];
        if (!cards || cards.length === 0) return false;
        
        const totalCost = cards.reduce((sum, card) => sum + (card.cost || 0), 0);
        return totalCost <= this.resources.money;
    }
    
    choosePath(path) {
        if (!this.canAffordPath(path)) {
            return false;
        }

        const cards = this.currentPaths[path];
        if (!cards || cards.length === 0) {
            return false;
        }

        // Apply effects of all cards in the path
        for (const card of cards) {
            // Apply cost
            this.resources.money -= card.cost || 0;

            // Apply effects
            if (card.effects) {
                this.resources.soul = Math.max(0, Math.min(10, 
                    this.resources.soul + (card.effects.soul || 0)
                ));
                this.resources.connections = Math.max(0, Math.min(10, 
                    this.resources.connections + (card.effects.connections || 0)
                ));
            }
        }

        // Check game over conditions
        if (this.resources.soul <= 0 || this.resources.connections <= 0) {
            this.gameOver = true;
        }

        // Generate new paths
        this.generatePaths();
        return true;
    }
    
    getResourcePercentage(resource) {
        return (this.resources[resource] / 10) * 100;
    }
}