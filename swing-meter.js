// Drone Man: The Journey - Swing Meter Module
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
        this.reset();
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
        container.appendChild(swingMeter);
        container.appendChild(this.tapInstruction);

        // Create difficulty meters
        this.difficultyMeters = document.createElement('div');
        this.difficultyMeters.className = 'difficulty-meters';
        
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
        tempoValue.style.width = `${(this.speedModifier - 0.5) / 2 * 100}%`;
        
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
        precisionValue.style.width = `${(this.widthModifier - 0.4) / 1.1 * 100}%`;
        
        precisionMeter.appendChild(precisionValue);
        precisionContainer.appendChild(precisionLabel);
        precisionContainer.appendChild(precisionMeter);
        
        this.difficultyMeters.appendChild(tempoContainer);
        this.difficultyMeters.appendChild(precisionContainer);
        container.appendChild(this.difficultyMeters);
    },

    // Update the difficulty meters in the UI
    updateDifficultyMeters() {
        // Update tempo meter
        const tempoValue = document.querySelector('.tempo-meter .meter-value');
        if (tempoValue) {
            const tempoPercentage = (this.speedModifier - 0.5) / 2 * 100;
            tempoValue.style.width = `${tempoPercentage}%`;
        }
        
        // Update precision meter
        const precisionValue = document.querySelector('.precision-meter .meter-value');
        if (precisionValue) {
            const precisionPercentage = (this.widthModifier - 0.4) / 1.1 * 100;
            precisionValue.style.width = `${precisionPercentage}%`;
        }
    },

    // Adjust difficulty based on narrative type
    adjustDifficulty(narrativeType) {
        console.log('Adjusting difficulty for:', narrativeType);
        
        switch(narrativeType) {
            case 'soul':
                this.speedModifier = Math.min(2.5, this.speedModifier + 0.2);
                this.widthModifier = Math.min(1.5, this.widthModifier + 0.1);
                break;
            case 'connections':
                this.speedModifier = Math.min(2.5, this.speedModifier + 0.15);
                this.widthModifier = Math.min(1.5, this.widthModifier + 0.15);
                break;
            case 'success':
                this.speedModifier = Math.min(2.5, this.speedModifier + 0.1);
                this.widthModifier = Math.min(1.5, this.widthModifier + 0.2);
                break;
            default:
                this.speedModifier = Math.min(2.5, this.speedModifier + 0.1);
                this.widthModifier = Math.min(1.5, this.widthModifier + 0.1);
        }
        
        console.log('New modifiers:', {
            speed: this.speedModifier,
            width: this.widthModifier
        });
        
        this.updateDifficultyMeters();
    },

    // Reset difficulty modifiers to initial values
    resetDifficultyModifiers() {
        this.speedModifier = 1.0;
        this.widthModifier = 1.0;
        this.updateDifficultyMeters();
    }
};

export default SwingMeter;

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