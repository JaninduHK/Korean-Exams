const Exam = require('../models/Exam');
const Question = require('../models/Question');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Public
exports.getExams = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };

    if (req.query.difficulty && req.query.difficulty !== 'all') {
      query.difficulty = req.query.difficulty;
    }

    if (req.query.examType && req.query.examType !== 'all') {
      query.examType = req.query.examType;
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const exams = await Exam.find(query)
      .select('-readingQuestions -listeningQuestions')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Exam.countDocuments(query);

    res.status(200).json({
      success: true,
      data: exams,
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

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Public (but questions only for authenticated users)
exports.getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('readingQuestions')
      .populate('listeningQuestions');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exam for taking (with questions but without answers)
// @route   GET /api/exams/:id/take
// @access  Private
exports.getExamForTaking = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: 'readingQuestions',
        select: '-correctAnswer -explanation -explanationKorean'
      })
      .populate({
        path: 'listeningQuestions',
        select: '-correctAnswer -explanation -explanationKorean'
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    if (!exam.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This exam is not currently available'
      });
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured/recommended exams
// @route   GET /api/exams/featured
// @access  Public
exports.getFeaturedExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ isActive: true, isFeatured: true })
      .select('-readingQuestions -listeningQuestions')
      .sort({ order: 1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: exams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create exam (Admin only)
// @route   POST /api/exams
// @access  Private/Admin
exports.createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create(req.body);

    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam (Admin only)
// @route   PUT /api/exams/:id
// @access  Private/Admin
exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete exam (Admin only)
// @route   DELETE /api/exams/:id
// @access  Private/Admin
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
