// Drone Man: The Journey - Main script
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded. Initializing game...');
    
    // Create game instance
    const game = new DroneManGame();
    window.gameInstance = game; // Make it globally accessible for swing meter
    
    // UI Elements
    const elements = {
        roundNumber: document.getElementById('round-number'),
        performanceFill: document.getElementById('performance-fill'),
        narrativeCard: document.getElementById('narrative-card'),
        narrativeCardTitle: document.querySelector('.narrative-card-title'),
        narrativeCardText: document.querySelector('.narrative-card-text'),
        decisionTrack: document.getElementById('decision-track'),
        choiceContainer: document.getElementById('choice-container'),
        swingMeterContainer: document.getElementById('swing-meter-container'),
        choiceType: document.getElementById('choice-type'),
        choiceTitle: document.getElementById('choice-title'),
        choiceDescription: document.getElementById('choice-description'),
        swingMeterTitle: document.getElementById('swing-meter-title'),
        tapButton: document.getElementById('tap-button'),
        resultScreen: document.getElementById('result-screen'),
        resultStatus: document.getElementById('result-status'),
        resultTitle: document.getElementById('result-title'),
        resultText: document.getElementById('result-text'),
        continueButton: document.getElementById('continue-button'),
        roundComplete: document.getElementById('round-complete'),
        completedRound: document.getElementById('completed-round'),
        roundSoulValue: document.getElementById('round-soul-value'),
        roundConnectionsValue: document.getElementById('round-connections-value'),
        roundMoneyValue: document.getElementById('round-money-value'),
        roundSummaryText: document.getElementById('round-summary-text'),
        nextRoundButton: document.getElementById('next-round-button'),
        gameOver: document.getElementById('game-over'),
        gameOverMessage: document.getElementById('game-over-message'),
        restartButton: document.getElementById('restart-button')
    };
    
    // Typewriter effect variables
    let isTyping = false;
    let skipTyping = false;
    const typingSpeed = 30; // ms per character
    
    // Swing meter variables
    let isSwingMeterMoving = false;
    let swingPosition = 0;
    let swingSpeed = 1;
    let swingDirection = 1;
    let currentSelectedChoice = null;
    
    // Initialize the game
    function initGame() {
        console.log('Initializing game...');
        
        // Start the game
        const result = game.startGame();
        
        // Display the first narrative
        if (result.success && result.narrative) {
            displayNarrative(result.narrative);
        } else {
            console.error('Failed to start game:', result);
        }
        
        // Update the game state UI
        updateGameState();
    }
    
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
        elements.decisionTrack.innerHTML = '';
        initDecisionTrack();
        const narrative = game.getCurrentNarrative();
        displayNarrative(narrative);
        updateUI();
    });
    
    // Initialize the decision track with empty cards
    function initDecisionTrack() {
        elements.decisionTrack.innerHTML = '';
        const totalStops = game.narratives.length;
        
        for (let i = 1; i <= totalStops; i++) {
            const card = document.createElement('div');
            card.className = 'decision-card';
            if (i === game.currentStop) {
                card.classList.add('active');
            }
            
            const number = document.createElement('div');
            number.className = 'decision-card-number';
            number.textContent = i;
            
            card.appendChild(number);
            elements.decisionTrack.appendChild(card);
        }
    }
    
    // Wait for game data to load
    waitForGameData(game).then(() => {
        // Initialize decision track
        initDecisionTrack();
        console.log('Game data loaded successfully');
        // Start the game
        initGame();
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
    
    // Hide all interaction elements
    function hideAllInteractions() {
        console.log('Hiding all interactions');
        
        // Hide choice container
        elements.choiceContainer.style.display = 'none';
        
        // Hide swing meter container
        elements.swingMeterContainer.style.display = 'none';
        
        // Hide result screen
        elements.resultScreen.style.display = 'none';
    }
    
    // Display the appropriate interaction based on narrative type
    function displayInteraction(narrative) {
        console.log('Displaying interaction for narrative:', narrative.title);
        
        // Hide the swing meter container and its elements initially
        elements.swingMeterContainer.style.display = 'none';
        
        // Make sure the tap button and instructions are hidden
        const meterInstructions = document.querySelector('.meter-instructions');
        if (meterInstructions) {
            meterInstructions.style.display = 'none';
        }
        
        if (elements.tapButton) {
            elements.tapButton.style.display = 'none';
        }
        
        // Display choice cards for the player to choose from
        displayChoiceCards(narrative.choices);
    }
    
    // Display decision cards for the player to choose from
    function displayChoiceCards(choices) {
        // Clear existing cards
        elements.choiceContainer.innerHTML = '';
        elements.choiceContainer.style.display = 'flex';
        
        // Add a card for each choice
        choices.forEach((choice, index) => {
            const decisionType = choice.decisionType || (index === 0 ? 'soul' : index === 1 ? 'connections' : 'success');
            
            const card = document.createElement('div');
            card.className = 'choice-card ' + decisionType;
            
            const header = document.createElement('div');
            header.className = 'card-header';
            
            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = choice.title || 'Option ' + (index + 1);
            
            const content = document.createElement('div');
            content.className = 'card-content';
            content.textContent = choice.text;
            
            header.appendChild(title);
            card.appendChild(header);
            card.appendChild(content);
            
            // Store choice data
            card.dataset.index = index;
            card.dataset.type = decisionType;
            
            // Add click handler
            card.addEventListener('click', function() {
                handleCardSelection(choice, decisionType);
            });
            
            elements.choiceContainer.appendChild(card);
        });
        
        // Ensure the choice container is visible and positioned at the bottom
        setTimeout(() => {
            elements.choiceContainer.style.opacity = '1';
            elements.choiceContainer.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Handle card selection
    function handleCardSelection(choice, decisionType) {
        console.log('Card selected:', choice, decisionType);
        
        // Hide the choice container
        elements.choiceContainer.style.display = 'none';
        
        // Show the swing meter container
        elements.swingMeterContainer.style.display = 'block';
        
        // Update choice summary
        elements.choiceType.textContent = decisionType.toUpperCase();
        elements.choiceType.className = 'choice-type ' + decisionType;
        elements.choiceTitle.textContent = choice.title || 'Your Choice';
        elements.choiceDescription.textContent = choice.text;
        
        // Set up the swing meter title
        elements.swingMeterTitle.textContent = choice.meterContext || 'How will you approach this?';
        
        // Store the selected choice for later
        currentSelectedChoice = choice;
        
        // Show the meter instructions and tap button now that a choice has been made
        const meterInstructions = document.querySelector('.meter-instructions');
        if (meterInstructions) {
            meterInstructions.style.display = 'block';
        }
        
        // Set up the tap button
        elements.tapButton.style.display = 'block';
        elements.tapButton.textContent = 'TAP TO START';
        elements.tapButton.onclick = startSwingMeter;
    }
    
    // Start the swing meter
    function startSwingMeter() {
        console.log('Starting swing meter');
        
        // Change button text
        elements.tapButton.textContent = 'TAP TO STOP';
        
        // Reset the indicators
        const indicator = document.querySelector('.meter-indicator');
        const bottomIndicator = document.querySelector('.meter-indicator-bottom');
        
        indicator.style.left = '0%';
        bottomIndicator.style.left = '0%';
        
        // Start the animation
        isSwingMeterMoving = true;
        swingPosition = 0;
        
        // Change button function
        elements.tapButton.onclick = stopSwingMeter;
        
        // Start the animation
        requestAnimationFrame(animateSwingMeter);
    }
    
    // Animate the swing meter
    function animateSwingMeter() {
        if (!isSwingMeterMoving) return;
        
        // Update position
        swingPosition += swingSpeed;
        
        // If at or past the end, reverse direction
        if (swingPosition >= 100) {
            swingDirection = -1;
        } else if (swingPosition <= 0) {
            swingDirection = 1;
        }
        
        swingPosition += swingSpeed * swingDirection;
        
        // Make sure position stays in bounds
        swingPosition = Math.max(0, Math.min(100, swingPosition));
        
        // Update indicator positions
        const indicator = document.querySelector('.meter-indicator');
        const bottomIndicator = document.querySelector('.meter-indicator-bottom');
        
        indicator.style.left = swingPosition + '%';
        bottomIndicator.style.left = swingPosition + '%';
        
        // Continue animation
        requestAnimationFrame(animateSwingMeter);
    }
    
    // Stop the swing meter
    function stopSwingMeter() {
        console.log('Stopping swing meter at position:', swingPosition);
        
        // Stop the animation
        isSwingMeterMoving = false;
        
        // Determine the result based on position
        let result = 'fail';
        if (swingPosition >= 60 && swingPosition < 80) {
            result = 'good';
        } else if ((swingPosition >= 40 && swingPosition < 60) || (swingPosition >= 80 && swingPosition < 100)) {
            result = 'okay';
        }
        
        console.log('Swing meter result:', result);
        
        // Show the tap marker
        const tapMarker = document.querySelector('.tap-marker');
        tapMarker.style.left = swingPosition + '%';
        tapMarker.style.display = 'block';
        tapMarker.classList.add(result);
        
        // Show the result of the swing meter
        showSwingMeterResult(result);
    }
    
    // Show the result of the swing meter
    function showSwingMeterResult(result) {
        // Hide the tap button
        elements.tapButton.style.display = 'none';
        
        // Get the result text based on the result
        let resultText = '';
        if (result === 'good' && currentSelectedChoice.resultGood) {
            resultText = currentSelectedChoice.resultGood;
        } else if (result === 'okay' && currentSelectedChoice.resultOkay) {
            resultText = currentSelectedChoice.resultOkay;
        } else if (result === 'fail' && currentSelectedChoice.resultFail) {
            resultText = currentSelectedChoice.resultFail;
        }
        
        // Create result element
        const resultElement = document.createElement('div');
        resultElement.className = `integrated-meter-result ${result}`;
        resultElement.textContent = resultText;
        
        // Add the result to the swing meter
        const swingMeter = document.querySelector('.swing-meter');
        swingMeter.appendChild(resultElement);
        
        // Add a "Next Stop" button
        const nextButton = document.createElement('button');
        nextButton.className = 'next-stop-button';
        nextButton.textContent = 'Next Stop';
        nextButton.onclick = function() {
            // Process the result
            const processedResult = game.handleSwingMeter(result, currentSelectedChoice);
            
            // Hide the swing meter container
            elements.swingMeterContainer.style.display = 'none';
            
            // Remove the result element
            if (resultElement.parentNode) {
                resultElement.parentNode.removeChild(resultElement);
            }
            
            // Remove the next button
            if (nextButton.parentNode) {
                nextButton.parentNode.removeChild(nextButton);
            }
            
            // Show the tap button again for next time
            elements.tapButton.style.display = 'block';
            
            // Reset the tap marker
            const tapMarker = document.querySelector('.tap-marker');
            tapMarker.style.display = 'none';
            tapMarker.classList.remove('good', 'okay', 'fail');
            
            // Update the game state
            updateGameState();
            
            // Move to the next narrative if available
            if (processedResult && processedResult.nextNarrative) {
                displayNarrative(processedResult.nextNarrative);
            }
        };
        
        // Add the button to the swing meter container
        elements.swingMeterContainer.appendChild(nextButton);
    }
    
    // Update the decision track
    function updateDecisionTrack() {
        console.log('Updating decision track');
        
        // Clear the decision track
        elements.decisionTrack.innerHTML = '';
        
        // Get the decision history
        const decisions = game.decisionHistory;
        const decisionTypes = game.decisionTypes;
        
        // Add a card for each decision
        for (let i = 0; i < game.currentStop - 1; i++) {
            const card = document.createElement('div');
            const decisionType = decisionTypes[i] || 'unknown';
            
            // Find the corresponding decision in history
            const decision = decisions.find(d => d.stop === i + 1);
            
            // Determine if the performance was successful
            const performanceSuccess = decision ? decision.performanceSuccess : true;
            
            // Set the card class based on decision type and performance
            if (performanceSuccess) {
                card.className = `decision-card ${decisionType}`;
            } else {
                card.className = 'decision-card poor';
            }
            
            // Add the stop number
            const number = document.createElement('div');
            number.className = 'decision-card-number';
            number.textContent = i + 1;
            card.appendChild(number);
            
            // Add the card to the track
            elements.decisionTrack.appendChild(card);
        }
        
        // Add the current stop
        if (game.currentStop <= game.maxRounds * game.stopsPerRound) {
            const currentCard = document.createElement('div');
            currentCard.className = 'decision-card active';
            
            const number = document.createElement('div');
            number.className = 'decision-card-number';
            number.textContent = game.currentStop;
            currentCard.appendChild(number);
            
            elements.decisionTrack.appendChild(currentCard);
        }
        
        // Scroll to the end of the track
        elements.decisionTrack.scrollLeft = elements.decisionTrack.scrollWidth;
    }
    
    // Update the performance meter
    function updatePerformanceMeter() {
        // Calculate the percentage based on performance score and failure threshold
        const percentage = Math.min(100, Math.max(0, (game.performanceScore * -1) / game.failureThreshold * 100));
        
        // Update the fill width
        elements.performanceFill.style.width = percentage + '%';
        
        // Update the color based on percentage
        if (percentage > 75) {
            elements.performanceFill.style.backgroundColor = '#e74c3c'; // Red for danger
        } else if (percentage > 50) {
            elements.performanceFill.style.backgroundColor = '#f39c12'; // Orange for warning
        } else {
            elements.performanceFill.style.backgroundColor = '#2ecc71'; // Green for good
        }
    }
    
    // Update UI elements
    function updateUI() {
        console.log('Updating UI with game state:', game.currentStop, game.performanceScore);
        
        // Update the round number
        elements.roundNumber.textContent = game.currentRound;
        
        // Update the decision track
        updateDecisionTrack();
        
        // Update the performance meter
        updatePerformanceMeter();
    }
    
    // Handle the result of any interaction
    function handleInteractionResult(result) {
        console.log('Handling interaction result:', result);
        
        if (!result.success) {
            console.error('Error processing interaction:', result.reason);
            return;
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
            elements.choiceContainer.style.display = 'flex';
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