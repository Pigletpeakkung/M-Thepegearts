/*
========================================
EMAIL TEMPLATES
========================================
Dynamic email template generation with real contact data
*/

class EmailTemplates {
    constructor() {
        this.contactInfo = {
            name: 'THANATTSITT SANTISAMRANWILAI',
            email: 'Thanattsitt.info@yahoo.co.uk',
            website: 'https://thanattsitt.com',
            linkedin: 'https://www.linkedin.com/in/thanattsitt-s',
            github: 'https://github.com/Pigletpeakkung',
            threads: 'https://www.threads.net/@thanattsitt.s',
            linktree: 'https://linktr.ee/ThanttEzekiel',
            paypal: 'https://Paypal.me/@thanattsittS',
            buymeacoffee: 'https://buymeacoffee.com/thanattsitts',
            phone: '+66 (0) 123-456-789' // Update with real number if desired
        };
        
        this.templates = {
            contactForm: this.contactFormTemplate,
            bookingConfirmation: this.bookingConfirmationTemplate,
            autoReply: this.autoReplyTemplate
        };
    }

    contactFormTemplate(data) {
        return {
            subject: `🎯 New Contact Form Submission from ${data.firstName} ${data.lastName}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Contact Form Submission</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
                        .container { max-width: 650px; margin: 0 auto; background: #ffffff; }
                        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px 20px; text-align: center; }
                        .logo { font-size: 1.8em; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px; }
                        .content { background: #f8fafc; padding: 35px 30px; }
                        .field { margin-bottom: 25px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .label { font-weight: bold; color: #4338ca; font-size: 16px; display: flex; align-items: center; margin-bottom: 8px; }
                        .value { margin-top: 8px; line-height: 1.6; }
                        .services { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
                        .service-tag { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); color: #4338ca; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; }
                        .footer { background: #1e293b; color: #cbd5e1; padding: 25px; text-align: center; }
                        .priority { background: linear-gradient(135deg, #fee2e2, #fecaca); border-left: 5px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; }
                        .project-description { background: white; padding: 20px; border-radius: 8px; white-space: pre-wrap; border-left: 4px solid #6366f1; }
                        .contact-actions { background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
                        .action-button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">THANATTSITT</div>
                            <h1>🎯 New Contact Form Submission</h1>
                            <p>A new potential client has reached out!</p>
                        </div>
                        
                        <div class="content">
                            ${data.serviceType === 'urgent-project' ? '<div class="priority">⚡ <strong>PRIORITY REQUEST</strong> - Urgent project inquiry requiring immediate attention!</div>' : ''}
                            
                            <div class="field">
                                <div class="label">👤 Contact Information</div>
                                <div class="value">
                                    <strong style="font-size: 18px;">${data.firstName} ${data.lastName}</strong><br>
                                    📧 <a href="mailto:${data.email}" style="color: #6366f1;">${data.email}</a><br>
                                    ${data.phone ? `📞 <a href="tel:${data.phone}" style="color: #6366f1;">${data.phone}</a><br>` : ''}
                                    ${data.company ? `🏢 <strong>${data.company}</strong><br>` : ''}
                                </div>
                            </div>

                            <div class="field">
                                <div class="label">🛠️ Services Requested</div>
                                <div class="value">
                                    <div class="services">
                                        <span class="service-tag">${this.formatServiceType(data.serviceType)}</span>
                                        ${data.additionalServices ? data.additionalServices.map(service => 
                                            `<span class="service-tag">${service}</span>`
                                        ).join('') : ''}
                                    </div>
                                </div>
                            </div>

                            <div class="field">
                                <div class="label">📝 Project Description</div>
                                <div class="project-description">${data.projectDescription}</div>
                            </div>

                            ${data.budget ? `
                            <div class="field">
                                <div class="label">💰 Budget Range</div>
                                <div class="value" style="font-size: 16px; font-weight: 600; color: #059669;">${data.budget}</div>
                            </div>
                            ` : ''}

                            ${data.timeline ? `
                            <div class="field">
                                <div class="label">⏰ Timeline</div>
                                <div class="value" style="font-size: 16px; font-weight: 600; color: #dc2626;">${data.timeline}</div>
                            </div>
                            ` : ''}

                            <div class="contact-actions">
                                <h3 style="margin-top: 0; color: #1e293b;">Quick Actions</h3>
                                <a href="mailto:${data.email}?subject=Re: ${this.formatServiceType(data.serviceType)} Inquiry&body=Hi ${data.firstName},%0A%0AThank you for reaching out about ${this.formatServiceType(data.serviceType)}..." class="action-button">
                                    📧 Reply to ${data.firstName}
                                </a>
                                ${data.phone ? `<a href="tel:${data.phone}" class="action-button">📞 Call Now</a>` : ''}
                                <a href="${this.contactInfo.linkedin}" class="action-button">💼 View LinkedIn</a>
                            </div>

                            <div class="field">
                                <div class="label">📊 Submission Details</div>
                                <div class="value">
                                    📅 <strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString('en-US', { 
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZoneName: 'short'
                                    })}<br>
                                    🌐 <strong>From:</strong> ${data.currentUrl}<br>
                                    ${data.referrer ? `↩️ <strong>Referrer:</strong> ${data.referrer}<br>` : ''}
                                    🖥️ <strong>Browser:</strong> ${this.getBrowserInfo(data.userAgent)}
                                </div>
                            </div>
                        </div>

                        <div class="footer">
                            <p><strong>Response Recommendation:</strong> ${this.getResponseRecommendation(data.serviceType, data.budget)}</p>
                            <p>This email was automatically generated from your portfolio contact form.</p>
                            <p><strong>Next Steps:</strong> Respond within 2 business hours for best conversion rates!</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
🎯 NEW CONTACT FORM SUBMISSION

Contact Details:
${data.firstName} ${data.lastName}
📧 ${data.email}
${data.phone ? `📞 ${data.phone}` : ''}
${data.company ? `🏢 ${data.company}` : ''}

Service Requested: ${this.formatServiceType(data.serviceType)}
${data.additionalServices ? `Additional Services: ${data.additionalServices.join(', ')}` : ''}

Project Description:
${data.projectDescription}

${data.budget ? `Budget: ${data.budget}` : ''}
${data.timeline ? `Timeline: ${data.timeline}` : ''}

Submission Details:
📅 ${new Date(data.timestamp).toLocaleString()}
🌐 ${data.currentUrl}
${data.referrer ? `↩️ Referrer: ${data.referrer}` : ''}

Quick Reply: mailto:${data.email}
${data.phone ? `Quick Call: tel:${data.phone}` : ''}
            `
        };
    }

    autoReplyTemplate(data) {
        return {
            subject: `Thank you ${data.firstName}! Your message has been received 🎯`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thank You - Thanattsitt</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
                        .container { max-width: 650px; margin: 0 auto; background: #ffffff; }
                        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899); color: white; padding: 40px 20px; text-align: center; }
                        .logo { font-size: 2.2em; font-weight: bold; margin-bottom: 10px; letter-spacing: 2px; }
                        .tagline { font-size: 1.1em; opacity: 0.9; }
                        .content { padding: 40px 30px; background: white; }
                        .highlight-box { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-left: 5px solid #0ea5e9; padding: 25px; margin: 25px 0; border-radius: 12px; }
                        .next-steps { background: #f8fafc; padding: 30px; border-radius: 15px; margin: 25px 0; }
                        .step { display: flex; align-items: flex-start; margin-bottom: 20px; }
                        .step-number { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; font-size: 16px; }
                        .social-links { text-align: center; margin: 35px 0; background: #f1f5f9; padding: 25px; border-radius: 15px; }
                        .social-link { display: inline-block; margin: 8px; padding: 12px; background: white; border-radius: 10px; text-decoration: none; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .social-link:hover { transform: translateY(-2px); }
                        .footer { background: #1e293b; color: #cbd5e1; padding: 30px; text-align: center; }
                        .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 20px 10px; transition: transform 0.2s; }
                        .cta-button:hover { transform: translateY(-2px); }
                        .service-highlight { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px; border-radius: 10px; margin: 15px 0; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">THANATTSITT</div>
                            <div class="tagline">AI Specialist • Voice Actor • Digital Designer</div>
                            <h1>✨ Thank You for Getting in Touch!</h1>
                            <p>Your message has been received and I'm excited to learn about your project.</p>
                        </div>
                        
                        <div class="content">
                            <p style="font-size: 18px;">Hi ${data.firstName},</p>
                            
                            <p>Thank you for reaching out! I've received your inquiry about <strong>${this.formatServiceType(data.serviceType)}</strong> and I'm already excited about the possibilities we can explore together.</p>
                            
                            <div class="highlight-box">
                                <h3>📧 Your Inquiry Summary</h3>
                                <div class="service-highlight">
                                    <strong>Service:</strong> ${this.formatServiceType(data.serviceType)}
                                </div>
                                <p><strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                                <p><strong>Contact:</strong> ${data.email}</p>
                                <p><strong>Reference ID:</strong> #${Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                            </div>

                            <div class="next-steps">
                                <h3>🚀 What Happens Next?</h3>
                                
                                <div class="step">
                                    <div class="step-number">1</div>
                                    <div>
                                        <strong>Initial Review (Within 2 hours)</strong><br>
                                        I'll carefully review your project details and requirements to understand your vision.
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">2</div>
                                    <div>
                                        <strong>Personal Response (Within 24 hours)</strong><br>
                                        You'll receive a detailed response with initial thoughts, questions, and recommended next steps.
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">3</div>
                                    <div>
                                        <strong>Discovery Consultation (If needed)</strong><br>
                                        We'll schedule a free consultation call to dive deeper into your goals and create a tailored solution.
                                    </div>
                                </div>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${this.contactInfo.linktree}" class="cta-button">
                                    📅 Schedule Free Consultation
                                </a>
                                <a href="${this.contactInfo.website}/portfolio" class="cta-button">
                                    👀 View My Portfolio
                                </a>
                            </div>

                            <h3>💡 While You Wait...</h3>
                            <ul style="font-size: 16px; line-height: 1.8;">
                                <li><strong>Explore my work:</strong> <a href="${this.contactInfo.website}/portfolio" style="color: #6366f1;">Recent Projects & Case Studies</a></li>
                                <li><strong>Connect professionally:</strong> <a href="${this.contactInfo.linkedin}" style="color: #6366f1;">LinkedIn Profile</a></li>
                                <li><strong>Check out my code:</strong> <a href="${this.contactInfo.github}" style="color: #6366f1;">GitHub Repository</a></li>
                                <li><strong>Support my work:</strong> <a href="${this.contactInfo.buymeacoffee}" style="color: #6366f1;">Buy me a coffee ☕</a></li>
                            </ul>

                            <div class="social-links">
                                <h3 style="color: #1e293b; margin-bottom: 20px;">Connect with me</h3>
                                <a href="${this.contactInfo.linkedin}" class="social-link" title="LinkedIn">💼 LinkedIn</a>
                                <a href="${this.contactInfo.github}" class="social-link" title="GitHub">💻 GitHub</a>
                                <a href="${this.contactInfo.threads}" class="social-link" title="Threads">🧵 Threads</a>
                                <a href="${this.contactInfo.linktree}" class="social-link" title="All Links">🔗 Linktree</a>
                                <a href="${this.contactInfo.paypal}" class="social-link" title="PayPal">💳 PayPal</a>
                            </div>

                            <div style="background: #fef7ff; border-left: 4px solid #c084fc; padding: 20px; margin: 25px 0; border-radius: 8px;">
                                <p><strong>Questions or urgent matters?</strong> Feel free to reply directly to this email or reach out via:</p>
                                <p>
                                    📧 <a href="mailto:${this.contactInfo.email}" style="color: #6366f1;">${this.contactInfo.email}</a><br>
                                    💼 <a href="${this.contactInfo.linkedin}" style="color: #6366f1;">LinkedIn Messages</a><br>
                                    🧵 <a href="${this.contactInfo.threads}" style="color: #6366f1;">Threads</a>
                                </p>
                            </div>

                            <p style="font-size: 16px;">I'm genuinely excited about the possibility of working together and bringing your vision to life!</p>
                            
                            <p>Best regards,<br>
                            <strong style="font-size: 18px;">Thanattsitt Santisamranwilai</strong><br>
                            <em>AI Specialist • Voice Actor • Digital Designer</em></p>
                        </div>

                        <div class="footer">
                            <p>This email was sent to ${data.email} in response to your inquiry on ${new Date().toLocaleDateString()}.</p>
                            <p><strong>Thanattsitt Santisamranwilai</strong> | AI Specialist & Digital Creator</p>
                            <p><a href="mailto:${this.contactInfo.email}" style="color: #cbd5e1;">${this.contactInfo.email}</a></p>
                            <p>
                                <a href="${this.contactInfo.linkedin}" style="color: #cbd5e1; margin: 0 10px;">LinkedIn</a> |
                                <a href="${this.contactInfo.github}" style="color: #cbd5e1; margin: 0 10px;">GitHub</a> |
                                <a href="${this.contactInfo.linktree}" style="color: #cbd5e1; margin: 0 10px;">Linktree</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Hi ${data.firstName},

Thank you for reaching out! I've received your inquiry about ${this.formatServiceType(data.serviceType)} and I'm excited about the possibilities.

What Happens Next?
1. Initial Review (Within 2 hours) - I'll review your project details
2. Personal Response (Within 24 hours) - You'll receive a detailed response  
3. Discovery Consultation (If needed) - We'll schedule a free call to discuss further

Your Inquiry Summary:
- Service: ${this.formatServiceType(data.serviceType)}
- Submitted: ${new Date(data.timestamp).toLocaleDateString()}
- Contact: ${data.email}
- Reference: #${Math.random().toString(36).substr(2, 8).toUpperCase()}

While You Wait:
- Portfolio: ${this.contactInfo.website}/portfolio
- LinkedIn: ${this.contactInfo.linkedin}
- GitHub: ${this.contactInfo.github}
- Support me: ${this.contactInfo.buymeacoffee}

Questions? Reply to this email or contact:
📧 ${this.contactInfo.email}
💼 ${this.contactInfo.linkedin}
🔗 ${this.contactInfo.linktree}

Looking forward to working together!

Best regards,
Thanattsitt Santisamranwilai
AI Specialist • Voice Actor • Digital Designer
            `
        };
    }

    bookingConfirmationTemplate(data) {
        return {
            subject: `✅ Consultation Confirmed - ${new Date(data.date).toLocaleDateString()} with Thanattsitt`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Consultation Confirmed</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
                        .container { max-width: 650px; margin: 0 auto; background: #ffffff; }
                        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px 20px; text-align: center; }
                        .logo { font-size: 2em; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
                        .content { padding: 40px 30px; background: white; }
                        .booking-details { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #10b981; padding: 30px; border-radius: 15px; margin: 25px 0; }
                        .detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 8px 0; border-bottom: 1px solid #d1fae5; }
                        .detail-row:last-child { border-bottom: none; }
                        .detail-label { font-weight: bold; color: #059669; }
                        .detail-value { font-weight: 600; color: #1e293b; text-align: right; }
                        .calendar-add { text-align: center; margin: 30px 0; }
                        .calendar-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 5px; }
                        .preparation { background: linear-gradient(135deg, #fefce8, #fef3c7); border-left: 5px solid #eab308; padding: 25px; margin: 25px 0; border-radius: 12px; }
                        .footer { background: #1e293b; color: #cbd5e1; padding: 30px; text-align: center; }
                        .meeting-link { background: #3b82f6; color: white; padding: 15px 25px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 0; }
                        .contact-options { display: flex; justify-content: center; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
                        .contact-button { background: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">THANATTSITT</div>
                            <h1>✅ Consultation Confirmed!</h1>
                            <p>Looking forward to our conversation about your project</p>
                        </div>
                        
                        <div class="content">
                            <p style="font-size: 18px;">Hi ${data.name},</p>
                            
                            <p>Excellent! Your consultation has been confirmed. I'm genuinely excited to discuss your project and explore how we can bring your vision to life together.</p>
                            
                            <div class="booking-details">
                                <h3 style="margin-top: 0; color: #059669;">📅 Meeting Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">📅 Date:</span>
                                    <span class="detail-value">${new Date(data.date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">🕐 Time:</span>
                                    <span class="detail-value">${data.time} ${data.timezone || '(Your local time)'}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">⏱️ Duration:</span>
                                    <span class="detail-value">${data.duration} minutes</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">🛠️ Service:</span>
                                    <span class="detail-value">${data.service}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">🆔 Meeting ID:</span>
                                    <span class="detail-value"><strong>#${data.bookingId || Math.random().toString(36).substr(2, 9).toUpperCase()}</strong></span>
                                </div>
                            </div>

                            <div class="calendar-add">
                                <a href="${this.generateCalendarLink(data)}" class="calendar-button">
                                    📅 Add to Google Calendar
                                </a>
                                <a href="${this.generateICSFile(data)}" class="calendar-button">
                                    📱 Download .ics file
                                </a>
                            </div>

                            <div style="background: #eff6ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
                                <h3 style="color: #1e40af; margin-top: 0;">🔗 Meeting Platform</h3>
                                <p>The consultation will be conducted via <strong>Google Meet / Zoom</strong></p>
                                <a href="#" class="meeting-link" id="meeting-link-placeholder">
                                    📹 Join Meeting (Link will be sent 1 hour before)
                                </a>
                                <p style="font-size: 14px; color: #64748b;">You'll receive the meeting link via email 1 hour before our scheduled time.</p>
                            </div>

                            <div class="preparation">
                                <h3 style="margin-top: 0;">🎯 How to Prepare for Maximum Value</h3>
                                <ul style="margin: 15px 0;">
                                    <li><strong>Define your goals:</strong> Have a clear vision of what you want to achieve</li>
                                    <li><strong>Gather references:</strong> Collect examples, inspirations, or existing materials</li>
                                    <li><strong>Budget & timeline:</strong> Come prepared with realistic expectations</li>
                                    <li><strong>Prepare questions:</strong> List any specific concerns or technical requirements</li>
                                    <li><strong>Technical setup:</strong> Ensure stable internet and working camera/microphone</li>
                                </ul>
                                <p style="margin-bottom: 0;"><strong>💡 Pro tip:</strong> The more prepared you are, the more valuable insights you'll get from our session!</p>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <h3>📞 Need to Make Changes?</h3>
                                <p>No problem! Contact me at least 4 hours in advance:</p>
                                <div class="contact-options">
                                    <a href="mailto:${this.contactInfo.email}?subject=Consultation Reschedule - ${data.bookingId}" class="contact-button">📧 Email</a>
                                    <a href="${this.contactInfo.linkedin}" class="contact-button">💼 LinkedIn</a>
                                    <a href="${this.contactInfo.threads}" class="contact-button">🧵 Threads</a>
                                </div>
                            </div>

                            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0;">
                                <h3 style="color: #1e293b; margin-top: 0;">🚀 What to Expect</h3>
                                <ul style="line-height: 1.8;">
                                    <li><strong>Project deep-dive:</strong> We'll explore your vision and requirements</li>
                                    <li><strong>Technical consultation:</strong> I'll provide expert insights and recommendations</li>
                                    <li><strong>Solution roadmap:</strong> Get a clear path forward for your project</li>
                                                                        <li><strong>Honest assessment:</strong> Realistic timeline, budget, and feasibility discussion</li>
                                    <li><strong>Next steps:</strong> Clear action items and follow-up plan</li>
                                </ul>
                            </div>

                            <p>I'm genuinely excited about our upcoming conversation and the potential to work together on your project!</p>
                            
                            <p>Best regards,<br>
                            <strong style="font-size: 18px;">Thanattsitt Santisamranwilai</strong><br>
                            <em>AI Specialist • Voice Actor • Digital Designer</em></p>
                            
                            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f1f5f9; border-radius: 12px;">
                                <p style="margin: 0;"><strong>Connect with me:</strong></p>
                                <p style="margin: 10px 0;">
                                    <a href="${this.contactInfo.linkedin}" style="color: #6366f1; margin: 0 10px;">LinkedIn</a> |
                                    <a href="${this.contactInfo.github}" style="color: #6366f1; margin: 0 10px;">GitHub</a> |
                                    <a href="${this.contactInfo.linktree}" style="color: #6366f1; margin: 0 10px;">All Links</a>
                                </p>
                            </div>
                        </div>

                        <div class="footer">
                            <p>This consultation was booked for ${data.email} on ${new Date().toLocaleDateString()}</p>
                            <p><strong>Thanattsitt Santisamranwilai</strong> | AI Specialist & Digital Creator</p>
                            <p><a href="mailto:${this.contactInfo.email}" style="color: #cbd5e1;">${this.contactInfo.email}</a></p>
                            <p>
                                <a href="${this.contactInfo.linkedin}" style="color: #cbd5e1; margin: 0 8px;">LinkedIn</a> |
                                <a href="${this.contactInfo.github}" style="color: #cbd5e1; margin: 0 8px;">GitHub</a> |
                                <a href="${this.contactInfo.threads}" style="color: #cbd5e1; margin: 0 8px;">Threads</a> |
                                <a href="${this.contactInfo.linktree}" style="color: #cbd5e1; margin: 0 8px;">Linktree</a>
                            </p>
                            <p style="font-size: 12px; margin-top: 20px;">
                                If you no longer wish to receive booking confirmations, you can 
                                <a href="https://thanattsitt.com/unsubscribe?email=${data.email}" style="color: #cbd5e1;">unsubscribe here</a>.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
✅ CONSULTATION CONFIRMED!

Hi ${data.name},

Your consultation with Thanattsitt Santisamranwilai has been confirmed!

📅 MEETING DETAILS:
Date: ${new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${data.time} ${data.timezone || '(Your local time)'}
Duration: ${data.duration} minutes
Service: ${data.service}
Meeting ID: #${data.bookingId || Math.random().toString(36).substr(2, 9).toUpperCase()}

🔗 MEETING PLATFORM:
The consultation will be via Google Meet/Zoom
Meeting link will be sent 1 hour before our scheduled time

📅 ADD TO CALENDAR:
Google Calendar: ${this.generateCalendarLink(data)}

🎯 HOW TO PREPARE:
- Define your goals and vision clearly
- Gather reference materials and examples
- Prepare budget and timeline expectations
- List specific questions or requirements
- Test your internet and audio/video setup

📞 NEED TO RESCHEDULE?
Contact me at least 4 hours in advance:
📧 ${this.contactInfo.email}
💼 ${this.contactInfo.linkedin}
🧵 ${this.contactInfo.threads}

🚀 WHAT TO EXPECT:
- Project deep-dive and requirements analysis
- Technical consultation and expert insights
- Solution roadmap and clear next steps
- Honest timeline and budget assessment

Looking forward to our conversation!

Best regards,
Thanattsitt Santisamranwilai
AI Specialist • Voice Actor • Digital Designer

📧 ${this.contactInfo.email}
💼 ${this.contactInfo.linkedin}
🔗 ${this.contactInfo.linktree}
            `
        };
    }

    // Helper method to format service types
    formatServiceType(serviceType) {
        const serviceMap = {
            'ai-consulting': 'AI Consulting & Strategy',
            'ai-implementation': 'AI Implementation & Development',
            'voice-acting': 'Professional Voice Acting',
            'digital-design': 'Digital Design & Branding',
            'brand-identity': 'Brand Identity Design',
            'website-design': 'Website Design & Development',
            'urgent-project': 'Urgent Project Request',
            'general-inquiry': 'General Inquiry',
            'consultation': 'Free Consultation',
            'portfolio-review': 'Portfolio Review'
        };
        
        return serviceMap[serviceType] || serviceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Generate Google Calendar link for booking confirmations
    generateCalendarLink(data) {
        const startDate = new Date(`${data.date} ${data.time}`);
        const endDate = new Date(startDate.getTime() + (parseInt(data.duration) * 60000)); // Add duration in milliseconds
        
        const formatDateForCalendar = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const details = encodeURIComponent(`
Consultation with Thanattsitt Santisamranwilai

Service: ${data.service}
Meeting ID: #${data.bookingId || 'TBD'}
Duration: ${data.duration} minutes

What to bring:
- Clear project goals and requirements
- Reference materials or examples
- Budget and timeline expectations
- List of questions

Contact:
📧 ${this.contactInfo.email}
💼 ${this.contactInfo.linkedin}
🔗 ${this.contactInfo.linktree}

Meeting link will be provided via email 1 hour before the consultation.
        `.trim());
        
        const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
        googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
        googleCalendarUrl.searchParams.set('text', `Consultation - ${data.service} | Thanattsitt`);
        googleCalendarUrl.searchParams.set('dates', `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`);
        googleCalendarUrl.searchParams.set('details', details);
        googleCalendarUrl.searchParams.set('location', 'Online Meeting (Link to be provided)');
        googleCalendarUrl.searchParams.set('add', data.email);

        return googleCalendarUrl.toString();
    }

    // Generate ICS file content for calendar import
    generateICSFile(data) {
        const startDate = new Date(`${data.date} ${data.time}`);
        const endDate = new Date(startDate.getTime() + (parseInt(data.duration) * 60000));
        
        const formatDateForICS = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Thanattsitt//Consultation Booking//EN
BEGIN:VEVENT
UID:${data.bookingId || Math.random().toString(36).substr(2, 9)}@thanattsitt.com
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
SUMMARY:Consultation - ${data.service} | Thanattsitt
DESCRIPTION:Consultation with Thanattsitt Santisamranwilai\\n\\nService: ${data.service}\\nMeeting ID: #${data.bookingId || 'TBD'}\\n\\nContact: ${this.contactInfo.email}\\nLinkedIn: ${this.contactInfo.linkedin}
LOCATION:Online Meeting (Link to be provided)
ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${data.email}
ORGANIZER;CN=Thanattsitt Santisamranwilai:mailto:${this.contactInfo.email}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        return URL.createObjectURL(blob);
    }

    // Extract browser info from user agent
    getBrowserInfo(userAgent) {
        if (!userAgent) return 'Unknown Browser';
        
        const browsers = [
            { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
            { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
            { name: 'Safari', regex: /Safari\/([0-9.]+)/ },
            { name: 'Edge', regex: /Edg\/([0-9.]+)/ },
            { name: 'Opera', regex: /OPR\/([0-9.]+)/ }
        ];

        const os = [
            { name: 'Windows', regex: /Windows NT ([0-9.]+)/ },
            { name: 'macOS', regex: /Mac OS X ([0-9_.]+)/ },
            { name: 'Linux', regex: /Linux/ },
            { name: 'Android', regex: /Android ([0-9.]+)/ },
            { name: 'iOS', regex: /OS ([0-9_]+)/ }
        ];

        let browserInfo = 'Unknown Browser';
        let osInfo = 'Unknown OS';

        for (const browser of browsers) {
            const match = userAgent.match(browser.regex);
            if (match) {
                browserInfo = `${browser.name} ${match[1]}`;
                break;
            }
        }

        for (const system of os) {
            const match = userAgent.match(system.regex);
            if (match) {
                osInfo = system.name;
                break;
            }
        }

        return `${browserInfo} on ${osInfo}`;
    }

    // Get response recommendation based on service type and budget
    getResponseRecommendation(serviceType, budget) {
        const recommendations = {
            'urgent-project': '🚨 URGENT: Respond within 1 hour for time-sensitive projects',
            'ai-consulting': '🤖 AI projects often require detailed technical discussion - schedule a call',
            'ai-implementation': '💻 Complex implementation - prepare technical proposal and timeline',
            'voice-acting': '🎙️ Voice projects benefit from audio samples - include portfolio links',
            'digital-design': '🎨 Design projects need visual references - ask for inspiration examples',
            'website-design': '🌐 Website projects - discuss hosting, CMS preferences, and content strategy'
        };

        let recommendation = recommendations[serviceType] || '💼 Professional project inquiry - respond with detailed proposal';

        if (budget) {
            const budgetValue = budget.toLowerCase();
            if (budgetValue.includes('$50,000') || budgetValue.includes('enterprise')) {
                recommendation += ' | 💰 HIGH-VALUE CLIENT - Priority response recommended';
            } else if (budgetValue.includes('urgent') || budgetValue.includes('asap')) {
                recommendation += ' | ⚡ TIME-SENSITIVE - Quick turnaround expected';
            }
        }

        return recommendation;
    }

    // Get template by name
    getTemplate(templateName, data) {
        if (this.templates[templateName]) {
            return this.templates[templateName].call(this, data);
        }
        throw new Error(`Template "${templateName}" not found`);
    }

    // Generate notification email for admin
    generateNotificationEmail(data, templateType) {
        const baseData = {
            ...data,
            timestamp: new Date().toISOString(),
            currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
            referrer: typeof document !== 'undefined' ? document.referrer : 'N/A',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
        };

        return this.getTemplate(templateType, baseData);
    }

    // Generate auto-reply email for user
    generateAutoReply(data) {
        return this.getTemplate('autoReply', data);
    }

    // Generate booking confirmation email
    generateBookingConfirmation(data) {
        return this.getTemplate('bookingConfirmation', data);
    }

    // Validate email data before template generation
    validateEmailData(data, requiredFields = []) {
        const errors = [];
        
        // Check required fields
        for (const field of requiredFields) {
            if (!data[field] || data[field].toString().trim() === '') {
                errors.push(`Missing required field: ${field}`);
            }
        }

        // Validate email format
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        // Validate phone if provided
        if (data.phone && !this.isValidPhone(data.phone)) {
            errors.push('Invalid phone number format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation helper
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        return phoneRegex.test(cleanPhone);
    }

    // Sanitize data for email templates
    sanitizeData(data) {
        const sanitized = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // Basic HTML sanitization for text content
                sanitized[key] = value
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }

    // Generate email preview for testing
    generatePreview(templateName, sampleData) {
        try {
            const template = this.getTemplate(templateName, sampleData);
            return {
                success: true,
                subject: template.subject,
                html: template.html,
                text: template.text
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get sample data for testing templates
    getSampleData(templateType) {
        const sampleData = {
            contactForm: {
                firstName: 'Alex',
                lastName: 'Chen',
                email: 'alex.chen@techstartup.com',
                phone: '+1 (555) 987-6543',
                company: 'InnovateAI Solutions',
                serviceType: 'ai-implementation',
                additionalServices: ['ai-consulting', 'team-training'],
                projectDescription: 'We need help implementing AI chatbot solutions for our customer service department. Looking for end-to-end consulting and development support with integration into our existing CRM system.',
                budget: '$25,000 - $50,000',
                timeline: '3-4 months',
                timestamp: new Date().toISOString(),
                currentUrl: 'https://thanattsitt.com/contact',
                referrer: 'https://linkedin.com/in/thanattsitt-s',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            bookingConfirmation: {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@creativeagency.com',
                date: '2024-02-20',
                time: '10:00 AM',
                duration: 60,
                timezone: 'EST',
                service: 'AI Strategy Consultation',
                bookingId: 'CONS240220001'
            },
            autoReply: {
                firstName: 'Michael',
                email: 'michael@digitalstudio.com',
                serviceType: 'digital-design',
                timestamp: new Date().toISOString()
            }
        };

        return sampleData[templateType] || {};
    }

    // Get contact information for external use
    getContactInfo() {
        return { ...this.contactInfo };
    }

    // Update contact information
    updateContactInfo(newInfo) {
        this.contactInfo = { ...this.contactInfo, ...newInfo };
    }
}

// Export for use in other modules
export default EmailTemplates;

// Usage examples and testing:
/*
const emailTemplates = new EmailTemplates();

// Generate contact form notification with real data
const contactData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    company: 'Tech Corp',
    serviceType: 'ai-consulting',
    projectDescription: 'Need AI implementation help for our customer service',
    budget: '$10,000 - $25,000',
    timeline: '2-3 months'
};

const notificationEmail = emailTemplates.generateNotificationEmail(contactData, 'contactForm');
const autoReplyEmail = emailTemplates.generateAutoReply(contactData);

// Generate booking confirmation with real data
const bookingData = {
    name: 'Jane Smith',
    email: 'jane@company.com',
    date: '2024-02-15',
    time: '2:00 PM',
    duration: 60,
    service: 'AI Strategy Consultation',
    bookingId: 'BOOK123456'
};

const confirmationEmail = emailTemplates.generateBookingConfirmation(bookingData);

// Validate data before sending
const validation = emailTemplates.validateEmailData(contactData, ['firstName', 'email', 'serviceType']);
if (!validation.isValid) {
    console.error('Validation errors:', validation.errors);
}

// Test with sample data
const sampleData = emailTemplates.getSampleData('contactForm');
const preview = emailTemplates.generatePreview('contactForm', sampleData);
console.log('Email preview:', preview);
*/

