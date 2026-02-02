const User = require('../models/User');
const ExamAttempt = require('../models/ExamAttempt');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      'profile.targetExamDate': req.body.targetExamDate,
      'profile.studyHoursPerWeek': req.body.studyHoursPerWeek,
      'profile.preferredLanguage': req.body.preferredLanguage
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Get recent attempts for more detailed stats
    const recentAttempts = await ExamAttempt.find({
      userId: req.user.id,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('examId', 'title');

    // Calculate weekly progress
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyAttempts = await ExamAttempt.countDocuments({
      userId: req.user.id,
      status: 'completed',
      createdAt: { $gte: weekAgo }
    });

    // Calculate improvement
    let improvement = 0;
    if (recentAttempts.length >= 2) {
      const recentScore = recentAttempts[0].score.total.percentage;
      const olderScore = recentAttempts[recentAttempts.length - 1].score.total.percentage;
      improvement = recentScore - olderScore;
    }

    // Get topic-wise performance from recent attempts
    const topicPerformance = {};
    recentAttempts.forEach(attempt => {
      attempt.topicPerformance?.forEach(tp => {
        if (!topicPerformance[tp.topic]) {
          topicPerformance[tp.topic] = { correct: 0, total: 0 };
        }
        topicPerformance[tp.topic].correct += tp.correct;
        topicPerformance[tp.topic].total += tp.total;
      });
    });

    const topicStats = Object.entries(topicPerformance).map(([topic, stats]) => ({
      topic,
      percentage: Math.round((stats.correct / stats.total) * 100),
      total: stats.total
    })).sort((a, b) => a.percentage - b.percentage);

    res.status(200).json({
      success: true,
      data: {
        stats: user.stats,
        subscription: user.subscription,
        weeklyExams: weeklyAttempts,
        improvement,
        weakTopics: topicStats.slice(0, 3),
        strongTopics: topicStats.slice(-3).reverse(),
        recentScores: recentAttempts.map(a => ({
          examTitle: a.examId?.title,
          score: a.score.total.percentage,
          date: a.createdAt,
          passed: a.passed
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
exports.getActivity = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const attempts = await ExamAttempt.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('examId', 'title difficulty');

    const total = await ExamAttempt.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: attempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    // Delete user's exam attempts
    await ExamAttempt.deleteMany({ userId: req.user.id });

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
