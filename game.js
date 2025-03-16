// Drone Man: The Journey - Game Core Class
class DroneManGame {
    constructor() {
        // Game settings
        this.maxResources = {
            soul: 10,
            connections: 10
        };
        this.failureThreshold = -5;
        this.performanceScore = 100;

        // Initialize game state
        this.resources = { soul: 0, connections: 0, money: 0 };
        this.decisionTypes = [];
        this.performanceResults = [];
        this.currentRound = 1;
        this.currentStop = 1;
        this.logicalStop = 0;
        this.maxRounds = 1; // Only 1 round with 5 stops
        this.stopsPerRound = 5; // 5 stops per journey
        this.gameOver = false;
        this.gameOverReason = null;
        this.narratives = [];
        this.currentNarrative = null;
        this.currentChoices = [];
        this.decisionHistory = [];
        this.completedSwingMeters = []; // Track completed swing meters
        this.journeyManager = new JourneyManager(this);
        this.achievementSystem = null;

        // Load endings data
        this.endingsData = null;
        this.loadEndingsData();

        // Load game data
        this.loadGameData();
    }

    // Initialize the journey manager after game data is loaded
    initializeJourneyManager() {
        console.log('Initializing journey manager');
        if (this.journeyManager) {
            this.journeyManager.initializeJourney();
        } else {
            console.error('Journey manager not initialized');
        }
    }

    // Load game data from JSON
    async loadGameData() {
        console.log('Loading game data...');
        try {
            // Load from external files
            const narrativesData = await this.loadJSON('narratives.json');

            // Process the loaded data
            this.processGameData(narrativesData);
            console.log('Game data loaded successfully from files');

            // Initialize the journey manager
            this.initializeJourneyManager();

            return { success: true };
        } catch (error) {
            console.error('Failed to load game data:', error);
            throw new Error('Could not load required game data files');
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
    processGameData(narrativesData) {
        // Process narratives data
        if (narrativesData) {
            this.narratives = narrativesData.narratives || [];
        }

        console.log('Game data processed:', {
            narratives: this.narratives.length
        });
    }

    // Load endings data from JSON file
    loadEndingsData() {
        fetch('endings.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load endings data');
                }
                return response.json();
            })
            .then(data => {
                console.log('Endings data loaded successfully');
                this.endingsData = data;

                // Debug: Log the structure of the endings data
                console.log('Success endings patterns:', Object.keys(data.success.patterns || {}));
                console.log('Success endings special conditions:', Object.keys(data.success.special_conditions || {}));
                console.log('Success endings dominant types:', Object.keys(data.success.dominant || {}));
                console.log('Failure endings stages:', Object.keys(data.failure || {}));
            })
            .catch(error => {
                console.error('Error loading endings data:', error);

                // Create minimal fallback structure with error messages
                this.endingsData = {
                    success: { patterns: {}, special_conditions: {}, dominant: {} },
                    failure: { early: {}, middle: {}, late: {} }
                };

                console.log('Using minimal fallback endings data structure');
            });
    }

    // startGame method in game.js
    startGame() {
        console.log('Starting game...');

        // Reset game state
        this.currentRound = 1;
        this.currentStop = 1;
        this.logicalStop = 0; // We will increment this to 1 just below
        this.performanceScore = 100;
        this.resources = { soul: 0, connections: 0, money: 0 };
        this.decisionHistory = [];
        this.decisionTypes = [];
        this.gameOver = false;
        this.gameOverReason = null;
        this.completedSwingMeters = []; // Reset completed swing meters

        // Initialize a new journey with randomized stops
        this.initializeJourneyManager();

        // Increment the logical stop to 1 for the first narrative
        this.logicalStop = 1;
        console.log(`Set logical stop to ${this.logicalStop} for first narrative`);

        // Get the first narrative based on the journey
        const firstNarrative = this.journeyManager.getNarrativeForLogicalStop(this.logicalStop);
        if (firstNarrative) {
            this.currentNarrative = firstNarrative;
            console.log(`Starting game with narrative: ${firstNarrative.title} (Logical Stop: ${this.logicalStop})`);
            return { success: true, narrative: firstNarrative };
        } else {
            console.error('Failed to get first narrative');

            // Try a fallback approach to find the first narrative
            const actualStop = this.journeyManager.getActualStop(1);
            const fallbackNarrative = this.narratives.find(n => n.stop === actualStop);
            if (fallbackNarrative) {
                this.currentNarrative = fallbackNarrative;
                console.log('Using fallback method to set first narrative:', fallbackNarrative.title);
                return { success: true, narrative: fallbackNarrative };
            }

            return { success: false, reason: 'Failed to get first narrative' };
        }
    }

    // Restart the game
    restart() {
        console.log('Restarting game...');

        // Reset game state
        this.currentStop = 1;
        this.logicalStop = 0;
        this.currentRound = 1;
        this.performanceScore = 100;
        this.decisionHistory = [];
        this.decisionTypes = [];
        this.resources = { soul: 0, connections: 0, money: 0 };
        this.gameOver = false;
        this.gameOverReason = null;

        // Initialize the journey manager
        this.initializeJourneyManager();

        // Increment the logical stop to 1 for the first narrative
        this.logicalStop = 1;
        console.log(`Set logical stop to ${this.logicalStop} for restart`);

        // Get the first narrative
        const firstActualStop = this.journeyManager.getActualStop(this.logicalStop);
        const firstNarrative = this.narratives.find(n => n.stop === firstActualStop);

        if (firstNarrative) {
            this.currentNarrative = firstNarrative;
            console.log('Set first narrative for restart:', firstNarrative.title);
        } else {
            console.error('Could not find first narrative for restart');
        }

        return {
            success: true,
            narrative: this.currentNarrative
        };
    }

    // Get the current narrative
    getCurrentNarrative() {
        return this.currentNarrative;
    }

    // Handle interaction based on narrative type
    handleInteraction(params) {
        console.log('Handling interaction:', params);
        const narrative = this.getCurrentNarrative();
        if (!narrative) return { success: false, reason: 'No current narrative found' };

        switch (narrative.interactionType) {
            case 'swingMeter':
                return this.handleSwingMeter(params.result, params.choice);
            case 'choice':
                return this.handleChoice(params.choiceIndex);
            default:
                return { success: false, reason: 'Unknown interaction type' };
        }
    }

    // Handle swing meter interaction
    handleSwingMeter(success, narrativeType) {
        console.log(`Handling swing meter result: ${success ? 'Success' : 'Failure'} for narrative type: ${narrativeType}`);
        console.log('Current logical stop:', this.logicalStop);
        console.log('Current narrative:', this.currentNarrative ? this.currentNarrative.title : 'None');

        // Track the decision in history
        const decision = {
            stop: Number(this.logicalStop),
            success: Boolean(success),
            narrativeType: String(narrativeType),
            intendedType: this.currentNarrative && this.currentNarrative.type ? String(this.currentNarrative.type) : "neutral" // Track the intended type from the narrative
        };

        console.log('Adding decision to history:', decision);
        this.decisionHistory.push(decision);

        // If successful, track the decision type
        if (success) {
            this.decisionTypes.push(narrativeType);
            console.log(`Added ${narrativeType} to decision types, now have ${this.decisionTypes.length} decisions`);
        }

        // Update performance score
        if (success) {
            this.performanceScore++;
            console.log(`Performance score increased to ${this.performanceScore}`);
        } else {
            // End game immediately on failure
            console.log(`Failure detected - ending game immediately`);
            this.gameOver = true;
            this.gameOverReason = "failure";

            // Log the decision history for debugging
            console.log('Decision history at failure:', this.decisionHistory);
            console.log('Decision types at failure:', this.decisionTypes);

            return { gameOver: true, reason: "failure" };
        }

        // Check if we've reached the end of the journey
        if (this.logicalStop >= this.journeyManager.getTotalStops()) {
            console.log('Reached the end of the journey');
            this.gameOver = true;
            this.gameOverReason = "success";
            return { gameOver: true, reason: "success" };
        }

        // Increment the logical stop counter
        this.logicalStop++;
        console.log(`Advanced to logical stop ${this.logicalStop}`);

        // Get the next narrative based on the logical stop
        const nextNarrative = this.journeyManager.getNarrativeForLogicalStop(this.logicalStop);
        if (nextNarrative) {
            this.currentStop = nextNarrative.stop;
            this.currentNarrative = nextNarrative;
            console.log(`Set current stop to ${this.currentStop} with narrative:`, nextNarrative);
        } else {
            console.error(`Failed to get narrative for logical stop ${this.logicalStop}`);
        }

        return { gameOver: false };
    }

    // Mark a swing meter as completed to prevent replaying
    markSwingMeterCompleted(narrativeId) {
        if (!this.completedSwingMeters.includes(narrativeId)) {
            this.completedSwingMeters.push(narrativeId);
            console.log(`Marked swing meter for narrative ${narrativeId} as completed`);
        }
    }

    // Check if a swing meter has been completed
    isSwingMeterCompleted(narrativeId) {
        return this.completedSwingMeters.includes(narrativeId);
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

        return this.processOutcome(choice);
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
            interactionType: narrative.interactionType
        };

        this.decisionHistory.push(decision);

        // Track the decision type
        if (outcome.decisionType) {
            this.decisionTypes[this.currentStop - 1] = outcome.decisionType;
        }

        // Track the performance result
        if (outcome.result) {
            this.performanceResults[this.currentStop - 1] = outcome.result;
        }

        // Update performance score based on result
        if (outcome.result === "fail") {
            this.performanceScore -= 2;
        } else if (outcome.result === "okay") {
            this.performanceScore -= 1;
        }

        // Check game over conditions
        if (this.performanceScore <= this.failureThreshold) {
            this.gameOver = true;
            this.gameOverReason = "You've lost focus on what really matters. The daily grind has worn you down completely.";
            return {
                success: true,
                gameOver: true,
                reason: this.gameOverReason,
                roundComplete: false,
                nextNarrative: null,
                resources: { ...this.resources },
                decisionTypes: [...this.decisionTypes],
                performanceResults: [...this.performanceResults]
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

        // Add logging to debug why nextNarrative might be null
        if (!nextNarrative) {
            console.warn(`No narrative found for stop ${this.currentStop}. Available stops:`,
                this.narratives.map(n => n.stop));
        }

        return {
            success: true,
            gameOver: false,
            roundComplete: false,
            nextNarrative,
            resources: { ...this.resources }
        };
    }

    // Start the next round
    startNextRound() {
        console.log('Starting next round');
        this.currentRound++;
        this.currentStop = (this.currentRound - 1) * this.stopsPerRound + 1;

        console.log(`Next round started: Round ${this.currentRound}, Stop ${this.currentStop}`);

        // Get the first narrative of the new round
        const nextNarrative = this.narratives.find(n => n.stop === this.currentStop) || null;

        if (nextNarrative) {
            // Set the current narrative
            this.currentNarrative = nextNarrative;
            console.log(`Set current narrative for new round: ${nextNarrative.title} (Stop ${nextNarrative.stop})`);
        } else {
            console.error(`Failed to get narrative for stop ${this.currentStop}`);
        }

        return { gameOver: false };
    }

    // Get round summary text
    getRoundSummaryText() {
        // Default messages for each round
        const summaries = [
            "You've completed the first leg of your journey. Your soul is stirring, but challenges lie ahead.",
            "The second phase of your journey brings new perspectives. The path ahead is becoming clearer.",
            "You're in the final stretch of your journey. The decisions you've made have shaped who you're becoming."
        ];

        // Default based on current round
        return summaries[this.currentRound - 1] || "Your journey continues. Each choice shapes who you are becoming.";
    }

    // Get game over message
    getGameOverMessage(success) {
        console.log('Getting game over message, success:', success, 'gameOverReason:', this.gameOverReason);

        // Generic fallback messages
        const genericSuccessMessage = "Your journey has changed you in subtle but significant ways. The corporate drone is gone, replaced by someone more aware, more alive.";
        const genericFailureMessage = "Your journey has come to an abrupt end. A moment's hesitation, a wrong choice, and everything changed.";

        if (success) {
            // Calculate stats for decision patterns
            const totalDecisions = this.decisionHistory.length;
            const soulCount = this.decisionTypes.filter(type => type === "soul").length;
            const connectionsCount = this.decisionTypes.filter(type => type === "connections").length;
            const successCount = this.decisionTypes.filter(type => type === "success").length;

            const soulPercentage = totalDecisions > 0 ? soulCount / totalDecisions : 0;
            const connectionsPercentage = totalDecisions > 0 ? connectionsCount / totalDecisions : 0;
            const successPercentage = totalDecisions > 0 ? successCount / totalDecisions : 0;

            console.log('Decision stats:', {
                total: totalDecisions,
                soul: { count: soulCount, percentage: soulPercentage },
                connections: { count: connectionsCount, percentage: connectionsPercentage },
                success: { count: successCount, percentage: successPercentage }
            });

            // Make sure we have endings data
            if (!this.endingsData || !this.endingsData.success) {
                console.warn('No endings data found, using generic success message');
                return genericSuccessMessage;
            }

            // Check for pure paths (all decisions of one type)
            if (soulPercentage === 1 && totalDecisions > 0) {
                return this.endingsData.success.patterns.all_soul?.message || genericSuccessMessage;
            } else if (connectionsPercentage === 1 && totalDecisions > 0) {
                return this.endingsData.success.patterns.all_connections?.message || genericSuccessMessage;
            } else if (successPercentage === 1 && totalDecisions > 0) {
                return this.endingsData.success.patterns.all_success?.message || genericSuccessMessage;
            }

            // Check for heavily weighted paths (e.g., 80%+ of one type)
            if (soulPercentage >= 0.8 && totalDecisions > 0) {
                return this.endingsData.success.patterns.soul_heavy?.message || genericSuccessMessage;
            } else if (connectionsPercentage >= 0.8 && totalDecisions > 0) {
                return this.endingsData.success.patterns.connections_heavy?.message || genericSuccessMessage;
            } else if (successPercentage >= 0.8 && totalDecisions > 0) {
                return this.endingsData.success.patterns.success_heavy?.message || genericSuccessMessage;
            }

            // Check for balanced dual paths
            if (Math.abs(soulPercentage - connectionsPercentage) < 0.2 && successPercentage < 0.2 && totalDecisions > 0) {
                return this.endingsData.success.patterns.soul_connections_balanced?.message || genericSuccessMessage;
            } else if (Math.abs(soulPercentage - successPercentage) < 0.2 && connectionsPercentage < 0.2 && totalDecisions > 0) {
                return this.endingsData.success.patterns.soul_success_balanced?.message || genericSuccessMessage;
            } else if (Math.abs(connectionsPercentage - successPercentage) < 0.2 && soulPercentage < 0.2 && totalDecisions > 0) {
                return this.endingsData.success.patterns.connections_success_balanced?.message || genericSuccessMessage;
            }

            // Check for perfect balance
            if (Math.abs(soulPercentage - 1 / 3) < 0.1 &&
                Math.abs(connectionsPercentage - 1 / 3) < 0.1 &&
                Math.abs(successPercentage - 1 / 3) < 0.1 &&
                totalDecisions >= 3) {
                return this.endingsData.success.patterns.perfect_balance?.message || genericSuccessMessage;
            }

            // Check for special narrative patterns

            // Late Bloomer: First half conventional, second half transformative
            if (totalDecisions >= 4) {
                const firstHalfDecisions = this.decisionTypes.slice(0, Math.floor(totalDecisions / 2));
                const secondHalfDecisions = this.decisionTypes.slice(Math.floor(totalDecisions / 2));

                // Late Bloomer: First half mostly success, second half mostly soul/connections
                const firstHalfSuccessCount = firstHalfDecisions.filter(type => type === "success").length;
                const secondHalfTransformativeCount = secondHalfDecisions.filter(type => type === "soul" || type === "connections").length;

                if (firstHalfSuccessCount / firstHalfDecisions.length >= 0.7 &&
                    secondHalfTransformativeCount / secondHalfDecisions.length >= 0.7) {
                    return this.endingsData.success.special_conditions.late_bloomer?.message || genericSuccessMessage;
                }

                // Early Decided: First decisions set the pattern for the rest
                const firstType = this.decisionTypes[0];
                const sameTypeCount = this.decisionTypes.filter(type => type === firstType).length;

                if (sameTypeCount / totalDecisions >= 0.7) {
                    return this.endingsData.success.special_conditions.early_decided?.message || genericSuccessMessage;
                }

                // Transformation Journey: Clear progression from one type to another
                const firstThirdType = this.decisionTypes.slice(0, Math.floor(totalDecisions / 3))[0];
                const lastThirdTypes = this.decisionTypes.slice(Math.floor(2 * totalDecisions / 3));
                const lastThirdDominantType = lastThirdTypes.reduce((acc, type) => {
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});

                const lastThirdDominant = Object.entries(lastThirdDominantType).sort((a, b) => b[1] - a[1])[0][0];

                if (firstThirdType !== lastThirdDominant &&
                    lastThirdTypes.filter(type => type === lastThirdDominant).length / lastThirdTypes.length >= 0.7) {
                    return this.endingsData.success.special_conditions.transformation_journey?.message || genericSuccessMessage;
                }

                // Unexpected Turn: Pattern breaks dramatically at some point
                for (let i = 1; i < totalDecisions; i++) {
                    const beforeTypes = this.decisionTypes.slice(0, i);
                    const afterTypes = this.decisionTypes.slice(i);

                    const beforeDominant = beforeTypes.reduce((acc, type) => {
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {});

                    const afterDominant = afterTypes.reduce((acc, type) => {
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {});

                    const beforeDominantType = Object.entries(beforeDominant).sort((a, b) => b[1] - a[1])[0][0];
                    const afterDominantType = Object.entries(afterDominant).sort((a, b) => b[1] - a[1])[0][0];

                    if (beforeDominantType !== afterDominantType &&
                        beforeTypes.filter(type => type === beforeDominantType).length / beforeTypes.length >= 0.7 &&
                        afterTypes.filter(type => type === afterDominantType).length / afterTypes.length >= 0.7) {
                        return this.endingsData.success.special_conditions.unexpected_turn?.message || genericSuccessMessage;
                    }
                }
            }

            // Fall back to dominant type endings
            let dominant = "mixed";
            if (soulCount > connectionsCount && soulCount > successCount) {
                dominant = "soul";
            } else if (connectionsCount > soulCount && connectionsCount > successCount) {
                dominant = "connections";
            } else if (successCount > soulCount && successCount > connectionsCount) {
                dominant = "success";
            }

            // Return the message from the dominant type or fallback
            return this.endingsData.success.dominant[dominant]?.message || genericSuccessMessage;
        } else {
            // Get the stop where the player failed
            const failedDecision = this.decisionHistory[this.decisionHistory.length - 1];
            const failedStop = failedDecision ? failedDecision.stop : 0;
            const failedType = failedDecision ? failedDecision.intendedType : "unknown";
            const totalStops = this.journeyManager.getTotalStops();

            console.log('Failed at stop:', failedStop, 'with decision type:', failedType, 'out of total stops:', totalStops);

            // Make sure we have endings data
            if (!this.endingsData || !this.endingsData.failure) {
                console.warn('No failure endings data found, using generic failure message');
                return genericFailureMessage;
            }

            // Determine the stage of the journey (early, middle, late)
            let stage = "middle";
            const progressPercentage = failedStop / totalStops;

            if (progressPercentage <= 0.33) {
                stage = "early";
            } else if (progressPercentage >= 0.67) {
                stage = "late";
            }

            console.log('Failure stage:', stage, 'Progress percentage:', progressPercentage);

            // Determine the dominant type based on decisions made so far
            let dominantType = "mixed";
            const soulCount = this.decisionTypes.filter(type => type === "soul").length;
            const connectionsCount = this.decisionTypes.filter(type => type === "connections").length;
            const successCount = this.decisionTypes.filter(type => type === "success").length;

            if (soulCount > connectionsCount && soulCount > successCount) {
                dominantType = "soul";
            } else if (connectionsCount > soulCount && connectionsCount > successCount) {
                dominantType = "connections";
            } else if (successCount > soulCount && successCount > connectionsCount) {
                dominantType = "success";
            }

            // If no decisions made yet, use the failed type
            if (this.decisionTypes.length === 0 && failedType && failedType !== "unknown") {
                dominantType = failedType;
            }

            console.log('Dominant type for failure ending:', dominantType, 'Stage:', stage);

            // Try to get the message from the failure stage and type
            try {
                // Debug the structure to see what's missing
                console.log('Checking failure ending path:',
                    `this.endingsData.failure[${stage}][${dominantType}]`,
                    this.endingsData.failure[stage] ?
                        (this.endingsData.failure[stage][dominantType] ?
                            'Found' :
                            `Missing dominantType "${dominantType}"`) :
                        `Missing stage "${stage}"`);

                // Return the message or fallback
                return this.endingsData.failure[stage]?.[dominantType]?.message || genericFailureMessage;
            } catch (error) {
                console.error('Error getting failure message:', error);
                return genericFailureMessage;
            }
        }
    }

    // Helper function to log the current game state (useful for debugging)
    logGameState() {
        console.log('=== GAME STATE ===');
        console.log('Round:', this.currentRound, 'Stop:', this.currentStop);
        console.log('Resources:', this.resources);
        console.log('Decision History:', this.decisionHistory.length, 'decisions');
        console.log('Current Narrative:', this.getCurrentNarrative()?.title);
        console.log('=================');
    }

    // Get a narrative for a specific stop
    getNarrativeForStop(stop) {
        return this.narratives.find(n => n.stop === stop) || null;
    }

    // Initialize the achievement system
    initializeAchievementSystem() {
        console.log('Initializing achievement system');
        if (window.AchievementSystem) {
            this.achievementSystem = new AchievementSystem(this);
            console.log('Achievement system initialized');
        } else {
            console.warn('AchievementSystem class not found');
        }
    }

    // Initialize game
    async initialize() {
        console.log('Initializing game...');

        // Load game data
        await this.loadGameData();

        // Initialize journey manager
        this.initializeJourneyManager();

        // Initialize achievement system
        this.initializeAchievementSystem();

        console.log('Game initialized successfully');
    }

    // Get ending type title
    getEndingType(success) {
        console.log('Getting ending type, success:', success);

        // Generic fallback titles
        const genericSuccessTitle = "BALANCED GROWTH ENDING";
        const genericFailureTitle = "JOURNEY DERAILED";

        // Use the same pattern matching logic as getGameOverMessage
        if (success) {
            // Calculate stats for decision patterns
            const totalDecisions = this.decisionHistory.length;
            const soulCount = this.decisionTypes.filter(type => type === "soul").length;
            const connectionsCount = this.decisionTypes.filter(type => type === "connections").length;
            const successCount = this.decisionTypes.filter(type => type === "success").length;

            const soulPercentage = totalDecisions > 0 ? soulCount / totalDecisions : 0;
            const connectionsPercentage = totalDecisions > 0 ? connectionsCount / totalDecisions : 0;
            const successPercentage = totalDecisions > 0 ? successCount / totalDecisions : 0;

            // Make sure we have endings data
            if (!this.endingsData || !this.endingsData.success) {
                console.warn('No endings data found for ending type, using generic success title');
                return genericSuccessTitle;
            }

            // Check for pure paths (all decisions of one type)
            if (soulPercentage === 1 && totalDecisions > 0) {
                return this.endingsData.success.patterns.all_soul?.title || "PURE AUTHENTICITY ENDING";
            } else if (connectionsPercentage === 1 && totalDecisions > 0) {
                return this.endingsData.success.patterns.all_connections?.title || "PURE CONNECTIONS ENDING";
            } else if (successPercentage === 1 && totalDecisions > 0) {
                return this.endingsData.success.patterns.all_success?.title || "PURE ACHIEVEMENT ENDING";
            }

            // Check for heavily weighted paths (e.g., 80%+ of one type)
            if (soulPercentage >= 0.8 && totalDecisions > 0) {
                return this.endingsData.success.patterns.soul_heavy?.title || "SOUL-FOCUSED ENDING";
            } else if (connectionsPercentage >= 0.8 && totalDecisions > 0) {
                return this.endingsData.success.patterns.connections_heavy?.title || "CONNECTIONS-FOCUSED ENDING";
            } else if (successPercentage >= 0.8 && totalDecisions > 0) {
                return this.endingsData.success.patterns.success_heavy?.title || "ACHIEVEMENT-FOCUSED ENDING";
            }

            // Check for balanced dual paths
            if (Math.abs(soulPercentage - connectionsPercentage) < 0.2 && successPercentage < 0.2 && totalDecisions > 0) {
                return this.endingsData.success.patterns.soul_connections_balanced?.title || "AUTHENTIC RELATIONSHIPS ENDING";
            } else if (Math.abs(soulPercentage - successPercentage) < 0.2 && connectionsPercentage < 0.2 && totalDecisions > 0) {
                return this.endingsData.success.patterns.soul_success_balanced?.title || "AUTHENTIC ACHIEVEMENT ENDING";
            } else if (Math.abs(connectionsPercentage - successPercentage) < 0.2 && soulPercentage < 0.2 && totalDecisions > 0) {
                return this.endingsData.success.patterns.connections_success_balanced?.title || "CONNECTED ACHIEVEMENT ENDING";
            }

            // Check for perfect balance
            if (Math.abs(soulPercentage - 1 / 3) < 0.1 &&
                Math.abs(connectionsPercentage - 1 / 3) < 0.1 &&
                Math.abs(successPercentage - 1 / 3) < 0.1 &&
                totalDecisions >= 3) {
                return this.endingsData.success.patterns.perfect_balance?.title || "PERFECT HARMONY ENDING";
            }

            // Check for special narrative patterns
            if (totalDecisions >= 4) {
                // Late Bloomer pattern
                const firstHalfDecisions = this.decisionTypes.slice(0, Math.floor(totalDecisions / 2));
                const secondHalfDecisions = this.decisionTypes.slice(Math.floor(totalDecisions / 2));
                const firstHalfSuccessCount = firstHalfDecisions.filter(type => type === "success").length;
                const secondHalfTransformativeCount = secondHalfDecisions.filter(type => type === "soul" || type === "connections").length;

                if (firstHalfSuccessCount / firstHalfDecisions.length >= 0.7 &&
                    secondHalfTransformativeCount / secondHalfDecisions.length >= 0.7) {
                    return this.endingsData.success.special_conditions.late_bloomer?.title || "LATE BLOOMER ENDING";
                }

                // Early Decided pattern
                const firstType = this.decisionTypes[0];
                const sameTypeCount = this.decisionTypes.filter(type => type === firstType).length;
                if (sameTypeCount / totalDecisions >= 0.7) {
                    return this.endingsData.success.special_conditions.early_decided?.title || "EARLY DECIDED ENDING";
                }

                // Transformation Journey pattern
                const firstThirdType = this.decisionTypes.slice(0, Math.floor(totalDecisions / 3))[0];
                const lastThirdTypes = this.decisionTypes.slice(Math.floor(2 * totalDecisions / 3));
                const lastThirdDominantType = lastThirdTypes.reduce((acc, type) => {
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});

                const lastThirdDominant = Object.entries(lastThirdDominantType).sort((a, b) => b[1] - a[1])[0][0];
                if (firstThirdType !== lastThirdDominant &&
                    lastThirdTypes.filter(type => type === lastThirdDominant).length / lastThirdTypes.length >= 0.7) {
                    return this.endingsData.success.special_conditions.transformation_journey?.title || "TRANSFORMATION JOURNEY ENDING";
                }

                // Unexpected Turn pattern
                for (let i = 1; i < totalDecisions; i++) {
                    const beforeTypes = this.decisionTypes.slice(0, i);
                    const afterTypes = this.decisionTypes.slice(i);

                    const beforeDominant = beforeTypes.reduce((acc, type) => {
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {});

                    const afterDominant = afterTypes.reduce((acc, type) => {
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {});

                    const beforeDominantType = Object.entries(beforeDominant).sort((a, b) => b[1] - a[1])[0][0];
                    const afterDominantType = Object.entries(afterDominant).sort((a, b) => b[1] - a[1])[0][0];

                    if (beforeDominantType !== afterDominantType &&
                        beforeTypes.filter(type => type === beforeDominantType).length / beforeTypes.length >= 0.7 &&
                        afterTypes.filter(type => type === afterDominantType).length / afterTypes.length >= 0.7) {
                        return this.endingsData.success.special_conditions.unexpected_turn?.title || "UNEXPECTED TURN ENDING";
                    }
                }
            }

            // Fall back to dominant type endings
            let dominant = "mixed";
            if (soulCount > connectionsCount && soulCount > successCount) {
                dominant = "soul";
            } else if (connectionsCount > soulCount && connectionsCount > successCount) {
                dominant = "connections";
            } else if (successCount > soulCount && successCount > connectionsCount) {
                dominant = "success";
            }

            // Return the title from the dominant type or fallback
            return this.endingsData.success.dominant[dominant]?.title ||
                (dominant === "soul" ? "AUTHENTIC SELF ENDING" :
                    dominant === "connections" ? "MEANINGFUL BONDS ENDING" :
                        dominant === "success" ? "PROFESSIONAL ACHIEVEMENT ENDING" :
                            genericSuccessTitle);
        } else {
            // Get the stop where the player failed
            const failedDecision = this.decisionHistory[this.decisionHistory.length - 1];
            const failedStop = failedDecision ? failedDecision.stop : 0;
            const failedType = failedDecision ? failedDecision.intendedType : "unknown";
            const totalStops = this.journeyManager.getTotalStops();

            // Make sure we have endings data
            if (!this.endingsData || !this.endingsData.failure) {
                console.warn('No failure endings data found for ending type, using generic failure title');
                return genericFailureTitle;
            }

            // Determine the stage of the journey (early, middle, late)
            let stage = "middle";
            const progressPercentage = failedStop / totalStops;

            if (progressPercentage <= 0.33) {
                stage = "early";
            } else if (progressPercentage >= 0.67) {
                stage = "late";
            }

            // Determine the dominant type based on decisions made so far
            let dominantType = "mixed";
            const soulCount = this.decisionTypes.filter(type => type === "soul").length;
            const connectionsCount = this.decisionTypes.filter(type => type === "connections").length;
            const successCount = this.decisionTypes.filter(type => type === "success").length;

            if (soulCount > connectionsCount && soulCount > successCount) {
                dominantType = "soul";
            } else if (connectionsCount > soulCount && connectionsCount > successCount) {
                dominantType = "connections";
            } else if (successCount > soulCount && successCount > connectionsCount) {
                dominantType = "success";
            }

            // If no decisions made yet, use the failed type
            if (this.decisionTypes.length === 0 && failedType && failedType !== "unknown") {
                dominantType = failedType;
            }

            // Return the title from the failure stage and type or fallback
            try {
                const stageTitles = {
                    early: {
                        soul: "LOST AUTHENTICITY ENDING",
                        connections: "BROKEN BONDS ENDING",
                        success: "HOLLOW ACHIEVEMENTS ENDING",
                        mixed: "DIRECTIONLESS ENDING"
                    },
                    middle: {
                        soul: "INCOMPLETE AUTHENTICITY ENDING",
                        connections: "FRAGILE BONDS ENDING",
                        success: "STALLED ACHIEVEMENT ENDING",
                        mixed: "INTERRUPTED JOURNEY ENDING"
                    },
                    late: {
                        soul: "ALMOST AUTHENTIC ENDING",
                        connections: "ALMOST CONNECTED ENDING",
                        success: "ALMOST ACHIEVED ENDING",
                        mixed: "NEARLY COMPLETE ENDING"
                    }
                };

                return this.endingsData.failure[stage]?.[dominantType]?.title ||
                    stageTitles[stage]?.[dominantType] ||
                    genericFailureTitle;
            } catch (error) {
                console.error('Error getting failure ending type:', error);
                return genericFailureTitle;
            }
        }
    }
}