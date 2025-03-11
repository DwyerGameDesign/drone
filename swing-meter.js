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
    
    // Create context element
    const contextElement = document.createElement('div');
    contextElement.className = 'meter-context';
    contextElement.textContent = context;
    container.appendChild(contextElement);
    
    // Create meter container
    const meterContainer = document.createElement('div');
    meterContainer.className = 'integrated-swing-meter';
    container.appendChild(meterContainer);
    
    // Add meter instructions
    const instructions = document.createElement('div');
    instructions.className = 'meter-instructions';
    instructions.textContent = 'TAP AT THE RIGHT MOMENT TO DETERMINE YOUR FOCUS';
    meterContainer.appendChild(instructions);
    
    // We're using our own implementation in script.js now
    // We'll just return a hook for backward compatibility
    callback('good');
}

// Replace the old functions with improved ones
window.showSwingMeter = showSwingMeter;