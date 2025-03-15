// Drone Man: The Journey - Main script
import SwingMeter from './swing-meter.js';
import Typewriter from './typewriter.js';

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded. Initializing game...');

    // Create game instance
    const game = new DroneManGame();
    window.gameInstance = game; // Make it globally accessible for swing meter

    // Current state variables
    let currentSelectedChoice = null;
    let currentCard = null;
    let currentNextButton = null;

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
        alert('Drone Man: The Journey\n\nNavigate through life\'s challenges as a drone man, making decisions that affect your soul, connections, and success. Every choice matters in this unique narrative experience.');
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
        journeyTrack: document.getElementById('journeyTrack'),
        gameOverJourneyTrack: document.getElementById('gameOverJourneyTrack'),
        swingMeter: document.querySelector('.swing-meter'),
        difficultyMeters: document.querySelector('.difficulty-meters'),
        rhythmLabel: document.querySelector('.rhythm-label'),
        endingType: document.getElementById('endingType'),
        newAlbumsSection: document.getElementById('newAlbumsSection'),
        newAlbumsGrid: document.getElementById('newAlbumsGrid'),
        viewAlbumsButton: document.getElementById('viewAlbumsButton')
    };

    // Typewriter effect instances
    let narrativeTypewriter;
    let resultTypewriter;
    let gameOverTypewriter;
    let roundSummaryTypewriter;

    // Add event listener for the narrative card to skip typewriter effect
    const narrativeCard = document.querySelector('.narrative-card');
    narrativeCard.addEventListener('click', function () {
        if (narrativeTypewriter && narrativeTypewriter.isTyping) {
            narrativeTypewriter.skip();
        }
    });

    // Add event listener for next round button
    elements.nextRoundButton.addEventListener('click', function () {
        console.log('Next round button clicked');
        hideRoundComplete();
        startNextRound();
    });

    // Make the entire round complete screen tappable
    elements.roundComplete.addEventListener('click', function (e) {
        // Prevent clicks on child elements from triggering multiple times
        if (e.target === elements.roundComplete || !elements.nextRoundButton.contains(e.target)) {
            console.log('Round complete screen tapped');

            if (roundSummaryTypewriter && roundSummaryTypewriter.isTyping) {
                roundSummaryTypewriter.skip();
            } else {
                hideRoundComplete();
                startNextRound();
            }
        }
    });

    // Add event listener for the view albums button
    if (elements.viewAlbumsButton) {
        elements.viewAlbumsButton.addEventListener('click', function () {
            console.log('View albums button clicked');
            showRecordCollection();
        });
    }

    // Add event listener for restart button
    elements.restartButton.addEventListener('click', function () {
        console.log('Restart button clicked, current stop before reset:', game.currentStop);
        resetGameState();
    });

    // Function to display a narrative with typewriter effect
    function displayNarrative(narrative) {
        if (!narrative) {
            console.error('No narrative provided to display');
            return;
        }

        console.log('Displaying narrative:', narrative.title);

        // Update the narrative title
        if (elements.narrativeTitle) {
            elements.narrativeTitle.textContent = narrative.title || '';
        }

        // Hide all interaction elements
        hideAllInteractions();

        // Clear existing content
        if (elements.narrativeText) {
            elements.narrativeText.textContent = '';
        }

        // Use typewriter effect to display the narrative text
        if (narrativeTypewriter) {
            narrativeTypewriter.stop();
        }

        narrativeTypewriter = new Typewriter(elements.narrativeText, {
            speed: 30,
            delay: 500,
            cursor: '',
            cursorSpeed: 400,
            onComplete: () => {
                // Show choices after narrative is complete
                displayChoices(narrative.choices);
            }
        });

        narrativeTypewriter.type(narrative.narrative);
    }

    // Function to hide all interactive elements
    function hideAllInteractions() {
        elements.choiceContainer.style.display = 'none';
        elements.swingMeterContainer.style.display = 'none';
    }

    // Function to display choices
    function displayChoices(choices) {
        if (!choices || !elements.choiceContainer) {
            console.error('No choices or container found');
            return;
        }

        // Clear existing choices
        elements.choiceContainer.innerHTML = '';

        // Create a card for each choice
        choices.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = `card ${choice.decisionType || 'neutral'}`;

            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = choice.title || `Option ${index + 1}`;

            const content = document.createElement('div');
            content.className = 'card-content';
            content.textContent = choice.text;

            // Add choice data to the card
            choice.index = index;
            choice.type = choice.decisionType;

            // Add event listener for clicking the card
            card.addEventListener('click', () => handleCardSelection(choice));

            // Add ripple effect
            card.addEventListener('touchstart', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;

                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';

                card.appendChild(ripple);

                setTimeout(() => ripple.remove(), 1000);
            });

            card.appendChild(title);
            card.appendChild(content);
            elements.choiceContainer.appendChild(card);
        });

        // Show the choices container
        elements.choiceContainer.style.display = 'flex';
    }


    // This ensures the rhythm label and difficulty meters are properly created and displayed
    function handleCardSelection(choice) {
        if (!choice) {
            console.error('No choice provided to handle selection');
            return;
        }

        console.log('Choice selected:', choice);

        // Hide the choice container
        elements.choiceContainer.style.display = 'none';

        // Show the swing meter container
        elements.swingMeterContainer.style.display = 'block';

        // Update the choice description
        if (elements.choiceDescription) {
            elements.choiceDescription.textContent = choice.meterContext || choice.text;
        }

        // Set the border color based on decision type
        if (elements.swingMeterContainer) {
            const type = choice.decisionType || choice.type || 'neutral';

            // Reset classes
            elements.swingMeterContainer.classList.remove('soul', 'connections', 'success', 'fail');

            // Add appropriate class
            elements.swingMeterContainer.classList.add(type);
        }

        // Store the selected choice
        currentSelectedChoice = choice;
        currentCard = choice;

        // Refresh the swing meter
        SwingMeter.reset();

        // Create the rhythm label if it doesn't exist
        if (!elements.rhythmLabel || !document.contains(elements.rhythmLabel)) {
            const rhythmLabel = document.createElement('div');
            rhythmLabel.className = 'rhythm-label';
            rhythmLabel.textContent = 'INNER RHYTHM';
            elements.swingMeterContainer.insertBefore(rhythmLabel, elements.swingMeterContainer.firstChild);
            elements.rhythmLabel = rhythmLabel;
        }

        // Ensure the rhythm label is visible
        if (elements.rhythmLabel) {
            elements.rhythmLabel.style.display = 'flex';
        }

        // Create the difficulty meters if they don't exist
        if (!elements.difficultyMeters || !document.contains(elements.difficultyMeters)) {
            const difficultyMeters = document.createElement('div');
            difficultyMeters.className = 'difficulty-meters';

            // Tempo meter
            const tempoContainer = document.createElement('div');
            tempoContainer.className = 'meter-container';

            const tempoLabel = document.createElement('div');
            tempoLabel.className = 'meter-label';
            tempoLabel.textContent = 'TEMPO';

            const tempoMeter = document.createElement('div');
            tempoMeter.className = 'difficulty-meter tempo-meter';

            const tempoValue = document.createElement('div');
            tempoValue.className = 'meter-value';
            tempoValue.style.width = `${(SwingMeter.speedModifier - 0.5) / 2 * 100}%`;

            tempoMeter.appendChild(tempoValue);
            tempoContainer.appendChild(tempoLabel);
            tempoContainer.appendChild(tempoMeter);

            // Precision meter
            const precisionContainer = document.createElement('div');
            precisionContainer.className = 'meter-container';

            const precisionLabel = document.createElement('div');
            precisionLabel.className = 'meter-label';
            precisionLabel.textContent = 'PRECISION';

            const precisionMeter = document.createElement('div');
            precisionMeter.className = 'difficulty-meter precision-meter';

            const precisionValue = document.createElement('div');
            precisionValue.className = 'meter-value';
            precisionValue.style.width = `${(SwingMeter.widthModifier - 0.4) / 1.1 * 100}%`;

            precisionMeter.appendChild(precisionValue);
            precisionContainer.appendChild(precisionLabel);
            precisionContainer.appendChild(precisionMeter);

            difficultyMeters.appendChild(tempoContainer);
            difficultyMeters.appendChild(precisionContainer);

            // Add the difficulty meters after the swing meter
            const swingMeter = elements.swingMeterContainer.querySelector('.swing-meter');
            if (swingMeter && swingMeter.nextElementSibling) {
                elements.swingMeterContainer.insertBefore(difficultyMeters, swingMeter.nextElementSibling);
            } else {
                elements.swingMeterContainer.appendChild(difficultyMeters);
            }

            elements.difficultyMeters = difficultyMeters;
        }

        // Ensure the difficulty meters are visible
        if (elements.difficultyMeters) {
            elements.difficultyMeters.style.display = 'flex';
        }

        // Update meter zone colors
        updateMeterZoneColors(choice.decisionType || choice.type || 'neutral');

        // Make sure the swing meter container is clickable
        elements.swingMeterContainer.onclick = stopSwingMeter;

        // Start the swing meter
        startSwingMeter();
    }

    // Update meter zone colors based on decision type
    function updateMeterZoneColors(decisionType) {
        // Get the good zone
        const goodZone = document.querySelector('.meter-zone.good');
        if (!goodZone) {
            console.error('Good meter zone not found');
            return;
        }

        // Set colors based on decision type
        switch (decisionType) {
            case 'soul':
                goodZone.style.backgroundColor = '#2A66C9'; // Blue for soul
                break;
            case 'connections':
                goodZone.style.backgroundColor = '#7D3CCF'; // Violet for connections
                break;
            case 'success':
                goodZone.style.backgroundColor = '#1F6F50'; // Green for success
                break;
            default:
                goodZone.style.backgroundColor = '#2ecc71'; // Default green
        }
    }

    // Start the swing meter
    function startSwingMeter() {
        console.log('Starting swing meter');

        // Make sure the meter is reset and ready
        SwingMeter.reset();

        // Start the animation
        SwingMeter.start();
    }

    // Stop the swing meter
    function stopSwingMeter() {
        console.log('Stopping swing meter');

        // Remove click handler to prevent multiple clicks
        elements.swingMeterContainer.onclick = null;

        // Stop the animation and get the result
        const result = SwingMeter.stop();

        // Update the indicator bar color based on result
        const indicatorBar = document.querySelector('.meter-indicator-bar');
        if (indicatorBar) {
            indicatorBar.style.backgroundColor = result === 'good' ? '#2ecc71' : '#e74c3c';
        }

        // Show the result
        showSwingMeterResult(result);
    }

    // Modified showSwingMeterResult function in script.js
    function showSwingMeterResult(result) {
        // Hide the tap button and instruction only
        if (elements.tapButton) elements.tapButton.style.display = 'none';
        if (elements.tapInstruction) elements.tapInstruction.style.display = 'none';

        // Hide the swing meter but keep the rhythm label and difficulty meters visible
        // until after the result text has been displayed
        if (elements.swingMeter) elements.swingMeter.style.display = 'none';

        // Get the result text
        let resultText = '';
        if (currentSelectedChoice) {
            if (result === 'good') {
                resultText = currentSelectedChoice.resultGood || "You executed this perfectly!";
            } else {
                resultText = currentSelectedChoice.resultFail || "You struggled with this task.";
            }
        } else {
            resultText = result === 'good' ? "You executed this perfectly!" : "You struggled with this task.";
        }

        console.log('Result text:', resultText);

        // Create result container
        const resultContainer = document.createElement('div');
        resultContainer.className = `meter-result-container ${currentSelectedChoice.type || 'neutral'}`;

        if (result === 'fail') {
            resultContainer.classList.add('fail');
        }

        // Create result text element
        const resultTextElement = document.createElement('div');
        resultTextElement.className = 'meter-result-text';
        resultContainer.appendChild(resultTextElement);

        // Add the result container to the swing meter container
        elements.swingMeterContainer.appendChild(resultContainer);

        // Show the result container
        resultContainer.classList.add('visible');

        // Now hide the rhythm label and difficulty meters since we're showing the result
        if (elements.difficultyMeters) elements.difficultyMeters.style.display = 'none';
        if (elements.rhythmLabel) elements.rhythmLabel.style.display = 'none';

        // Use typewriter effect for the result text
        resultTypewriter = new Typewriter(resultTextElement, {
            text: resultText,
            speed: 30,
            delay: 500,
            cursor: '|',
            cursorSpeed: 400,
            onComplete: () => {
                // Add the next stop button after completion
                const nextButton = addNextStopButton(result, resultContainer);
                currentNextButton = nextButton;
            }
        });

        // Start typing the result
        resultTypewriter.type();

        // Add click event to skip typing
        resultTextElement.addEventListener('click', function () {
            if (resultTypewriter && resultTypewriter.isTyping) {
                resultTypewriter.skip();
            }
        });
    }

    // Add the Next Stop button
    function addNextStopButton(result, resultContainer) {
        // Create the button (hidden but keep for compatibility)
        const nextButton = document.createElement('button');
        nextButton.className = 'next-stop-button';
        nextButton.textContent = 'Next Stop';
        nextButton.style.display = 'none';
        resultContainer.appendChild(nextButton);

        // Add instruction text
        const nextInstruction = document.createElement('div');
        nextInstruction.className = 'next-instruction';
        nextInstruction.textContent = 'Tap to continue';
        resultContainer.appendChild(nextInstruction);

        // Make the entire result container clickable
        resultContainer.style.cursor = 'pointer';

        // Add click handler to container
        resultContainer.addEventListener('click', function (e) {
            // Skip typing if still in progress
            if (resultTypewriter && resultTypewriter.isTyping) {
                resultTypewriter.skip();
                return;
            }

            // Process the result
            processSwingMeterResult(result);
        });

        return nextButton;
    }

    // Process the swing meter result
    function processSwingMeterResult(result) {
        console.log('Processing swing meter result:', result);

        try {
            // Determine if the swing meter was successful
            const success = result === 'good';

            // Get the narrative type from the selected choice
            const narrativeType = currentSelectedChoice.type || 'neutral';

            // Track the decision in the achievement system
            if (game.achievementSystem) {
                game.achievementSystem.trackDecision(game.logicalStop, narrativeType, success);
            }

            // Call the game's handleSwingMeter method
            const gameResult = game.handleSwingMeter(success, narrativeType);

            // If successful, adjust difficulty
            if (success) {
                SwingMeter.adjustDifficulty(narrativeType);
            }

            // Update the journey track
            updateJourneyTrack();

            // Hide the swing meter container
            elements.swingMeterContainer.style.display = 'none';

            // Check if game is over
            if (gameResult && gameResult.gameOver) {
                showGameOver(gameResult.reason === 'success');
                return;
            }

            // Remove any existing result containers
            const resultContainers = document.querySelectorAll('.meter-result-container');
            resultContainers.forEach(container => {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            });

            // Fully reset the swing meter
            SwingMeter.reset();

            // Get and display next narrative
            const nextNarrative = game.getCurrentNarrative();
            if (nextNarrative) {
                displayNarrative(nextNarrative);
            } else {
                console.error('No next narrative found');
            }
        } catch (error) {
            console.error('Error processing swing meter result:', error);
        }
    }

    // Update the journey track
    function updateJourneyTrack(isGameOver = false) {
        console.log(`Updating ${isGameOver ? 'game over' : 'normal'} journey track`);

        const trackElement = isGameOver ? elements.gameOverJourneyTrack : elements.journeyTrack;
        if (!trackElement) {
            console.error('Journey track element not found');
            return;
        }

        // Clear the track
        trackElement.innerHTML = '';

        // Get the total number of stops
        const totalStops = game.journeyManager.getTotalStops();
        if (!totalStops || totalStops <= 0) {
            console.warn('Invalid total stops:', totalStops);
            return;
        }

        // Create track line elements between stations
        for (let i = 1; i <= totalStops; i++) {
            // Add station
            const station = document.createElement('div');
            station.className = 'station';

            // Add track line before station (except for first station)
            if (i > 1 && isGameOver) {
                const trackLine = document.createElement('div');
                trackLine.className = 'track-line';
                trackElement.appendChild(trackLine);
            }

            // Add appropriate classes based on game state
            if (i === game.logicalStop) {
                station.classList.add('current');
            } else if (i < game.logicalStop) {
                station.classList.add('completed');

                // Find the decision for this station
                const decision = game.decisionHistory.find(d => Number(d.stop) === i);
                if (decision) {
                    if (!decision.success) {
                        station.classList.add('fail');
                    } else if (decision.narrativeType) {
                        station.classList.add(decision.narrativeType);
                    }
                }
            }

            trackElement.appendChild(station);
        }
    }

    // Show game over screen
    function showGameOver(success) {
        console.log('Showing game over screen, success:', success);

        // Force success to true if gameOverReason is "success"
        if (game.gameOverReason === "success") {
            success = true;
        }

        // Complete the playthrough in the achievement system
        let newlyUnlockedAchievements = [];
        if (game.achievementSystem) {
            newlyUnlockedAchievements = game.achievementSystem.completePlaythrough();
        }

        // Display the game over screen
        elements.gameOver.style.display = 'flex';

        // Set the title based on success
        if (elements.gameOverTitle) {
            elements.gameOverTitle.textContent = success ? "Journey's End" : "Journey Derailed";
        }

        // Set the ending type
        if (elements.endingType) {
            // Determine the dominant decision type
            let endingTypeClass = "mixed";

            if (success) {
                const counts = {
                    soul: game.decisionTypes.filter(type => type === "soul").length,
                    connections: game.decisionTypes.filter(type => type === "connections").length,
                    success: game.decisionTypes.filter(type => type === "success").length
                };

                if (counts.soul > counts.connections && counts.soul > counts.success) {
                    endingTypeClass = "soul";
                } else if (counts.connections > counts.soul && counts.connections > counts.success) {
                    endingTypeClass = "connections";
                } else if (counts.success > counts.soul && counts.success > counts.connections) {
                    endingTypeClass = "success";
                }
            } else {
                // For failures, determine dominant type
                const lastDecision = game.decisionHistory[game.decisionHistory.length - 1];
                if (lastDecision && lastDecision.narrativeType) {
                    endingTypeClass = lastDecision.narrativeType;
                }
            }

            // Set the ending type class
            elements.endingType.className = 'ending-type ' + endingTypeClass;

            // Get the ending type text from the game
            if (typeof game.getEndingType === 'function') {
                const endingTypeText = game.getEndingType(success);
                elements.endingType.textContent = endingTypeText;
            } else {
                // Default ending types
                if (success) {
                    switch (endingTypeClass) {
                        case "soul": elements.endingType.textContent = "AUTHENTIC SELF ENDING"; break;
                        case "connections": elements.endingType.textContent = "MEANINGFUL BONDS ENDING"; break;
                        case "success": elements.endingType.textContent = "PROFESSIONAL ACHIEVEMENT ENDING"; break;
                        default: elements.endingType.textContent = "BALANCED GROWTH ENDING";
                    }
                } else {
                    switch (endingTypeClass) {
                        case "soul": elements.endingType.textContent = "LOST AUTHENTICITY ENDING"; break;
                        case "connections": elements.endingType.textContent = "BROKEN BONDS ENDING"; break;
                        case "success": elements.endingType.textContent = "HOLLOW ACHIEVEMENTS ENDING"; break;
                        default: elements.endingType.textContent = "DIRECTIONLESS ENDING";
                    }
                }
            }
        }

        // Update the journey track
        updateJourneyTrack(true);

        // Get the game over message
        let gameOverMessage;
        try {
            gameOverMessage = game.getGameOverMessage(success);
        } catch (error) {
            console.error('Error getting game over message:', error);
            gameOverMessage = success ?
                "Your journey has changed you in subtle but significant ways. The corporate drone is gone, replaced by someone more aware, more alive." :
                "Your journey has come to an abrupt end. A moment's hesitation, a wrong choice, and everything changed.";
        }

        // Clear existing content
        elements.gameOverMessage.textContent = '';

        // Hide the restart button initially
        elements.restartButton.style.display = 'none';

        // Hide the view albums button initially
        if (elements.viewAlbumsButton) {
            elements.viewAlbumsButton.style.display = 'none';
        }

        // Use typewriter effect for the game over message
        gameOverTypewriter = new Typewriter(elements.gameOverMessage, {
            text: gameOverMessage,
            speed: 30,
            delay: 500,
            cursor: '',
            cursorSpeed: 400,
            onComplete: () => {
                // Show the restart button after completion
                elements.restartButton.style.display = 'block';
                elements.restartButton.classList.add('fade-in');

                // Show newly unlocked achievements
                displayNewAchievements(newlyUnlockedAchievements);
            }
        });

        // Start typing the game over message
        gameOverTypewriter.type();

        // Add click event to skip typing
        elements.gameOverMessage.addEventListener('click', function () {
            if (gameOverTypewriter && gameOverTypewriter.isTyping) {
                gameOverTypewriter.skip();
            }
        });

        // Make entire game over screen clickable
        elements.gameOver.addEventListener('click', function (e) {
            if (e.target === elements.gameOver) {
                if (gameOverTypewriter && gameOverTypewriter.isTyping) {
                    gameOverTypewriter.skip();
                } else if (elements.restartButton.style.display === 'block') {
                    resetGameState();
                }
            }
        });
    }

    // Display newly unlocked achievements
    function displayNewAchievements(achievementIds) {
        if (!game.achievementSystem || !achievementIds || achievementIds.length === 0) {
            return;
        }

        // Get the achievement elements
        const newAlbumsSection = elements.newAlbumsSection;
        const newAlbumsGrid = elements.newAlbumsGrid;
        const viewAlbumsButton = elements.viewAlbumsButton;

        if (!newAlbumsSection || !newAlbumsGrid || !viewAlbumsButton) {
            console.error('Achievement display elements not found');
            return;
        }

        // Clear any existing albums
        newAlbumsGrid.innerHTML = '';

        // Get the newly unlocked achievements
        const newlyUnlocked = game.achievementSystem.getNewlyUnlocked();

        // Create album elements for each achievement
        newlyUnlocked.forEach(achievement => {
            const album = document.createElement('div');
            album.className = 'album newly-unlocked';

            const albumCover = document.createElement('div');
            albumCover.className = `album-cover ${achievement.albumArt}`;
            albumCover.style.backgroundColor = achievement.albumColor;

            // Add shine effect
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

        // Show the achievements section and view button
        newAlbumsSection.style.display = 'block';
        viewAlbumsButton.style.display = 'block';
    }

    // Show the record collection screen
    function showRecordCollection() {
        console.log('Showing record collection');

        if (!game.achievementSystem) {
            console.error('Achievement system not initialized');
            return;
        }

        const recordCollection = document.getElementById('recordCollection');
        const albumCollectionGrid = document.getElementById('albumCollectionGrid');

        if (!recordCollection || !albumCollectionGrid) {
            console.error('Record collection elements not found');
            return;
        }

        // Display the record collection
        recordCollection.style.display = 'flex';

        // Add animation class
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
            tab.addEventListener('click', function () {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));

                // Add active class to clicked tab
                this.classList.add('active');

                // Get the category
                const category = this.getAttribute('data-category');

                // Filter and display achievements
                let filteredAchievements = allAchievements;
                if (category !== 'all') {
                    filteredAchievements = allAchievements.filter(a => a.category === category);
                }

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
        console.log('Hiding record collection');

        const recordCollection = document.getElementById('recordCollection');
        if (recordCollection) {
            // Remove the open class to trigger the closing animation
            recordCollection.classList.remove('open');

            // Hide the collection after animation completes
            setTimeout(() => {
                recordCollection.style.display = 'none';
            }, 300);
        }
    }

    // Display achievements in the collection grid
    function displayAchievementsInCollection(achievements, category) {
        console.log('Displaying achievements in collection for category:', category);

        const albumCollectionGrid = document.getElementById('albumCollectionGrid');
        if (!albumCollectionGrid) {
            console.error('Album collection grid not found');
            return;
        }

        // Clear existing albums
        albumCollectionGrid.innerHTML = '';

        // Filter achievements by category
        let filteredAchievements = achievements;
        if (category !== 'all') {
            filteredAchievements = achievements.filter(a => a.category === category);
        }

        // Sort achievements: unlocked first, then by ID
        filteredAchievements.sort((a, b) => {
            if (a.unlocked && !b.unlocked) return -1;
            if (!a.unlocked && b.unlocked) return 1;
            return a.id.localeCompare(b.id);
        });

        // Add each achievement as an album
        filteredAchievements.forEach(achievement => {
            const album = document.createElement('div');
            album.className = 'collection-album';

            // Add locked class if not unlocked
            if (!achievement.unlocked) {
                album.classList.add('locked-album');
            }

            const albumCover = document.createElement('div');
            albumCover.className = `collection-album-cover ${achievement.albumArt || 'circle'}`;
            albumCover.style.backgroundColor = achievement.albumColor || '#333';

            // Add shine effect
            const shine = document.createElement('div');
            shine.className = 'album-shine';
            albumCover.appendChild(shine);

            // Add unlocked badge if unlocked
            if (achievement.unlocked) {
                const badge = document.createElement('div');
                badge.className = 'unlocked-badge';
                badge.textContent = 'UNLOCKED';
                album.appendChild(badge);
            }

            album.appendChild(albumCover);

            // Album info
            const albumInfo = document.createElement('div');
            albumInfo.className = 'collection-album-info';

            const albumTitle = document.createElement('div');
            albumTitle.className = 'collection-album-title';
            albumTitle.textContent = achievement.unlocked ? achievement.title : '???';
            albumInfo.appendChild(albumTitle);

            const albumDescription = document.createElement('div');
            albumDescription.className = 'collection-album-description';
            albumDescription.textContent = achievement.unlocked ?
                achievement.description :
                'This album is locked. Keep playing to discover it.';
            albumInfo.appendChild(albumDescription);

            album.appendChild(albumInfo);
            albumCollectionGrid.appendChild(album);
        });
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

        // Hide the next button initially
        elements.nextRoundButton.style.display = 'none';
        elements.nextInstruction.style.display = 'block';

        // Get the round summary text
        const roundSummaryText = game.getRoundSummaryText();

        // Clear existing content
        elements.roundSummaryText.textContent = '';

        // Use typewriter effect for the round summary
        roundSummaryTypewriter = new Typewriter(elements.roundSummaryText, {
            text: roundSummaryText,
            speed: 30,
            delay: 500,
            cursor: '',
            cursorSpeed: 400,
            onComplete: () => {
                // Show the next round button after completion
                elements.nextRoundButton.style.display = 'block';
                elements.nextRoundButton.classList.add('fade-in');
            }
        });

        // Start typing the round summary
        roundSummaryTypewriter.type();

        // Add click event to skip typing
        elements.roundSummaryText.addEventListener('click', function () {
            if (roundSummaryTypewriter && roundSummaryTypewriter.isTyping) {
                roundSummaryTypewriter.skip();
            }
        });
    }

    // Hide round complete screen
    function hideRoundComplete() {
        console.log('Hiding round complete screen');

        elements.roundComplete.style.display = 'none';
        elements.nextRoundButton.classList.remove('fade-in');
        elements.nextInstruction.style.display = 'none';
    }

    // Start the next round
    function startNextRound() {
        console.log('Starting next round');

        // Start the next round in the game
        const result = game.startNextRound();

        // Clear any result containers
        const resultContainers = document.querySelectorAll('.meter-result-container');
        resultContainers.forEach(container => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });

        // Reset the swing meter
        SwingMeter.reset();

        // Hide all interaction elements
        hideAllInteractions();

        // Get the first narrative of the new round
        const nextNarrative = game.getCurrentNarrative();

        if (nextNarrative) {
            // Display the narrative
            displayNarrative(nextNarrative);
        } else {
            console.error('No narrative found for next round');
        }

        // Update UI
        updateJourneyTrack();
    }

    // Reset game state
    function resetGameState() {
        console.log('Resetting game state');
    
        // Reset initialization flag to allow proper re-initialization
        window.gameInitialized = false;
        
        // Hide all screens
        elements.gameOver.style.display = 'none';
        elements.roundComplete.style.display = 'none';
        elements.swingMeterContainer.style.display = 'none';

        // Reset typewriter instances
        if (narrativeTypewriter) narrativeTypewriter.stop();
        if (resultTypewriter) resultTypewriter.stop();
        if (gameOverTypewriter) gameOverTypewriter.stop();
        if (roundSummaryTypewriter) roundSummaryTypewriter.stop();

        // Reset swing meter
        SwingMeter.reset();
        SwingMeter.resetDifficultyModifiers();

        // Reset the game
        game.restart();

        // Reset achievement system if available
        if (game.achievementSystem) {
            game.achievementSystem.resetPlaythrough();
        }

        // Update the journey track
        updateJourneyTrack();

        // Get the first narrative
        const firstNarrative = game.getCurrentNarrative();
        if (firstNarrative) {
            displayNarrative(firstNarrative);
        } else {
            console.error('No initial narrative found after reset');
            // Try to reload the game
            initGame();
        }
    }

    // initGame()
    function initGame() {
        console.log('Initializing game');

        // Flag to track if we've already initialized
        if (window.gameInitialized) {
            console.log('Game already initialized, skipping duplicate initialization');
            return;
        }

        // Reset game state if needed
        if (game.gameOver || game.currentStop > 1) {
            game.restart();
        }

        // Initialize the game
        if (typeof game.initialize === 'function') {
            game.initialize().then(() => {
                // Set initialization flag
                window.gameInitialized = true;

                // Once initialized, display the first narrative
                const firstNarrative = game.getCurrentNarrative();
                if (firstNarrative) {
                    displayNarrative(firstNarrative);
                    updateJourneyTrack();
                } else {
                    // Use fallback approach for first narrative
                    console.log('Trying fallback approach for first narrative');
                    if (game.narratives && game.narratives.length > 0) {
                        const actualStop = game.journeyManager.getActualStop(1);
                        const fallbackNarrative = game.narratives.find(n => n.stop === actualStop);
                        if (fallbackNarrative) {
                            game.currentNarrative = fallbackNarrative;
                            displayNarrative(fallbackNarrative);
                            updateJourneyTrack();
                        } else {
                            console.error('No suitable fallback narrative found');
                        }
                    } else {
                        console.error('Narratives are not loaded');
                    }
                }
            }).catch(error => {
                console.error('Error initializing game:', error);
            });
        } else {
            // Set initialization flag
            window.gameInitialized = true;

            // Fallback to simple initialization
            if (game.narratives && game.narratives.length > 0) {
                const firstNarrative = game.getCurrentNarrative() || game.narratives[0];
                if (firstNarrative) {
                    game.currentNarrative = firstNarrative;
                    displayNarrative(firstNarrative);
                    updateJourneyTrack();
                } else {
                    console.error('No initial narrative found');
                }
            } else {
                console.error('Narratives not loaded');
            }
        }
    }

    // Wait for game data to load before starting
    waitForGameData(game).then(() => {
        console.log('Game data loaded, initializing game');

        // Ensure UI elements are visible
        const header = document.querySelector('header');
        if (header) {
            header.style.display = 'flex';
        }

        const journeyTrackContainer = document.querySelector('.journey-track');
        if (journeyTrackContainer) {
            journeyTrackContainer.style.display = 'flex';
        }

        // Initialize the game
        initGame();
    }).catch(error => {
        console.error('Error loading game data:', error);
    });

    // Function to wait for game data to load
    async function waitForGameData(game) {
        return new Promise((resolve, reject) => {
            console.log('Waiting for game data to load');

            const maxAttempts = 50; // 5 seconds with 100ms interval
            let attempts = 0;

            const checkInterval = setInterval(() => {
                attempts++;

                // Check if narratives are loaded
                if (game.narratives && game.narratives.length > 0) {
                    clearInterval(checkInterval);
                    console.log('Game data loaded successfully after', attempts, 'attempts');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('Timeout waiting for game data'));
                }
            }, 100);
        });
    }
});