/*
========================================
BUSINESS STATUS TRACKER
========================================
Real-time business hours and availability status
*/

import Utils from '../utils/helpers.js';

class BusinessStatus {
    constructor() {
        this.timezone = 'America/New_York'; // EST timezone
        this.businessHours = {
            monday: { start: 9, end: 18 },
            tuesday: { start: 9, end: 18 },
            wednesday: { start: 9, end: 18 },
            thursday: { start: 9, end: 18 },
            friday: { start: 9, end: 18 },
            saturday: { start: 10, end: 16 },
            sunday: null // Closed
        };
        
        this.init();
    }

    init() {
        this.updateStatus();
        
        // Update status every minute
        setInterval(() => {
            this.updateStatus();
        }, 60000);
    }

    updateStatus() {
        const now = new Date();
        const currentStatus = this.getCurrentStatus(now);
        
        this.updateStatusIndicator(currentStatus);
        this.updateNextAvailable(currentStatus, now);
    }

    getCurrentStatus(date) {
        const dayName = date.toLocaleDateString('en-US', { 
            weekday: 'long',
            timeZone: this.timezone 
        }).toLowerCase();
        
        const businessDay = this.businessHours[dayName];
        
        if (!businessDay) {
            return {
                status: 'closed',
                message: 'Closed Today',
                nextOpen: this.getNextOpenTime(date)
            };
        }
        
        const currentHour = parseInt(date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            hour12: false,
            timeZone: this.timezone
        }));
        
        if (currentHour >= businessDay.start && currentHour < businessDay.end) {
            return {
                status: 'open',
                message: 'Currently Available',
                closesAt: this.formatTime(businessDay.end, 0)
            };
        } else {
            return {
                status: 'closed',
                message: 'Currently Closed',
                nextOpen: this.getNextOpenTime(date)
            };
        }
    }

    getNextOpenTime(date) {
        let nextDate = new Date(date);
        
        // Look for next open day within the next week
        for (let i = 0; i < 7; i++) {
            if (i > 0) {
                nextDate.setDate(nextDate.getDate() + 1);
            }
            
            const dayName = nextDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                timeZone: this.timezone 
            }).toLowerCase();
            
            const businessDay = this.businessHours[dayName];
            
            if (businessDay) {
                const openTime = new Date(nextDate);
                openTime.setHours(businessDay.start, 0, 0, 0);
                
                // If it's today, check if we're still before opening time
                if (i === 0) {
                    const now = new Date();
                    if (now < openTime) {
                        return this.formatNextOpen(openTime);
                    }
                } else {
                    return this.formatNextOpen(openTime);
                }
            }
        }
        
        return 'Contact for availability';
    }

    formatNextOpen(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return `Today at ${this.formatTime(date.getHours(), date.getMinutes())}`;
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow at ${this.formatTime(date.getHours(), date.getMinutes())}`;
        } else {
            return `${date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            })} at ${this.formatTime(date.getHours(), date.getMinutes())}`;
        }
    }

    formatTime(hours, minutes = 0) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        const minuteStr = minutes.toString().padStart(2, '0');
        
        return `${hour12}:${minuteStr} ${ampm}`;
    }

    updateStatusIndicator(statusInfo) {
        const indicator = Utils.$('#status-indicator');
        const dot = Utils.$('.status-dot', indicator);
        const text = Utils.$('#status-text');
        
        if (!indicator || !dot || !text) return;
        
        // Update dot color and animation
        dot.className = 'status-dot';
        if (statusInfo.status === 'open') {
            dot.classList.add('online');
            dot.style.background = 'var(--success-color)';
        } else {
            dot.classList.add('offline');
            dot.style.background = 'var(--error-color)';
        }
        
        // Update status text
        text.textContent = statusInfo.message;
        
        // Add additional info if available
        let additionalInfo = '';
        if (statusInfo.status === 'open' && statusInfo.closesAt) {
            additionalInfo = ` • Closes at ${statusInfo.closesAt}`;
        } else if (statusInfo.status === 'closed' && statusInfo.nextOpen) {
            additionalInfo = ` • Next available: ${statusInfo.nextOpen}`;
        }
        
        if (additionalInfo) {
            const infoSpan = document.createElement('span');
            infoSpan.className = 'status-additional';
            infoSpan.textContent = additionalInfo;
            text.appendChild(infoSpan);
        }
    }

    updateNextAvailable(statusInfo, date) {
        // Update the quick contact card's next available time
        const availabilitySpan = Utils.$('.contact-card.featured .availability');
        if (availabilitySpan && statusInfo.nextOpen) {
            availabilitySpan.textContent = `Next available: ${statusInfo.nextOpen}`;
        }
    }
}

// Initialize when DOM is loaded
Utils.onReady(() => {
    new BusinessStatus();
});

export default BusinessStatus;
