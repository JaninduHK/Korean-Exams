const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const User = require('../models/User');
const { SubscriptionPlan } = require('../models/Subscription');
const { readingQuestions, listeningQuestions } = require('./questionSeeder');

// Load env vars
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eps-topik';

// Default subscription plans
const subscriptionPlans = [
  {
    name: 'free',
    displayName: 'Free',
    description: 'Get started with basic features',
    price: { monthly: 0, yearly: 0, lifetime: 0 },
    currency: 'LKR',
    features: [
      { text: '2 exams per month', included: true },
      { text: 'Basic question bank', included: true },
      { text: 'Results & scores', included: true },
      { text: 'Review answers', included: false },
      { text: 'Detailed analytics', included: false },
      { text: 'Download certificate', included: false },
      { text: 'Priority support', included: false }
    ],
    limits: {
      examsPerMonth: 2,
      questionsAccess: 'basic',
      reviewAccess: false,
      analyticsAccess: false,
      downloadCertificate: false,
      prioritySupport: false
    },
    isActive: true,
    isPopular: false,
    order: 1
  },
  {
    name: 'basic',
    displayName: 'Basic',
    description: 'For serious learners',
    price: { monthly: 990, yearly: 9900, lifetime: 0 },
    currency: 'LKR',
    features: [
      { text: '10 exams per month', included: true },
      { text: 'Full question bank', included: true },
      { text: 'Results & scores', included: true },
      { text: 'Review answers', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Download certificate', included: false },
      { text: 'Priority support', included: false }
    ],
    limits: {
      examsPerMonth: 10,
      questionsAccess: 'all',
      reviewAccess: true,
      analyticsAccess: true,
      downloadCertificate: false,
      prioritySupport: false
    },
    isActive: true,
    isPopular: false,
    order: 2
  },
  {
    name: 'premium',
    displayName: 'Premium',
    description: 'Unlimited access to everything',
    price: { monthly: 1990, yearly: 19900, lifetime: 0 },
    currency: 'LKR',
    features: [
      { text: 'Unlimited exams', included: true },
      { text: 'Full question bank', included: true },
      { text: 'Results & scores', included: true },
      { text: 'Review answers', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Download certificate', included: true },
      { text: 'Priority support', included: true }
    ],
    limits: {
      examsPerMonth: -1,
      questionsAccess: 'all',
      reviewAccess: true,
      analyticsAccess: true,
      downloadCertificate: true,
      prioritySupport: true
    },
    isActive: true,
    isPopular: true,
    order: 3
  },
  {
    name: 'lifetime',
    displayName: 'Lifetime',
    description: 'One-time payment, forever access',
    price: { monthly: 0, yearly: 0, lifetime: 49900 },
    currency: 'LKR',
    features: [
      { text: 'Unlimited exams forever', included: true },
      { text: 'Full question bank', included: true },
      { text: 'All future updates', included: true },
      { text: 'Review answers', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Download certificate', included: true },
      { text: 'Priority support', included: true }
    ],
    limits: {
      examsPerMonth: -1,
      questionsAccess: 'all',
      reviewAccess: true,
      analyticsAccess: true,
      downloadCertificate: true,
      prioritySupport: true
    },
    isActive: true,
    isPopular: false,
    order: 4
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Question.deleteMany({});
    await Exam.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    console.log('Existing data cleared');

    // Insert subscription plans
    console.log('Inserting subscription plans...');
    const insertedPlans = await SubscriptionPlan.insertMany(subscriptionPlans);
    console.log(`Inserted ${insertedPlans.length} subscription plans`);

    // Insert reading questions
    console.log('Inserting reading questions...');
    const insertedReadingQuestions = await Question.insertMany(readingQuestions);
    console.log(`Inserted ${insertedReadingQuestions.length} reading questions`);

    // Insert listening questions
    console.log('Inserting listening questions...');
    const insertedListeningQuestions = await Question.insertMany(listeningQuestions);
    console.log(`Inserted ${insertedListeningQuestions.length} listening questions`);

    // Create exams
    console.log('Creating exams...');

    const exams = [
      {
        title: 'EPS-TOPIK Full Practice Test 1',
        description: 'Complete practice exam with 40 questions (20 reading + 20 listening) covering both sections. Simulates the actual EPS-TOPIK exam format.',
        difficulty: 'mixed',
        examType: 'full',
        readingQuestions: insertedReadingQuestions.slice(0, 20).map(q => q._id),
        listeningQuestions: insertedListeningQuestions.slice(0, 20).map(q => q._id),
        duration: { reading: 25, listening: 25, total: 50 },
        totalQuestions: 40,
        questionsPerSection: { reading: 20, listening: 20 },
        passScore: 60,
        isFeatured: true,
        isActive: true,
        order: 1
      },
      {
        title: 'Reading Practice - Easy Level',
        description: 'Focus on reading comprehension with easier questions. Perfect for beginners.',
        difficulty: 'easy',
        examType: 'reading-only',
        readingQuestions: insertedReadingQuestions.filter(q => q.difficulty === 'easy').map(q => q._id),
        listeningQuestions: [],
        duration: { reading: 25, listening: 0, total: 25 },
        totalQuestions: insertedReadingQuestions.filter(q => q.difficulty === 'easy').length,
        questionsPerSection: { reading: insertedReadingQuestions.filter(q => q.difficulty === 'easy').length, listening: 0 },
        passScore: 60,
        isFeatured: true,
        isActive: true,
        order: 2
      },
      {
        title: 'Reading Practice - Medium Level',
        description: 'Intermediate reading comprehension questions to test your Korean skills.',
        difficulty: 'medium',
        examType: 'reading-only',
        readingQuestions: insertedReadingQuestions.filter(q => q.difficulty === 'medium').map(q => q._id),
        listeningQuestions: [],
        duration: { reading: 25, listening: 0, total: 25 },
        totalQuestions: insertedReadingQuestions.filter(q => q.difficulty === 'medium').length,
        questionsPerSection: { reading: insertedReadingQuestions.filter(q => q.difficulty === 'medium').length, listening: 0 },
        passScore: 60,
        isActive: true,
        order: 3
      },
      {
        title: 'Listening Practice - Beginner',
        description: 'Practice your Korean listening skills with audio questions.',
        difficulty: 'easy',
        examType: 'listening-only',
        readingQuestions: [],
        listeningQuestions: insertedListeningQuestions.filter(q => q.difficulty === 'easy').map(q => q._id),
        duration: { reading: 0, listening: 25, total: 25 },
        totalQuestions: insertedListeningQuestions.filter(q => q.difficulty === 'easy').length,
        questionsPerSection: { reading: 0, listening: insertedListeningQuestions.filter(q => q.difficulty === 'easy').length },
        passScore: 60,
        isFeatured: true,
        isActive: true,
        order: 4
      },
      {
        title: 'Workplace Safety Quiz',
        description: 'Test your knowledge of workplace safety rules and regulations in Korean.',
        difficulty: 'medium',
        examType: 'practice',
        readingQuestions: insertedReadingQuestions.filter(q => q.topic === 'workplace-safety').map(q => q._id),
        listeningQuestions: insertedListeningQuestions.filter(q => q.topic === 'workplace-safety').map(q => q._id),
        duration: { reading: 15, listening: 15, total: 30 },
        totalQuestions: insertedReadingQuestions.filter(q => q.topic === 'workplace-safety').length +
                       insertedListeningQuestions.filter(q => q.topic === 'workplace-safety').length,
        passScore: 60,
        isActive: true,
        order: 5
      },
      {
        title: 'Daily Life Korean',
        description: 'Learn vocabulary and expressions used in everyday situations.',
        difficulty: 'easy',
        examType: 'practice',
        readingQuestions: insertedReadingQuestions.filter(q => q.topic === 'daily-life').map(q => q._id),
        listeningQuestions: insertedListeningQuestions.filter(q => q.topic === 'daily-life').map(q => q._id),
        duration: { reading: 15, listening: 15, total: 30 },
        totalQuestions: insertedReadingQuestions.filter(q => q.topic === 'daily-life').length +
                       insertedListeningQuestions.filter(q => q.topic === 'daily-life').length,
        passScore: 60,
        isActive: true,
        order: 6
      }
    ];

    const insertedExams = await Exam.insertMany(exams);
    console.log(`Created ${insertedExams.length} exams`);

    // Create a demo admin user if not exists
    const existingAdmin = await User.findOne({ email: 'admin@eps-topik.com' });
    if (!existingAdmin) {
      await User.create({
        email: 'admin@eps-topik.com',
        password: 'Admin123!',
        fullName: 'Admin User',
        role: 'admin',
        emailVerified: true,
        subscription: {
          plan: 'lifetime',
          status: 'active',
          examsRemaining: -1
        }
      });
      console.log('Created admin user: admin@eps-topik.com / Admin123!');
    }

    console.log('\n========================================');
    console.log('Database seeding completed successfully!');
    console.log('========================================');
    console.log('\nSummary:');
    console.log(`- ${insertedPlans.length} subscription plans`);
    console.log(`- ${insertedReadingQuestions.length} reading questions`);
    console.log(`- ${insertedListeningQuestions.length} listening questions`);
    console.log(`- ${insertedExams.length} exams`);
    console.log('\nSubscription Plans:');
    insertedPlans.forEach(plan => {
      console.log(`- ${plan.displayName}: LKR ${plan.price.monthly}/month`);
    });
    console.log('\nAdmin credentials:');
    console.log('Email: admin@eps-topik.com');
    console.log('Password: Admin123!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
