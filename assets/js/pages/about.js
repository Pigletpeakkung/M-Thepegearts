/*
========================================
ABOUT PAGE CONTROLLER
========================================
Handles about page specific functionality and interactions
*/

import CONFIG from '../core/config.js';
import Utils from '../core/utils.js';

class AboutController {
    constructor() {
        this.elements = {
            statNumbers: null,
            skillBars: null,
            timelineItems: null,
            visualItems: null
        };
        
        this.observers = new Map();
        this.animationStates = new Set();
        
        this.init();
    }

    // ===========================================
    // INITIALIZATION
    // ===========================================
    
    init() {
        try {
            Utils.info('Initializing About page controller');

            // Cache DOM elements
            this.cacheElements();

            // Setup observers
            this.setupIntersectionObservers();

            // Initialize animations
            this.initializeAnimations();

            // Setup interactive elements
            this.setupInteractions();

            Utils.info('About page controller initialized successfully');

        } catch (error) {
            Utils.handleError(error, 'About page initialization');
        }
    }

    cacheElements() {
        this.elements = {
            statNumbers: Utils.$$('.stat-number[data-count]'),
            skillBars: Utils.$$('.skill-progress[data-width]'),
            timelineItems: Utils.$$('.timeline-item'),
            visualItems: Utils.$$('.visual-item'),
            floatingElements: Utils.$$('.floating-element'),
            valueCards: Utils.$$('.value-card'),
            skillCategories: Utils.$$('.skill-category')
        };

        Utils.debug('About page elements cached', {
            statNumbers: this.elements.statNumbers.length,
            skillBars: this.elements.skillBars.length,
            timelineItems: this.elements.timelineItems.length
        });
    }

    // ===========================================
    // INTERSECTION OBSERVERS
    // ===========================================
    
    setupIntersectionObservers() {
        // Counter animation observer
        if (this.elements.statNumbers.length > 0) {
            this.observers.set('counters', new IntersectionObserver(
                this.handleCounterAnimation.bind(this),
                { threshold: 0.7, rootMargin: '50px' }
            ));

            this.elements.statNumbers.forEach(counter => {
                this.observers.get('counters').observe(counter);
            });
        }

        // Skill bars observer
        if (this.elements.skillBars.length > 0) {
            this.observers.set('skillBars', new IntersectionObserver(
                this.handleSkillBarAnimation.bind(this),
                { threshold: 0.5, rootMargin: '100px' }
            ));

            this.elements.skillBars.forEach(bar => {
                this.observers.get('skillBars').observe(bar);
            });
        }

        // Timeline observer
        if (this.elements.timelineItems.length > 0) {
            this.observers.set('timeline', new IntersectionObserver(
                this.handleTimelineAnimation.bind(this),
                { threshold: 0.3, rootMargin: '50px' }
            ));

            this.elements.timelineItems.forEach(item => {
                this.observers.get('timeline').observe(item);
            });
        }

        // Visual grid observer
        if (this.elements.visualItems.length > 0) {
            this.observers.set('visual', new IntersectionObserver(
                this.handleVisualAnimation.bind(this),
                { threshold: 0.6 }
            ));

            this.elements.visualItems.forEach(item => {
                this.observers.get('visual').observe(item);
            });
        }
    }

    // ===========================================
    // ANIMATION HANDLERS
    // ===========================================
    
    handleCounterAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animationStates.has(entry.target)) {
                this.animateCounter(entry.target);
                this.animationStates.add(entry.target);
                this.observers.get('counters').unobserve(entry.target);
            }
        });
    }

    animateCounter(counter) {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const startTime = Date.now();
        
        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easedProgress = this.easeOutCubic(progress);
            const current = Math.floor(target * easedProgress);
            
            counter.textContent = current + (progress === 1 ? '+' : '');
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
        Utils.debug('Counter animation started', { target, element: counter });
    }

    handleSkillBarAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animationStates.has(entry.target)) {
                this.animateSkillBar(entry.target);
                this.animationStates.add(entry.target);
                this.observers.get('skillBars').unobserve(entry.target);
            }
        });
    }

    animateSkillBar(bar) {
        const width = bar.dataset.width;
        
        // Add a small delay for staggered effect
        const delay = Array.from(bar.parentNode.parentNode.children).indexOf(bar.parentNode) * 100;
        
        setTimeout(() => {
            bar.style.width = width;
            Utils.debug('Skill bar animated', { width, element: bar });
        }, delay);
    }

    handleTimelineAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animationStates.has(entry.target)) {
                this.animateTimelineItem(entry.target);
                this.animationStates.add(entry.target);
            }
        });
    }

    animateTimelineItem(item) {
        Utils.addClass(item, 'fade-in-up');
        
        // Animate timeline marker with slight delay
        const marker = Utils.$('.timeline-marker', item);
        if (marker) {
            setTimeout(() => {
                Utils.addClass(marker, 'bounce-in');
            }, 200);
        }
        
        Utils.debug('Timeline item animated', { element: item });
    }

    handleVisualAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animationStates.has(entry.target)) {
                this.animateVisualGrid();
                this.animationStates.add(entry.target);
                this.observers.get('visual').unobserve(entry.target);
            }
        });
    }

    animateVisualGrid() {
        this.elements.visualItems.forEach((item, index) => {
            setTimeout(() => {
                Utils.addClass(item, 'scale-in');
            }, index * 200);
        });
        
        Utils.debug('Visual grid animated');
    }

    // ===========================================
    // UTILITY FUNCTIONS
    // ===========================================
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // ===========================================
    // INTERACTIVE ELEMENTS
    // ===========================================
    
    setupInteractions() {
        // Add hover effects to cards
        this.elements.valueCards?.forEach(card => {
                        Utils.on(card, 'mouseenter', () => {
                Utils.addClass(card, 'hovered');
                this.addParallaxEffect(card);
            });

            Utils.on(card, 'mouseleave', () => {
                Utils.removeClass(card, 'hovered');
                this.removeParallaxEffect(card);
            });
        });

        // Skill category interactions
        this.elements.skillCategories?.forEach(category => {
            Utils.on(category, 'mouseenter', () => {
                this.highlightRelatedSkills(category);
            });

            Utils.on(category, 'mouseleave', () => {
                this.clearSkillHighlights();
            });
        });

        // Timeline item click to expand/collapse
        this.elements.timelineItems?.forEach(item => {
            const content = Utils.$('.timeline-content', item);
            if (content) {
                Utils.on(content, 'click', () => {
                    this.toggleTimelineItem(item);
                });
            }
        });

        // Floating elements interaction
        this.elements.floatingElements?.forEach(element => {
            Utils.on(element, 'click', () => {
                this.triggerFloatingAnimation(element);
            });
        });

        // Smooth scroll for CTA buttons
        const ctaButtons = Utils.$$('a[href^="#"]');
        ctaButtons.forEach(button => {
            Utils.on(button, 'click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('href').substring(1);
                const targetElement = Utils.$(`#${targetId}`);
                
                if (targetElement) {
                    this.smoothScrollTo(targetElement);
                }
            });
        });
    }

    addParallaxEffect(card) {
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / rect.width * 20;
            const deltaY = (e.clientY - centerY) / rect.height * 20;
            
            card.style.transform = `perspective(1000px) rotateX(${-deltaY}deg) rotateY(${deltaX}deg) translateZ(10px)`;
        };

        Utils.on(card, 'mousemove', handleMouseMove);
        card._mouseMoveHandler = handleMouseMove;
    }

    removeParallaxEffect(card) {
        if (card._mouseMoveHandler) {
            Utils.off(card, 'mousemove', card._mouseMoveHandler);
            delete card._mouseMoveHandler;
        }
        
        card.style.transform = '';
    }

    highlightRelatedSkills(category) {
        const categoryType = category.dataset.category || 'unknown';
        
        // Add highlight class to related elements
        Utils.addClass(category, 'highlighted');
        
        // You could add logic here to highlight related portfolio items,
        // testimonials, or other elements based on the skill category
        Utils.debug('Skill category highlighted', { categoryType });
    }

    clearSkillHighlights() {
        this.elements.skillCategories?.forEach(category => {
            Utils.removeClass(category, 'highlighted');
        });
    }

    toggleTimelineItem(item) {
        const isExpanded = Utils.hasClass(item, 'expanded');
        
        if (isExpanded) {
            Utils.removeClass(item, 'expanded');
            this.collapseTimelineContent(item);
        } else {
            // Collapse all other items first
            this.elements.timelineItems?.forEach(otherItem => {
                if (otherItem !== item && Utils.hasClass(otherItem, 'expanded')) {
                    Utils.removeClass(otherItem, 'expanded');
                    this.collapseTimelineContent(otherItem);
                }
            });
            
            Utils.addClass(item, 'expanded');
            this.expandTimelineContent(item);
        }
    }

    expandTimelineContent(item) {
        const content = Utils.$('.timeline-content', item);
        if (content) {
            const expandedHeight = content.scrollHeight;
            content.style.maxHeight = expandedHeight + 'px';
            
            // Add expanded details if they exist
            const details = Utils.$('.timeline-details', content);
            if (details) {
                Utils.addClass(details, 'visible');
            }
        }
    }

    collapseTimelineContent(item) {
        const content = Utils.$('.timeline-content', item);
        if (content) {
            content.style.maxHeight = '';
            
            const details = Utils.$('.timeline-details', content);
            if (details) {
                Utils.removeClass(details, 'visible');
            }
        }
    }

    triggerFloatingAnimation(element) {
        Utils.addClass(element, 'clicked');
        
        // Create ripple effect
        this.createRippleEffect(element);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            Utils.removeClass(element, 'clicked');
        }, 600);
    }

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    smoothScrollTo(target) {
        const targetPosition = target.offsetTop - 100; // Account for fixed header
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        const animationStep = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            
            // Easing function
            const easeInOutQuad = percentage < 0.5 
                ? 2 * percentage * percentage 
                : -1 + (4 - 2 * percentage) * percentage;
            
            window.scrollTo(0, startPosition + distance * easeInOutQuad);
            
            if (progress < duration) {
                requestAnimationFrame(animationStep);
            }
        };

        requestAnimationFrame(animationStep);
    }

    // ===========================================
    // PERFORMANCE OPTIMIZATION
    // ===========================================
    
    initializeAnimations() {
        // Only initialize animations if supported and enabled
        if (!CONFIG.features.animations) return;

        // Add initial animation classes
        Utils.requestIdleCallback(() => {
            this.elements.timelineItems?.forEach((item, index) => {
                item.style.animationDelay = `${index * 100}ms`;
            });

            this.elements.skillCategories?.forEach((category, index) => {
                category.style.animationDelay = `${index * 150}ms`;
            });
        });
    }

    // ===========================================
    // ANALYTICS & TRACKING
    // ===========================================
    
    trackInteraction(type, element) {
        if (!CONFIG.features.analytics) return;

        const eventData = {
            event: 'about_page_interaction',
            interaction_type: type,
            element_id: element.id || 'unknown',
            element_class: element.className || 'unknown',
            timestamp: new Date().toISOString()
        };

        // Send to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'about_interaction', {
                'event_category': 'About Page',
                'event_label': type,
                'custom_parameter': eventData
            });
        }

        Utils.debug('About page interaction tracked', eventData);
    }

    // ===========================================
    // ACCESSIBILITY ENHANCEMENTS
    // ===========================================
    
    setupAccessibility() {
        // Add ARIA labels and descriptions
        this.elements.statNumbers?.forEach(counter => {
            counter.setAttribute('aria-live', 'polite');
            counter.setAttribute('aria-atomic', 'true');
        });

        // Keyboard navigation for timeline
        this.elements.timelineItems?.forEach(item => {
            const content = Utils.$('.timeline-content', item);
            if (content) {
                content.setAttribute('tabindex', '0');
                content.setAttribute('role', 'button');
                content.setAttribute('aria-expanded', 'false');

                Utils.on(content, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleTimelineItem(item);
                        
                        const isExpanded = Utils.hasClass(item, 'expanded');
                        content.setAttribute('aria-expanded', isExpanded.toString());
                    }
                });
            }
        });

        // Focus management for floating elements
        this.elements.floatingElements?.forEach(element => {
            element.setAttribute('tabindex', '0');
            element.setAttribute('role', 'button');
            
            Utils.on(element, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.triggerFloatingAnimation(element);
                }
            });
        });
    }

    // ===========================================
    // RESPONSIVE UTILITIES
    // ===========================================
    
    handleResize() {
        const debouncedResize = Utils.debounce(() => {
            // Recalculate timeline positions on mobile
            if (window.innerWidth <= 768) {
                this.adjustMobileTimeline();
            }

            // Adjust visual grid on smaller screens
            if (window.innerWidth <= 992) {
                this.adjustVisualGrid();
            }

        }, 250);

        Utils.on(window, 'resize', debouncedResize);
    }

    adjustMobileTimeline() {
        this.elements.timelineItems?.forEach(item => {
            const content = Utils.$('.timeline-content', item);
            if (content && Utils.hasClass(item, 'expanded')) {
                // Recalculate expanded height
                content.style.maxHeight = 'none';
                const newHeight = content.scrollHeight;
                content.style.maxHeight = newHeight + 'px';
            }
        });
    }

    adjustVisualGrid() {
        // Adjust visual grid positioning for smaller screens
        this.elements.visualItems?.forEach(item => {
            if (window.innerWidth <= 992) {
                Utils.addClass(item, 'mobile-adjusted');
            } else {
                Utils.removeClass(item, 'mobile-adjusted');
            }
        });
    }

    // ===========================================
    // ERROR HANDLING
    // ===========================================
    
    handleError(error, context) {
        Utils.error(`About page error in ${context}:`, error);
        
        // Graceful fallback - disable animations if they're causing issues
        if (context.includes('animation')) {
            Utils.warn('Disabling animations due to error');
            this.disableAnimations();
        }
    }

    disableAnimations() {
        // Remove animation classes and observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Show content immediately without animations
        this.elements.statNumbers?.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            counter.textContent = target + '+';
        });

        this.elements.skillBars?.forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }

    // ===========================================
    // PUBLIC API
    // ===========================================
    
    scrollToSection(sectionId) {
        const section = Utils.$(`#${sectionId}`);
        if (section) {
            this.smoothScrollTo(section);
            return true;
        }
        return false;
    }

    highlightSkill(skillName) {
        const skillItems = Utils.$$('.skill-item');
        skillItems.forEach(item => {
            const name = Utils.$('.skill-name', item);
            if (name && name.textContent.toLowerCase().includes(skillName.toLowerCase())) {
                Utils.addClass(item, 'highlighted');
                setTimeout(() => {
                    Utils.removeClass(item, 'highlighted');
                }, 3000);
            }
        });
    }

    expandTimelineYear(year) {
        const timelineItem = Utils.$(`[data-year="${year}"]`);
        if (timelineItem) {
            this.toggleTimelineItem(timelineItem);
            this.smoothScrollTo(timelineItem);
            return true;
        }
        return false;
    }

    getVisibleSections() {
        const sections = Utils.$$('section[id]');
        const visibleSections = [];

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                visibleSections.push(section.id);
            }
        });

        return visibleSections;
    }

    // ===========================================
    // CLEANUP
    // ===========================================
    
    destroy() {
        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Remove event listeners
        this.elements.valueCards?.forEach(card => {
            this.removeParallaxEffect(card);
        });

        // Clear animation states
        this.animationStates.clear();

        // Remove any created elements
        const ripples = Utils.$$('.ripple-effect');
        ripples.forEach(ripple => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        });

        Utils.info('About page controller destroyed');
    }
}

export default AboutController;

