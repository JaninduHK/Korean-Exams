const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam');
const User = require('../models/User');
const { incrementExamUsage } = require('../middleware/subscription');

// @desc    Start a new exam attempt
// @route   POST /api/attempts/start
// @access  Private
exports.startAttempt = async (req, res, next) => {
  try {
    const { examId } = req.body;

    // Check if exam exists
    const exam = await Exam.findById(examId)
      .populate('readingQuestions')
      .populate('listeningQuestions');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await ExamAttempt.findOne({
      userId: req.user.id,
      examId,
      status: 'in-progress'
    });

    if (existingAttempt) {
      // Return existing attempt to resume
      return res.status(200).json({
        success: true,
        data: existingAttempt,
        message: 'Resuming existing attempt'
      });
    }

    // Initialize answers array with all questions
    const allQuestions = [
      ...exam.readingQuestions.map((q, i) => ({
        questionId: q._id,
        questionNumber: i + 1,
        selectedAnswer: null,
        isCorrect: false,
        timeTaken: 0,
        audioReplays: 0
      })),
      ...exam.listeningQuestions.map((q, i) => ({
        questionId: q._id,
        questionNumber: exam.readingQuestions.length + i + 1,
        selectedAnswer: null,
        isCorrect: false,
        timeTaken: 0,
        audioReplays: 0
      }))
    ];

    // Create new attempt
    const attempt = await ExamAttempt.create({
      userId: req.user.id,
      examId,
      startTime: new Date(),
      answers: allQuestions,
      timeRemaining: exam.duration.total * 60, // Convert minutes to seconds
      currentSection: 'reading',
      currentQuestionIndex: 0,
      score: {
        reading: { correct: 0, total: exam.readingQuestions.length, percentage: 0 },
        listening: { correct: 0, total: exam.listeningQuestions.length, percentage: 0 },
        total: { correct: 0, total: allQuestions.length, percentage: 0 }
      }
    });

    // Increment exam attempts count and subscription usage
    exam.stats.totalAttempts += 1;
    await exam.save();
    await incrementExamUsage(req.user.id);

    res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save answer for a question
// @route   PUT /api/attempts/:id/answer
// @access  Private
exports.saveAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedAnswer, timeTaken, audioReplays, currentQuestionIndex, timeRemaining } = req.body;

    const attempt = await ExamAttempt.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active attempt not found'
      });
    }

    // Find and update the answer
    const answerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (answerIndex !== -1) {
      attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
      if (timeTaken !== undefined) {
        attempt.answers[answerIndex].timeTaken = timeTaken;
      }
      if (audioReplays !== undefined) {
        attempt.answers[answerIndex].audioReplays = audioReplays;
      }
    }

    // Update current position
    if (currentQuestionIndex !== undefined) {
      attempt.currentQuestionIndex = currentQuestionIndex;
    }

    // Update time remaining
    if (timeRemaining !== undefined) {
      attempt.timeRemaining = timeRemaining;
    }

    attempt.lastSavedAt = new Date();
    await attempt.save();

    res.status(200).json({
      success: true,
      data: {
        answerId: questionId,
        savedAt: attempt.lastSavedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save multiple answers (batch save)
// @route   PUT /api/attempts/:id/answers
// @access  Private
exports.saveAnswers = async (req, res, next) => {
  try {
    const { answers, currentQuestionIndex, timeRemaining, currentSection } = req.body;

    const attempt = await ExamAttempt.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active attempt not found'
      });
    }

    // Update all provided answers
    if (answers && Array.isArray(answers)) {
      answers.forEach(({ questionId, selectedAnswer, timeTaken, audioReplays }) => {
        const answerIndex = attempt.answers.findIndex(
          a => a.questionId.toString() === questionId
        );
        if (answerIndex !== -1) {
          if (selectedAnswer !== undefined) {
            attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
          }
          if (timeTaken !== undefined) {
            attempt.answers[answerIndex].timeTaken = timeTaken;
          }
          if (audioReplays !== undefined) {
            attempt.answers[answerIndex].audioReplays = audioReplays;
          }
        }
      });
    }

    // Update current position and state
    if (currentQuestionIndex !== undefined) {
      attempt.currentQuestionIndex = currentQuestionIndex;
    }
    if (timeRemaining !== undefined) {
      attempt.timeRemaining = timeRemaining;
    }
    if (currentSection !== undefined) {
      attempt.currentSection = currentSection;
    }

    attempt.lastSavedAt = new Date();
    await attempt.save();

    res.status(200).json({
      success: true,
      data: {
        savedAt: attempt.lastSavedAt,
        answersCount: answers?.length || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark/unmark question for review
// @route   PUT /api/attempts/:id/mark
// @access  Private
exports.markQuestion = async (req, res, next) => {
  try {
    const { questionId, marked } = req.body;

    const attempt = await ExamAttempt.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active attempt not found'
      });
    }

    if (marked) {
      // Add to marked questions if not already marked
      if (!attempt.markedQuestions.includes(questionId)) {
        attempt.markedQuestions.push(questionId);
      }
    } else {
      // Remove from marked questions
      attempt.markedQuestions = attempt.markedQuestions.filter(
        id => id.toString() !== questionId
      );
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      data: {
        markedQuestions: attempt.markedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit exam
// @route   PUT /api/attempts/:id/submit
// @access  Private
exports.submitAttempt = async (req, res, next) => {
  try {
    const { timeSpent, timedOut } = req.body;

    let attempt = await ExamAttempt.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active attempt not found'
      });
    }

    // Calculate scores
    await attempt.calculateScore();

    // Update attempt
    attempt.endTime = new Date();
    attempt.status = timedOut ? 'timed-out' : 'completed';
    attempt.timeSpent = timeSpent || Math.floor((attempt.endTime - attempt.startTime) / 1000);

    await attempt.save();

    // Update exam statistics
    const exam = await Exam.findById(attempt.examId);
    if (exam) {
      await exam.updateStats(attempt.score.total.percentage, attempt.passed);
    }

    // Update user statistics
    const user = await User.findById(req.user.id);
    if (user) {
      await user.updateStats(attempt.score.total.percentage, attempt.timeSpent);
    }

    // Populate for response
    attempt = await ExamAttempt.findById(attempt._id)
      .populate('examId', 'title description passScore')
      .populate('answers.questionId');

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attempt details
// @route   GET /api/attempts/:id
// @access  Private
exports.getAttempt = async (req, res, next) => {
  try {
    const attempt = await ExamAttempt.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
      .populate('examId', 'title description passScore duration')
      .populate('answers.questionId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user attempts
// @route   GET /api/attempts
// @access  Private
exports.getUserAttempts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const attempts = await ExamAttempt.find(query)
      .populate('examId', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ExamAttempt.countDocuments(query);

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

// @desc    Get attempt review (with all answers and explanations)
// @route   GET /api/attempts/:id/review
// @access  Private
exports.getAttemptReview = async (req, res, next) => {
  try {
    const attempt = await ExamAttempt.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: { $in: ['completed', 'timed-out'] }
    })
      .populate('examId')
      .populate('answers.questionId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Completed attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Abandon attempt
// @route   PUT /api/attempts/:id/abandon
// @access  Private
exports.abandonAttempt = async (req, res, next) => {
  try {
    const attempt = await ExamAttempt.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
        status: 'in-progress'
      },
      {
        status: 'abandoned',
        endTime: new Date()
      },
      { new: true }
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};
