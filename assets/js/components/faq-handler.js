/*
========================================
FAQ HANDLER
========================================
Interactive FAQ section with search and analytics
*/

import Utils from '../utils/helpers.js';

class FAQHandler {
    constructor() {
        this.faqs = Utils.$$('.faq-item');
        this.searchEnabled = false;
        
        if (this.faqs.length > 0) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.trackFAQViews();
    }

    bindEvents() {
        this.faqs.forEach(faq => {
            const question = Utils.$('.faq-question', faq);
            if (question) {
                Utils.on(question, 'click', () => this.toggleFAQ(faq));
            }
        });
    }

    toggleFAQ(faqItem) {
        const isActive = faqItem.classList.contains('active');
        
        if (isActive) {
            this.closeFAQ(faqItem);
        } else {
            // Close other FAQs first (accordion behavior)
            this.faqs.forEach(item => {
                if (item !== faqItem) {
                    this.closeFAQ(item);
                }
            });
            
            this.openFAQ(faqItem);
        }
    }

    openFAQ(faqItem) {
        faqItem.classList.add('active');
        
        // Track FAQ interaction
        const question = Utils.$('.faq-question span', faqItem
        const question = Utils.$('.faq-question span', faqItem);
        if (question) {
            this.trackFAQInteraction('open', question.textContent);
        }
        
        // Smooth scroll to ensure FAQ is visible
        setTimeout(() => {
            const rect = faqItem.getBoundingClientRect();
            if (rect.top < 100) {
                faqItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }
        }, 300);
    }

    closeFAQ(faqItem) {
        faqItem.classList.remove('active');
    }

    trackFAQInteraction(action, question) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'faq_interaction', {
                event_category: 'FAQ',
                event_label: question,
                action: action
            });
        }
        
        // Track popular questions for optimization
        const faqData = JSON.parse(localStorage.getItem('faqAnalytics') || '{}');
        if (!faqData[question]) {
            faqData[question] = 0;
        }
        faqData[question]++;
        localStorage.setItem('faqAnalytics', JSON.stringify(faqData));
    }

    trackFAQViews() {
        // Track which FAQs are viewed (intersection observer)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const question = Utils.$('.faq-question span', entry.target);
                    if (question) {
                        this.trackFAQInteraction('view', question.textContent);
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.faqs.forEach(faq => observer.observe(faq));
    }

    // Method to add search functionality (can be called later)
    addSearchFunctionality() {
        const searchContainer = Utils.$('.faq-container');
        if (!searchContainer || this.searchEnabled) return;
        
        const searchBox = document.createElement('div');
        searchBox.className = 'faq-search';
        searchBox.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" id="faq-search" placeholder="Search FAQs..." class="search-input">
                <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                </svg>
            </div>
            <div class="search-results" id="search-results"></div>
        `;
        
        searchContainer.insertBefore(searchBox, searchContainer.firstChild);
        
        const searchInput = Utils.$('#faq-search');
        Utils.on(searchInput, 'input', (e) => this.handleSearch(e.target.value));
        
        this.searchEnabled = true;
    }

    handleSearch(query) {
        const results = Utils.$('#search-results');
        const allFAQs = Utils.$$('.faq-item');
        
        if (query.length < 2) {
            results.style.display = 'none';
            allFAQs.forEach(faq => faq.style.display = 'block');
            return;
        }
        
        const matches = [];
        allFAQs.forEach(faq => {
            const question = Utils.$('.faq-question span', faq);
            const answer = Utils.$('.faq-answer', faq);
            
            if (question && answer) {
                const questionText = question.textContent.toLowerCase();
                const answerText = answer.textContent.toLowerCase();
                const searchQuery = query.toLowerCase();
                
                if (questionText.includes(searchQuery) || answerText.includes(searchQuery)) {
                    matches.push({
                        element: faq,
                        question: question.textContent,
                        relevance: this.calculateRelevance(questionText, answerText, searchQuery)
                    });
                    faq.style.display = 'block';
                } else {
                    faq.style.display = 'none';
                }
            }
        });
        
        // Show search results summary
        results.innerHTML = `
            <div class="search-summary">
                Found ${matches.length} result${matches.length !== 1 ? 's' : ''} for "${query}"
            </div>
        `;
        results.style.display = 'block';
        
        // Track search
        this.trackFAQInteraction('search', query);
    }

    calculateRelevance(question, answer, query) {
        let relevance = 0;
        
        // Higher relevance for matches in question title
        if (question.includes(query)) {
            relevance += 10;
        }
        
        // Lower relevance for matches in answer
        if (answer.includes(query)) {
            relevance += 5;
        }
        
        // Bonus for exact word matches
        const queryWords = query.split(' ');
        queryWords.forEach(word => {
            if (question.includes(word)) relevance += 3;
            if (answer.includes(word)) relevance += 1;
        });
        
        return relevance;
    }
}

// Initialize when DOM is loaded
Utils.onReady(() => {
    new FAQHandler();
});

export default FAQHandler;
