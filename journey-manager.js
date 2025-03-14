// Drone Man: The Journey - Journey Manager
class JourneyManager {
    constructor(game) {
        this.game = game;
        
        // Define the stage categories
        this.stageCategories = {
            fixed_start: [1],
            early_1: [2, 3],
            early_2: [4, 5],
            middle_1: [6, 7],
            middle_2: [8, 9],
            late_1: [10, 11],
            late_2: [12, 13, 14],
            fixed_end: [15]
        };
        
        // Define the journey structure
        this.journeyStructure = [
            'fixed_start',  // Stage 1: Fixed Beginning (Stop 1)
            'early_1',      // Stage 2: Early Journey 1 (Random from Stops 2-3)
            'early_2',      // Stage 3: Early Journey 2 (Random from Stops 4-5)
            'middle_1',     // Stage 4: Middle Journey 1 (Random from Stops 6-7)
            'middle_2',     // Stage 5: Middle Journey 2 (Random from Stops 8-9)
            'late_1',       // Stage 6: Late Journey 1 (Random from Stops 10-11)
            'late_2',       // Stage 7: Late Journey 2 (Random from Stops 12-14)
            'fixed_end'     // Stage 8: Fixed Conclusion (Stop 15)
        ];
        
        // Store the selected stops for the current journey
        this.selectedStops = [];
        
        // Map logical stops (1-5) to actual narrative stops
        this.stopMapping = {};
    }
    
    // Initialize a new journey with randomized stops
    initializeJourney() {
        console.log('Initializing new journey with randomized stops');
        this.selectedStops = [];
        this.stopMapping = {};
        
        // Select stops for each stage of the journey
        this.journeyStructure.forEach((stageType, index) => {
            const logicalStop = index + 1; // Logical stops are 1-5
            const possibleStops = this.stageCategories[stageType];
            
            // For fixed stages, use the only available stop
            // For random stages, select one stop randomly
            const selectedStop = possibleStops.length === 1 
                ? possibleStops[0] 
                : this.getRandomStop(possibleStops);
            
            this.selectedStops.push(selectedStop);
            this.stopMapping[logicalStop] = selectedStop;
        });
        
        console.log('Selected stops for journey:', this.selectedStops);
        console.log('Stop mapping:', this.stopMapping);
        
        return this.selectedStops;
    }
    
    // Get a random stop from the possible stops
    getRandomStop(possibleStops) {
        const randomIndex = Math.floor(Math.random() * possibleStops.length);
        return possibleStops[randomIndex];
    }
    
    // Get the narrative for the current logical stop
    getNarrativeForLogicalStop(logicalStop) {
        const actualStop = this.stopMapping[logicalStop];
        if (!actualStop) {
            console.error(`No mapping found for logical stop ${logicalStop}`);
            return null;
        }
        
        const narrative = this.game.narratives.find(n => n.stop === actualStop);
        if (!narrative) {
            console.error(`No narrative found for actual stop ${actualStop}`);
            return null;
        }
        
        return narrative;
    }
    
    // Get the next narrative in the journey
    getNextNarrative(currentLogicalStop) {
        const nextLogicalStop = currentLogicalStop + 1;
        
        // Check if we've reached the end of the journey
        if (nextLogicalStop > this.journeyStructure.length) {
            console.log('Reached the end of the journey');
            return null;
        }
        
        return this.getNarrativeForLogicalStop(nextLogicalStop);
    }
    
    // Check if the journey is complete
    isJourneyComplete(currentLogicalStop) {
        return currentLogicalStop > this.journeyStructure.length;
    }
    
    // Get the total number of stops in the journey
    getTotalStops() {
        return this.journeyStructure.length;
    }
    
    // Get the actual stop number for a logical stop
    getActualStop(logicalStop) {
        return this.stopMapping[logicalStop] || null;
    }
    
    // Get the logical stop number for an actual stop
    getLogicalStop(actualStop) {
        for (const [logical, actual] of Object.entries(this.stopMapping)) {
            if (actual === actualStop) {
                return parseInt(logical);
            }
        }
        return null;
    }
}

// Make the JourneyManager available globally
window.JourneyManager = JourneyManager; 