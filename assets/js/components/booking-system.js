/*
========================================
BOOKING SYSTEM
========================================
Advanced calendar booking functionality
*/

import Utils from '../utils/helpers.js';

class BookingSystem {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableSlots = {};
        this.businessHours = {
            monday: { start: 9, end: 17 },
            tuesday: { start: 9, end: 17 },
            wednesday: { start: 9, end: 17 },
            thursday: { start: 9, end: 17 },
            friday: { start: 9, end: 17 },
            saturday: { start: 10, end: 16 },
            sunday: null // Closed
        };
        this.timeSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30'
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAvailability();
        this.generateCalendar();
    }

    bindEvents() {
        // Modal triggers
        Utils.on('[data-booking-trigger]', 'click', () => this.openBookingModal());
        Utils.on('#close-booking', 'click', () => this.closeBookingModal());
        
        // Calendar navigation
        Utils.on('#prev-month', 'click', () => this.prevMonth());
        Utils.on('#next-month', 'click', () => this.nextMonth());
        
        // Booking form
        Utils.on('#booking-details-form', 'submit', (e) => this.handleBookingSubmit(e));
        Utils.on('#booking-back', 'click', () => this.showTimeSlots());
        
        // Close modal on outside click
        Utils.on('#booking-modal', 'click', (e) => {
            if (e.target.id === 'booking-modal') {
                this.closeBookingModal();
            }
        });
        
        // Close on escape key
        Utils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeBookingModal();
            }
        });
    }

    openBookingModal() {
        const modal = Utils.$('#booking-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.resetBookingFlow();
            this.generateCalendar();
            
            // Focus trap
            const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length) {
                focusableElements[0].focus();
            }
        }
    }

    closeBookingModal() {
        const modal = Utils.$('#booking-modal');
        if (modal) {
            modal.style.display = 'none';
            this.resetBookingFlow();
        }
    }

    resetBookingFlow() {
        this.selectedDate = null;
        this.selectedTime = null;
        
        // Show calendar, hide other steps
        const calendar = Utils.$('.booking-calendar');
        const timeSlots = Utils.$('#time-slots');
        const bookingForm = Utils.$('#booking-form');
        
        if (calendar) calendar.style.display = 'block';
        if (timeSlots) timeSlots.style.display = 'none';
        if (bookingForm) bookingForm.style.display = 'none';
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.generateCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.generateCalendar();
    }

    generateCalendar() {
        const calendar = Utils.$('#calendar-grid');
        const title = Utils.$('#calendar-title');
        
        if (!calendar || !title) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update title
        title.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);
        
        // Clear calendar
        calendar.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day header';
            dayEl.textContent = day;
            calendar.appendChild(dayEl);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendar.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            dayEl.dataset.date = dateStr;
            
            // Check if day is available
            const isAvailable = this.isDayAvailable(date);
            const isPast = date < today;
            
            if (isPast) {
                dayEl.classList.add('unavailable');
            } else if (isAvailable) {
                dayEl.classList.add('available');
                Utils.on(dayEl, 'click', () => this.selectDate(date, dayEl));
            } else {
                dayEl.classList.add('unavailable');
            }
            
            calendar.appendChild(dayEl);
        }
    }

    isDayAvailable(date) {
        const dayName = date.toLocaleLowerCase('en-US', { weekday: 'long' });
        const businessDay = this.businessHours[dayName];
        
        // Check if business is open on this day
        if (!businessDay) return false;
        
        // Check if date has available slots
        const dateStr = this.formatDate(date);
        return this.hasAvailableSlots(dateStr);
    }

    hasAvailableSlots(dateStr) {
        // Simulate availability - in real implementation, check against booked appointments
        const slots = this.availableSlots[dateStr];
        return slots && slots.length > 0;
    }

    selectDate(date, dayEl) {
        // Remove previous selection
        const prevSelected = Utils.$('.calendar-day.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Select new date
        dayEl.classList.add('selected');
        this.selectedDate = date;
        
        // Show time slots
        this.showTimeSlots();
    }

    showTimeSlots() {
        if (!this.selectedDate) return;
        
        const calendar = Utils.$('.booking-calendar');
        const timeSlots = Utils.$('#time-slots');
        const container = Utils.$('#slots-container');
        
        if (!timeSlots || !container) return;
        
        // Hide calendar, show time slots
        if (calendar) calendar.style.display = 'none';
        timeSlots.style.display = 'block';
        
        // Generate time slots
        container.innerHTML = '';
        const dateStr = this.formatDate(this.selectedDate);
        const availableSlots = this.getAvailableSlotsForDate(dateStr);
        
        availableSlots.forEach(slot => {
            const slotEl = document.createElement('button');
            slotEl.className = 'time-slot';
            slotEl.textContent = this.formatTime(slot);
            slotEl.dataset.time = slot;
            
            Utils.on(slotEl, 'click', () => this.selectTime(slot, slotEl));
            container.appendChild(slotEl);
        });
        
        if (availableSlots.length === 0) {
            container.innerHTML = '<p class="no-slots">No available slots for this date. Please select another date.</p>';
        }
    }

    getAvailableSlotsForDate(dateStr) {
        // In real implementation, fetch from API
        // For demo, return mock available slots
        return this.timeSlots.filter(slot => {
            // Simulate some slots being booked
            const random = Math.random();
            return random > 0.3; // 70% chance slot is available
        });
    }

    selectTime(time, slotEl) {
        // Remove previous selection
        const prevSelected = Utils.$('.time-slot.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Select new time
        slotEl.classList.add('selected');
        this.selectedTime = time;
        
        // Show booking form
        this.showBookingForm();
    }

    showBookingForm() {
        const timeSlots = Utils.$('#time-slots');
        const bookingForm = Utils.$('#booking-form');
        const selectedDateEl = Utils.$('#selected-date');
        const selectedTimeEl = Utils.$('#selected-time');
        
        if (!bookingForm) return;
        
        // Hide time slots, show booking form
        if (timeSlots) timeSlots.style.display = 'none';
        bookingForm.style.display = 'block';
        
        // Update summary
        if (selectedDateEl && this.selectedDate) {
            selectedDateEl.textContent = this.selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        if (selectedTimeEl && this.selectedTime) {
            selectedTimeEl.textContent = this.formatTime(this.selectedTime);
        }
        
        // Focus first input
        const firstInput = Utils.$('input', bookingForm);
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Booking...';
        }
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const bookingData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                service: formData.get('service'),
                notes: formData.get('notes'),
                date: this.formatDate(this.selectedDate),
                time: this.selectedTime,
                duration: 30,
                type: 'consultation',
                timestamp: new Date().toISOString()
            };
            
            // Validate required fields
            if (!bookingData.name || !bookingData.email || !bookingData.service) {
                throw new Error('Please fill in all required fields');
            }
            
            // Submit booking
            await this.submitBooking(bookingData);
            
            // Show success and close modal
            this.showBookingSuccess();
            
        } catch (error) {
            Utils.error('Booking error:', error);
            this.showBookingError(error.message);
        } finally {
            // Reset loading state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm Booking';
            }
        }
    }

    async submitBooking(data) {
        // Simulate API call - replace with your actual endpoint
        const response = await fetch('/api/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to book appointment');
        }
        
        return await response.json();
    }

    showBookingSuccess() {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'booking-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">✅</div>
                <div class="notification-message">
                    <h4>Booking Confirmed!</h4>
                    <p>Your consultation has been scheduled. You'll receive a confirmation email shortly.</p>
                </div>
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
        
        // Close modal
        this.closeBookingModal();
        
        // Track booking event
        this.trackBooking();
    }

    showBookingError(message) {
        // Show error in form
        const form = Utils.$('#booking-form');
        if (form) {
            // Remove existing errors
            const existingError = form.querySelector('.booking-error');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error
            const errorEl = document.createElement('div');
            errorEl.className = 'booking-error';
            errorEl.innerHTML = `
                <div class="error-content">
                    <span class="error-icon">❌</span>
                    <span class="error-text">${message}</span>
                </div>
            `;
            
            form.insertBefore(errorEl, form.firstChild);
        }
    }

    loadAvailability() {
        // In real implementation, load from API
        // For demo, generate mock availability
        const today = new Date();
        for (let i = 1; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dateStr = this.formatDate(date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            
            // Skip if business is closed
            if (!this.businessHours[dayName]) {
                this.availableSlots[dateStr] = [];
                continue;
            }
            
            // Generate available slots
            this.availableSlots[dateStr] = this.timeSlots.filter(() => Math.random() > 0.3);
        }
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatTime(timeStr) {
        // Convert 24h to 12h format
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        
        return `${hour12}:${minutes} ${ampm}`;
    }

    trackBooking() {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'booking_completed', {
                event_category: 'Booking',
                event_label: 'Consultation',
                value: 1
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Schedule', {
                content_name: 'Free Consultation',
                content_category: 'Booking'
            });
        }
    }
}

// Initialize when DOM is loaded
Utils.onReady(() => {
    new BookingSystem();
});

export default BookingSystem;
