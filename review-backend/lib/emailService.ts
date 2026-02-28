import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface SupportEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
  submittedAt: string;
  supportId: number;
}

interface EmailTemplate {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@review-it.com';
  private static adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@review-it.com';
  private static frontendUrl = process.env.FRONTEND_URL || 'https://riviewit.com';  // Changed default to production URL

  /**
   * Send email notification to admin when new support request is submitted
   */
  static async sendSupportNotification(supportData: SupportEmailData): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return false;
      }

      const emailTemplate = this.createSupportNotificationTemplate(supportData);
      
      await sgMail.send(emailTemplate);

      return true;
    } catch (error) {
      console.error('❌ Failed to send support notification email:', error);
      return false;
    }
  }

  /**
   * Send confirmation email to user who submitted support request
   */
  static async sendSupportConfirmation(supportData: SupportEmailData): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return false;
      }

      const emailTemplate = this.createSupportConfirmationTemplate(supportData);
      
      await sgMail.send(emailTemplate);

      return true;
    } catch (error) {
      console.error('❌ Failed to send support confirmation email:', error);
      return false;
    }
  }

  /**
   * Create admin notification email template
   */
  private static createSupportNotificationTemplate(data: SupportEmailData): EmailTemplate {
    const priorityColor = this.getPriorityColor(data.priority);
    const priorityBadge = this.getPriorityBadge(data.priority, priorityColor);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Support Request - Review-It</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
          .content { padding: 30px; }
          .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
          .info-item { background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
          .info-label { font-weight: 600; color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .info-value { color: #333; font-size: 14px; }
          .message-section { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745; }
          .message-label { font-weight: 600; color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }
          .message-content { color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
          .action-buttons { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 0 10px; transition: transform 0.2s; }
          .btn:hover { transform: translateY(-2px); }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .btn { display: block; margin: 10px 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Support Request</h1>
            <p>Review-It Admin Notification</p>
          </div>
          
          <div class="content">
            ${priorityBadge}
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Request ID</div>
                <div class="info-value">#${data.supportId}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Submitted</div>
                <div class="info-value">${new Date(data.submittedAt).toLocaleString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Customer Name</div>
                <div class="info-value">${data.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${data.email}</div>
              </div>
            </div>

            <div class="info-item" style="margin-bottom: 25px;">
              <div class="info-label">Subject</div>
              <div class="info-value" style="font-size: 16px; font-weight: 600;">${data.subject}</div>
            </div>

            <div class="message-section">
              <div class="message-label">Message</div>
              <div class="message-content">${data.message}</div>
            </div>

            <div class="action-buttons">
              <a href="http://localhost:3174/support" class="btn">📋 View in Admin Panel</a>
              <a href="mailto:${data.email}?subject=Re: ${data.subject}" class="btn">📧 Reply to Customer</a>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated notification from Review-It Support System</p>
            <p>Please do not reply to this email directly</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
New Support Request - Review-It

Request ID: #${data.supportId}
Priority: ${data.priority}
Customer: ${data.name} (${data.email})
Subject: ${data.subject}
Submitted: ${new Date(data.submittedAt).toLocaleString()}

Message:
${data.message}

View in Admin Panel: http://localhost:3174/support
Reply to Customer: ${data.email}
    `;

    return {
      to: this.adminEmail,
      from: this.fromEmail,
      subject: `🚨 New ${data.priority} Priority Support Request #${data.supportId}`,
      html,
      text
    };
  }

  /**
   * Create user confirmation email template
   */
  private static createSupportConfirmationTemplate(data: SupportEmailData): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Request Received - Review-It</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
          .content { padding: 30px; }
          .success-icon { text-align: center; font-size: 60px; margin-bottom: 20px; }
          .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .info-label { font-weight: 600; color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .info-value { color: #333; font-size: 14px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Request Received</h1>
            <p>Thank you for contacting Review-It Support</p>
          </div>
          
          <div class="content">
            <div class="success-icon">🎯</div>
            
            <p>Hi <strong>${data.name}</strong>,</p>
            
            <p>Thank you for reaching out to us! We have successfully received your support request and our team will review it shortly.</p>

            <div class="info-box">
              <div class="info-label">Request Details</div>
              <div class="info-value">
                <strong>Request ID:</strong> #${data.supportId}<br>
                <strong>Subject:</strong> ${data.subject}<br>
                <strong>Priority:</strong> ${data.priority}<br>
                <strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}
              </div>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our support team will review your request within 24 hours</li>
              <li>You'll receive an email response at <strong>${data.email}</strong></li>
              <li>For urgent matters, we'll prioritize your request accordingly</li>
            </ul>

            <p>If you need to add more information to your request, please reply to this email with your request ID <strong>#${data.supportId}</strong>.</p>

            <p>Best regards,<br>
            <strong>Review-It Support Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated confirmation from Review-It Support System</p>
            <p>If you didn't submit this request, please contact us immediately</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Support Request Received - Review-It

Hi ${data.name},

Thank you for reaching out to us! We have successfully received your support request.

Request Details:
- Request ID: #${data.supportId}
- Subject: ${data.subject}
- Priority: ${data.priority}
- Submitted: ${new Date(data.submittedAt).toLocaleString()}

Our support team will review your request within 24 hours and respond to ${data.email}.

Best regards,
Review-It Support Team
    `;

    return {
      to: data.email,
      from: this.fromEmail,
      subject: `✅ Support Request #${data.supportId} Received - Review-It`,
      html,
      text
    };
  }

  /**
   * Get priority color for styling
   */
  private static getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  /**
   * Get priority badge HTML
   */
  private static getPriorityBadge(priority: string, color: string): string {
    const icon = priority.toLowerCase() === 'high' ? '🔥' : 
                 priority.toLowerCase() === 'medium' ? '⚡' : '📝';
    
    return `<div class="priority-badge" style="background-color: ${color}; color: white;">${icon} ${priority} Priority</div>`;
  }

  /**
   * Send password reset email to user
   */
  static async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return false;
      }

      const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Review-It</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 30px; }
            .security-icon { text-align: center; font-size: 60px; margin-bottom: 20px; }
            .info-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .warning-text { color: #856404; font-size: 14px; }
            .reset-button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
            .reset-button:hover { transform: translateY(-2px); }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .security-tips { background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
            @media (max-width: 600px) { .reset-button { display: block; text-align: center; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
              <p>Review-It Account Security</p>
            </div>
            
            <div class="content">
              <div class="security-icon">🛡️</div>
              
              <p>Hi <strong>${userName}</strong>,</p>
              
              <p>We received a request to reset the password for your Review-It account associated with <strong>${userEmail}</strong>.</p>

              <div class="info-box">
                <div class="warning-text">
                  <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour for your security.
                </div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="reset-button">🔑 Reset My Password</a>
              </div>

              <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px;">${resetUrl}</p>

              <div class="security-tips">
                <h3>🔒 Security Tips:</h3>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>You can only use this link once</li>
                  <li>Choose a strong, unique password</li>
                  <li>Don't share this link with anyone</li>
                </ul>
              </div>

              <p><strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

              <p>Best regards,<br>
              <strong>Review-It Security Team</strong></p>
            </div>

            <div class="footer">
              <p>This is an automated security email from Review-It</p>
              <p>Please do not reply to this email directly</p>
              <p>If you need help, contact our support team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Password Reset - Review-It

Hi ${userName},

We received a request to reset the password for your Review-It account (${userEmail}).

To reset your password, click the link below or copy it into your browser:
${resetUrl}

This link will expire in 1 hour for your security.

If you didn't request this password reset, you can safely ignore this email.

Best regards,
Review-It Security Team
      `;

      const emailTemplate: EmailTemplate = {
        to: userEmail,
        from: this.fromEmail,
        subject: '🔐 Password Reset Request - Review-It',
        html,
        text
      };

      await sgMail.send(emailTemplate);

      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  /**
   * Send status update email to user
   */
  static async sendStatusUpdateEmail(
    userEmail: string, 
    userName: string, 
    supportId: number, 
    subject: string, 
    newStatus: string, 
    adminReply?: string
  ): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return false;
      }

      const statusColor = newStatus === 'Resolved' ? '#28a745' : 
                         newStatus === 'In Progress' ? '#007bff' : '#6c757d';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Request Update - Review-It</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; color: white; margin-bottom: 20px; }
            .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
            .reply-section { background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Support Request Update</h1>
              <p>Review-It Support Team</p>
            </div>
            
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              
              <p>We have an update on your support request:</p>

              <div class="info-box">
                <strong>Request ID:</strong> #${supportId}<br>
                <strong>Subject:</strong> ${subject}<br>
                <strong>New Status:</strong> <span class="status-badge" style="background-color: ${statusColor};">${newStatus}</span>
              </div>

              ${adminReply ? `
                <div class="reply-section">
                  <h3>💬 Message from Support Team:</h3>
                  <p style="white-space: pre-wrap;">${adminReply}</p>
                </div>
              ` : ''}

              <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>

              <p>Best regards,<br>
              <strong>Review-It Support Team</strong></p>
            </div>

            <div class="footer">
              <p>This is an automated update from Review-It Support System</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailTemplate: EmailTemplate = {
        to: userEmail,
        from: this.fromEmail,
        subject: `📋 Support Request #${supportId} Update - ${newStatus}`,
        html
      };

      await sgMail.send(emailTemplate);

      return true;
    } catch (error) {
      console.error('❌ Failed to send status update email:', error);
      return false;
    }
  }

  /**
   * Send email verification email to new users
   */
  static async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SendGrid API key not configured');
        return false;
      }

      const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;
      
      const emailTemplate = this.createVerificationEmailTemplate(email, name, verificationUrl);
      
      await sgMail.send(emailTemplate);
      return true;
    } catch (error: any) {
      console.error('Failed to send verification email:', error?.response?.body || error.message);
      return false;
    }
  }

  /**
   * Create email verification template
   */
  private static createVerificationEmailTemplate(email: string, name: string, verificationUrl: string): EmailTemplate {
    // Public favicon URL for production email hosting
    // Replace with your actual CDN/hosting URL when deploying to production
    const publicFaviconUrl = process.env.PUBLIC_FAVICON_URL || 'https://your-cdn-domain.com/assets/star_logo.png';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Riviewit</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
          }
          .content {
            margin: 30px 0;
          }
          .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .verify-button:hover {
            transform: translateY(-1px);
          }
          .security-note {
            background: #f3f4f6;
            border-left: 4px solid #6366f1;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .link {
            color: #6366f1;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="${publicFaviconUrl}" alt="Riviewit Logo" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 8px;">
              Riviewit
            </div>
            <h1 class="title">Verify Your Email Address</h1>
            <p class="subtitle">Welcome to <img src="${publicFaviconUrl}" alt="Riviewit Logo" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 4px;">Riviewit! Let's get your account verified.</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>Thank you for signing up for <img src="${publicFaviconUrl}" alt="Riviewit Logo" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;">Riviewit! To complete your registration and start using all our features, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
            </div>
            
            <div class="security-note">
              <strong>🔒 Security Note:</strong>
              <p style="margin: 5px 0 0 0;">This verification link will expire in 24 hours for your security. If you didn't create an account with <img src="${publicFaviconUrl}" alt="Riviewit Logo" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;">Riviewit, please ignore this email.</p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p class="link">${verificationUrl}</p>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>✅ Create and manage reviews</li>
              <li>✅ Access your personalized dashboard</li>
              <li>✅ Connect with other reviewers</li>
              <li>✅ Receive email notifications</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The <img src="${publicFaviconUrl}" alt="Riviewit Logo" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;">Riviewit Team</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              This email was sent to ${email}. If you didn't sign up for <img src="${publicFaviconUrl}" alt="Riviewit Logo" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;">Riviewit, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Riviewit!
      
      Hi ${name},
      
      Thank you for signing up! Please verify your email address by visiting this link:
      ${verificationUrl}
      
      This link will expire in 24 hours for your security.
      
      If you didn't create an account with Riviewit, please ignore this email.
      
      Best regards,
      The Riviewit Team
    `;

    return {
      to: email,
      from: this.fromEmail,
      subject: '✅ Verify Your Email Address - Riviewit',
      html,
      text
    };
  }
}

export default EmailService;
