// Drone Man: The Journey - Main script
document.addEventListener('DOMContentLoaded', async () => {
    // Create game instance
    const game = new DroneManGame();
    window.gameInstance = game; // Make it globally accessible for power meter
    
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
    
    // Typewriter effect variables
    let isTyping = false;
    let skipTyping = false;
    const typingSpeed = 30; // ms per character
    
    // Add event listeners
    elements.narrativeCard.addEventListener('click', () => {
        if (isTyping) {
            skipTyping = true;
        }
    });
    
    elements.nextRoundButton.addEventListener('click', () => {
        const result = game.startNextRound();
        elements.roundComplete.style.display = 'none';
        displayNarrative(result.nextNarrative);
        updateUI();
    });
    
    elements.restartButton.addEventListener('click', () => {
        game.restart();
        elements.gameOver.style.display = 'none';
        elements.historyTrack.innerHTML = '';
        const narrative = game.getCurrentNarrative();
        displayNarrative(narrative);
        updateUI();
    });
    
    // Wait for game data to load
    await waitForGameData(game);
    
    // Start the game
    const narrative = game.getCurrentNarrative();
    displayNarrative(narrative);
    updateUI();
    
    // Function to wait for game data to load
    async function waitForGameData(game) {
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (game.narratives && game.narratives.length > 0) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Set a timeout just in case
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }
    
    // Display narrative with typewriter effect
    function displayNarrative(narrative) {
        if (!narrative) return;
        
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
        
        // Add to the game container before the narrative card
        document.querySelector('.game-container').insertBefore(container, elements.narrativeCard);
        
        // Update the elements object
        elements.randomEventContainer = container;
        elements.randomEventTitle = title;
        elements.randomEventText = text;
        elements.randomEventOptions = options;
        
        // Add click listener to the text area to skip typewriter
        text.addEventListener('click', () => {
            if (isTyping) {
                skipTyping = true;
            }
        });
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
            button.onclick = () => {
                const result = game.handleRandomEvent(index);
                handleInteractionResult(result);
            };
            
            elements.randomEventOptions.appendChild(button);
        });
    }
    
    // Hide all interaction elements
    function hideAllInteractions() {
        // Choice buttons
        elements.pathA.style.display = 'none';
        elements.pathB.style.display = 'none';
        
        // Random event container
        if (elements.randomEventContainer) {
            elements.randomEventContainer.style.display = 'none';
        }
        
        // Remove any existing swing meter container
        const swingMeterContainer = document.getElementById('swing-meter-container');
        if (swingMeterContainer) {
            swingMeterContainer.innerHTML = '';
            swingMeterContainer.style.display = 'none';
        }
        
        // Show the narrative card
        elements.narrativeCard.style.display = 'block';
        elements.narrativeCardChoices.style.display = 'flex';
    }
    
    // Display the appropriate interaction based on narrative type
    function displayInteraction(narrative) {
        switch (narrative.interactionType) {
            case 'swingMeter':
                displaySwingMeterButton(narrative);
                break;
            case 'choice':
                displayChoices(narrative.choices);
                break;
            default:
                console.error('Unknown interaction type:', narrative.interactionType);
        }
    }
    
    // Display swing meter button
    function displaySwingMeterButton(narrative) {
        // Create a container for the swing meter if it doesn't exist
        const meterContainerId = 'swing-meter-container';
        let meterContainer = document.getElementById(meterContainerId);
        
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
        
        // Create the swing meter button
        const swingButton = document.createElement('button');
        swingButton.id = 'swing-meter-button';
        swingButton.className = 'choice-button swing-meter-button';
        swingButton.textContent = 'TEST YOUR BALANCE';
        
        swingButton.onclick = () => {
            // Create a new container for the integrated meter
            const integratedMeterContainer = document.createElement('div');
            integratedMeterContainer.id = 'integrated-meter-container';
            integratedMeterContainer.className = 'integrated-meter-container';
            
            // Replace button with the meter container
            meterContainer.innerHTML = '';
            meterContainer.appendChild(integratedMeterContainer);
            
            // Show the integrated power meter
            const meterType = narrative.meterType || 'standard';
            const meterContext = narrative.meterContext || 'Test your balance and timing...';
            
            showIntegratedPowerMeter('integrated-meter-container', meterType, meterContext, (result) => {
                if (result) {
                    // Process the swing meter result
                    const processedResult = game.handleSwingMeter(result);
                    handleInteractionResult(processedResult);
                } else {
                    console.error('No result from power meter');
                }
            });
        };
        
        meterContainer.appendChild(swingButton);
    }
    
    // Display choices
    function displayChoices(choices) {
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
            
            // Show/hide power meter icon
            const meterIcon = button.querySelector('.power-meter-icon');
            if (meterIcon) {
                meterIcon.style.display = choice.powerMeter ? 'inline' : 'none';
            }
            
            button.style.display = 'block';
            
            // Add click handler
            button.onclick = () => {
                const result = game.handleInteraction({ choiceIndex: index });
                handleInteractionResult(result);
            };
        });
    }
    
    // Handle the result of any interaction
    function handleInteractionResult(result) {
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
            // Hide random event container and show narrative card
            if (elements.randomEventContainer) {
                elements.randomEventContainer.style.display = 'none';
            }
            elements.narrativeCard.style.display = 'block';
            elements.narrativeCardChoices.style.display = 'flex';
        }
        
        // Display next narrative
        if (result.nextNarrative) {
            displayNarrative(result.nextNarrative);
        }
    }
    
    // Add decision to history track
    function addToHistoryTrack(decision) {
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
        
        // Add power meter result indicator if applicable
        if (decision.powerMeterResult) {
            historyCard.classList.add(`power-meter-${decision.powerMeterResult}`);
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
        elements.roundComplete.style.display = 'flex';
        elements.completedRound.textContent = game.currentRound;
        elements.roundSoulValue.textContent = game.resources.soul;
        elements.roundConnectionsValue.textContent = game.resources.connections;
        elements.roundMoneyValue.textContent = game.resources.money;
        elements.roundSummaryText.textContent = game.getRoundSummaryText();
    }
    
    // Show game over screen
    function showGameOver(success) {
        elements.gameOver.style.display = 'flex';
        elements.gameOverMessage.textContent = game.getGameOverMessage(success);
    }
});