document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const gameState = {
        day: 1,
        weekday: 'Monday',
        soul: 50,
        money: 50,
        energy: 50,
        status: 20,
        progressToEscape: 0,
        achievements: [],
        endings: [],
        pathToEscape: null,
        specialEvents: [],
        pastChoices: [],
        multiEventCounter: 0,
        albumUnlocks: [],
        character: {
            name: "Drone #" + Math.floor(Math.random() * 10000),
            department: ["Marketing", "Finance", "IT", "HR", "R&D", "Customer Support"][Math.floor(Math.random() * 6)],
            hobby: ["music", "writing", "painting", "gaming", "hiking", "cooking"][Math.floor(Math.random() * 6)],
            trait: ["anxious", "ambitious", "creative", "meticulous", "friendly", "antisocial"][Math.floor(Math.random() * 6)]
        }
    };
    
    // Album References
    const albumReferences = [
        { track: "Drone", theme: "commuter train reflection" },
        { track: "Write Along The Way", theme: "optimism and blissful ignorance" },
        { track: "Last Life", theme: "video game addiction" },
        { track: "Strange Passenger", theme: "unexpected relationships" },
        { track: "For Me", theme: "greed and materialism" },
        { track: "Bioavailable", theme: "addiction to adrenaline" },
        { track: "Life Between Life", theme: "tuning into self" },
        { track: "Squares", theme: "work from home isolation" },
        { track: "Star Light", theme: "insomnia" },
        { track: "Sick of Home", theme: "seeing patterns and stagnation" },
        { track: "Contact High", theme: "fresh start" },
        { track: "The Feel", theme: "resolution and reflection" }
    ];

    // Victory scenarios
    const victories = {
        resistance_victory: {
            title: "The Whistleblower",
            message: "With your help, the Anti-Hive Resistance exposes The Hive's unethical practices to the public. The resulting scandal forces major reforms throughout the corporation. Though you lose your job in the upheaval, you find purpose in advocating for workplace rights and helping others escape the drone life. Your soul is free, and your conscience is clear."
        },
        artist_victory: {
            title: "The Creator",
            message: "You bid farewell to The Hive and embrace the uncertainty of creative life. As you clean out your desk, your colleagues look on with a mixture of envy and admiration. Some think you're making a mistake, but in your heart, you know you're finally being true to yourself. Your art becomes your voice, and though the path isn't easy, each day brings authentic joy that the Hive could never provide."
        },
        music_victory: {
            title: "The Sonic Rebel",
            message: "Your band practices grow into small gigs, then larger shows. The music you create channels all your frustration with corporate life into something beautiful and raw. When your band gets offered a small tour, you finally hand in your resignation. As you walk out of The Hive for the last time, the weight of conformity lifts from your shoulders. On stage that night, you feel truly alive for the first time in years."
        }
    };
    
    // DOM elements
    const soulValue = document.getElementById('soul-value');
    const moneyValue = document.getElementById('money-value');
    const energyValue = document.getElementById('energy-value');
    const statusValue = document.getElementById('status-value');
    const soulFill = document.getElementById('soul-fill');
    const moneyFill = document.getElementById('money-fill');
    const energyFill = document.getElementById('energy-fill');
    const statusFill = document.getElementById('status-fill');
    const dayCounter = document.getElementById('day-counter');
    const eventText = document.getElementById('event-text');
    const choicesContainer = document.getElementById('choices-container');
    const gameOverScreen = document.getElementById('game-over');
    const gameOverTitle = document.getElementById('game-over-title');
    const gameOverText = document.getElementById('game-over-text');
    const restartBtn = document.getElementById('restart-btn');
    const progressFill = document.getElementById('progress-fill');
    const progressLabel = document.getElementById('progress-label');
    const achievement = document.getElementById('achievement');
    const achievementText = document.getElementById('achievement-text');
    const notification = document.getElementById('notification');
    const albumTrack = document.getElementById('album-track');
    const albumTheme = document.getElementById('album-theme');
    const pathIndicator = document.getElementById('path-indicator');
    const pathName = document.getElementById('path-name');
    
    // Helper functions
    function updateMeters() {
        soulValue.textContent = `${gameState.soul}%`;
        moneyValue.textContent = `${gameState.money}%`;
        energyValue.textContent = `${gameState.energy}%`;
        statusValue.textContent = `${gameState.status}%`;
        
        soulFill.style.width = `${gameState.soul}%`;
        moneyFill.style.width = `${gameState.money}%`;
        energyFill.style.width = `${gameState.energy}%`;
        statusFill.style.width = `${gameState.status}%`;
        
        // Update colors based on values
        if (gameState.soul < 25) soulFill.style.backgroundColor = '#6a0080';
        else if (gameState.soul > 75) soulFill.style.backgroundColor = '#ce93d8';
        else soulFill.style.backgroundColor = '#9c27b0';
        
        if (gameState.money < 25) moneyFill.style.backgroundColor = '#2e7d32';
        else if (gameState.money > 75) moneyFill.style.backgroundColor = '#81c784';
        else moneyFill.style.backgroundColor = '#4caf50';
        
        if (gameState.energy < 25) energyFill.style.backgroundColor = '#c62828';
        else if (gameState.energy > 75) energyFill.style.backgroundColor = '#ef9a9a';
        else energyFill.style.backgroundColor = '#f44336';
        
        if (gameState.status < 25) statusFill.style.backgroundColor = '#0d47a1';
        else if (gameState.status > 75) statusFill.style.backgroundColor = '#64b5f6';
        else statusFill.style.backgroundColor = '#2196f3';
    }
    
    function updateDayCounter() {
        // Update weekday
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        gameState.weekday = weekdays[(gameState.day - 1) % 7];
        dayCounter.textContent = `Day ${gameState.day} - ${gameState.weekday}`;
    }
    
    function updateProgress() {
        progressFill.style.width = `${gameState.progressToEscape}%`;
        
        if (gameState.progressToEscape < 20) {
            progressLabel.textContent = `Drone Life: ${gameState.progressToEscape}% - Orientation Phase`;
        } else if (gameState.progressToEscape < 40) {
            progressLabel.textContent = `Drone Life: ${gameState.progressToEscape}% - Indoctrination Phase`;
        } else if (gameState.progressToEscape < 60) {
            progressLabel.textContent = `Drone Life: ${gameState.progressToEscape}% - Disillusionment Phase`;
        } else if (gameState.progressToEscape < 80) {
            progressLabel.textContent = `Drone Life: ${gameState.progressToEscape}% - Awakening Phase`;
        } else {
            progressLabel.textContent = `Drone Life: ${gameState.progressToEscape}% - Liberation Phase`;
        }
        
        // Update album reference based on progress
        updateAlbumReference();
        
        // Update escape path indicator
        if (gameState.pathToEscape) {
            pathIndicator.style.display = 'block';
            pathName.textContent = gameState.pathToEscape.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }
    
    function updateAlbumReference() {
        let trackIndex;
        
        if (gameState.progressToEscape < 10) {
            trackIndex = 0; // Drone
        } else if (gameState.progressToEscape < 20) {
            trackIndex = 1; // Write Along the Way
        } else if (gameState.progressToEscape < 30) {
            trackIndex = 2; // Last Life
        } else if (gameState.progressToEscape < 40) {
            trackIndex = 3; // Strange Passenger
        } else if (gameState.progressToEscape < 50) {
            trackIndex = 4; // For Me
        } else if (gameState.progressToEscape < 60) {
            trackIndex = 5; // Bioavailable
        } else if (gameState.progressToEscape < 70) {
            trackIndex = 6; // Life Between Life
        } else if (gameState.progressToEscape < 80) {
            trackIndex = 7; // Squares
        } else if (gameState.progressToEscape < 90) {
            trackIndex = 8; // Star Light
        } else if (gameState.progressToEscape < 95) {
            trackIndex = 9; // Sick of Home
        } else if (gameState.progressToEscape < 99) {
            trackIndex = 10; // Contact High
        } else {
            trackIndex = 11; // The Feel
        }
        
        albumTrack.textContent = `"${albumReferences[trackIndex].track}"`;
        albumTheme.textContent = albumReferences[trackIndex].theme;
    }
    
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('reveal');
        
        setTimeout(() => {
            notification.classList.remove('reveal');
        }, 3000);
    }
    
    function checkGameOver() {
        if (gameState.soul <= 0) {
            return {
                title: "Soul Crushed",
                message: "Your soul has been completely crushed by corporate monotony. You've become the perfect drone - efficient, obedient, and utterly empty inside. You'll continue to work at The Hive until retirement, never once questioning your purpose or seeking something more."
            };
        } else if (gameState.money <= 0) {
            return {
                title: "Bankrupt",
                message: "You've run out of money and can no longer afford basic necessities. Management views financial instability as a reflection of poor decision-making skills. Your position at The Hive has been terminated effective immediately."
            };
        } else if (gameState.energy <= 0) {
            return {
                title: "Burned Out",
                message: "Your body and mind have completely shut down from exhaustion. You've been placed on mandatory medical leave. The Hive has already replaced you with someone younger and more energetic. Your employee ID has been deactivated."
            };
        } else if (gameState.status <= 0) {
            return {
                title: "Terminated",
                message: "Your performance and attitude have been deemed incompatible with The Hive's corporate culture. Your access card has been deactivated, and security is waiting to escort you from the building. Your personal items will be mailed to you after thorough inspection."
            };
        } else if (gameState.status >= 100) {
            return {
                title: "Perfect Assimilation",
                message: "Congratulations! You've become the model Hive employee. You've been promoted to middle management, where you'll spend the next 30 years enforcing policies you don't understand for reasons you don't question. Your family barely recognizes you anymore, but your quarterly performance reviews are excellent!"
            };
        }
        
        return null;
    }
    
    function endGame(endingInfo) {
        gameOverTitle.textContent = endingInfo.title;
        gameOverText.textContent = endingInfo.message;
        gameOverScreen.style.display = 'block';
        document.querySelector('.container:not(.game-over)').style.display = 'none';
    }
    
    function showAchievement(text) {
        achievementText.textContent = text;
        achievement.style.display = 'block';
        
        setTimeout(() => {
            achievement.style.display = 'none';
        }, 5000);
        
        showNotification("Achievement Unlocked!");
    }
    
    // Function to make a choice
    function makeChoice(choice, event) {
        // Apply effects
        gameState.soul = Math.max(0, Math.min(100, gameState.soul + choice.effects.soul));
        gameState.money = Math.max(0, Math.min(100, gameState.money + choice.effects.money));
        gameState.energy = Math.max(0, Math.min(100, gameState.energy + choice.effects.energy));
        gameState.status = Math.max(0, Math.min(100, gameState.status + choice.effects.status));
        gameState.progressToEscape = Math.min(100, gameState.progressToEscape + choice.effects.progress);
        
        // Record choice
        gameState.pastChoices.push({
            day: gameState.day,
            event: event.text,
            choice: choice.text,
            effects: choice.effects
        });
        
        // Check for unlocks
        if (choice.unlock) {
            gameState.pathToEscape = choice.unlock;
            showAchievement(`You've unlocked the ${choice.unlock.replace('_', ' ')} escape route!`);
        }
        
        // Check for win condition
        if (choice.winPath) {
            gameState.winPath = choice.winPath;
            gameState.progressToEscape = 100;
        }
        
        // Check for achievements
        if (choice.achievement && !gameState.achievements.includes(choice.achievement)) {
            gameState.achievements.push(choice.achievement);
            showAchievement(choice.achievement);
        }
        
        // Check for special events
        if (event.id && !gameState.specialEvents.includes(event.id)) {
            gameState.specialEvents.push(event.id);
        }
        
        // Check for follow-up choices if present
        if (choice.followUp) {
            // Display follow-up text
            eventText.textContent = choice.followUp.text;
            
            // Display follow-up choices
            choicesContainer.innerHTML = '';
            choice.followUp.choices.forEach((followChoice) => {
                const li = document.createElement('li');
                li.classList.add('choice-item');
                
                const button = document.createElement('button');
                button.classList.add('choice-btn');
                button.textContent = followChoice.text;
                button.addEventListener('click', () => {
                    // Apply the follow-up effects in addition to original effects
                    gameState.soul = Math.max(0, Math.min(100, gameState.soul + followChoice.effects.soul));
                    gameState.money = Math.max(0, Math.min(100, gameState.money + followChoice.effects.money));
                    gameState.energy = Math.max(0, Math.min(100, gameState.energy + followChoice.effects.energy));
                    gameState.status = Math.max(0, Math.min(100, gameState.status + followChoice.effects.status));
                    gameState.progressToEscape = Math.min(100, gameState.progressToEscape + followChoice.effects.progress);
                    
                    // Record the follow-up choice
                    gameState.pastChoices.push({
                        day: gameState.day,
                        event: choice.followUp.text,
                        choice: followChoice.text,
                        effects: followChoice.effects
                    });
                    
                    // Check for follow-up unlocks and achievements
                    if (followChoice.unlock) {
                        gameState.pathToEscape = followChoice.unlock;
                        showAchievement(`You've unlocked the ${followChoice.unlock.replace('_', ' ')} escape route!`);
                    }
                    
                    if (followChoice.winPath) {
                        gameState.winPath = followChoice.winPath;
                        gameState.progressToEscape = 100;
                    }
                    
                    if (followChoice.achievement && !gameState.achievements.includes(followChoice.achievement)) {
                        gameState.achievements.push(followChoice.achievement);
                        showAchievement(followChoice.achievement);
                    }
                    
                    // Update UI and continue
                    updateMeters();
                    updateProgress();
                    
                    // Check if we should have multiple events in one day
                    gameState.multiEventCounter++;
                    
                    // 20% chance of having a second event on the same day if we haven't already had one
                    if (gameState.multiEventCounter === 1 && Math.random() < 0.2) {
                        // Update UI first
                        updateMeters();
                        updateProgress();
                        
                        // Then show a new event for the same day
                        setTimeout(() => {
                            showNotification("Later that day...");
                            nextDay();
                        }, 1500);
                    } else {
                        // Reset multi-event counter
                        gameState.multiEventCounter = 0;
                        
                        // Move to next day
                        gameState.day++;
                        updateDayCounter();
                        
                        // Next event
                        nextDay();
                    }
                });
                
                li.appendChild(button);
                choicesContainer.appendChild(li);
            });
            
            // No need to proceed to nextDay() here as we're waiting for follow-up choice
            updateMeters();
            updateProgress();
            return;
        }
        
        // Update UI
        updateMeters();
        updateProgress();
        
        // Check if we should have multiple events in one day
        gameState.multiEventCounter++;
        
        // 20% chance of having a second event on the same day if we haven't already had one
        if (gameState.multiEventCounter === 1 && Math.random() < 0.2) {
            // Update UI first
            updateMeters();
            updateProgress();
            
            // Then show a new event for the same day
            setTimeout(() => {
                showNotification("Later that day...");
                nextDay();
            }, 1500);
        } else {
            // Reset multi-event counter
            gameState.multiEventCounter = 0;
            
            // Move to next day
            gameState.day++;
            updateDayCounter();
            
            // Next event
            nextDay();
        }
    }
    
    function nextDay() {
        const gameOverInfo = checkGameOver();
        if (gameOverInfo) {
            endGame(gameOverInfo);
            return;
        }
        
        // Check for victory conditions
        if (gameState.progressToEscape >= 100) {
            const victoryType = gameState.winPath || 'resistance_victory';
            const victoryInfo = victories[victoryType];
            gameOverTitle.textContent = victoryInfo.title;
            gameOverText.textContent = victoryInfo.message;
            gameOverScreen.style.display = 'block';
            document.querySelector('.container:not(.game-over)').style.display = 'none';
            return;
        }
        
        // Load and process events
        loadEvents().then(events => {
            // For this demo, we'll use the sample events hard-coded below
            const sampleEvents = getSampleEvents();
            
            // Check for combined state events first (contextual events)
            let contextualEvent = null;
            
            // Example: If soul is low and energy is low, special exhaustion event
            if (gameState.soul < 30 && gameState.energy < 30 && gameState.day > 10) {
                contextualEvent = {
                    text: "You stare at your reflection in the bathroom mirror. Dark circles under your eyes, a vacant expression. You barely recognize yourself.",
                    choices: [
                        {
                            text: "Splash water on your face and get back to work",
                            effects: { soul: -5, money: +5, energy: -5, status: +5, progress: 2 }
                        },
                        {
                            text: "Call in sick and take a mental health day",
                            effects: { soul: +15, money: -5, energy: +20, status: -10, progress: 5 }
                        },
                        {
                            text: "Break down crying in the stall",
                            effects: { soul: +10, money: 0, energy: -10, status: -15, progress: 7 }
                        },
                        {
                            text: "Write a poem about your feelings on a sticky note",
                            effects: { soul: +20, money: 0, energy: +5, status: -5, progress: 8 }
                        }
                    ]
                };
            }
            
            // If status is high and soul is low, special conformity event
            else if (gameState.status > 70 && gameState.soul < 40 && gameState.day > 15) {
                contextualEvent = {
                    text: "Your manager congratulates you on your excellent performance and conformity to The Hive's culture. They hand you a framed photo of yourself to place on your desk - but your smile in the photo looks unnervingly artificial.",
                    choices: [
                        {
                            text: "Display it prominently on your desk",
                            effects: { soul: -15, money: +10, energy: -5, status: +15, progress: 3 }
                        },
                        {
                            text: "Place it face-down in your drawer",
                            effects: { soul: +15, money: -5, energy: +5, status: -20, progress: 10 }
                        },
                        {
                            text: "Add a small subversive detail to the frame",
                            effects: { soul: +20, money: 0, energy: -5, status: -10, progress: 8 }
                        },
                        {
                            text: "Accept it graciously but 'accidentally' break it later",
                            effects: { soul: +10, money: 0, energy: -5, status: -5, progress: 5 }
                        }
                    ]
                };
            }
            
            // Use contextual event if available, otherwise find a suitable event
            if (contextualEvent) {
                displayEvent(contextualEvent);
            } else {
                // Filter events based on conditions
                const possibleEvents = sampleEvents.filter(event => checkEventConditions(event, gameState));
                
                if (possibleEvents.length > 0) {
                    // Select a random event from possible events
                    const selectedEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
                    displayEvent(selectedEvent);
                } else {
                    // Fallback event if no suitable events found
                    const fallbackEvent = {
                        text: "Another ordinary day at The Hive Corporation. You go through the motions, feeling neither particularly good nor bad about it.",
                        choices: [
                            {
                                text: "Focus on your work",
                                effects: { soul: -5, money: +5, energy: -10, status: +5, progress: 2 }
                            },
                            {
                                text: "Daydream about life outside The Hive",
                                effects: { soul: +10, money: -5, energy: +5, status: -10, progress: 3 }
                            },
                            {
                                text: "Chat with coworkers",
                                effects: { soul: +5, money: 0, energy: -5, status: +5, progress: 1 }
                            },
                            {
                                text: "Listen to music discreetly while working",
                                effects: { soul: +15, money: 0, energy: +10, status: -10, progress: 4 }
                            }
                        ]
                    };
                    displayEvent(fallbackEvent);
                }
            }
        }).catch(error => {
            console.error("Error loading events:", error);
            // Fallback if event loading fails
            const emergencyEvent = {
                text: "You experience a strange glitch in the corporate matrix. For a moment, everything seems to freeze around you.",
                choices: [
                    {
                        text: "Shake it off and continue with your day",
                        effects: { soul: 0, money: 0, energy: 0, status: 0, progress: 1 }
                    },
                    {
                        text: "Take notice and look for other anomalies",
                        effects: { soul: +5, money: 0, energy: -5, status: -5, progress: 3 }
                    }
                ]
            };
            displayEvent(emergencyEvent);
        });
    }
    
    function displayEvent(event) {
        // Display event text
        eventText.textContent = event.text;
        
        // Display choices
        choicesContainer.innerHTML = '';
        event.choices.forEach(choice => {
            const li = document.createElement('li');
            li.classList.add('choice-item');
            
            const button = document.createElement('button');
            button.classList.add('choice-btn');
            button.textContent = choice.text;
            button.addEventListener('click', () => makeChoice(choice, event));
            
            li.appendChild(button);
            choicesContainer.appendChild(li);
        });
    }
    
    function checkEventConditions(event, state) {
        // If event has no condition, it can always happen
        if (!event.condition) return true;
        
        // Check day condition
        if (event.condition.day && event.condition.day !== state.day) {
            return false;
        }
        
        // Check weekday condition
        if (event.condition.weekday && !event.condition.weekday.includes(state.weekday)) {
            return false;
        }
        
        // Check soul condition
        if (event.condition.soul) {
            if (event.condition.soul.min && state.soul < event.condition.soul.min) return false;
            if (event.condition.soul.max && state.soul > event.condition.soul.max) return false;
        }
        
        // Check energy condition
        if (event.condition.energy) {
            if (event.condition.energy.min && state.energy < event.condition.energy.min) return false;
            if (event.condition.energy.max && state.energy > event.condition.energy.max) return false;
        }
        
        // Check status condition
        if (event.condition.status) {
            if (event.condition.status.min && state.status < event.condition.status.min) return false;
            if (event.condition.status.max && state.status > event.condition.status.max) return false;
        }
        
        // Check if event is one-time and has already happened
        if (event.condition.notTriggered && state.specialEvents.includes(event.id)) {
            return false;
        }
        
        // Check if player has unlocked a specific path
        if (event.condition.pathRequired && event.condition.pathRequired !== state.pathToEscape) {
            return false;
        }
        
        // All conditions met
        return true;
    }
    
    // Function to load events - in a full implementation, this would fetch from a JSON file
    async function loadEvents() {
        // In a real implementation, this would fetch from a JSON file:
        // const response = await fetch('data/events.json');
        // return await response.json();
        
        // For this demo, we'll just return an empty array and use the hardcoded events
        return [];
    }
    
    // Sample events for demonstration
    function getSampleEvents() {
        return [
            // First day orientation
            {
                id: "orientation_day",
                text: "It's your first day at The Hive! Your supervisor explains that all new employees must complete mandatory orientation training.",
                condition: {
                    day: 1
                },
                choices: [
                    {
                        text: "Pay close attention and take detailed notes",
                        effects: { soul: -5, money: 0, energy: -10, status: +10, progress: 3 },
                        followUp: {
                            text: "Your supervisor notices your attentiveness and approaches you after the training.",
                            choices: [
                                {
                                    text: "Share your ideas for process improvements",
                                    effects: { soul: +5, money: 0, energy: -5, status: +5, progress: 2 }
                                },
                                {
                                    text: "Ask about career advancement opportunities",
                                    effects: { soul: -5, money: +5, energy: -5, status: +10, progress: 3 }
                                },
                                {
                                    text: "Keep the conversation brief and professional",
                                    effects: { soul: 0, money: 0, energy: +5, status: +5, progress: 1 }
                                },
                                {
                                    text: "Mention that you play an instrument in your free time",
                                    effects: { soul: +10, money: 0, energy: -5, status: -5, progress: 4 }
                                }
                            ]
                        }
                    },
                    {
                        text: "Zone out and think about your weekend plans",
                        effects: { soul: +5, money: 0, energy: +5, status: -5, progress: 3 }
                    },
                    {
                        text: "Ask insightful questions to impress management",
                        effects: { soul: -5, money: 0, energy: -15, status: +15, progress: 3 }
                    },
                    {
                        text: "Maintain a balanced approach - attentive but not overeager",
                        effects: { soul: 0, money: 0, energy: -5, status: +5, progress: 2 }
                    }
                ]
            },
            
            // Cafeteria lunch options
            {
                id: "cafeteria_lunch",
                text: "The office cafeteria offers several lunch options.",
                condition: {
                    day: 2
                },
                choices: [
                    {
                        text: "Buy the expensive 'Productivity Boost' meal deal",
                        effects: { soul: -5, money: -10, energy: +15, status: +5, progress: 2 }
                    },
                    {
                        text: "Bring lunch from home",
                        effects: { soul: +5, money: +5, energy: +10, status: -5, progress: 2 }
                    },
                    {
                        text: "Skip lunch to finish your assignments",
                        effects: { soul: -10, money: +5, energy: -15, status: +10, progress: 2 }
                    },
                    {
                        text: "Invite a colleague to go to a nearby restaurant",
                        effects: { soul: +10, money: -15, energy: +5, status: +5, progress: 3 }
                    }
                ]
            },
            
            // Weekend relaxation
            {
                id: "weekend_options",
                text: "It's the weekend! You have some free time to yourself.",
                condition: {
                    weekday: ["Saturday", "Sunday"]
                },
                choices: [
                    {
                        text: "Catch up on sleep and relax at home",
                        effects: { soul: +10, money: +5, energy: +25, status: 0, progress: 1 }
                    },
                    {
                        text: "Go out with friends and spend money",
                        effects: { soul: +15, money: -15, energy: -5, status: +5, progress: 1 }
                    },
                    {
                        text: "Work on personal projects related to your hobby",
                        effects: { soul: +20, money: 0, energy: +5, status: -5, progress: 1 }
                    },
                    {
                        text: "Check work emails and prepare for the week ahead",
                        effects: { soul: -15, money: +5, energy: -10, status: +15, progress: 2 }
                    }
                ]
            },
            
            // Commuter train reflection
            {
                id: "commuter_train",
                text: "Every morning, the same commute. Today as you ride the train to The Hive, you stare out the window and feel a strange dissociation.",
                condition: {
                    weekday: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    day: { min: 5 },
                    notTriggered: true
                },
                choices: [
                    {
                        text: "Put in earbuds and listen to music",
                        effects: { soul: +15, money: 0, energy: +5, status: -5, progress: 4 },
                        followUp: {
                            text: "The music awakens something in you. One song in particular speaks to your situation.",
                            choices: [
                                {
                                    text: "Write down song lyrics that resonate with you",
                                    effects: { soul: +20, money: 0, energy: -5, status: -5, progress: 8 },
                                    unlock: "music_path"
                                },
                                {
                                    text: "Switch to a corporate podcast instead",
                                    effects: { soul: -15, money: +5, energy: -5, status: +10, progress: 2 }
                                },
                                {
                                    text: "Look at other commuters and wonder about their lives",
                                    effects: { soul: +10, money: 0, energy: 0, status: -5, progress: 5 }
                                },
                                {
                                    text: "Get lost in daydreams about your escape",
                                    effects: { soul: +15, money: -5, energy: +5, status: -10, progress: 7 }
                                }
                            ]
                        }
                    },
                    {
                        text: "Review work documents for the day ahead",
                        effects: { soul: -10, money: +10, energy: -10, status: +15, progress: 3 }
                    },
                    {
                        text: "Strike up conversation with another commuter",
                        effects: { soul: +10, money: 0, energy: -5, status: 0, progress: 5 }
                    },
                    {
                        text: "Stare at your reflection in the window",
                        effects: { soul: +5, money: 0, energy: +5, status: -5, progress: 6 }
                    }
                ]
            },
            
            // Creative workshop flyer
            {
                id: "hobby_workshop",
                text: "You find a flyer for a creative workshop related to your hobby.",
                condition: {
                    day: { min: 14 },
                    notTriggered: true
                },
                choices: [
                    {
                        text: "Sign up and attend, even though it's expensive",
                        effects: { soul: +20, money: -15, energy: -5, status: 0, progress: 5 },
                        achievement: "Soul Nourishment",
                        followUp: {
                            text: "The workshop was incredibly refreshing! You meet several like-minded people who share your passion.",
                            choices: [
                                {
                                    text: "Exchange contact info and plan to meet regularly",
                                    effects: { soul: +15, money: -5, energy: -5, status: -5, progress: 8 },
                                    unlock: "creative_community"
                                },
                                {
                                    text: "Share your workshop experience on social media",
                                    effects: { soul: +5, money: 0, energy: -5, status: +5, progress: 3 }
                                },
                                {
                                    text: "Keep the experience to yourself as a private joy",
                                    effects: { soul: +10, money: 0, energy: +10, status: 0, progress: 5 }
                                },
                                {
                                    text: "Immediately apply what you learned to a personal project",
                                    effects: { soul: +20, money: -5, energy: -15, status: -5, progress: 10 }
                                }
                            ]
                        }
                    },
                    {
                        text: "Ignore it - you don't have time for hobbies anymore",
                        effects: { soul: -10, money: +5, energy: +5, status: +5, progress: 2 }
                    },
                    {
                        text: "Take the flyer but decide later",
                        effects: { soul: -5, money: 0, energy: 0, status: 0, progress: 1 }
                    },
                    {
                        text: "Look for a free alternative online",
                        effects: { soul: +10, money: +5, energy: -10, status: -5, progress: 4 }
                    }
                ]
            },
            
            // Mysterious notebook (resistance path)
            {
                id: "mysterious_notebook",
                text: "You find a strange notebook in the break room with writings about 'escaping The Hive.' Inside is a list of names - former employees who disappeared mysteriously.",
                condition: {
                    day: { min: 30 },
                    soul: { min: 60 },
                    notTriggered: true
                },
                choices: [
                    {
                        text: "Keep the notebook and investigate further",
                        effects: { soul: +15, money: 0, energy: -5, status: -10, progress: 12 },
                        unlock: "resistance_path"
                    },
                    {
                        text: "Turn it in to HR immediately",
                        effects: { soul: -20, money: +10, energy: -5, status: +20, progress: 5 }
                    },
                    {
                        text: "Leave it where you found it",
                        effects: { soul: -5, money: 0, energy: 0, status: 0, progress: 3 }
                    },
                    {
                        text: "Copy down some information before returning it",
                        effects: { soul: +5, money: 0, energy: -10, status: +5, progress: 8 }
                    }
                ]
            },
            
            // Art studio space (artist path)
            {
                id: "art_studio",
                text: "You discover a small art studio space for rent near your apartment.",
                condition: {
                    day: { min: 35 },
                    soul: { min: 60 },
                    notTriggered: true
                },
                choices: [
                    {
                        text: "Rent it as a creative sanctuary",
                        effects: { soul: +25, money: -20, energy: +10, status: -10, progress: 15 },
                        unlock: "artist_path"
                    },
                    {
                        text: "Consider it as a potential side business",
                        effects: { soul: +10, money: -10, energy: -10, status: 0, progress: 8 }
                    },
                    {
                        text: "Ignore it - you can't afford distractions",
                        effects: { soul: -15, money: +5, energy: +5, status: +10, progress: 3 }
                    },
                    {
                        text: "Visit the space but postpone the decision",
                        effects: { soul: +5, money: -5, energy: -5, status: 0, progress: 5 }
                    }
                ]
            }
        ];
    }
    
    // Restart game
    restartBtn.addEventListener('click', () => {
        // Reset game state
        gameState.day = 1;
        gameState.weekday = 'Monday';
        gameState.soul = 50;
        gameState.money = 50;
        gameState.energy = 50;
        gameState.status = 20;
        gameState.progressToEscape = 0;
        gameState.achievements = [];
        gameState.specialEvents = [];
        gameState.pastChoices = [];
        gameState.pathToEscape = null;
        gameState.winPath = null;
        gameState.multiEventCounter = 0;
        gameState.albumUnlocks = [];
        gameState.character = {
            name: "Drone #" + Math.floor(Math.random() * 10000),
            department: ["Marketing", "Finance", "IT", "HR", "R&D", "Customer Support"][Math.floor(Math.random() * 6)],
            hobby: ["music", "writing", "painting", "gaming", "hiking", "cooking"][Math.floor(Math.random() * 6)],
            trait: ["anxious", "ambitious", "creative", "meticulous", "friendly", "antisocial"][Math.floor(Math.random() * 6)]
        };
        
        // Reset UI
        gameOverScreen.style.display = 'none';
        document.querySelector('.container:not(.game-over)').style.display = 'block';
        achievement.style.display = 'none';
        pathIndicator.style.display = 'none';
        
        // Start game
        initGame();
    });
    
    // Create honeycomb background pattern
    function createHexagonPattern() {
        const container = document.querySelector('.container:not(.game-over)');
        for (let i = 0; i < 15; i++) {
            const hexagon = document.createElement('div');
            hexagon.classList.add('hexagon');
            hexagon.style.top = `${Math.random() * 100}%`;
            hexagon.style.left = `${Math.random() * 100}%`;
            hexagon.style.opacity = `${Math.random() * 0.2}`;
            container.appendChild(hexagon);
        }
    }
    
    // Initialize game
    function initGame() {
        updateMeters();
        updateDayCounter();
        updateProgress();
        createHexagonPattern();
        nextDay();
    }
    
    // Start the game when page loads
    initGame();
});