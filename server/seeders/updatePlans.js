const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { SubscriptionPlan } = require('../models/Subscription');

// Load env vars
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eps-topik';

// Updated plan limits
const planUpdates = {
  free: {
    features: [
      { text: '1 exam per account', included: true },
      { text: 'Basic question bank', included: true },
      { text: 'Results & scores', included: true },
      { text: 'Review answers', included: false },
      { text: 'Detailed analytics', included: false },
      { text: 'Download certificate', included: false },
      { text: 'Priority support', included: false }
    ],
    limits: {
      examsPerMonth: 1,
      isLifetimeLimit: true,
      questionsAccess: 'basic',
      reviewAccess: false,
      analyticsAccess: false,
      downloadCertificate: false,
      prioritySupport: false
    }
  },
  basic: {
    features: [
      { text: '5 exams per month', included: true },
      { text: 'Full question bank', included: true },
      { text: 'Results & scores', included: true },
      { text: 'Review answers', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Download certificate', included: false },
      { text: 'Priority support', included: false }
    ],
    limits: {
      examsPerMonth: 5,
      isLifetimeLimit: false,
      questionsAccess: 'all',
      reviewAccess: true,
      analyticsAccess: true,
      downloadCertificate: false,
      prioritySupport: false
    }
  },
  premium: {
    limits: {
      examsPerMonth: -1,
      isLifetimeLimit: false,
      questionsAccess: 'all',
      reviewAccess: true,
      analyticsAccess: true,
      downloadCertificate: true,
      prioritySupport: true
    }
  },
  lifetime: {
    limits: {
      examsPerMonth: -1,
      isLifetimeLimit: false,
      questionsAccess: 'all',
      reviewAccess: true,
      analyticsAccess: true,
      downloadCertificate: true,
      prioritySupport: true
    }
  }
};

const updatePlans = async () => {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Updating subscription plans...\n');

    for (const [planName, updates] of Object.entries(planUpdates)) {
      const result = await SubscriptionPlan.findOneAndUpdate(
        { name: planName },
        { $set: updates },
        { new: true }
      );

      if (result) {
        console.log(`✓ Updated ${result.displayName} plan:`);
        console.log(`  - Exam limit: ${result.limits.examsPerMonth === -1 ? 'Unlimited' : result.limits.examsPerMonth}`);
        console.log(`  - Lifetime limit: ${result.limits.isLifetimeLimit ? 'Yes' : 'No'}`);
      } else {
        console.log(`✗ Plan "${planName}" not found in database`);
      }
    }

    console.log('\n========================================');
    console.log('Plan updates completed successfully!');
    console.log('========================================');
    console.log('\nNew limits:');
    console.log('- Free: 1 exam per account (lifetime)');
    console.log('- Basic: 5 exams per month');
    console.log('- Premium: Unlimited');
    console.log('- Lifetime: Unlimited');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error updating plans:', error);
    process.exit(1);
  }
};

// Run updater
updatePlans();
