const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide exam title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  examType: {
    type: String,
    enum: ['full', 'reading-only', 'listening-only', 'practice'],
    default: 'full'
  },
  readingQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  listeningQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  duration: {
    reading: {
      type: Number,
      default: 50 // minutes
    },
    listening: {
      type: Number,
      default: 30 // minutes
    },
    total: {
      type: Number,
      default: 80 // minutes
    }
  },
  totalQuestions: {
    type: Number,
    default: 80
  },
  questionsPerSection: {
    reading: {
      type: Number,
      default: 40
    },
    listening: {
      type: Number,
      default: 40
    }
  },
  passScore: {
    type: Number,
    default: 60 // percentage
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0 // For sorting exams
  },
  tags: [String],
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    completedAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    passRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Update exam statistics (called when exam is submitted/completed)
// Note: totalAttempts is incremented in startAttempt, not here
ExamSchema.methods.updateStats = async function(score, passed) {
  const totalScoreSum = this.stats.averageScore * this.stats.completedAttempts + score;
  this.stats.completedAttempts += 1;
  this.stats.averageScore = totalScoreSum / this.stats.completedAttempts;

  // Update pass rate
  const passedCount = (this.stats.passRate / 100) * (this.stats.completedAttempts - 1) + (passed ? 1 : 0);
  this.stats.passRate = (passedCount / this.stats.completedAttempts) * 100;

  await this.save();
};

// Virtual to get total duration
ExamSchema.virtual('totalDuration').get(function() {
  return this.duration.reading + this.duration.listening;
});

// Index for efficient queries
ExamSchema.index({ isActive: 1, difficulty: 1 });
ExamSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Exam', ExamSchema);
