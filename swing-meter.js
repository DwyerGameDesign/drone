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
        this.totalWidth = 300; // Width of the meter
        this.meterElement = null;
        this.indicator = null;
        this.tapMarker = null;
        this.tapPosition = null;
        this.hasPlayerTapped = false;
        this.animationComplete = false;
        this.completed = false; // Track if the meter has been completed
        
        this.render();
    }
    
    render() {
        // Clear any existing content
        this.container.innerHTML = '';
        
        // Create meter structure
        const meterContainer = document.createElement('div');
        meterContainer.className = 'integrated-meter-container';
        
        // Create context section
        const contextSection = document.createElement('div');
        contextSection.className = 'meter-context';
        contextSection.textContent = this.context;
        
        // Create meter and zones
        const meter = document.createElement('div');
        meter.className = 'integrated-swing-meter';
        meter.style.position = 'relative'; // Ensure position is relative
        this.meterElement = meter;
        
        // Create meter background
        const meterBackground = document.createElement('div');
        meterBackground.className = 'meter-background';
        
        // Add zones to meter
        this.config.zones.forEach(zone => {
            const zoneElement = document.createElement('div');
            zoneElement.className = 'meter-zone';
            zoneElement.style.width = `${zone.width}px`;
            zoneElement.style.backgroundColor = zone.color;
            meterBackground.appendChild(zoneElement);
        });
        
        // Add indicator (single triangle that moves)
        const indicator = document.createElement('div');
        indicator.className = 'meter-indicator';
        this.indicator = indicator;
        
        // Create tap marker (initially hidden)
        const tapMarker = document.createElement('div');
        tapMarker.className = 'tap-marker';
        tapMarker.style.display = 'none';
        this.tapMarker = tapMarker;
        
        // Add elements to meter
        meter.appendChild(meterBackground);
        meter.appendChild(indicator);
        meter.appendChild(tapMarker);
        
        // Add instructions
        const instructions = document.createElement('div');
        instructions.className = 'meter-instructions';
        instructions.textContent = 'TAP TO START, TAP AGAIN TO STOP';
        
        // Assemble the container
        meterContainer.appendChild(contextSection);
        meterContainer.appendChild(meter);
        meterContainer.appendChild(instructions);
        
        // Add container to the parent
        this.container.appendChild(meterContainer);
        
        // Add click event to the meter
        meter.addEventListener('click', () => this.handleClick());
        
        // Wait for elements to be in the DOM and positioned
        setTimeout(() => {
            // Get the actual position of the meter background
            const meterRect = meterBackground.getBoundingClientRect();
            const meterLeft = meterRect.left;
            
            // Set initial position to the left edge of the first zone
            this.startX = meterLeft;
            this.position = meterLeft;
            
            // Position the indicator at the start
            this.indicator.style.left = `${meterLeft}px`;
            
            console.log('Meter positioned at:', meterLeft);
        }, 50);
    }
    
    handleClick() {
        // If the meter has already been completed, ignore clicks
        if (this.completed) {
            return;
        }
        
        if (!this.isMoving) {
            // First click - start the meter
            this.isMoving = true;
            this.hasPlayerTapped = false;
            this.animationComplete = false;
            
            // Get the current position of the meter background
            const meterBackground = this.meterElement.querySelector('.meter-background');
            const meterRect = meterBackground.getBoundingClientRect();
            const startX = meterRect.left;
            
            // Set the starting position
            this.startX = startX;
            this.position = startX;
            
            // Ensure indicator starts at the beginning
            this.indicator.style.left = `${startX}px`;
            this.tapMarker.style.display = 'none';
            
            console.log('Starting animation from:', startX);
            this.startAnimation();
        } else if (!this.hasPlayerTapped && !this.animationComplete) {
            // Player's tap - mark position
            this.hasPlayerTapped = true;
            this.tapPosition = this.position;
            this.tapMarker.style.display = 'block';
            this.tapMarker.style.left = `${this.position}px`;
            
            console.log('Tap position:', this.position);
        }
    }
    
    startAnimation() {
        // Get the current position of the meter background
        const meterBackground = this.meterElement.querySelector('.meter-background');
        const meterRect = meterBackground.getBoundingClientRect();
        const startX = meterRect.left;
        const endX = startX + this.totalWidth;
        
        console.log('Animation range:', startX, 'to', endX);
        
        const animate = () => {
            if (!this.isMoving) return;
            
            // Update position - only move right
            this.position += this.speed;
            
            // Check if we've reached the end
            if (this.position >= endX) {
                this.position = endX;
                this.animationComplete = true;
                
                // If player hasn't tapped, it's a fail
                if (!this.hasPlayerTapped) {
                    this.tapPosition = this.position;
                    this.hasPlayerTapped = true;
                    this.tapMarker.style.display = 'block';
                    this.tapMarker.style.left = `${this.position}px`;
                }
                
                // Stop animation and evaluate result
                this.isMoving = false;
                this.evaluateResult();
            }
            
            // Update indicator position
            this.indicator.style.left = `${this.position}px`;
            
            // Continue animation
            if (this.isMoving) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        // Start from the beginning position
        this.position = startX;
        this.indicator.style.left = `${startX}px`;
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    evaluateResult() {
        // Get the current position of the meter background
        const meterBackground = this.meterElement.querySelector('.meter-background');
        const meterRect = meterBackground.getBoundingClientRect();
        const startX = meterRect.left;
        
        // Adjust the tap position relative to the start of the meter
        const adjustedTapPosition = this.tapPosition - startX;
        
        console.log('Evaluating result:', adjustedTapPosition, 'relative to start:', startX);
        
        let currentPosition = 0;
        let result = 'fail'; // Default
        
        // Use adjusted tapPosition for evaluation
        for (let i = 0; i < this.config.zones.length; i++) {
            const zone = this.config.zones[i];
            const zoneEnd = currentPosition + zone.width;
            
            if (adjustedTapPosition >= currentPosition && adjustedTapPosition < zoneEnd) {
                // Determine result based on color
                if (zone.color === '#2ecc71') { // Green
                    result = 'good';
                } else if (zone.color === '#ff9933') { // Orange
                    result = 'okay';
                } else { // Red or any other color
                    result = 'fail';
                }
                break;
            }
            
            currentPosition += zone.width;
        }
        
        // If the position is at the very end (totalWidth), ensure it's a fail
        if (adjustedTapPosition >= this.totalWidth) {
            result = 'fail';
        }
        
        console.log('Result:', result);
        
        this.result = result;
        this.completed = true; // Mark the meter as completed
        this.showResult(result);
        
        // Add a "completed" class to the meter to visually indicate it's done
        if (this.meterElement) {
            this.meterElement.classList.add('completed');
        }
        
        // Update instructions to show it's completed
        const instructions = this.container.querySelector('.meter-instructions');
        if (instructions) {
            instructions.textContent = 'COMPLETED';
            instructions.classList.add('completed');
        }
    }
    
    showResult(result) {
        // Get the outcome text from config
        let resultText = '';
        if (this.config.results[result]) {
            resultText = this.config.results[result].text;
        }
        
        // Mark the meter as completed
        this.completed = true;
        
        // Add a "completed" class to the meter to visually indicate it's done
        if (this.meterElement) {
            this.meterElement.classList.add('completed');
        }
        
        // Update instructions to show it's completed
        const instructions = this.container.querySelector('.meter-instructions');
        if (instructions) {
            instructions.textContent = 'COMPLETED';
            instructions.classList.add('completed');
        }
        
        // Highlight the indicator and tap marker
        this.indicator.classList.add(result);
        if (this.tapMarker) {
            this.tapMarker.classList.add(result);
        }
        
        // Create result element
        const resultElement = document.createElement('div');
        resultElement.className = `integrated-meter-result ${result}`;
        resultElement.textContent = resultText;
        this.meterElement.appendChild(resultElement);
        
        // Wait a moment to show the result, then transition to outcome display
        setTimeout(() => {
            // Find the parent container (integrated-meter-container)
            const meterContainer = this.container;
            
            // Clear the container
            meterContainer.innerHTML = '';
            
            // Create outcome container
            const outcomeContainer = document.createElement('div');
            outcomeContainer.className = 'outcome-result';
            
            // Leave the outcome text empty - it will be filled with the narrative outcome text
            outcomeContainer.textContent = '';
            
            // Add the outcome container to the meter container
            meterContainer.appendChild(outcomeContainer);
            
            // Create Next Stop button
            const nextButton = document.createElement('button');
            nextButton.className = 'next-stop-button';
            nextButton.textContent = 'Next Stop';
            
            // Add the button to the container
            meterContainer.appendChild(nextButton);
            
            // Store the button reference for the callback
            this.nextButton = nextButton;
        }, 1500); // Wait 1.5 seconds before transitioning
    }
    
    getResult() {
        return this.result;
    }
    
    // Get the next button element
    getNextButton() {
        return this.nextButton;
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
    
    // Check if there's already a completed meter in this container
    if (container.querySelector('.integrated-swing-meter.completed')) {
        console.log('Swing meter already completed in this container');
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
    
    // Create swing meter
    const swingMeter = new SwingMeter(container, meterConfig, context);
    
    // Listen for result
    const checkInterval = setInterval(() => {
        if (swingMeter.getResult()) {
            clearInterval(checkInterval);
            
            // Get the current narrative to access outcome text
            const currentNarrative = game.getCurrentNarrative();
            const result = swingMeter.getResult();
            
            // Wait for the next button to be created
            const buttonCheckInterval = setInterval(() => {
                const nextButton = swingMeter.getNextButton();
                if (nextButton) {
                    clearInterval(buttonCheckInterval);
                    
                    // Find the outcome text from the narrative
                    if (currentNarrative && currentNarrative.outcomes) {
                        const outcome = currentNarrative.outcomes.find(o => o.result === result);
                        if (outcome) {
                            // Update the outcome text with the narrative outcome
                            const outcomeContainer = container.querySelector('.outcome-result');
                            if (outcomeContainer) {
                                // Clear the container first
                                outcomeContainer.textContent = '';
                                
                                // Add typewriter effect for the outcome text
                                let i = 0;
                                const speed = 30; // Adjust speed as needed
                                function typeWriter() {
                                    if (i < outcome.text.length) {
                                        outcomeContainer.textContent += outcome.text.charAt(i);
                                        i++;
                                        setTimeout(typeWriter, speed);
                                    }
                                }
                                typeWriter();
                            }
                        }
                    }
                    
                    // Add click handler to the next button
                    nextButton.onclick = function() {
                        callback(swingMeter.getResult());
                    };
                }
            }, 100);
        }
    }, 100);
}

// Replace the old functions with improved ones
window.showSwingMeter = showSwingMeter; 