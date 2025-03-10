// Drone Man: The Journey - Improved Power Meter Module
class ImprovedPowerMeter {
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
        
        // Add indicator (single triangle that moves)
        const indicator = document.createElement('div');
        indicator.className = 'meter-indicator';
        this.indicator = indicator;
        
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
        
        // Set initial position
        this.indicator.style.left = '0px';
    }
    
    handleClick() {
        if (!this.isMoving) {
            // First click - start the meter
            this.isMoving = true;
            this.hasPlayerTapped = false;
            this.animationComplete = false;
            this.position = 0;
            
            // Fix: Set the indicator position to 0px but visually it will be aligned at the start of the meter
            // due to the -50% transform. This aligns with the evaluation logic.
            this.indicator.style.left = '0px';
            this.tapMarker.style.display = 'none';
            this.startAnimation();
        } else if (!this.hasPlayerTapped && !this.animationComplete) {
            // Player's tap - mark position
            this.hasPlayerTapped = true;
            this.tapPosition = this.position;
            this.tapMarker.style.display = 'block';
            this.tapMarker.style.left = `${this.position}px`;
            
            // Stop animation and evaluate after a short delay
            setTimeout(() => {
                this.isMoving = false;
                cancelAnimationFrame(this.animationId);
                this.evaluateResult();
            }, 100);
        }
    }
    
    startAnimation() {
        const animate = () => {
            if (!this.isMoving) return;
            
            // Update position - only move right
            this.position += this.speed;
            
            // Check if we've reached the end
            if (this.position >= this.totalWidth) {
                this.position = this.totalWidth;
                this.animationComplete = true;
                
                // If player hasn't tapped, it's a fail
                if (!this.hasPlayerTapped) {
                    this.tapPosition = this.totalWidth;
                    this.hasPlayerTapped = true;
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
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    evaluateResult() {
        let currentPosition = 0;
        let result = 'fail'; // Default
        
        // Use tapPosition for evaluation
        for (let i = 0; i < this.config.zones.length; i++) {
            const zone = this.config.zones[i];
            const zoneEnd = currentPosition + zone.width;
            
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
            
            currentPosition += zone.width;
        }
        
        // Fix: If the position is at the very end (totalWidth), ensure it's a fail
        if (this.tapPosition >= this.totalWidth) {
            result = 'fail';
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
        
        // Highlight the indicator and tap marker
        this.indicator.classList.add(result);
        this.tapMarker.classList.add(result);
    }
    
    getResult() {
        return this.result;
    }
}

// Function to show the improved power meter
function showImprovedPowerMeter(containerId, meterType, context, callback) {
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
    
    const meterConfig = game.getPowerMeterConfig(meterType);
    
    if (!meterConfig) {
        console.error(`Power meter type "${meterType}" not found!`);
        callback(null);
        return;
    }
    
    // Create power meter
    const powerMeter = new ImprovedPowerMeter(container, meterConfig, context);
    
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

// Function for backward compatibility - replacing the old showPowerMeter
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
    
    // Create meter container
    const integratedContainer = document.createElement('div');
    integratedContainer.id = 'integrated-meter-container';
    container.appendChild(integratedContainer);
    
    // Show improved meter
    showImprovedPowerMeter('integrated-meter-container', meterType, context, callback);
}

// Replace the old functions with improved ones
window.showImprovedPowerMeter = showImprovedPowerMeter;
window.showPowerMeter = showPowerMeter;