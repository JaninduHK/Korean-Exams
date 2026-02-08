const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['free', 'basic', 'premium', 'lifetime']
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    monthly: { type: Number, default: 0 },
    yearly: { type: Number, default: 0 },
    lifetime: { type: Number, default: 0 }
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  features: [{
    text: String,
    included: { type: Boolean, default: true }
  }],
  limits: {
    examsPerMonth: { type: Number, default: -1 }, // -1 = unlimited
    isLifetimeLimit: { type: Boolean, default: false }, // true = limit applies for account lifetime, not monthly
    questionsAccess: { type: String, enum: ['all', 'basic', 'limited'], default: 'all' },
    reviewAccess: { type: Boolean, default: true },
    analyticsAccess: { type: Boolean, default: true },
    downloadCertificate: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const UserSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime', 'free'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'active'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  examsUsedThisMonth: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String
  },
  stripeSubscriptionId: String,
  stripeCustomerId: String
}, {
  timestamps: true
});

// Check if subscription is active
UserSubscriptionSchema.methods.isActive = function() {
  if (this.status !== 'active') return false;
  if (this.planName === 'lifetime' || this.planName === 'free') return true;
  if (!this.endDate) return true;
  return new Date() < this.endDate;
};

// Check exam limit
UserSubscriptionSchema.methods.canTakeExam = async function() {
  const SubscriptionPlan = mongoose.model('SubscriptionPlan');
  const plan = await SubscriptionPlan.findById(this.planId);

  if (!plan) return false;
  if (plan.limits.examsPerMonth === -1) return true;

  // For lifetime limits (e.g., free plan), don't reset monthly
  if (plan.limits.isLifetimeLimit) {
    return this.examsUsedThisMonth < plan.limits.examsPerMonth;
  }

  // Reset monthly counter if needed for monthly limits
  const now = new Date();
  const lastReset = new Date(this.lastResetDate);
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.examsUsedThisMonth = 0;
    this.lastResetDate = now;
    await this.save();
  }

  return this.examsUsedThisMonth < plan.limits.examsPerMonth;
};

// Increment exam usage
UserSubscriptionSchema.methods.useExam = async function() {
  this.examsUsedThisMonth += 1;
  await this.save();
};

const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema);

module.exports = { SubscriptionPlan, UserSubscription };
