// Drone Man: The Journey - Power Meter Module
class PowerMeter {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.isMoving = false;
        this.position = 0;
        this.direction = 1;
        this.speed = config.speed || 5;
        this.animationId = null;
        this.result = null;
        this.totalWidth = 400; // Fixed width for the meter
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
        
        // Create popup structure
        const popup = document.createElement('div');
        popup.className = 'power-meter-popup';
        
        // Create narrative section
        const narrativeSection = document.createElement('div');
        narrativeSection.className = 'power-meter-narrative';
        narrativeSection.innerHTML = `
            <h3>${this.config.title}</h3>
            <p>${this.config.narrative}</p>
        `;
        
        // Create meter and zones
        const meter = document.createElement('div');
        meter.className = 'power-meter';
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
        meter.appendChild(topTriangle);
        meter.appendChild(meterBackground);
        meter.appendChild(bottomTriangle);
        meter.appendChild(tapMarker);
        
        // Add instructions
        const instructions = document.createElement('div');
        instructions.className = 'power-meter-instructions';
        instructions.textContent = 'TAP TO START, TAP TO STOP';
        
        // Assemble the popup
        popup.appendChild(narrativeSection);
        popup.appendChild(meter);
        popup.appendChild(instructions);
        
        // Add popup to container
        this.container.appendChild(popup);
        
        // Add click event
        popup.addEventListener('click', () => this.handleClick());
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
                // Stop at the end and show results
                this.position = this.totalWidth;
                this.isMoving = false;
                this.stopAnimation();
                if (this.hasPlayerTapped) {
                    this.evaluateResult();
                }
            } else if (this.position <= 0) {
                this.position = 0;
                this.direction = 1;
            }
            
            // Update triangle positions
            this.topTriangle.style.left = `${this.position}px`;
            this.bottomTriangle.style.left = `${this.position}px`;
            
            // Continue animation
            this.animationId = requestAnimationFrame(animate);
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
        
        // Use tapPosition instead of current position for evaluation
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
        
        this.result = result;
        this.showResult(result);
    }
    
    showResult(result) {
        // Create result element
        const resultElement = document.createElement('div');
        resultElement.className = `power-meter-result ${result}`;
        
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

// Function to create and show a power meter
function showPowerMeter(meterType, callback) {
    // Get the game container
    const gameContainer = document.querySelector('.game-container');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'power-meter-overlay';
    
    // Get meter config from game
    const game = window.gameInstance; // Assuming the game instance is accessible globally
    const meterConfig = game.getPowerMeterConfig(meterType);
    
    if (!meterConfig) {
        console.error(`Power meter type "${meterType}" not found!`);
        callback(null);
        return;
    }
    
    // Create power meter
    const powerMeter = new PowerMeter(overlay, meterConfig);
    
    // Add to the game container
    gameContainer.appendChild(overlay);
    
    // Listen for result
    const checkInterval = setInterval(() => {
        if (powerMeter.getResult()) {
            clearInterval(checkInterval);
            
            // Return result after delay
            setTimeout(() => {
                overlay.remove();
                callback(powerMeter.getResult());
            }, 2000);
        }
    }, 100);
}