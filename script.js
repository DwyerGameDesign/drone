// Drone Man: The Journey - Main script
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded. Initializing game...');
    
    // Create game instance
    const game = new DroneManGame();
    window.gameInstance = game; // Make it globally accessible for swing meter
    
    // Menu functionality
    const menuButton = document.getElementById('menuButton');
    const menuPanel = document.getElementById('menuPanel');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenu = document.getElementById('closeMenu');
    const restartGameMenu = document.getElementById('restartGameMenu');
    const aboutGameMenu = document.getElementById('aboutGameMenu');
    const helpMenu = document.getElementById('helpMenu');
    const recordButton = document.getElementById('recordButton');

    console.log('Menu elements:', {
        menuButton: !!menuButton,
        menuPanel: !!menuPanel,
        menuOverlay: !!menuOverlay,
        closeMenu: !!closeMenu,
        restartGameMenu: !!restartGameMenu,
        aboutGameMenu: !!aboutGameMenu,
        helpMenu: !!helpMenu,
        recordButton: !!recordButton
    });

    // Ensure menu is closed by default
    if (menuPanel) {
        menuPanel.classList.remove('open');
    }
    if (menuOverlay) {
        menuOverlay.classList.remove('open');
    }

    // Menu event listeners
    menuButton.addEventListener('click', () => {
        console.log('Menu button clicked');
        menuPanel.classList.add('open');
        menuOverlay.classList.add('open');
    });

    closeMenu.addEventListener('click', () => {
        console.log('Close menu clicked');
        menuPanel.classList.remove('open');
        menuOverlay.classList.remove('open');
    });

    menuOverlay.addEventListener('click', () => {
        console.log('Menu overlay clicked');
        menuPanel.classList.remove('open');
        menuOverlay.classList.remove('open');
    });

    restartGameMenu.addEventListener('click', () => {
        menuPanel.classList.remove('open');
        menuOverlay.classList.remove('open');
        resetGameState();
    });

    // Record button event listener
    if (recordButton) {
        recordButton.addEventListener('click', () => {
            console.log('Record button clicked');
            showRecordCollection();
        });
    }

    // Record Collection menu option
    const recordCollectionMenu = document.getElementById('recordCollectionMenu');
    if (recordCollectionMenu) {
        recordCollectionMenu.addEventListener('click', () => {
            console.log('Record Collection menu clicked');
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            showRecordCollection();
        });
    }

    aboutGameMenu.addEventListener('click', () => {
        // Show about information
        alert('Drone Man: The Journey\n\nNavigate through life\'s challenges as a delivery drone, making decisions that affect your soul, connections, and success. Every choice matters in this unique narrative experience.');
    });

    helpMenu.addEventListener('click', () => {
        // Show help information
        alert('How to Play:\n\n1. Read each situation carefully\n2. Choose your response\n3. Time your action using the swing meter\n4. Watch your journey progress\n\nTip: Click/tap text to skip animations');
    });
    
    // UI Elements
    const elements = {
        narrativeTitle: document.getElementById('narrativeTitle'),
        narrativeText: document.getElementById('narrativeText'),
        choiceContainer: document.getElementById('choiceContainer'),
        swingMeterContainer: document.getElementById('swingMeterContainer'),
        meterBackground: document.getElementById('meterBackground'),
        choiceDescription: document.getElementById('choiceDescription'),
        tapButton: document.getElementById('tapButton'),
        tapInstruction: document.querySelector('.tap-instruction'),
        roundComplete: document.getElementById('roundComplete'),
        completedRound: document.getElementById('completedRound'),
        roundSummaryText: document.getElementById('roundSummaryText'),
        roundSoulValue: document.getElementById('roundSoulValue'),
        roundConnectionsValue: document.getElementById('roundConnectionsValue'),
        roundMoneyValue: document.getElementById('roundMoneyValue'),
        nextRoundButton: document.getElementById('nextRoundButton'),
        nextInstruction: document.querySelector('.next-instruction'),
        gameOver: document.getElementById('gameOver'),
        gameOverTitle: document.getElementById('gameOverTitle'),
        gameOverMessage: document.getElementById('gameOverMessage'),
        restartButton: document.getElementById('restartButton'),
        journeyTrack: document.getElementById('journeyTrack')
    };
    
    // Global variables
    // Typewriter effect variables
    let isTyping = false;
    let skipTyping = false;
    let typingSpeed = 30; // ms per character
    
    // Swing meter variables
    let isSwingMeterMoving = false;
    let swingPosition = 0;
    let swingDirection = 1;
    let swingSpeed = 1.5; // Base speed
    let currentSelectedChoice = null;
    let baseGoodZoneWidth = 20; // Base width percentage for good zone
    let baseCriticalZoneWidth = 6; // Base width percentage for critical zone
    let goodZonePosition = 50; // Default center position (percentage)
    let criticalHitDetected = false; // Track if player hit the critical zone
    
    // Initialize the game
    function initGame() {
        console.log('Initializing game...');
        
        // Ensure we're starting from stop 1
        game.currentStop = 1;
        game.logicalStop = 1;
        game.currentRound = 1;
        game.performanceScore = 0;
        game.decisionHistory = [];
        game.decisionTypes = [];
        game.resources = { soul: 0, connections: 0, money: 0 };
        game.gameOver = false;
        game.gameOverReason = null;
        
        // Reload game data if possible
        if (game.loadGameData && typeof game.loadGameData === 'function') {
            console.log('Loading fresh game data...');
            game.loadGameData();
        }
        
        // Initialize journey manager
        game.initializeJourneyManager();
        
        // Initialize achievement system
        if (!game.achievementSystem) {
            console.log('Initializing achievement system...');
            game.achievementSystem = new AchievementSystem(game);
        } else {
            console.log('Resetting achievement system for new playthrough...');
            game.achievementSystem.resetPlaythrough();
        }
        
        // Initialize journey track
        updateJourneyTrack();
        
        // Start the game
        const result = game.startGame();
        
        // Display the first narrative
        if (result.success && result.narrative) {
            console.log('Starting game with narrative:', result.narrative.title, 'Stop:', result.narrative.stop);
            // Ensure the current narrative is set
            game.currentNarrative = result.narrative;
            displayNarrative(result.narrative);
        } else {
            console.error('Failed to start game:', result);
            
            // Fallback: Try to get the first narrative directly
            if (game.narratives && game.narratives.length > 0) {
                const firstActualStop = game.journeyManager.getActualStop(1);
                const firstNarrative = game.narratives.find(n => n.stop === firstActualStop);
                if (firstNarrative) {
                    console.log('Using fallback first narrative:', firstNarrative.title);
                    // Ensure the current narrative is set
                    game.currentNarrative = firstNarrative;
                    displayNarrative(firstNarrative);
                } else {
                    console.error('Could not find first narrative');
                    console.log('Available stops:', game.narratives.map(n => n.stop).sort((a, b) => a - b));
                }
            }
        }
        
        // Update the game state UI
        updateUI();
    }
    
    // Add event listeners
    const narrativeCard = document.querySelector('.narrative-card');
    narrativeCard.addEventListener('click', function() {
        if (isTyping) {
            skipTyping = true;
        }
    });
    
    elements.nextRoundButton.addEventListener('click', function() {
        console.log('Next round button clicked');
        hideRoundComplete();
        startNextRound();
    });
    
    // Make the entire round complete screen tappable
    elements.roundComplete.addEventListener('click', function(e) {
        // Prevent clicks on child elements from triggering multiple times
        if (e.target === elements.roundComplete || !elements.nextRoundButton.contains(e.target)) {
            console.log('Round complete screen tapped');
            hideRoundComplete();
            startNextRound();
        }
    });
    
    // Add event listener for the view albums button
    const viewAlbumsButton = document.getElementById('viewAlbumsButton');
    if (viewAlbumsButton) {
        viewAlbumsButton.addEventListener('click', function() {
            console.log('View albums button clicked');
            showRecordCollection();
        });
    }
    
    // Reset the entire game state
    function resetGameState() {
        console.log('Resetting game state...');
        
        // Reset game state
        game.restart();
        
        // Reset achievement system for new playthrough
        if (game.achievementSystem) {
            console.log('Resetting achievement system for new playthrough...');
            game.achievementSystem.resetPlaythrough();
        }
        
        // Explicitly ensure we're at stop 1 and performance score is 0
        if (game.logicalStop !== 1 || game.performanceScore !== 0) {
            console.warn('Game did not reset properly, forcing reset...');
            console.warn('Current logical stop:', game.logicalStop, 'Performance score:', game.performanceScore);
            
            game.currentStop = 1;
            game.logicalStop = 1;
            game.currentRound = 1;
            game.performanceScore = 0;
            game.decisionHistory = [];
            game.decisionTypes = [];
            game.resources = { soul: 0, connections: 0, money: 0 };
            game.gameOver = false;
            game.gameOverReason = null;
        }
        
        console.log('Game reset to logical stop:', game.logicalStop, 'Performance score:', game.performanceScore);
        
        // Reset UI elements
        const journeyTrack = document.getElementById('journeyTrack');
        if (journeyTrack) {
            journeyTrack.innerHTML = '';
        }
        
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
        
        // Reset any global variables
        isTyping = false;
        skipTyping = false;
        isSwingMeterMoving = false;
        swingPosition = 0;
        swingDirection = 1;
        currentSelectedChoice = null;
        
        // Force a complete reload of the game data
        if (game.loadGameData && typeof game.loadGameData === 'function') {
            console.log('Reloading game data...');
            game.loadGameData();
        }
        
        // Wait a moment to ensure data is loaded
        setTimeout(() => {
            // Verify performance score is still 0
            console.log('Verifying reset - Performance score:', game.performanceScore);
            
            // Get the first narrative and display it
            let firstNarrative = null;
            
            // Try multiple methods to get the first narrative
            if (game.narratives && game.narratives.length > 0) {
                const firstActualStop = game.journeyManager.getActualStop(1);
                firstNarrative = game.narratives.find(n => n.stop === firstActualStop);
                console.log('Found first narrative directly:', firstNarrative?.title);
            }
            
            if (!firstNarrative && typeof game.getCurrentNarrative === 'function') {
                firstNarrative = game.getCurrentNarrative();
                console.log('Found first narrative via getCurrentNarrative:', firstNarrative?.title);
            }
            
            if (firstNarrative) {
                console.log('Displaying first narrative after reset:', firstNarrative.title);
                displayNarrative(firstNarrative);
            } else {
                console.error('Failed to get initial narrative after reset');
                // Last resort: Try to restart the game completely
                console.log('Attempting to restart game completely...');
                initGame();
            }
            
            // Update the UI to reflect the reset state
            updateUI();
        }, 100);
    }
    
    elements.restartButton.addEventListener('click', function() {
        console.log('Restart button clicked, current stop before reset:', game.currentStop);
        
        // Reset the game state
        resetGameState();
        
        // Double-check that we're at stop 1 after a short delay to ensure reset has completed
        setTimeout(() => {
            console.log('Current stop after reset:', game.currentStop);
            if (game.currentStop !== 1) {
                console.error('Failed to reset to stop 1, forcing complete restart...');
                
                // Force a complete game restart
                game.currentStop = 1;
                game.currentRound = 1;
                game.performanceScore = 0;
                game.decisionHistory = [];
                game.decisionTypes = [];
                game.resources = { soul: 0, connections: 0, money: 0 };
                game.gameOver = false;
                game.gameOverReason = null;
                
                // Reload game data if possible
                if (game.loadGameData && typeof game.loadGameData === 'function') {
                    game.loadGameData();
                }
                
                // Get the first narrative directly
                if (game.narratives && game.narratives.length > 0) {
                    const firstNarrative = game.narratives.find(n => n.stop === 1);
                    if (firstNarrative) {
                        console.log('Displaying first narrative directly:', firstNarrative.title);
                        displayNarrative(firstNarrative);
                        updateUI();
                    } else {
                        console.error('Could not find first narrative, restarting game...');
                        initGame();
                    }
                } else {
                    console.error('No narratives found, restarting game...');
                    initGame();
                }
            }
        }, 200);
    });
    
    // Wait for game data to load
    waitForGameData(game).then(() => {
        // Ensure UI elements are visible
        const header = document.querySelector('header');
        if (header) {
            header.style.display = 'flex';
        }
        
        const journeyTrackContainer = document.querySelector('.journey-track');
        if (journeyTrackContainer) {
            journeyTrackContainer.style.display = 'flex';
        }
        
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
        elements.narrativeTitle.textContent = narrative.title;
        
        // Clear existing content
        elements.narrativeText.textContent = '';
        
        // Clear the choice description
        if (elements.choiceDescription) {
            elements.choiceDescription.textContent = '';
        }
        
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
                elements.narrativeText.innerHTML = sanitizedMessage;
                isTyping = false;
                skipTyping = false;
                displayInteraction(narrative);
                return;
            }
            
            if (index < sanitizedMessage.length) {
                displayText += sanitizedMessage.charAt(index);
                elements.narrativeText.innerHTML = displayText;
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
        console.log('Displaying choice cards:', choices);
        
        // Clear existing cards
        elements.choiceContainer.innerHTML = '';
        elements.choiceContainer.style.display = 'flex';
        elements.choiceContainer.style.opacity = '1';
        elements.choiceContainer.style.transform = 'translateY(0)';
        
        if (!choices || choices.length === 0) {
            console.warn('No choices to display');
            return;
        }
        
        // Add a card for each choice
        choices.forEach((choice, index) => {
            const decisionType = choice.decisionType || (index === 0 ? 'soul' : index === 1 ? 'connections' : 'success');
            
            const card = document.createElement('div');
            card.className = 'card ' + decisionType;
            
            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = choice.title || 'Option ' + (index + 1);
            
            const content = document.createElement('div');
            content.className = 'card-content';
            content.textContent = choice.text;
            
            // Store choice data
            card.dataset.index = index;
            card.dataset.type = decisionType;
            
            // Add click handler
            card.addEventListener('click', function() {
                // Add active class to show selection
                const allCards = elements.choiceContainer.querySelectorAll('.card');
                allCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Handle the selection
                handleCardSelection(card);
            });
            
            // Add ripple effect for touch feedback
            card.addEventListener('touchstart', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;
                
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                card.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 1000);
            });
            
            card.appendChild(title);
            card.appendChild(content);
            elements.choiceContainer.appendChild(card);
        });
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
            elements.tapButton.style.display = 'none'; // Hide the button
            elements.tapInstruction.style.display = 'block'; // Show the instruction text
        } else {
            console.error('Tap button element not found');
        }
        
        // Make the entire container tappable
        elements.swingMeterContainer.onclick = stopSwingMeter;
        
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
        
        // Reset critical hit detection
        criticalHitDetected = false;
        
        // Calculate difficulty based on current logical stop
        const totalStops = game.journeyManager.getTotalStops();
        const currentStop = game.logicalStop;
        const progressRatio = currentStop / totalStops;
        
        console.log(`Current stop: ${currentStop}/${totalStops}, Progress ratio: ${progressRatio}`);
        
        // Adjust speed based on progress (1.5x to 3x base speed)
        swingSpeed = 1.5 + (progressRatio * 1.5);
        console.log(`Adjusted swing speed: ${swingSpeed}`);
        
        // Adjust good zone width based on progress (20% down to 12%)
        const goodZoneWidth = Math.max(12, baseGoodZoneWidth - (progressRatio * 8));
        const criticalZoneWidth = Math.max(3, baseCriticalZoneWidth - (progressRatio * 3));
        
        // Adjust zone position based on progress
        // Early stops: center (50%)
        // Middle stops: slight variation (40-60%)
        // Late stops: random position (30-70%)
        if (progressRatio < 0.3) {
            // Early stops - center
            goodZonePosition = 50;
        } else if (progressRatio < 0.7) {
            // Middle stops - slight variation
            goodZonePosition = 40 + (Math.random() * 20);
        } else {
            // Late stops - more random
            goodZonePosition = 30 + (Math.random() * 40);
        }
        
        console.log(`Adjusted good zone width: ${goodZoneWidth}%, position: ${goodZonePosition}%`);
        
        // Update the good zone width and position
        const goodZone = document.querySelector('.meter-zone.good');
        if (goodZone) {
            // Calculate the left edge of the good zone
            const goodZoneLeft = goodZonePosition - (goodZoneWidth / 2);
            goodZone.style.width = `${goodZoneWidth}%`;
            goodZone.style.left = `${goodZoneLeft}%`;
            
            // Update the critical zone width and position
            const criticalZone = document.querySelector('.meter-zone.critical');
            if (criticalZone) {
                criticalZone.style.width = `${criticalZoneWidth}%`;
                // Position the critical zone exactly in the center of the good zone
                // Remove the transform from the style and set the exact center position
                criticalZone.style.transform = '';
                
                // Calculate the exact center of the good zone
                const goodZoneCenter = goodZoneLeft + (goodZoneWidth / 2);
                // Position the critical zone so its center is at the good zone's center
                const criticalZoneLeft = goodZoneCenter - (criticalZoneWidth / 2);
                criticalZone.style.left = `${criticalZoneLeft}%`;
                
                console.log(`Good zone center: ${goodZoneCenter}%, Critical zone left: ${criticalZoneLeft}%`);
            }
        }
        
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
        
        // Prevent multiple clicks
        elements.swingMeterContainer.onclick = null;
        
        // Stop the animation immediately
        isSwingMeterMoving = false;
        
        // Compensate for reaction time delay by moving back slightly
        // This makes it feel more accurate to when the player intended to tap
        const reactionTimeCompensation = 5; // Adjust this value as needed
        const compensatedPosition = Math.max(0, Math.min(100, swingPosition - (swingSpeed * swingDirection * reactionTimeCompensation)));
        
        console.log('Compensated position:', compensatedPosition);
        
        // Fix the indicator position at the compensated position
        const indicatorBar = document.querySelector('.meter-indicator-bar');
        if (indicatorBar) {
            indicatorBar.style.transition = 'none'; // Remove transition to prevent any movement
            indicatorBar.style.left = compensatedPosition + '%';
        }
        
        // Get the current good zone position and width
        const goodZone = document.querySelector('.meter-zone.good');
        const criticalZone = document.querySelector('.meter-zone.critical');
        
        let goodZoneStart = 40; // Default
        let goodZoneEnd = 60; // Default
        let criticalZoneStart = 47; // Default
        let criticalZoneEnd = 53; // Default
        
        if (goodZone && goodZone.style.left && goodZone.style.width) {
            goodZoneStart = parseFloat(goodZone.style.left);
            goodZoneEnd = goodZoneStart + parseFloat(goodZone.style.width);
        }
        
        if (criticalZone && criticalZone.style.left && criticalZone.style.width) {
            criticalZoneStart = parseFloat(criticalZone.style.left);
            criticalZoneEnd = criticalZoneStart + parseFloat(criticalZone.style.width);
        }
        
        // Calculate the center points for debugging
        const goodZoneCenter = goodZoneStart + ((goodZoneEnd - goodZoneStart) / 2);
        const criticalZoneCenter = criticalZoneStart + ((criticalZoneEnd - criticalZoneStart) / 2);
        
        console.log(`Good zone: ${goodZoneStart}% to ${goodZoneEnd}%, center: ${goodZoneCenter}%`);
        console.log(`Critical zone: ${criticalZoneStart}% to ${criticalZoneEnd}%, center: ${criticalZoneCenter}%`);
        
        // Determine the result based on compensated position
        let result = 'fail';
        
        // Check for critical hit first
        if (compensatedPosition >= criticalZoneStart && compensatedPosition < criticalZoneEnd) {
            result = 'critical';
            criticalHitDetected = true;
            console.log('CRITICAL HIT!');
            
            // Show critical hit text
            const criticalText = document.createElement('div');
            criticalText.className = 'critical-hit-text';
            criticalText.textContent = 'CRITICAL!';
            elements.swingMeterContainer.appendChild(criticalText);
            
            // Remove the text after animation completes
            setTimeout(() => {
                if (criticalText.parentNode) {
                    criticalText.parentNode.removeChild(criticalText);
                }
            }, 1500);
        } 
        // Then check for good hit
        else if (compensatedPosition >= goodZoneStart && compensatedPosition < goodZoneEnd) {
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
            
            if (result === 'critical') {
                tapMarker.style.backgroundColor = 'white'; // White for critical
                tapMarker.style.boxShadow = '0 0 10px white'; // Add glow for critical
            } else if (result === 'good') {
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
            indicatorBar.classList.remove('good', 'okay', 'fail', 'critical');
            
            if (result === 'fail') {
                indicatorBar.style.backgroundColor = '#e74c3c'; // Red for fail
            } else if (result === 'critical') {
                indicatorBar.style.backgroundColor = 'white'; // White for critical
                indicatorBar.style.boxShadow = '0 0 10px white'; // Add glow for critical
                indicatorBar.classList.add('critical');
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
        
        // For critical hits, we still want to show the "good" result text
        // but we'll track the critical hit separately
        if (result === 'critical') {
            result = 'good'; // Use good result text
        }
        
        // Show the result of the swing meter
        showSwingMeterResult(result);
    }
    
    // Show the result of the swing meter
    function showSwingMeterResult(result) {
        // Hide the tap button
        elements.tapButton.style.display = 'none';
        elements.tapInstruction.style.display = 'none';
        
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
        
        // Hide only the swing meter, not the entire container
        const swingMeter = document.querySelector('.swing-meter');
        swingMeter.style.display = 'none';
        
        // Keep the choice description visible
        // Do NOT hide the choice description
        
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
        
        // Add the result container to the swing meter container after the choice description
        elements.swingMeterContainer.appendChild(resultContainer);
        
        // Show the result immediately
        resultContainer.classList.add('visible');
        
        // Create a temporary div to store the full message
        const tempDiv = document.createElement('div');
        tempDiv.textContent = resultText;
        const sanitizedMessage = tempDiv.innerHTML;
        
        // Variables for typewriter effect
        let index = 0;
        let displayText = '';
        let isTyping = true;
        resultTextElement.textContent = ''; // Ensure we start with an empty string
        
        // Function to complete the typing immediately
        const completeTyping = () => {
            if (isTyping) {
                isTyping = false;
                resultTextElement.innerHTML = sanitizedMessage;
                // Add the Next Stop button immediately
                addNextStopButton(result, resultContainer);
            }
        };
        
        // Add click event to skip typing - make sure it's properly attached
        resultTextElement.style.cursor = 'pointer';
        resultTextElement.addEventListener('click', completeTyping);
        
        // Create a variable to store the next button for later reference
        let nextButton;
        
        // Also make the entire result container tappable to skip typing
        resultContainer.addEventListener('click', function(e) {
            // Prevent clicks on child elements from triggering multiple times
            if (e.target === resultContainer || (nextButton && !nextButton.contains(e.target))) {
                // If still typing, complete the typing first
                if (isTyping) {
                    completeTyping();
                    return;
                }
                
                try {
                    // Process the result
                    console.log('Processing swing meter result:', result, 'Current stop before:', game.currentStop);
                    
                    // Determine if the swing meter was successful
                    const success = result === 'good';
                    
                    // Get the narrative type from the selected choice
                    const narrativeType = currentSelectedChoice.type || 'neutral';
                    
                    console.log(`Calling handleSwingMeter with success=${success}, narrativeType=${narrativeType}, critical=${criticalHitDetected}`);
                    
                    // Track the decision in the achievement system
                    if (game.achievementSystem) {
                        console.log(`Tracking decision in achievement system: Stop=${game.logicalStop}, Type=${narrativeType}, Success=${success}, Critical=${criticalHitDetected}`);
                        game.achievementSystem.trackDecision(game.logicalStop, narrativeType, success);
                    }
                    
                    // Call the game's handleSwingMeter method with the success and narrative type
                    const gameResult = game.handleSwingMeter(success, narrativeType, criticalHitDetected);
                    
                    console.log('Game result after handling swing meter:', gameResult, 'Current stop after:', game.currentStop);
                    console.log('Updated decision history:', game.decisionHistory);
                    
                    // Update the journey track immediately to reflect the decision
                    updateJourneyTrack();
                    
                    // Save the choice description text before hiding the container
                    const choiceDescriptionText = elements.choiceDescription ? elements.choiceDescription.textContent : '';
                    
                    // Hide the swing meter container
                    elements.swingMeterContainer.style.display = 'none';
                    
                    // Reset the swing meter for next time
                    resetSwingMeter();
                    
                    // Check if the game is over
                    if (gameResult.gameOver) {
                        console.log('Game over detected after swing meter result');
                        showGameOver(gameResult.reason === 'success');
                        return;
                    }
                    
                    // Get the next narrative
                    const nextNarrative = game.getCurrentNarrative();
                    if (nextNarrative) {
                        console.log('Displaying next narrative:', nextNarrative);
                        displayNarrative(nextNarrative);
                    } else {
                        console.error('No next narrative found after swing meter result');
                    }
                } catch (error) {
                    console.error('Error processing swing meter result:', error);
                }
            }
        });
        
        const typeNextCharacter = () => {
            if (isTyping && index < sanitizedMessage.length) {
                displayText += sanitizedMessage.charAt(index);
                resultTextElement.innerHTML = displayText;
                index++;
                setTimeout(typeNextCharacter, 30); // 30ms per character
            } else if (isTyping) {
                // Typing is complete naturally
                isTyping = false;
                // Add a "Next Stop" button after the text is fully displayed
                nextButton = addNextStopButton(result, resultContainer);
            }
        };
        
        // Start the typewriter effect
        typeNextCharacter();
    }
    
    // Add the Next Stop button
    function addNextStopButton(result, resultContainer) {
        // Add a "Next Stop" button (hidden but kept for compatibility)
        const nextButton = document.createElement('button');
        nextButton.className = 'next-stop-button';
        nextButton.textContent = 'Next Stop';
        nextButton.style.display = 'none'; // Hide the button
        resultContainer.appendChild(nextButton);
        
        // Add instruction text
        const nextInstruction = document.createElement('div');
        nextInstruction.className = 'next-instruction';
        nextInstruction.textContent = 'Tap to continue';
        resultContainer.appendChild(nextInstruction);
        
        // Make the entire result container tappable
        resultContainer.style.cursor = 'pointer';
        
        // Remove any existing click handlers to prevent duplicates
        const oldClickHandler = resultContainer.onclick;
        if (oldClickHandler) {
            resultContainer.removeEventListener('click', oldClickHandler);
        }
        
        // Add the new click handler
        resultContainer.onclick = function(e) {
            // Prevent clicks on child elements from triggering multiple times
            if (e.target === resultContainer || !nextButton.contains(e.target)) {
                // If still typing, complete the typing first
                if (typeof isTyping !== 'undefined' && isTyping) {
                    if (typeof completeTyping === 'function') {
                        completeTyping();
                    }
                    return;
                }
                
                try {
                    // Process the result
                    console.log('Processing swing meter result:', result, 'Current stop before:', game.currentStop);
                    
                    // Determine if the swing meter was successful
                    const success = result === 'good';
                    
                    // Get the narrative type from the selected choice
                    const narrativeType = currentSelectedChoice.type || 'neutral';
                    
                    console.log(`Calling handleSwingMeter with success=${success}, narrativeType=${narrativeType}`);
                    
                    // Track the decision in the achievement system
                    if (game.achievementSystem) {
                        console.log(`Tracking decision in achievement system: Stop=${game.logicalStop}, Type=${narrativeType}, Success=${success}`);
                        game.achievementSystem.trackDecision(game.logicalStop, narrativeType, success);
                    }
                    
                    // Call the game's handleSwingMeter method with the success and narrative type
                    const gameResult = game.handleSwingMeter(success, narrativeType);
                    
                    console.log('Game result after handling swing meter:', gameResult, 'Current stop after:', game.currentStop);
                    console.log('Updated decision history:', game.decisionHistory);
                    
                    // Update the journey track immediately to reflect the decision
                    updateJourneyTrack();
                    
                    // Save the choice description text before hiding the container
                    const choiceDescriptionText = elements.choiceDescription ? elements.choiceDescription.textContent : '';
                    
                    // Hide the swing meter container
                    elements.swingMeterContainer.style.display = 'none';
                    
                    // Reset the swing meter for next time
                    resetSwingMeter();
                    
                    // Check if the game is over
                    if (gameResult.gameOver) {
                        console.log('Game over detected after swing meter result');
                        showGameOver(gameResult.reason === 'success');
                        return;
                    }
                    
                    // Get the next narrative
                    const nextNarrative = game.getCurrentNarrative();
                    if (nextNarrative) {
                        console.log('Displaying next narrative:', nextNarrative);
                        displayNarrative(nextNarrative);
                    } else {
                        console.error('No next narrative found after swing meter result');
                    }
                } catch (error) {
                    console.error('Error processing swing meter result:', error);
                }
            }
        };
        
        // Keep the original button functionality for backward compatibility
        nextButton.onclick = resultContainer.onclick;
        
        return nextButton;
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
        
        // Restore the swing meter container structure if it was cleared
        if (!document.querySelector('.swing-meter')) {
            // Recreate the swing meter structure, but preserve the choice description
            const swingMeter = document.createElement('div');
            swingMeter.className = 'swing-meter';
            
            const meterBackground = document.createElement('div');
            meterBackground.id = 'meterBackground';
            meterBackground.className = 'meter-background';
            
            const poorStartZone = document.createElement('div');
            poorStartZone.className = 'meter-zone poor-start';
            
            const goodZone = document.createElement('div');
            goodZone.className = 'meter-zone good';
            
            const poorEndZone = document.createElement('div');
            poorEndZone.className = 'meter-zone poor-end';
            
            const indicatorBar = document.createElement('div');
            indicatorBar.className = 'meter-indicator-bar';
            
            const tapMarker = document.createElement('div');
            tapMarker.className = 'tap-marker';
            
            meterBackground.appendChild(poorStartZone);
            meterBackground.appendChild(goodZone);
            meterBackground.appendChild(poorEndZone);
            meterBackground.appendChild(indicatorBar);
            meterBackground.appendChild(tapMarker);
            
            swingMeter.appendChild(meterBackground);
            elements.swingMeterContainer.appendChild(swingMeter);
            
            const tapInstruction = document.createElement('div');
            tapInstruction.className = 'tap-instruction';
            tapInstruction.textContent = 'Tap anywhere to stop';
            elements.swingMeterContainer.appendChild(tapInstruction);
            elements.tapInstruction = tapInstruction;
        } else {
            // Restore the swing meter
            const swingMeter = document.querySelector('.swing-meter');
            if (swingMeter) {
                swingMeter.style.display = 'block';
                swingMeter.classList.remove('fade-out');
            }
        }
        
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
        if (tapMarker) {
            tapMarker.style.display = 'none';
            tapMarker.classList.remove('good', 'okay', 'fail');
            tapMarker.style.backgroundColor = 'white'; // Reset to default white color
        }
        
        // Reset tap button
        if (elements.tapButton) {
            elements.tapButton.style.display = 'none';
        }
        
        // Make sure tap instruction is visible
        if (elements.tapInstruction) {
            elements.tapInstruction.style.display = 'block';
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
    
    // Debug function to help understand what's happening with the journey track
    function debugJourneyTrack() {
        console.log('=== DEBUG JOURNEY TRACK ===');
        console.log('Current logical stop:', game.logicalStop);
        console.log('Total stops:', game.journeyManager.getTotalStops());
        console.log('Decision history:', game.decisionHistory);
        
        // Check each station
        const stations = document.querySelectorAll('.station');
        console.log('Number of stations:', stations.length);
        
        stations.forEach((station, index) => {
            console.log(`Station ${index + 1} classes:`, station.className);
            
            // Check if this station should have a decision
            if (index + 1 < game.logicalStop) {
                const decision = game.decisionHistory.find(d => Number(d.stop) === index + 1);
                console.log(`Decision for station ${index + 1}:`, decision);
                
                if (decision) {
                    console.log(`  Success: ${decision.success}, Type: ${decision.narrativeType}`);
                    
                    // Check if the station has the correct classes
                    const hasCompletedClass = station.classList.contains('completed');
                    const hasFailClass = station.classList.contains('fail');
                    const hasTypeClass = station.classList.contains(decision.narrativeType);
                    
                    console.log(`  Has completed class: ${hasCompletedClass}`);
                    console.log(`  Has fail class: ${hasFailClass}`);
                    console.log(`  Has type class: ${hasTypeClass}`);
                    
                    // Check if the classes match the decision
                    const shouldHaveFailClass = decision.success === false;
                    const shouldHaveTypeClass = decision.success === true;
                    
                    console.log(`  Should have fail class: ${shouldHaveFailClass}`);
                    console.log(`  Should have type class: ${shouldHaveTypeClass}`);
                    
                    // Log any discrepancies
                    if (shouldHaveFailClass && !hasFailClass) {
                        console.error(`  ERROR: Station ${index + 1} should have fail class but doesn't`);
                    }
                    
                    if (shouldHaveTypeClass && !hasTypeClass) {
                        console.error(`  ERROR: Station ${index + 1} should have ${decision.narrativeType} class but doesn't`);
                    }
                }
            }
        });
        
        console.log('=== END DEBUG JOURNEY TRACK ===');
    }

    // Update the journey track
    function updateJourneyTrack() {
        console.log('Updating journey track');
        console.log('Decision history:', game.decisionHistory);
        console.log('Decision types:', game.decisionTypes);
        
        const journeyTrack = document.getElementById('journeyTrack');
        if (!journeyTrack) {
            console.error('Journey track element not found');
            return;
        }
        
        journeyTrack.innerHTML = '';
        
        // Get the total number of stops in the journey
        const totalStops = game.journeyManager.getTotalStops();
        console.log('Total stops:', totalStops, 'Current logical stop:', game.logicalStop);
        
        if (!totalStops || totalStops <= 0) {
            console.warn('Invalid total stops:', totalStops);
            // Add a placeholder station if no valid stops
            const station = document.createElement('div');
            station.className = 'station current';
            journeyTrack.appendChild(station);
            return;
        }
        
        // Create track line elements between stations
        for (let i = 1; i <= totalStops; i++) {
            // Add station
            const station = document.createElement('div');
            station.className = 'station';
            
            // Add station number as data attribute
            station.dataset.stop = i;
            
            // Add track line before station (except for first station)
            if (i > 1) {
                const trackLine = document.createElement('div');
                trackLine.className = 'track-line';
                journeyTrack.appendChild(trackLine);
            }
            
            // Add completed class if this stop has been passed
            if (i < game.logicalStop) {
                // First add the completed class
                station.classList.add('completed');
                
                // Find the decision for this logical stop
                const decision = game.decisionHistory.find(d => Number(d.stop) === i);
                console.log(`Looking for decision at logical stop ${i}:`, decision);
                
                if (decision) {
                    console.log(`Decision for logical stop ${i}:`, decision);
                    console.log(`Decision success: ${decision.success}, type: ${decision.narrativeType}`);
                    
                    // Check if the swing meter was successful
                    if (decision.success === false) {
                        // If failed, add the fail class to show an X
                        station.classList.add('fail');
                        console.log(`Adding fail class to station ${i}`);
                    } else if (decision.narrativeType) {
                        // If successful, add the decision type class for proper coloring
                        station.classList.add(decision.narrativeType);
                        console.log(`Adding ${decision.narrativeType} class to station ${i}`);
                        
                        // Check if this was a critical hit
                        if (decision.critical === true) {
                            station.classList.add('critical');
                            console.log(`Adding critical class to station ${i}`);
                        }
                    } else {
                        // Fallback to standard class if no narrative type
                        station.classList.add('standard');
                        console.log(`Adding standard class to station ${i} (no narrative type)`);
                    }
                } else {
                    console.warn(`No decision found for logical stop ${i}`);
                    
                    // Debug: Print all decision stops to help diagnose the issue
                    const stops = game.decisionHistory.map(d => d.stop);
                    console.log(`All decision stops:`, stops);
                    console.log(`Types of stops:`, stops.map(s => typeof s));
                }
            }
            
            // Add current class if this is the current stop
            if (i === game.logicalStop) {
                station.classList.add('current');
            }
            
            journeyTrack.appendChild(station);
            console.log(`Added station ${i} with classes:`, station.className);
        }
        
        // Scroll to current station
        const currentStation = journeyTrack.querySelector('.station.current');
        if (currentStation) {
            setTimeout(() => {
                const scrollPosition = currentStation.offsetLeft - (journeyTrack.offsetWidth / 2) + (currentStation.offsetWidth / 2);
                journeyTrack.scrollLeft = Math.max(0, scrollPosition);
            }, 100);
        }
        
        // Debug the journey track
        debugJourneyTrack();
    }
    
    // Update UI elements
    function updateUI() {
        console.log('Updating UI with game state:', game.currentStop, game.performanceScore);
        
        // Update the journey track
        updateJourneyTrack();
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
        
        // Explicitly update the journey track
        updateJourneyTrack();
        
        // Handle game over
        if (result.gameOver) {
            showGameOver(result.reason === 'success');
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
            elements.narrativeText.style.display = 'block';
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
            const logicalStop = game.logicalStop;
            console.log('Current logical stop:', logicalStop);
            const manualNextNarrative = game.journeyManager.getNarrativeForLogicalStop(logicalStop);
            
            if (manualNextNarrative) {
                console.log('Found manual next narrative:', manualNextNarrative);
                // Clear any existing content and hide interactions
                hideAllInteractions();
                // Display the next narrative with typewriter effect
                displayNarrative(manualNextNarrative);
            } else {
                console.error('Cannot find next narrative for logical stop:', logicalStop);
            }
        }
    }
    
    // Show game over screen
    function showGameOver(success) {
        console.log('Showing game over screen, success:', success);
        console.log('Game state at game over:', {
            logicalStop: game.logicalStop,
            currentStop: game.currentStop,
            totalStops: game.journeyManager.getTotalStops(),
            gameOverReason: game.gameOverReason,
            performanceScore: game.performanceScore,
            failureThreshold: game.failureThreshold,
            decisionHistory: game.decisionHistory.length,
            decisionTypes: game.decisionTypes
        });
        
        // Force success to true if gameOverReason is "success"
        if (game.gameOverReason === "success") {
            console.log('Forcing success to true because gameOverReason is "success"');
            success = true;
        }
        
        // Complete the playthrough in the achievement system
        let newlyUnlockedAchievements = [];
        if (game.achievementSystem) {
            console.log('Completing playthrough in achievement system');
            console.log('Achievement stats before completion:', {
                currentPlaythrough: game.achievementSystem.playerStats.currentPlaythrough,
                allTime: game.achievementSystem.playerStats.allTime
            });
            
            newlyUnlockedAchievements = game.achievementSystem.completePlaythrough();
            console.log('Newly unlocked achievements:', newlyUnlockedAchievements);
            
            console.log('Achievement stats after completion:', {
                allTime: game.achievementSystem.playerStats.allTime,
                totalUnlocked: game.achievementSystem.achievements.filter(a => a.unlocked).length
            });
        }
        
        elements.gameOver.style.display = 'flex';
        
        // Set appropriate title based on success or failure
        if (elements.gameOverTitle) {
            elements.gameOverTitle.textContent = success ? "Journey's End" : "Journey Derailed";
        }
        
        // Set the ending type based on the player's decisions
        const endingType = document.getElementById('endingType');
        if (endingType) {
            // For success endings, determine the dominant path
            if (success) {
                const counts = {
                    soul: game.decisionTypes.filter(type => type === "soul").length,
                    connections: game.decisionTypes.filter(type => type === "connections").length,
                    success: game.decisionTypes.filter(type => type === "success").length
                };
                
                console.log('Decision type counts for ending:', counts);
                
                // Determine the dominant path
                let dominant = "mixed";
                if (counts.soul > counts.connections && counts.soul > counts.success) {
                    dominant = "soul";
                } else if (counts.connections > counts.soul && counts.connections > counts.success) {
                    dominant = "connections";
                } else if (counts.success > counts.soul && counts.success > counts.connections) {
                    dominant = "success";
                }
                
                // Set the ending type text and class
                endingType.className = 'ending-type ' + dominant;
                
                switch (dominant) {
                    case "soul":
                        endingType.textContent = "AUTHENTIC SELF ENDING";
                        break;
                    case "connections":
                        endingType.textContent = "MEANINGFUL BONDS ENDING";
                        break;
                    case "success":
                        endingType.textContent = "PROFESSIONAL ACHIEVEMENT ENDING";
                        break;
                    default:
                        endingType.textContent = "BALANCED GROWTH ENDING";
                }
            } else {
                // For failure endings, determine the dominant attempt pattern
                const soulAttempts = game.decisionHistory.filter(d => d.intendedType === "soul").length;
                const connectionsAttempts = game.decisionHistory.filter(d => d.intendedType === "connections").length;
                const successAttempts = game.decisionHistory.filter(d => d.intendedType === "success").length;
                
                console.log('Decision attempts for ending:', { soul: soulAttempts, connections: connectionsAttempts, success: successAttempts });
                
                // Determine dominant attempt pattern
                let dominantAttempt = "mixed";
                if (soulAttempts > connectionsAttempts && soulAttempts > successAttempts) {
                    dominantAttempt = "soul";
                } else if (connectionsAttempts > soulAttempts && connectionsAttempts > successAttempts) {
                    dominantAttempt = "connections";
                } else if (successAttempts > soulAttempts && successAttempts > connectionsAttempts) {
                    dominantAttempt = "success";
                }
                
                // Set the ending type text and class
                endingType.className = 'ending-type ' + dominantAttempt;
                
                switch (dominantAttempt) {
                    case "soul":
                        endingType.textContent = "LOST AUTHENTICITY ENDING";
                        break;
                    case "connections":
                        endingType.textContent = "BROKEN BONDS ENDING";
                        break;
                    case "success":
                        endingType.textContent = "HOLLOW ACHIEVEMENTS ENDING";
                        break;
                    default:
                        endingType.textContent = "DIRECTIONLESS ENDING";
                }
            }
        }
        
        // Get the game over message
        const gameOverMessage = game.getGameOverMessage(success);
        console.log('Game over message:', gameOverMessage);
        
        // Clear existing content
        elements.gameOverMessage.textContent = '';
        
        // Hide the restart button initially
        elements.restartButton.style.display = 'none';
        elements.restartButton.textContent = 'Start New Journey';
        
        // Hide the view albums button initially
        const viewAlbumsButton = document.getElementById('viewAlbumsButton');
        if (viewAlbumsButton) {
            viewAlbumsButton.style.display = 'none';
        }
        
        // Create a temporary div to store the full message
        const tempDiv = document.createElement('div');
        tempDiv.textContent = gameOverMessage;
        const sanitizedMessage = tempDiv.innerHTML;
        
        // Variables for typewriter effect
        let index = 0;
        let displayText = '';
        let isTyping = true;
        
        // Function to complete the typing immediately
        const completeTyping = () => {
            if (isTyping) {
                isTyping = false;
                elements.gameOverMessage.innerHTML = sanitizedMessage;
                
                // Show the restart button immediately
                elements.restartButton.style.display = 'block';
                elements.restartButton.classList.add('fade-in');
                
                // Show achievements section if there are newly unlocked achievements
                displayNewAchievements(newlyUnlockedAchievements);
            }
        };
        
        // Add click event to skip typing
        elements.gameOverMessage.style.cursor = 'pointer';
        elements.gameOverMessage.addEventListener('click', completeTyping);
        
        // Make the entire game over screen tappable
        elements.gameOver.addEventListener('click', function(e) {
            // Only trigger if we're not clicking on a child element with its own handler
            if (e.target === elements.gameOver) {
                if (isTyping) {
                    completeTyping();
                } else if (elements.restartButton.style.display === 'block') {
                    // If typing is done and restart button is visible, act as if restart button was clicked
                    resetGameState();
                }
            }
        });
        
        const typeNextCharacter = () => {
            if (isTyping && index < sanitizedMessage.length) {
                displayText += sanitizedMessage.charAt(index);
                elements.gameOverMessage.innerHTML = displayText;
                index++;
                setTimeout(typeNextCharacter, typingSpeed);
            } else if (isTyping) {
                // Typing is complete naturally
                isTyping = false;
                
                // Show the restart button after the message is fully displayed
                setTimeout(() => {
                    elements.restartButton.style.display = 'block';
                    elements.restartButton.classList.add('fade-in');
                    
                    // Show achievements section if there are newly unlocked achievements
                    displayNewAchievements(newlyUnlockedAchievements);
                }, 500);
            }
        };
        
        // Start the typewriter effect
        typeNextCharacter();
    }
    
    // Display newly unlocked achievements in the game over screen
    function displayNewAchievements(newlyUnlockedIds) {
        if (!game.achievementSystem || !newlyUnlockedIds || newlyUnlockedIds.length === 0) {
            return;
        }
        
        const newAlbumsSection = document.getElementById('newAlbumsSection');
        const newAlbumsGrid = document.getElementById('newAlbumsGrid');
        const viewAlbumsButton = document.getElementById('viewAlbumsButton');
        
        if (!newAlbumsSection || !newAlbumsGrid || !viewAlbumsButton) {
            console.error('Missing elements for displaying achievements');
            return;
        }
        
        // Clear any existing albums
        newAlbumsGrid.innerHTML = '';
        
        // Get the newly unlocked achievements
        const newlyUnlocked = game.achievementSystem.getNewlyUnlocked();
        
        // Create album elements for each newly unlocked achievement
        newlyUnlocked.forEach(achievement => {
            const album = document.createElement('div');
            album.className = 'album newly-unlocked';
            
            const albumCover = document.createElement('div');
            albumCover.className = `album-cover ${achievement.albumArt}`;
            albumCover.style.backgroundColor = achievement.albumColor;
            
            // Add the album shine effect
            const albumShine = document.createElement('div');
            albumShine.className = 'album-shine';
            albumCover.appendChild(albumShine);
            
            // Add unlocked badge
            const unlockedBadge = document.createElement('div');
            unlockedBadge.className = 'unlocked-badge';
            unlockedBadge.textContent = 'UNLOCKED';
            album.appendChild(unlockedBadge);
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'album-tooltip';
            tooltip.textContent = `${achievement.title}: ${achievement.description}`;
            
            album.appendChild(albumCover);
            album.appendChild(tooltip);
            newAlbumsGrid.appendChild(album);
        });
        
        // Show the section and button
        newAlbumsSection.style.display = 'block';
        viewAlbumsButton.style.display = 'block';
        
        // Add click handler for the view albums button
        viewAlbumsButton.onclick = showRecordCollection;
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
        
        // Show the next round button with fade-in animation
        elements.nextRoundButton.style.display = 'none';
        elements.nextInstruction.style.display = 'block';
        
        // Create a temporary div to store the full message
        const tempDiv = document.createElement('div');
        tempDiv.textContent = roundSummaryText;
        const sanitizedMessage = tempDiv.innerHTML;
        
        // Variables for typewriter effect
        let index = 0;
        let displayText = '';
        let isTyping = true;
        
        // Function to complete the typing immediately
        const completeTyping = () => {
            if (isTyping) {
                isTyping = false;
                elements.roundSummaryText.innerHTML = sanitizedMessage;
                // Show the next round button immediately
                elements.nextRoundButton.style.display = 'block';
                elements.nextRoundButton.classList.add('fade-in');
            }
        };
        
        // Add click event to skip typing
        elements.roundSummaryText.style.cursor = 'pointer';
        elements.roundSummaryText.addEventListener('click', completeTyping);
        
        const typeNextCharacter = () => {
            if (isTyping && index < sanitizedMessage.length) {
                displayText += sanitizedMessage.charAt(index);
                elements.roundSummaryText.innerHTML = displayText;
                index++;
                setTimeout(typeNextCharacter, typingSpeed);
            } else if (isTyping) {
                // Typing is complete naturally
                isTyping = false;
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
            const isSuccess = game.gameOverReason === 'success';
            console.log('Is success ending:', isSuccess, 'Current logical stop:', game.logicalStop, 'Total stops:', game.journeyManager.getTotalStops());
            showGameOver(isSuccess);
            return;
        }
        
        // Check if all stops are completed (game completed successfully)
        const totalStops = game.journeyManager.getTotalStops();
        if (game.logicalStop > totalStops) {
            console.log(`All stops completed (${game.logicalStop} > ${totalStops}), showing success game over`);
            // Set game over state
            game.gameOver = true;
            game.gameOverReason = "success";
            console.log('Set gameOverReason to "success" in updateGameState');
            showGameOver(true); // Show success ending
            return;
        }
        
        // Check if performance score is too low (game over due to failure)
        if (game.performanceScore <= game.failureThreshold) {
            console.log(`Performance score (${game.performanceScore}) below failure threshold (${game.failureThreshold}), showing failure game over`);
            // Set game over state
            game.gameOver = true;
            game.gameOverReason = "failure";
            console.log('Set gameOverReason to "failure" in updateGameState');
            showGameOver(false); // Show failure ending
            return;
        }
    }

    function hideRoundComplete() {
        console.log('Hiding round complete screen');
        elements.roundComplete.style.display = 'none';
        elements.nextRoundButton.classList.remove('fade-in');
        elements.nextInstruction.style.display = 'none';
    }
    
    function startNextRound() {
        console.log('Starting next round...');
        
        // Start the next round in the game
        const result = game.startNextRound();
        
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
    }

    // Show the record collection screen
    function showRecordCollection() {
        console.log('Showing record collection screen');
        
        if (!game.achievementSystem) {
            console.error('Achievement system not initialized');
            return;
        }
        
        const recordCollection = document.getElementById('recordCollection');
        const albumCollectionGrid = document.getElementById('albumCollectionGrid');
        
        if (!recordCollection || !albumCollectionGrid) {
            console.error('Missing elements for record collection');
            return;
        }
        
        // Show the record collection screen
        recordCollection.style.display = 'flex';
        // Add the open class after a small delay to trigger the animation
        setTimeout(() => {
            recordCollection.classList.add('open');
        }, 10);
        
        // Get all achievements
        const allAchievements = game.achievementSystem.getAllAchievements();
        
        // Display all achievements
        displayAchievementsInCollection(allAchievements, 'all');
        
        // Set up tab functionality
        const tabs = document.querySelectorAll('.collection-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Get the category
                const category = this.getAttribute('data-category');
                
                // Filter achievements by category
                let filteredAchievements = allAchievements;
                if (category !== 'all') {
                    filteredAchievements = allAchievements.filter(a => a.category === category);
                }
                
                // Display filtered achievements
                displayAchievementsInCollection(filteredAchievements, category);
            });
        });
        
        // Set up close button
        const closeButton = document.getElementById('closeCollection');
        if (closeButton) {
            closeButton.onclick = hideRecordCollection;
        }
        
        // Set up return to game button
        const returnButton = document.getElementById('returnToGameButton');
        if (returnButton) {
            returnButton.onclick = hideRecordCollection;
        }
    }
    
    // Hide the record collection screen
    function hideRecordCollection() {
        console.log('Hiding record collection screen');
        
        const recordCollection = document.getElementById('recordCollection');
        if (recordCollection) {
            // Remove the open class to trigger the closing animation
            recordCollection.classList.remove('open');
            
            // Wait for the animation to complete before hiding the element
            setTimeout(() => {
                recordCollection.style.display = 'none';
            }, 300); // Match the transition duration in CSS
        }
    }
    
    // Display achievements in the collection grid
    function displayAchievementsInCollection(achievements, category) {
        console.log(`Displaying ${achievements.length} achievements in category: ${category}`);
        
        const albumCollectionGrid = document.getElementById('albumCollectionGrid');
        if (!albumCollectionGrid) {
            console.error('Album collection grid not found');
            return;
        }
        
        // Clear existing albums
        albumCollectionGrid.innerHTML = '';
        
        // Create album elements for each achievement
        achievements.forEach(achievement => {
            const album = document.createElement('div');
            album.className = 'collection-album';
            
            const albumCover = document.createElement('div');
            albumCover.className = `collection-album-cover ${achievement.albumArt}`;
            
            if (achievement.unlocked) {
                // Unlocked album
                albumCover.style.backgroundColor = achievement.albumColor;
                
                // Add shine effect for unlocked albums
                const albumShine = document.createElement('div');
                albumShine.className = 'album-shine';
                albumCover.appendChild(albumShine);
                
                // Add unlocked badge
                const unlockedBadge = document.createElement('div');
                unlockedBadge.className = 'unlocked-badge';
                unlockedBadge.textContent = 'UNLOCKED';
                album.appendChild(unlockedBadge);
            } else {
                // Locked album
                albumCover.classList.add('locked-album');
            }
            
            // Add album info (always visible for all achievements)
            const albumInfo = document.createElement('div');
            albumInfo.className = 'collection-album-info';
            
            const albumTitle = document.createElement('div');
            albumTitle.className = 'collection-album-title';
            albumTitle.textContent = achievement.title;
            
            const albumDescription = document.createElement('div');
            albumDescription.className = 'collection-album-description';
            albumDescription.textContent = achievement.unlocked ? achievement.description : achievement.description.replace(/Complete|Choose|Fail|Visit/i, "???");
            
            albumInfo.appendChild(albumTitle);
            albumInfo.appendChild(albumDescription);
            
            album.appendChild(albumCover);
            album.appendChild(albumInfo);
            albumCollectionGrid.appendChild(album);
        });
    }
});