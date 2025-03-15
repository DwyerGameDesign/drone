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
        this.element.appendChild(this.cursorElement);
        
        // Start cursor animation
        this.startCursorAnimation();
    }
    
    type(text) {
        // If no text is provided, use the text from options or default error message
        if (!text && !this.text) {
            this.text = this.defaultErrorMessage;
        } else if (text) {
            this.text = text;
        }
        
        this.isTyping = true;
        this.currentIndex = 0;
        this.element.textContent = '';
        this.element.appendChild(this.cursorElement);
        
        // Clear any existing interval
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
        
        // Start typing
        this.typeNextCharacter();
    }
    
    typeNextCharacter() {
        if (this.currentIndex < this.text.length) {
            const textNode = document.createTextNode(this.text[this.currentIndex]);
            this.element.insertBefore(textNode, this.cursorElement);
            this.currentIndex++;
            
            setTimeout(() => this.typeNextCharacter(), this.options.speed);
        } else {
            this.isTyping = false;
            if (typeof this.options.onComplete === 'function') {
                this.options.onComplete();
            }
        }
    }
    
    startCursorAnimation() {
        this.cursorInterval = setInterval(() => {
            this.updateCursor();
        }, this.options.cursorSpeed);
    }
    
    stopCursorAnimation() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null;
        }
    }
    
    updateCursor() {
        if (!this.cursorElement) return;
        
        const visibleText = this.text.substring(0, this.currentIndex);
        const cursorVisible = this.cursorElement.style.visibility !== 'hidden';
        this.cursorElement.style.visibility = cursorVisible ? 'hidden' : 'visible';
    }
    
    stop() {
        this.isTyping = false;
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
        this.stopCursorAnimation();
        if (this.cursorElement && this.cursorElement.parentNode) {
            this.cursorElement.parentNode.removeChild(this.cursorElement);
        }
    }
    
    skip() {
        if (!this.isTyping) return;
        
        // Stop the typing animation
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
        
        // Display all text immediately
        this.element.textContent = this.text;
        this.element.appendChild(this.cursorElement);
        this.currentIndex = this.text.length;
        this.isTyping = false;
        
        // Call onComplete callback
        if (typeof this.options.onComplete === 'function') {
            this.options.onComplete();
        }
    }
} 