/*
========================================
LEGAL PAGES FUNCTIONALITY
========================================
Interactive features for privacy policy, terms of service, and cookie policy pages
*/

class LegalPageHandler {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.cookieManager = null;
        this.searchIndex = null;
        this.tocItems = [];
        
        this.init();
    }

    init() {
        this.initializeTableOfContents();
        this.initializeSearch();
        this.initializePrintFunctionality();
        this.initializeLastUpdated();
        this.initializeCookieManager();
        this.initializeScrollSpy();
        this.initializeExpandableContent();
        this.initializeContactLinks();
        this.bindEvents();
        
        // Page-specific initialization
        switch(this.currentPage) {
            case 'privacy-policy':
                this.initPrivacyFeatures();
                break;
            case 'terms-of-service':
                this.initTermsFeatures();
                break;
            case 'cookie-policy':
                this.initCookieFeatures();
                break;
        }
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('privacy-policy')) return 'privacy-policy';
        if (path.includes('terms-of-service')) return 'terms-of-service';
        if (path.includes('cookie-policy')) return 'cookie-policy';
        return 'unknown';
    }

    // Table of Contents Generation
    initializeTableOfContents() {
        const tocContainer = document.querySelector('.table-of-contents');
        const headings = document.querySelectorAll('.legal-content h2, .legal-content h3');
        
        if (!tocContainer || !headings.length) return;

        // Generate TOC HTML
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        headings.forEach((heading, index) => {
            // Generate ID if not present
            if (!heading.id) {
                heading.id = this.generateHeadingId(heading.textContent);
            }

            const listItem = document.createElement('li');
            listItem.className = `toc-item toc-${heading.tagName.toLowerCase()}`;
            
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            link.className = 'toc-link';
            
            listItem.appendChild(link);
            tocList.appendChild(listItem);

            // Store for scroll spy
            this.tocItems.push({
                id: heading.id,
                element: heading,
                link: link,
                offset: heading.offsetTop
            });
        });

        // Replace existing TOC content
        const existingList = tocContainer.querySelector('.toc-list');
        if (existingList) {
            existingList.replaceWith(tocList);
        } else {
            tocContainer.appendChild(tocList);
        }

        // Add smooth scrolling
        this.addSmoothScrolling(tocContainer);
    }

    generateHeadingId(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    addSmoothScrolling(container) {
        const links = container.querySelectorAll('.toc-link');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offset = 80; // Account for fixed header
                    const targetPosition = targetElement.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without scrolling
                    history.pushState(null, null, `#${targetId}`);
                    
                    // Update active state
                    this.updateActiveTocItem(targetId);
                }
            });
        });
    }

    // Search Functionality
    initializeSearch() {
        const searchContainer = document.querySelector('.legal-search');
        const searchInput = document.querySelector('.legal-search-input');
        const searchResults = document.querySelector('.search-results');
        const searchClear = document.querySelector('.search-clear');

        if (!searchInput) return;

        // Build search index
        this.buildSearchIndex();

        // Search event listeners
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length === 0) {
                this.clearSearch();
                return;
            }

            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Clear search
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                this.clearSearch();
                searchInput.focus();
            });
        }

        // Close search on escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                this.clearSearch();
            }
        });
    }

    buildSearchIndex() {
        const content = document.querySelector('.legal-content');
        if (!content) return;

        this.searchIndex = [];
        const sections = content.querySelectorAll('section, .legal-section');

        sections.forEach(section => {
            const heading = section.querySelector('h2, h3');
            const paragraphs = section.querySelectorAll('p, li');
            
            if (heading) {
                // Index heading
                this.searchIndex.push({
                    type: 'heading',
                    title: heading.textContent,
                    content: heading.textContent,
                    element: heading,
                    id: heading.id || this.generateHeadingId(heading.textContent)
                });
            }

            // Index paragraph content
            paragraphs.forEach(para => {
                this.searchIndex.push({
                    type: 'content',
                    title: heading ? heading.textContent : 'Content',
                    content: para.textContent,
                    element: para,
                    section: heading ? heading.id : null
                });
            });
        });
    }

    performSearch(query) {
        const results = this.searchContent(query);
        this.displaySearchResults(results, query);
        
        // Highlight matches in content
        this.highlightSearchTerms(query);
    }

    searchContent(query) {
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        const results = [];

        this.searchIndex.forEach((item, index) => {
            const content = item.content.toLowerCase();
            const title = item.title.toLowerCase();
            let score = 0;

            terms.forEach(term => {
                // Title matches score higher
                if (title.includes(term)) {
                    score += item.type === 'heading' ? 10 : 5;
                }
                
                // Content matches
                if (content.includes(term)) {
                    score += item.type === 'heading' ? 3 : 1;
                }
            });

            if (score > 0) {
                results.push({
                    ...item,
                    score: score,
                    excerpt: this.generateExcerpt(item.content, terms)
                });
            }
        });

        // Sort by score (highest first)
        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    generateExcerpt(content, terms, maxLength = 150) {
        const lowerContent = content.toLowerCase();
        let bestIndex = -1;
        let bestScore = 0;

        // Find the position with most term matches
        for (let i = 0; i < content.length - maxLength; i += 10) {
            const snippet = lowerContent.substring(i, i + maxLength);
            const score = terms.reduce((acc, term) => {
                return acc + (snippet.includes(term) ? 1 : 0);
            }, 0);

            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
            }
        }

        if (bestIndex === -1) bestIndex = 0;

        let excerpt = content.substring(bestIndex, bestIndex + maxLength);
        
        // Trim to word boundaries
        if (bestIndex > 0) {
            const firstSpace = excerpt.indexOf(' ');
            if (firstSpace > 0) excerpt = excerpt.substring(firstSpace);
            excerpt = '...' + excerpt;
        }

        if (bestIndex + maxLength < content.length) {
            const lastSpace = excerpt.lastIndexOf(' ');
            if (lastSpace > 0) excerpt = excerpt.substring(0, lastSpace);
            excerpt = excerpt + '...';
        }

        return excerpt;
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';
        resultsContainer.style.display = results.length > 0 ? 'block' : 'none';

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No results found for "${query}"</p>
                    <p class="search-suggestions">Try different keywords or check the Table of Contents</p>
                </div>
            `;
            return;
        }

        const resultsList = document.createElement('div');
        resultsList.className = 'results-list';

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = `result-item result-${result.type}`;
            
            const excerpt = this.highlightTerms(result.excerpt, query);
            const title = this.highlightTerms(result.title, query);

            resultItem.innerHTML = `
                <div class="result-header">
                    <h4 class="result-title">${title}</h4>
                    <span class="result-type">${result.type}</span>
                </div>
                <p class="result-excerpt">${excerpt}</p>
            `;

            // Add click handler to scroll to result
            resultItem.addEventListener('click', () => {
                this.scrollToSearchResult(result);
                this.clearSearch();
            });

            resultsList.appendChild(resultItem);
        });

        resultsContainer.appendChild(resultsList);
    }

    highlightTerms(text, query) {
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        let highlighted = text;

        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });

        return highlighted;
    }

    scrollToSearchResult(result) {
        let targetElement = result.element;
        
        // If it's content, try to find the parent section
        if (result.type === 'content' && result.section) {
            const section = document.getElementById(result.section);
            if (section) targetElement = section;
        }

        if (targetElement) {
            const offset = 80;
            const targetPosition = targetElement.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Highlight the target briefly
            targetElement.classList.add('search-highlight');
            setTimeout(() => {
                targetElement.classList.remove('search-highlight');
            }, 3000);
        }
    }

    highlightSearchTerms(query) {
        // Remove existing highlights
        this.clearHighlights();

        if (!query) return;

        const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        const walker = document.createTreeWalker(
            document.querySelector('.legal-content'),
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            let highlightedText = text;
            let hasHighlight = false;

            terms.forEach(term => {
                const regex = new RegExp(`(${term})`, 'gi');
                if (regex.test(text)) {
                    highlightedText = highlightedText.replace(regex, '<mark class="search-term-highlight">$1</mark>');
                    hasHighlight = true;
                }
            });

            if (hasHighlight) {
                const span = document.createElement('span');
                span.innerHTML = highlightedText;
                span.className = 'highlighted-content';
                textNode.parentNode.replaceChild(span, textNode);
            }
        });
    }

    clearHighlights() {
        const highlights = document.querySelectorAll('.highlighted-content');
        highlights.forEach(highlight => {
            highlight.parentNode.replaceChild(
                document.createTextNode(highlight.textContent),
                highlight
            );
        });
    }

    clearSearch() {
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
        }
        this.clearHighlights();
    }

    // Scroll Spy for TOC
    initializeScrollSpy() {
        if (!this.tocItems.length) return;

        let ticking = false;
        const updateScrollSpy = () => {
            const scrollPosition = window.scrollY + 100; // Account for header offset
            
            let activeItem = null;
            for (let i = this.tocItems.length - 1; i >= 0; i--) {
                if (scrollPosition >= this.tocItems[i].element.offsetTop - 100) {
                    activeItem = this.tocItems[i];
                    break;
                }
            }

            if (activeItem) {
                this.updateActiveTocItem(activeItem.id);
            }

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollSpy);
                ticking = true;
            }
        });
    }

    updateActiveTocItem(activeId) {
        const tocLinks = document.querySelectorAll('.toc-link');
        tocLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === activeId) {
                link.classList.add('active');
                link.parentElement.classList.add('active');
            } else {
                link.classList.remove('active');
                link.parentElement.classList.remove('active');
            }
        });
    }

    // Print Functionality
    initializePrintFunctionality() {
        const printButton = document.querySelector('.print-legal');
        if (!printButton) return;

        printButton.addEventListener('click', () => {
            this.printLegalDocument();
        });

        // Add print styles dynamically
        this.addPrintStyles();
    }

    printLegalDocument() {
        // Hide non-essential elements for printing
        const elementsToHide = [
            '.site-header',
            '.legal-search',
            '.search-results',
            '.print-legal',
            '.back-to-top',
            '.main-footer'
        ];

        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.style.display = 'none');
        });

        // Add print-specific class
        document.body.classList.add('printing');

        // Print the page
        window.print();

        // Restore hidden elements after printing
        setTimeout(() => {
            elementsToHide.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.style.display = '');
            });
            document.body.classList.remove('printing');
        }, 1000);
    }

    addPrintStyles() {
        const printStyles = `
            @media print {
                .site-header,
                .legal-search,
                .search-results,
                .print-legal,
                .back-to-top,
                .main-footer {
                    display: none !important;
                }
                
                body {
                    font-size: 12pt;
                    line-height: 1.4;
                    color: #000;
                }
                
                .legal-container {
                    max-width: none;
                    margin: 0;
                    padding: 0;
                }
                
                .legal-content {
                    padding: 0;
                }
                
                h1, h2, h3 {
                    page-break-after: avoid;
                    color: #000;
                }
                
                .table-of-contents {
                    page-break-after: always;
                }
                
                .legal-section {
                    page-break-inside: avoid;
                    margin-bottom: 20pt;
                }
                
                a {
                    color: #000;
                    text-decoration: none;
                }
                
                a[href^="http"]:after {
                    content: " (" attr(href) ")";
                    font-size: 10pt;
                    color: #666;
                }
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = printStyles;
        document.head.appendChild(styleElement);
    }

    // Last Updated Display
    initializeLastUpdated() {
        const lastUpdatedElements = document.querySelectorAll('.last-updated-date');
        const lastUpdated = this.getLastUpdatedDate();

        lastUpdatedElements.forEach(element => {
            element.textContent = lastUpdated;
        });

        // Add update notification if recently updated
        this.checkForRecentUpdates();
    }

    getLastUpdatedDate() {
        // In a real application, this would come from your CMS or build process
        const updateDates = {
            'privacy-policy': '2024-01-15',
            'terms-of-service': '2024-01-10',
            'cookie-policy': '2024-01-20'
        };

        const dateString = updateDates[this.currentPage] || '2024-01-01';
        const date = new Date(dateString);
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    checkForRecentUpdates() {
        const updateDates = {
            'privacy-policy': '2024-01-15',
            'terms-of-service': '2024-01-10',
            'cookie-policy': '2024-01-20'
        };

        const lastUpdate = new Date(updateDates[this.currentPage]);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (lastUpdate > thirtyDaysAgo) {
            this.showUpdateNotification();
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🆕</div>
                <div class="notification-text">
                    <strong>Recently Updated</strong>
                    <p>This document has been updated in the last 30 days. Please review the changes.</p>
                </div>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        // Insert after header
        const header = document.querySelector('.legal-header');
        if (header) {
            header.after(notification);
        }

        // Close notification
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-close after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Expandable Content (for long sections)
    initializeExpandableContent() {
        const longSections = document.querySelectorAll('.legal-section');
        
        longSections.forEach(section => {
            const content = section.querySelector('p, .section-content');
            if (content && content.textContent.length > 500) {
                this.makeContentExpandable(section, content);
            }
        });
    }

    makeContentExpandable(section, content) {
        const originalHeight = content.offsetHeight;
        const collapsedHeight = 200; // pixels

        if (originalHeight <= collapsedHeight) return;

        // Create expand/collapse button
        const expandButton = document.createElement('button');
        expandButton.className = 'expand-content-btn';
        expandButton.innerHTML = '<span>Read More</span> <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>';

        // Add collapsed class initially
        content.classList.add('content-collapsed');
        content.style.maxHeight = `${collapsedHeight}px`;
        content.style.overflow = 'hidden';
        content.style.position = 'relative';

        // Add gradient overlay
        const overlay = document.createElement('div');
        overlay.className = 'content-overlay';
        content.appendChild(overlay);

        // Insert button after content
        content.after(expandButton);

        // Toggle functionality
        let isExpanded = false;
        expandButton.addEventListener('click', () => {
            if (isExpanded) {
                content.style.maxHeight = `${collapsedHeight}px`;
                content.classList.add('content-collapsed');
                expandButton.innerHTML = '<span>Read More</span> <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>';
                overlay.style.display = 'block';
                isExpanded = false;
            } else {
                content.style.maxHeight = 'none';
                content.classList.remove('content-collapsed');
                expandButton.innerHTML = '<span>Read Less</span> <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"/></svg>';
                overlay.style.display = 'none';
                isExpanded = true;
            }
        });
    }

    // Contact Links Enhancement
    initializeContactLinks() {
        const contactLinks = document.querySelectorAll('a[href^="mailto:"]');
        
        contactLinks.forEach(link => {
            // Add click tracking
            link.addEventListener('click', (e) => {
                this.trackContactLinkClick(link.href, this.currentPage);
            });

            // Add visual enhancement
            if (!link.classList.contains('enhanced')) {
                link.classList.add('enhanced');
                const icon = document.createElement('span');
                icon.innerHTML = '📧';
                icon.className = 'email-icon';
                link.prepend(icon);
            }
        });
    }

    trackContactLinkClick(href, page) {
        // Analytics tracking for legal page contact interactions
        if (typeof gtag !== 'undefined') {
            gtag('event', 'legal_contact_click', {
                'contact_method': 'email',
                'source_page': page,
                'link_href': href
            });
        }
    }

    // Page-specific initialization methods
    initPrivacyFeatures() {
        this.initDataRequestForm();
        this.initPrivacyToggles();
        this.highlightGDPRSections();
    }

    initDataRequestForm() {
        const requestButton = document.querySelector('.data-request-btn');
        if (!requestButton) return;

        requestButton.addEventListener('click', () => {
            this.showDataRequestModal();
        });
    }

    showDataRequestModal() {
        // Create modal for data requests
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content data-request-modal">
                <div class="modal-header">
                    <h3>Data Request</h3>
                    <button class="modal-close" aria-label="Close modal">×</button>
                </div>
                <div class="modal-body">
                    <p>Under GDPR, you have the right to request access to, correction of, or deletion of your personal data.</p>
                    <form class="data-request-form">
                        <div class="form-group">
                            <label for="request-type">Request Type:</label>
                            <select id="request-type" name="requestType" required>
                                <option value="">Select a request type</option>
                                <option value="access">Access my data</option>
                                <option value="correction">Correct my data</option>
                                <option value="deletion">Delete my data</option>
                                <option value="portability">Data portability</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="request-email">Your Email:</label>
                            <input type="email" id="request-email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="request-details">Additional Details:</label>
                            <textarea id="request-details" name="details" rows="4" placeholder="Please provide any additional information about your request..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Request</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal events
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form submission
        const form = modal.querySelector('.data-request-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDataRequest(new FormData(form));
            closeModal();
        });
    }

    handleDataRequest(formData) {
        const requestData = Object.fromEntries(formData);
        
        // In a real application, this would send to your backend
        console.log('Data request submitted:', requestData);
        
        // Show confirmation
        this.showNotification('Your data request has been submitted. We will respond within 30 days as required by GDPR.', 'success');
        
        // Track the request
        if (typeof gtag !== 'undefined') {
            gtag('event', 'gdpr_data_request', {
                'request_type': requestData.requestType,
                'source_page': 'privacy-policy'
            });
        }
    }

    initPrivacyToggles() {
        // Add interactive privacy setting previews
        const privacySections = document.querySelectorAll('.privacy-section');
        
        privacySections.forEach(section => {
            const heading = section.querySelector('h3');
            if (heading && heading.textContent.includes('Cookies')) {
                this.addCookieToggleDemo(section);
            }
        });
    }

    addCookieToggleDemo(section) {
        const demo = document.createElement('div');
        demo.className = 'privacy-demo';
        demo.innerHTML = `
            <div class="demo-header">
                <h4>Cookie Preferences Demo</h4>
                <p>This is how cookie preferences work on our site:</p>
            </div>
            <div class="cookie-toggles">
                <div class="toggle-group">
                    <label class="toggle-label">
                        <input type="checkbox" checked disabled>
                        <span class="toggle-slider"></span>
                        Essential Cookies (Required)
                    </label>
                </div>
                <div class="toggle-group">
                    <label class="toggle-label">
                        <input type="checkbox" class="analytics-toggle">
                        <span class="toggle-slider"></span>
                        Analytics Cookies
                    </label>
                </div>
                <div class="toggle-group">
                    <label class="toggle-label">
                        <input type="checkbox" class="marketing-toggle">
                        <span class="toggle-slider"></span>
                        Marketing Cookies
                    </label>
                </div>
            </div>
            <button class="btn btn-sm btn-primary save-preferences">Save Preferences</button>
        `;

        section.appendChild(demo);

        // Add toggle functionality
        const saveButton = demo.querySelector('.save-preferences');
        saveButton.addEventListener('click', () => {
            const analytics = demo.querySelector('.analytics-toggle').checked;
            const marketing = demo.querySelector('.marketing-toggle').checked;
            
            this.showNotification(`Preferences saved: Analytics: ${analytics ? 'Enabled' : 'Disabled'}, Marketing: ${marketing ? 'Enabled' : 'Disabled'}`, 'success');
        });
    }

    highlightGDPRSections() {
        const gdprKeywords = ['GDPR', 'General Data Protection Regulation', 'data protection', 'consent', 'data subject rights'];
        const content = document.querySelector('.legal-content');
        
        // Add GDPR badge to relevant sections
        const sections = content.querySelectorAll('.legal-section');
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            const hasGDPR = gdprKeywords.some(keyword => 
                text.includes(keyword.toLowerCase())
            );
            
            if (hasGDPR) {
                const badge = document.createElement('div');
                badge.className = 'gdpr-badge';
                badge.innerHTML = '<span>🇪🇺 GDPR</span>';
                badge.title = 'This section relates to GDPR compliance';
                
                const heading = section.querySelector('h2, h3');
                if (heading) {
                    heading.appendChild(badge);
                }
            }
        });
    }

    initTermsFeatures() {
        this.initAcceptanceTracking();
        this.initTermsVersioning();
        this.highlightImportantClauses();
    }

    initAcceptanceTracking() {
        // Add acceptance tracking for terms
        const acceptSection = document.querySelector('.terms-acceptance');
        if (!acceptSection) return;

        const trackingInfo = document.createElement('div');
        trackingInfo.className = 'acceptance-info';
                trackingInfo.innerHTML = `
            <div class="info-box">
                <h4>Terms Acceptance Tracking</h4>
                <p>When you use our services, we track your acceptance of these terms including:</p>
                <ul>
                    <li>Date and time of acceptance</li>
                    <li>Version of terms accepted</li>
                    <li>IP address (for verification)</li>
                    <li>User agent information</li>
                </ul>
                <div class="current-session">
                    <strong>Current Session:</strong><br>
                    <span class="session-info">
                        Viewed: ${new Date().toLocaleString()}<br>
                        Version: ${this.getTermsVersion()}<br>
                        IP: ${this.getUserIP()}
                    </span>
                </div>
            </div>
        `;

        acceptSection.appendChild(trackingInfo);
    }

    getTermsVersion() {
        // In production, this would come from your CMS
        return 'v2.1.0 (January 2024)';
    }

    getUserIP() {
        // In production, you'd get this from your backend
        return 'xxx.xxx.xxx.xxx (Hidden for privacy)';
    }

    initTermsVersioning() {
        // Add version history section
        const versionHistory = document.querySelector('.version-history');
        if (!versionHistory) return;

        const versions = [
            {
                version: 'v2.1.0',
                date: '2024-01-15',
                changes: ['Updated AI services terms', 'Clarified voice acting usage rights', 'Added digital design licensing']
            },
            {
                version: 'v2.0.0',
                date: '2023-12-01',
                changes: ['Major restructure for new services', 'Added GDPR compliance sections', 'Updated payment terms']
            },
            {
                version: 'v1.5.0',
                date: '2023-10-15',
                changes: ['Minor clarifications', 'Fixed typos', 'Updated contact information']
            }
        ];

        const historyHTML = versions.map(version => `
            <div class="version-item">
                <div class="version-header">
                    <h4>${version.version}</h4>
                    <span class="version-date">${new Date(version.date).toLocaleDateString()}</span>
                </div>
                <ul class="version-changes">
                    ${version.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        versionHistory.innerHTML = `
            <h3>Version History</h3>
            <div class="versions-list">
                ${historyHTML}
            </div>
            <button class="btn btn-secondary show-all-versions">Show All Versions</button>
        `;

        // Show all versions functionality
        const showAllBtn = versionHistory.querySelector('.show-all-versions');
        showAllBtn.addEventListener('click', () => {
            this.showAllVersions();
        });
    }

    showAllVersions() {
        // Create modal with complete version history
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content version-history-modal">
                <div class="modal-header">
                    <h3>Complete Version History</h3>
                    <button class="modal-close" aria-label="Close modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="complete-history">
                        <p>Complete version history with all changes and updates to our Terms of Service.</p>
                        <div class="history-timeline">
                            <!-- This would be populated with full history -->
                            <div class="timeline-item">
                                <div class="timeline-date">January 15, 2024</div>
                                <div class="timeline-content">
                                    <strong>v2.1.0 - Current</strong>
                                    <p>Latest version with AI services updates</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-date">December 1, 2023</div>
                                <div class="timeline-content">
                                    <strong>v2.0.0</strong>
                                    <p>Major restructure for expanded services</p>
                                </div>
                            </div>
                        </div>
                        <p class="archive-note">
                            <strong>Note:</strong> Archived versions are available upon request.
                            Contact us at <a href="mailto:Thanattsitt.info@yahoo.co.uk">Thanattsitt.info@yahoo.co.uk</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal functionality
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    highlightImportantClauses() {
        const importantKeywords = [
            'limitation of liability',
            'intellectual property',
            'termination',
            'payment terms',
            'refund policy',
            'dispute resolution',
            'governing law'
        ];

        const content = document.querySelector('.legal-content');
        const sections = content.querySelectorAll('.legal-section');

        sections.forEach(section => {
            const heading = section.querySelector('h2, h3');
            if (!heading) return;

            const headingText = heading.textContent.toLowerCase();
            const isImportant = importantKeywords.some(keyword => 
                headingText.includes(keyword)
            );

            if (isImportant) {
                const badge = document.createElement('div');
                badge.className = 'important-clause-badge';
                badge.innerHTML = '<span>⚠️ Important</span>';
                badge.title = 'This is an important clause - please read carefully';
                
                heading.appendChild(badge);
                section.classList.add('important-section');
            }
        });

        // Add importance legend
        this.addImportanceLegend();
    }

    addImportanceLegend() {
        const legend = document.createElement('div');
        legend.className = 'importance-legend';
        legend.innerHTML = `
            <div class="legend-content">
                <h4>Reading Guide</h4>
                <div class="legend-items">
                    <div class="legend-item">
                        <span class="badge important">⚠️ Important</span>
                        <span>Key clauses that significantly affect your rights</span>
                    </div>
                    <div class="legend-item">
                        <span class="badge gdpr">🇪🇺 GDPR</span>
                        <span>Sections related to data protection compliance</span>
                    </div>
                </div>
                <p class="legend-note">
                    We recommend reading all sections, but these markers help identify critical information.
                </p>
            </div>
        `;

        const toc = document.querySelector('.table-of-contents');
        if (toc) {
            toc.after(legend);
        }
    }

    initCookieFeatures() {
        this.initCookieInspector();
        this.initCookieSimulator();
        this.addCookieEducation();
    }

    initCookieInspector() {
        const inspector = document.createElement('div');
        inspector.className = 'cookie-inspector';
        inspector.innerHTML = `
            <div class="inspector-header">
                <h3>Cookie Inspector</h3>
                <p>See what cookies are currently set on your browser for this site:</p>
            </div>
            <div class="current-cookies">
                <div class="cookies-list"></div>
                <button class="btn btn-secondary refresh-cookies">Refresh Cookie List</button>
                <button class="btn btn-secondary clear-cookies">Clear All Cookies</button>
            </div>
        `;

        const cookieSection = document.querySelector('.cookie-types');
        if (cookieSection) {
            cookieSection.after(inspector);
        }

        this.displayCurrentCookies();

        // Event listeners
        inspector.querySelector('.refresh-cookies').addEventListener('click', () => {
            this.displayCurrentCookies();
        });

        inspector.querySelector('.clear-cookies').addEventListener('click', () => {
            this.clearAllCookies();
        });
    }

    displayCurrentCookies() {
        const cookiesList = document.querySelector('.cookies-list');
        const cookies = document.cookie.split(';').filter(cookie => cookie.trim() !== '');

        if (cookies.length === 0) {
            cookiesList.innerHTML = '<p class="no-cookies">No cookies found for this site.</p>';
            return;
        }

        const cookiesHTML = cookies.map(cookie => {
            const [name, value] = cookie.split('=').map(part => part.trim());
            const cookieType = this.identifyCookieType(name);
            
            return `
                <div class="cookie-item ${cookieType.class}">
                    <div class="cookie-header">
                        <strong>${name}</strong>
                        <span class="cookie-type-badge">${cookieType.label}</span>
                    </div>
                    <div class="cookie-value">
                        Value: <code>${value?.substring(0, 50)}${value?.length > 50 ? '...' : ''}</code>
                    </div>
                    <div class="cookie-purpose">${cookieType.purpose}</div>
                </div>
            `;
        }).join('');

        cookiesList.innerHTML = cookiesHTML;
    }

    identifyCookieType(cookieName) {
        const cookieTypes = {
            essential: {
                keywords: ['session', 'csrf', 'auth', 'security'],
                label: 'Essential',
                class: 'essential',
                purpose: 'Required for website functionality'
            },
            analytics: {
                keywords: ['ga', 'gtag', 'analytics', '_gid', '_gat'],
                label: 'Analytics',
                class: 'analytics',
                purpose: 'Used to understand how visitors use the website'
            },
            marketing: {
                keywords: ['ads', 'marketing', 'track', 'pixel'],
                label: 'Marketing',
                class: 'marketing',
                purpose: 'Used for advertising and marketing purposes'
            },
            preferences: {
                keywords: ['theme', 'lang', 'pref', 'settings'],
                label: 'Preferences',
                class: 'preferences',
                purpose: 'Stores your preferences and settings'
            }
        };

        for (const [type, config] of Object.entries(cookieTypes)) {
            if (config.keywords.some(keyword => 
                cookieName.toLowerCase().includes(keyword)
            )) {
                return config;
            }
        }

        return {
            label: 'Other',
            class: 'other',
            purpose: 'Purpose not automatically identified'
        };
    }

    clearAllCookies() {
        // Clear all cookies for this domain
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${location.hostname}`;
            }
        });

        this.showNotification('All cookies have been cleared. Some website functionality may be affected.', 'warning');
        this.displayCurrentCookies();
        
        // Track cookie clearing
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cookies_cleared', {
                'source': 'cookie_policy_page'
            });
        }
    }

    initCookieSimulator() {
        const simulator = document.createElement('div');
        simulator.className = 'cookie-simulator';
        simulator.innerHTML = `
            <div class="simulator-header">
                <h3>Cookie Consent Simulator</h3>
                <p>Experience how our cookie consent system works:</p>
            </div>
            <div class="simulator-content">
                <button class="btn btn-primary simulate-consent">Show Cookie Banner</button>
                <div class="simulator-result"></div>
            </div>
        `;

        const inspectorSection = document.querySelector('.cookie-inspector');
        if (inspectorSection) {
            inspectorSection.after(simulator);
        }

        simulator.querySelector('.simulate-consent').addEventListener('click', () => {
            this.showCookieConsentSimulator();
        });
    }

    showCookieConsentSimulator() {
        // Create a demo cookie banner
        const banner = document.createElement('div');
        banner.className = 'demo-cookie-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-text">
                    <h4>🍪 Cookie Consent Demo</h4>
                    <p>This website uses cookies to enhance your experience. Choose your preferences:</p>
                </div>
                <div class="banner-options">
                    <div class="cookie-categories">
                        <label class="cookie-category">
                            <input type="checkbox" checked disabled>
                            <span>Essential (Required)</span>
                        </label>
                        <label class="cookie-category">
                            <input type="checkbox" class="demo-analytics">
                            <span>Analytics</span>
                        </label>
                        <label class="cookie-category">
                            <input type="checkbox" class="demo-marketing">
                            <span>Marketing</span>
                        </label>
                    </div>
                    <div class="banner-actions">
                        <button class="btn btn-secondary reject-all">Reject All</button>
                        <button class="btn btn-primary accept-selected">Accept Selected</button>
                        <button class="btn btn-primary accept-all">Accept All</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add event listeners for demo
        banner.querySelector('.reject-all').addEventListener('click', () => {
            this.simulateCookieChoice('rejected', { essential: true, analytics: false, marketing: false });
            banner.remove();
        });

        banner.querySelector('.accept-all').addEventListener('click', () => {
            this.simulateCookieChoice('accepted_all', { essential: true, analytics: true, marketing: true });
            banner.remove();
        });

        banner.querySelector('.accept-selected').addEventListener('click', () => {
            const analytics = banner.querySelector('.demo-analytics').checked;
            const marketing = banner.querySelector('.demo-marketing').checked;
            this.simulateCookieChoice('custom', { essential: true, analytics, marketing });
            banner.remove();
        });

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 30000);
    }

    simulateCookieChoice(choice, preferences) {
        const resultDiv = document.querySelector('.simulator-result');
        
        const resultHTML = `
            <div class="simulation-result">
                <h4>Simulation Result: ${choice.replace('_', ' ').toUpperCase()}</h4>
                <div class="preferences-summary">
                    <div class="preference-item ${preferences.essential ? 'enabled' : 'disabled'}">
                        Essential: ${preferences.essential ? 'Enabled' : 'Disabled'}
                    </div>
                    <div class="preference-item ${preferences.analytics ? 'enabled' : 'disabled'}">
                        Analytics: ${preferences.analytics ? 'Enabled' : 'Disabled'}
                    </div>
                    <div class="preference-item ${preferences.marketing ? 'enabled' : 'disabled'}">
                        Marketing: ${preferences.marketing ? 'Enabled' : 'Disabled'}
                    </div>
                </div>
                <p class="result-note">
                    <strong>What this means:</strong> Based on your choices, we would ${preferences.analytics ? 'track' : 'not track'} 
                    your website usage for analytics and ${preferences.marketing ? 'show' : 'not show'} 
                    personalized marketing content.
                </p>
                <button class="btn btn-secondary reset-simulation">Reset Simulation</button>
            </div>
        `;

        resultDiv.innerHTML = resultHTML;

        resultDiv.querySelector('.reset-simulation').addEventListener('click', () => {
            resultDiv.innerHTML = '';
        });

        // Track the simulation
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cookie_simulation', {
                'choice': choice,
                'analytics_enabled': preferences.analytics,
                'marketing_enabled': preferences.marketing
            });
        }
    }

    addCookieEducation() {
        const education = document.createElement('div');
        education.className = 'cookie-education';
        education.innerHTML = `
            <div class="education-header">
                <h3>🎓 Cookie Education Center</h3>
                <p>Learn more about how cookies work and your rights:</p>
            </div>
            <div class="education-topics">
                <div class="education-topic" data-topic="what-are-cookies">
                    <h4>What are Cookies? 🍪</h4>
                    <p>Small text files stored by your browser...</p>
                </div>
                <div class="education-topic" data-topic="cookie-types">
                    <h4>Types of Cookies 📝</h4>
                    <p>Different categories and their purposes...</p>
                </div>
                <div class="education-topic" data-topic="your-rights">
                    <h4>Your Rights ⚖️</h4>
                    <p>What control you have over cookies...</p>
                </div>
                <div class="education-topic" data-topic="manage-cookies">
                    <h4>Managing Cookies 🔧</h4>
                    <p>How to control cookies in your browser...</p>
                </div>
            </div>
        `;

        const simulatorSection = document.querySelector('.cookie-simulator');
        if (simulatorSection) {
            simulatorSection.after(education);
        }

        // Add click handlers for education topics
        const topics = education.querySelectorAll('.education-topic');
        topics.forEach(topic => {
            topic.addEventListener('click', () => {
                const topicType = topic.getAttribute('data-topic');
                this.showEducationModal(topicType);
            });
        });
    }

    showEducationModal(topicType) {
        const educationContent = {
            'what-are-cookies': {
                title: 'What are Cookies?',
                content: `
                    <h4>🍪 Cookies Explained</h4>
                    <p>Cookies are small text files that websites store on your device when you visit them. They contain information about your visit and preferences.</p>
                    
                    <h5>How Cookies Work:</h5>
                    <ol>
                        <li>You visit a website</li>
                        <li>The website sends cookie data to your browser</li>
                        <li>Your browser stores the cookie</li>
                        <li>On future visits, your browser sends the cookie back</li>
                    </ol>
                    
                    <h5>Cookie Lifespan:</h5>
                    <ul>
                        <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                        <li><strong>Persistent cookies:</strong> Remain until they expire or you delete them</li>
                    </ul>
                `
            },
            'cookie-types': {
                title: 'Types of Cookies',
                content: `
                    <h4>📝 Cookie Categories</h4>
                    
                    <div class="cookie-type-explanation">
                        <h5>🔧 Essential Cookies</h5>
                        <p>Required for the website to function properly. These cannot be disabled.</p>
                        <em>Examples: Login sessions, shopping carts, security tokens</em>
                    </div>
                    
                    <div class="cookie-type-explanation">
                        <h5>📊 Analytics Cookies</h5>
                        <p>Help us understand how visitors use our website to improve user experience.</p>
                        <em>Examples: Google Analytics, page view tracking, user behavior analysis</em>
                    </div>
                    
                    <div class="cookie-type-explanation">
                        <h5>📢 Marketing Cookies</h5>
                        <p>Used to show relevant advertisements and track marketing campaigns.</p>
                        <em>Examples: Ad targeting, conversion tracking, social media pixels</em>
                    </div>
                    
                    <div class="cookie-type-explanation">
                        <h5>⚙️ Preference Cookies</h5>
                        <p>Remember your settings and preferences for a better experience.</p>
                        <em>Examples: Language settings, theme preferences, layout choices</em>
                    </div>
                `
            },
            'your-rights': {
                title: 'Your Cookie Rights',
                content: `
                    <h4>⚖️ Your Rights Under GDPR & CCPA</h4>
                    
                    <h5>🇪🇺 GDPR Rights (EU Users):</h5>
                    <ul>
                        <li><strong>Consent:</strong> We must ask permission for non-essential cookies</li>
                        <li><strong>Withdrawal:</strong> You can withdraw consent at any time</li>
                        <li><strong>Information:</strong> Right to know what data we collect and why</li>
                        <li><strong>Access:</strong> You can request a copy of your data</li>
                        <li><strong>Deletion:</strong> Right to request deletion of your data</li>
                    </ul>
                    
                    <h5>🇺🇸 CCPA Rights (California Users):</h5>
                    <ul>
                        <li><strong>Know:</strong> What personal information is collected</li>
                        <li><strong>Delete:</strong> Request deletion of personal information</li>
                        <li><strong>Opt-out:</strong> Opt out of the sale of personal information</li>
                        <li><strong>Non-discrimination:</strong> Equal service regardless of privacy choices</li>
                    </ul>
                    
                    <div class="rights-contact">
                        <h5>Exercise Your Rights:</h5>
                        <p>Contact us at <a href="mailto:Thanattsitt.info@yahoo.co.uk">Thanattsitt.info@yahoo.co.uk</a> to exercise any of these rights.</p>
                    </div>
                `
            },
            'manage-cookies': {
                title: 'Managing Cookies',
                content: `
                    <h4>🔧 How to Control Cookies</h4>
                    
                    <h5>Browser Settings:</h5>
                    <div class="browser-instructions">
                        <details>
                            <summary><strong>Google Chrome</strong></summary>
                            <ol>
                                <li>Click the three dots menu → Settings</li>
                                <li>Privacy and security → Cookies and other site data</li>
                                <li>Choose your cookie preferences</li>
                            </ol>
                        </details>
                        
                        <details>
                            <summary><strong>Firefox</strong></summary>
                            <ol>
                                <li>Menu → Settings → Privacy & Security</li>
                                <li>Find "Cookies and Site Data"</li>
                                <li>Adjust your preferences</li>
                            </ol>
                        </details>
                        
                        <details>
                            <summary><strong>Safari</strong></summary>
                            <ol>
                                <li>Safari menu → Preferences → Privacy</li>
                                <li>Choose how to handle cookies</li>
                                <li>Manage website data</li>
                            </ol>
                        </details>
                    </div>
                    
                    <h5>Our Cookie Manager:</h5>
                    <p>Use our cookie preference center to control which cookies we use on this site.</p>
                    <button class="btn btn-primary open-cookie-manager">Open Cookie Manager</button>
                    
                    <div class="warning-box">
                        <h5>⚠️ Important Note:</h5>
                        <p>Blocking certain cookies may affect website functionality and your user experience.</p>
                    </div>
                `
            }
        };

        const content = educationContent[topicType];
        if (!content) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay education-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${content.title}</h3>
                    <button class="modal-close" aria-label="Close modal">×</button>
                </div>
                <div class="modal-body">
                    ${content.content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal functionality
        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Cookie manager button in modal
        const cookieManagerBtn = modal.querySelector('.open-cookie-manager');
        if (cookieManagerBtn) {
            cookieManagerBtn.addEventListener('click', () => {
                closeModal();
                // This would open your actual cookie manager
                this.showNotification('Cookie manager would open here in the real implementation.', 'info');
            });
        }
    }

    // Cookie Manager Integration
    initializeCookieManager() {
        if (typeof CookieManager !== 'undefined') {
            this.cookieManager = new CookieManager();
        }

        // Add cookie manager trigger buttons
        const cookieButtons = document.querySelectorAll('.open-cookie-preferences');
        cookieButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.cookieManager) {
                    this.cookieManager.showPreferences();
                } else {
                    this.showNotification('Cookie manager is not available.', 'error');
                }
            });
        });
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type] || icons.info}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        });
    }

    bindEvents() {
        // Back to top functionality
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });

            backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Close modals on Escape
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal-overlay');
                modals.forEach(modal => modal.remove());
                document.body.style.overflow = '';
            }

            // Quick search focus
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('.legal-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });

        // Print shortcut
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.printLegalDocument();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LegalPageHandler();
});

// Export for external use
export default LegalPageHandler;
