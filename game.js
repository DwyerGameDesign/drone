// Game state and core mechanics
class DroneManGame {
    constructor() {
        // Game settings
        this.maxResources = 10;
        this.startingResources = {
            soul: 5,
            connections: 5,
            money: 3
        };
        this.maxTurns = 20;
        
        // Initialize empty state
        this.cardDefinitions = null;
        this.passiveEffects = null;
        this.thematicDescriptions = null;
        
        // Initialize game state
        this.resources = { ...this.startingResources };
        this.currentTurn = 1;
        this.gameOver = false;
        this.gameOverReason = "";
        this.currentPaths = { a: [], b: [] };
        this.activePassiveEffects = [];
        
        // Load game data
        this.loadGameData();
    }
    
    async loadGameData() {
        try {
            console.log('Loading game data...');
            const response = await fetch('cards.json');
            const data = await response.json();
            
            console.log('Game data loaded:', data);
            
            this.cardDefinitions = data.cardDefinitions;
            this.passiveEffects = data.passiveEffects;
            this.thematicDescriptions = data.thematicDescriptions;
            
            // Initialize game after data is loaded
            this.resetGame();
            console.log('Game initialized with paths:', this.currentPaths);
        } catch (error) {
            console.error('Error loading game data:', error);
        }
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
        
        // Reset paths and effects
        this.currentPaths = { a: [], b: [] };
        this.activePassiveEffects = [];
        
        // Generate initial paths if data is loaded
        if (this.cardDefinitions) {
            this.generatePaths();
        } else {
            console.error('Cannot generate paths: card definitions not loaded');
        }
    }
    
    generatePaths() {
        console.log('Generating paths...');
        // Generate path A (tends toward resource-positive, money-negative)
        const pathACard = this.getRandomCard(true);
        this.currentPaths.a = pathACard ? [pathACard] : [];
        
        // Generate path B (tends toward resource-negative, money-positive)
        const pathBCard = this.getRandomCard(false);
        this.currentPaths.b = pathBCard ? [pathBCard] : [];
        
        console.log('Generated paths:', this.currentPaths);
    }
    
    getRandomCard(isPathA) {
        if (!this.cardDefinitions) {
            console.error('Cannot get random card: card definitions not loaded');
            return null;
        }

        // Filter cards based on path type
        const availableCards = this.cardDefinitions.filter(card => {
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
        const card = availableCards[Math.floor(Math.random() * availableCards.length)];
        
        // Add description from thematic descriptions if available
        return {
            ...card,
            description: this.thematicDescriptions[card.id] || this.generateDescription(card)
        };
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

            // Check for passive effect unlock
            if (card.unlockPassive && !this.hasPassiveEffect(card.unlockPassive)) {
                this.addPassiveEffect(card.unlockPassive);
            }
        }

        // Apply passive effects
        this.applyPassiveEffects();

        // Check game over conditions
        if (this.resources.soul <= 0 || this.resources.connections <= 0) {
            this.gameOver = true;
        }

        // Generate new paths
        this.generatePaths();
        return true;
    }
    
    hasPassiveEffect(effectId) {
        return this.activePassiveEffects.some(effect => effect.id === effectId);
    }
    
    addPassiveEffect(effectId) {
        const effect = this.passiveEffects[effectId];
        if (effect && !this.hasPassiveEffect(effectId)) {
            this.activePassiveEffects.push(effect);
        }
    }
    
    applyPassiveEffects() {
        for (const effect of this.activePassiveEffects) {
            if (effect.effect) {
                for (const [resource, value] of Object.entries(effect.effect)) {
                    if (resource === 'money') {
                        this.resources.money += value;
                    } else {
                        this.resources[resource] = Math.max(0, Math.min(10,
                            this.resources[resource] + value
                        ));
                    }
                }
            }
        }
    }
    
    getResourcePercentage(resource) {
        return (this.resources[resource] / 10) * 100;
    }

    generateDescription(card) {
        const effects = [];
        
        if (card.effects.soul > 0) effects.push("enriches your soul");
        else if (card.effects.soul < 0) effects.push("drains your spirit");
        
        if (card.effects.connections > 0) effects.push("strengthens your connections");
        else if (card.effects.connections < 0) effects.push("weakens your relationships");
        
        let description = effects.length > 0 
            ? `This choice ${effects.join(" and ")}.` 
            : "This choice will test your resolve.";
            
        if (card.cost > 0) {
            description += " It costs money but could be worth the investment.";
        } else if (card.cost < 0) {
            description += " You'll earn money but at what cost to yourself?";
        }
        
        return description;
    }
}