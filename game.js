// Drone Man: The Journey - Game Core Class
class DroneManGame {
    constructor() {
        // Game settings
        this.maxResources = {
            soul: 10,
            connections: 10
        };
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
        this.purchaseEvents = [];
        this.lastRandomEventId = null;
        this.randomEventProbability = 30; // 30% chance of a random event after each narrative
        this.currentRandomEvent = null;
        
        // Load game data
        this.loadGameData();
    }
    
    // Load game data from JSON
    async loadGameData() {
        try {
            // Load main game data
            const cardsResponse = await fetch('cards.json');
            if (!cardsResponse.ok) {
                throw new Error(`Failed to load cards.json: ${cardsResponse.status}`);
            }
            
            const cardsData = await cardsResponse.json();
            console.log('Game data loaded:', cardsData);
            
            this.narratives = cardsData.narratives || [];
            this.passiveEffects = cardsData.passiveEffects || {};
            this.powerMeterTypes = cardsData.powerMeterTypes || {};
            
            // Load random events data
            const eventsResponse = await fetch('events.json');
            if (!eventsResponse.ok) {
                throw new Error(`Failed to load events.json: ${eventsResponse.status}`);
            }
            
            const eventsData = await eventsResponse.json();
            console.log('Events data loaded:', eventsData);
            
            this.purchaseEvents = eventsData.purchaseEvents || [];
            
            // Merge any additional passive effects from events
            if (eventsData.passiveEffects) {
                this.passiveEffects = { ...this.passiveEffects, ...eventsData.passiveEffects };
            }
            
            // Return the loaded data to signal it's ready
            return { success: true, data: { cards: cardsData, events: eventsData } };
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
        this.lastRandomEventId = null;
        this.currentRandomEvent = null;
        
        return true;
    }
    
    // Get the current narrative
    getCurrentNarrative() {
        return this.narratives.find(n => n.stop === this.currentStop) || null;
    }
    
    // Handle interaction based on narrative type
    handleInteraction(params) {
        const narrative = this.getCurrentNarrative();
        if (!narrative) return { success: false, reason: 'No current narrative found' };
        
        switch (narrative.interactionType) {
            case 'swingMeter':
                return this.handleSwingMeter(params.result);
            case 'choice':
                return this.handleChoice(params.choiceIndex);
            case 'randomEvent':
                return this.handleRandomEvent(params.optionIndex);
            default:
                return { success: false, reason: 'Unknown interaction type' };
        }
    }
    
    // Handle swing meter interaction
    handleSwingMeter(result) {
        const narrative = this.getCurrentNarrative();
        if (!narrative || narrative.interactionType !== 'swingMeter') {
            return { success: false, reason: 'Not a swing meter narrative' };
        }
        
        // Find the matching outcome for this result
        const outcome = narrative.outcomes.find(o => o.result === result);
        if (!outcome) {
            return { success: false, reason: 'Invalid swing meter result' };
        }
        
        // Process the outcome with special handling
        const processedResult = this.processOutcome(outcome);
        
        // Add swing meter result to the processed result
        processedResult.swingMeterResult = result;
        
        return processedResult;
    }
    
    // Handle choice interaction
    handleChoice(choiceIndex) {
        const narrative = this.getCurrentNarrative();
        if (!narrative || narrative.interactionType !== 'choice') {
            return { success: false, reason: 'Not a choice narrative' };
        }
        
        const choice = narrative.choices[choiceIndex];
        if (!choice) {
            return { success: false, reason: 'Invalid choice index' };
        }
        
        // Check if player can afford this choice if it costs money
        if (choice.effects.money < 0 && Math.abs(choice.effects.money) > this.resources.money) {
            return { success: false, reason: 'Cannot afford this choice' };
        }
        
        return this.processOutcome(choice);
    }
    
    // Handle random event interaction
    handleRandomEvent(optionIndex) {
        // Use the stored current random event
        const event = this.getCurrentRandomEvent();
        if (!event) {
            return { success: false, reason: 'No current random event' };
        }
        
        let option;
        if (optionIndex === -1) {
            // This is the "walk away" option
            option = event.options[1]; // The second option is usually the alternative
        } else {
            option = event.options[optionIndex];
        }
        
        if (!option) {
            return { success: false, reason: 'Invalid option index' };
        }
        
        // Check if player can afford this option
        if (option.cost && option.cost > this.resources.money) {
            return { success: false, reason: 'Cannot afford this option' };
        }
        
        // Process the outcome of the random event choice
        const result = this.processRandomEventOutcome(event, option);
        
        // Clear the current random event
        this.lastRandomEventId = event.id;
        this.currentRandomEvent = null;
        
        return result;
    }
    
    // Process the outcome of any narrative interaction
    processOutcome(outcome) {
        // Save the decision to history
        const narrative = this.getCurrentNarrative();
        const decision = {
            round: this.currentRound,
            stop: this.currentStop,
            title: narrative.title,
            text: outcome.text,
            effects: outcome.effects,
            interactionType: narrative.interactionType
        };
        
        this.decisionHistory.push(decision);
        
        // Apply effects of the choice
        this.resources.soul = Math.max(0, Math.min(this.maxResources.soul, this.resources.soul + (outcome.effects.soul || 0)));
        this.resources.connections = Math.max(0, Math.min(this.maxResources.connections, this.resources.connections + (outcome.effects.connections || 0)));
        this.resources.money = Math.max(0, this.resources.money + (outcome.effects.money || 0));
        
        // Check for passive effect unlock
        if (outcome.unlockPassive && !this.hasPassiveEffect(outcome.unlockPassive)) {
            this.addPassiveEffect(outcome.unlockPassive);
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
        
        // Check if we should trigger a random event
        const randomEvent = this.checkForRandomEvent();
        if (randomEvent) {
            this.setCurrentRandomEvent(randomEvent);
            return {
                success: true,
                gameOver: false,
                roundComplete: false,
                randomEvent: randomEvent,
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
    
    // Process the outcome of a random event
    processRandomEventOutcome(event, option) {
        // Save to decision history
        const decision = {
            round: this.currentRound,
            stop: this.currentStop,
            title: event.title,
            text: option.text,
            effects: option.effects,
            interactionType: 'randomEvent'
        };
        
        this.decisionHistory.push(decision);
        
        // Apply effects
        this.resources.soul = Math.max(0, Math.min(this.maxResources.soul, this.resources.soul + (option.effects.soul || 0)));
        this.resources.connections = Math.max(0, Math.min(this.maxResources.connections, this.resources.connections + (option.effects.connections || 0)));
        this.resources.money = Math.max(0, this.resources.money + (option.effects.money || 0));
        
        // Check for passive effect unlock
        if (option.unlockPassive && !this.hasPassiveEffect(option.unlockPassive)) {
            this.addPassiveEffect(option.unlockPassive);
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
                resources: { ...this.resources }
            };
        } else if (this.resources.connections <= 0) {
            this.gameOver = true;
            this.gameOverReason = "You've become completely isolated from everyone who matters to you.";
            return { 
                success: true, 
                gameOver: true, 
                reason: this.gameOverReason,
                resources: { ...this.resources }
            };
        }
        
        // Continue to next narrative
        const nextNarrative = this.narratives.find(n => n.stop === this.currentStop) || null;
        
        return {
            success: true,
            gameOver: false,
            randomEventComplete: true,
            nextNarrative,
            resources: { ...this.resources }
        };
    }

    // ADDED FUNCTIONS TO FIX THE ISSUES

    // Check for a random event
    checkForRandomEvent() {
        // Check if we should trigger a random event
        if (Math.random() * 100 < this.randomEventProbability) {
            // Get eligible random events
            const eligibleEvents = this.purchaseEvents.filter(event => {
                // Skip if we've already seen this event
                if (event.id === this.lastRandomEventId) return false;
                
                // Check if player has enough money
                if (event.requiredMoney && this.resources.money < event.requiredMoney) return false;
                
                // Check conditions
                if (event.conditions) {
                    if (event.conditions.minStop && this.currentStop < event.conditions.minStop) return false;
                    if (event.conditions.minSoul && this.resources.soul < event.conditions.minSoul) return false;
                    if (event.conditions.maxSoul && this.resources.soul > event.conditions.maxSoul) return false;
                    if (event.conditions.minConnections && this.resources.connections < event.conditions.minConnections) return false;
                    if (event.conditions.minMoney && this.resources.money < event.conditions.minMoney) return false;
                }
                
                return true;
            });
            
            // If we have eligible events, choose one based on probability
            if (eligibleEvents.length > 0) {
                // Sort events by probability (higher = more likely)
                const sortedEvents = [...eligibleEvents].sort((a, b) => (b.probability || 3) - (a.probability || 3));
                
                // Calculate total probability
                const totalProb = sortedEvents.reduce((sum, event) => sum + (event.probability || 3), 0);
                
                // Choose a random event based on probability
                let rnd = Math.random() * totalProb;
                let cumulativeProb = 0;
                
                for (const event of sortedEvents) {
                    cumulativeProb += (event.probability || 3);
                    if (rnd <= cumulativeProb) {
                        return event;
                    }
                }
                
                // Fallback to first event if something went wrong
                return sortedEvents[0];
            }
        }
        
        return null;
    }

    // Set the current random event
    setCurrentRandomEvent(event) {
        this.currentRandomEvent = event;
    }

    // Get the current random event
    getCurrentRandomEvent() {
        return this.currentRandomEvent;
    }

    // Add a passive effect
    addPassiveEffect(effectId) {
        if (this.passiveEffects[effectId] && !this.activePassiveEffects.includes(effectId)) {
            this.activePassiveEffects.push(effectId);
        }
    }

    // Check if a passive effect is active
    hasPassiveEffect(effectId) {
        return this.activePassiveEffects.includes(effectId);
    }

    // Apply all active passive effects
    applyPassiveEffects() {
        for (const effectId of this.activePassiveEffects) {
            const effect = this.passiveEffects[effectId];
            if (effect && effect.effect) {
                // Apply effect
                if (effect.effect.soul) {
                    this.resources.soul = Math.max(0, Math.min(this.maxResources.soul, this.resources.soul + effect.effect.soul));
                }
                if (effect.effect.connections) {
                    this.resources.connections = Math.max(0, Math.min(this.maxResources.connections, this.resources.connections + effect.effect.connections));
                }
                if (effect.effect.money) {
                    this.resources.money = Math.max(0, this.resources.money + effect.effect.money);
                }
            }
        }
    }

    // Get a power meter configuration
    getPowerMeterConfig(meterType) {
        return this.powerMeterTypes[meterType] || null;
    }

    // Start the next round
    startNextRound() {
        this.currentRound++;
        this.currentStop = (this.currentRound - 1) * this.stopsPerRound + 1;
        
        // Apply passive effects for the new round
        this.applyPassiveEffects();
        
        // Get the first narrative of the new round
        const nextNarrative = this.narratives.find(n => n.stop === this.currentStop) || null;
        
        return {
            success: true,
            gameOver: false,
            nextNarrative,
            resources: { ...this.resources },
            currentRound: this.currentRound
        };
    }

    // Get round summary text
    getRoundSummaryText() {
        // Default messages for each round
        const summaries = [
            "You've completed the first leg of your journey. Your soul is stirring, but challenges lie ahead.",
            "The second phase of your journey brings new perspectives. The path ahead is becoming clearer.",
            "You're in the final stretch of your journey. The decisions you've made have shaped who you're becoming."
        ];
        
        // If soul is low
        if (this.resources.soul <= 3) {
            return "Your spirit feels weary. The corporate world has taken its toll, but there's still time to find yourself.";
        }
        
        // If connections are low
        if (this.resources.connections <= 3) {
            return "You feel increasingly isolated. Perhaps it's time to reach out and rebuild those human connections.";
        }
        
        // If soul is high
        if (this.resources.soul >= 8) {
            return "You feel increasingly alive and connected to your true self. The path ahead seems full of possibility.";
        }
        
        // Default based on current round
        return summaries[this.currentRound - 1] || "Your journey continues. Each choice shapes who you are becoming.";
    }

    // Get game over message
    getGameOverMessage(success) {
        if (!success) {
            return this.gameOverReason;
        }
        
        // Success endings based on final soul and connections values
        if (this.resources.soul >= 8 && this.resources.connections >= 8) {
            return "You've found balance in your life. Your soul is full, your connections meaningful, and your journey has just begun. The train has carried you to a place where you can truly live, not just exist.";
        } else if (this.resources.soul >= 8) {
            return "You've reconnected with your authentic self. Perhaps some relationships were left behind, but your inner light burns bright. As you step off the train for the last time, you know you'll never be a drone again.";
        } else if (this.resources.connections >= 8) {
            return "You've built a network of meaningful relationships that sustain you. Though personal struggles remain, you're never alone in facing them. The journey continues, but now with companions who make the ride worthwhile.";
        } else {
            return "Your journey has changed you in subtle but significant ways. The corporate drone is gone, replaced by someone more aware, more alive. It's not perfect, but it's progress, and that's enough.";
        }
    }
}

// Make the game class available globally
window.DroneManGame = DroneManGame;