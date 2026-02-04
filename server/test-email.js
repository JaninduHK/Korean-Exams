/**
 * Test script for Brevo email service
 * Run with: node test-email.js
 */

require('dotenv').config();
const { sendPasswordResetEmail, sendWelcomeEmail } = require('./utils/emailService');

const testEmail = async () => {
  console.log('Testing Brevo Email Service...\n');
  console.log('Configuration:');
  console.log('- API Key:', process.env.BREVO_API_KEY ? 'Set ✓' : 'Not Set ✗');
  console.log('- Sender Email:', process.env.BREVO_SENDER_EMAIL);
  console.log('- Sender Name:', process.env.BREVO_SENDER_NAME);
  console.log('- Client URL:', process.env.CLIENT_URL);
  console.log('\n---\n');

  try {
    // Test 1: Password Reset Email
    console.log('Test 1: Sending Password Reset Email...');
    const testResetToken = 'test-reset-token-123456';
    const testEmail = 'test@example.com'; // Change this to your email to test

    await sendPasswordResetEmail(testEmail, testResetToken);
    console.log('✓ Password reset email sent successfully!\n');

    // Test 2: Welcome Email (optional)
    console.log('Test 2: Sending Welcome Email...');
    await sendWelcomeEmail(testEmail, 'Test User');
    console.log('✓ Welcome email sent successfully!\n');

    console.log('All tests passed! Email service is working correctly.');
  } catch (error) {
    console.error('✗ Email test failed:');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', error.response.body);
    }
  }
};

testEmail();
