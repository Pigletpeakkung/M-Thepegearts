/*
========================================
MAIN APPLICATION CLASS
========================================
Core application controller that initializes all components
*/

import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { ThemeController } from '../components/theme-controller.js';
import { NavbarController } from '../components/navbar-controller.js';
import { ScrollAnimations } from '../components/scroll-animations.js';
import { PerformanceOptimizer } from '../components/performance.js';

export class PortfolioApp {
    constructor(options = {}) {
        this.config = { ...CONFIG, ...options };
        this.components = {};
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init);
        } else {
            this.init();
        }
    }

    async init() {
        try {
            console.log('🚀 Initializing Portfolio App...');
            
            // Initialize performance optimizer first
            this.components.performance = new PerformanceOptimizer();
            
            // Initialize core components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize page-specific functionality
            this.initializePageSpecific();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Dispatch ready event
            this.dispatchEvent('app:ready', { app: this });
            
            console.log('✅ Portfolio App initialized successfully');
            
        } catch (error) {
            this.handleError(error, 'App initialization failed');
        }
    }

    async initializeComponents() {
        const componentPromises = [];

        // Theme Controller - Initialize immediately
        this.components.theme = new ThemeController();
        
        // Navbar Controller
        componentPromises.push(
            this.initializeComponent('navbar', NavbarController)
        );
        
        // Scroll Animations
        if (this.config.features.animations) {
            componentPromises.push(
                this.initializeComponent('scrollAnimations', ScrollAnimations)
            );
        }

        // Wait for all components to initialize
        await Promise.all(componentPromises);
    }

    async initializeComponent(name, ComponentClass, ...args) {
        try {
            this.components[name] = new ComponentClass(...args);
            console.log(`✅ ${name} component initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize ${name} component:`, error);
            this.handleError(error, `Component initialization: ${name}`);
        }
    }

    setupEventListeners() {
        // Global error handling
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'Global error handler');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled promise rejection');
        });

        // Resize handler
        window.addEventListener('resize', 
            Utils.throttle(this.handleResize, this.config.performance.throttleDelay)
        );

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.dispatchEvent('app:hidden');
            } else {
                this.dispatchEvent('app:visible');
            }
        });

        // Online/offline status
        window.addEventListener('online', () => {
            this.dispatchEvent('app:online');
        });

        window.addEventListener('offline', () => {
            this.dispatchEvent('app:offline');
        });
    }

    initializePageSpecific() {
        const currentPage = this.getCurrentPage();
        console.log(`📄 Current page: ${currentPage}`);

        // Page-specific initialization
        switch (currentPage) {
            case 'home':
                this.initializeHomePage();
                break;
            case 'faq':
                this.initializeFAQPage();
                break;
            case 'about':
                this.initializeAboutPage();
                break;
            case 'contact':
                this.initializeContactPage();
                break;
            default:
                console.log('ℹ️ No specific initialization for this page');
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'home';
        return page === 'index' ? 'home' : page;
    }

    async initializeHomePage() {
        try {
            const { HomeController } = await import('../pages/home.js');
            this.components.home = new HomeController();
        } catch (error) {
            console.error('Failed to load home page controller:', error);
        }
    }

    async initializeFAQPage() {
        try {
            const { FAQController } = await import('../pages/faq.js');
            this.components.faq = new FAQController();
        } catch (error) {
            console.error('Failed to load FAQ page controller:', error);
        }
    }

    async initializeAboutPage() {
        try {
            const { AboutController } = await import('../pages/about.js');
            this.components.about = new AboutController();
        } catch (error) {
            console.error('Failed to load about page controller:', error);
        }
    }

    async initializeContactPage() {
        try {
            const { ContactController } = await import('../pages/contact.js');
            this.components.contact = new ContactController();
        } catch (error) {
            console.error('Failed to load contact page controller:', error);
        }
    }

    handleResize() {
        // Update mobile detection
        this.config.browser.isMobile = Utils.device.isMobile();
        
        // Notify components about resize
        Object.values(this.components).forEach(component => {
            if (typeof component.handleResize === 'function') {
                component.handleResize();
            }
        });

        this.dispatchEvent('app:resize', {
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: this.config.browser.isMobile
        });
    }

    handleError(error, context = 'Unknown') {
        Utils.error.log(error, { context });
        
        // Show user-friendly error message if needed
        this.dispatchEvent('app:error', { error, context });
    }

    // Event system
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    addEventListener(eventName, handler) {
        document.addEventListener(eventName, handler);
    }

    removeEventListener(eventName, handler) {
        document.removeEventListener(eventName, handler);
    }

    // Component management
    getComponent(name) {
        return this.components[name];
    }

    hasComponent(name) {
        return name in this.components;
    }

    // Utility methods
    scrollToSection(selector, offset = 80) {
        Utils.scrollTo(selector, offset);
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        // Destroy components
        Object.values(this.components).forEach(component => {
            if (typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        this.components = {};
        this.isInitialized = false;
        
        console.log('🧹 Portfolio App destroyed');
    }
}

// Initialize app automatically
window.PortfolioApp = PortfolioApp;

// Export for module systems
export default PortfolioApp;
