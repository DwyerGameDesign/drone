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
    let currentSelectedOutcome = null;
    
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
        console.log('Displaying interaction for narrative type:', narrative.interactionType);
        
        if (narrative.interactionType === 'swingMeter') {
            displayChoiceCards(narrative.outcomes);
        } else {
            console.error('Unknown interaction type:', narrative.interactionType);
        }
    }
    
    // Display decision cards for the player to choose from
    function displayChoiceCards(outcomes) {
        // Clear existing cards
        elements.choiceContainer.innerHTML = '';
        
        // Add a card for each outcome
        outcomes.forEach((outcome, index) => {
            const decisionType = outcome.decisionType || (index === 0 ? 'soul' : index === 1 ? 'connections' : 'success');
            
            const card = document.createElement('div');
            card.className = 'choice-card ' + decisionType;
            
            const header = document.createElement('div');
            header.className = 'card-header';
            
            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = outcome.title || 'Option ' + (index + 1);
            
            const content = document.createElement('div');
            content.className = 'card-content';
            content.textContent = outcome.text;
            
            header.appendChild(title);
            card.appendChild(header);
            card.appendChild(content);
            
            // Store outcome data
            card.dataset.index = index;
            card.dataset.type = decisionType;
            card.dataset.result = outcome.result;
            
            // Add click handler
            card.addEventListener('click', function() {
                handleCardSelection(outcome, decisionType);
            });
            
            elements.choiceContainer.appendChild(card);
        });
    }
    
    // Handle card selection
    function handleCardSelection(outcome, decisionType) {
        console.log('Card selected:', outcome, decisionType);
        
        // Hide the choice container
        elements.choiceContainer.style.display = 'none';
        
        // Show the swing meter container
        elements.swingMeterContainer.style.display = 'block';
        
        // Update choice summary
        elements.choiceType.textContent = decisionType.toUpperCase();
        elements.choiceType.className = 'choice-type ' + decisionType;
        elements.choiceTitle.textContent = outcome.title || 'Your Choice';
        elements.choiceDescription.textContent = 'You\'ve chosen to ' + outcome.text.toLowerCase() + '. How committed will you be to this path?';
        
        // Set up the swing meter title
        elements.swingMeterTitle.textContent = 'How intensely will you pursue this?';
        
        // Store the selected outcome for later
        currentSelectedOutcome = outcome;
        
        // Set up the tap button
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
        let result;
        if (swingPosition >= 60 && swingPosition < 80) {
            result = 'good';
        } else if ((swingPosition >= 40 && swingPosition < 60) || (swingPosition >= 80 && swingPosition < 100)) {
            result = 'okay';
        } else {
            result = 'poor';
        }
        
        console.log('Swing meter result:', result);
        
        // Change button function
        elements.tapButton.textContent = 'CONTINUE';
        elements.tapButton.onclick = () => showResult(result);
    }
    
    // Show the result of the swing meter
    function showResult(result) {
        console.log('Showing result:', result);
        
        // Hide the swing meter container
        elements.swingMeterContainer.style.display = 'none';
        
        // Show the result screen
        elements.resultScreen.style.display = 'block';
        
        // Update result status
        elements.resultStatus.textContent = result.toUpperCase();
        elements.resultStatus.className = 'result-status ' + result;
        
        // Update result title
        elements.resultTitle.textContent = currentSelectedOutcome.title || 'Your Choice';
        
        // Update result text based on the outcome and performance
        let resultText;
        if (result === 'good') {
            resultText = "You fully commit to your choice. " + currentSelectedOutcome.text;
        } else if (result === 'okay') {
            resultText = "You make a partial effort. " + currentSelectedOutcome.text + ", but your focus wavers.";
        } else {
            resultText = "You struggle to follow through. Despite your intentions, you fail to " + currentSelectedOutcome.text.toLowerCase() + ".";
        }
        
        elements.resultText.textContent = resultText;
        
        // Set up continue button
        elements.continueButton.onclick = () => {
            // Hide result screen
            elements.resultScreen.style.display = 'none';
            
            // Process the result with the game
            const processedResult = game.handleSwingMeter(result);
            handleInteractionResult(processedResult);
        };
    }
    
    // Update the decision track based on the game state
    function updateDecisionTrack() {
        // Get all cards in the track
        const cards = elements.decisionTrack.querySelectorAll('.decision-card');
        
        // Update each card based on the game's decision types and performance results
        for (let i = 0; i < cards.length; i++) {
            const decisionType = game.decisionTypes[i];
            const performanceResult = game.performanceResults[i];
            
            // Remove existing classes
            cards[i].classList.remove('active', 'soul', 'connections', 'success', 'poor');
            
            // Add current position class
            if (i + 1 === game.currentStop) {
                cards[i].classList.add('active');
            }
            
            // Add decision type class if available
            if (decisionType) {
                // If performance was poor, show gray
                if (performanceResult === 'poor') {
                    cards[i].classList.add('poor');
                } else {
                    cards[i].classList.add(decisionType);
                }
            }
        }
    }
    
    // Update the performance meter
    function updatePerformanceMeter() {
        // Calculate percentage based on the failure threshold
        const percentage = Math.min(100, Math.max(0, (game.performanceScore * -1) / game.failureThreshold * 100));
        elements.performanceFill.style.width = percentage + '%';
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