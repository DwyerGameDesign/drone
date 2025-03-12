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
        choiceCards: document.getElementById('choice-cards'),
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
        restartButton: document.getElementById('restart-button'),
        meterInstructions: document.querySelector('.meter-instructions')
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
        
        // Ensure we're starting from stop 1
        game.currentStop = 1;
        game.currentRound = 1;
        
        // Start the game
        const result = game.startGame();
        
        // Display the first narrative
        if (result.success && result.narrative) {
            console.log('Starting game with narrative:', result.narrative.title, 'Stop:', result.narrative.stop);
            displayNarrative(result.narrative);
        } else {
            console.error('Failed to start game:', result);
        }
        
        // Update the game state UI
        updateUI();
    }
    
    // Add event listeners
    elements.narrativeCard.addEventListener('click', function() {
        if (isTyping) {
            skipTyping = true;
        }
    });
    
    elements.nextRoundButton.addEventListener('click', function() {
        console.log('Starting next round...');
        
        // Start the next round in the game
        const result = game.startNextRound();
        
        // Hide the round complete screen
        elements.roundComplete.style.display = 'none';
        
        // Reset any fade-in classes
        elements.nextRoundButton.classList.remove('fade-in');
        
        // Clear any result containers or swing meter elements
        const resultContainers = document.querySelectorAll('.meter-result-container');
        resultContainers.forEach(container => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });
        
        // Reset the swing meter if it exists
        const swingMeter = document.querySelector('.swing-meter');
        if (swingMeter) {
            swingMeter.classList.remove('fade-out');
        }
        
        // Hide all interaction elements
        hideAllInteractions();
        
        // Display the next narrative
        displayNarrative(result.nextNarrative);
        
        // Update the UI to reflect the new round
        updateUI();
    });
    
    // Reset the entire game state
    function resetGameState() {
        console.log('Resetting game state...');
        
        // Reset game state
        game.restart();
        
        // Explicitly ensure we're at stop 1
        if (game.currentStop !== 1) {
            console.warn('Game did not reset to stop 1, forcing reset...');
            game.currentStop = 1;
            game.currentRound = 1;
            game.performanceScore = 0;
            game.decisionHistory = [];
            game.decisionTypes = [];
            game.resources = { soul: 0, connections: 0, money: 0 };
            game.gameOver = false;
            game.gameOverReason = null;
        }
        
        console.log('Game reset to stop:', game.currentStop);
        
        // Reset UI elements
        elements.decisionTrack.innerHTML = '';
        elements.performanceFill.style.width = '0%';
        elements.performanceFill.style.backgroundColor = '#2ecc71'; // Green for good
        
        // Clear any result containers or swing meter elements
        const resultContainers = document.querySelectorAll('.meter-result-container');
        resultContainers.forEach(container => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });
        
        // Reset the swing meter if it exists
        const swingMeter = document.querySelector('.swing-meter');
        if (swingMeter) {
            swingMeter.classList.remove('fade-out');
        }
        
        // Reset the indicator bar
        const indicatorBar = document.querySelector('.meter-indicator-bar');
        if (indicatorBar) {
            indicatorBar.style.transition = 'left 0.1s linear';
            indicatorBar.style.left = '0%';
            indicatorBar.classList.remove('good', 'okay', 'fail');
            indicatorBar.style.backgroundColor = 'white';
        }
        
        // Reset the tap marker
        const tapMarker = document.querySelector('.tap-marker');
        if (tapMarker) {
            tapMarker.style.display = 'none';
            tapMarker.classList.remove('good', 'okay', 'fail');
            tapMarker.style.backgroundColor = 'white';
        }
        
        // Reset any fade-in classes
        elements.restartButton.classList.remove('fade-in');
        elements.nextRoundButton.classList.remove('fade-in');
        
        // Hide all screens
        elements.gameOver.style.display = 'none';
        elements.roundComplete.style.display = 'none';
        
        // Hide all interaction elements
        hideAllInteractions();
        
        // Re-initialize the decision track
        initDecisionTrack();
        
        // Reset any global variables
        isTyping = false;
        skipTyping = false;
        isSwingMeterMoving = false;
        swingPosition = 0;
        swingDirection = 1;
        currentSelectedChoice = null;
        
        // Get the first narrative and display it
        const narrative = game.getCurrentNarrative();
        if (narrative) {
            console.log('First narrative after reset:', narrative.title, 'Stop:', narrative.stop);
            displayNarrative(narrative);
        } else {
            console.error('Failed to get initial narrative after reset');
            // Fallback: Try to get the first narrative directly
            if (game.narratives && game.narratives.length > 0) {
                const firstNarrative = game.narratives.find(n => n.stop === 1);
                if (firstNarrative) {
                    console.log('Using fallback first narrative:', firstNarrative.title);
                    displayNarrative(firstNarrative);
                }
            }
        }
        
        // Update the UI to reflect the reset state
        updateUI();
    }
    
    elements.restartButton.addEventListener('click', function() {
        console.log('Restart button clicked, current stop before reset:', game.currentStop);
        
        // Reset the game state
        resetGameState();
        
        // Double-check that we're at stop 1
        console.log('Current stop after reset:', game.currentStop);
        if (game.currentStop !== 1) {
            console.error('Failed to reset to stop 1, forcing reset...');
            // Force a complete game restart
            game.currentStop = 1;
            game.currentRound = 1;
            
            // Get the first narrative directly
            if (game.narratives && game.narratives.length > 0) {
                const firstNarrative = game.narratives.find(n => n.stop === 1);
                if (firstNarrative) {
                    console.log('Displaying first narrative directly:', firstNarrative.title);
                    displayNarrative(firstNarrative);
                    updateUI();
                }
            }
        }
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
        
        // Create a temporary div to store the full message
        const tempDiv = document.createElement('div');
        tempDiv.textContent = narrative.narrative;
        const sanitizedMessage = tempDiv.innerHTML;
        
        // Start typewriter effect
        let index = 0;
        let displayText = '';
        isTyping = true;
        skipTyping = false;
        
        const typeNextCharacter = () => {
            if (skipTyping) {
                // If skipping, show the full text immediately
                elements.narrativeCardText.innerHTML = sanitizedMessage;
                isTyping = false;
                skipTyping = false;
                displayInteraction(narrative);
                return;
            }
            
            if (index < sanitizedMessage.length) {
                displayText += sanitizedMessage.charAt(index);
                elements.narrativeCardText.innerHTML = displayText;
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
                handleCardSelection(card);
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
    function handleCardSelection(card) {
        console.log('Card selected:', card);
        
        // Hide the choice container
        elements.choiceContainer.style.display = 'none';
        
        // Get choice data from the card
        const cardContent = card.querySelector('.card-content');
        const choiceText = cardContent ? cardContent.textContent : 'Unknown choice';
        const decisionType = card.dataset.type || 'standard';
        const choiceIndex = parseInt(card.dataset.index || '0');
        
        // Get the current narrative and its choices
        const narrative = game.getCurrentNarrative();
        const choice = narrative && narrative.choices ? narrative.choices[choiceIndex] : null;
        
        console.log('Selected choice:', choice);
        
        // Update the choice description with meterContext if available, otherwise use choice text
        if (elements.choiceDescription) {
            if (choice && choice.meterContext) {
                elements.choiceDescription.textContent = choice.meterContext;
            } else {
                elements.choiceDescription.textContent = choiceText;
            }
        }
        
        // Set the border color based on decision type
        if (elements.swingMeterContainer) {
            switch(decisionType) {
                case 'soul':
                    elements.swingMeterContainer.style.borderTopColor = '#2A66C9';
                    break;
                case 'connections':
                    elements.swingMeterContainer.style.borderTopColor = '#7D3CCF';
                    break;
                case 'success':
                    elements.swingMeterContainer.style.borderTopColor = '#1F6F50';
                    break;
                default:
                    elements.swingMeterContainer.style.borderTopColor = '#999';
            }
        }
        
        // Update meter zone colors based on decision type
        updateMeterZoneColors(decisionType);
        
        // Store the selected choice with all necessary properties
        currentSelectedChoice = {
            text: choiceText,
            type: decisionType,
            index: choiceIndex,
            // Include the result texts if available from the original choice
            resultGood: choice && choice.resultGood ? choice.resultGood : "You executed this perfectly!",
            resultOkay: choice && choice.resultOkay ? choice.resultOkay : "You managed reasonably well.",
            resultFail: choice && choice.resultFail ? choice.resultFail : "You struggled with this task."
        };
        
        console.log('Current selected choice with results:', currentSelectedChoice);
        
        // Show the swing meter container
        elements.swingMeterContainer.style.display = 'block';
        console.log('Setting swing meter container display to block');
        
        // Set up the tap button
        if (elements.tapButton) {
            elements.tapButton.style.display = 'block';
            elements.tapButton.textContent = 'TAP TO STOP';
            elements.tapButton.onclick = stopSwingMeter;
        } else {
            console.error('Tap button element not found');
        }
        
        // Start the swing meter automatically
        startSwingMeter();
    }
    
    // Update meter zone colors based on decision type
    function updateMeterZoneColors(decisionType) {
        // Get all meter zones
        const goodZone = document.querySelector('.meter-zone.good');
        const poorStartZone = document.querySelector('.meter-zone.poor-start');
        const poorEndZone = document.querySelector('.meter-zone.poor-end');
        
        if (!goodZone) {
            console.error('Good meter zone not found');
            return;
        }
        
        // Reset classes
        goodZone.className = 'meter-zone good';
        
        // Set colors based on decision type
        switch(decisionType) {
            case 'soul':
                // Blue for soul
                goodZone.style.backgroundColor = '#2A66C9'; // Blue for good
                break;
            case 'connections':
                // Violet for connections
                goodZone.style.backgroundColor = '#7D3CCF'; // Violet for good
                break;
            case 'success':
                // Green for success
                goodZone.style.backgroundColor = '#1F6F50'; // Green for good
                break;
            default:
                // Default colors
                goodZone.style.backgroundColor = '#2ecc71'; // Default green
        }
        
        // Ensure poor zones are red
        if (poorStartZone) poorStartZone.style.backgroundColor = '#e74c3c';
        if (poorEndZone) poorEndZone.style.backgroundColor = '#e74c3c';
    }
    
    // Start the swing meter
    function startSwingMeter() {
        console.log('Starting swing meter');
        
        // Create the solid indicator bar if it doesn't exist
        let indicatorBar = document.querySelector('.meter-indicator-bar');
        if (!indicatorBar) {
            indicatorBar = document.createElement('div');
            indicatorBar.className = 'meter-indicator-bar';
            const meterBackground = document.querySelector('.meter-background');
            if (meterBackground) {
                meterBackground.appendChild(indicatorBar);
            } else {
                console.error('Meter background not found');
                return;
            }
        }
        
        // Reset the indicator position and ensure transition is set
        indicatorBar.style.transition = 'left 0.1s linear';
        indicatorBar.style.left = '0%';
        
        // Start the animation
        isSwingMeterMoving = true;
        swingPosition = 0;
        swingDirection = 1;
        
        // Start the animation
        requestAnimationFrame(animateSwingMeter);
    }
    
    // Animate the swing meter
    function animateSwingMeter() {
        if (!isSwingMeterMoving) return;
        
        // Update position
        swingPosition += swingSpeed * swingDirection;
        
        // If at or past the end, reverse direction
        if (swingPosition >= 100) {
            swingDirection = -1;
        } else if (swingPosition <= 0) {
            swingDirection = 1;
        }
        
        // Make sure position stays in bounds
        swingPosition = Math.max(0, Math.min(100, swingPosition));
        
        // Update indicator position
        const indicatorBar = document.querySelector('.meter-indicator-bar');
        if (indicatorBar) {
            indicatorBar.style.left = swingPosition + '%';
        }
        
        // Continue animation
        requestAnimationFrame(animateSwingMeter);
    }
    
    // Stop the swing meter
    function stopSwingMeter() {
        console.log('Stopping swing meter at position:', swingPosition);
        
        // Stop the animation immediately
        isSwingMeterMoving = false;
        
        // Compensate for reaction time delay by moving back slightly
        // This makes it feel more accurate to when the player intended to tap
        const reactionTimeCompensation = 3; // Adjust this value as needed
        const compensatedPosition = Math.max(0, Math.min(100, swingPosition - (swingSpeed * swingDirection * reactionTimeCompensation)));
        
        console.log('Compensated position:', compensatedPosition);
        
        // Fix the indicator position at the compensated position
        const indicatorBar = document.querySelector('.meter-indicator-bar');
        if (indicatorBar) {
            indicatorBar.style.transition = 'none'; // Remove transition to prevent any movement
            indicatorBar.style.left = compensatedPosition + '%';
        }
        
        // Determine the result based on compensated position
        // With our current layout:
        // 0-40%: poor-start (fail)
        // 40-60%: good
        // 60-100%: poor-end (fail)
        let result = 'fail';
        if (compensatedPosition >= 40 && compensatedPosition < 60) {
            result = 'good';
        }
        
        console.log('Swing meter result:', result);
        
        // Show the tap marker at the compensated position
        const tapMarker = document.querySelector('.tap-marker');
        tapMarker.style.left = compensatedPosition + '%';
        tapMarker.style.display = 'block';
        
        // Set tap marker color based on result and decision type
        if (result === 'fail') {
            tapMarker.style.backgroundColor = '#e74c3c'; // Red for fail
        } else {
            // Set color based on decision type and result
            const decisionType = currentSelectedChoice.type;
            if (result === 'good') {
                switch(decisionType) {
                    case 'soul':
                        tapMarker.style.backgroundColor = '#2A66C9'; // Blue for soul good
                        break;
                    case 'connections':
                        tapMarker.style.backgroundColor = '#7D3CCF'; // Violet for connections good
                        break;
                    case 'success':
                        tapMarker.style.backgroundColor = '#1F6F50'; // Green for success good
                        break;
                    default:
                        tapMarker.style.backgroundColor = '#2ecc71'; // Default green
                }
            }
        }
        
        // Update the indicator bar color based on result and decision type
        if (indicatorBar) {
            // Remove any existing result classes
            indicatorBar.classList.remove('good', 'okay', 'fail');
            
            if (result === 'fail') {
                indicatorBar.style.backgroundColor = '#e74c3c'; // Red for fail
            } else {
                // Set color based on decision type and result
                const decisionType = currentSelectedChoice.type;
                if (result === 'good') {
                    switch(decisionType) {
                        case 'soul':
                            indicatorBar.style.backgroundColor = '#2A66C9'; // Blue for soul good
                            break;
                        case 'connections':
                            indicatorBar.style.backgroundColor = '#7D3CCF'; // Violet for connections good
                            break;
                        case 'success':
                            indicatorBar.style.backgroundColor = '#1F6F50'; // Green for success good
                            break;
                        default:
                            indicatorBar.style.backgroundColor = '#2ecc71'; // Default green
                    }
                }
            }
        }
        
        // Show the result of the swing meter
        showSwingMeterResult(result);
    }
    
    // Show the result of the swing meter
    function showSwingMeterResult(result) {
        // Hide the tap button
        elements.tapButton.style.display = 'none';
        
        // Get the result text based on the result
        let resultText = '';
        if (currentSelectedChoice) {
            console.log('Getting result text for:', result, currentSelectedChoice);
            
            if (result === 'good' && currentSelectedChoice.resultGood) {
                resultText = currentSelectedChoice.resultGood;
            } else if (result === 'fail' && currentSelectedChoice.resultFail) {
                resultText = currentSelectedChoice.resultFail;
            }
            
            // Ensure we have some text to display
            if (!resultText) {
                if (result === 'good') {
                    resultText = "You executed this perfectly!";
                } else {
                    resultText = "You struggled with this task.";
                }
            }
        } else {
            // Fallback if no choice is selected
            if (result === 'good') {
                resultText = "You executed this perfectly!";
            } else {
                resultText = "You struggled with this task.";
            }
        }
        
        console.log('Result text to display:', resultText);
        
        // Fade out the swing meter
        const swingMeter = document.querySelector('.swing-meter');
        swingMeter.classList.add('fade-out');
        
        // Create result container
        const resultContainer = document.createElement('div');
        resultContainer.className = `meter-result-container ${currentSelectedChoice.type}`;
        
        // If the result is fail, override the border color
        if (result === 'fail') {
            resultContainer.classList.add('fail');
        }
        
        // Create result text element
        const resultTextElement = document.createElement('div');
        resultTextElement.className = 'meter-result-text';
        resultContainer.appendChild(resultTextElement);
        
        // Get the choice description element (narrative text)
        const choiceDescription = elements.choiceDescription;
        
        // Add the result container right after the choice description
        if (choiceDescription && choiceDescription.parentNode) {
            // Insert the result container after the choice description
            choiceDescription.parentNode.insertBefore(resultContainer, choiceDescription.nextSibling);
        } else {
            // Fallback: Add to the swing meter container
            elements.swingMeterContainer.appendChild(resultContainer);
        }
        
        // Wait for the swing meter to fade out before showing the result
        setTimeout(() => {
            // Show the result container
            resultContainer.classList.add('visible');
            
            // Create a temporary div to store the full message
            const tempDiv = document.createElement('div');
            tempDiv.textContent = resultText;
            const sanitizedMessage = tempDiv.innerHTML;
            
            // Typewriter effect for the result text
            let index = 0;
            let displayText = '';
            resultTextElement.textContent = ''; // Ensure we start with an empty string
            
            const typeNextCharacter = () => {
                if (index < sanitizedMessage.length) {
                    displayText += sanitizedMessage.charAt(index);
                    resultTextElement.innerHTML = displayText;
                    index++;
                    setTimeout(typeNextCharacter, 30); // 30ms per character
                } else {
                    // Add a "Next Stop" button after the text is fully displayed
                    addNextStopButton(result, resultContainer);
                }
            };
            
            // Start the typewriter effect
            typeNextCharacter();
        }, 500); // Wait 500ms for the fade-out
    }
    
    // Add the Next Stop button
    function addNextStopButton(result, resultContainer) {
        // Add a "Next Stop" button
        const nextButton = document.createElement('button');
        nextButton.className = 'next-stop-button';
        nextButton.textContent = 'Next Stop';
        nextButton.onclick = function() {
            try {
                // Process the result
                const processedResult = game.handleSwingMeter(result, currentSelectedChoice);
                
                // Hide the swing meter container
                elements.swingMeterContainer.style.display = 'none';
                
                // Reset the swing meter for next time
                resetSwingMeter();
                
                // Update the game state
                updateGameState();
                
                // Move to the next narrative if available
                if (processedResult && processedResult.nextNarrative) {
                    displayNarrative(processedResult.nextNarrative);
                } else {
                    // If no next narrative, try to get the current narrative
                    if (typeof game.getCurrentNarrative === 'function') {
                        const currentNarrative = game.getCurrentNarrative();
                        if (currentNarrative) {
                            displayNarrative(currentNarrative);
                        } else {
                            console.error('No current narrative available');
                            // Try to find the next narrative based on the current stop
                            const nextNarrative = game.narratives.find(n => n.stop === game.currentStop);
                            if (nextNarrative) {
                                displayNarrative(nextNarrative);
                            } else {
                                console.error('No next narrative found for stop:', game.currentStop);
                            }
                        }
                    } else {
                        console.error('getCurrentNarrative function not found on game object');
                    }
                }
            } catch (error) {
                console.error('Error processing swing meter result:', error);
                // Fallback to hide the swing meter and show the narrative
                elements.swingMeterContainer.style.display = 'none';
                updateGameState();
            }
        };
        
        // Add the button to the result container
        resultContainer.appendChild(nextButton);
    }
    
    // Reset the swing meter for next use
    function resetSwingMeter() {
        // Remove any result containers
        const resultContainers = document.querySelectorAll('.meter-result-container');
        resultContainers.forEach(container => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });
        
        // Reset the swing meter
        const swingMeter = document.querySelector('.swing-meter');
        swingMeter.classList.remove('fade-out');
        
        // Reset the indicator bar
        const indicatorBar = document.querySelector('.meter-indicator-bar');
        if (indicatorBar) {
            indicatorBar.style.transition = 'left 0.1s linear'; // Restore transition
            indicatorBar.style.left = '0%';
            indicatorBar.classList.remove('good', 'okay', 'fail');
            indicatorBar.style.backgroundColor = 'white'; // Reset to default white color
        }
        
        // Reset the tap marker
        const tapMarker = document.querySelector('.tap-marker');
        tapMarker.style.display = 'none';
        tapMarker.classList.remove('good', 'okay', 'fail');
        tapMarker.style.backgroundColor = 'white'; // Reset to default white color
        
        // Show the tap button again for next time
        if (elements.tapButton) {
            elements.tapButton.style.display = 'block';
        }
    }
    
    // Update the decision track
    function updateDecisionTrack() {
        console.log('Updating decision track');
        
        // Clear the decision track
        elements.decisionTrack.innerHTML = '';
        
        // Get the decision history
        const decisions = game.decisionHistory;
        const decisionTypes = game.decisionTypes;
        
        console.log('Decision history:', decisions);
        console.log('Decision types:', decisionTypes);
        
        // Add a card for each decision
        for (let i = 0; i < game.currentStop - 1; i++) {
            const card = document.createElement('div');
            const decisionType = decisionTypes[i] || 'unknown';
            
            // Find the corresponding decision in history
            const decision = decisions.find(d => d.stop === i + 1);
            
            console.log(`Decision for stop ${i + 1}:`, decision);
            
            // Determine the result of the swing meter
            let swingResult = decision ? decision.swingMeterResult : null;
            
            // Set the card class based on decision type and swing meter result
            if (swingResult === 'good') {
                // Good result - full color
                card.className = `decision-card ${decisionType}`;
            } else if (swingResult === 'okay') {
                // Okay result - muted color
                card.className = `decision-card ${decisionType}-okay`;
            } else {
                // Failed or no result - poor (gray with X)
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
    
    // Show game over screen
    function showGameOver(success) {
        console.log('Showing game over screen, success:', success);
        elements.gameOver.style.display = 'flex';
        
        // Set appropriate title based on success or failure
        const gameOverTitle = document.querySelector('#game-over h2');
        if (gameOverTitle) {
            gameOverTitle.textContent = success ? "Journey's End" : "Journey Derailed";
        }
        
        // Get the game over message
        const gameOverMessage = game.getGameOverMessage(success);
        
        // Clear existing content
        elements.gameOverMessage.textContent = '';
        
        // Hide the restart button initially
        elements.restartButton.style.display = 'none';
        elements.restartButton.textContent = 'Reboard Train';
        
        // Create a temporary div to store the full message
        const tempDiv = document.createElement('div');
        tempDiv.textContent = gameOverMessage;
        const sanitizedMessage = tempDiv.innerHTML;
        
        // Start typewriter effect
        let index = 0;
        let displayText = '';
        
        const typeNextCharacter = () => {
            if (index < sanitizedMessage.length) {
                displayText += sanitizedMessage.charAt(index);
                elements.gameOverMessage.innerHTML = displayText;
                index++;
                setTimeout(typeNextCharacter, typingSpeed);
            } else {
                // Show the restart button after the message is fully displayed
                setTimeout(() => {
                    elements.restartButton.style.display = 'block';
                    elements.restartButton.classList.add('fade-in');
                }, 500);
            }
        };
        
        // Start the typewriter effect
        typeNextCharacter();
    }
    
    // Show round complete screen
    function showRoundComplete() {
        console.log('Showing round complete screen');
        elements.roundComplete.style.display = 'flex';
        elements.completedRound.textContent = game.currentRound;
        elements.roundSoulValue.textContent = game.resources.soul;
        elements.roundConnectionsValue.textContent = game.resources.connections;
        elements.roundMoneyValue.textContent = game.resources.money;
        
        // Set the next round button text
        elements.nextRoundButton.textContent = 'Continue Journey';
        
        // Get the round summary text
        const roundSummaryText = game.getRoundSummaryText();
        
        // Clear existing content
        elements.roundSummaryText.textContent = '';
        
        // Hide the next round button initially
        elements.nextRoundButton.style.display = 'none';
        
        // Create a temporary div to store the full message
        const tempDiv = document.createElement('div');
        tempDiv.textContent = roundSummaryText;
        const sanitizedMessage = tempDiv.innerHTML;
        
        // Start typewriter effect
        let index = 0;
        let displayText = '';
        
        const typeNextCharacter = () => {
            if (index < sanitizedMessage.length) {
                displayText += sanitizedMessage.charAt(index);
                elements.roundSummaryText.innerHTML = displayText;
                index++;
                setTimeout(typeNextCharacter, typingSpeed);
            } else {
                // Show the next round button after the text is fully displayed
                setTimeout(() => {
                    elements.nextRoundButton.style.display = 'block';
                    elements.nextRoundButton.classList.add('fade-in');
                }, 500);
            }
        };
        
        // Start the typewriter effect
        typeNextCharacter();
    }
    
    // Update game state
    function updateGameState() {
        console.log('Updating game state');
        
        // Update UI elements
        updateUI();
        
        // Check for game over
        if (game.gameOver) {
            console.log('Game over detected, reason:', game.gameOverReason);
            showGameOver(game.gameOverReason === 'success');
            return;
        }
        
        // Check if all stops are completed (game completed successfully)
        if (game.currentStop > game.narratives.length) {
            console.log('All stops completed, showing success game over');
            showGameOver(true); // Show success ending
            return;
        }
        
        // Check for round complete
        if (game.currentStop > game.stopsPerRound * game.currentRound) {
            console.log('Round complete detected');
            showRoundComplete();
            return;
        }
    }
});