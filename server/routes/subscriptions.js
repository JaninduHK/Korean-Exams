const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { SubscriptionPlan, UserSubscription } = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { getSubscriptionDetails } = require('../middleware/subscription');
const { getPayHereConfig, formatAmount, generateHash, verifyMd5Signature } = require('../utils/payhere');

// Helper to activate subscription after successful payment
const activateSubscriptionForPayment = async (payment) => {
  const plan = await SubscriptionPlan.findOne({ name: payment.planName });
  const user = await User.findById(payment.userId);

  if (!user || !plan) return null;

  let endDate = null;
  if (payment.billingCycle === 'monthly') {
    endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (payment.billingCycle === 'yearly') {
    endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  const subscription = await UserSubscription.findOneAndUpdate(
    { userId: user._id },
    {
      planId: plan._id,
      planName: payment.planName,
      billingCycle: payment.billingCycle,
      amount: payment.amount,
      startDate: new Date(),
      endDate,
      status: 'active',
      paymentMethod: payment.paymentMethod
    },
    { upsert: true, new: true }
  );

  payment.subscriptionId = subscription._id;
  await payment.save();

  user.subscription = {
    plan: payment.planName,
    status: 'active',
    startDate: new Date(),
    endDate,
    examsRemaining: plan.limits.examsPerMonth
  };
  await user.save();

  return subscription;
};

// @desc    Get all active subscription plans (public)
// @route   GET /api/subscriptions/plans
// @access  Public
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user subscription
// @route   GET /api/subscriptions/current
// @access  Private
router.get('/current', protect, async (req, res, next) => {
  try {
    const subscription = await UserSubscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).populate('planId');

    res.status(200).json({
      success: true,
      data: subscription || { planName: 'free', status: 'active' }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get subscription usage
// @route   GET /api/subscriptions/usage
// @access  Private
router.get('/usage', protect, async (req, res, next) => {
  try {
    const details = await getSubscriptionDetails(req.user._id);
    const { subscription, limits, planName } = details;
    const examsLimit = limits?.examsPerMonth ?? -1;

    let examsUsed = 0;
    let canTakeExam = true;
    let endDate = null;
    let status = 'active';

    if (subscription) {
      // ensure monthly reset before reporting
      canTakeExam = await subscription.canTakeExam();
      examsUsed = subscription.examsUsedThisMonth;
      endDate = subscription.endDate;
      status = subscription.status;
    } else {
      const ExamAttempt = require('../models/ExamAttempt');
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      examsUsed = await ExamAttempt.countDocuments({
        userId: req.user._id,
        startTime: { $gte: startOfMonth }
      });
      canTakeExam = examsLimit === -1 || examsUsed < examsLimit;
    }

    res.status(200).json({
      success: true,
      data: {
        planName,
        examsUsed,
        examsLimit,
        canTakeExam,
        endDate,
        status
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create subscription request (initiate payment)
// @route   POST /api/subscriptions/subscribe
// @access  Private
router.post('/subscribe', protect, async (req, res, next) => {
  try {
    const { planName, billingCycle } = req.body;

    const plan = await SubscriptionPlan.findOne({ name: planName, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Get price based on billing cycle
    let amount = 0;
    if (billingCycle === 'monthly') amount = plan.price.monthly;
    else if (billingCycle === 'yearly') amount = plan.price.yearly;
    else if (billingCycle === 'lifetime') amount = plan.price.lifetime;

    // Create pending payment
    const payment = await Payment.create({
      userId: req.user._id,
      planName,
      billingCycle,
      amount,
      currency: plan.currency,
      status: 'pending',
      paymentMethod: 'pending'
    });

    res.status(201).json({
      success: true,
      data: {
        payment,
        plan,
        amount,
        currency: plan.currency
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Initiate PayHere checkout
// @route   POST /api/subscriptions/payhere/initiate
// @access  Private
router.post('/payhere/initiate', protect, async (req, res, next) => {
  try {
    const { planName, billingCycle } = req.body;
    const config = getPayHereConfig();

    if (!config.merchantId || !config.merchantSecret) {
      return res.status(400).json({ success: false, message: 'PayHere is not configured' });
    }

    const plan = await SubscriptionPlan.findOne({ name: planName, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    let amount = 0;
    if (billingCycle === 'monthly') amount = plan.price.monthly;
    else if (billingCycle === 'yearly') amount = plan.price.yearly;
    else if (billingCycle === 'lifetime') amount = plan.price.lifetime;

    // Create payment record marked for PayHere
    const payment = await Payment.create({
      userId: req.user._id,
      planName,
      billingCycle,
      amount,
      currency: plan.currency,
      status: 'processing',
      paymentMethod: 'payhere',
      paymentGateway: 'payhere'
    });

    const orderId = payment.orderId;
    const currency = plan.currency || 'LKR';
    const amountFormatted = formatAmount(amount);

    // Build redirect URLs
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const apiBase = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const returnUrl = req.body.returnUrl || process.env.PAYHERE_RETURN_URL || `${clientUrl}/subscription?status=success`;
    const cancelUrl = req.body.cancelUrl || process.env.PAYHERE_CANCEL_URL || `${clientUrl}/subscription?status=cancel`;
    const notifyUrl = process.env.PAYHERE_NOTIFY_URL || `${apiBase}/api/subscriptions/payhere/notify`;

    // Prepare PayHere payload
    const [firstName, ...rest] = (req.user.fullName || 'User').split(' ');
    const payload = {
      merchant_id: config.merchantId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      order_id: orderId,
      items: plan.displayName || plan.name,
      amount: amountFormatted,
      currency,
      first_name: firstName || 'User',
      last_name: rest.join(' ') || 'User',
      email: req.user.email,
      phone: req.user.phone || '',
      address: 'N/A',
      city: 'Colombo',
      country: 'Sri Lanka'
    };

    payload.hash = generateHash({
      merchantId: payload.merchant_id,
      orderId: payload.order_id,
      amount: payload.amount,
      currency: payload.currency,
      merchantSecret: config.merchantSecret
    });

    const actionUrl = config.mode === 'live'
      ? 'https://www.payhere.lk/pay/checkout'
      : 'https://sandbox.payhere.lk/pay/checkout';

    res.status(201).json({
      success: true,
      data: {
        payment,
        payhere: {
          actionUrl,
          payload
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    PayHere notify (IPN) handler
// @route   POST /api/subscriptions/payhere/notify
// @access  Public (PayHere servers)
router.post('/payhere/notify', async (req, res) => {
  try {
    const payload = req.body || {};

    // Verify signature
    const validSignature = verifyMd5Signature(payload);
    if (!validSignature) {
      console.warn('PayHere: invalid signature', payload);
      return res.status(400).send('Invalid signature');
    }

    const orderId = payload.order_id;
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).send('Order not found');
    }

    // Avoid re-processing
    if (payment.status === 'completed') {
      return res.status(200).send('OK');
    }

    payment.transactionId = payload.payment_id || payment.transactionId;
    payment.paymentGateway = 'payhere';
    payment.metadata = { ...payment.metadata, payhere: payload };

    // PayHere status_code: 2 = success, -1 = cancelled, 0 = pending, -2 = failed
    if (Number(payload.status_code) === 2) {
      payment.status = 'completed';
      await payment.save();
      await activateSubscriptionForPayment(payment);
    } else if (Number(payload.status_code) === 0) {
      payment.status = 'processing';
      await payment.save();
    } else {
      payment.status = 'failed';
      await payment.save();
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('PayHere notify error', error);
    return res.status(500).send('Server error');
  }
});

// @desc    Submit bank transfer slip
// @route   POST /api/subscriptions/bank-transfer
// @access  Private
router.post('/bank-transfer', protect, async (req, res, next) => {
  try {
    const { planName, billingCycle, amount: customAmount, slipUrl, notes, slipBase64 } = req.body;

    const plan = await SubscriptionPlan.findOne({ name: planName, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    let amount = customAmount;
    if (!amount) {
      if (billingCycle === 'monthly') amount = plan.price.monthly;
      else if (billingCycle === 'yearly') amount = plan.price.yearly;
      else if (billingCycle === 'lifetime') amount = plan.price.lifetime;
    }

    const payment = await Payment.create({
      userId: req.user._id,
      planName,
      billingCycle,
      amount,
      currency: plan.currency,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      notes,
      receiptUrl: slipUrl || null,
      slipUrl: slipUrl || null,
      slipNotes: notes,
      metadata: slipBase64 ? { slipBase64 } : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Bank transfer submitted. We will verify and activate your subscription shortly.',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get payment history
// @route   GET /api/subscriptions/payments
// @access  Private
router.get('/payments', protect, async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/cancel
// @access  Private
router.put('/cancel', protect, async (req, res, next) => {
  try {
    const subscription = await UserSubscription.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    // Update user
    const user = await User.findById(req.user._id);
    user.subscription.status = 'cancelled';
    await user.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
