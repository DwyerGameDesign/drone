// Drone Man: The Journey - Achievement System

class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = [];
        this.playerStats = {
            currentPlaythrough: {
                soul: 0,
                connections: 0,
                success: 0,
                visitedStops: [],
                decisionResults: {} // Format: { "soul": { success: 0, fail: 0 }, ... }
            },
            allTime: {
                soul: 0,
                connections: 0,
                success: 0,
                visitedStops: [],
                completedPlaythroughs: 0,
                decisionResults: {} // Format: { "soul": { success: 0, fail: 0 }, ... }
            },
            newlyUnlocked: [] // Achievements unlocked in current playthrough
        };
        
        // Initialize the achievement system
        this.initializeAchievements();
        this.loadPlayerStats();
    }
    
    // Initialize the list of achievements
    initializeAchievements() {
        this.achievements = [
            {
                id: "blue_album",
                title: "Blue Album",
                description: "Complete a journey with all Soul decisions",
                category: "playthrough",
                albumColor: "#2A66C9", // Blue
                albumArt: "circle",
                unlocked: false,
                criteria: {
                    type: "playthrough_decisions",
                    decisions: "soul",
                    count: 5 // All 5 stops
                }
            },
            {
                id: "master_of_puppets",
                title: "Master of Puppets",
                description: "Complete a journey with all Success decisions",
                category: "playthrough",
                albumColor: "#1F6F50", // Green
                albumArt: "square",
                unlocked: false,
                criteria: {
                    type: "playthrough_decisions",
                    decisions: "success",
                    count: 5 // All 5 stops
                }
            },
            {
                id: "purple_rain",
                title: "Purple Rain",
                description: "Complete a journey with all Connections decisions",
                category: "playthrough",
                albumColor: "#7D3CCF", // Purple
                albumArt: "circle",
                unlocked: false,
                criteria: {
                    type: "playthrough_decisions",
                    decisions: "connections",
                    count: 5 // All 5 stops
                }
            },
            {
                id: "2112",
                title: "2112",
                description: "Visit all possible stops across multiple playthroughs",
                category: "exploration",
                albumColor: "#E74C3C", // Red
                albumArt: "square",
                unlocked: false,
                criteria: {
                    type: "visit_all_stops",
                    count: 15 // All 15 possible stops
                }
            },
            {
                id: "fade_to_black",
                title: "Fade to Black",
                description: "Make at least one of each decision type",
                category: "variety",
                albumColor: "#34495E", // Dark gray
                albumArt: "circle",
                unlocked: false,
                criteria: {
                    type: "decision_variety",
                    varieties: ["soul", "connections", "success"]
                }
            },
            {
                id: "lucky_star",
                title: "Lucky Star",
                description: "Choose Soul at the Starlight stop",
                category: "special",
                albumColor: "#F1C40F", // Gold
                albumArt: "star",
                unlocked: false,
                criteria: {
                    type: "specific_decision",
                    stop: 5, // Starlight stop
                    decision: "soul"
                }
            },
            {
                id: "dark_side",
                title: "Dark Side of the Moon",
                description: "Fail three decisions in a single playthrough",
                category: "challenge",
                albumColor: "#2C3E50", // Very dark blue
                albumArt: "triangle",
                unlocked: false,
                criteria: {
                    type: "fail_count",
                    count: 3
                }
            },
            {
                id: "perfect_day",
                title: "Perfect Day",
                description: "Complete a journey with all successful decisions",
                category: "mastery",
                albumColor: "#F39C12", // Orange
                albumArt: "circle",
                unlocked: false,
                criteria: {
                    type: "perfect_playthrough"
                }
            }
        ];
        
        console.log('Achievements initialized:', this.achievements.length);
    }
    
    // Load player stats from localStorage
    loadPlayerStats() {
        try {
            const savedStats = localStorage.getItem('droneManPlayerStats');
            if (savedStats) {
                const parsedStats = JSON.parse(savedStats);
                // Only load the allTime stats, reset current playthrough
                this.playerStats.allTime = parsedStats.allTime || this.playerStats.allTime;
                this.playerStats.newlyUnlocked = [];
                
                console.log('Loaded player stats from localStorage');
            }
            
            // Load achievement unlocks
            const savedAchievements = localStorage.getItem('droneManAchievements');
            if (savedAchievements) {
                const unlockedIds = JSON.parse(savedAchievements);
                // Update unlocked status for each achievement
                this.achievements.forEach(achievement => {
                    achievement.unlocked = unlockedIds.includes(achievement.id);
                });
                
                console.log('Loaded achievement unlocks from localStorage');
            }
        } catch (error) {
            console.error('Error loading player stats:', error);
        }
    }
    
    // Save player stats to localStorage
    savePlayerStats() {
        try {
            localStorage.setItem('droneManPlayerStats', JSON.stringify(this.playerStats));
            
            // Save unlocked achievement IDs
            const unlockedIds = this.achievements
                .filter(a => a.unlocked)
                .map(a => a.id);
            localStorage.setItem('droneManAchievements', JSON.stringify(unlockedIds));
            
            console.log('Saved player stats to localStorage');
        } catch (error) {
            console.error('Error saving player stats:', error);
        }
    }
    
    // Track a decision made by the player
    trackDecision(stop, decisionType, success) {
        console.log(`Tracking decision: Stop ${stop}, Type ${decisionType}, Success ${success}`);
        
        // Get the actual stop number from the journey manager
        const actualStop = this.game.journeyManager.getActualStop(stop);
        
        // Update current playthrough stats
        if (decisionType) {
            this.playerStats.currentPlaythrough[decisionType]++;
        }
        
        // Track visited stops
        if (actualStop && !this.playerStats.currentPlaythrough.visitedStops.includes(actualStop)) {
            this.playerStats.currentPlaythrough.visitedStops.push(actualStop);
        }
        
        // Track decision results
        if (!this.playerStats.currentPlaythrough.decisionResults[decisionType]) {
            this.playerStats.currentPlaythrough.decisionResults[decisionType] = { success: 0, fail: 0 };
        }
        
        if (success) {
            this.playerStats.currentPlaythrough.decisionResults[decisionType].success++;
        } else {
            this.playerStats.currentPlaythrough.decisionResults[decisionType].fail++;
        }
        
        // Check for achievements after tracking the decision
        this.checkAchievements();
    }
    
    // Complete a playthrough and update all-time stats
    completePlaythrough() {
        console.log('Completing playthrough and updating all-time stats');
        
        // Update all-time stats
        this.playerStats.allTime.soul += this.playerStats.currentPlaythrough.soul;
        this.playerStats.allTime.connections += this.playerStats.currentPlaythrough.connections;
        this.playerStats.allTime.success += this.playerStats.currentPlaythrough.success;
        this.playerStats.allTime.completedPlaythroughs++;
        
        // Add visited stops to all-time list (without duplicates)
        this.playerStats.currentPlaythrough.visitedStops.forEach(stop => {
            if (!this.playerStats.allTime.visitedStops.includes(stop)) {
                this.playerStats.allTime.visitedStops.push(stop);
            }
        });
        
        // Update all-time decision results
        Object.entries(this.playerStats.currentPlaythrough.decisionResults).forEach(([type, results]) => {
            if (!this.playerStats.allTime.decisionResults[type]) {
                this.playerStats.allTime.decisionResults[type] = { success: 0, fail: 0 };
            }
            
            this.playerStats.allTime.decisionResults[type].success += results.success;
            this.playerStats.allTime.decisionResults[type].fail += results.fail;
        });
        
        // Check for achievements one last time
        this.checkAchievements();
        
        // Save stats to localStorage
        this.savePlayerStats();
        
        return this.playerStats.newlyUnlocked;
    }
    
    // Reset current playthrough stats
    resetPlaythrough() {
        console.log('Resetting current playthrough stats');
        
        this.playerStats.currentPlaythrough = {
            soul: 0,
            connections: 0,
            success: 0,
            visitedStops: [],
            decisionResults: {}
        };
        
        this.playerStats.newlyUnlocked = [];
    }
    
    // Check if any achievements should be unlocked
    checkAchievements() {
        console.log('Checking achievements...');
        
        this.achievements.forEach(achievement => {
            // Skip already unlocked achievements
            if (achievement.unlocked) return;
            
            let unlocked = false;
            
            switch (achievement.criteria.type) {
                case "playthrough_decisions":
                    // Check if player made enough decisions of a specific type
                    const decisionCount = this.playerStats.currentPlaythrough[achievement.criteria.decisions] || 0;
                    unlocked = decisionCount >= achievement.criteria.count;
                    break;
                    
                case "visit_all_stops":
                    // Check if player has visited all possible stops across playthroughs
                    unlocked = this.playerStats.allTime.visitedStops.length >= achievement.criteria.count;
                    break;
                    
                case "decision_variety":
                    // Check if player has made at least one of each decision type
                    unlocked = achievement.criteria.varieties.every(type => 
                        (this.playerStats.currentPlaythrough[type] || 0) > 0
                    );
                    break;
                    
                case "specific_decision":
                    // Check if player made a specific decision at a specific stop
                    const decisions = this.game.decisionHistory;
                    unlocked = decisions.some(d => 
                        d.stop === achievement.criteria.stop && 
                        d.narrativeType === achievement.criteria.decision &&
                        d.success === true
                    );
                    break;
                    
                case "fail_count":
                    // Check if player has failed enough decisions
                    let failCount = 0;
                    Object.values(this.playerStats.currentPlaythrough.decisionResults).forEach(result => {
                        failCount += result.fail || 0;
                    });
                    unlocked = failCount >= achievement.criteria.count;
                    break;
                    
                case "perfect_playthrough":
                    // Check if player completed all decisions successfully
                    let totalDecisions = 0;
                    let successfulDecisions = 0;
                    
                    Object.values(this.playerStats.currentPlaythrough.decisionResults).forEach(result => {
                        totalDecisions += (result.success || 0) + (result.fail || 0);
                        successfulDecisions += result.success || 0;
                    });
                    
                    unlocked = totalDecisions >= 5 && totalDecisions === successfulDecisions;
                    break;
            }
            
            if (unlocked) {
                console.log(`Achievement unlocked: ${achievement.title}`);
                achievement.unlocked = true;
                
                // Add to newly unlocked list if not already there
                if (!this.playerStats.newlyUnlocked.includes(achievement.id)) {
                    this.playerStats.newlyUnlocked.push(achievement.id);
                    
                    // Show notification
                    this.showAchievementNotification(achievement);
                }
            }
        });
    }
    
    // Show a notification when an achievement is unlocked
    showAchievementNotification(achievement) {
        console.log(`Showing notification for achievement: ${achievement.title}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        // Create album art
        const albumArt = document.createElement('div');
        albumArt.className = `album-art ${achievement.albumArt}`;
        albumArt.style.backgroundColor = achievement.albumColor;
        
        // Create text content
        const textContent = document.createElement('div');
        textContent.className = 'achievement-text';
        
        const title = document.createElement('div');
        title.className = 'achievement-title';
        title.textContent = achievement.title;
        
        const description = document.createElement('div');
        description.className = 'achievement-description';
        description.textContent = achievement.description;
        
        // Assemble notification
        textContent.appendChild(title);
        textContent.appendChild(description);
        notification.appendChild(albumArt);
        notification.appendChild(textContent);
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add animation class after a small delay to trigger animation
        setTimeout(() => {
            notification.classList.add('show');
            
            // Try to play sound effect if available, but don't worry if it fails
            try {
                // Create a simple beep sound using Web Audio API instead of loading an MP3
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2); // Short beep
            } catch (e) {
                console.log('Could not play achievement sound:', e);
            }
        }, 10);
        
        // Remove after display time
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500); // Remove after fade out
        }, 5000);
    }
    
    // Get all achievements
    getAllAchievements() {
        return this.achievements;
    }
    
    // Get newly unlocked achievements
    getNewlyUnlocked() {
        return this.achievements.filter(a => this.playerStats.newlyUnlocked.includes(a.id));
    }
    
    // Get achievement by ID
    getAchievement(id) {
        return this.achievements.find(a => a.id === id);
    }
}

// Make the AchievementSystem available globally
window.AchievementSystem = AchievementSystem; 