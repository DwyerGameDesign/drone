// Drone Man: The Journey - Typewriter Effect Module
class Typewriter {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            speed: options.speed || 30,
            delay: options.delay || 0,
            onComplete: options.onComplete || null,
            cursor: options.cursor || '|',
            cursorSpeed: options.cursorSpeed || 400,
            ...options
        };
        this.text = '';
        this.currentIndex = 0;
        this.isTyping = false;
        this.cursorInterval = null;
        this.cursorVisible = true;
    }

    // Start typing the text
    type(text) {
        this.text = text;
        this.currentIndex = 0;
        this.element.innerHTML = '';
        this.isTyping = true;
        
        // Start cursor animation
        this.startCursorAnimation();
        
        // Start typing after delay
        setTimeout(() => {
            this.typeNextCharacter();
        }, this.options.delay);
    }

    // Type the next character
    typeNextCharacter() {
        if (!this.isTyping || this.currentIndex >= this.text.length) {
            this.stopCursorAnimation();
            this.isTyping = false;
            if (this.options.onComplete) {
                this.options.onComplete();
            }
            return;
        }

        this.element.innerHTML = this.text.substring(0, this.currentIndex + 1);
        this.currentIndex++;

        setTimeout(() => {
            this.typeNextCharacter();
        }, this.options.speed);
    }

    // Start cursor animation
    startCursorAnimation() {
        this.cursorInterval = setInterval(() => {
            this.cursorVisible = !this.cursorVisible;
            this.updateCursor();
        }, this.options.cursorSpeed);
    }

    // Stop cursor animation
    stopCursorAnimation() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null;
        }
        this.cursorVisible = true;
        this.updateCursor();
    }

    // Update cursor visibility
    updateCursor() {
        const cursor = this.cursorVisible ? this.options.cursor : '';
        this.element.innerHTML = this.text.substring(0, this.currentIndex) + cursor;
    }

    // Stop typing immediately
    stop() {
        this.isTyping = false;
        this.stopCursorAnimation();
        this.element.innerHTML = this.text;
        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }

    // Skip to the end immediately
    skip() {
        this.stop();
        this.element.innerHTML = this.text;
    }
}

export default Typewriter; 