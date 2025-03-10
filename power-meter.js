// Drone Man: The Journey - Integrated Power Meter Module
class IntegratedPowerMeter {
    constructor(container, config, context) {
        this.container = container;
        this.config = config;
        this.context = context || "Test your skill and timing...";
        this.isMoving = false;
        this.position = 0;
        this.direction = 1;
        this.speed = config.speed || 5;
        this.animationId = null;
        this.result = null;
        this.totalWidth = 300; // Width of the meter
        this.meterElement = null;
        this.topTriangle = null;
        this.bottomTriangle = null;
        this.tapMarker = null;
        this.tapPosition = null;
        this.hasPlayerTapped = false;
        
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
        meter.className = 'integrated-power-meter';
        this.meterElement = meter;
        
        // Add top triangle indicator (pointing down)
        const topTriangle = document.createElement('div');
        topTriangle.className = 'indicator-triangle top';
        this.topTriangle = topTriangle;
        
        // Add bottom triangle indicator (pointing up)
        const bottomTriangle = document.createElement('div');
        bottomTriangle.className = 'indicator-triangle bottom';
        this.bottomTriangle = bottomTriangle;
        
        // Create meter background
        const meterBackground = document.createElement('div');
        meterBackground.className = 'meter-background';
        
        // Add zones to meter
        this.config.zones.forEach(zone => {
            const zoneElement = document.createElement('div');
            zoneElement.className = 'meter-zone';
            zoneElement.style.width = `${zone.width * 0.75}px`; // Scale down from popup version
            zoneElement.style.backgroundColor = zone.color;
            meterBackground.appendChild(zoneElement);
        });
        
        // Create tap marker (initially hidden)
        const tapMarker = document.createElement('div');
        tapMarker.className = 'tap-marker';
        tapMarker.style.display = 'none';
        this.tapMarker = tapMarker;
        
        // Add elements to meter
        meter.appendChild(topTriangle);
        meter.appendChild(meterBackground);
        meter.appendChild(bottomTriangle);
        meter.appendChild(tapMarker);
        
        // Add instructions
        const instructions = document.createElement('div');
        instructions.className = 'meter-instructions';
        instructions.textContent = 'TAP TO START, TAP TO STOP';
        
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
        if (!this.isMoving) {
            // First click - start the meter
            this.isMoving = true;
            this.hasPlayerTapped = false;
            this.startAnimation();
        } else if (!this.hasPlayerTapped) {
            // Player's tap - mark position but continue moving
            this.hasPlayerTapped = true;
            this.tapPosition = this.position;
            this.tapMarker.style.display = 'block';
            this.tapMarker.style.left = `${this.position}px`;
        }
    }
    
    startAnimation() {
        // Reset position and markers
        this.position = 0;
        this.direction = 1;
        this.tapMarker.style.display = 'none';
        this.tapPosition = null;
        
        const animate = () => {
            if (!this.isMoving) return;
            
            // Update position
            this.position += this.speed * this.direction;
            
            // Check boundaries
            if (this.position >= this.totalWidth) {
                // Reverse direction at the end
                this.position = this.totalWidth;
                this.direction = -1;
            } else if (this.position <= 0) {
                // Reverse direction at the start
                this.position = 0;
                this.direction = 1;
            }
            
            // Update triangle positions
            this.topTriangle.style.left = `${this.position}px`;
            this.bottomTriangle.style.left = `${this.position}px`;
            
            // Continue animation or evaluate result if player has tapped
            if (this.hasPlayerTapped && this.tapPosition !== null) {
                // Stop animation after a brief delay to show the tap position
                setTimeout(() => {
                    this.isMoving = false;
                    this.stopAnimation();
                    this.evaluateResult();
                }, 500);
            } else {
                // Continue animation
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    evaluateResult() {
        let currentPosition = 0;
        let result = 'fail'; // Default
        
        // Use tapPosition for evaluation
        for (let i = 0; i < this.config.zones.length; i++) {
            const zone = this.config.zones[i];
            const zoneEnd = currentPosition + (zone.width * 0.75); // Scale down to match the visual size
            
            if (this.tapPosition >= currentPosition && this.tapPosition < zoneEnd) {
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
            
            currentPosition += (zone.width * 0.75);
        }
        
        this.result = result;
        this.showResult(result);
    }
    
    showResult(result) {
        // Create result element
        const resultElement = document.createElement('div');
        resultElement.className = `integrated-meter-result ${result}`;
        
        // Get result text from config
        let resultText = '';
        if (this.config.results[result]) {
            resultText = this.config.results[result].text;
        }
        
        resultElement.textContent = resultText;
        this.meterElement.appendChild(resultElement);
        
        // Highlight the indicator
        this.topTriangle.classList.add(result);
        this.bottomTriangle.classList.add(result);
    }
    
    getResult() {
        return this.result;
    }
}

// Function to show the integrated power meter
function showIntegratedPowerMeter(containerId, meterType, context, callback) {
    // Get the container
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        callback(null);
        return;
    }
    
    // Get meter config from game
    const game = window.gameInstance;
    const meterConfig = game.getPowerMeterConfig(meterType);
    
    if (!meterConfig) {
        console.error(`Power meter type "${meterType}" not found!`);
        callback(null);
        return;
    }
    
    // Create power meter
    const powerMeter = new IntegratedPowerMeter(container, meterConfig, context);
    
    // Listen for result
    const checkInterval = setInterval(() => {
        if (powerMeter.getResult()) {
            clearInterval(checkInterval);
            
            // Return result after delay
            setTimeout(() => {
                callback(powerMeter.getResult());
            }, 1500);
        }
    }, 100);
}

// Function for backward compatibility
function showPowerMeter(meterType, callback) {
    const context = "Test your skill and timing...";
    let containerId = 'balance-meter-container';
    
    // Get container
    let container = document.getElementById(containerId);
    if (!container) {
        // Fallback to swing meter container
        containerId = 'swing-meter-container';
        container = document.getElementById(containerId);
        
        if (!container) {
            console.error('No suitable container found for power meter!');
            callback(null);
            return;
        }
    }
    
    // Show container
    container.style.display = 'block';
    container.innerHTML = '';
    
    // Create integrated meter container
    const integratedContainer = document.createElement('div');
    integratedContainer.id = 'integrated-meter-container';
    container.appendChild(integratedContainer);
    
    // Show integrated meter
    showIntegratedPowerMeter('integrated-meter-container', meterType, context, callback);
}

// Make functions globally available
window.showIntegratedPowerMeter = showIntegratedPowerMeter;
window.showPowerMeter = showPowerMeter;