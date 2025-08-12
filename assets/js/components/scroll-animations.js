/*
========================================
SCROLL ANIMATIONS CONTROLLER
========================================
Advanced scroll-triggered animations with performance optimization
and accessibility support
*/

import CONFIG from '../core/config.js';
import Utils from '../core/utils.js';

class ScrollAnimationsController {
    constructor(options = {}) {
        this.options = {
            // Animation timing
            duration: options.duration || 800,
            delay: options.delay || 0,
            stagger: options.stagger || 100,
            
            // Intersection observer options
            threshold: options.threshold || 0.15,
            rootMargin: options.rootMargin || '50px',
            
            // Performance
            useRequestIdleCallback: options.useRequestIdleCallback !== false,
            debounceResize: options.debounceResize || 250,
            
            // Features
            enableParallax: options.enableParallax !== false,
            enableCounters: options.enableCounters !== false,
            enableProgressBars: options.enableProgressBars !== false,
            
            // Accessibility
            respectReducedMotion: options.respectReducedMotion !== false,
            
            // Debug
            debug: options.debug || false
        };

        // State management
        this.observers = new Map();
        this.animatedElements = new Set();
        this.parallaxElements = new Set();
        this.activeAnimations = new Map();
        
        // Performance tracking
        this.lastScrollTime = 0;
        this.ticking = false;
        this.isReduced = false;

        // Initialize
        this.init();
    }

    // ===========================================
    // INITIALIZATION
    // ===========================================
    
    init() {
        try {
            Utils.info('Initializing scroll animations controller');

            // Check for reduced motion preference
            this.checkReducedMotionPreference();

            // Setup observers and animations
            this.setupIntersectionObservers();
            this.setupScrollListeners();
            this.setupResizeListener();
            
            // Initialize existing elements
            this.scanForAnimatableElements();

            Utils.info('Scroll animations controller initialized', {
                reducedMotion: this.isReduced,
                options: this.options
            });

        } catch (error) {
            Utils.handleError(error, 'Scroll animations initialization');
        }
    }

    checkReducedMotionPreference() {
        if (!this.options.respectReducedMotion) return;

        this.isReduced = window.matchMedia && 
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Listen for preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', (e) => {
                this.isReduced = e.matches;
                this.handleReducedMotionChange();
            });
        }

        if (this.isReduced) {
            Utils.info('Reduced motion preference detected - animations will be simplified');
        }
    }

    handleReducedMotionChange() {
        if (this.isReduced) {
            this.disableAnimations();
        } else {
            this.enableAnimations();
        }
    }

    // ===========================================
    // ELEMENT SCANNING
    // ===========================================
    
    scanForAnimatableElements() {
        const selectors = [
            '[data-aos]',
            '[data-scroll]', 
            '[data-parallax]',
            '[data-counter]',
            '[data-progress]',
            '.animate-on-scroll',
            '.fade-in',
            '.slide-in',
            '.scale-in',
            '.rotate-in'
        ];

        const elements = Utils.$$(selectors.join(', '));
        
        elements.forEach(element => {
            this.registerElement(element);
        });

        Utils.debug(`Found ${elements.length} animatable elements`);
    }

    registerElement(element) {
        if (this.animatedElements.has(element)) return;

        const animationType = this.getAnimationType(element);
        
        // Set initial state
        this.setInitialState(element, animationType);
        
        // Register with appropriate observer
        this.observeElement(element, animationType);
        
        this.animatedElements.add(element);
    }

    getAnimationType(element) {
        // Priority order for determining animation type
        if (element.hasAttribute('data-parallax')) return 'parallax';
        if (element.hasAttribute('data-counter')) return 'counter';
        if (element.hasAttribute('data-progress')) return 'progress';
        if (element.hasAttribute('data-aos')) return 'aos';
        if (element.hasAttribute('data-scroll')) return 'scroll';
        
        // Check CSS classes
        const classList = element.classList;
        if (classList.contains('fade-in')) return 'fade';
        if (classList.contains('slide-in')) return 'slide';
        if (classList.contains('scale-in')) return 'scale';
        if (classList.contains('rotate-in')) return 'rotate';
        
        return 'fade'; // default
    }

    // ===========================================
    // INTERSECTION OBSERVERS
    // ===========================================
    
    setupIntersectionObservers() {
        // Main animation observer
        this.observers.set('main', new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        ));

        // Counter observer (higher threshold)
        if (this.options.enableCounters) {
            this.observers.set('counter', new IntersectionObserver(
                this.handleCounterIntersection.bind(this),
                {
                    threshold: 0.7,
                    rootMargin: '0px'
                }
            ));
        }

        // Progress bar observer
        if (this.options.enableProgressBars) {
            this.observers.set('progress', new IntersectionObserver(
                this.handleProgressIntersection.bind(this),
                {
                    threshold: 0.5,
                    rootMargin: '50px'
                }
            ));
        }

        // Parallax observer (for triggering)
        if (this.options.enableParallax) {
            this.observers.set('parallax', new IntersectionObserver(
                this.handleParallaxIntersection.bind(this),
                {
                    threshold: 0,
                    rootMargin: '100px'
                }
            ));
        }
    }

    observeElement(element, type) {
        const observerMap = {
            'counter': 'counter',
            'progress': 'progress', 
            'parallax': 'parallax'
        };

        const observerKey = observerMap[type] || 'main';
        const observer = this.observers.get(observerKey);
        
        if (observer) {
            observer.observe(element);
        }
    }

    // ===========================================
    // INTERSECTION HANDLERS
    // ===========================================
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.hasAnimated(entry.target)) {
                this.triggerAnimation(entry.target);
            }
        });
    }

    handleCounterIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.hasAnimated(entry.target)) {
                this.animateCounter(entry.target);
                this.observers.get('counter').unobserve(entry.target);
            }
        });
    }

    handleProgressIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.hasAnimated(entry.target)) {
                this.animateProgress(entry.target);
                this.observers.get('progress').unobserve(entry.target);
            }
        });
    }

    handleParallaxIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.parallaxElements.add(entry.target);
            } else {
                this.parallaxElements.delete(entry.target);
            }
        });
    }

    // ===========================================
    // ANIMATION EXECUTION
    // ===========================================
    
    triggerAnimation(element) {
        if (this.isReduced) {
            this.showElementImmediate(element);
            return;
        }

        const animationType = this.getAnimationType(element);
        const delay = this.getElementDelay(element);

        // Apply stagger delay if element is part of a group
        const staggerDelay = this.calculateStaggerDelay(element);
        const totalDelay = delay + staggerDelay;

        if (totalDelay > 0) {
            setTimeout(() => {
                this.executeAnimation(element, animationType);
            }, totalDelay);
        } else {
            this.executeAnimation(element, animationType);
        }

        this.markAsAnimated(element);
    }

    executeAnimation(element, type) {
        const animationClass = this.getAnimationClass(type);
        const customAnimation = element.dataset.animation;

        // Remove initial state classes
        this.removeInitialState(element);

        // Apply animation class
        if (customAnimation) {
            Utils.addClass(element, customAnimation);
        } else {
            Utils.addClass(element, animationClass);
        }

        // Track animation
        this.trackAnimation(element, type);

        Utils.debug('Animation executed', { element, type, class: animationClass });
    }

    getAnimationClass(type) {
        const animationClasses = {
            'fade': 'aos-fade-in',
            'slide': 'aos-slide-in',
            'scale': 'aos-scale-in',
            'rotate': 'aos-rotate-in',
            'aos': 'aos-animate',
            'scroll': 'scroll-animate'
        };

        return animationClasses[type] || 'aos-fade-in';
    }

    // ===========================================
    // COUNTER ANIMATIONS
    // ===========================================
    
    animateCounter(element) {
        if (this.hasAnimated(element)) return;

        const startValue = parseInt(element.dataset.counterStart) || 0;
        const endValue = parseInt(element.dataset.counter) || parseInt(element.dataset.count) || 100;
        const duration = parseInt(element.dataset.counterDuration) || 2000;
        const suffix = element.dataset.counterSuffix || '';
        const prefix = element.dataset.counterPrefix || '';

        if (this.isReduced) {
            element.textContent = prefix + endValue + suffix;
            this.markAsAnimated(element);
            return;
        }

        const startTime = performance.now();
        const range = endValue - startValue;

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easedProgress = this.easeOutCubic(progress);
            const currentValue = Math.floor(startValue + (range * easedProgress));
            
            element.textContent = prefix + currentValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = prefix + endValue + suffix;
                this.markAsAnimated(element);
                
                // Trigger completion callback if exists
                const onComplete = element.dataset.counterComplete;
                if (onComplete && typeof window[onComplete] === 'function') {
                    window[onComplete](element);
                }
            }
        };

        requestAnimationFrame(updateCounter);
        Utils.debug('Counter animation started', { element, startValue, endValue, duration });
    }

    // ===========================================
    // PROGRESS BAR ANIMATIONS
    // ===========================================
    
    animateProgress(element) {
        if (this.hasAnimated(element)) return;

        const targetWidth = element.dataset.progress || element.dataset.width || '100%';
        const duration = parseInt(element.dataset.progressDuration) || 1500;
        const delay = parseInt(element.dataset.progressDelay) || 0;

        const executeProgress = () => {
            if (this.isReduced) {
                element.style.width = targetWidth;
                this.markAsAnimated(element);
                return;
            }

            // Find the progress bar element (might be child)
            const progressBar = element.querySelector('.progress-bar, .skill-progress, .progress-fill') || element;
            
            // Set initial width
            progressBar.style.width = '0%';
            progressBar.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

            // Trigger animation
            Utils.requestIdleCallback(() => {
                progressBar.style.width = targetWidth;
                
                // Mark as animated after duration
                setTimeout(() => {
                    this.markAsAnimated(element);
                }, duration);
            });
        };

        if (delay > 0) {
            setTimeout(executeProgress, delay);
        } else {
            executeProgress();
        }

        Utils.debug('Progress animation started', { element, targetWidth, duration, delay });
    }

    // ===========================================
    // PARALLAX EFFECTS
    // ===========================================
    
    setupScrollListeners() {
        if (!this.options.enableParallax) return;

        const handleScroll = () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateParallaxElements();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        };

        Utils.on(window, 'scroll', handleScroll, { passive: true });
        Utils.debug('Scroll listeners setup for parallax effects');
    }

    updateParallaxElements() {
        if (this.isReduced || this.parallaxElements.size === 0) return;

        const scrollTop = window.pageYOffset;
        const viewportHeight = window.innerHeight;

        this.parallaxElements.forEach(element => {
            this.updateParallaxElement(element, scrollTop, viewportHeight);
        });
    }

    updateParallaxElement(element, scrollTop, viewportHeight) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementHeight = rect.height;
        
        // Calculate if element is in viewport
        const inViewport = (elementTop < scrollTop + viewportHeight) && 
                          (elementTop + elementHeight > scrollTop);
        
        if (!inViewport) return;

        // Get parallax settings
        const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
        const direction = element.dataset.parallaxDirection || 'up';
        const property = element.dataset.parallaxProperty || 'transform';

        // Calculate parallax offset
        const elementCenter = elementTop + (elementHeight / 2);
        const viewportCenter = scrollTop + (viewportHeight / 2);
        const distance = elementCenter - viewportCenter;
        const offset = distance * speed;

        // Apply parallax effect
        this.applyParallaxTransform(element, offset, direction, property);
    }

    applyParallaxTransform(element, offset, direction, property) {
        let transform = '';

        switch (direction) {
            case 'up':
                transform = `translateY(${-offset}px)`;
                break;
            case 'down':
                transform = `translateY(${offset}px)`;
                break;
            case 'left':
                transform = `translateX(${-offset}px)`;
                break;
            case 'right':
                transform = `translateX(${offset}px)`;
                break;
            case 'scale':
                const scale = 1 + (offset * 0.001);
                transform = `scale(${scale})`;
                break;
            case 'rotate':
                transform = `rotate(${offset * 0.1}deg)`;
                break;
        }

        if (property === 'transform') {
            element.style.transform = transform;
        } else {
            // Custom property handling
            element.style[property] = `${offset}px`;
        }
    }

    // ===========================================
    // INITIAL STATES
    // ===========================================
    
    setInitialState(element, type) {
        if (this.isReduced) return;

        // Add base animation class for CSS transitions
        Utils.addClass(element, 'aos-element');

        // Set type-specific initial states
        switch (type) {
            case 'fade':
                element.style.opacity = '0';
                break;
            case 'slide':
                this.setSlideInitialState(element);
                break;
            case 'scale':
                element.style.transform = 'scale(0.8)';
                element.style.opacity = '0';
                break;
            case 'rotate':
                element.style.transform = 'rotate(10deg) scale(0.9)';
                element.style.opacity = '0';
                break;
            case 'parallax':
                element.style.willChange = 'transform';
                break;
        }

        // Set custom initial state if specified
        const customInitial = element.dataset.initialState;
        if (customInitial) {
            this.applyCustomState(element, customInitial);
        }
    }

    setSlideInitialState(element) {
        const direction = element.dataset.slideDirection || 
                         element.dataset.aosDirection || 'up';
        
        let transform = '';
        switch (direction) {
            case 'up':
                transform = 'translateY(50px)';
                break;
            case 'down':
                transform = 'translateY(-50px)';
                break;
            case 'left':
                transform = 'translateX(50px)';
                break;
            case 'right':
                transform = 'translateX(-50px)';
                break;
        }

        element.style.transform = transform;
        element.style.opacity = '0';
    }

    removeInitialState(element) {
        // Remove inline styles that were set for initial state
        element.style.opacity = '';
        element.style.transform = '';
        
        // Add animation completion class
        Utils.addClass(element, 'aos-animate');
    }

    // ===========================================
    // UTILITY FUNCTIONS
    // ===========================================
    
    hasAnimated(element) {
        return element.hasAttribute('data-aos-animated') || 
               Utils.hasClass(element, 'aos-animate');
    }

    markAsAnimated(element) {
        element.setAttribute('data-aos-animated', 'true');
        Utils.addClass(element, 'aos-animate');
    }

    getElementDelay(element) {
        return parseInt(element.dataset.aosDelay) || 
               parseInt(element.dataset.delay) || 
               this.options.delay;
    }

    calculateStaggerDelay(element) {
        const staggerGroup = element.dataset.staggerGroup;
        if (!staggerGroup) return 0;

        const groupElements = Utils.$$(`[data-stagger-group="${staggerGroup}"]`);
        const elementIndex = Array.from(groupElements).indexOf(element);
        
        return elementIndex * this.options.stagger;
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    showElementImmediate(element) {
        // For reduced motion - show element immediately
        this.removeInitialState(element);
        this.markAsAnimated(element);
    }

    trackAnimation(element, type) {
        this.activeAnimations.set(element, {
            type,
            startTime: performance.now(),
            completed: false
        });

        // Remove from tracking after animation duration
        setTimeout(() => {
            const animation = this.activeAnimations.get(element);
            if (animation) {
                animation.completed = true;
                setTimeout(() => {
                    this.activeAnimations.delete(element);
                }, 1000);
            }
        }, this.options.duration);
    }

    // ===========================================
    // RESIZE HANDLING
    // ===========================================
    
    setupResizeListener() {
        const debouncedResize = Utils.debounce(() => {
            this.handleResize();
        }, this.options.debounceResize);

        Utils.on(window, 'resize', debouncedResize);
    }

    handleResize() {
        // Recalculate parallax elements
        if (this.options.enableParallax) {
            this.updateParallaxElements();
        }

        // Re-evaluate elements that might need repositioning
        this.animatedElements.forEach(element => {
            if (element.dataset.parallax) {
                this.updateParallaxElement(element, window.pageYOffset, window.innerHeight);
            }
        });

        Utils.debug('Scroll animations resize handled');
    }

    // ===========================================
    // DYNAMIC ELEMENT REGISTRATION
    // ===========================================
    
    registerNewElement(element, options = {}) {
        if (this.animatedElements.has(element)) return;

        // Apply options to element
        Object.entries(options).forEach(([key, value]) => {
            element.dataset[key] = value;
        });

        this.registerElement(element);
        Utils.debug('New element registered for animation', { element, options });
    }

    registerNewElements(elements, options = {}) {
        elements.forEach(element => {
            this.registerNewElement(element, options);
        });
    }

    // ===========================================
    // ANIMATION CONTROL
    // ===========================================
    
    pauseAnimations() {
        this.observers.forEach(observer => observer.disconnect());
        this.parallaxElements.clear();
        Utils.info('Scroll animations paused');
    }

    resumeAnimations() {
        this.setupIntersectionObservers();
        this.scanForAnimatableElements();
        Utils.info('Scroll animations resumed');
    }

    disableAnimations() {
        this.pauseAnimations();
        
        // Show all pending elements immediately
        this.animatedElements.forEach(element => {
            if (!this.hasAnimated(element)) {
                this.showElementImmediate(element);
            }
        });

        Utils.info('Scroll animations disabled');
    }

    enableAnimations() {
        if (this.isReduced) return;
        
        this.resumeAnimations();
        Utils.info('Scroll animations enabled');
    }

    // ===========================================
    // PERFORMANCE MONITORING
    // ===========================================
    
    getPerformanceMetrics() {
        return {
            observedElements: this.animatedElements.size,
            activeParallaxElements: this.parallaxElements.size,
            activeAnimations: this.activeAnimations.size,
            observers: this.observers.size,
            reducedMotion: this.isReduced
        };
    }

    logPerformanceMetrics() {
        const metrics = this.getPerformanceMetrics();
        Utils.info('Scroll Animations Performance Metrics:', metrics);
        return metrics;
    }

    // ===========================================
    // PUBLIC API
    // ===========================================
    
    // Manually trigger animation for element
    animate(element, type = 'fade') {
        if (typeof element === 'string') {
            element = Utils.$(element);
        }
        
        if (element && !this.hasAnimated(element)) {
            this.executeAnimation(element, type);
            this.markAsAnimated(element);
            return true;
        }
        return false;
    }

    // Batch animate multiple elements
    animateAll(elements, type = 'fade', stagger = 100) {
        if (typeof elements === 'string') {
            elements = Utils.$$(elements);
        }

        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animate(element, type);
            }, index * stagger);
        });
    }

    // Reset element to initial state
    resetElement(element) {
        if (typeof element === 'string') {
            element = Utils.$(element);
        }

        if (element) {
            element.removeAttribute('data-aos-animated');
            Utils.removeClass(element, 'aos-animate');
            
            const type = this.getAnimationType(element);
            this.setInitialState(element, type);
            
            return true;
        }
        return false;
    }

    // Refresh all animations (useful after dynamic content loading)
    refresh() {
        this.scanForAnimatableElements();
        Utils.info('Scroll animations refreshed');
    }

    // ===========================================
    // CLEANUP
    // ===========================================
    
    destroy() {
        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Clear all sets and maps
        this.animatedElements.clear();
        this.parallaxElements.clear();
        this.activeAnimations.clear();

        // Remove event listeners
        Utils.off(window, 'scroll');
        Utils.off(window, 'resize');

        Utils.info('Scroll animations controller destroyed');
    }
}

// ===========================================
// ANIMATION CSS CLASSES
// ===========================================

// Auto-inject CSS if not already present
const injectAnimationCSS = () => {
    if (document.querySelector('#scroll-animations-css')) return;

    const css = `
        <style id="scroll-animations-css">
        /* Base animation element */
        .aos-element {
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Fade animations */
        .aos-fade-in {
            opacity: 1 !important;
        }

        /* Slide animations */
        .aos-slide-in {
            opacity: 1 !important;
            transform: translateY(0) translateX(0) !important;
        }

        /* Scale animations */
        .aos-scale-in {
            opacity: 1 !important;
            transform: scale(1) !important;
        }

        /* Rotate animations */
        .aos-rotate-in {
            opacity: 1 !important;
            transform: rotate(0deg) scale(1) !important;
        }

        /* Generic animate class */
        .aos-animate {
            opacity: 1 !important;
            transform: translate3d(0, 0, 0) scale(1) !important;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            .aos-element {
                transition: none !important;
            }
            
            .aos-element:not(.aos-animate) {
                opacity: 1 !important;
                transform: none !important;
            }
        }

        /* Performance optimizations */
        .aos-element {
            will-change: opacity, transform;
        }

        .aos-animate {
            will-change: auto;
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', css);
};

// Auto-inject CSS when module loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectAnimationCSS);
    } else {
        injectAnimationCSS();
    }
}

// ===========================================
// EXPORT
// ===========================================

export default ScrollAnimationsController;

// Convenience factory function
export const createScrollAnimations = (options = {}) => {
    return new ScrollAnimationsController(options);
};

// Auto-initialization for global use
if (typeof window !== 'undefined') {
    window.ScrollAnimations = ScrollAnimationsController;
    
    // Auto-initialize if data attribute is present
    document.addEventListener('DOMContentLoaded', () => {
        const autoInit = document.documentElement.dataset.scrollAnimations;
        if (autoInit !== 'false') {
            window.scrollAnimations = new ScrollAnimationsController({
                debug: autoInit === 'debug'
            });
        }
    });
}
