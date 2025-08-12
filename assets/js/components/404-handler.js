/*
========================================
404 ERROR PAGE HANDLER
========================================
Complete interactive functionality for the 404 page
*/

import Utils from '../core/utils.js';
import { getThemeManager } from './theme-manager.js';

class Error404Handler {
    constructor() {
        this.config = {
            animationDelay: 100,
            searchDelay: 300,
            gameClicksRequired: 7,
            maxSuggestions: 5
        };

        // State management
        this.state = {
            loaded: false,
            searchTimeout: null,
            gameClicks: 0,
            gameActive: false,
            reportSubmitted: false
        };

        // Error messages array
        this.errorMessages = {
            titles: [
                "Oops! Page Not Found",
                "Lost in Digital Space",
                "404 - Missing in Action",
                "This Page Has Vanished",
                "Houston, We Have a Problem",
                "Page Gone Fishing",
                "Error in the Matrix",
                "Page Taking a Digital Detour"
            ],
            descriptions: [
                "The page you're looking for seems to have wandered off into the digital void. Don't worry, even the best explorers sometimes take wrong turns!",
                "Looks like this page decided to play hide and seek, and it's winning! Let's help you find what you're actually looking for.",
                "This page must be on a coffee break. While we wait for it to return, let's navigate you somewhere more interesting.",
                "The requested page has gone on an unexpected adventure. But hey, maybe this is a chance to discover something even better!",
                "It seems like this page has disappeared into thin air. But don't worry - I've got plenty of other amazing content to show you.",
                "This URL seems to be pointing to a parallel dimension. Let's get you back to the right universe!",
                "The page you requested has achieved quantum superposition - it exists and doesn't exist simultaneously. Schrödinger would be proud.",
                "Looks like this page took the scenic route and got lost. Let's find you a more direct path to awesome content!"
            ]
        };

        // Search suggestions database
        this.searchSuggestions = [
            {
                title: "About Me",
                description: "Learn about my background and expertise",
                url: "/about",
                keywords: ["about", "bio", "background", "experience", "skills"]
            },
            {
                title: "Portfolio",
                description: "View my creative work and projects",
                url: "/portfolio",
                keywords: ["portfolio", "work", "projects", "examples", "gallery"]
            },
            {
                title: "AI Specialist Services",
                description: "AI consulting and implementation services",
                url: "/services#ai-specialist",
                keywords: ["ai", "artificial intelligence", "machine learning", "automation"]
            },
            {
                title: "Voice Acting",
                description: "Professional voice acting services",
                url: "/services#voice-acting",
                keywords: ["voice", "acting", "narration", "audio", "recording"]
            },
            {
                title: "Digital Design",
                description: "Creative digital design solutions",
                url: "/services#digital-design",
                keywords: ["design", "graphics", "visual", "creative", "branding"]
            },
            {
                title: "Contact",
                description: "Get in touch for collaborations",
                url: "/contact",
                keywords: ["contact", "hire", "collaboration", "email", "reach"]
            },
            {
                title: "Blog",
                description: "Articles about AI, creativity, and technology",
                url: "/blog",
                keywords: ["blog", "articles", "thoughts", "writing", "insights"]
            }
        ];

        this.init();
    }

    // ===========================================
    // INITIALIZATION
    // ===========================================
    
    init() {
        Utils.info('Initializing 404 error handler');

        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Setup error page content
        this.setupErrorContent();
        
        // Initialize interactive elements
        this.initializeSearch();
        this.initializeNavigation();
        this.initializeEasterEgg();
        this.initializeReportModal();
        
        // Setup background animations
        this.initializeBackgroundAnimations();
        
        // Reveal content with staggered animations
        this.revealContent();
        
        // Track 404 error
        this.trackError();
        
        this.state.loaded = true;
        Utils.info('404 handler initialized successfully');
    }

    setupErrorContent() {
        // Set random error messages
        const titleIndex = Math.floor(Math.random() * this.errorMessages.titles.length);
        const descIndex = Math.floor(Math.random() * this.errorMessages.descriptions.length);
        
        const titleElement = Utils.$('#error-title');
        const descElement = Utils.$('#error-description');
        const detailsElement = Utils.$('#error-details');
        
        if (titleElement) {
            setTimeout(() => {
                titleElement.innerHTML = `<h2>${this.errorMessages.titles[titleIndex]}</h2>`;
                titleElement.classList.add('fade-in');
            }, 500);
        }
        
        if (descElement) {
            setTimeout(() => {
                descElement.textContent = this.errorMessages.descriptions[descIndex];
                descElement.classList.add('fade-in');
            }, 700);
        }
        
        if (detailsElement) {
            setTimeout(() => {
                detailsElement.innerHTML = `
                    <div class="error-code-display">HTTP 404 - Not Found</div>
                    <div class="error-url">Requested: ${window.location.pathname}</div>
                    <div class="error-referrer">Referrer: ${document.referrer || 'Direct access'}</div>
                `;
                detailsElement.classList.add('fade-in');
            }, 900);
        }

        // Set timestamp
        const timestampElement = Utils.$('#error-timestamp');
        if (timestampElement) {
            timestampElement.textContent = new Date().toLocaleString();
        }

        // Set requested URL
        const urlElement = Utils.$('#requested-url');
        if (urlElement) {
            urlElement.textContent = window.location.pathname;
        }
    }

    // ===========================================
    // BACKGROUND ANIMATIONS
    // ===========================================
    
    initializeBackgroundAnimations() {
        this.createFloatingShapes();
        this.initializeGlitchEffect();
    }

    createFloatingShapes() {
        const shapesContainer = Utils.$('#floating-shapes');
        if (!shapesContainer) return;

        const shapes = ['◆', '●', '▲', '■', '★', '◯', '▼', '◢'];
        const colors = ['var(--primary-color)', 'var(--secondary-color)', 'var(--accent-color)'];
        
        for (let i = 0; i < 20; i++) {
            const shape = document.createElement('div');
            shape.className = 'floating-shape';
            shape.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            
            // Random positioning and styling
            shape.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                color: ${colors[Math.floor(Math.random() * colors.length)]};
                font-size: ${20 + Math.random() * 30}px;
                animation-delay: ${Math.random() * 6}s;
                animation-duration: ${4 + Math.random() * 4}s;
            `;
            
            shapesContainer.appendChild(shape);
        }
    }

    initializeGlitchEffect() {
        const glitchElement = Utils.$('#error-glitch');
        const codeElement = Utils.$('#error-code');
        
        if (!glitchElement || !codeElement) return;

        // Copy the content for glitch effect
        glitchElement.textContent = codeElement.textContent;
        
        // Random glitch trigger
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                glitchElement.style.opacity = '1';
                setTimeout(() => {
                    glitchElement.style.opacity = '0';
                }, 300);
            }
        }, 2000);
    }

    // ===========================================
    // SEARCH FUNCTIONALITY
    // ===========================================
    
    initializeSearch() {
        const searchInput = Utils.$('#site-search');
        const searchButton = Utils.$('#search-button');
        const suggestionsContainer = Utils.$('#search-suggestions');
        
        if (!searchInput) return;

        // Setup search input handlers
        Utils.on(searchInput, 'input', Utils.debounce((e) => {
            this.handleSearch(e.target.value);
        }, this.config.searchDelay));

        Utils.on(searchInput, 'keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSearch(searchInput.value);
            }
        });

        // Setup search button
        if (searchButton) {
            Utils.on(searchButton, 'click', () => {
                this.executeSearch(searchInput.value);
            });
        }

        // Hide suggestions when clicking outside
        Utils.on(document, 'click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer?.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const suggestions = this.findSuggestions(query);
        this.showSuggestions(suggestions);
    }

    findSuggestions(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        return this.searchSuggestions
            .filter(item => {
                // Check title
                if (item.title.toLowerCase().includes(normalizedQuery)) return true;
                
                // Check description
                if (item.description.toLowerCase().includes(normalizedQuery)) return true;
                
                // Check keywords
                return item.keywords.some(keyword => 
                    keyword.toLowerCase().includes(normalizedQuery) ||
                    normalizedQuery.includes(keyword.toLowerCase())
                );
            })
            .slice(0, this.config.maxSuggestions)
            .sort((a, b) => {
                // Prioritize exact title matches
                const aTitle = a.title.toLowerCase().includes(normalizedQuery);
                const bTitle = b.title.toLowerCase().includes(normalizedQuery);
                
                if (aTitle && !bTitle) return -1;
                if (!aTitle && bTitle) return 1;
                
                return 0;
            });
    }

    showSuggestions(suggestions) {
        const container = Utils.$('#search-suggestions');
        if (!container) return;

        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-url="${suggestion.url}">
                <div class="suggestion-title">${suggestion.title}</div>
                <div class="suggestion-description">${suggestion.description}</div>
            </div>
        `).join('');

        // Add click handlers to suggestions
        Utils.$$('.suggestion-item', container).forEach(item => {
            Utils.on(item, 'click', () => {
                this.navigateToSuggestion(item.dataset.url);
            });
        });

        container.classList.add('show');
    }

    hideSuggestions() {
        const container = Utils.$('#search-suggestions');
        if (container) {
            container.classList.remove('show');
        }
    }

    executeSearch(query) {
        if (!query.trim()) return;

        const suggestions = this.findSuggestions(query);
        
        if (suggestions.length > 0) {
            // Navigate to best match
            this.navigateToSuggestion(suggestions[0].url);
        } else {
            // Fallback to site search or homepage
            this.navigateToSuggestion(`/?search=${encodeURIComponent(query)}`);
        }

        // Track search
        this.trackEvent('404_search', { query, found: suggestions.length > 0 });
    }

    navigateToSuggestion(url) {
        this.trackEvent('404_navigation', { destination: url });
        
        // Add smooth transition
        document.body.style.opacity = '0.7';
        setTimeout(() => {
            window.location.href = url;
        }, 200);
    }

    // ===========================================
    // NAVIGATION HANDLERS
    // ===========================================
    
    initializeNavigation() {
        // Home button
        const homeButton = Utils.$('#go-home');
        if (homeButton) {
            Utils.on(homeButton, 'click', () => {
                this.navigateHome();
            });
        }

        // Back button
        const backButton = Utils.$('#go-back');
        if (backButton) {
            Utils.on(backButton, 'click', () => {
                this.navigateBack();
            });
        }

        // Navigation cards
        Utils.$$('.nav-card').forEach(card => {
            Utils.on(card, 'click', (e) => {
                e.preventDefault();
                const page = card.dataset.page;
                this.trackEvent('404_nav_card', { page });
                this.navigateWithTransition(card.href);
            });
        });
    }

    navigateHome() {
        this.trackEvent('404_navigate_home');
        this.navigateWithTransition('/');
    }

    navigateBack() {
        this.trackEvent('404_navigate_back');
        
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.navigateHome();
        }
    }

    navigateWithTransition(url) {
        // Add page transition effect
        document.body.classList.add('page-transitioning');
        
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    // ===========================================
    // EASTER EGG GAME
    // ===========================================
    
    initializeEasterEgg() {
        const trigger = Utils.$('#easter-egg-trigger');
        const counter = Utils.$('#secret-counter');
        
        if (!trigger || !counter) return;

        Utils.on(trigger, 'click', () => {
            this.state.gameClicks++;
            counter.textContent = this.state.gameClicks;
            
            // Add click animation
            trigger.style.transform = 'scale(1.2)';
            setTimeout(() => {
                trigger.style.transform = 'scale(1)';
            }, 150);
            
            if (this.state.gameClicks >= this.config.gameClicksRequired) {
                this.activateEasterEgg();
            }
        });
    }

    activateEasterEgg() {
        const modal = Utils.$('#mini-game-modal');
        if (!modal) return;

        modal.style.display = 'flex';
        this.initializeMiniGame();
        
        this.trackEvent('404_easter_egg_activated');
        
        // Close game handler
        const closeButton = Utils.$('#close-game');
        if (closeButton) {
            Utils.on(closeButton, 'click', () => {
                this.closeMiniGame();
            });
        }
    }

    initializeMiniGame() {
        const gameContainer = Utils.$('#game-container');
        if (!gameContainer) return;

        this.state.gameActive = true;
        
        // Create game elements
        const pixel = document.createElement('div');
        pixel.className = 'game-pixel';
        pixel.id = 'game-pixel';
        
        const target = document.createElement('div');
        target.className = 'game-target';
        target.id = 'game-target';
        
        // Position elements
        pixel.style.left = '10px';
        pixel.style.top = '90px';
        
        target.style.right = '10px';
        target.style.top = '85px';
        
        gameContainer.innerHTML = '';
        gameContainer.appendChild(pixel);
        gameContainer.appendChild(target);
        
        // Game controls
        this.setupGameControls(pixel, target, gameContainer);
    }

    setupGameControls(pixel, target, container) {
        const moveDistance = 20;
        let pixelPos = { x: 10, y: 90 };
        const containerRect = container.getBoundingClientRect();
        const maxX = containerRect.width - 20;
        const maxY = containerRect.height - 20;
        
        const movePixel = (direction) => {
            const newPos = { ...pixelPos };
            
            switch (direction) {
                case 'up':
                    newPos.y = Math.max(0, pixelPos.y - moveDistance);
                    break;
                case 'down':
                    newPos.y = Math.min(maxY, pixelPos.y + moveDistance);
                    break;
                case 'left':
                    newPos.x = Math.max(0, pixelPos.x - moveDistance);
                    break;
                case 'right':
                    newPos.x = Math.min(maxX, pixelPos.x + moveDistance);
                    break;
            }
            
            pixelPos = newPos;
            pixel.style.left = `${pixelPos.x}px`;
            pixel.style.top = `${pixelPos.y}px`;
            
            this.checkGameWin(pixelPos, target);
        };
        
        // Keyboard controls
        const gameKeyHandler = (e) => {
            if (!this.state.gameActive) return;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    movePixel('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    movePixel('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    movePixel('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    movePixel('right');
                    break;
                case 'Escape':
                    this.closeMiniGame();
                    break;
            }
        };
        
        Utils.on(document, 'keydown', gameKeyHandler);
        
        // Store handler for cleanup
        this.gameKeyHandler = gameKeyHandler;
        
        // Add game instructions
        const instructions = document.createElement('div');
        instructions.className = 'game-instructions';
        instructions.innerHTML = `
            <p><strong>Use arrow keys or WASD to move the blue pixel to the green target!</strong></p>
            <p>Press ESC to close</p>
        `;
        instructions.style.cssText = `
            position: absolute;
            bottom: -60px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.8rem;
            color: var(--text-secondary);
        `;
        
        container.style.position = 'relative';
        container.appendChild(instructions);
    }

    checkGameWin(pixelPos, target) {
        const targetRect = target.getBoundingClientRect();
        const containerRect = target.parentElement.getBoundingClientRect();
        
        const targetPos = {
            x: targetRect.left - containerRect.left,
            y: targetRect.top - containerRect.top
        };
        
        const distance = Math.sqrt(
            Math.pow(pixelPos.x - targetPos.x, 2) + 
            Math.pow(pixelPos.y - targetPos.y, 2)
        );
        
        if (distance < 30) {
            this.gameWin();
        }
    }

    gameWin() {
        this.state.gameActive = false;
        
        const gameContainer = Utils.$('#game-container');
        if (gameContainer) {
            gameContainer.innerHTML = `
                <div class="game-win">
                    <div class="win-icon">🎉</div>
                    <h4>Congratulations!</h4>
                    <p>You helped the lost pixel find its way home!</p>
                    <p>Just like how I can help guide your projects to success.</p>
                    <div class="win-reward">
                        <p><strong>Special Reward:</strong></p>
                        <p>Get 15% off my services - use code: <strong>PIXEL404</strong></p>
                    </div>
                </div>
            `;
            
            gameContainer.style.cssText += `
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                text-align: center;
                padding: 1rem;
            `;
        }
        
        this.trackEvent('404_game_completed');
        
        // Auto close after celebration
        setTimeout(() => {
            this.closeMiniGame();
        }, 5000);
    }

    closeMiniGame() {
        const modal = Utils.$('#mini-game-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        this.state.gameActive = false;
        
        // Remove keyboard handler
        if (this.gameKeyHandler) {
            Utils.off(document, 'keydown', this.gameKeyHandler);
            this.gameKeyHandler = null;
        }
        
        // Reset click counter
        this.state.gameClicks = 0;
        const counter = Utils.$('#secret-counter');
        if (counter) {
            counter.textContent = '0';
        }
    }

    // ===========================================
    // REPORT ISSUE MODAL
    // ===========================================
    
    initializeReportModal() {
        const reportButton = Utils.$('#report-issue');
        const modal = Utils.$('#report-modal');
        const closeButton = Utils.$('#close-report-modal');
        const cancelButton = Utils.$('#cancel-report');
        const form = Utils.$('#issue-report-form');
        
        if (!reportButton || !modal) return;

        // Open modal
        Utils.on(reportButton, 'click', () => {
            this.openReportModal();
        });
        
        // Close modal
        if (closeButton) {
            Utils.on(closeButton, 'click', () => {
                this.closeReportModal();
            });
        }
        
        if (cancelButton) {
            Utils.on(cancelButton, 'click', () => {
                this.closeReportModal();
            });
        }
        
        // Close on outside click
        Utils.on(modal, 'click', (e) => {
            if (e.target === modal) {
                this.closeReportModal();
            }
        });
        
        // Handle form submission
        if (form) {
            Utils.on(form, 'submit', (e) => {
                e.preventDefault();
                this.handleReportSubmission(form);
            });
        }
    }

    openReportModal() {
        const modal = Utils.$('#report-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Pre-fill some information
            const urlField = Utils.$('#requested-url-field');
            if (urlField) {
                urlField.value = window.location.href;
            }
            
            // Focus first field
            const firstField = Utils.$('#issue-type');
            if (firstField) {
                setTimeout(() => firstField.focus(), 100);
            }
        }
        
        this.trackEvent('404_report_modal_opened');
    }

    closeReportModal() {
        const modal = Utils.$('#report-modal');
        if (modal) {
            modal.style.display = 'none';
            
            // Reset form if not submitted
            if (!this.state.reportSubmitted) {
                const form = Utils.$('#issue-report-form');
                if (form) form.reset();
            }
        }
    }

    async handleReportSubmission(form) {
        const formData = new FormData(form);
        const data = {
            type: formData.get('issue-type'),
            description: formData.get('issue-description'),
            email: formData.get('user-email'),
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'Direct access'
        };
        
        // Show loading state
        const submitButton = Utils.$('button[type="submit"]', form);
        const originalText = submitButton?.textContent;
        if (submitButton) {
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
        }
        
        try {
            // Simulate API call (replace with actual endpoint)
            await this.submitIssueReport(data);
            
            // Show success message
            this.showReportSuccess();
            this.state.reportSubmitted = true;
            
            // Track submission
            this.trackEvent('404_issue_reported', {
                issue_type: data.type,
                has_email: !!data.email
            });
            
        } catch (error) {
            Utils.error('Failed to submit report:', error);
            this.showReportError();
        } finally {
            // Reset button state
            if (submitButton && originalText) {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }
    }

    async submitIssueReport(data) {
        // Simulate API call - replace with your actual endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Store in localStorage as fallback
                try {
                    const reports = JSON.parse(localStorage.getItem('error_reports') || '[]');
                    reports.push(data);
                    localStorage.setItem('error_reports', JSON.stringify(reports));
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }, 1000);
        });
    }

    showReportSuccess() {
        const modalBody = Utils.$('.modal-body', Utils.$('#report-modal'));
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="report-success">
                    <div class="success-icon">✅</div>
                    <h4>Thank you for your report!</h4>
                    <p>Your feedback helps me improve the site. I'll look into this issue and fix it as soon as possible.</p>
                    <p>If you provided an email, I'll send you an update when it's resolved.</p>
                </div>
            `;
            
            // Auto close after 3 seconds
            setTimeout(() => {
                this.closeReportModal();
            }, 3000);
        }
    }

    showReportError() {
        const modalBody = Utils.$('.modal-body', Utils.$('#report-modal'));
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="report-error">
                    <div class="error-icon">❌</div>
                    <h4>Oops! Something went wrong</h4>
                    <p>I couldn't submit your report right now. Please try again later or contact me directly at:</p>
                    <p><strong>contact@yourportfolio.com</strong></p>
                    <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }

    // ===========================================
    // CONTENT REVEAL ANIMATION
    // ===========================================
    
    revealContent() {
        const elements = [
            { selector: '#search-section', delay: 1200 },
            { selector: '#navigation-options', delay: 1500 },
            { selector: '#action-buttons', delay: 1800 },
            { selector: '#error-footer', delay: 2100 }
        ];
        
        elements.forEach(({ selector, delay }) => {
            setTimeout(() => {
                const element = Utils.$(selector);
                if (element) {
                    element.style.display = 'block';
                    element.classList.add('slide-up');
                }
            }, delay);
        });
    }

    // ===========================================
    // ANALYTICS & TRACKING
    // ===========================================
    
    trackError() {
        const errorData = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            referrer: document.referrer || 'Direct access',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            connection: this.getConnectionInfo()
        };
        
        this.trackEvent('404_error', errorData);
        
        // Store error in localStorage for debugging
        try {
            const errors = JSON.parse(localStorage.getItem('404_errors') || '[]');
            errors.push(errorData);
            
            // Keep only last 10 errors
            if (errors.length > 10) {
                errors.splice(0, errors.length - 10);
            }
            
            localStorage.setItem('404_errors', JSON.stringify(errors));
        } catch (e) {
            Utils.warn('Could not store 404 error data');
        }
    }

    trackEvent(eventName, parameters = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined' && this.hasAnalyticsConsent()) {
            gtag('event', eventName, {
                event_category: '404_page',
                ...parameters
            });
        }
        
        // Custom analytics
        if (window.portfolioAnalytics && typeof window.portfolioAnalytics.track === 'function') {
            window.portfolioAnalytics.track(eventName, parameters);
        }
        
        Utils.debug('404 Event tracked:', eventName, parameters);
    }

    hasAnalyticsConsent() {
        return localStorage.getItem('analytics_consent') === 'true';
    }

    getConnectionInfo() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return null;
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================
    
    getCurrentPage() {
        return window.location.pathname.split('/').filter(Boolean)[0] || 'home';
    }

    formatTimestamp(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }

    generateErrorId() {
        return `404_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ===========================================
    // CLEANUP & DESTROY
    // ===========================================
    
    destroy() {
        // Remove event listeners
        if (this.gameKeyHandler) {
            Utils.off(document, 'keydown', this.gameKeyHandler);
        }
        
        // Clear timeouts
        if (this.state.searchTimeout) {
            clearTimeout(this.state.searchTimeout);
        }
        
        // Reset state
        this.state = {
            loaded: false,
            searchTimeout: null,
            gameClicks: 0,
            gameActive: false,
            reportSubmitted: false
        };
        
        Utils.info('404 handler destroyed');
    }
}

// ===========================================
// AUTO-INITIALIZE
// ===========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeError404Handler);
} else {
    initializeError404Handler();
}

function initializeError404Handler() {
    // Only initialize on 404 pages
    if (document.body.classList.contains('error-page') || 
        document.title.includes('404') || 
        window.location.pathname === '/404.html') {
        
        window.error404Handler = new Error404Handler();
    }
}

// ===========================================
// EXPORT
// ===========================================

export default Error404Handler;

// Global availability
if (typeof window !== 'undefined') {
    window.Error404Handler = Error404Handler;
}
