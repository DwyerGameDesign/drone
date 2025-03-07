// Drone Man: The Journey - Game Core Class
class DroneManGame {
    constructor() {
        // Game settings
        this.maxResources = 10;
        this.startingResources = {
            soul: 5,
            connections: 5,
            money: 3
        };
        
        // Initialize game state
        this.resources = { ...this.startingResources };
        this.currentRound = 1;
        this.currentStop = 1;
        this.maxRounds = 3;
        this.stopsPerRound = 5;
        this.gameOver = false;
        this.gameOverReason = "";
        this.activePassiveEffects = [];
        this.narratives = [];
        this.passiveEffects = {};
        this.powerMeterTypes = {};
        this.currentNarrative = null;
        this.currentChoices = [];
        this.decisionHistory = [];
        
        // Load game data
        this.loadGameData();
    }
    
    // Load game data from JSON
    async loadGameData() {
        try {
            const response = await fetch('cards.json');
            if (!response.ok) {
                throw new Error(`Failed to load cards.json: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Game data loaded:', data);
            
            this.narratives = data.narratives || [];
            this.passiveEffects = data.passiveEffects || {};
            this.powerMeterTypes = data.powerMeterTypes || {};
            
            // Return the loaded data to signal it's ready
            return { success: true, data };
        } catch (error) {
            console.error('Error loading game data:', error);
            return { success: false, error };
        }
    }
    
    // Start or restart the game
    restart() {
        // Reset resources
        this.resources = { ...this.startingResources };
        this.currentRound = 1;
        this.currentStop = 1;
        this.gameOver = false;
        this.gameOverReason = "";
        this.activePassiveEffects = [];
        this.decisionHistory = [];
        
        return true;
    }
    
    // Get the current narrative
    getCurrentNarrative() {
        return this.narratives.find(n => n.stop === this.currentStop) || null;
    }
    
    // Make a choice for the current narrative
    makeChoice(choiceIndex) {
        // Get current narrative
        const narrative = this.getCurrentNarrative();
        if (!narrative) return { success: false, reason: 'No current narrative found' };
        
        // Get chosen choice
        const choice = narrative.choices[choiceIndex];
        if (!choice) return { success: false, reason: 'Invalid choice' };
        
        // Check if player can afford this choice
        if (choice.effects.money < 0 && Math.abs(choice.effects.money) > this.resources.money) {
            return { success: false, reason: 'Cannot afford this choice' };
        }
        
        // Check if this choice requires a power meter
        if (choice.powerMeter) {
            return { 
                success: true, 
                requiresPowerMeter: true,
                powerMeterType: choice.powerMeter,
                choiceIndex: choiceIndex
            };
        }
        
        // Process the choice directly if no power meter is required
        return this.processChoiceResult(choiceIndex);
    }
    
    // Process the result of a choice (with or without power meter)
    processChoiceResult(choiceIndex, powerMeterResult = null) {
        // Get current narrative and choice
        const narrative = this.getCurrentNarrative();
        const choice = narrative.choices[choiceIndex];
        
        // Create a copy of the effects
        const effects = { ...choice.effects };
        
        // Apply power meter modifiers if applicable
        if (powerMeterResult) {
            // Get the appropriate power meter configuration
            const meterType = choice.powerMeter;
            const meterConfig = this.powerMeterTypes[meterType];
            
            if (meterConfig && meterConfig.results[powerMeterResult]) {
                const modifier = meterConfig.results[powerMeterResult].modifier;
                
                // Apply modifier to all non-zero effects
                for (const [resource, value] of Object.entries(effects)) {
                    if (value !== 0) {
                        // For positive effects, add the modifier
                        // For negative effects, subtract the modifier (making them more negative)
                        effects[resource] = value > 0 ? value + modifier : value - modifier;
                    }
                }
            }
        }
        
        // Save the decision to history with modified effects
        const decision = {
            round: this.currentRound,
            stop: this.currentStop,
            title: narrative.title,
            choice: choiceIndex,
            text: choice.text,
            effects: effects,
            powerMeterResult: powerMeterResult
        };
        
        this.decisionHistory.push(decision);
        
        // Apply effects of the choice
        this.resources.soul = Math.max(0, Math.min(this.maxResources, this.resources.soul + (effects.soul || 0)));
        this.resources.connections = Math.max(0, Math.min(this.maxResources, this.resources.connections + (effects.connections || 0)));
        this.resources.money = Math.max(0, this.resources.money + (effects.money || 0));
        
        // Check for passive effect unlock
        if (choice.unlockPassive && !this.hasPassiveEffect(choice.unlockPassive)) {
            this.addPassiveEffect(choice.unlockPassive);
        }
        
        // Apply passive effects
        this.applyPassiveEffects();
        
        // Check game over conditions
        if (this.resources.soul <= 0) {
            this.gameOver = true;
            this.gameOverReason = "Your soul has been crushed by the corporate machine.";
            return { 
                success: true, 
                gameOver: true, 
                reason: this.gameOverReason,
                roundComplete: false,
                nextNarrative: null,
                resources: { ...this.resources }
            };
        } else if (this.resources.connections <= 0) {
            this.gameOver = true;
            this.gameOverReason = "You've become completely isolated from everyone who matters to you.";
            return { 
                success: true, 
                gameOver: true, 
                reason: this.gameOverReason,
                roundComplete: false,
                nextNarrative: null,
                resources: { ...this.resources }
            };
        }
        
        // Move to next stop
        this.currentStop++;
        
        // Check if round is complete
        let roundComplete = false;
        if (this.currentStop > this.currentRound * this.stopsPerRound) {
            // Check if all rounds are complete
            if (this.currentRound >= this.maxRounds) {
                // Game completed
                this.gameOver = true;
                return { 
                    success: true, 
                    gameOver: true, 
                    reason: "success",
                    roundComplete: false,
                    nextNarrative: null,
                    resources: { ...this.resources }
                };
            }
            
            // Round is complete, but game continues
            roundComplete = true;
            return { 
                success: true, 
                gameOver: false, 
                roundComplete: true,
                resources: { ...this.resources },
                nextNarrative: null,
                currentRound: this.currentRound
            };
        }
        
        // Get next narrative
        const nextNarrative = this.narratives.find(n => n.stop === this.currentStop) || null;
        
        return { 
            success: true, 
            gameOver: false, 
            roundComplete: false,
            nextNarrative,
            resources: { ...this.resources }
        };
    }
    
    // Get the power meter configuration for a specific type
    getPowerMeterConfig(type) {
        return this.powerMeterTypes[type] || null;
    }
    
    // Start the next round
    startNextRound() {
        // Update round counter
        this.currentRound++;
        this.currentStop = ((this.currentRound - 1) * this.stopsPerRound) + 1;
        
        // Get next narrative
        const nextNarrative = this.narratives.find(n => n.stop === this.currentStop) || null;
        
        return { 
            success: true, 
            nextNarrative,
            resources: { ...this.resources },
            currentRound: this.currentRound,
            currentStop: this.currentStop
        };
    }
    
    // Check if player has a passive effect
    hasPassiveEffect(effectId) {
        return this.activePassiveEffects.some(effect => effect.id === effectId);
    }
    
    // Add a passive effect
    addPassiveEffect(effectId) {
        const effect = this.passiveEffects[effectId];
        if (effect && !this.hasPassiveEffect(effectId)) {
            this.activePassiveEffects.push(effect);
            return true;
        }
        return false;
    }
    
    // Apply all active passive effects
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
    
    // Get summary text for round completion
    getRoundSummaryText() {
        let summaryText = '';
        
        if (this.currentRound === 1) {
            // End of first round
            if (this.resources.soul >= 7) {
                summaryText = "You've completed the first leg of your journey. Your soul is awakening, but greater challenges lie ahead.";
            } else if (this.resources.connections >= 7) {
                summaryText = "Your first steps have been taken. Your connections with others are strong, but your inner self still stirs with discontent.";
            } else if (this.resources.money >= 6) {
                summaryText = "Financial success has marked your early path, but at what cost to your deeper self?";
            } else {
                summaryText = "The initial steps of your journey have been tumultuous. The path forward remains uncertain.";
            }
        } else if (this.currentRound === 2) {
            // End of second round
            if (this.resources.soul >= 8 && this.resources.connections >= 6) {
                summaryText = "Balance is forming in your journey. Your soul and connections strengthen each other as you approach the final leg.";
            } else if (this.resources.soul <= 3 || this.resources.connections <= 3) {
                summaryText = "You're walking a dangerous line. One aspect of your life is suffering greatly - can you find equilibrium?";
            } else {
                summaryText = "The middle of your journey finds you changed, but still searching. The final steps will define you.";
            }
        }
        
        return summaryText;
    }
    
    // Get game over message based on final state
    getGameOverMessage(success = true) {
        if (!success) {
            return this.gameOverReason;
        }
        
        let message = `Journey complete! You've come full circle in the Drone Man's story.\n\nFinal stats:\nSoul: ${this.resources.soul}/10\nConnections: ${this.resources.connections}/10\nMoney: $${this.resources.money}`;
        
        // Custom ending based on final stats
        if (this.resources.soul >= 8 && this.resources.connections >= 8) {
            message += "\n\nYou broke free from the cycle and found genuine fulfillment.";
        } else if (this.resources.soul >= 8 && this.resources.connections < 5) {
            message += "\n\nYou found inner peace, though somewhat isolated from others.";
        } else if (this.resources.soul < 5 && this.resources.connections >= 8) {
            message += "\n\nYou're surrounded by people, but still searching for meaning.";
        } else if (this.resources.money >= 8) {
            message += "\n\nYou achieved financial success, but at what cost?";
        } else {
            message += "\n\nYou survived the journey, changed but still seeking.";
        }
        
        return message;
    }
}