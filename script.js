// Drone Man: The Journey - Main script
document.addEventListener('DOMContentLoaded', async () => {
    // Create game instance
    const game = new DroneManGame();
    window.gameInstance = game; // Make it globally accessible for power meter
    
    // UI Elements
    const elements = {
        roundCounter: document.getElementById('round-counter'),
        stopCounter: document.getElementById('stop-counter'),
        soulBar: document.getElementById('soul-bar'),
        connectionsBar: document.getElementById('connections-bar'),
        soulValue: document.getElementById('soul-value'),
        connectionsValue: document.getElementById('connections-value'),
        moneyValue: document.getElementById('money-value'),
        narrativeCard: document.getElementById('narrative-card'),
        narrativeCardTitle: document.getElementById('narrative-card-title'),
        narrativeCardText: document.getElementById('narrative-card-text'),
        narrativeCardChoices: document.getElementById('narrative-card-choices'),
        historyTrack: document.getElementById('history-track'),
        passiveEffectsList: document.getElementById('passive-effects-list'),
        passiveEffectsContainer: document.getElementById('passive-effects-container'),
        passiveEffectsHeader: document.getElementById('passive-effects-header'),
        roundCompleteScreen: document.getElementById('round-complete-screen'),
        completedRound: document.getElementById('completed-round'),
        roundSoulValue: document.getElementById('round-soul-value'),
        roundConnectionsValue: document.getElementById('round-connections-value'),
        roundMoneyValue: document.getElementById('round-money-value'),
        roundSummaryText: document.getElementById('round-summary-text'),
        nextRoundButton: document.getElementById('next-round-button'),
        gameOverScreen: document.getElementById('game-over-screen'),
        gameOverMessage: document.getElementById('game-over-message'),
        restartButton: document.getElementById('restart-button')
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
        elements.roundCompleteScreen.style.display = 'none';
        displayNarrative(result.nextNarrative);
        updateUI();
    });
    
    elements.restartButton.addEventListener('click', () => {
        game.restart();
        elements.gameOverScreen.style.display = 'none';
        elements.historyTrack.innerHTML = '';
        const narrative = game.getCurrentNarrative();
        displayNarrative(narrative);
        updateUI();
    });
    
    // Collapsible passive effects
    elements.passiveEffectsHeader.addEventListener('click', () => {
        elements.passiveEffectsContainer.classList.toggle('open');
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
        elements.narrativeCardChoices.innerHTML = '';
        
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
                displayChoices(narrative.choices);
                return;
            }
            
            if (index < narrative.narrative.length) {
                elements.narrativeCardText.textContent += narrative.narrative.charAt(index);
                index++;
                setTimeout(typeNextCharacter, typingSpeed);
            } else {
                isTyping = false;
                displayChoices(narrative.choices);
            }
        };
        
        typeNextCharacter();
    }
    
    // Display choices
    function displayChoices(choices) {
        elements.narrativeCardChoices.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'choice-button';
            choiceButton.textContent = choice.text;
            
            // Add indicator if the choice costs money
            if (choice.effects.money < 0) {
                choiceButton.textContent += ` ($${Math.abs(choice.effects.money)})`;
                // Disable if can't afford
                if (Math.abs(choice.effects.money) > game.resources.money) {
                    choiceButton.disabled = true;
                    choiceButton.classList.add('disabled');
                }
            } else if (choice.effects.money > 0) {
                choiceButton.textContent += ` (+$${choice.effects.money})`;
            }
            
            // Add power meter indicator if applicable
            if (choice.powerMeter) {
                const meterIcon = document.createElement('span');
                meterIcon.className = 'power-meter-icon';
                meterIcon.innerHTML = '⚡'; // Lightning bolt icon
                choiceButton.appendChild(meterIcon);
            }
            
            choiceButton.addEventListener('click', () => makeChoice(index));
            elements.narrativeCardChoices.appendChild(choiceButton);
        });
    }
    
    // Make a choice
    function makeChoice(choiceIndex) {
        const result = game.makeChoice(choiceIndex);
        
        if (!result.success) {
            console.error('Error making choice:', result.reason);
            return;
        }
        
        // Check if this choice requires a power meter
        if (result.requiresPowerMeter) {
            // Show power meter
            showPowerMeter(result.powerMeterType, (powerMeterResult) => {
                // Process choice with power meter result
                const processedResult = game.processChoiceResult(result.choiceIndex, powerMeterResult);
                handleChoiceResult(processedResult);
            });
            return;
        }
        
        // Handle regular choice result
        handleChoiceResult(result);
    }
    
    // Handle the result of a choice
    function handleChoiceResult(result) {
        // Add to history
        addToHistoryTrack(game.decisionHistory[game.decisionHistory.length - 1]);
        
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
        
        // Display next narrative
        displayNarrative(result.nextNarrative);
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
        
        // Add abbreviated choice text
        const choiceText = document.createElement('div');
        choiceText.className = 'history-card-choice';
        // Get first few words
        const words = decision.text.split(' ');
        choiceText.textContent = words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
        historyCard.appendChild(choiceText);
        
        // Add effects
        const effects = document.createElement('div');
        effects.className = 'history-card-effects';
        
        if (decision.effects.soul !== 0) {
            const soulEffect = document.createElement('span');
            soulEffect.className = `history-card-effect ${decision.effects.soul > 0 ? 'soul-positive' : 'soul-negative'}`;
            soulEffect.textContent = `S${decision.effects.soul > 0 ? '+' : ''}${decision.effects.soul}`;
            effects.appendChild(soulEffect);
        }
        
        if (decision.effects.connections !== 0) {
            const connectionsEffect = document.createElement('span');
            connectionsEffect.className = `history-card-effect ${decision.effects.connections > 0 ? 'connections-positive' : 'connections-negative'}`;
            connectionsEffect.textContent = `C${decision.effects.connections > 0 ? '+' : ''}${decision.effects.connections}`;
            effects.appendChild(connectionsEffect);
        }
        
        if (decision.effects.money !== 0) {
            const moneyEffect = document.createElement('span');
            moneyEffect.className = `history-card-effect ${decision.effects.money > 0 ? 'money-positive' : 'money-negative'}`;
            moneyEffect.textContent = `$${decision.effects.money > 0 ? '+' : ''}${decision.effects.money}`;
            effects.appendChild(moneyEffect);
        }
        
        historyCard.appendChild(effects);
        
        // Add power meter result if applicable
        if (decision.powerMeterResult) {
            const powerMeterIndicator = document.createElement('div');
            powerMeterIndicator.className = `power-meter-indicator ${decision.powerMeterResult}`;
            powerMeterIndicator.textContent = '⚡'; // Lightning bolt icon
            historyCard.appendChild(powerMeterIndicator);
        }
        
        // Add to history track
        elements.historyTrack.appendChild(historyCard);
        
        // Scroll to latest card
        historyCard.scrollIntoView({ behavior: 'smooth', inline: 'end' });
    }
    
    // Show round complete screen
    function showRoundComplete() {
        // Update round summary values
        elements.completedRound.textContent = game.currentRound;
        elements.roundSoulValue.textContent = game.resources.soul;
        elements.roundConnectionsValue.textContent = game.resources.connections;
        elements.roundMoneyValue.textContent = game.resources.money;
        
        // Set appropriate round summary text
        elements.roundSummaryText.textContent = game.getRoundSummaryText();
        
        // Show the round complete screen
        elements.roundCompleteScreen.style.display = 'flex';
    }
    
    // Show game over screen
    function showGameOver(success) {
        elements.gameOverMessage.textContent = game.getGameOverMessage(success);
        elements.gameOverScreen.style.display = 'flex';
    }
    
    // Update UI elements
    function updateUI() {
        elements.roundCounter.textContent = game.currentRound;
        elements.stopCounter.textContent = ((game.currentStop - 1) % game.stopsPerRound) + 1;
        
        // Update resource bars and values
        const soulPercentage = (game.resources.soul / 10) * 100;
        const connectionsPercentage = (game.resources.connections / 10) * 100;
        
        elements.soulBar.style.width = `${soulPercentage}%`;
        elements.connectionsBar.style.width = `${connectionsPercentage}%`;
        
        elements.soulValue.textContent = game.resources.soul;
        elements.connectionsValue.textContent = game.resources.connections;
        elements.moneyValue.textContent = game.resources.money;
        
        // Update resource bar colors based on values
        elements.soulBar.style.backgroundColor = game.resources.soul <= 3 ? '#e74c3c' : '#9b59b6';
        elements.connectionsBar.style.backgroundColor = game.resources.connections <= 3 ? '#e74c3c' : '#3498db';
        
        // Update passive effects
        updatePassiveEffects();
    }
    
    // Update passive effects display
    function updatePassiveEffects() {
        elements.passiveEffectsList.innerHTML = '';
        
        if (!game.activePassiveEffects || game.activePassiveEffects.length === 0) {
            elements.passiveEffectsList.innerHTML = `
                <div class="passive-effect">
                    No passive effects active
                </div>
            `;
            return;
        }
        
        for (const effect of game.activePassiveEffects) {
            const effectElement = document.createElement('div');
            effectElement.className = `passive-effect ${effect.type}`;
            effectElement.textContent = `${effect.name}: ${effect.description}`;
            elements.passiveEffectsList.appendChild(effectElement);
        }
        
        // Open the passive effects section if there are effects
        elements.passiveEffectsContainer.classList.add('open');
    }
});