const User = require('../models/User');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const { SubscriptionPlan, UserSubscription } = require('../models/Subscription');
const Payment = require('../models/Payment');

// ============ DASHBOARD ============

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // Get counts
    const [
      totalUsers,
      newUsersThisMonth,
      totalQuestions,
      totalExams,
      totalAttempts,
      attemptsThisMonth,
      totalPayments,
      revenueThisMonth,
      activeSubscriptions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Question.countDocuments(),
      Exam.countDocuments(),
      ExamAttempt.countDocuments({ status: 'completed' }),
      ExamAttempt.countDocuments({ status: 'completed', createdAt: { $gte: startOfMonth } }),
      Payment.countDocuments({ status: 'completed' }),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      UserSubscription.countDocuments({ status: 'active' })
    ]);

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email createdAt');

    const recentPayments = await Payment.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'fullName email');

    const recentAttempts = await ExamAttempt.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'fullName')
      .populate('examId', 'title');

    // Subscription breakdown
    const subscriptionBreakdown = await UserSubscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$planName', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          newUsersThisMonth,
          totalQuestions,
          totalExams,
          totalAttempts,
          attemptsThisMonth,
          totalPayments,
          revenueThisMonth: revenueThisMonth[0]?.total || 0,
          activeSubscriptions
        },
        recentUsers,
        recentPayments,
        recentAttempts,
        subscriptionBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============ USER MANAGEMENT ============

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      query.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's subscription
    const subscription = await UserSubscription.findOne({ userId: user._id, status: 'active' });

    // Get user's recent attempts
    const attempts = await ExamAttempt.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('examId', 'title');

    // Get user's payments
    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: { user, subscription, attempts, payments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, role, emailVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, phone, role, emailVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete related data
    await ExamAttempt.deleteMany({ userId: user._id });
    await UserSubscription.deleteMany({ userId: user._id });
    await Payment.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user subscription manually
// @route   PUT /api/admin/users/:id/subscription
// @access  Private/Admin
exports.updateUserSubscription = async (req, res, next) => {
  try {
    const { planName, endDate, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find or create subscription
    let subscription = await UserSubscription.findOne({ userId: user._id });
    const plan = await SubscriptionPlan.findOne({ name: planName });

    if (!subscription) {
      subscription = new UserSubscription({
        userId: user._id,
        planId: plan?._id,
        planName,
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'active'
      });
    } else {
      subscription.planName = planName;
      subscription.planId = plan?._id;
      subscription.endDate = endDate ? new Date(endDate) : null;
      subscription.status = status || subscription.status;
    }

    await subscription.save();

    // Update user's subscription field
    user.subscription = {
      plan: planName,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      examsRemaining: plan?.limits?.examsPerMonth || -1
    };
    await user.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// ============ QUESTION MANAGEMENT ============

// @desc    Get all questions (admin)
// @route   GET /api/admin/questions
// @access  Private/Admin
exports.getQuestions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.type) query.type = req.query.type;
    if (req.query.difficulty) query.difficulty = req.query.difficulty;
    if (req.query.topic) query.topic = req.query.topic;
    if (req.query.search) {
      query.questionText = { $regex: req.query.search, $options: 'i' };
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create question
// @route   POST /api/admin/questions
// @access  Private/Admin
exports.createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/admin/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Remove from exams
    await Exam.updateMany(
      { $or: [{ readingQuestions: req.params.id }, { listeningQuestions: req.params.id }] },
      { $pull: { readingQuestions: req.params.id, listeningQuestions: req.params.id } }
    );

    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create questions
// @route   POST /api/admin/questions/bulk
// @access  Private/Admin
exports.bulkCreateQuestions = async (req, res, next) => {
  try {
    const { questions } = req.body;
    const created = await Question.insertMany(questions);
    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload audio file to Cloudinary
// @route   POST /api/admin/upload/audio
// @access  Private/Admin
exports.uploadAudioFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const cloudinary = require('../utils/cloudinary');

    // Upload to Cloudinary using stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          folder: 'korean-exams/audio',
          format: 'mp3'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        duration: result.duration,
        publicId: result.public_id
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============ EXAM MANAGEMENT ============

// @desc    Get all exams (admin)
// @route   GET /api/admin/exams
// @access  Private/Admin
exports.getExams = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.difficulty) query.difficulty = req.query.difficulty;
    if (req.query.examType) query.examType = req.query.examType;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const exams = await Exam.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Exam.countDocuments(query);

    res.status(200).json({
      success: true,
      data: exams,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create exam
// @route   POST /api/admin/exams
// @access  Private/Admin
exports.createExam = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    const readingCount = payload.readingQuestions?.length || 0;
    const listeningCount = payload.listeningQuestions?.length || 0;

    // Enforce EPS TOPIK structure for full exams
    if (payload.examType === 'full') {
      if (readingCount !== 40 || listeningCount !== 40) {
        return res.status(400).json({
          success: false,
          message: 'Full exams must have exactly 40 reading and 40 listening questions (80 total)'
        });
      }
      payload.duration = { reading: 50, listening: 30, total: 80 };
      payload.questionsPerSection = { reading: readingCount, listening: listeningCount };
      payload.totalQuestions = readingCount + listeningCount;
    } else {
      // Keep totals in sync even for other exam types
      payload.totalQuestions = readingCount + listeningCount;
      payload.questionsPerSection = { reading: readingCount, listening: listeningCount };
      if (payload.duration?.reading && payload.duration?.listening) {
        payload.duration.total = payload.duration.reading + payload.duration.listening;
      }
    }

    const exam = await Exam.create(payload);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam
// @route   PUT /api/admin/exams/:id
// @access  Private/Admin
exports.updateExam = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const readingCount = payload.readingQuestions?.length || 0;
    const listeningCount = payload.listeningQuestions?.length || 0;

    if (payload.examType === 'full') {
      if (readingCount !== 40 || listeningCount !== 40) {
        return res.status(400).json({
          success: false,
          message: 'Full exams must have exactly 40 reading and 40 listening questions (80 total)'
        });
      }
      payload.duration = { reading: 50, listening: 30, total: 80 };
    } else if (payload.duration?.reading && payload.duration?.listening) {
      payload.duration.total = payload.duration.reading + payload.duration.listening;
    }

    payload.totalQuestions = readingCount + listeningCount;
    payload.questionsPerSection = { reading: readingCount, listening: listeningCount };

    const exam = await Exam.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete exam
// @route   DELETE /api/admin/exams/:id
// @access  Private/Admin
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, message: 'Exam deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exam with questions for editing
// @route   GET /api/admin/exams/:id
// @access  Private/Admin
exports.getExamDetails = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('readingQuestions')
      .populate('listeningQuestions');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

// ============ SUBSCRIPTION PLAN MANAGEMENT ============

// @desc    Get all subscription plans
// @route   GET /api/admin/plans
// @access  Private/Admin
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subscription plan
// @route   POST /api/admin/plans
// @access  Private/Admin
exports.createPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription plan
// @route   PUT /api/admin/plans/:id
// @access  Private/Admin
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscription plan
// @route   DELETE /api/admin/plans/:id
// @access  Private/Admin
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
};

// ============ PAYMENT/ORDER MANAGEMENT ============

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.orderId = { $regex: req.query.search, $options: 'i' };
    }

    const payments = await Payment.find(query)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      totals: totals[0] || { total: 0, count: 0 },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/admin/payments/:id
// @access  Private/Admin
exports.updatePayment = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const wasCompleted = payment.status === 'completed';
    payment.status = status;
    payment.notes = notes;
    payment.processedBy = req.user._id;

    // If marking as completed, activate subscription
    if (status === 'completed' && !wasCompleted) {
      const plan = await SubscriptionPlan.findOne({ name: payment.planName });
      const user = await User.findById(payment.userId);

      if (user && plan) {
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
            status: 'active'
          },
          { upsert: true, new: true }
        );

        payment.subscriptionId = subscription._id;

        // Update user
        user.subscription = {
          plan: payment.planName,
          status: 'active',
          startDate: new Date(),
          endDate,
          examsRemaining: plan.limits.examsPerMonth
        };
        await user.save();
      }
    }

    await payment.save();

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual payment
// @route   POST /api/admin/payments
// @access  Private/Admin
exports.createPayment = async (req, res, next) => {
  try {
    const { userId, planName, billingCycle, amount, status, notes } = req.body;

    const payment = await Payment.create({
      userId,
      planName,
      billingCycle,
      amount,
      status: status || 'pending',
      notes,
      paymentMethod: 'manual',
      processedBy: req.user._id
    });

    // If completed, activate subscription
    if (payment.status === 'completed') {
      const plan = await SubscriptionPlan.findOne({ name: planName });
      const user = await User.findById(userId);

      if (user && plan) {
        let endDate = null;
        if (billingCycle === 'monthly') {
          endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else if (billingCycle === 'yearly') {
          endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        }

        const subscription = await UserSubscription.findOneAndUpdate(
          { userId: user._id },
          {
            planId: plan._id,
            planName,
            billingCycle,
            amount,
            startDate: new Date(),
            endDate,
            status: 'active'
          },
          { upsert: true, new: true }
        );

        payment.subscriptionId = subscription._id;
        await payment.save();

        user.subscription = {
          plan: planName,
          status: 'active',
          startDate: new Date(),
          endDate,
          examsRemaining: plan.limits.examsPerMonth
        };
        await user.save();
      }
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// ============ ANALYTICS ============

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily user registrations
    const usersByDay = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Daily exam attempts
    const attemptsByDay = await ExamAttempt.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$score.total.percentage' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by day
    const revenueByDay = await Payment.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top exams by attempts
    const topExams = await ExamAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$examId', count: { $sum: 1 }, avgScore: { $avg: '$score.total.percentage' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'exams',
          localField: '_id',
          foreignField: '_id',
          as: 'exam'
        }
      },
      { $unwind: '$exam' },
      { $project: { title: '$exam.title', count: 1, avgScore: 1 } }
    ]);

    // Question difficulty analysis
    const questionAnalysis = await Question.aggregate([
      {
        $project: {
          type: 1,
          difficulty: 1,
          topic: 1,
          successRate: {
            $cond: [
              { $eq: ['$timesAnswered', 0] },
              0,
              { $multiply: [{ $divide: ['$timesCorrect', '$timesAnswered'] }, 100] }
            ]
          }
        }
      },
      {
        $group: {
          _id: { type: '$type', difficulty: '$difficulty' },
          count: { $sum: 1 },
          avgSuccessRate: { $avg: '$successRate' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        usersByDay,
        attemptsByDay,
        revenueByDay,
        topExams,
        questionAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};
