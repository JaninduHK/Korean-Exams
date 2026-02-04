# Email Service Setup Guide (Brevo)

This application uses Brevo (formerly Sendinblue) for transactional email services.

## Prerequisites

1. A Brevo account (sign up at https://app.brevo.com)
2. A verified sender email address in Brevo
3. A Brevo API key

## Getting Your Brevo API Key

1. Log in to your Brevo account at https://app.brevo.com
2. Navigate to **Settings** → **SMTP & API** → **API Keys**
3. Click **Generate a new API key**
4. Copy the API key (v3 API key)
5. Store it securely - you won't be able to see it again

## Verifying Your Sender Email

Before you can send emails, you need to verify your sender email address:

1. Go to **Senders, Domains & Dedicated IPs** → **Senders** in Brevo dashboard
2. Click **Add a new sender**
3. Enter your email address (e.g., support@koreanexams.com)
4. Verify the email by clicking the link sent to your inbox
5. Once verified, you can use this email as your sender

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the following variables in your `.env` file:
   ```env
   BREVO_API_KEY=your_actual_api_key_here
   BREVO_SENDER_EMAIL=support@koreanexams.com
   BREVO_SENDER_NAME=Korean Exams
   CLIENT_URL=http://localhost:5173
   ```

3. For production, also update `.env.production`:
   ```env
   BREVO_API_KEY=your_production_api_key
   BREVO_SENDER_EMAIL=support@koreanexams.com
   BREVO_SENDER_NAME=Korean Exams
   CLIENT_URL=https://koreanexams.com
   ```

## Testing the Email Service

Run the test script to verify your email configuration:

```bash
cd server
node test-email.js
```

**Important:** Update line 22 in `test-email.js` with your actual email address to receive test emails.

The test script will:
- Verify your environment variables are set
- Send a test password reset email
- Send a test welcome email
- Display success/error messages

## Email Templates

The application includes the following email templates:

### 1. Password Reset Email
- **Function:** `sendPasswordResetEmail(email, resetToken)`
- **Trigger:** When user requests password reset via `/api/auth/forgot-password`
- **Features:**
  - Professional HTML design
  - Mobile-responsive
  - 1-hour expiration notice
  - Security warnings
  - Plain text fallback

### 2. Welcome Email
- **Function:** `sendWelcomeEmail(email, fullName)`
- **Trigger:** Currently manual (can be added to registration)
- **Features:**
  - Welcome message
  - Dashboard link
  - Support contact information

## API Endpoints

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password/:resetToken
Content-Type: application/json

{
  "password": "NewPassword123"
}
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys regularly** for security
4. **Monitor email sending** in Brevo dashboard
5. **Set up email quotas** to prevent abuse
6. **Enable email verification** for all sender addresses

## Troubleshooting

### Email not sending?

1. Check your API key is correct and active
2. Verify your sender email is verified in Brevo
3. Check the server logs for error messages
4. Verify you haven't exceeded your Brevo plan limits
5. Check spam folder if emails are being sent but not received

### "Invalid API key" error?

1. Make sure you're using a v3 API key from Brevo
2. Verify the key is copied correctly with no extra spaces
3. Ensure the environment variables are loaded (restart server)

### Emails going to spam?

1. Set up SPF, DKIM, and DMARC records for your domain
2. Use a professional sender email (avoid @gmail.com in production)
3. Ensure your sender email is verified
4. Consider setting up a dedicated IP (available on paid plans)

## Brevo Dashboard

Monitor your email activity in the Brevo dashboard:
- **Statistics:** View sent, delivered, opened, and clicked emails
- **Logs:** Check individual email status and errors
- **Contacts:** Manage your email list
- **Templates:** Create and manage email templates

## Pricing

Brevo offers a free tier with:
- 300 emails per day
- Unlimited contacts
- Email campaigns
- Transactional emails

For higher volume, check Brevo's pricing plans at https://www.brevo.com/pricing/

## Support

For Brevo-specific issues:
- Documentation: https://developers.brevo.com/
- Support: https://help.brevo.com/

For application issues:
- Contact: support@koreanexams.com
