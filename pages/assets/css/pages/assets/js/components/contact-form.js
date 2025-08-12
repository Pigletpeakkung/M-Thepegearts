/*
========================================
CONTACT FORM HANDLER
========================================
Advanced form handling with validation and submission
*/

import Utils from '../utils/helpers.js';

class ContactForm {
    constructor() {
        this.form = Utils.$('#contact-form-main');
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.validationRules = {
            firstName: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/ },
            lastName: { required: true, pattern: /^[a-zA-Z\s]{2,50}$/ },
            email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            phone: { required: false, pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/ },
            serviceType: { required: true },
            projectDescription: { required: true, minLength: 50, maxLength: 1000 },
            consent: { required: true }
        };
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.initServiceSelector();
        this.updateProgress();
        this.initCharacterCounter();
        this.setupAutoSave();
        this.loadSavedData();
    }

    bindEvents() {
        // Step navigation
        Utils.on('#next-step', 'click', () => this.nextStep());
        Utils.on('#prev-step', 'click', () => this.prevStep());
        Utils.on('#submit-form', 'click', (e) => this.handleSubmit(e));
        
        // Form submission
        Utils.on(this.form, 'submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = Utils.$$('input, select, textarea', this.form);
        inputs.forEach(input => {
            Utils.on(input, 'blur', () => this.validateField(input));
            Utils.on(input, 'input', () => this.clearError(input));
        });
        
        // Service selector
        const serviceOptions = Utils.$$('.service-option');
        serviceOptions.forEach(option => {
            Utils.on(option, 'click', () => this.selectService(option));
        });
    }

    initServiceSelector() {
        const serviceOptions = Utils.$$('.service-option');
        const serviceSelect = Utils.$('#service-type');
        
        serviceOptions.forEach(option => {
            Utils.on(option, 'click', () => {
                // Remove active from all options
                serviceOptions.forEach(opt => opt.classList.remove('active'));
                // Add active to clicked option
                option.classList.add('active');
                
                // Update select field
                const service = option.dataset.service;
                const serviceMap = {
                    'ai-specialist': 'ai-consulting',
                    'voice-acting': 'voice-commercial',
                    'digital-design': 'design-branding',
                    'consultation': 'consultation'
                };
                
                if (serviceSelect && serviceMap[service]) {
                    serviceSelect.value = serviceMap[service];
                    this.clearError(serviceSelect);
                }
            });
        });
    }

    initCharacterCounter() {
        const textarea = Utils.$('#project-description');
        const counter = Utils.$('#description-count');
        
        if (textarea && counter) {
            Utils.on(textarea, 'input', () => {
                const count = textarea.value.length;
                counter.textContent = count;
                
                if (count > 1000) {
                    counter.style.color = 'var(--error-color)';
                } else if (count > 800) {
                    counter.style.color = 'var(--warning-color)';
                } else {
                    counter.style.color = 'var(--text-secondary)';
                }
            });
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveStepData();
            if (this.currentStep < this.totalSteps) {
                this.showStep(this.currentStep + 1);
            }
        }
    }

    prevStep() {
        this.saveStepData();
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    showStep(stepNumber) {
        // Hide current step
        const currentStepEl = Utils.$(`[data-step="${this.currentStep}"]`);
        if (currentStepEl) {
            currentStepEl.classList.remove('active');
        }
        
        // Show new step
        const newStepEl = Utils.$(`[data-step="${stepNumber}"]`);
        if (newStepEl) {
            newStepEl.classList.add('active');
        }
        
        this.currentStep = stepNumber;
        this.updateProgress();
        this.updateNavigation();
        
        // Focus first input in new step
        const firstInput = Utils.$('input, select, textarea', newStepEl);
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    updateProgress() {
        const progressFill = Utils.$('#form-progress');
        const currentStepSpan = Utils.$('#current-step');
        
        if (progressFill) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        if (currentStepSpan) {
            currentStepSpan.textContent = this.currentStep;
        }
    }

    updateNavigation() {
        const prevBtn = Utils.$('#prev-step');
        const nextBtn = Utils.$('#next-step');
        const submitBtn = Utils.$('#submit-form');
        
        // Show/hide previous button
        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'flex';
        }
        
        // Show/hide next/submit buttons
        if (this.currentStep === this.totalSteps) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'flex';
        } else {
            if (nextBtn) nextBtn.style.display = 'flex';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    validateCurrentStep() {
        const currentStepEl = Utils.$(`[data-step="${this.currentStep}"]`);
        const inputs = Utils.$$('input, select, textarea', currentStepEl);
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const name = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[name];
        
        if (!rules) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Pattern validation
        else if (value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = this.getPatternError(name);
        }
        
        // Length validation
        else if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `Minimum ${rules.minLength} characters required`;
        }
        
        else if (value && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `Maximum ${rules.maxLength} characters allowed`;
        }
        
        // Special validations
        else if (field.type === 'checkbox' && rules.required && !field.checked) {
            isValid = false;
            errorMessage = 'Please accept to continue';
        }
        
        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    getPatternError(fieldName) {
        const errors = {
            firstName: 'Please enter a valid first name',
            lastName: 'Please enter a valid last name',
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid phone number'
        };
        return errors[fieldName] || 'Invalid format';
    }

    showFieldError(field, message) {
        const errorEl = Utils.$(`#${field.id}-error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.toggle('show', !!message);
        }
        
        field.classList.toggle('error', !!message);
    }

    clearError(field) {
        const errorEl = Utils.$(`#${field.id}-error`);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('show');
        }
        field.classList.remove('error');
    }

    saveStepData() {
        const currentStepEl = Utils.$(`[data-step="${this.currentStep}"]`);
        const inputs = Utils.$$('input, select, textarea', currentStepEl);
        
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) {
                    if (input.name.endsWith('[]') || input.name === 'additionalServices') {
                        if (!this.formData[input.name]) {
                            this.formData[input.name] = [];
                        }
                        this.formData[input.name].push(input.value);
                    } else {
                        this.formData[input.name] = input.value;
                    }
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });
        
        // Auto-save to localStorage
        localStorage.setItem('contactFormData', JSON.stringify(this.formData));
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('contactFormData');
            if (saved) {
                this.formData = JSON.parse(saved);
                this.populateForm();
            }
        } catch (error) {
            Utils.warn('Could not load saved form data:', error);
        }
    }

    populateForm() {
        Object.keys(this.formData).forEach(name => {
            const field = Utils.$(`[name="${name}"]`);
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    if (Array.isArray(this.formData[name])) {
                        this.formData[name].forEach(value => {
                            const checkbox = Utils.$(`[name="${name}"][value="${value}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    } else {
                        field.checked = true;
                    }
                } else {
                    field.value = this.formData[name];
                }
            }
        });
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveStepData();
        }, 30000);
        
        // Save before page unload
        Utils.on(window, 'beforeunload', () => {
            this.saveStepData();
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.saveStepData();
        
        // Show loading state
        const submitBtn = Utils.$('#submit-form');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent =
                            submitBtn.textContent = 'Sending...';
            submitBtn.classList.add('loading');
        }
        
        this.form.classList.add('form-submitting');
        
        try {
            // Collect all form data
            const formData = this.collectFormData();
            
            // Validate complete form
            if (!this.validateCompleteForm(formData)) {
                throw new Error('Please check all required fields');
            }
            
            // Submit form
            await this.submitForm(formData);
            
            // Clear saved data
            localStorage.removeItem('contactFormData');
            
            // Show success
            this.showSuccess();
            
        } catch (error) {
            Utils.error('Form submission error:', error);
            this.showError(error.message);
        } finally {
            // Reset loading state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
                submitBtn.classList.remove('loading');
            }
            this.form.classList.remove('form-submitting');
        }
    }

    collectFormData() {
        const data = { ...this.formData };
        
        // Collect any remaining data from current step
        const inputs = Utils.$$('input, select, textarea', this.form);
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.name === 'additionalServices') {
                    if (!data.additionalServices) data.additionalServices = [];
                    if (input.checked && !data.additionalServices.includes(input.value)) {
                        data.additionalServices.push(input.value);
                    }
                } else if (input.checked) {
                    data[input.name] = input.value;
                }
            } else if (input.type === 'radio') {
                if (input.checked) {
                    data[input.name] = input.value;
                }
            } else {
                data[input.name] = input.value;
            }
        });
        
        // Add metadata
        data.timestamp = new Date().toISOString();
        data.userAgent = navigator.userAgent;
        data.referrer = document.referrer;
        data.currentUrl = window.location.href;
        
        return data;
    }

    validateCompleteForm(data) {
        const required = ['firstName', 'lastName', 'email', 'serviceType', 'projectDescription', 'consent'];
        
        for (const field of required) {
            if (!data[field]) {
                Utils.error(`Required field missing: ${field}`);
                return false;
            }
        }
        
        return true;
    }

    async submitForm(data) {
        // Simulate API call - replace with your actual endpoint
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send message');
        }
        
        return await response.json();
    }

    showSuccess() {
        const modal = Utils.$('#success-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Auto-close after 5 seconds
            setTimeout(() => {
                this.closeSuccess();
            }, 5000);
            
            // Close button
            Utils.on('#close-success', 'click', () => this.closeSuccess());
            
            // Close on escape
            Utils.on(document, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSuccess();
                }
            });
        }
        
        // Reset form
        this.resetForm();
        
        // Track success event
        this.trackEvent('contact_form_submitted');
    }

    closeSuccess() {
        const modal = Utils.$('#success-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">❌</div>
                <div class="notification-message">${message}</div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        Utils.on(closeBtn, 'click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Track error event
        this.trackEvent('contact_form_error', { error: message });
    }

    resetForm() {
        // Reset to step 1
        this.currentStep = 1;
        this.showStep(1);
        
        // Clear form data
        this.formData = {};
        
        // Reset form fields
        this.form.reset();
        
        // Clear service selector
        const serviceOptions = Utils.$$('.service-option');
        serviceOptions.forEach(opt => opt.classList.remove('active'));
        
        // Clear errors
        const errorEls = Utils.$$('.form-error');
        errorEls.forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });
        
        const inputEls = Utils.$$('.form-input, .form-select, .form-textarea');
        inputEls.forEach(el => el.classList.remove('error'));
    }

    trackEvent(eventName, data = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Contact Form',
                ...data
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, data);
        }
        
        // Custom tracking
        if (window.customTracker) {
            window.customTracker.track(eventName, data);
        }
    }
}

// Initialize when DOM is loaded
Utils.onReady(() => {
    new ContactForm();
});

export default ContactForm;

