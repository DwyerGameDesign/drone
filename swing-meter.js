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
    
    // Modified render method for SwingMeter class
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
        meter.style.overflow = 'visible'; // Ensure indicator is visible even outside the meter
        this.meterElement = meter;
        
        // Create meter background
        const meterBackground = document.createElement('div');
        meterBackground.className = 'meter-background';
        meterBackground.style.position = 'relative'; // Add relative positioning to background
        meterBackground.style.overflow = 'visible'; // Ensure indicator is visible
        
        // Calculate total width from zones
        let totalWidth = 0;
        this.config.zones.forEach(zone => {
            totalWidth += zone.width;
        });
        this.totalWidth = totalWidth;
        
        // Add zones to meter
        this.config.zones.forEach(zone => {
            const zoneElement = document.createElement('div');
            zoneElement.className = 'meter-zone';
            zoneElement.style.width = `${zone.width}px`;
            zoneElement.style.backgroundColor = zone.color;
            meterBackground.appendChild(zoneElement);
        });
        
        // Add meter background to meter first
        meter.appendChild(meterBackground);
        
        // Add top indicator (triangle pointing down)
        const topIndicator = document.createElement('div');
        topIndicator.className = 'meter-indicator meter-indicator-top';
        topIndicator.style.display = 'block';
        topIndicator.style.position = 'absolute';
        topIndicator.style.zIndex = '100';
        topIndicator.style.left = '0px';
        this.indicator = topIndicator; // Store reference to top indicator
        
        // Add bottom indicator (triangle pointing up)
        const bottomIndicator = document.createElement('div');
        bottomIndicator.className = 'meter-indicator meter-indicator-bottom';
        bottomIndicator.style.display = 'block';
        bottomIndicator.style.position = 'absolute';
        bottomIndicator.style.zIndex = '100';
        bottomIndicator.style.left = '0px';
        this.bottomIndicator = bottomIndicator; // Store reference to bottom indicator
        
        // Create tap marker (initially hidden)
        const tapMarker = document.createElement('div');
        tapMarker.className = 'tap-marker';
        tapMarker.style.display = 'none';
        tapMarker.style.position = 'absolute';
        tapMarker.style.zIndex = '99';
        this.tapMarker = tapMarker;
        
        // Add indicators and tap marker to meter
        meter.appendChild(topIndicator);
        meter.appendChild(bottomIndicator);
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
            
            // Get the meter background for positioning
            const meterBackground = this.meterElement.querySelector('.meter-background');
            
            // Ensure indicators start at the beginning and are visible
            this.indicator.style.left = '0px';
            this.indicator.style.display = 'block';
            this.bottomIndicator.style.left = '0px';
            this.bottomIndicator.style.display = 'block';
            this.tapMarker.style.display = 'none';
            
            console.log('Starting animation');
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
        // Calculate the width of the meter from the total zone widths
        const meterWidth = this.totalWidth;
        
        // We'll use relative positioning within the meter
        const startX = 0; // Start at the left edge of the meter
        const endX = meterWidth; // End at the right edge of the meter
        
        console.log('Animation range: 0 to', meterWidth, 'Width:', meterWidth);
        
        // Make sure both indicators are visible and properly positioned
        this.indicator.style.display = 'block';
        this.indicator.style.position = 'absolute';
        this.indicator.style.left = '0px';
        
        this.bottomIndicator.style.display = 'block';
        this.bottomIndicator.style.position = 'absolute';
        this.bottomIndicator.style.left = '0px';
        
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
            
            // Update both indicators' positions
            this.indicator.style.left = `${this.position}px`;
            this.bottomIndicator.style.left = `${this.position}px`;
            
            // Continue animation
            if (this.isMoving) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        // Start from the beginning position
        this.position = startX;
        this.indicator.style.left = `${startX}px`;
        this.bottomIndicator.style.left = `${startX}px`;
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    evaluateResult() {
        // We're using relative positioning, so we can evaluate directly
        const tapPosition = this.tapPosition;
        
        console.log('Evaluating result:', tapPosition);
        
        let currentPosition = 0;
        let result = 'fail'; // Default
        
        // Evaluate which zone the tap position falls into
        for (let i = 0; i < this.config.zones.length; i++) {
            const zone = this.config.zones[i];
            const zoneEnd = currentPosition + zone.width;
            
            if (tapPosition >= currentPosition && tapPosition < zoneEnd) {
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
        if (tapPosition >= this.totalWidth) {
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
        
        // Highlight the indicators and tap marker
        this.indicator.classList.add(result);
        this.bottomIndicator.classList.add(result);
        if (this.tapMarker) {
            this.tapMarker.classList.add(result);
        }
        
        // Create result element
        const resultElement = document.createElement('div');
        resultElement.className = `integrated-meter-result ${result}`;
        resultElement.textContent = resultText;
        this.meterElement.appendChild(resultElement);
        
        // Store the context text to preserve it
        const contextText = this.context;
        
        // Wait a moment to show the result, then transition to outcome display
        setTimeout(() => {
            // Add fade-out class to the meter
            this.meterElement.classList.add('fade-out');
            
            // Create outcome container but keep it hidden initially
            const outcomeContainer = document.createElement('div');
            outcomeContainer.className = 'outcome-result fade-out';
            outcomeContainer.textContent = '';
            
            // Create Next Stop button (initially hidden)
            const nextButton = document.createElement('button');
            nextButton.className = 'next-stop-button fade-out';
            nextButton.textContent = 'Next Stop';
            nextButton.style.display = 'none';
            
            // After meter fades out, show the outcome
            setTimeout(() => {
                // Remove the meter element
                this.meterElement.style.display = 'none';
                
                // Get the current narrative to access outcome text
                const game = window.gameInstance;
                const currentNarrative = game.getCurrentNarrative();
                if (currentNarrative && currentNarrative.outcomes) {
                    const outcome = currentNarrative.outcomes.find(o => o.result === result);
                    if (outcome) {
                        outcomeContainer.textContent = outcome.text;
                    }
                }
                
                // Add the outcome container to the meter container
                this.container.appendChild(outcomeContainer);
                this.container.appendChild(nextButton);
                
                // Trigger reflow to ensure the fade-in animation plays
                outcomeContainer.offsetHeight;
                
                // Remove the fade-out class to fade in the outcome
                outcomeContainer.classList.remove('fade-out');
                
                // After outcome fades in, show the Next Stop button
                setTimeout(() => {
                    nextButton.style.display = 'block';
                    nextButton.offsetHeight;
                    nextButton.classList.remove('fade-out');
                }, 500);
            }, 500); // Wait for meter fade-out
            
            // Store the button reference for the callback
            this.nextButton = nextButton;
        }, 1500); // Wait to show the initial result
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
                    
                    // Initially hide the next button until text is fully typed
                    nextButton.style.display = 'none';
                    
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
                                    } else {
                                        // Only show the next button after text is fully typed
                                        setTimeout(() => {
                                            nextButton.style.display = 'block';
                                        }, 500); // Add a small delay after text is complete
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