// Updated swing-meter.js with tap marker visualization
const SwingMeter = {
    // State variables
    isAnimating: false,
    animationFrame: null,
    swingSpeed: 2,
    speedModifier: 1.0,
    widthModifier: 1.0,
    baseGoodZoneWidth: 20, // Default good zone width percentage
    indicatorPosition: 0,
    direction: 1,
    tapMarker: null,
    indicatorBar: null,
    meterBackground: null,
    goodZone: null,
    poorStartZone: null,
    poorEndZone: null,
    tapInstruction: null,
    
    // New state variables for enhanced marker behavior
    tapPosition: null,     // Stores where the player tapped
    isTapped: false,       // Whether the player has tapped
    resultCallback: null,  // Callback to fire once animation completes
    tapResult: null,       // Store the tap result for the callback

    init() {
        console.log('Initializing swing meter');

        // Ensure we have references to elements
        this.meterBackground = document.getElementById('meterBackground');
        this.indicatorBar = document.querySelector('.meter-indicator-bar');
        this.tapMarker = document.querySelector('.tap-marker');
        this.goodZone = document.querySelector('.meter-zone.good');
        this.poorStartZone = document.querySelector('.meter-zone.poor-start');
        this.poorEndZone = document.querySelector('.meter-zone.poor-end');

        // Find or create the rhythm label and difficulty meters
        this.createOrUpdateRhythmAndDifficultyElements();

        // Reset values
        this.indicatorPosition = 0;
        this.direction = 1;
        this.isAnimating = false;
        this.isTapped = false;
        this.tapPosition = null;
        this.resultCallback = null;
        this.tapResult = null;

        // Update UI meters
        this.updateDifficultyMeters();
    },

    // Create or update rhythm and difficulty elements
    createOrUpdateRhythmAndDifficultyElements() {
        const swingMeterContainer = document.getElementById('swingMeterContainer');
        if (!swingMeterContainer) return;

        // Create rhythm label if needed
        let rhythmLabel = document.querySelector('.rhythm-label');
        if (!rhythmLabel) {
            rhythmLabel = document.createElement('div');
            rhythmLabel.className = 'rhythm-label';
            rhythmLabel.textContent = 'INNER RHYTHM';

            // Insert at the beginning of the container
            swingMeterContainer.insertBefore(rhythmLabel, swingMeterContainer.firstChild);
        }

        // Show the rhythm label
        rhythmLabel.style.display = 'flex';

        // Create difficulty meters if needed
        let difficultyMeters = document.querySelector('.difficulty-meters');
        if (!difficultyMeters) {
            difficultyMeters = document.createElement('div');
            difficultyMeters.className = 'difficulty-meters';

            // Create tempo meter
            const tempoContainer = createMeterContainer('TEMPO', 'tempo-meter');

            // Create precision meter
            const precisionContainer = createMeterContainer('PRECISION', 'precision-meter');

            difficultyMeters.appendChild(tempoContainer);
            difficultyMeters.appendChild(precisionContainer);

            // Find the right place to insert (after the swing meter)
            const swingMeter = swingMeterContainer.querySelector('.swing-meter');
            if (swingMeter && swingMeter.nextElementSibling) {
                swingMeterContainer.insertBefore(difficultyMeters, swingMeter.nextElementSibling);
            } else {
                swingMeterContainer.appendChild(difficultyMeters);
            }
        }

        // Show the difficulty meters
        difficultyMeters.style.display = 'flex';

        // Helper function to create meter containers
        function createMeterContainer(labelText, meterClass) {
            const container = document.createElement('div');
            container.className = 'meter-container';

            const label = document.createElement('div');
            label.className = 'meter-label';
            label.textContent = labelText;

            const meter = document.createElement('div');
            meter.className = `difficulty-meter ${meterClass}`;

            const value = document.createElement('div');
            value.className = 'meter-value';

            meter.appendChild(value);
            container.appendChild(label);
            container.appendChild(meter);

            return container;
        }
    },

    // Start the swing meter animation
    start(callback) {
        console.log('Starting swing meter with modifiers:', {
            speed: this.speedModifier,
            width: this.widthModifier
        });

        // Store the callback if provided
        this.resultCallback = callback || null;

        // Reset tap-related states
        this.isTapped = false;
        this.tapPosition = null;
        this.tapResult = null;

        // Ensure rhythm label and difficulty meters exist and are visible
        this.createOrUpdateRhythmAndDifficultyElements();

        // Get references to DOM elements if not already set
        if (!this.meterBackground) this.meterBackground = document.getElementById('meterBackground');
        if (!this.indicatorBar) this.indicatorBar = document.querySelector('.meter-indicator-bar');
        if (!this.tapMarker) this.tapMarker = document.querySelector('.tap-marker');

        if (!this.meterBackground || !this.indicatorBar) {
            console.error('Swing meter elements not found');
            return;
        }

        // Hide the tap marker initially
        if (this.tapMarker) {
            this.tapMarker.style.display = 'none';
        }

        // Reset indicator position
        this.indicatorPosition = 0;
        this.direction = 1;
        this.indicatorBar.style.left = '0%';

        // Apply speed modifier
        const baseSpeed = 1;
        this.swingSpeed = baseSpeed * this.speedModifier;
        console.log('Applied swing speed:', this.swingSpeed);

        // Update difficulty meters to show current values
        this.updateDifficultyMeters();

        // Start animation
        this.isAnimating = true;
        this.animate();
    },

    // Record the tap position but continue moving the indicator to the end
    tap() {
        if (!this.isAnimating || this.isTapped) return null;

        // Record that the player has tapped
        this.isTapped = true;
        
        // Record the current position as the tap position
        this.tapPosition = this.indicatorPosition;
        
        // Calculate the result based on the tap position
        const goodZoneWidth = this.baseGoodZoneWidth * this.widthModifier;
        const poorZoneWidth = (100 - goodZoneWidth) / 2;
        const goodZoneStart = poorZoneWidth;
        const goodZoneEnd = poorZoneWidth + goodZoneWidth;

        // Determine result based on the tap position
        this.tapResult = 'fail';
        if (this.tapPosition >= goodZoneStart && this.tapPosition < goodZoneEnd) {
            this.tapResult = 'good';
        }

        console.log(`Tap recorded at position ${this.tapPosition}%, result: ${this.tapResult}`);

        // Display the tap marker at the tap position
        if (this.tapMarker) {
            this.tapMarker.style.left = `${this.tapPosition}%`;
            this.tapMarker.style.display = 'block';
            
            // Set the marker color based on the result
            if (this.tapResult === 'fail') {
                this.tapMarker.style.backgroundColor = '#e74c3c'; // Red for fail
            } else {
                // This will be updated in the main script based on decision type
                this.tapMarker.style.backgroundColor = '#2ecc71'; // Default green
            }
        }
        
        // Continue animation to the end
        // The animation will complete when it reaches the end of the meter
        return this.tapResult;
    },

    // Animate the swing meter
    animate() {
        if (!this.isAnimating) return;

        // Update position
        this.indicatorPosition += this.swingSpeed * this.direction;

        // Check boundaries and handle completion
        if (this.isTapped) {
            // If tapped, we move in one direction until reaching the end
            if (this.indicatorPosition >= 100 || this.indicatorPosition <= 0) {
                // Complete the animation
                this.isAnimating = false;
                
                // Ensure the indicator is exactly at the boundary
                this.indicatorPosition = this.direction > 0 ? 100 : 0;
                
                // Update the indicator position one last time
                if (this.indicatorBar) {
                    this.indicatorBar.style.left = `${this.indicatorPosition}%`;
                }

                // Call the result callback if provided
                if (this.resultCallback) {
                    // Short delay to let the user see the final position
                    setTimeout(() => this.resultCallback(this.tapResult), 300);
                }
                
                return;
            }
        } else {
            // Normal back-and-forth movement if not tapped
            if (this.indicatorPosition >= 100) {
                this.direction = -1;
            } else if (this.indicatorPosition <= 0) {
                this.direction = 1;
            }
        }

        // Make sure position stays in bounds
        this.indicatorPosition = Math.max(0, Math.min(100, this.indicatorPosition));

        // Update indicator position
        if (this.indicatorBar) {
            this.indicatorBar.style.left = `${this.indicatorPosition}%`;
        }

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    // Reset the swing meter
    reset() {
        console.log('Resetting swing meter');

        // Reset animation state
        this.isAnimating = false;
        this.isTapped = false;
        this.tapPosition = null;
        this.tapResult = null;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        // Reset indicator position
        this.indicatorPosition = 0;
        this.direction = 1;

        // Find existing elements if they're not set
        if (!this.indicatorBar) {
            this.indicatorBar = document.querySelector('.meter-indicator-bar');
        }

        if (!this.tapMarker) {
            this.tapMarker = document.querySelector('.tap-marker');
        }

        // Reset the indicator bar position if it exists
        if (this.indicatorBar) {
            this.indicatorBar.style.transition = 'left 0.1s linear';
            this.indicatorBar.style.left = '0%';
            this.indicatorBar.style.backgroundColor = 'white'; // Reset color
        }

        // Hide the tap marker if it exists
        if (this.tapMarker) {
            this.tapMarker.style.display = 'none';
            this.tapMarker.style.backgroundColor = 'white'; // Reset color
        }

        // Configure zones based on current widthModifier
        const goodZone = document.querySelector('.meter-zone.good');
        const poorStartZone = document.querySelector('.meter-zone.poor-start');
        const poorEndZone = document.querySelector('.meter-zone.poor-end');

        if (goodZone && poorStartZone && poorEndZone) {
            // Calculate widths based on modifiers
            const goodZoneWidth = this.baseGoodZoneWidth * this.widthModifier;
            const poorZoneWidth = (100 - goodZoneWidth) / 2;

            // Apply widths
            poorStartZone.style.width = `${poorZoneWidth}%`;
            goodZone.style.width = `${goodZoneWidth}%`;
            poorEndZone.style.width = `${poorZoneWidth}%`;
        }
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
        console.log(`Adjusting difficulty based on ${narrativeType} decision`);

        switch (narrativeType) {
            case 'soul':
                // Soul choices make the meter faster
                this.speedModifier *= 1.2; // Increase speed by 20%
                console.log(`Speed increased to ${this.speedModifier.toFixed(2)}x`);
                break;
            case 'connections':
                // Connections choices make the good zone smaller
                this.widthModifier *= 0.8; // Decrease good zone width by 20%
                console.log(`Width decreased to ${this.widthModifier.toFixed(2)}x`);
                break;
            case 'success':
                // Success choices make the meter slightly slower and good zone slightly wider
                this.speedModifier *= 0.9; // Decrease speed by 10%
                this.widthModifier *= 1.1; // Increase good zone width by 10%
                console.log(`Speed decreased to ${this.speedModifier.toFixed(2)}x, width increased to ${this.widthModifier.toFixed(2)}x`);
                break;
            default:
                // No change for unknown types
                break;
        }

        // Apply limits to prevent extremes
        this.speedModifier = Math.max(0.5, Math.min(this.speedModifier, 2.5)); // Limit between 0.5x and 2.5x
        this.widthModifier = Math.max(0.4, Math.min(this.widthModifier, 1.5)); // Limit between 0.4x and 1.5x

        // Update UI meters
        this.updateDifficultyMeters();

        console.log(`Final modifiers - Speed: ${this.speedModifier.toFixed(2)}x, Width: ${this.widthModifier.toFixed(2)}x`);
    },

    // Reset difficulty modifiers to initial values
    resetDifficultyModifiers() {
        console.log('Resetting difficulty modifiers to default values');
        this.speedModifier = 1.0;
        this.widthModifier = 1.0;
        this.updateDifficultyMeters();
    }
};

export default SwingMeter;