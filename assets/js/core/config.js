/*
========================================
CONFIGURATION & CONSTANTS
========================================
Central configuration for the entire portfolio
*/

export const CONFIG = {
    // Application Info
    app: {
        name: 'Thanattsitt Portfolio',
        version: '2.0.0',
        author: 'Thanattsitt Santisamranwilai',
        domain: 'pegearts.com',
        email: 'Thanattsitt.info@yahoo.co.uk'
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
        storageKey: 'pegearts-theme',
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
                    'Voice Actor & Producer',
                    'Art Director'
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
        baseUrl: process.env.NODE_ENV === 'production' ? 'https://pegearts.com' : 'http://localhost:3001',
        endpoints: {
            contact: '/api/contact',
            portfolio: '/api/portfolio',
            testimonials: '/api/testimonials'
        },
        timeout: 10000
    },

    // Social Links (Updated with correct data)
    social: {
        linkedin: 'https://www.linkedin.com/in/thanattsitt-s',
        github: 'https://github.com/Pigletpeakkung',
        email: 'Thanattsitt.info@yahoo.co.uk',
        threads: 'https://www.threads.net/@thanattsitt.s',
        linktree: 'https://linktr.ee/ThanttEzekiel',
        paypal: 'https://paypal.me/@thanattsittS',
        buymeacoffee: 'https://buymeacoffee.com/thanattsitts'
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

    // Breakpoints
    breakpoints: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
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
        supportsWebP: false, // Will be detected dynamically
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTouch: 'ontouchstart' in window
    };

    // Detect WebP support
    const webP = new Image();
    webP.onload = webP.onerror = function() {
        CONFIG.browser.supportsWebP = webP.height === 2;
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
}

export default CONFIG;
