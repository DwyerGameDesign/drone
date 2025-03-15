// Drone Man: The Journey - Main script
import SwingMeter from './swing-meter.js';
import Typewriter from './typewriter.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded. Initializing game...');
    
    // Create game instance
    const game = new DroneManGame();
    window.gameInstance = game; // Make it globally accessible for swing meter
    
    // Initialize SwingMeter
    SwingMeter.init();
    
    // Initialize typewriter instances
    let narrativeTypewriter;
    let resultTypewriter;
    let gameOverTypewriter;
    let roundSummaryTypewriter;
    
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
    
    // Typewriter effect variables
    let isTyping = false;
    let skipTyping = false;
    const typingSpeed = 30; // ms per character
    
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
        
        // Store the selected choice with all necessary properties
        currentSelectedChoice = {
            text: choiceText,
            type: decisionType,
            index: choiceIndex,
            resultGood: choice && choice.resultGood ? choice.resultGood : "You executed this perfectly!",
            resultOkay: choice && choice.resultOkay ? choice.resultOkay : "You managed reasonably well.",
            resultFail: choice && choice.resultFail ? choice.resultFail : "You struggled with this task."
        };
        
        console.log('Current selected choice with results:', currentSelectedChoice);
        
        // Reset and start the swing meter
        SwingMeter.reset();
        SwingMeter.start();
        
        // Show the swing meter container
        elements.swingMeterContainer.style.display = 'block';
        
        // Set up the tap button
        if (elements.tapButton) {
            elements.tapButton.style.display = 'none';
            elements.tapInstruction.style.display = 'block';
        }
        
        // Make the entire container tappable
        elements.swingMeterContainer.onclick = () => {
            const result = SwingMeter.stop();
            showResult(result);
        };
    }
    
    // Update showResult function
    function showResult(result) {
        const resultContainer = document.createElement('div');
        resultContainer.className = 'meter-result-container';
        
        const resultTextElement = document.createElement('div');
        resultTextElement.className = 'meter-result-text';
        resultContainer.appendChild(resultTextElement);
        
        // Set result text based on the outcome
        let resultText = '';
        switch(result) {
            case 'good':
                resultText = 'Perfect timing! Your inner rhythm guides you true.';
                break;
            case 'poor':
                resultText = 'Not quite there, but you managed to keep going.';
                break;
            default:
                resultText = 'Your timing was off, but every mistake is a lesson.';
        }
        
        // Add the result container to the DOM
        elements.swingMeterContainer.appendChild(resultContainer);
        resultContainer.classList.add('visible');
        
        // Display the result text with typewriter effect
        displayResultText(resultText, resultTextElement);
        
        // Add the Next Stop button
        addNextStopButton(result, resultContainer);
    }
    
    // Update showGameOver function
    function showGameOver(success) {
        console.log('Showing game over screen, success:', success);
        console.log('Game state at game over:', {
            logicalStop: game.logicalStop,
            currentStop: game.currentStop,
            totalStops: game.journeyManager ? game.journeyManager.getTotalStops() : 'unknown',
            gameOverReason: game.gameOverReason,
            performanceScore: game.performanceScore,
            failureThreshold: game.failureThreshold,
            decisionHistory: game.decisionHistory ? game.decisionHistory.length : 0,
            decisionTypes: game.decisionTypes ? game.decisionTypes.length : 0
        });
        
        // Log the last decision for debugging
        if (game.decisionHistory && game.decisionHistory.length > 0) {
            const lastDecision = game.decisionHistory[game.decisionHistory.length - 1];
            console.log('Last decision:', lastDecision);
        } else {
            console.log('No decisions in history');
        }
        
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
            // Get the ending type class based on the dominant path
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
                // For failure endings, determine the dominant attempt pattern
                const soulAttempts = game.decisionHistory.filter(d => d.intendedType === "soul").length;
                const connectionsAttempts = game.decisionHistory.filter(d => d.intendedType === "connections").length;
                const successAttempts = game.decisionHistory.filter(d => d.intendedType === "success").length;
                
                if (soulAttempts > connectionsAttempts && soulAttempts > successAttempts) {
                    endingTypeClass = "soul";
                } else if (connectionsAttempts > soulAttempts && connectionsAttempts > successAttempts) {
                    endingTypeClass = "connections";
                } else if (successAttempts > soulAttempts && successAttempts > connectionsAttempts) {
                    endingTypeClass = "success";
                }
            }
            
            // Set the ending type class
            endingType.className = 'ending-type ' + endingTypeClass;
            
            // Get the ending type text from the game
            if (typeof game.getEndingType === 'function') {
                const endingTypeText = game.getEndingType(success);
                console.log('Ending type from game:', endingTypeText);
                
                // Use the ending type text
                endingType.textContent = endingTypeText;
            } else {
                // Fallback to hardcoded titles if getEndingType is not available
                if (success) {
                    switch (endingTypeClass) {
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
                    switch (endingTypeClass) {
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
        }
        
        // Update the journey track in the game over screen
        updateGameOverJourneyTrack();
        
        // Get the game over message
        let gameOverMessage;
        let endingTypeText;
        try {
            gameOverMessage = game.getGameOverMessage(success);
            console.log('Game over message:', gameOverMessage);
            
            // Get the ending type text from the game
            if (typeof game.getEndingType === 'function') {
                endingTypeText = game.getEndingType(success);
                console.log('Ending type from game:', endingTypeText);
                
                // Use the ending type text if available
                if (endingTypeText && endingType) {
                    endingType.textContent = endingTypeText;
                }
            }
        } catch (error) {
            console.error('Error getting game over message:', error);
            // Fallback message if there's an error
            gameOverMessage = success 
                ? "Your journey has changed you in subtle but significant ways. The corporate drone is gone, replaced by someone more aware, more alive."
                : "Your journey has come to an abrupt end. A moment's hesitation, a wrong choice, and everything changed.";
        }
        
        // Ensure we have a valid message
        if (!gameOverMessage) {
            console.warn('Game over message is empty or undefined, using fallback');
            gameOverMessage = success 
                ? "Your journey has changed you in subtle but significant ways. The corporate drone is gone, replaced by someone more aware, more alive."
                : "Your journey has come to an abrupt end. A moment's hesitation, a wrong choice, and everything changed.";
        }
        
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
        
        // Display the game over message with typewriter effect
        displayGameOverText(gameOverMessage, elements.gameOverMessage);
        
        // Make the entire game over screen tappable
        elements.gameOver.addEventListener('click', function(e) {
            if (e.target === elements.gameOver) {
                if (gameOverTypewriter && gameOverTypewriter.isTyping) {
                    gameOverTypewriter.skip();
                } else if (elements.restartButton.style.display === 'block') {
                    resetGameState();
                }
            }
        });
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
        
        // Display the round summary text with typewriter effect
        displayRoundSummaryText(roundSummaryText, elements.roundSummaryText);
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
        
        // Get the current narrative
        const currentNarrative = game.getCurrentNarrative();
        
        if (!currentNarrative) {
            console.error('No current narrative found');
            return;
        }
        
        console.log('Current narrative:', currentNarrative);
        
        // Display the current narrative
        displayNarrative(currentNarrative);
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
            
            const albumCover = document.createElement('div');
            albumCover.className = 'collection-album-cover ' + (achievement.shape || 'square');
            albumCover.style.backgroundColor = achievement.color || '#333';
            
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
            } else {
                album.classList.add('locked-album');
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
            albumDescription.textContent = achievement.unlocked ? achievement.description : 'This album is locked. Keep playing to discover it.';
            albumInfo.appendChild(albumDescription);
            
            album.appendChild(albumInfo);
            albumCollectionGrid.appendChild(album);
        });
    }

    // Update the journey track in the game over screen
    function updateGameOverJourneyTrack() {
        console.log('Updating game over journey track');
        
        // Use the gameOverJourneyTrack element
        const journeyTrack = document.getElementById('gameOverJourneyTrack');
        if (!journeyTrack) {
            console.error('Game over journey track element not found');
            return;
        }
        
        // Clear the track
        journeyTrack.innerHTML = '';
        
        // Get the total number of stops in the journey
        const totalStops = game.journeyManager.getTotalStops();
        console.log('Total stops for game over track:', totalStops);
        
        if (!totalStops || totalStops <= 0) {
            console.warn('Invalid total stops for game over track:', totalStops);
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
            
            // Find the decision for this logical stop
            const decision = game.decisionHistory.find(d => Number(d.stop) === i);
            
            if (decision) {
                // Add completed class
                station.classList.add('completed');
                
                // Check if the swing meter was successful
                if (decision.success === false) {
                    // If failed, add the fail class to show an X
                    station.classList.add('fail');
                } else if (decision.narrativeType) {
                    // If successful, add the decision type class for proper coloring
                    station.classList.add(decision.narrativeType);
                } else {
                    // Fallback to standard class if no narrative type
                    station.classList.add('standard');
                }
            }
            
            // Add current class if this is the current stop (for incomplete journeys)
            if (i === game.logicalStop && !game.gameOver) {
                station.classList.add('current');
            }
            
            journeyTrack.appendChild(station);
        }
        
        console.log('Game over journey track updated');
    }

    // Adjust swing meter difficulty based on player's choice
    function adjustDifficulty(narrativeType) {
        SwingMeter.adjustDifficulty(narrativeType);
    }

    // Update the difficulty meters in the UI
    function updateDifficultyMeters() {
        // Update tempo meter
        const tempoValue = document.querySelector('.tempo-meter .meter-value');
        if (tempoValue) {
            // Convert speedModifier to a percentage (0.5 to 2.5 range maps to 0-100%)
            const tempoPercentage = (speedModifier - 0.5) / 2 * 100;
            tempoValue.style.width = `${tempoPercentage}%`;
        }
        
        // Update precision meter
        const precisionValue = document.querySelector('.precision-meter .meter-value');
        if (precisionValue) {
            // Convert widthModifier to a percentage (0.4 to 1.5 range maps to 0-100%)
            const precisionPercentage = (widthModifier - 0.4) / 1.1 * 100;
            precisionValue.style.width = `${precisionPercentage}%`;
        }
    }

    // Reset game state
    function resetGameState() {
        console.log('Resetting game state...');
        
        // Reset difficulty modifiers
        resetDifficultyModifiers();
        
        // Reset game state
        game.reset();
        
        // Reset achievement system for new playthrough
        if (game.achievementSystem) {
            console.log('Resetting achievement system for new playthrough...');
            game.achievementSystem.resetPlaythrough();
        }
        
        // Explicitly ensure we're at stop 1 and performance score is 0
        if (game.logicalStop !== 0 || game.performanceScore !== 0) {
            console.warn('Game did not reset properly, forcing reset...');
            console.warn('Current logical stop:', game.logicalStop, 'Performance score:', game.performanceScore);
            
            game.currentStop = 1;
            game.logicalStop = 0; // Changed from 1 to 0 to match game.js constructor
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
        
        // Reset typewriter instances
        if (narrativeTypewriter) narrativeTypewriter.stop();
        if (resultTypewriter) resultTypewriter.stop();
        if (gameOverTypewriter) gameOverTypewriter.stop();
        if (roundSummaryTypewriter) roundSummaryTypewriter.stop();
        
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
                game.logicalStop = 0; // Changed from 1 to 0
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

    // Function to display narrative text with typewriter effect
    function displayNarrativeText(text, element) {
        if (!narrativeTypewriter) {
            narrativeTypewriter = new Typewriter(element, {
                speed: 30,
                delay: 500,
                cursor: '|',
                cursorSpeed: 400,
                onComplete: () => {
                    // Show choices after narrative is complete
                    elements.choiceContainer.style.display = 'flex';
                }
            });
        }
        narrativeTypewriter.type(text);
    }

    // Function to display result text with typewriter effect
    function displayResultText(text, element) {
        if (!resultTypewriter) {
            resultTypewriter = new Typewriter(element, {
                speed: 30,
                delay: 500,
                cursor: '|',
                cursorSpeed: 400,
                onComplete: () => {
                    // Add the Next Stop button after result is complete
                    addNextStopButton(result, resultContainer);
                }
            });
        }
        resultTypewriter.type(text);
    }

    // Function to display game over text with typewriter effect
    function displayGameOverText(text, element) {
        if (!gameOverTypewriter) {
            gameOverTypewriter = new Typewriter(element, {
                speed: 30,
                delay: 500,
                cursor: '|',
                cursorSpeed: 400,
                onComplete: () => {
                    // Show the restart button and achievements after message is complete
                    elements.restartButton.style.display = 'block';
                    elements.restartButton.classList.add('fade-in');
                    displayNewAchievements(newlyUnlockedAchievements);
                }
            });
        }
        gameOverTypewriter.type(text);
    }

    // Function to display round summary text with typewriter effect
    function displayRoundSummaryText(text, element) {
        if (!roundSummaryTypewriter) {
            roundSummaryTypewriter = new Typewriter(element, {
                speed: 30,
                delay: 500,
                cursor: '|',
                cursorSpeed: 400,
                onComplete: () => {
                    // Show the next round button after summary is complete
                    elements.nextRoundButton.style.display = 'block';
                    elements.nextRoundButton.classList.add('fade-in');
                }
            });
        }
        roundSummaryTypewriter.type(text);
    }

    // Update click handlers to use Typewriter methods
    function handleTextClick(element, typewriter) {
        if (typewriter && typewriter.isTyping) {
            typewriter.skip();
        }
    }

    // Update the game over screen click handler
    elements.gameOver.addEventListener('click', function(e) {
        if (e.target === elements.gameOver) {
            if (gameOverTypewriter && gameOverTypewriter.isTyping) {
                gameOverTypewriter.skip();
            } else if (elements.restartButton.style.display === 'block') {
                resetGameState();
            }
        }
    });

    // Update the result container click handler
    function addNextStopButton(result, resultContainer) {
        // ... existing code ...

        // Add click handler to skip typing
        resultContainer.addEventListener('click', function(e) {
            if (e.target === resultContainer || 
                e.target.classList.contains('meter-result-text') || 
                (currentNextButton && !currentNextButton.contains(e.target))) {
                
                if (resultTypewriter && resultTypewriter.isTyping) {
                    resultTypewriter.skip();
                    return;
                }
                
                // ... rest of the existing click handler code ...
            }
        });
    }

    // ... rest of the existing code ...
});