const brevo = require('@getbrevo/brevo');

// Initialize Brevo API
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

/**
 * Send email using Brevo
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML content
 * @param {string} options.textContent - Plain text content (optional)
 */
const sendEmail = async (options) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL
    };

    sendSmtpEmail.to = [{ email: options.to }];
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.htmlContent;

    if (options.textContent) {
      sendSmtpEmail.textContent = options.textContent;
    }

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 500;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .url-fallback {
          word-break: break-all;
          color: #2563eb;
          font-size: 14px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Korean Exams</div>
        </div>

        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>You recently requested to reset your password for your Korean Exams account. Click the button below to reset it:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <div class="url-fallback">${resetUrl}</div>

          <div class="warning">
            <strong>Security Notice:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>This password reset link will expire in <strong>1 hour</strong></li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password will remain unchanged unless you click the link above</li>
            </ul>
          </div>

          <p>If you're having trouble, please contact our support team at ${process.env.BREVO_SENDER_EMAIL}</p>
        </div>

        <div class="footer">
          <p>This is an automated email from Korean Exams. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Korean Exams. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Password Reset Request

Hello,

You recently requested to reset your password for your Korean Exams account. Please visit the following link to reset it:

${resetUrl}

Security Notice:
- This password reset link will expire in 1 hour
- If you didn't request this, please ignore this email
- Your password will remain unchanged unless you click the link above

If you're having trouble, please contact our support team at ${process.env.BREVO_SENDER_EMAIL}

---
This is an automated email from Korean Exams. Please do not reply to this email.
© ${new Date().getFullYear()} Korean Exams. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - Korean Exams',
    htmlContent,
    textContent
  });
};

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} fullName - User's full name
 */
const sendWelcomeEmail = async (email, fullName) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Korean Exams</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 500;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Korean Exams</div>
        </div>

        <div class="content">
          <h2>Welcome to Korean Exams!</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for creating an account with Korean Exams. We're excited to have you on board!</p>

          <p>You can now access our comprehensive EPS-TOPIK exam preparation materials and practice tests.</p>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
          </div>

          <p>If you have any questions, feel free to contact us at ${process.env.BREVO_SENDER_EMAIL}</p>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Korean Exams. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Welcome to Korean Exams!

Hello ${fullName},

Thank you for creating an account with Korean Exams. We're excited to have you on board!

You can now access our comprehensive EPS-TOPIK exam preparation materials and practice tests.

Visit your dashboard: ${process.env.CLIENT_URL}/dashboard

If you have any questions, feel free to contact us at ${process.env.BREVO_SENDER_EMAIL}

---
© ${new Date().getFullYear()} Korean Exams. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Korean Exams!',
    htmlContent,
    textContent
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
