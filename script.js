// Drone Man: The Journey - Main script
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded. Initializing game...');
    
    // Create game instance
    const game = new DroneManGame();
    window.gameInstance = game; // Make it globally accessible for swing meter
    
    // UI Elements
    const elements = {
        roundNumber: document.getElementById('round-number'),
        soulBar: document.getElementById('soul-bar'),
        connectionsBar: document.getElementById('connections-bar'),
        soulValue: document.getElementById('soul-value'),
        connectionsValue: document.getElementById('connections-value'),
        moneyValue: document.getElementById('money-value'),
        narrativeCard: document.getElementById('narrative-card'),
        narrativeCardTitle: document.querySelector('.narrative-card-title'),
        narrativeCardText: document.querySelector('.narrative-card-text'),
        narrativeCardChoices: document.querySelector('.narrative-card-choices'),
        historyTrack: document.getElementById('history-track'),
        roundComplete: document.getElementById('round-complete'),
        completedRound: document.getElementById('completed-round'),
        roundSoulValue: document.getElementById('round-soul-value'),
        roundConnectionsValue: document.getElementById('round-connections-value'),
        roundMoneyValue: document.getElementById('round-money-value'),
        roundSummaryText: document.getElementById('round-summary-text'),
        nextRoundButton: document.getElementById('next-round-button'),
        gameOver: document.getElementById('game-over'),
        gameOverMessage: document.getElementById('game-over-message'),
        restartButton: document.getElementById('restart-button'),
        pathA: document.getElementById('path-a'),
        pathB: document.getElementById('path-b')
    };
    
    // Debug check if all elements are available
    console.log('UI Elements initialized: ', elements);
    
    // Typewriter effect variables
    let isTyping = false;
    let skipTyping = false;
    const typingSpeed = 30; // ms per character
    
    // Add event listeners
    elements.narrativeCard.addEventListener('click', function() {
        if (isTyping) {
            skipTyping = true;
        }
    });
    
    elements.nextRoundButton.addEventListener('click', function() {
        const result = game.startNextRound();
        elements.roundComplete.style.display = 'none';
        displayNarrative(result.nextNarrative);
        updateUI();
    });
    
    elements.restartButton.addEventListener('click', function() {
        game.restart();
        elements.gameOver.style.display = 'none';
        elements.historyTrack.innerHTML = '';
        const narrative = game.getCurrentNarrative();
        displayNarrative(narrative);
        updateUI();
    });
    
    // Wait for game data to load
    waitForGameData(game).then(() => {
        console.log('Game data loaded successfully');
        // Start the game
        const narrative = game.getCurrentNarrative();
        console.log('Current narrative:', narrative);
        displayNarrative(narrative);
        updateUI();
    }).catch(error => {
        console.error('Failed to load game data:', error);
    });
    
    // Function to wait for game data to load
    async function waitForGameData(game) {
        return new Promise((resolve, reject) => {
            console.log('Waiting for game data to load...');
            const maxAttempts = 50; // 5 seconds with 100ms interval
            let attempts = 0;
            
            const checkInterval = setInterval(() => {
                attempts++;
                if (game.narratives && game.narratives.length > 0) {
                    clearInterval(checkInterval);
                    console.log('Game data loaded after', attempts, 'attempts');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('Timeout waiting for game data'));
                }
            }, 100);
        });
    }
    
    // Display narrative with typewriter effect
    function displayNarrative(narrative) {
        console.log('Displaying narrative:', narrative);
        if (!narrative) {
            console.error('No narrative to display');
            return;
        }
        
        // Update title
        elements.narrativeCardTitle.textContent = narrative.title;
        
        // Clear existing content
        elements.narrativeCardText.textContent = '';
        
        // Hide all interaction elements initially
        hideAllInteractions();
        
        // Start typewriter effect
        let index = 0;
        isTyping = true;
        skipTyping = false;
        
        const typeNextCharacter = () => {
            if (skipTyping) {
                // If skipping, show the full text immediately
                elements.narrativeCardText.textContent = narrative.narrative;
                isTyping = false;
                skipTyping = false;
                displayInteraction(narrative);
                return;
            }
            
            if (index < narrative.narrative.length) {
                elements.narrativeCardText.textContent += narrative.narrative.charAt(index);
                index++;
                setTimeout(typeNextCharacter, typingSpeed);
            } else {
                isTyping = false;
                displayInteraction(narrative);
            }
        };
        
        typeNextCharacter();
    }
    
    // Display a random event
    function displayRandomEvent(event) {
        console.log('Displaying random event:', event);
        
        // Store the current random event in the game instance
        game.setCurrentRandomEvent(event);
        
        // Hide the normal narrative container
        elements.narrativeCard.style.display = 'none';
        elements.narrativeCardChoices.style.display = 'none';
        
        // Make sure the random event container exists
        if (!elements.randomEventContainer) {
            createRandomEventContainer();
        }
        
        // Show and populate the random event container
        elements.randomEventContainer.style.display = 'block';
        elements.randomEventTitle.textContent = event.title;
        
        // Clear existing content
        elements.randomEventText.textContent = '';
        elements.randomEventOptions.innerHTML = '';
        
        // Start typewriter effect for the event text
        let index = 0;
        isTyping = true;
        skipTyping = false;
        
        const typeNextCharacter = () => {
            if (skipTyping) {
                // If skipping, show the full text immediately
                elements.randomEventText.textContent = event.narrative;
                isTyping = false;
                skipTyping = false;
                displayRandomEventOptions(event);
                return;
            }
            
            if (index < event.narrative.length) {
                elements.randomEventText.textContent += event.narrative.charAt(index);
                index++;
                setTimeout(typeNextCharacter, typingSpeed);
            } else {
                isTyping = false;
                displayRandomEventOptions(event);
            }
        };
        
        typeNextCharacter();
    }
    
    // Create the random event container if it doesn't exist
    function createRandomEventContainer() {
        console.log('Creating random event container');
        const container = document.createElement('div');
        container.id = 'random-event-container';
        container.className = 'random-event-container';
        
        const title = document.createElement('div');
        title.id = 'random-event-title';
        title.className = 'random-event-title';
        
        const text = document.createElement('div');
        text.id = 'random-event-text';
        text.className = 'random-event-text';
        
        const options = document.createElement('div');
        options.id = 'random-event-options';
        options.className = 'random-event-options';
        
        container.appendChild(title);
        container.appendChild(text);
        container.appendChild(options);
        
        // Find the game container and narrative card
        const gameContainer = document.querySelector('.game-container');
        const narrativeCard = document.getElementById('narrative-card');
        
        if (gameContainer) {
            // If narrative card exists, insert before it, otherwise append to game container
            if (narrativeCard) {
                gameContainer.insertBefore(container, narrativeCard);
            } else {
                gameContainer.appendChild(container);
            }
            
            // Update the elements object
            elements.randomEventContainer = container;
            elements.randomEventTitle = title;
            elements.randomEventText = text;
            elements.randomEventOptions = options;
            
            // Add click listener to the text area to skip typewriter
            text.addEventListener('click', function() {
                if (isTyping) {
                    skipTyping = true;
                }
            });
        } else {
            console.error('Game container not found');
        }
    }
    
    // Display options for a random event
    function displayRandomEventOptions(event) {
        elements.randomEventOptions.innerHTML = '';
        
        event.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'random-event-option';
            
            // Format text with cost
            let text = option.text;
            if (option.cost) {
                text += ` ($${option.cost})`;
                
                // Disable if can't afford
                if (option.cost > game.resources.money) {
                    button.disabled = true;
                    button.classList.add('disabled');
                }
            }
            
            button.textContent = text;
            
            // Add click handler
            button.onclick = function() {
                const result = game.handleRandomEvent(index);
                handleInteractionResult(result);
            };
            
            elements.randomEventOptions.appendChild(button);
        });
    }
    
    // Hide all interaction elements
    function hideAllInteractions() {
        console.log('Hiding all interactions');
        // Choice buttons
        elements.pathA.style.display = 'none';
        elements.pathB.style.display = 'none';
        
        // Random event container
        if (elements.randomEventContainer) {
            elements.randomEventContainer.style.display = 'none';
        }
        
        // Ensure swing meter container is hidden and cleared
        const swingMeterContainer = document.getElementById('swing-meter-container');
        if (swingMeterContainer) {
            swingMeterContainer.innerHTML = '';
            swingMeterContainer.style.display = 'none';
        }
        
        // Ensure balance meter container is hidden and cleared
        const balanceMeterContainer = document.getElementById('balance-meter-container');
        if (balanceMeterContainer) {
            balanceMeterContainer.innerHTML = '';
            balanceMeterContainer.style.display = 'none';
        }
        
        // Ensure integrated meter container is hidden and cleared
        const integratedMeterContainer = document.getElementById('integrated-meter-container');
        if (integratedMeterContainer) {
            integratedMeterContainer.innerHTML = '';
            integratedMeterContainer.style.display = 'none';
        }
        
        // Show the narrative card and choices container
        elements.narrativeCard.style.display = 'block';
        elements.narrativeCardChoices.style.display = 'flex';
        
        // Reset choice buttons text and state
        const choiceButtons = [elements.pathA, elements.pathB];
        choiceButtons.forEach(button => {
            const choiceText = button.querySelector('.choice-text');
            if (choiceText) choiceText.textContent = '';
            const meterIcon = button.querySelector('.swing-meter-icon');
            if (meterIcon) meterIcon.style.display = 'none';
            button.disabled = false;
            button.classList.remove('disabled');
        });
    }
    
    // Display the appropriate interaction based on narrative type
    function displayInteraction(narrative) {
        console.log('Displaying interaction for narrative type:', narrative.interactionType);
        switch (narrative.interactionType) {
            case 'swingMeter':
                displaySwingMeter(narrative);
                break;
            case 'choice':
                displayChoices(narrative.choices);
                break;
            default:
                console.error('Unknown interaction type:', narrative.interactionType);
        }
    }

    // Display the swing meter immediately
    function displaySwingMeter(narrative) {
        console.log('Displaying swing meter');
        
        // Check if this swing meter has already been completed in the game state
        if (narrative.id && game.isSwingMeterCompleted(narrative.id)) {
            console.log(`Swing meter for narrative ${narrative.id} already completed, skipping display`);
            
            // Process the last result again or use a default result
            const defaultResult = 'okay'; // Default to 'okay' if no previous result
            const processedResult = game.handleSwingMeter(defaultResult);
            handleInteractionResult(processedResult);
            return;
        }
        
        // Create a container for the swing meter if it doesn't exist
        const meterContainerId = 'swing-meter-container';
        let meterContainer = document.getElementById(meterContainerId);
        
        // Check if there's already a completed swing meter in the DOM
        if (meterContainer && meterContainer.querySelector('.integrated-swing-meter.completed')) {
            console.log('Swing meter already completed in DOM, skipping display');
            return;
        }
        
        if (!meterContainer) {
            meterContainer = document.createElement('div');
            meterContainer.id = meterContainerId;
            meterContainer.className = 'swing-meter-container';
            elements.narrativeCardChoices.appendChild(meterContainer);
        } else {
            // Clear any existing content
            meterContainer.innerHTML = '';
            meterContainer.style.display = 'block';
        }
        
        // Create container for the integrated meter
        const integratedMeterContainer = document.createElement('div');
        integratedMeterContainer.id = 'integrated-meter-container';
        integratedMeterContainer.className = 'integrated-meter-container';
        meterContainer.appendChild(integratedMeterContainer);
        
        // Show the swing meter
        const meterType = narrative.meterType || 'standard';
        const meterContext = narrative.meterContext || 'Test your timing...';
        
        // Check if the showSwingMeter function exists
        if (typeof showSwingMeter === 'function') {
            console.log('Using swing meter with type:', meterType);
            showSwingMeter('integrated-meter-container', meterType, meterContext, function(result) {
                if (result) {
                    console.log('Swing meter result:', result);
                    // Process the swing meter result
                    const processedResult = game.handleSwingMeter(result);
                    
                    // Show the outcome text with typewriter effect
                    if (narrative.outcomes) {
                        const outcome = narrative.outcomes.find(o => o.result === result);
                        if (outcome) {
                            const outcomeText = document.createElement('div');
                            outcomeText.className = 'outcome-result';
                            meterContainer.appendChild(outcomeText);
                            
                            // Typewriter effect for outcome text
                            let i = 0;
                            const speed = 50; // Adjust speed as needed
                            function typeWriter() {
                                if (i < outcome.text.length) {
                                    outcomeText.textContent += outcome.text.charAt(i);
                                    i++;
                                    setTimeout(typeWriter, speed);
                                } else {
                                    // After text is complete, show the next button
                                    const nextButton = document.createElement('button');
                                    nextButton.className = 'choice-button';
                                    nextButton.textContent = 'Next Stop';
                                    nextButton.onclick = function() {
                                        handleInteractionResult(processedResult);
                                    };
                                    meterContainer.appendChild(nextButton);
                                }
                            }
                            typeWriter();
                            return;
                        }
                    }
                    
                    // Default handling if no outcome found
                    handleInteractionResult(processedResult);
                } else {
                    console.error('No result from swing meter');
                }
            });
        } else {
            console.error('showSwingMeter function not found');
        }
    }
    
    // Display choices
    function displayChoices(choices) {
        console.log('Displaying choices:', choices);
        const buttons = [elements.pathA, elements.pathB];
        
        choices.forEach((choice, index) => {
            if (index >= buttons.length) return;
            
            const button = buttons[index];
            const choiceText = button.querySelector('.choice-text');
            
            // Set choice text
            let text = choice.text;
            
            // Add cost/reward indicator
            if (choice.effects.money < 0) {
                text += ` ($${Math.abs(choice.effects.money)})`;
                // Disable if can't afford
                if (Math.abs(choice.effects.money) > game.resources.money) {
                    button.disabled = true;
                    button.classList.add('disabled');
                } else {
                    button.disabled = false;
                    button.classList.remove('disabled');
                }
            } else if (choice.effects.money > 0) {
                text += ` (+$${choice.effects.money})`;
                button.disabled = false;
                button.classList.remove('disabled');
            } else {
                button.disabled = false;
                button.classList.remove('disabled');
            }
            
            choiceText.textContent = text;
            
            // Show/hide swing meter icon
            const meterIcon = button.querySelector('.swing-meter-icon');
            if (meterIcon) {
                meterIcon.style.display = choice.swingMeter ? 'inline' : 'none';
            }
            
            button.style.display = 'block';
            
            // Add click handler
            button.onclick = function() {
                console.log('Choice button clicked:', index);
                const result = game.handleInteraction({ choiceIndex: index });
                handleInteractionResult(result);
            };
        });
    }
    
    // Handle the result of any interaction
    function handleInteractionResult(result) {
        console.log('Handling interaction result:', result);
        
        if (!result.success) {
            console.error('Error processing interaction:', result.reason);
            return;
        }
        
        // Add to history
        if (game.decisionHistory && game.decisionHistory.length > 0) {
            addToHistoryTrack(game.decisionHistory[game.decisionHistory.length - 1]);
        }
        
        // Update UI
        updateUI();
        
        // Handle game over
        if (result.gameOver) {
            showGameOver(result.reason === 'success');
            return;
        }
        
        // Handle round complete
        if (result.roundComplete) {
            showRoundComplete();
            return;
        }
        
        // Handle random event
        if (result.randomEvent) {
            displayRandomEvent(result.randomEvent);
            return;
        }
        
        // Handle random event completion
        if (result.randomEventComplete) {
            if (elements.randomEventContainer) {
                elements.randomEventContainer.style.display = 'none';
            }
            elements.narrativeCard.style.display = 'block';
            elements.narrativeCardChoices.style.display = 'flex';
        }
        
        // Display next narrative
        if (result.nextNarrative) {
            console.log('Displaying next narrative:', result.nextNarrative);
            // Clear any existing content and hide interactions
            hideAllInteractions();
            // Display the next narrative with typewriter effect
            displayNarrative(result.nextNarrative);
        } else {
            console.warn('No next narrative found in result:', result);
            
            // Try to get the next narrative manually
            const currentStop = game.currentStop;
            console.log('Current game stop:', currentStop);
            const manualNextNarrative = game.narratives.find(n => n.stop === currentStop);
            
            if (manualNextNarrative) {
                console.log('Found manual next narrative:', manualNextNarrative);
                // Clear any existing content and hide interactions
                hideAllInteractions();
                // Display the next narrative with typewriter effect
                displayNarrative(manualNextNarrative);
            } else {
                console.error('Cannot find next narrative for stop:', currentStop);
            }
        }
    }
    
    // Add decision to history track
    function addToHistoryTrack(decision) {
        console.log('Adding decision to history track:', decision);
        if (!decision) return;
        
        // Create history card
        const historyCard = document.createElement('div');
        
        // Set class based on primary effect
        historyCard.className = 'history-card';
        
        if (decision.effects.soul > 0) {
            historyCard.classList.add('soul-positive');
        } else if (decision.effects.soul < 0) {
            historyCard.classList.add('soul-negative');
        } else if (decision.effects.connections > 0) {
            historyCard.classList.add('connections-positive');
        } else if (decision.effects.connections < 0) {
            historyCard.classList.add('connections-negative');
        }
        
        // Add swing meter result indicator if applicable
        if (decision.swingMeterResult) {
            historyCard.classList.add(`swing-meter-${decision.swingMeterResult}`);
        }
        
        // Add decision number/counter
        const counter = document.createElement('div');
        counter.className = 'history-card-counter';
        counter.textContent = game.decisionHistory.length;
        historyCard.appendChild(counter);
        
        // Add title
        const title = document.createElement('div');
        title.className = 'history-card-title';
        title.textContent = decision.title;
        historyCard.appendChild(title);
        
        // Add choice text
        const choice = document.createElement('div');
        choice.className = 'history-card-choice';
        choice.textContent = decision.text || decision.choiceText;
        historyCard.appendChild(choice);
        
        // Add effects
        const effects = document.createElement('div');
        effects.className = 'history-card-effects';
        
        // Soul effect
        if (decision.effects.soul !== 0) {
            const soulEffect = document.createElement('div');
            soulEffect.className = `history-card-effect ${decision.effects.soul > 0 ? 'soul-positive' : 'soul-negative'}`;
            soulEffect.textContent = `${decision.effects.soul > 0 ? '+' : ''}${decision.effects.soul}S`;
            effects.appendChild(soulEffect);
        }
        
        // Connections effect
        if (decision.effects.connections !== 0) {
            const connectionsEffect = document.createElement('div');
            connectionsEffect.className = `history-card-effect ${decision.effects.connections > 0 ? 'connections-positive' : 'connections-negative'}`;
            connectionsEffect.textContent = `${decision.effects.connections > 0 ? '+' : ''}${decision.effects.connections}C`;
            effects.appendChild(connectionsEffect);
        }
        
        // Money effect
        if (decision.effects.money !== 0) {
            const moneyEffect = document.createElement('div');
            moneyEffect.className = `history-card-effect ${decision.effects.money > 0 ? 'money-positive' : 'money-negative'}`;
            moneyEffect.textContent = `${decision.effects.money > 0 ? '+' : ''}$${decision.effects.money}`;
            effects.appendChild(moneyEffect);
        }
        
        historyCard.appendChild(effects);
        elements.historyTrack.appendChild(historyCard);
        elements.historyTrack.scrollLeft = elements.historyTrack.scrollWidth;
    }
    
    // Update UI elements
    function updateUI() {
        console.log('Updating UI with resources:', game.resources);
        // Update resource bars and values
        elements.soulBar.style.width = `${(game.resources.soul / game.maxResources.soul) * 100}%`;
        elements.connectionsBar.style.width = `${(game.resources.connections / game.maxResources.connections) * 100}%`;
        elements.soulValue.textContent = game.resources.soul;
        elements.connectionsValue.textContent = game.resources.connections;
        elements.moneyValue.textContent = game.resources.money;
        elements.roundNumber.textContent = game.currentRound;
    }
    
    // Show round complete screen
    function showRoundComplete() {
        console.log('Showing round complete screen');
        elements.roundComplete.style.display = 'flex';
        elements.completedRound.textContent = game.currentRound;
        elements.roundSoulValue.textContent = game.resources.soul;
        elements.roundConnectionsValue.textContent = game.resources.connections;
        elements.roundMoneyValue.textContent = game.resources.money;
        elements.roundSummaryText.textContent = game.getRoundSummaryText();
    }
    
    // Show game over screen
    function showGameOver(success) {
        console.log('Showing game over screen, success:', success);
        elements.gameOver.style.display = 'flex';
        elements.gameOverMessage.textContent = game.getGameOverMessage(success);
    }
});