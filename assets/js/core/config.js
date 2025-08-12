/*
========================================
CONFIGURATION & CONSTANTS
========================================
Central configuration for the entire portfolio
*/

export const CONFIG = {
    // Application Info
    app: {
        name: 'Thanatsitt Portfolio',
        version: '2.0.0',
        author: 'Thanatsitt Santisamranwilai'
    },

    // Performance Settings
    performance: {
        debounceDelay: 300,
        throttleDelay: 100,
        intersectionThreshold: 0.15,
        imageLoadingDelay: 100
    },

    // Animation Settings
    animations: {
        duration: {
            fast: 200,
            normal: 300,
            slow: 500,
            extraSlow: 1000
        },
        easing: {
            smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            linear: 'linear'
        },
        observer: {
            threshold: 0.15,
            rootMargin: '50px'
        },
        stagger: {
            delay: 150,
            increment: 50
        }
    },

    // Theme Settings
    theme: {
        storageKey: 'portfolio-theme',
        defaultTheme: 'light',
        transitionDuration: 300,
        systemPreference: true
    },

    // Page-Specific Settings
    pages: {
        home: {
            typewriter: {
                texts: [
                    'AI Creative Designer',
                    'Digital Innovator', 
                    'Machine Learning Engineer',
                    'Creative Technologist',
                    'Voice Actor & Producer'
                ],
                speed: 80,
                deleteSpeed: 50,
                delay: 2000
            },
            particles: {
                count: 50,
                speed: 2,
                size: 3
            }
        },
        
        faq: {
            categories: ['all', 'ai', 'design', 'voice', 'services', 'technical'],
            searchDelay: 300,
            maxResults: 50,
            highlightMatches: true,
            autoExpand: false
        },

        contact: {
            validation: {
                email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                phone: /^[\+]?[1-9][\d]{0,15}$/
            },
            submission: {
                timeout: 10000,
                retryAttempts: 3,
                showProgress: true
            }
        }
    },

    // API Settings
    api: {
        baseUrl: process.env.NODE_ENV === 'production' ? 'https://api.thanatsitt.com' : 'http://localhost:3001',
        endpoints: {
            contact: '/api/contact',
            portfolio: '/api/portfolio',
            testimonials: '/api/testimonials'
        },
        timeout: 10000
    },

    // Feature Flags
    features: {
        analytics: true,
        serviceWorker: true,
        lazyLoading: true,
        prefetch: true,
        darkMode: true,
        animations: true
    },

    // Breakpoints (matches CSS)
    breakpoints: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
    },

    // Social Links
    social: {
        linkedin: 'https://linkedin.com/in/thanatsitt',
        github: 'https://github.com/thanatsitt',
        email: 'hello@thanatsitt.com',
        phone: '+1-xxx-xxx-xxxx'
    },

    // Error Messages
    messages: {
        errors: {
            network: 'Network error. Please check your connection and try again.',
            validation: 'Please fill in all required fields correctly.',
            generic: 'Something went wrong. Please try again later.',
            notFound: 'The requested content could not be found.'
        },
        success: {
            contact: 'Thank you! Your message has been sent successfully.',
            subscription: 'Successfully subscribed to updates.'
        }
    }
};

// Environment-specific settings
if (typeof window !== 'undefined') {
    // Browser-specific config
    CONFIG.browser = {
        supportsIntersectionObserver: 'IntersectionObserver' in window,
        supportsWebP: checkWebPSupport(),
        supportsServiceWorker: 'serviceWorker' in navigator,
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        isTouch: 'ontouchstart' in window
    };
}

// Utility function to check WebP support
function checkWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Export individual modules for tree-shaking
export const ANIMATIONS = CONFIG.animations;
export const THEME = CONFIG.theme;
export const PAGES = CONFIG.pages;
export const FEATURES = CONFIG.features;
