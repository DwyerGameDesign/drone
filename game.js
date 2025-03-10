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
    
    // Load game data from JSON - with error handling and retries
    async loadGameData() {
        console.log('Loading game data...');
        try {
            // First attempt to load from external files
            const cardsData = await this.loadJSON('cards.json');
            const eventsData = await this.loadJSON('events.json');
            
            // Process the loaded data
            this.processGameData(cardsData, eventsData);
            console.log('Game data loaded successfully from files');
            return { success: true };
        } catch (error) {
            console.warn('Failed to load from external files, using embedded data:', error);
            
            // Fallback to embedded data
            const cardsData = this.getEmbeddedCardsData();
            const eventsData = this.getEmbeddedEventsData();
            
            // Process the embedded data
            this.processGameData(cardsData, eventsData);
            console.log('Game data loaded from embedded source');
            return { success: true };
        }
    }
    
    // Helper to load JSON with retries
    async loadJSON(url, retries = 2) {
        let lastError;
        
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to load ${url}: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed to load ${url}:`, error);
                lastError = error;
                // Wait a moment before retrying
                if (i < retries) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        throw lastError || new Error(`Failed to load ${url} after ${retries + 1} attempts`);
    }
    
    // Process loaded game data
    processGameData(cardsData, eventsData) {
        // Process cards data
        if (cardsData) {
            this.narratives = cardsData.narratives || [];
            this.passiveEffects = cardsData.passiveEffects || {};
            this.powerMeterTypes = cardsData.powerMeterTypes || {};
        }
        
        // Process events data
        if (eventsData) {
            this.purchaseEvents = eventsData.purchaseEvents || [];
            
            // Merge any additional passive effects from events
            if (eventsData.passiveEffects) {
                this.passiveEffects = { ...this.passiveEffects, ...eventsData.passiveEffects };
            }
        }
        
        console.log('Game data processed:', {
            narratives: this.narratives.length,
            powerMeterTypes: Object.keys(this.powerMeterTypes).length,
            purchaseEvents: this.purchaseEvents.length
        });
    }
    
    // Embedded data as fallback
    getEmbeddedCardsData() {
        return {
            "narratives": [
                {
                    "stop": 1,
                    "title": "Inbound",
                    "narrative": "6:40 AM. The platform is cold and quiet as you wait for the train. The same train you've taken every weekday for years. You pull your beige trenchcoat tighter around your shoulders as you scan the empty platform. A distant rumble signals the approaching train. Just like yesterday, and the day before, and all the days stretching back through the calendar of your memory.",
                    "interactionType": "swingMeter",
                    "meterType": "standard",
                    "meterContext": "You try to find your natural balance between focus and flow...",
                    "outcomes": [
                        {
                            "result": "fail",
                            "text": "Review your upcoming work presentation",
                            "effects": { "soul": -1, "connections": 0, "money": 1 }
                        },
                        {
                            "result": "okay",
                            "text": "Observe the world around you",
                            "effects": { "soul": 0, "connections": 0, "money": 0 }
                        },
                        {
                            "result": "good",
                            "text": "Think about the life you once dreamed of",
                            "effects": { "soul": 1, "connections": 0, "money": 0 }
                        }
                    ]
                },
                {
                    "stop": 2,
                    "title": "Drone",
                    "narrative": "The train lurches forward as you settle into your usual seat. Through the window, the suburbs slide by in a blur of sameness. You're halfway through the commute when your phone buzzes. It's your boss: \"I need that report finished by noon.\" You were planning to take lunch with an old friend today, someone you've been meaning to reconnect with for months.",
                    "interactionType": "choice",
                    "choices": [
                        {
                            "text": "Cancel lunch, finish the report",
                            "effects": { "soul": -1, "connections": -1, "money": 2 },
                            "unlockPassive": "for_me"
                        },
                        {
                            "text": "Keep the lunch date, rush the report later",
                            "effects": { "soul": 1, "connections": 2, "money": -1 }
                        }
                    ]
                },
                {
                    "stop": 3,
                    "title": "Write Along The Way",
                    "narrative": "Your college journal sits on your nightstand, gathering dust. Inside are fragments of stories you once wanted to write, dreams you once planned to chase. Tonight, you find yourself flipping through its pages, feeling a strange spark that hasn't flickered in years. The blank page calls to you.",
                    "interactionType": "swingMeter",
                    "meterType": "standard",
                    "meterContext": "You try to quiet your inner critic and let the words flow naturally...",
                    "outcomes": [
                        {
                            "result": "fail",
                            "text": "Close the journal, there's no time for fantasies",
                            "effects": { "soul": -1, "connections": 0, "money": 0 }
                        },
                        {
                            "result": "okay",
                            "text": "Write a few lines before getting distracted",
                            "effects": { "soul": 1, "connections": 0, "money": 0 }
                        },
                        {
                            "result": "good",
                            "text": "Start writing again, even if just for yourself",
                            "effects": { "soul": 2, "connections": 0, "money": 0 },
                            "unlockPassive": "write_along"
                        }
                    ]
                },
                {
                    "stop": 4,
                    "title": "Last Life",
                    "narrative": "It's 2AM. The blue light of your monitor is the only illumination in your apartment. \"Just one more level,\" you told yourself three hours ago. Your friends have invited you out countless times, but the digital world feels safer, more controllable. Your character stands victorious on screen, but the victory feels hollow.",
                    "interactionType": "swingMeter",
                    "meterType": "noOvershot",
                    "meterContext": "You need to find balance between digital escape and real-world connection...",
                    "outcomes": [
                        {
                            "result": "fail",
                            "text": "Start a new game, you're on a roll tonight",
                            "effects": { "soul": -1, "connections": -1, "money": 0 },
                            "unlockPassive": "last_life"
                        },
                        {
                            "result": "okay",
                            "text": "Go to bed, you'll text friends tomorrow maybe",
                            "effects": { "soul": 0, "connections": 0, "money": 0 }
                        },
                        {
                            "result": "good",
                            "text": "Log off and text your friends about weekend plans",
                            "effects": { "soul": 1, "connections": 2, "money": -1 }
                        }
                    ]
                },
                {
                    "stop": 5,
                    "title": "Strange Passenger",
                    "narrative": "A stranger sits beside you on today's commute - something that never happens in your carefully regulated routine. They're reading a book you loved years ago. Your eyes meet, and there's a strange pull, an unexpected connection. They smile, and for a moment, the train seems less gray.",
                    "interactionType": "swingMeter",
                    "meterType": "critical",
                    "meterContext": "You feel a momentary surge of courage competing with your usual caution...",
                    "outcomes": [
                        {
                            "result": "fail",
                            "text": "Look away, relationships are too complicated",
                            "effects": { "soul": -2, "connections": -1, "money": 0 },
                            "unlockPassive": "strange_passenger"
                        },
                        {
                            "result": "good",
                            "text": "Strike up a conversation about the book",
                            "effects": { "soul": 1, "connections": 2, "money": 0 }
                        }
                    ]
                }
            ],
            "passiveEffects": {
                "strange_passenger": {
                    "id": "strange_passenger",
                    "name": "Strange Passenger",
                    "description": "-1 Soul each stop",
                    "type": "soul-negative",
                    "effect": {
                        "soul": -1
                    }
                },
                "last_life": {
                    "id": "last_life",
                    "name": "Last Life",
                    "description": "-1 Soul each stop",
                    "type": "soul-negative",
                    "effect": {
                        "soul": -1
                    }
                },
                "for_me": {
                    "id": "for_me",
                    "name": "For Me",
                    "description": "+1 Money each stop",
                    "type": "money-positive",
                    "effect": {
                        "money": 1
                    }
                },
                "write_along": {
                    "id": "write_along",
                    "name": "Write Along The Way",
                    "description": "+1 Connection each stop",
                    "type": "connections-positive",
                    "effect": {
                        "connections": 1
                    }
                }
            },
            "powerMeterTypes": {
                "standard": {
                    "title": "STANDARD CHALLENGE",
                    "narrative": "Balance is key. Find the right amount of effort without going too far.",
                    "zones": [
                        { "width": 240, "color": "#e74c3c" }, 
                        { "width": 50, "color": "#ff9933" },
                        { "width": 50, "color": "#2ecc71" },
                        { "width": 60, "color": "#ff9933" }
                    ],
                    "results": {
                        "fail": {"text": "TOO WEAK", "modifier": -1},
                        "okay": {"text": "ADEQUATE", "modifier": 0},
                        "good": {"text": "PERFECT", "modifier": 1}
                    },
                    "speed": 5
                },
                "critical": {
                    "title": "CRITICAL MOMENT",
                    "narrative": "Perfect timing required. This is your one chance - a single moment will define everything.",
                    "zones": [
                        { "width": 280, "color": "#e74c3c" },
                        { "width": 40, "color": "#2ecc71" },
                        { "width": 80, "color": "#e74c3c" }
                    ],
                    "results": {
                        "fail": {"text": "FAILURE", "modifier": -2},
                        "good": {"text": "SUCCESS", "modifier": 2}
                    },
                    "speed": 6
                },
                "noOvershot": {
                    "title": "MEASURED RESPONSE",
                    "narrative": "Finding balance is crucial. Neither too little nor too much will serve you here.",
                    "zones": [
                        { "width": 240, "color": "#e74c3c" },
                        { "width": 60, "color": "#ff9933" },
                        { "width": 60, "color": "#2ecc71" },
                        { "width": 40, "color": "#e74c3c" }
                    ],
                    "results": {
                        "fail": {"text": "MISSED THE MARK", "modifier": -1},
                        "okay": {"text": "CLOSE ENOUGH", "modifier": 0},
                        "good": {"text": "BALANCED", "modifier": 1}
                    },
                    "speed": 5
                }
            }
        };
    }
    
    getEmbeddedEventsData() {
        return {
            "purchaseEvents": [
                {
                    "id": "new_gadget",
                    "title": "Tech Temptation",
                    "narrative": "Walking past an electronics store, a sleek new smartphone catches your eye. The latest model with features you don't need but suddenly want. Your current phone works fine, but the allure of something new pulls at you.",
                    "options": [
                        {
                            "text": "Buy the new phone",
                            "cost": 3,
                            "effects": { "soul": -1, "connections": 0, "money": -3 }
                        },
                        {
                            "text": "Walk away, it's just a distraction",
                            "effects": { "soul": 1, "connections": 0, "money": 0 }
                        }
                    ],
                    "requiredMoney": 3,
                    "probability": 3,
                    "conditions": {
                        "minStop": 2
                    }
                },
                {
                    "id": "art_class",
                    "title": "Creative Opportunity",
                    "narrative": "A flyer on a community board catches your attention: \"Express Yourself: Evening Art Classes for Beginners.\" Something stirs inside you at the thought of creating something with your hands, of learning a new skill just for the joy of it.",
                    "options": [
                        {
                            "text": "Sign up for the class",
                            "cost": 2,
                            "effects": { "soul": 2, "connections": 1, "money": -2 }
                        },
                        {
                            "text": "Take the flyer but decide later",
                            "effects": { "soul": 0, "connections": 0, "money": 0 }
                        }
                    ],
                    "requiredMoney": 2,
                    "probability": 4,
                    "conditions": {
                        "minSoul": 6
                    }
                },
                {
                    "id": "coffee_upgrade",
                    "title": "Daily Ritual",
                    "narrative": "The barista at your regular coffee shop smiles as you approach. \"Want to try our premium single-origin today? It's a few dollars more, but it's incredible.\" It's a small luxury, but one that might brighten your morning routine.",
                    "options": [
                        {
                            "text": "Treat yourself to the premium coffee",
                            "cost": 1,
                            "effects": { "soul": 1, "connections": 0, "money": -1 }
                        },
                        {
                            "text": "Stick with your usual order",
                            "effects": { "soul": 0, "connections": 0, "money": 0 }
                        }
                    ],
                    "requiredMoney": 1,
                    "probability": 5,
                    "conditions": {
                        "minStop": 1
                    }
                }
            ],
            "passiveEffects": {
                "career_investment": {
                    "id": "career_investment",
                    "name": "Career Investment",
                    "description": "+1 Money each stop",
                    "type": "money-positive",
                    "effect": {
                        "money": 1
                    }
                },
                "creative_outlet": {
                    "id": "creative_outlet",
                    "name": "Creative Outlet",
                    "description": "+1 Soul each stop",
                    "type": "soul-positive",
                    "effect": {
                        "soul": 1
                    }
                }
            }
        };
    }
    
    // Start or restart the game
    restart() {
        console.log('Restarting game...');
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
        const narrative = this.narratives.find(n => n.stop === this.currentStop) || null;
        if (!narrative) {
            console.warn(`No narrative found for stop ${this.currentStop}`);
        }
        return narrative;
    }
    
    // Handle interaction based on narrative type
    handleInteraction(params) {
        console.log('Handling interaction:', params);
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
        console.log('Handling swing meter result:', result);
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
        console.log('Handling choice:', choiceIndex);
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
        console.log('Handling random event option:', optionIndex);
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
        console.log('Processing outcome:', outcome);
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
        console.log('Processing random event outcome:', event.id, option);
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
            this.activePassiveEffects.push(option.unlockPassive);
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
        console.log('Setting current random event:', event.id);
        this.currentRandomEvent = event;
    }

    // Get the current random event
    getCurrentRandomEvent() {
        return this.currentRandomEvent;
    }

    // Add a passive effect
    addPassiveEffect(effectId) {
        console.log('Adding passive effect:', effectId);
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
        console.log('Applying passive effects:', this.activePassiveEffects);
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
        const config = this.powerMeterTypes[meterType] || null;
        if (!config) {
            console.warn(`Power meter type "${meterType}" not found, falling back to standard`);
            return this.powerMeterTypes.standard || null;
        }
        return config;
    }

    // Start the next round
    startNextRound() {
        console.log('Starting next round');
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

    // Helper function to log the current game state (useful for debugging)
    logGameState() {
        console.log('=== GAME STATE ===');
        console.log('Round:', this.currentRound, 'Stop:', this.currentStop);
        console.log('Resources:', this.resources);
        console.log('Active Effects:', this.activePassiveEffects);
        console.log('Decision History:', this.decisionHistory.length, 'decisions');
        console.log('Current Narrative:', this.getCurrentNarrative()?.title);
        console.log('=================');
    }
}

// Make the game class available globally
window.DroneManGame = DroneManGame;