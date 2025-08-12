/*
========================================
TYPEWRITER EFFECT CONTROLLER
========================================
Advanced typewriter animation with multiple features:
- Multi-line typing, cursor effects, sound, speed variations
- Realistic typing patterns with mistakes and corrections
- Multiple typewriter instances, callbacks, and accessibility
*/

import CONFIG from '../core/config.js';
import Utils from '../core/utils.js';

class TypewriterController {
    constructor(element, options = {}) {
        // Validate element
        if (typeof element === 'string') {
            element = Utils.$(element);
        }
        
        if (!element) {
            throw new Error('Typewriter: Element not found');
        }

        this.element = element;
        this.options = {
            // Text and content
            text: options.text || element.dataset.typewriter || element.textContent || '',
            texts: options.texts || (element.dataset.typewriterTexts ? 
                JSON.parse(element.dataset.typewriterTexts) : []),
            
            // Timing and speed
            typeSpeed: parseInt(options.typeSpeed || element.dataset.typeSpeed) || 50,
            deleteSpeed: parseInt(options.deleteSpeed || element.dataset.deleteSpeed) || 30,
            pauseFor: parseInt(options.pauseFor || element.dataset.pauseFor) || 1500,
            startDelay: parseInt(options.startDelay || element.dataset.startDelay) || 0,
            
            // Cursor options
            cursor: options.cursor !== undefined ? options.cursor : 
                   (element.dataset.cursor !== undefined ? element.dataset.cursor : '|'),
            cursorBlinkSpeed: parseInt(options.cursorBlinkSpeed || element.dataset.cursorBlinkSpeed) || 500,
            showCursor: options.showCursor !== false && element.dataset.showCursor !== 'false',
            
            // Behavior
            loop: options.loop !== undefined ? options.loop : 
                  (element.dataset.loop !== undefined ? element.dataset.loop !== 'false' : true),
            deleteAll: options.deleteAll !== false && element.dataset.deleteAll !== 'false',
            shuffle: options.shuffle === true || element.dataset.shuffle === 'true',
            autoStart: options.autoStart !== false && element.dataset.autoStart !== 'false',
            
            // Realistic typing
            humanize: options.humanize !== false && element.dataset.humanize !== 'false',
            mistakeChance: parseFloat(options.mistakeChance || element.dataset.mistakeChance) || 0.02,
            mistakeDelay: parseInt(options.mistakeDelay || element.dataset.mistakeDelay) || 100,
            
            // Visual effects
            highlightSpeed: parseInt(options.highlightSpeed || element.dataset.highlightSpeed) || 20,
            fadeIn: options.fadeIn === true || element.dataset.fadeIn === 'true',
            typeClass: options.typeClass || element.dataset.typeClass || 'typing',
            completeClass: options.completeClass || element.dataset.completeClass || 'typing-complete',
            
            // Callbacks
            onStart: options.onStart || null,
            onComplete: options.onComplete || null,
            onLoop: options.onLoop || null,
            onChar: options.onChar || null,
            onDelete: options.onDelete || null,
            onPause: options.onPause || null,
            
            // Accessibility
            skipAnimation: options.skipAnimation === true || 
                          (Utils.prefersReducedMotion() && options.respectReducedMotion !== false),
            announceText: options.announceText !== false && element.dataset.announceText !== 'false',
            
            // Debug
            debug: options.debug === true || element.dataset.debug === 'true'
        };

        // State management
        this.state = {
            isRunning: false,
            isPaused: false,
            currentTextIndex: 0,
            currentCharIndex: 0,
            currentText: '',
            direction: 'typing', // 'typing' or 'deleting'
            loopCount: 0,
            mistakes: []
        };

        // Animation references
        this.timeouts = new Set();
        this.intervals = new Set();
        this.cursorInterval = null;

        // DOM elements
        this.textElement = null;
        this.cursorElement = null;

        // Initialize
        this.init();
    }

    // ===========================================
    // INITIALIZATION
    // ===========================================
    
    init() {
        try {
            Utils.debug('Initializing typewriter', { 
                element: this.element, 
                options: this.options 
            });

            // Setup DOM structure
            this.setupDOM();
            
            // Prepare texts
            this.prepareTexts();
            
            // Setup cursor
            this.setupCursor();
            
            // Setup accessibility
            this.setupAccessibility();
            
            // Start if auto-start is enabled
            if (this.options.autoStart) {
                if (this.options.startDelay > 0) {
                    this.delay(() => this.start(), this.options.startDelay);
                } else {
                    this.start();
                }
            }

            Utils.debug('Typewriter initialized successfully');

        } catch (error) {
            Utils.handleError(error, 'Typewriter initialization');
        }
    }

    setupDOM() {
        // Store original content
        this.originalContent = this.element.innerHTML;
        
        // Clear element
        this.element.innerHTML = '';
        
        // Create text container
        this.textElement = document.createElement('span');
        this.textElement.className = 'typewriter-text';
        this.element.appendChild(this.textElement);
        
        // Add typing class
        Utils.addClass(this.element, this.options.typeClass);
        
        // Set initial styles
        if (this.options.fadeIn) {
            this.element.style.opacity = '0';
        }
    }

    prepareTexts() {
        // Determine texts to type
        if (this.options.texts.length > 0) {
            this.texts = [...this.options.texts];
        } else if (this.options.text) {
            this.texts = [this.options.text];
        } else {
            this.texts = [this.originalContent];
        }

        // Shuffle if requested
        if (this.options.shuffle) {
            this.texts = Utils.shuffleArray([...this.texts]);
        }

        // Set initial text
        this.state.currentText = this.texts[0] || '';
        
        Utils.debug('Texts prepared', { texts: this.texts });
    }

    setupCursor() {
        if (!this.options.showCursor) return;

        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'typewriter-cursor';
        this.cursorElement.textContent = this.options.cursor;
        this.element.appendChild(this.cursorElement);

        // Start cursor blinking
        this.startCursorBlink();
    }

    startCursorBlink() {
        if (!this.cursorElement || this.options.cursorBlinkSpeed <= 0) return;

        this.cursorInterval = setInterval(() => {
            if (this.cursorElement) {
                const isVisible = this.cursorElement.style.opacity !== '0';
                this.cursorElement.style.opacity = isVisible ? '0' : '1';
            }
        }, this.options.cursorBlinkSpeed);

        this.intervals.add(this.cursorInterval);
    }

    stopCursorBlink() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.intervals.delete(this.cursorInterval);
            this.cursorInterval = null;
        }
        
        if (this.cursorElement) {
            this.cursorElement.style.opacity = '1';
        }
    }

    setupAccessibility() {
        // Set ARIA attributes
        this.element.setAttribute('role', 'status');
        this.element.setAttribute('aria-live', 'polite');
        this.element.setAttribute('aria-atomic', 'true');
        
        // Add screen reader only text if needed
        if (this.options.announceText) {
            const srText = document.createElement('span');
            srText.className = 'sr-only';
            srText.textContent = 'Typing animation in progress';
            this.element.appendChild(srText);
            this.srElement = srText;
        }
    }

    // ===========================================
    // ANIMATION CONTROL
    // ===========================================
    
    start() {
        if (this.state.isRunning) return this;

        this.state.isRunning = true;
        this.state.isPaused = false;
        
        // Fade in if enabled
        if (this.options.fadeIn) {
            this.element.style.transition = 'opacity 0.3s ease';
            this.element.style.opacity = '1';
        }

        // Call start callback
        this.callCallback('onStart', this);

        // Skip animation if reduced motion
        if (this.options.skipAnimation) {
            this.showFinalText();
            return this;
        }

        // Start typing
        this.typeNextChar();
        
        Utils.debug('Typewriter started');
        return this;
    }

    pause() {
        this.state.isPaused = true;
        this.clearTimeouts();
        this.callCallback('onPause', this);
        
        Utils.debug('Typewriter paused');
        return this;
    }

    resume() {
        if (!this.state.isPaused) return this;
        
        this.state.isPaused = false;
        
        if (this.state.direction === 'typing') {
            this.typeNextChar();
        } else {
            this.deleteNextChar();
        }
        
        Utils.debug('Typewriter resumed');
        return this;
    }

    stop() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.clearTimeouts();
        this.clearIntervals();
        
        Utils.debug('Typewriter stopped');
        return this;
    }

    reset() {
        this.stop();
        this.state.currentTextIndex = 0;
        this.state.currentCharIndex = 0;
        this.state.direction = 'typing';
        this.state.loopCount = 0;
        this.textElement.textContent = '';
        
        Utils.removeClass(this.element, this.options.completeClass);
        Utils.addClass(this.element, this.options.typeClass);
        
        Utils.debug('Typewriter reset');
        return this;
    }

    // ===========================================
    // TYPING LOGIC
    // ===========================================
    
    typeNextChar() {
        if (!this.state.isRunning || this.state.isPaused) return;

        const currentText = this.state.currentText;
        const charIndex = this.state.currentCharIndex;

        // Check if text is complete
        if (charIndex >= currentText.length) {
            this.onTextComplete();
            return;
        }

        // Get next character
        const nextChar = currentText[charIndex];
        
        // Handle mistakes if humanize is enabled
        if (this.options.humanize && this.shouldMakeMistake()) {
            this.makeMistake(nextChar);
            return;
        }

        // Type the character
        this.typeCharacter(nextChar);
        
        // Move to next character
        this.state.currentCharIndex++;
        
        // Schedule next character
        const delay = this.getTypingDelay();
        this.delay(() => this.typeNextChar(), delay);
    }

    typeCharacter(char) {
        // Add character to display
        this.textElement.textContent += char;
        
        // Call character callback
        this.callCallback('onChar', char, this.state.currentCharIndex, this);
        
        // Update screen reader
        this.updateScreenReader();
        
        Utils.debug('Character typed', { char, index: this.state.currentCharIndex });
    }

    deleteNextChar() {
        if (!this.state.isRunning || this.state.isPaused) return;

        const currentDisplay = this.textElement.textContent;
        
        // Check if deletion is complete
        if (currentDisplay.length === 0) {
            this.onDeletionComplete();
            return;
        }

        // Remove last character
        this.textElement.textContent = currentDisplay.slice(0, -1);
        
        // Call delete callback
        this.callCallback('onDelete', currentDisplay.length - 1, this);
        
        // Schedule next deletion
        const delay = this.getDeleteDelay();
        this.delay(() => this.deleteNextChar(), delay);
    }

    // ===========================================
    // MISTAKE HANDLING
    // ===========================================
    
    shouldMakeMistake() {
        return Math.random() < this.options.mistakeChance;
    }

    makeMistake(correctChar) {
        // Generate a random incorrect character
        const incorrectChars = 'abcdefghijklmnopqrstuvwxyz';
        const incorrectChar = incorrectChars[Math.floor(Math.random() * incorrectChars.length)];
        
        // Type incorrect character
        this.typeCharacter(incorrectChar);
        
        // Store mistake info
        const mistake = {
            position: this.state.currentCharIndex,
            incorrect: incorrectChar,
            correct: correctChar
        };
        this.state.mistakes.push(mistake);
        
        // Schedule correction
        this.delay(() => {
            this.correctMistake(mistake);
        }, this.options.mistakeDelay);
        
        Utils.debug('Mistake made', mistake);
    }

    correctMistake(mistake) {
        // Delete incorrect character
        this.textElement.textContent = this.textElement.textContent.slice(0, -1);
        
        // Type correct character
        this.typeCharacter(mistake.correct);
        
        // Continue with next character
        this.state.currentCharIndex++;
        
        // Schedule next character
        const delay = this.getTypingDelay();
        this.delay(() => this.typeNextChar(), delay);
    }

    // ===========================================
    // TEXT COMPLETION HANDLING
    // ===========================================
    
    onTextComplete() {
        Utils.debug('Text complete', { 
            textIndex: this.state.currentTextIndex,
            hasMoreTexts: this.hasMoreTexts()
        });

        // Pause before next action
        this.delay(() => {
            if (this.hasMoreTexts()) {
                this.moveToNextText();
            } else {
                this.onAllTextsComplete();
            }
        }, this.options.pauseFor);
    }

    hasMoreTexts() {
        return this.state.currentTextIndex < this.texts.length - 1;
    }

    moveToNextText() {
        if (this.options.deleteAll) {
            // Delete current text before typing next
            this.state.direction = 'deleting';
            this.deleteNextChar();
        } else {
            // Move directly to next text
            this.state.currentTextIndex++;
            this.state.currentCharIndex = 0;
            this.state.currentText = this.texts[this.state.currentTextIndex];
            this.state.direction = 'typing';
            
            // Add line break if multiple texts
            this.textElement.innerHTML += '<br>';
            
            this.typeNextChar();
        }
    }

    onDeletionComplete() {
        // Move to next text
        this.state.currentTextIndex++;
        this.state.currentCharIndex = 0;
        this.state.direction = 'typing';
        
        // Check if we have more texts or should loop
        if (this.state.currentTextIndex >= this.texts.length) {
            if (this.options.loop) {
                this.state.currentTextIndex = 0;
                this.state.loopCount++;
                this.callCallback('onLoop', this.state.loopCount, this);
            } else {
                this.onAllTextsComplete();
                return;
            }
        }
        
        // Set next text
        this.state.currentText = this.texts[this.state.currentTextIndex];
        
        // Start typing next text
        this.typeNextChar();
    }

    onAllTextsComplete() {
        this.state.isRunning = false;
        
        // Add completion class
        Utils.removeClass(this.element, this.options.typeClass);
        Utils.addClass(this.element, this.options.completeClass);
        
        // Stop cursor blinking if this is the final completion
        if (!this.options.loop) {
            this.stopCursorBlink();
        }
        
        // Call completion callback
        this.callCallback('onComplete', this);
        
        // Update screen reader with final text
        this.updateScreenReader(true);
        
        Utils.debug('All texts complete');
    }

    showFinalText() {
        // Show all texts immediately (for reduced motion)
        const finalText = this.texts.join('<br>');
        this.textElement.innerHTML = finalText;
        
        Utils.addClass(this.element, this.options.completeClass);
        Utils.removeClass(this.element, this.options.typeClass);
        
        this.callCallback('onComplete', this);
        this.updateScreenReader(true);
    }

    // ===========================================
    // TIMING AND DELAYS
    // ===========================================
    
    getTypingDelay() {
        let baseDelay = this.options.typeSpeed;
        
        if (this.options.humanize) {
            // Add random variation for human-like typing
            const variation = baseDelay * 0.3;
            baseDelay += (Math.random() - 0.5) * variation;
            
            // Slower for punctuation
            const currentChar = this.state.currentText[this.state.currentCharIndex - 1];
            if (currentChar && '.,!?;:'.includes(currentChar)) {
                baseDelay *= 1.5;
            }
        }
        
        return Math.max(baseDelay, 10); // Minimum 10ms delay
    }

    getDeleteDelay() {
        let baseDelay = this.options.deleteSpeed;
        
        if (this.options.humanize) {
            const variation = baseDelay * 0.2;
            baseDelay += (Math.random() - 0.5) * variation;
        }
        
        return Math.max(baseDelay, 5); // Minimum 5ms delay
    }

    delay(callback, ms) {
        const timeoutId = setTimeout(() => {
            this.timeouts.delete(timeoutId);
            callback();
        }, ms);
        
        this.timeouts.add(timeoutId);
        return timeoutId;
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================
    
    callCallback(name, ...args) {
        const callback = this.options[name];
        if (typeof callback === 'function') {
            try {
                callback.apply(this, args);
            } catch (error) {
                Utils.error(`Typewriter callback error (${name}):`, error);
            }
        }
    }

    updateScreenReader(isComplete = false) {
        if (!this.options.announceText || !this.srElement) return;
        
        if (isComplete) {
            this.srElement.textContent = `Typing complete: ${this.textElement.textContent}`;
        } else {
            // Update periodically to avoid too many announcements
            Utils.debounce(() => {
                this.srElement.textContent = `Typing: ${this.textElement.textContent}`;
            }, 1000)();
        }
    }

    clearTimeouts() {
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts.clear();
    }

    clearIntervals() {
        this.intervals.forEach(id => clearInterval(id));
        this.intervals.clear();
    }

    // ===========================================
    // PUBLIC API
    // ===========================================
    
    // Add new text to the queue
    addText(text) {
        this.texts.push(text);
        return this;
    }

    // Change typing speed
    setSpeed(typeSpeed, deleteSpeed) {
        this.options.typeSpeed = typeSpeed;
        if (deleteSpeed !== undefined) {
            this.options.deleteSpeed = deleteSpeed;
        }
        return this;
    }

    // Change current text (will take effect on next cycle)
    setText(text) {
        this.options.text = text;
        this.texts = [text];
        return this;
    }

    // Change multiple texts
    setTexts(texts) {
        this.texts = [...texts];
        return this;
    }

    // Get current state
    getState() {
        return { ...this.state };
    }

    // Get current display text
    getCurrentText() {
        return this.textElement.textContent;
    }

    // Get all texts
    getTexts() {
        return [...this.texts];
    }

    // Check if animation is running
    isRunning() {
        return this.state.isRunning;
    }

    // Check if animation is paused
    isPaused() {
        return this.state.isPaused;
    }

    // Toggle pause/resume
    toggle() {
        if (this.state.isPaused) {
            this.resume();
        } else if (this.state.isRunning) {
            this.pause();
        } else {
            this.start();
        }
        return this;
    }

    // ===========================================
    // CLEANUP
    // ===========================================
    
    destroy() {
        // Stop all animations
        this.stop();
        
        // Clear all timeouts and intervals
        this.clearTimeouts();
        this.clearIntervals();
        
        // Remove cursor blinking
        this.stopCursorBlink();
        
        // Restore original content if needed
        if (this.originalContent && !this.options.preserveTypedContent) {
            this.element.innerHTML = this.originalContent;
        }
        
        // Remove classes
        Utils.removeClass(this.element, [this.options.typeClass, this.options.completeClass]);
        
        // Remove ARIA attributes
        this.element.removeAttribute('role');
        this.element.removeAttribute('aria-live');
        this.element.removeAttribute('aria-atomic');
        
        Utils.debug('Typewriter destroyed');
    }
}

// ===========================================
// TYPEWRITER MANAGER
// ===========================================

class TypewriterManager {
    constructor() {
        this.instances = new Map();
        this.globalDefaults = {};
    }

    // Create a new typewriter instance
    create(element, options = {}) {
        const mergedOptions = { ...this.globalDefaults, ...options };
        const typewriter = new TypewriterController(element, mergedOptions);
        
        // Store instance with element as key
        this.instances.set(element, typewriter);
        
        return typewriter;
    }

    // Get existing instance
    get(element) {
        if (typeof element === 'string') {
            element = Utils.$(element);
        }
        return this.instances.get(element);
    }

    // Initialize all elements with data-typewriter attribute
    autoInit(selector = '[data-typewriter]') {
        const elements = Utils.$$(selector);
        const typewriters = [];

        elements.forEach(element => {
            if (!this.instances.has(element)) {
                const typewriter = this.create(element);
                typewriters.push(typewriter);
            }
        });

        Utils.debug(`Auto-initialized ${typewriters.length} typewriters`);
        return typewriters;
    }

    // Set global defaults
    setDefaults(defaults) {
        this.globalDefaults = { ...this.globalDefaults, ...defaults };
    }

    // Control all instances
    startAll() {
        this.instances.forEach(typewriter => typewriter.start());
    }

    pauseAll() {
        this.instances.forEach(typewriter => typewriter.pause());
    }

    resumeAll() {
        this.instances.forEach(typewriter => typewriter.resume());
    }

    stopAll() {
        this.instances.forEach(typewriter => typewriter.stop());
    }

    // Get performance metrics
    getMetrics() {
        return {
            totalInstances: this.instances.size,
            runningInstances: Array.from(this.instances.values())
                .filter(t => t.isRunning()).length,
            pausedInstances: Array.from(this.instances.values())
                .filter(t => t.isPaused()).length
        };
    }

    // Cleanup
    destroyAll() {
        this.instances.forEach(typewriter => typewriter.destroy());
        this.instances.clear();
    }

    destroy(element) {
        if (typeof element === 'string') {
            element = Utils.$(element);
        }
        
        const typewriter = this.instances.get(element);
        if (typewriter) {
            typewriter.destroy();
            this.instances.delete(element);
        }
    }
}

// ===========================================
// CSS INJECTION
// ===========================================

const injectTypewriterCSS = () => {
    if (document.querySelector('#typewriter-css')) return;

    const css = `
        <style id="typewriter-css">
        /* Typewriter base styles */
        .typewriter-text {
            display: inline;
        }

        .typewriter-cursor {
            display: inline-block;
            font-weight: 100;
            margin-left: 1px;
            animation: typewriter-blink 1s infinite;
        }

        @keyframes typewriter-blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }

        /* Typing state */
        .typing .typewriter-cursor {
            animation-play-state: running;
        }

        .typing-complete .typewriter-cursor {
            animation-play-state: paused;
            opacity: 0;
        }

        /* Screen reader only content */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            .typewriter-cursor {
                animation: none;
                opacity: 1;
            }
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', css);
};

// Auto-inject CSS
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectTypewriterCSS);
    } else {
        injectTypewriterCSS();
    }
}

// ===========================================
// EXPORT
// ===========================================

export default TypewriterController;
export { TypewriterManager };

// Global instance
const typewriterManager = new TypewriterManager();

// Convenience functions
export const createTypewriter = (element, options) => typewriterManager.create(element, options);
export const getTypewriter = (element) => typewriterManager.get(element);
export const autoInitTypewriters = (selector) => typewriterManager.autoInit(selector);

// Global availability
if (typeof window !== 'undefined') {
    window.Typewriter = TypewriterController;
    window.TypewriterManager = TypewriterManager;
    window.typewriterManager = typewriterManager;
    
    // Auto-initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        typewriterManager.autoInit();
    });
}
