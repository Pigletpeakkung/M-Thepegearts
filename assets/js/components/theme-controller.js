/*
========================================
THEME CONTROLLER
========================================
Handles dark/light theme switching and persistence
*/

import { CONFIG } from '../core/config.js';
import { Utils } from '../core/utils.js';

export class ThemeController {
    constructor() {
        this.currentTheme = this.getStoredTheme() || CONFIG.theme.defaultTheme;
        this.toggleButton = null;
        this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.init();
    }

    init() {
        // Apply initial theme
        this.applyTheme(this.currentTheme, false);
        
        // Find theme toggle button
        this.findToggleButton();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Listen for system theme changes
        if (CONFIG.theme.systemPreference) {
            this.prefersDarkScheme.addListener(this.handleSystemThemeChange.bind(this));
        }
        
        console.log(`🎨 Theme Controller initialized - Current theme: ${this.currentTheme}`);
    }

    findToggleButton() {
        // Try multiple selectors for theme toggle
        const selectors = [
            '[data-theme-toggle]',
            '.theme-toggle',
            '#themeToggle',
            '.dark-mode-toggle'
        ];

        for (const selector of selectors) {
            this.toggleButton = document.querySelector(selector);
            if (this.toggleButton) break;
        }

        if (!this.toggleButton) {
            console.warn('Theme toggle button not found');
            return;
        }

        // Update button state
        this.updateToggleButton();
    }

    setupEventListeners() {
        // Theme toggle button
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', this.toggle.bind(this));
        }

        // Keyboard shortcut (Ctrl/Cmd + Shift + L)
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
                event.preventDefault();
                this.toggle();
            }
        });

        // Listen for theme change events from other sources
        document.addEventListener('theme:change', (event) => {
            if (event.detail.theme !== this.currentTheme) {
                this.setTheme(event.detail.theme);
            }
        });
    }

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error(`Invalid theme: ${theme}`);
            return;
        }

        this.currentTheme = theme;
        this.applyTheme(theme);
        this.storeTheme(theme);
        this.updateToggleButton();

        // Dispatch theme change event
        const event = new CustomEvent('theme:changed', {
            detail: { theme, previous: this.currentTheme }
        });
        document.dispatchEvent(event);

        console.log(`🎨 Theme changed to: ${theme}`);
    }

    applyTheme(theme, animate = true) {
        const body = document.body;
        const html = document.documentElement;

        // Add transition class for smooth animation
        if (animate) {
            body.classList.add('theme-transitioning');
            setTimeout(() => {
                body.classList.remove('theme-transitioning');
            }, CONFIG.theme.transitionDuration);
        }

        // Update data attributes
        body.setAttribute('data-theme', theme);
        html.setAttribute('data-theme', theme);

        // Update theme classes
        body.classList.remove('theme-light', 'theme-dark');
        body.classList.add(`theme-${theme}`);

        // Update CSS custom properties for immediate theme application
        this.updateCSSProperties(theme);

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
    }

    updateCSSProperties(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            // Dark theme properties
            root.style.setProperty('--background-light', '#0f0f23');
            root.style.setProperty('--background-secondary', '#1e1e3f');
            root.style.setProperty('--surface-light', '#1e1e3f');
            root.style.setProperty('--text-dark', '#ffffff');
            root.style.setProperty('--text-medium', '#cbd5e1');
            root.style.setProperty('--text-light', '#94a3b8');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.05)');
            root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
        } else {
            // Light theme properties (reset to defaults)
            root.style.removeProperty('--background-light');
            root.style.removeProperty('--background-secondary');
            root.style.removeProperty('--surface-light');
            root.style.removeProperty('--text-dark');
            root.style.removeProperty('--text-medium');
            root.style.removeProperty('--text-light');
            root.style.removeProperty('--glass-bg');
            root.style.removeProperty('--glass-border');
        }
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.content = theme === 'dark' ? '#0f0f23' : '#ffffff';
    }

    updateToggleButton() {
        if (!this.toggleButton) return;

        // Update aria attributes
        this.toggleButton.setAttribute('aria-pressed', this.currentTheme === 'dark');
        this.toggleButton.setAttribute('aria-label', 
            `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} theme`);

        // Update icon if using Font Awesome
        const icon = this.toggleButton.querySelector('i');
        if (icon) {
            icon.className = this.currentTheme === 'light' 
                ? 'fas fa-moon' 
                : 'fas fa-sun';
        }

        // Update text content if any
        const textContent = this.toggleButton.querySelector('.theme-text');
        if (textContent) {
            textContent.textContent = this.currentTheme === 'light' ? 'Dark' : 'Light';
        }

        // Update data attribute
        this.toggleButton.setAttribute('data-theme', this.currentTheme);
    }

    handleSystemThemeChange(mediaQuery) {
        if (!CONFIG.theme.systemPreference) return;
        
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        const storedTheme = this.getStoredTheme();
        
        // Only change if user hasn't manually set a preference
        if (!storedTheme) {
            this.setTheme(systemTheme
