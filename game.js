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
        // Clear current paths
        this.currentPaths.a = [];
        this.currentPaths.b = [];
        
        // Decide number of cards per path (1 or 2)
        const cardsInPathA = Math.random() < 0.8 ? 1 : 2;
        const cardsInPathB = Math.random() < 0.8 ? 1 : 2;
        
        // Generate path A - tend toward positive resource cards that cost money
        for (let i = 0; i < cardsInPathA; i++) {
            this.currentPaths.a.push(this.getRandomCard('a'));
        }
        
        // Generate path B - tend toward money-earning cards
        for (let i = 0; i < cardsInPathB; i++) {
            this.currentPaths.b.push(this.getRandomCard('b'));
        }
        
        // Ensure at least one path is affordable
        this.ensureAffordablePath();
    }
    
    ensureAffordablePath() {
        const currentMoney = this.resources.money;
        
        // Check affordability of path A
        const pathACost = this.calculatePathCost(this.currentPaths.a);
        const isPathAAffordable = pathACost <= currentMoney;
        
        // Check affordability of path B
        const pathBCost = this.calculatePathCost(this.currentPaths.b);
        const isPathBAffordable = pathBCost <= currentMoney;
        
        // If neither path is affordable, adjust one of them
        if (!isPathAAffordable && !isPathBAffordable) {
            // Decide which path to make affordable
            if (Math.random() < 0.5) {
                this.makePathAffordable('a', currentMoney);
            } else {
                this.makePathAffordable('b', currentMoney);
            }
        }
    }
    
    calculatePathCost(cards) {
        let totalCost = 0;
        
        for (const card of cards) {
            // A negative cost means earning money
            totalCost += (card.cost || 0);
        }
        
        return totalCost;
    }
    
    makePathAffordable(path, availableMoney) {
        // Clear the path
        this.currentPaths[path] = [];
        
        // Add a free or money-earning card
        const affordableCards = cardDefinitions.filter(card => 
            (card.cost || 0) <= availableMoney);
        
        if (affordableCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * affordableCards.length);
            this.currentPaths[path].push(affordableCards[randomIndex]);
        } else {
            // Fallback - just add a money-earning or free card
            const freebies = cardDefinitions.filter(card => (card.cost || 0) <= 0);
            const randomIndex = Math.floor(Math.random() * freebies.length);
            this.currentPaths[path].push(freebies[randomIndex]);
        }
    }
    
    getRandomCard(path) {
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
        
        // Use current money to filter affordable cards or money-generating cards
        const currentMoney = this.resources.money;
        
        // For path A, favor cards that cost money and give positive resources
        // For path B, favor cards that earn money (negative cost)
        let candidateCards;
        
        if (path === 'a') {
            // Path A: Resource-positive cards (that cost money)
            candidateCards = cardDefinitions.filter(card => {
                // Must be affordable
                if ((card.cost || 0) > currentMoney) return false;
                
                // Either free or has positive resource effects
                return card.effects && (
                    (card.effects.soul > 0 || card.effects.connections > 0)
                );
            });
            
            // Fallback: any affordable card
            if (candidateCards.length === 0) {
                candidateCards = cardDefinitions.filter(card => (card.cost || 0) <= currentMoney);
            }
        } else {
            // Path B: Money-earning or free cards
            candidateCards = cardDefinitions.filter(card => 
                (card.cost || 0) < 0 || (
                    (card.cost || 0) === 0 && 
                    card.effects && 
                    (card.effects.soul < 0 || card.effects.connections < 0)
                )
            );
            
            // Fallback: any free card
            if (candidateCards.length === 0) {
                candidateCards = cardDefinitions.filter(card => (card.cost || 0) <= 0);
            }
        }
        
        // Final fallback
        if (candidateCards.length === 0) {
            candidateCards = cardDefinitions.filter(card => (card.cost || 0) <= currentMoney);
        }
        
        for (const card of candidateCards) {
            const weight = adjustedWeights[card.rarity] || 1;
            
            // Add card to pool weight number of times
            for (let i = 0; i < weight; i++) {
                pool.push(card);
            }
        }
        
        // Select random card from pool
        if (pool.length === 0) {
            // Ultimate fallback - use a free card
            const freeCards = cardDefinitions.filter(card => card.cost === 0);
            const randomIndex = Math.floor(Math.random() * freeCards.length);
            return freeCards[randomIndex];
        }
        
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }
    
    canAffordPath(path) {
        const pathCost = this.calculatePathCost(this.currentPaths[path]);
        return pathCost <= this.resources.money;
    }
    
    choosePath(path) {
        if (this.gameOver) return false;
        
        const cards = this.currentPaths[path];
        
        // Check if player can afford this path
        const pathCost = this.calculatePathCost(cards);
        if (pathCost > this.resources.money) {
            return false; // Cannot afford this path
        }
        
        // Deduct the cost
        this.resources.money -= pathCost;
        
        // Apply effects from all cards in the path
        for (const card of cards) {
            this.applyCardEffects(card);
        }
        
        // Check game over conditions
        if (this.checkGameOver()) {
            return true;
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
        
        return true; // Successfully chose path
    }
    
    applyCardEffects(card) {
        // Apply resource effects
        if (card.effects) {
            for (const [resource, change] of Object.entries(card.effects)) {
                // Only apply to soul and connections, money is handled via card.cost
                if (resource === 'soul' || resource === 'connections') {
                    this.resources[resource] += change;
                    
                    // Cap resources at max
                    if (this.resources[resource] > this.maxResources) {
                        this.resources[resource] = this.maxResources;
                    }
                }
            }
        }
    }
    
    checkGameOver() {
        // Check if Soul or Connections has hit 0
        if (this.resources.soul <= 0) {
            this.gameOver = true;
            this.gameOverReason = "Your soul has been depleted. You've become the drone you feared, never finding your authentic self.";
            return true;
        }
        
        if (this.resources.connections <= 0) {
            this.gameOver = true;
            this.gameOverReason = "You've lost all your connections. Isolated and alone, you can't continue your journey.";
            return true;
        }
        
        return false;
    }
    
    getResourcePercentage(resource) {
        return (this.resources[resource] / this.maxResources) * 100;
    }
}