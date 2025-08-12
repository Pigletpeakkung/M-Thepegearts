/*
========================================
FAQ PAGE CONTROLLER
========================================
Handles FAQ page functionality including search, filters, and accordion
*/

import { CONFIG } from '../core/config.js';
import { Utils } from '../core/utils.js';

export class FAQController {
    constructor() {
        this.config = CONFIG.pages.faq;
        this.faqData = [];
        this.filteredData = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        
        // DOM elements
        this.elements = {
            container: null,
            searchInput: null,
            categoryButtons: null,
            faqList: null,
            faqItems: null,
            emptyState: null
        };

        this.init();
    }

    async init() {
        try {
            // Find DOM elements
            this.findElements();
            
            // Load FAQ data
            await this.loadFAQData();
            
            // Render FAQ items
            this.renderFAQItems();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Handle URL hash for direct FAQ links
            this.handleURLHash();
            
            console.log('❓ FAQ Controller initialized');
            
        } catch (error) {
            console.error('Failed to initialize FAQ Controller:', error);
            Utils.error.log(error, 'FAQ Controller initialization');
        }
    }

    findElements() {
        this.elements.container = document.querySelector('.faq-section');
        this.elements.searchInput = document.getElementById('faqSearch') || document.querySelector('.faq-search input');
        this.elements.categoryButtons = document.querySelectorAll('.category-btn');
        this.elements.faqList = document.querySelector('.faq-list');
        this.elements.emptyState = document.querySelector('.faq-empty');
        
        if (!this.elements.container) {
            throw new Error('FAQ container not found');
        }
    }

    async loadFAQData() {
        try {
            // Try to load from external JSON file first
            const response = await fetch('/assets/data/faq.json');
            
            if (response.ok) {
                const data = await response.json();
                this.faqData = this.processFAQData(data);
            } else {
                // Fallback to inline data
                this.faqData = this.getInlineFAQData();
            }
            
            this.filteredData = [...this.faqData];
            
        } catch (error) {
            console.warn('Could not load external FAQ data, using inline data');
            this.faqData = this.getInlineFAQData();
            this.filteredData = [...this.faqData];
        }
    }

    processFAQData(data) {
        const processedData = [];
        
        if (data.categories) {
            data.categories.forEach(category => {
                if (category.faqs && Array.isArray(category.faqs)) {
                    category.faqs.forEach(faq => {
                        processedData.push({
                            ...faq,
                            category: category.id,
                            categoryName: category.name
                        });
                    });
                }
            });
        }
        
        return processedData;
    }

    getInlineFAQData() {
        return [
            {
                id: 'ai-training-approach',
                question: 'How do you approach AI training projects?',
                answer: `I follow a structured methodology for AI training projects:
                
                <ul>
                    <li><strong>Data Analysis:</strong> Comprehensive data quality assessment and preprocessing</li>
                    <li><strong>Model Selection:</strong> Choosing appropriate algorithms based on project requirements</li>
                    <li><strong>Training Strategy:</strong> Iterative training with validation and optimization</li>
                    <li><strong>Performance Monitoring:</strong> Continuous evaluation and improvement</li>
                    <li><strong>Deployment:</strong> Scalable deployment with monitoring systems</li>
                </ul>
                
                <p>Each project is tailored to specific business needs and technical requirements.</p>`,
                category: 'ai',
                categoryName: 'AI & Machine Learning',
                tags: ['ai', 'training', 'methodology', 'machine-learning']
            },
            {
                id: 'design-tools',
                question: 'What design tools and software do you use?',
                answer: `My design toolkit includes industry-standard software and cutting-edge AI tools:
                
                <ul>
                    <li><strong>Adobe Creative Suite:</strong> Photoshop, Illustrator, After Effects, Premiere Pro</li>
                    <li><strong>3D & Motion:</strong> Blender, Cinema 4D, DaVinci Resolve</li>
                    <li><strong>AI Design Tools:</strong> Midjourney, DALL-E, Stable Diffusion, RunwayML</li>
                    <li><strong>UI/UX:</strong> Figma, Adobe XD, Sketch</li>
                    <li><strong>Web Development:</strong> VS Code, GitHub, various frameworks</li>
                </ul>
                
                <p>I constantly explore new tools to stay at the forefront of creative technology.</p>`,
                category: 'design',
                categoryName: 'Creative Design',
                tags: ['design', 'tools', 'software', 'adobe', 'ai-tools']
            },
            {
                id: 'voice-acting-experience',
                question: 'What is your experience in voice acting?',
                answer: `I have extensive experience in voice acting across multiple domains:
                
                <ul>
                    <li><strong>Commercial Voice-over:</strong> Product advertisements, corporate presentations</li>
                    <li><strong>Character Voices:</strong> Animation, gaming, interactive media</li>
                    <li><strong>Narration:</strong> Educational content, documentaries, audiobooks</li>
                    <li><strong>AI Voice Training:</strong> Creating datasets for AI voice synthesis</li>
                    <li><strong>Multilingual Work:</strong> English and Thai voice-over services</li>
                </ul>
                
                <p>My technical background allows me to optimize recordings for both traditional media and AI training applications.</p>`,
                category: 'voice',
                categoryName: 'Voice Acting',
                tags: ['voice-acting', 'narration', 'commercial', 'multilingual']
            },
            {
                id: 'project-timeline',
                question: 'What are typical project timelines?',
                answer: `Project timelines vary based on scope and complexity:
                
                <ul>
                    <li><strong>AI Model Training:</strong> 2-8 weeks depending on data complexity</li>
                    <li><strong>Web Design/Development:</strong> 1-6 weeks for complete websites</li>
                    <li><strong>Graphic Design Projects:</strong> 1-3 weeks for comprehensive branding</li>
                    <li><strong>Voice-over Work:</strong> 1-5 days for most commercial projects</li>
                    <li><strong>Consultation & Strategy:</strong> 1-2 weeks for detailed analysis</li>
                </ul>
                
                <p>I always provide detailed project timelines during the initial consultation phase.</p>`,
                category: 'services',
                categoryName: 'Services',
                tags: ['timeline', 'project-management', 'planning']
            },
            {
                id: 'collaboration-process',
                question: 'How do you collaborate with clients?',
                answer: `My collaboration process is designed for transparency and efficiency:
                
                <ul>
                    <li><strong>Initial Consultation:</strong> Understanding goals and requirements</li>
                    <li><strong>Proposal & Planning:</strong> Detailed project scope and timeline</li>
                    <li><strong>Regular Updates:</strong> Weekly progress reports and milestone reviews</li>
                    <li><strong>Feedback Integration:</strong> Iterative refinement based on client input</li>
                    <li><strong>Final Delivery:</strong> Complete handover with documentation</li>
                </ul>
                
                <p>I use modern collaboration tools and maintain open communication throughout the project lifecycle.</p>`,
                category: 'services',
                categoryName: 'Services',
                tags: ['collaboration', 'process', 'communication', 'project-management']
            },
            {
                id: 'technical-requirements',
                question: 'What are the technical requirements for AI projects?',
                answer: `Technical requirements depend on the specific AI application:
                
                <ul>
                    <li><strong>Data Requirements:</strong> Clean, structured datasets with appropriate volume</li>
                    <li><strong>Computing Resources:</strong> GPU access for training (can be cloud-based)</li>
                    <li><strong>Infrastructure:</strong> Scalable deployment environment</li>
                    <li><strong>Integration:</strong> APIs and systems for seamless integration</li>
                    <li><strong>Monitoring:</strong> Performance tracking and maintenance systems</li>
                </ul>
                
                <p>I can help assess and plan the technical infrastructure needed for your AI initiatives.</p>`,
                category: 'technical',
                categoryName: 'Technical',
                tags: ['technical', 'requirements', 'infrastructure', 'ai', 'setup']
            }
        ];
    }

    renderFAQItems() {
        if (!this.elements.faqList) return;
        
        this.elements.faqList.innerHTML = '';
        
        if (this.filteredData.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        this.filteredData.forEach((faq, index) => {
            const faqElement = this.createFAQElement(faq, index);
            this.elements.faqList.appendChild(faqElement);
        });
        
        // Re-find FAQ items after rendering
        this.elements.faqItems = this.elements.faqList.querySelectorAll('.faq-item');
        
        // Setup accordion functionality
        this.setupAccordionListeners();
        
        // Animate items in
        if (CONFIG.features.animations) {
            Utils.animation.staggerElements(
                this.elements.faqItems,
                'fade-in-up',
                CONFIG.animations.stagger.delay
            );
        }
    }

    createFAQElement(faq, index) {
        const faqElement = document.createElement('div');
        faqElement.className = 'faq-item glass-card';
        faqElement.setAttribute('data-category', faq.category);
        faqElement.setAttribute('data-faq-id', faq.id);
        
        // Highlight search terms if searching
        const question = this.config.highlightMatches && this.searchTerm 
            ? Utils.string.highlight(faq.question, this.searchTerm)
            : faq.question;
            
        const answer = this.config.highlightMatches && this.searchTerm 
            ? Utils.string.highlight(faq.answer, this.searchTerm)
            : faq.answer;
        
        faqElement.innerHTML = `
            <div class="faq-question" role="button" tabindex="0" aria-expanded="false">
                <h3>${question}</h3>
                <i class="fas fa-chevron-down faq-question-icon" aria-hidden="true"></i>
            </div>
            <div class="faq-answer" aria-hidden="true">
                <div class="faq-answer-content">
                    ${answer}
                </div>
            </div>
        `;
        
        return faqElement;
    }

    setupEventListeners() {
        // Search functionality
        if (this.elements.searchInput) {
            const debouncedSearch = Utils.debounce(
                this.handleSearch.bind(this),
                this.config.searchDelay
            );
            
            this.elements.searchInput.addEventListener('input', debouncedSearch);
            this.elements.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });
        }
        
        // Category buttons
        this.elements.categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category') || 'all';
                this.filterByCategory(category);
                this.updateActiveCategory(button);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    setupAccordionListeners() {
        this.elements.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            // Click handler
            question.addEventListener('click', () => {
                this.toggleFAQ(item);
            });
            
            // Keyboard handler
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleFAQ(item);
                }
            });
        });
    }

    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        // Close other FAQs if autoExpand is false
        if (!this.config.autoExpand && !isActive) {
            this.elements.faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    this.closeFAQ(otherItem);
                }
            });
        }
        
        // Toggle current FAQ
        if (isActive) {
            this.closeFAQ(item);
        } else {
            this.openFAQ(item);
        }
        
        // Update URL hash
        if (!isActive) {
            const faqId = item.getAttribute('data-faq-id');
            if (faqId) {
                history.replaceState(null, null, `#${faqId}`);
            }
        }
        
        // Dispatch event
        const event = new CustomEvent('faq:toggle', {
            detail: { item, isActive: !isActive }
        });
        document.dispatchEvent(event);
    }

    openFAQ(item) {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
        
        // Smooth scroll into view
        setTimeout(() => {
            if (!Utils.isInViewport(item)) {
                Utils.scrollTo(item, 100);
            }
        }, 150);
    }

    closeFAQ(item) {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        item.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
    }

    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase().trim();
        this.filterFAQs();
    }

    clearSearch() {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
            this.searchTerm = '';
            this.filterFAQs();
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.filterFAQs();
        
        // Update URL parameter
        if (category !== 'all') {
            Utils.setQueryParam('category', category);
        } else {
            const url = new URL(window.location);
            url.searchParams.delete('category');
            window.history.replaceState({}, '', url);
        }
    }

    filterFAQs() {
        this.filteredData = this.faqData.filter(faq => {
            // Category filter
            const categoryMatch = this.currentCategory === 'all' || faq.category === this.currentCategory;
            
            // Search filter
            const searchMatch = !this.searchTerm || 
                faq.question.toLowerCase().includes(this.searchTerm) ||
                faq.answer.toLowerCase().includes(this.searchTerm) ||
                (faq.tags && faq.tags.some(tag => tag.toLowerCase().includes(this.searchTerm)));
            
            return categoryMatch && searchMatch;
        });
        
        this.renderFAQItems();
        
        // Dispatch filter event
        const event = new CustomEvent('faq:filtered', {
            detail: { 
                count: this.filteredData.length,
                category: this.currentCategory,
                searchTerm: this.searchTerm
            }
        });
        document.dispatchEvent(event);
    }

    updateActiveCategory(activeButton) {
        // Remove active class from all buttons
        this.elements.categoryButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
        });
        
        // Add active class to clicked button
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
    }

    showEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.classList.add('show');
        } else {
            // Create empty state if it doesn't exist
            const emptyState = document.createElement('div');
            emptyState.className = 'faq-empty show';
            emptyState.innerHTML = `
                <div class="faq-empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No FAQs found</h3>
                <p>Try adjusting your search or category filter.</p>
            `;
            this.elements.faqList.appendChild(emptyState);
            this.elements.emptyState = emptyState;
        }
    }

    hideEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.classList.remove('show');
        }
    }

    handleURLHash() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            // Find FAQ item with matching ID
            const faqItem = document.querySelector(`[data-faq-id="${hash}"]`);
            if (faqItem) {
                setTimeout(() => {
                    this.openFAQ(faqItem);
                    Utils.scrollTo(faqItem, 100);
                }, 500);
            }
        }
        
        // Handle category from URL parameter
        const categoryParam = Utils.getQueryParam('category');
        if (categoryParam && this.config.categories.includes(categoryParam)) {
            this.filterByCategory(categoryParam);
            
            // Update active category button
            const categoryButton = document.querySelector(`[data-category="${categoryParam}"]`);
            if (categoryButton) {
                this.updateActiveCategory(categoryButton);
            }
        }
    }

    handleKeyboardNavigation(event) {
        // Only handle if focus is within FAQ section
        if (!this.elements.container.contains(event.target)) return;
        
        const focusedFAQ = event.target.closest('.faq-item');
        if (!focusedFAQ) return;
        
        const faqItems = Array.from(this.elements.faqItems);
        const currentIndex = faqItems.indexOf(focusedFAQ);
        
        let targetIndex = -1;
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                targetIndex = (currentIndex + 1) % faqItems.length;
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                targetIndex = (currentIndex - 1 + faqItems.length) % faqItems.length;
                break;
                
            case 'Home':
                event.preventDefault();
                targetIndex = 0;
                break;
                
            case 'End':
                event.preventDefault();
                targetIndex = faqItems.length - 1;
                break;
        }
        
        if (targetIndex >= 0 && targetIndex < faqItems.length) {
            const targetQuestion = faqItems[targetIndex].querySelector('.faq-question');
            targetQuestion.focus();
        }
    }

    // Public API methods
    openFAQById(id) {
        const faqItem = document.querySelector(`[data-faq-id="${id}"]`);
        if (faqItem) {
            this.openFAQ(faqItem);
            return true;
        }
        return false;
    }

    closeFAQById(id) {
        const faqItem = document.querySelector(`[data-faq-id="${id}"]`);
        if (faqItem) {
            this.closeFAQ(faqItem);
            return true;
        }
        return false;
    }

    expandAll() {
        this.elements.faqItems.forEach(item => {
            this.openFAQ(item);
        });
    }

    collapseAll() {
        this.elements.faqItems.forEach(item => {
            this.closeFAQ(item);
        });
    }

    getStats() {
        return {
            total: this.faqData.length,
            filtered: this.filteredData.length,
            categories: this.config.categories,
            currentCategory: this.currentCategory,
            searchTerm: this.searchTerm
        };
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        if (this.elements.searchInput) {
            this.elements.searchInput.removeEventListener('input', this.handleSearch);
        }
        
        this.elements.categoryButtons.forEach(button => {
            button.removeEventListener('click', this.filterByCategory);
        });
        
        document.removeEventListener('keydown', this.handleKeyboardNavigation);
        
        console.log('❓ FAQ Controller destroyed');
    }
}

export default FAQController;
