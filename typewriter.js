// Drone Man: The Journey - Typewriter Effect Module
export default class Typewriter {
    constructor(element, options = {}) {
        this.element = element;
        this.text = '';
        this.currentIndex = 0;
        this.isTyping = false;
        this.typingInterval = null;
        this.cursorInterval = null;
        this.defaultErrorMessage = "ERROR: Text Not Initiated";
        
        // Default options
        this.options = {
            speed: options.speed || 30,
            delay: options.delay || 500,
            cursor: options.cursor || '|',
            cursorSpeed: options.cursorSpeed || 400,
            onComplete: options.onComplete || (() => {}),
            text: options.text || ''
        };
        
        // Initialize text from options if provided
        if (this.options.text) {
            this.text = this.options.text;
        }
        
        // Create cursor element
        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'typewriter-cursor';
        this.cursorElement.textContent = this.options.cursor;
        this.cursorElement.style.display = 'inline-block';
        this.cursorElement.style.marginLeft = '2px';
        this.cursorElement.style.animation = `cursorBlink ${this.options.cursorSpeed}ms infinite`;
        
        // Add cursor to element
        this.element.appendChild(this.cursorElement);
    }
    
    type(text) {
        // If no text is provided, use the text from options or default error message
        if (!text && !this.text) {
            this.text = this.defaultErrorMessage;
        } else if (text) {
            this.text = text;
        }
        
        // Reset element and state
        this.isTyping = true;
        this.currentIndex = 0;
        this.element.textContent = '';
        this.element.appendChild(this.cursorElement);
        
        // Add CSS for cursor blinking if it doesn't exist
        if (!document.getElementById('typewriter-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'typewriter-styles';
            styleEl.textContent = `
                @keyframes cursorBlink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0; }
                }
            `;
            document.head.appendChild(styleEl);
        }
        
        // Start typing with a slight delay
        setTimeout(() => this.typeNextCharacter(), this.options.delay);
        
        return this; // For chaining
    }
    
    typeNextCharacter() {
        if (!this.isTyping) return;
        
        if (this.currentIndex < this.text.length) {
            // Create a text node for the current character
            const textNode = document.createTextNode(this.text[this.currentIndex]);
            
            // Insert before the cursor
            this.element.insertBefore(textNode, this.cursorElement);
            
            // Increment index
            this.currentIndex++;
            
            // Schedule next character
            setTimeout(() => this.typeNextCharacter(), this.options.speed);
        } else {
            // Typing complete
            this.isTyping = false;
            
            // Call the onComplete callback
            if (typeof this.options.onComplete === 'function') {
                this.options.onComplete();
            }
        }
    }
    
    stop() {
        this.isTyping = false;
        
        // Remove the cursor element if it exists
        if (this.cursorElement && this.cursorElement.parentNode) {
            this.cursorElement.parentNode.removeChild(this.cursorElement);
        }
    }
    
    skip() {
        if (!this.isTyping) return;
        
        // Display all text immediately
        this.element.textContent = this.text;
        
        // Append the cursor
        this.element.appendChild(this.cursorElement);
        
        // Update state
        this.currentIndex = this.text.length;
        this.isTyping = false;
        
        // Call the onComplete callback
        if (typeof this.options.onComplete === 'function') {
            this.options.onComplete();
        }
    }
}