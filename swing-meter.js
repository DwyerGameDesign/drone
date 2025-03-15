// Drone Man: The Journey - Swing Meter Module
class SwingMeter {
    constructor(container, config, context) {
        this.container = container;
        this.config = config;
        this.context = context || "Test your skill and timing...";
        this.isMoving = false;
        this.position = 0;
        this.speed = config.speed || 5;
        this.animationId = null;
        this.result = null;
        this.totalWidth = 0; // Will be calculated based on actual meter width
        this.meterElement = null;
        this.indicator = null;
        this.bottomIndicator = null;
        this.tapMarker = null;
        this.tapPosition = null;
        this.hasPlayerTapped = false;
        this.animationComplete = false;
        this.completed = false; // Track if the meter has been completed
        
        this.render();
    }
    
    // Simplified render method
    render() {
        // We're using the pre-rendered HTML in index.html now
        this.meterElement = document.querySelector('.swing-meter');
        this.indicator = document.querySelector('.meter-indicator-top');
        this.bottomIndicator = document.querySelector('.meter-indicator-bottom');
        this.tapMarker = document.querySelector('.tap-marker');
        
        // We'll handle clicks in script.js now
    }
    
    // Get the result of the swing meter
    getResult() {
        return this.result;
    }
}

// Function to show the swing meter
function showSwingMeter(containerId, meterType, context, callback) {
    // Get the container
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        callback(null);
        return;
    }
    
    // Get meter config from game
    const game = window.gameInstance;
    if (!game) {
        console.error('Game instance not found!');
        callback(null);
        return;
    }
    
    const meterConfig = game.getSwingMeterConfig(meterType);
    
    if (!meterConfig) {
        console.error(`Meter type "${meterType}" not found!`);
        callback(null);
        return;
    }
    
    // We're using our own implementation in script.js now
    // We'll just return a hook for backward compatibility
    callback('good');
}

// Replace the old functions with improved ones
window.showSwingMeter = showSwingMeter;

// Swing Meter Module
const SwingMeter = {
    // State variables
    isAnimating: false,
    animationFrame: null,
    swingSpeed: 2,
    speedModifier: 1.0,
    widthModifier: 1.0,
    indicatorPosition: 0,
    direction: 1,
    tapMarker: null,
    indicatorBar: null,
    goodZone: null,
    poorZone: null,
    tapInstruction: null,
    rhythmLabel: null,
    difficultyMeters: null,

    // Initialize the swing meter
    init() {
        this.resetSwingMeter();
        this.updateDifficultyMeters();
    },

    // Start the swing meter animation
    start() {
        console.log('Starting swing meter with modifiers:', {
            speed: this.speedModifier,
            width: this.widthModifier
        });

        // Ensure elements are visible
        if (this.rhythmLabel) this.rhythmLabel.style.display = 'flex';
        if (this.difficultyMeters) this.difficultyMeters.style.display = 'flex';

        // Create indicator bar if it doesn't exist
        if (!this.indicatorBar) {
            this.indicatorBar = document.createElement('div');
            this.indicatorBar.className = 'indicator-bar';
            const swingMeter = document.querySelector('.swing-meter');
            swingMeter.appendChild(this.indicatorBar);
        }

        // Reset indicator position
        this.indicatorPosition = 0;
        this.direction = 1;
        this.indicatorBar.style.left = '0%';

        // Apply speed modifier
        const baseSpeed = 2;
        this.swingSpeed = baseSpeed * this.speedModifier;
        console.log('Applied swing speed:', this.swingSpeed);

        // Start animation
        this.isAnimating = true;
        this.animate();
    },

    // Stop the swing meter and determine result
    stop() {
        if (!this.isAnimating) return;
        
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Calculate compensated position
        const compensatedPosition = this.indicatorPosition + (this.direction * 0.5);
        console.log('Compensated position:', compensatedPosition);

        // Calculate zone boundaries based on width modifier
        const goodZoneWidth = 0.4 * this.widthModifier;
        const poorZoneWidth = 0.6 * this.widthModifier;
        console.log('Zone boundaries:', {
            good: goodZoneWidth,
            poor: poorZoneWidth
        });

        // Determine result based on compensated position
        let result;
        if (compensatedPosition >= 0.5 - goodZoneWidth/2 && compensatedPosition <= 0.5 + goodZoneWidth/2) {
            result = 'good';
        } else if (compensatedPosition >= 0.5 - poorZoneWidth/2 && compensatedPosition <= 0.5 + poorZoneWidth/2) {
            result = 'poor';
        } else {
            result = 'bad';
        }
        console.log('Swing meter result:', result);

        // Display tap marker at compensated position
        if (this.tapMarker) {
            this.tapMarker.style.left = `${compensatedPosition * 100}%`;
            this.tapMarker.style.display = 'block';
        }

        return result;
    },

    // Animate the swing meter
    animate() {
        if (!this.isAnimating) return;

        // Update position
        this.indicatorPosition += this.swingSpeed * 0.01 * this.direction;

        // Check boundaries
        if (this.indicatorPosition >= 1) {
            this.indicatorPosition = 1;
            this.direction = -1;
        } else if (this.indicatorPosition <= 0) {
            this.indicatorPosition = 0;
            this.direction = 1;
        }

        // Update indicator position
        if (this.indicatorBar) {
            this.indicatorBar.style.left = `${this.indicatorPosition * 100}%`;
        }

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    // Reset the swing meter
    reset() {
        // Remove existing elements
        if (this.rhythmLabel) this.rhythmLabel.remove();
        if (this.difficultyMeters) this.difficultyMeters.remove();
        if (this.indicatorBar) this.indicatorBar.remove();
        if (this.tapMarker) this.tapMarker.remove();

        // Clear container
        const container = document.getElementById('swing-meter-container');
        if (!container) return;

        // Preserve choice description
        const choiceDescription = container.querySelector('.choice-description');
        container.innerHTML = '';
        if (choiceDescription) {
            container.appendChild(choiceDescription);
        }

        // Create rhythm label
        this.rhythmLabel = document.createElement('div');
        this.rhythmLabel.className = 'rhythm-label';
        this.rhythmLabel.textContent = 'Inner Rhythm';
        container.appendChild(this.rhythmLabel);

        // Create swing meter
        const swingMeter = document.createElement('div');
        swingMeter.className = 'swing-meter';
        
        // Create zones
        this.goodZone = document.createElement('div');
        this.goodZone.className = 'good-zone';
        
        this.poorZone = document.createElement('div');
        this.poorZone.className = 'poor-zone';
        
        // Create indicator bar
        this.indicatorBar = document.createElement('div');
        this.indicatorBar.className = 'indicator-bar';
        
        // Create tap marker
        this.tapMarker = document.createElement('div');
        this.tapMarker.className = 'tap-marker';
        this.tapMarker.style.display = 'none';
        
        // Create tap instruction
        this.tapInstruction = document.createElement('div');
        this.tapInstruction.className = 'tap-instruction';
        this.tapInstruction.textContent = 'Tap when the bar is in the green zone!';
        
        // Assemble swing meter
        swingMeter.appendChild(this.goodZone);
        swingMeter.appendChild(this.poorZone);
        swingMeter.appendChild(this.indicatorBar);
        swingMeter.appendChild(this.tapMarker);
        swingMeter.appendChild(this.tapInstruction);
        
        container.appendChild(swingMeter);

        // Create difficulty meters
        this.difficultyMeters = document.createElement('div');
        this.difficultyMeters.className = 'difficulty-meters';
        
        // Create tempo meter
        const tempoMeter = document.createElement('div');
        tempoMeter.className = 'difficulty-meter';
        tempoMeter.innerHTML = `
            <div class="meter-label">Tempo</div>
            <div class="meter-bar">
                <div class="meter-fill" style="width: 50%"></div>
            </div>
        `;
        
        // Create precision meter
        const precisionMeter = document.createElement('div');
        precisionMeter.className = 'difficulty-meter';
        precisionMeter.innerHTML = `
            <div class="meter-label">Precision</div>
            <div class="meter-bar">
                <div class="meter-fill" style="width: 50%"></div>
            </div>
        `;
        
        this.difficultyMeters.appendChild(tempoMeter);
        this.difficultyMeters.appendChild(precisionMeter);
        container.appendChild(this.difficultyMeters);

        // Reset state
        this.isAnimating = false;
        this.indicatorPosition = 0;
        this.direction = 1;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Update meters
        this.updateDifficultyMeters();
    },

    // Update the difficulty meters display
    updateDifficultyMeters() {
        if (!this.difficultyMeters) return;

        const tempoFill = this.difficultyMeters.querySelector('.difficulty-meter:first-child .meter-fill');
        const precisionFill = this.difficultyMeters.querySelector('.difficulty-meter:last-child .meter-fill');

        if (tempoFill) {
            const tempoWidth = Math.min(100, 50 + (this.speedModifier - 1) * 50);
            tempoFill.style.width = `${tempoWidth}%`;
        }

        if (precisionFill) {
            const precisionWidth = Math.min(100, 50 + (this.widthModifier - 1) * 50);
            precisionFill.style.width = `${precisionWidth}%`;
        }
    },

    // Adjust difficulty based on narrative type
    adjustDifficulty(narrativeType) {
        console.log('Adjusting difficulty for narrative type:', narrativeType);
        
        switch(narrativeType) {
            case 'tempo':
                this.speedModifier = Math.min(2.0, this.speedModifier + 0.2);
                console.log('Increased speed modifier to:', this.speedModifier);
                break;
            case 'precision':
                this.widthModifier = Math.min(2.0, this.widthModifier + 0.2);
                console.log('Increased width modifier to:', this.widthModifier);
                break;
            case 'balance':
                this.speedModifier = Math.min(2.0, this.speedModifier + 0.1);
                this.widthModifier = Math.min(2.0, this.widthModifier + 0.1);
                console.log('Increased both modifiers:', {
                    speed: this.speedModifier,
                    width: this.widthModifier
                });
                break;
            default:
                console.log('No difficulty adjustment for narrative type:', narrativeType);
        }

        this.updateDifficultyMeters();
    },

    // Reset difficulty modifiers
    resetDifficultyModifiers() {
        this.speedModifier = 1.0;
        this.widthModifier = 1.0;
        console.log('Reset difficulty modifiers to default values');
        this.updateDifficultyMeters();
    }
};

// Export the SwingMeter module
export default SwingMeter;