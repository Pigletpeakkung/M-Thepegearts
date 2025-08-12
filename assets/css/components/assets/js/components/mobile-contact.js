/*
========================================
MOBILE CONTACT FEATURES
========================================
Mobile-specific contact enhancements
*/

import Utils from '../utils/helpers.js';

class MobileContact {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTouch = 'ontouchstart' in window;
        
        if (this.isMobile || this.isTouch) {
            this.init();
        }
        
        // Update on resize
        Utils.on(window, 'resize', Utils.debounce(() => {
            this.isMobile = window.innerWidth <= 768;
            this.updateMobileFeatures();
        }, 250));
    }

    init() {
        this.addClickToCall();
        this.addClickToEmail();
        this.addWhatsAppIntegration();
        this.optimizeFormForMobile();
        this.addSwipeGestures();
        this.enableVibrationFeedback();
    }

    addClickToCall() {
        const phoneLinks = Utils.$$('a[href^="tel:"]');
        
        phoneLinks.forEach(link => {
            // Add mobile-specific styling and interaction
            link.classList.add('mobile-phone-link');
            
            Utils.on(link, 'click', (e) => {
                // Vibrate on touch devices
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                // Track click-to-call
                this.trackMobileAction('click_to_call', link.href);
                
                // Show confirmation on iOS (Safari doesn't always open phone app)
                if (this.isIOS()) {
                    e.preventDefault();
                    this.showCallConfirmation(link.href);
                }
            });
        });
    }

    addClickToEmail() {
        const emailLinks = Utils.$$('a[href^="mailto:"]');
        
        emailLinks.forEach(link => {
            link.classList.add('mobile-email-link');
            
            Utils.on(link, 'click', () => {
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                this.trackMobileAction('click_to_email', link.href);
            });
        });
    }

    addWhatsAppIntegration() {
        // Add WhatsApp quick contact button
        const whatsappNumber = '+1234567890'; // Replace with actual number
        const whatsappMessage = 'Hi! I found your portfolio and would like to discuss a project.';
        
        const whatsappBtn = document.createElement('a');
        whatsappBtn.href = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
        whatsappBtn.className = 'whatsapp-float';
        whatsappBtn.target = '_blank';
        whatsappBtn.rel = 'noopener';
        whatsappBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span class="whatsapp-text">WhatsApp</span>
        `;
        
        document.body.appendChild(whatsappBtn);
        
        // Track WhatsApp clicks
        Utils.on(whatsappBtn, 'click', () => {
            this.trackMobileAction('whatsapp_click', whatsappNumber);
        });
        
        // Hide/show based on scroll
        let isVisible = true;
        Utils.on(window, 'scroll', Utils.throttle(() => {
            const scrollY = window.scrollY;
            const shouldShow = scrollY > 300;
            
            if (shouldShow && !isVisible) {
                whatsappBtn.classList.add('visible');
                isVisible = true;
            } else if (!shouldShow && isVisible) {
                whatsappBtn.classList.remove('visible');
                isVisible = false;
            }
        }, 100));
    }

    optimizeFormForMobile() {
        const form = Utils.$('#contact-form-main');
        if (!form) return;
        
        // Add mobile-specific input enhancements
        const inputs = Utils.$$('input, textarea', form);
        
        inputs.forEach(input => {
            // Prevent zoom on iOS
            if (this.isIOS() && input.type !== 'checkbox' && input.type !== 'radio') {
                input.style.fontSize = '16px';
            }
            
            // Add mobile-specific input modes
            if (input.type === 'email') {
                input.inputMode = 'email';
            } else if (input.type === 'tel') {
                input.inputMode = 'tel';
            } else if (input.name === 'projectDescription') {
                input.inputMode = 'text';
            }
            
            // Optimize autocomplete
            this.setMobileAutocomplete(input);
        });
        
        // Add mobile form navigation
        this.addMobileFormNav(form);
    }

    setMobileAutocomplete(input) {
        const autocompleteMap = {
            'firstName': 'given-name',
            'lastName': 'family-name',
            'email': 'email',
            'phone': 'tel',
            'company': 'organization'
        };
        
        if (autocompleteMap[input.name]) {
            input.autocomplete = autocompleteMap[input.name];
        }
    }

    addMobileFormNav(form) {
        // Add floating form navigation for multi-step forms
        const formNav = document.createElement('div');
        formNav.className = 'mobile-form-nav';
        formNav.innerHTML = `
            <button type="button" class="mobile-nav-btn" id="mobile-prev" disabled>
                ← Previous
            </button>
            <div class="mobile-step-indicator">
                <span id="mobile-current-step">1</span> of <span id="mobile-total-steps">3</span>
            </div>
            <button type="button" class="mobile-nav-btn" id="mobile-next">
                Next →
            </button>
        `;
        
        form.appendChild(formNav);
        
        // Sync with main form navigation
        const mainNext = Utils.$('#next-step');
        const mainPrev = Utils.$('#prev-step');
        const mobileNext = Utils.$('#mobile-next');
        const mobilePrev = Utils.$('#mobile-prev');
        
        if (mobileNext && mainNext) {
            Utils.on(mobileNext, 'click', () => mainNext.click());
        }
        
        if (mobilePrev && mainPrev) {
            Utils.on(mobilePrev, 'click', () => mainPrev.click());
        }
    }

    addSwipeGestures() {
        // Add swipe gestures for modal navigation
        const modal = Utils.$('#booking-modal');
        if (!modal) return;
        
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;
        
        Utils.on(modal, 'touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        Utils.on(modal, 'touchmove', (e) => {
            if (!startX || !startY) return;
            
            const touch = e.touches[0];
            distX = touch.clientX - startX;
            distY = touch.clientY - startY;
        });
        
        Utils.on(modal, 'touchend', () => {
            if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 100) {
                if (distX > 0) {
                    // Swipe right - go back
                    const backBtn = Utils.$('#booking-back');
                    if (backBtn && backBtn.style.display !== 'none') {
                        backBtn.click();
                    }
                } else {
                    // Swipe left - go forward (if applicable)
                    // Could implement forward navigation here
                }
                
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            }
            
            // Reset
            startX = 0;
            startY = 0;
            distX = 0;
            distY = 0;
        });
    }

    enableVibrationFeedback() {
        if (!navigator.vibrate) return;
        
        // Add vibration to button interactions
        const buttons = Utils.$$('button, .btn, .contact-card');
        
        buttons.forEach(button => {
            Utils.on(button, 'touchstart', () => {
                navigator.vibrate(25);
            });
        });
        
        // Add vibration to form validation errors
        const form = Utils.$('#contact-form-main');
        if (form) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (target.classList.contains('error') && !target.dataset.vibrated) {
                            navigator.vibrate([100, 50, 100]);
                            target.dataset.vibrated = 'true';
                            
                            // Reset after 3 seconds
                            setTimeout(() => {
                                delete target.dataset.vibrated;
                            }, 3000);
                        }
                    }
                });
            });
            
            const inputs = Utils.$$('input, textarea, select', form);
            inputs.forEach(input => {
                observer.observe(input, { attributes: true });
            });
        }
    }

    showCallConfirmation(phoneHref) {
        const phoneNumber = phoneHref.replace('tel:', '');
        
        const confirmation = document.createElement('div');
        confirmation.className = 'call-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-header">
                    <h3>Call ${phoneNumber}?</h3>
                    <button class="confirmation-close">&times;</button>
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-secondary" id="cancel-call">Cancel</button>
                    <a href="${phoneHref}" class="btn btn-primary" id="confirm-call">Call Now</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (confirmation.parentNode) {
                confirmation.parentNode.removeChild(confirmation);
            }
        }, 10000);
        
        // Event listeners
        Utils.on('#cancel-call', 'click', () => {
            confirmation.parentNode.removeChild(confirmation);
        });
        
        Utils.on('.confirmation-close', 'click', () => {
            confirmation.parentNode.removeChild(confirmation);
        });
        
        Utils.on('#confirm-call', 'click', () => {
            confirmation.parentNode.removeChild(confirmation);
        });
    }

    updateMobileFeatures() {
        const whatsappBtn = Utils.$('.whatsapp-float');
        
        if (this.isMobile && !whatsappBtn) {
            this.addWhatsAppIntegration();
        } else if (!this.isMobile && whatsappBtn) {
            whatsappBtn.remove();
        }
    }

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    trackMobileAction(action, data) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'mobile_contact_action', {
                event_category: 'Mobile Contact',
                event_label: action,
                custom_data: data
            });
        }
        
        // Track mobile-specific interactions
        const mobileData = JSON.parse(localStorage.getItem('mobileContactAnalytics') || '{}');
        if (!mobileData[action]) {
            mobileData[action] = 0;
        }
        mobileData[action]++;
        localStorage.setItem('mobileContactAnalytics', JSON.stringify(mobileData));
    }
}

// Initialize when DOM is loaded
Utils.onReady(() => {
    new MobileContact();
});

export default MobileContact;
