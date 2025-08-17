/**
 * EnhancedPortfolio class to manage portfolio website functionality
 * @class
 */
class EnhancedPortfolio {
    constructor() {
        this.initThemeToggle();
        this.initAOS();
        this.initGSAP();
        this.initTypedText();
        this.initSmoothScroll();
        this.initPortfolioFilters();
        this.initNavbar();
        this.initContactForm();
        this.initPWA();
        this.initErrorBoundary();
    }

    /**
     * Initialize theme toggle with localStorage and system preference support
     */
    initThemeToggle() {
        const toggle = document.querySelector('.theme-toggle');
        const setTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            toggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
        };

        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(savedTheme);

        toggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            toggle.classList.add('switching');
            setTimeout(() => toggle.classList.remove('switching'), 600);
        });
    }

    /**
     * Initialize AOS for scroll animations
     */
    initAOS() {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 0,
            easing: 'ease-out-cubic'
        });
    }

    /**
     * Initialize GSAP animations, including enhanced moon animation
     */
    initGSAP() {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(".hero-title, .hero-description, .hero-section__cta, .hero-section__social-links, .scroll-indicator", { clearProps: "all" });
            return;
        }

        const tl = gsap.timeline();
        tl.from(".hero-title", { y: 100, opacity: 0, duration: 1.2, ease: "power4.out" })
          .from(".hero-description", { y: 50, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
          .from(".hero-section__cta", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
          .from(".hero-section__social-links", { opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
          .from(".scroll-indicator", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, "-=0.2");

        // Enhanced Moon Animation
        gsap.to(".moon-core", {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: "linear"
        });
        gsap.to(".moon-crater", {
            x: "random(-10, 10)",
            y: "random(-10, 10)",
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.2
        });
        gsap.to(".moon-glow", {
            scale: 1.2,
            opacity: 0.8,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

        // Parallax effects
        gsap.to(".shape--1", { y: -100, rotation: 45, scrollTrigger: { trigger: ".hero-section", start: "top center", end: "bottom top", scrub: 1 } });
        gsap.to(".shape--2", { y: -150, rotation: -30, scrollTrigger: { trigger: ".hero-section", start: "top center", end: "bottom top", scrub: 1.5 } });
        gsap.to(".shape--3", { y: -80, rotation: 60, scrollTrigger: { trigger: ".hero-section", start: "top center", end: "bottom top", scrub: 0.8 } });
    }

    /**
     * Initialize Typed.js for subtitle animation
     */
    initTypedText() {
        const subtitleElement = document.querySelector('.subtitle');
        if (!subtitleElement) return;
        new Typed(subtitleElement, {
            strings: [
                'AI Creative Designer & Digital Innovator',
                'Bridging Technology and Human Creativity',
                'Building Tomorrow\'s Digital Experiences',
                'Transforming Ideas into Reality'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            cursorChar: '|',
            smartBackspace: true
        });
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    gsap.to(window, {
                        duration: 1.2,
                        scrollTo: { y: target, offsetY: 80 },
                        ease: "power2.inOut"
                    });
                }
            });
        });
    }

    /**
     * Initialize portfolio filters with dynamic loading
     */
    async initPortfolioFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const portfolioGrid = document.getElementById('portfolio-grid');
        const loading = document.querySelector('.portfolio-loading');

        const loadPortfolio = async () => {
            try {
                loading.style.display = 'block';
                const response = await fetch('/portfolio.json');
                const data = await response.json();
                portfolioGrid.innerHTML = '';
                data.projects.forEach((project, index) => {
                    const card = document.createElement('article');
                    card.className = 'portfolio-item';
                    card.setAttribute('data-category', project.category);
                    card.innerHTML = `
                        <div class="portfolio-image">
                            <picture>
                                <source srcset="${project.image.webp}" type="image/webp">
                                <img src="${project.image.jpg}" alt="${project.title} screenshot" loading="lazy">
                            </picture>
                        </div>
                        <div class="portfolio-content">
                            <h4>${project.title}</h4>
                            <p>${project.description}</p>
                            <div class="portfolio-tags">
                                ${project.tags.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
                            </div>
                            <div class="portfolio-links">
                                <a href="${project.liveLink}" class="button button--primary" target="_blank" rel="noopener noreferrer">Live Demo</a>
                                <a href="${project.githubLink}" class="button button--secondary" target="_blank" rel="noopener noreferrer">View Code</a>
                            </div>
                        </div>
                    `;
                    portfolioGrid.appendChild(card);
                    gsap.from(card, { opacity: 0, y: 50, duration: 0.6, ease: "power2.out", delay: index * 0.1 });
                });
            } catch (error) {
                this.showNotification('Failed to load portfolio. Please try again.', 'error');
            } finally {
                loading.style.display = 'none';
            }
        };

        await loadPortfolio();

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                document.querySelectorAll('.portfolio-item').forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category.includes(filter)) {
                        gsap.to(item, { opacity: 1, scale: 1, duration: 0.5, display: 'block' });
                    } else {
                        gsap.to(item, { opacity: 0, scale: 0.8, duration: 0.3, display: 'none' });
                    }
                });
            });
        });
    }

    /**
     * Initialize navbar with scroll-based behavior
     */
    initNavbar() {
        const navbar = document.querySelector('.header__navbar');
        let lastScrollTop = 0;

        const handleScroll = this.debounce(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

            // Update active nav link
            document.querySelectorAll('section[id]').forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 200;
                const sectionId = section.getAttribute('id');
                if (scrollTop > sectionTop && scrollTop <= sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                    const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                    if (link) link.classList.add('active');
                }
            });
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    /**
     * Initialize contact form with Formspree integration
     */
    initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            const submitBtn = form.querySelector('.submit-btn');

            // Reset error states
            ['name', 'email', 'message'].forEach(field => {
                document.getElementById(`${field}-error`).style.display = 'none';
                document.getElementById(`contact-${field}`).setAttribute('aria-invalid', 'false');
            });

            // Validation
            let hasError = false;
            if (!data.name) {
                document.getElementById('name-error').style.display = 'block';
                document.getElementById('contact-name').setAttribute('aria-invalid', 'true');
                hasError = true;
            }
            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                document.getElementById('email-error').style.display = 'block';
                document.getElementById('contact-email').setAttribute('aria-invalid', 'true');
                hasError = true;
            }
            if (!data.message) {
                document.getElementById('message-error').style.display = 'block';
                document.getElementById('contact-message').setAttribute('aria-invalid', 'true');
                hasError = true;
            }
            if (hasError) {
                this.showNotification('Please correct the errors in the form.', 'error');
                return;
            }

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://formspree.io/f/your-formspree-id', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
                if (response.ok) {
                    this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                    form.reset();
                } else {
                    this.showNotification('Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                this.showNotification('Network error. Please try again.', 'error');
            } finally {
                submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane" aria-hidden="true"></i>';
                submitBtn.disabled = false;
            }
        });
    }

    /**
     * Initialize PWA install prompt
     */
    initPWA() {
        let promptEvent;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            promptEvent = e;
            // Show install button if needed
            const installBtn = document.createElement('button');
            installBtn.className = 'button button--secondary';
            installBtn.textContent = 'Install App';
            installBtn.style.position = 'fixed';
            installBtn.style.bottom = '20px';
            installBtn.style.right = '20px';
            document.body.appendChild(installBtn);
            installBtn.addEventListener('click', () => {
                promptEvent.prompt();
                promptEvent.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        this.showNotification('App installed successfully!', 'success');
                    }
                    promptEvent = null;
                    installBtn.remove();
                });
            });
        });
    }

    /**
     * Initialize global error boundary
     */
    initErrorBoundary() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showNotification('An unexpected error occurred. Please try again.', 'error');
        });
    }

    /**
     * Show notification with ARIA support
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <div class="notification__content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification__close" aria-label="Close notification"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        const autoHideTimer = setTimeout(() => this.hideNotification(notification), 5000);
        notification.querySelector('.notification__close').addEventListener('click', () => {
            clearTimeout(autoHideTimer);
            this.hideNotification(notification);
        });
    }

    /**
     * Hide notification
     * @param {HTMLElement} notification - Notification element
     */
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }

    /**
     * Debounce function to optimize event handlers
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EnhancedPortfolio();
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('Service Worker registered'))
            .catch(error => console.error('Service Worker registration failed:', error));
    }
});
