/*
========================================
UTILITY FUNCTIONS
========================================
Common utility functions used across the application
*/

import { CONFIG } from './config.js';

export class Utils {
    // Debounce function
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Check if element is in viewport
    static isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    static scrollTo(target, offset = 0, duration = 800) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const targetPosition = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = Utils.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation);
    }

    // Easing function
    static easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // Format date
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    }

    // Validate email
    static validateEmail(email) {
        return CONFIG.pages.contact.validation.email.test(email);
    }

    // Generate unique ID
    static generateId(prefix = 'id') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get query parameters
    static getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Set query parameter
    static setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    }

    // Local storage helpers
    static storage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Error writing to localStorage:', error);
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error removing from localStorage:', error);
            }
        }
    };

    // Cookie helpers
    static cookies = {
        get(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        },

        set(name, value, days = 7) {
            const expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = `${name}=${value}; expires=${expires}; path=/`;
        },

        delete(name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    };

    // Device detection
    static device = {
        isMobile: () => CONFIG.browser?.isMobile || window.innerWidth < CONFIG.breakpoints.md,
        isTablet: () => window.innerWidth >= CONFIG.breakpoints.md && window.innerWidth < CONFIG.breakpoints.lg,
        isDesktop: () => window.innerWidth >= CONFIG.breakpoints.lg,
        isTouch: () => CONFIG.browser?.isTouch || 'ontouchstart' in window
    };

    // Performance helpers
    static performance = {
        // Lazy load images
        lazyLoadImage(img, src) {
            const image = new Image();
            image.onload = () => {
                img.src = src;
                img.classList.add('loaded');
            };
            image.src = src;
        },

        // Preload image
        preloadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        },

        // Critical resource hints
        addResourceHint(href, rel = 'prefetch', as = null) {
            const link = document.createElement('link');
            link.rel = rel;
            link.href = href;
            if (as) link.as = as;
            document.head.appendChild(link);
        }
    };

    // Animation helpers
    static animation = {
        // CSS class animation helper
        animate(element, className, duration = 1000) {
            return new Promise(resolve => {
                element.classList.add(className);
                setTimeout(() => {
                    element.classList.remove(className);
                    resolve();
                }, duration);
            });
        },

        // Stagger animation
        staggerElements(elements, className, delay = 100) {
            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add(className);
                }, index * delay);
            });
        }
    };

    // String helpers
    static string = {
        // Truncate string
        truncate(str, length, suffix = '...') {
            return str.length > length ? str.substring(0, length) + suffix : str;
        },

        // Slugify string
        slugify(str) {
            return str
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
        },

        // Capitalize first letter
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // Highlight search terms
        highlight(text, searchTerm) {
            if (!searchTerm) return text;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }
    };

    // Array helpers
    static array = {
        // Shuffle array
        shuffle(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        // Remove duplicates
        unique(array, key = null) {
            if (key) {
                return array.filter((item, index, arr) => 
                    arr.findIndex(obj => obj[key] === item[key]) === index
                );
            }
            return [...new Set(array)];
        },

        // Group by property
        groupBy(array, key) {
            return array.reduce((groups, item) => {
                const group = item[key];
                if (!groups[group]) groups[group] = [];
                groups[group].push(item);
                return groups;
            }, {});
        }
    };

    // URL helpers
    static url = {
        // Build URL with parameters
        build(base, params = {}) {
            const url = new URL(base);
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.set(key, value);
            });
            return url.toString();
        },

        // Get file extension
        getExtension(url) {
            return url.split('.').pop().toLowerCase();
        },

        // Check if URL is external
        isExternal(url) {
            return /^https?:\/\//.test(url) && !url.includes(window.location.hostname);
        }
    };

    // Error handling
    static error = {
        // Log error with context
        log(error, context = {}) {
            console.error('Application Error:', {
                message: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });

            // Send to error tracking service in production
            if (CONFIG.features.analytics && process.env.NODE_ENV === 'production') {
                // Implementation for error tracking service
            }
        },

        // Handle promise rejections
        handleRejection(promise) {
            return promise.catch(error => {
                this.log(error);
                return null;
            });
        }
    };
}

export default Utils;
