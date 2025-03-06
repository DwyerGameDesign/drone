// Game state and core mechanics
window.DroneManGame = class DroneManGame {
    constructor() {
        // Game settings
        this.maxResources = 10;
        this.startingResources = 5;
        this.maxTurns = 20; // About 20 train stops in the journey
        
        // Initialize game state
        this.resetGame();
    }
    
    resetGame() {
        // Initialize resources
        this.resources = {
            soul: this.startingResources,
            connections: this.startingResources,
            energy: this.startingResources,
            money: this.startingResources
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
        // Clear current paths
        this.currentPaths.a = [];
        this.currentPaths.b = [];
        
        // Decide number of cards per path (1 or 2)
        const cardsInPathA = Math.random() < 0.7 ? 1 : 2;
        const cardsInPathB = Math.random() < 0.7 ? 1 : 2;
        
        // Generate path A cards
        for (let i = 0; i < cardsInPathA; i++) {
            this.currentPaths.a.push(this.getRandomCard());
        }
        
        // Generate path B cards
        for (let i = 0; i < cardsInPathB; i++) {
            this.currentPaths.b.push(this.getRandomCard());
        }
    }
    
    getRandomCard() {
        // Weight cards by rarity
        const rarityWeights = {
            "common": 50,
            "uncommon": 30,
            "rare": 15,
            "very rare": 5
        };
        
        // Progressive difficulty - later in the game, more challenging cards
        let rarityModifier = Math.min(this.currentTurn / this.maxTurns, 1);
        
        // Adjust weights based on game progression
        const adjustedWeights = {
            "common": rarityWeights.common * (1 - rarityModifier * 0.5),
            "uncommon": rarityWeights.uncommon,
            "rare": rarityWeights.rare * (1 + rarityModifier),
            "very rare": rarityWeights["very rare"] * (1 + rarityModifier * 2)
        };
        
        // Create weighted pool
        let pool = [];
        
        for (const card of cardDefinitions) {
            const weight = adjustedWeights[card.rarity] || 1;
            
            // Add card to pool weight number of times
            for (let i = 0; i < weight; i++) {
                pool.push(card);
            }
        }
        
        // Select random card from pool
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }
    
    choosePath(path) {
        if (this.gameOver) return;
        
        const cards = this.currentPaths[path];
        
        // Apply effects from all cards in the path
        for (const card of cards) {
            this.applyCardEffects(card);
        }
        
        // Check game over conditions
        if (this.checkGameOver()) {
            return;
        }
        
        // Move to next turn if game not over
        this.currentTurn++;
        
        // Generate new paths for next turn
        this.generatePaths();
        
        // Check if max turns reached
        if (this.currentTurn > this.maxTurns) {
            this.gameOver = true;
            this.gameOverReason = "You've completed your journey! Your balanced life has led you to liberation.";
        }
    }
    
    applyCardEffects(card) {
        for (const [resource, change] of Object.entries(card.effects)) {
            this.resources[resource] += change;
            
            // Cap resources at max
            if (this.resources[resource] > this.maxResources) {
                this.resources[resource] = this.maxResources;
            }
        }
    }
    
    checkGameOver() {
        // Check if any resource has hit 0
        for (const [resource, value] of Object.entries(this.resources)) {
            if (value <= 0) {
                this.gameOver = true;
                
                // Set game over message based on which resource depleted
                switch (resource) {
                    case "soul":
                        this.gameOverReason = "Your soul has been depleted. You've become the drone you feared, never finding your authentic self.";
                        break;
                    case "connections":
                        this.gameOverReason = "You've lost all your connections. Isolated and alone, you can't continue your journey.";
                        break;
                    case "energy":
                        this.gameOverReason = "You've run out of energy. Burnt out and exhausted, you can't go on.";
                        break;
                    case "money":
                        this.gameOverReason = "You've run out of money. Financial ruin has forced you to abandon your journey.";
                        break;
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    getResourcePercentage(resource) {
        return (this.resources[resource] / this.maxResources) * 100;
    }
}