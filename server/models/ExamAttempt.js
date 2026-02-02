const mongoose = require('mongoose');

const ExamAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  currentSection: {
    type: String,
    enum: ['reading', 'listening'],
    default: 'reading'
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    questionNumber: Number,
    selectedAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D', '①', '②', '③', '④', null],
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    timeTaken: {
      type: Number, // seconds spent on this question
      default: 0
    },
    audioReplays: {
      type: Number,
      default: 0
    }
  }],
  score: {
    reading: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 20 },
      percentage: { type: Number, default: 0 }
    },
    listening: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 20 },
      percentage: { type: Number, default: 0 }
    },
    total: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 40 },
      percentage: { type: Number, default: 0 }
    }
  },
  passed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'timed-out'],
    default: 'in-progress'
  },
  timeSpent: {
    type: Number, // total seconds
    default: 0
  },
  timeRemaining: {
    type: Number, // seconds remaining when last saved
    default: 0
  },
  markedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  topicPerformance: [{
    topic: String,
    correct: Number,
    total: Number,
    percentage: Number
  }],
  lastSavedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate score when exam is submitted
// passScore: the minimum percentage required to pass (from exam settings)
ExamAttemptSchema.methods.calculateScore = async function(passScore = 60) {
  const Question = mongoose.model('Question');

  let readingCorrect = 0;
  let readingTotal = 0;
  let listeningCorrect = 0;
  let listeningTotal = 0;

  const topicStats = {};

  for (const answer of this.answers) {
    const question = await Question.findById(answer.questionId);
    if (!question) continue;

    const isCorrect = answer.selectedAnswer === question.correctAnswer;
    answer.isCorrect = isCorrect;

    if (question.type === 'reading') {
      readingTotal++;
      if (isCorrect) readingCorrect++;
    } else {
      listeningTotal++;
      if (isCorrect) listeningCorrect++;
    }

    // Track topic performance
    const topic = question.topic || 'other';
    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }
    topicStats[topic].total++;
    if (isCorrect) topicStats[topic].correct++;

    // Update question statistics
    await question.recordAnswer(isCorrect);
  }

  // Calculate scores
  this.score.reading.correct = readingCorrect;
  this.score.reading.total = readingTotal;
  this.score.reading.percentage = readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 100) : 0;

  this.score.listening.correct = listeningCorrect;
  this.score.listening.total = listeningTotal;
  this.score.listening.percentage = listeningTotal > 0 ? Math.round((listeningCorrect / listeningTotal) * 100) : 0;

  const totalCorrect = readingCorrect + listeningCorrect;
  const totalQuestions = readingTotal + listeningTotal;

  this.score.total.correct = totalCorrect;
  this.score.total.total = totalQuestions;
  this.score.total.percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Determine pass/fail using the exam's configured pass score
  this.passed = this.score.total.percentage >= passScore;

  // Set topic performance
  this.topicPerformance = Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    correct: stats.correct,
    total: stats.total,
    percentage: Math.round((stats.correct / stats.total) * 100)
  }));

  return this;
};

// Index for efficient queries
ExamAttemptSchema.index({ userId: 1, status: 1 });
ExamAttemptSchema.index({ examId: 1 });
ExamAttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ExamAttempt', ExamAttemptSchema);
