const { UserSubscription, SubscriptionPlan } = require('../models/Subscription');
const User = require('../models/User');

// Default limits for free users
const FREE_PLAN_LIMITS = {
  examsPerMonth: 1,
  isLifetimeLimit: true,
  questionsAccess: 'basic',
  reviewAccess: false,
  analyticsAccess: false,
  downloadCertificate: false,
  prioritySupport: false
};

/**
 * Get user's subscription details and limits
 */
const getSubscriptionDetails = async (userId) => {
  const now = new Date();

  // Check for active user subscription
  const userSubscription = await UserSubscription.findOne({
    userId,
    status: 'active',
    $or: [
      { endDate: { $gt: now } },
      { endDate: null } // Lifetime
    ]
  });

  if (userSubscription) {
    const plan = await SubscriptionPlan.findById(userSubscription.planId);
    return {
      subscription: userSubscription,
      plan,
      limits: plan?.limits || FREE_PLAN_LIMITS,
      planName: userSubscription.planName,
      examsUsedThisMonth: userSubscription.examsUsedThisMonth
    };
  }

  // Fallback to embedded subscription only if it's active
  const user = await User.findById(userId);
  const embedded = user?.subscription;
  const embeddedActive = embedded?.plan && embedded.plan !== 'free' &&
    embedded.status === 'active' &&
    (!embedded.endDate || new Date(embedded.endDate) > now);

  if (embeddedActive) {
    const plan = await SubscriptionPlan.findOne({ name: embedded.plan });
    return {
      subscription: null,
      plan,
      limits: plan?.limits || FREE_PLAN_LIMITS,
      planName: embedded.plan,
      examsUsedThisMonth: 0
    };
  }

  // Free plan fallback
  const freePlan = await SubscriptionPlan.findOne({ name: 'free' });
  return {
    subscription: null,
    plan: freePlan,
    limits: freePlan?.limits || FREE_PLAN_LIMITS,
    planName: 'free',
    examsUsedThisMonth: 0
  };
};

/**
 * Middleware to check if user can take an exam
 */
const checkExamAccess = async (req, res, next) => {
  try {
    const details = await getSubscriptionDetails(req.user._id);
    const { limits, planName, subscription } = details;

    // Admin and lifetime users have unlimited access
    if (req.user.role === 'admin' || planName === 'lifetime') {
      req.subscriptionDetails = details;
      return next();
    }

    // For free tier, lock the limit to configured FREE_PLAN_LIMITS.examsPerMonth (default 2)
    const baseLimit = limits?.examsPerMonth ?? -1;
    const examsLimit = planName === 'free'
      ? FREE_PLAN_LIMITS.examsPerMonth
      : baseLimit;

    // If unlimited (-1), allow
    if (examsLimit === -1) {
      req.subscriptionDetails = { ...details, examsUsedThisMonth: subscription?.examsUsedThisMonth || 0 };
      return next();
    }

    let examsUsed = 0;
    let canTake = true;
    const isLifetimeLimit = limits?.isLifetimeLimit || false;

    if (subscription) {
      canTake = await subscription.canTakeExam();
      examsUsed = subscription.examsUsedThisMonth;
    } else {
      const ExamAttempt = require('../models/ExamAttempt');

      // For lifetime limits, count all attempts; for monthly limits, count only this month
      const query = { userId: req.user._id };
      if (!isLifetimeLimit) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        query.startTime = { $gte: startOfMonth };
      }

      examsUsed = await ExamAttempt.countDocuments(query);
      canTake = examsUsed < examsLimit;
    }

    if (!canTake) {
      const limitType = isLifetimeLimit ? 'account' : 'monthly';
      return res.status(403).json({
        success: false,
        message: `You have reached your ${limitType} exam limit (${examsLimit} exam${examsLimit > 1 ? 's' : ''}). Upgrade your plan for more access.`,
        data: {
          examsUsed,
          examsLimit,
          planName,
          isLifetimeLimit
        }
      });
    }

    req.subscriptionDetails = {
      ...details,
      examsUsedThisMonth: examsUsed
    };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has review access
 */
const checkReviewAccess = async (req, res, next) => {
  try {
    const details = await getSubscriptionDetails(req.user._id);
    const { limits, planName } = details;

    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }

    if (!limits.reviewAccess) {
      return res.status(403).json({
        success: false,
        message: 'Review access requires a Basic or higher plan.',
        data: { planName }
      });
    }

    req.subscriptionDetails = details;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has analytics access
 */
const checkAnalyticsAccess = async (req, res, next) => {
  try {
    const details = await getSubscriptionDetails(req.user._id);
    const { limits, planName } = details;

    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }

    if (!limits.analyticsAccess) {
      return res.status(403).json({
        success: false,
        message: 'Analytics access requires a Basic or higher plan.',
        data: { planName }
      });
    }

    req.subscriptionDetails = details;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to increment exam usage
 */
const incrementExamUsage = async (userId) => {
  const userSubscription = await UserSubscription.findOne({
    userId,
    status: 'active'
  });

  if (!userSubscription) return;

  // Get plan to check if it's a lifetime limit
  const plan = await SubscriptionPlan.findById(userSubscription.planId);
  const isLifetimeLimit = plan?.limits?.isLifetimeLimit || false;

  // Only reset monthly counter if it's NOT a lifetime limit
  if (!isLifetimeLimit) {
    const now = new Date();
    const lastReset = new Date(userSubscription.lastResetDate || now);
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      userSubscription.examsUsedThisMonth = 0;
      userSubscription.lastResetDate = now;
    }
  }

  userSubscription.examsUsedThisMonth += 1;
  userSubscription.lastResetDate = new Date();
  await userSubscription.save();
};

module.exports = {
  getSubscriptionDetails,
  checkExamAccess,
  checkReviewAccess,
  checkAnalyticsAccess,
  incrementExamUsage
};
