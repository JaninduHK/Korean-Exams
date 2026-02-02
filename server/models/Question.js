const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['reading', 'listening'],
    required: [true, 'Please specify question type']
  },
  questionNumber: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questionText: {
    type: String,
    required: [true, 'Please provide question text']
  },
  questionTextKorean: {
    type: String // Korean version of the question if applicable
  },
  questionImage: {
    type: String // URL to image (Cloudinary or local)
  },
  audioFile: {
    type: String // URL to audio file for listening questions
  },
  audioDuration: {
    type: Number // Duration in seconds
  },
  maxReplays: {
    type: Number,
    default: 2 // Maximum number of times audio can be replayed
  },
  options: [{
    label: {
      type: String,
      enum: ['A', 'B', 'C', 'D', '①', '②', '③', '④'],
      required: true
    },
    text: {
      type: String,
      required: true
    },
    image: String // Optional image for option
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Please specify the correct answer'],
    enum: ['A', 'B', 'C', 'D', '①', '②', '③', '④']
  },
  explanation: {
    type: String // Explanation of the correct answer
  },
  explanationKorean: {
    type: String // Korean explanation
  },
  topic: {
    type: String,
    enum: [
      'workplace-safety',
      'workplace-communication',
      'daily-life',
      'transportation',
      'shopping',
      'health',
      'grammar',
      'vocabulary',
      'reading-comprehension',
      'listening-comprehension',
      'culture',
      'numbers-dates',
      'directions',
      'weather',
      'food',
      'housing',
      'other'
    ],
    default: 'other'
  },
  tags: [String], // Additional tags for filtering
  isActive: {
    type: Boolean,
    default: true
  },
  timesAnswered: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for success rate
QuestionSchema.virtual('successRate').get(function() {
  if (this.timesAnswered === 0) return 0;
  return Math.round((this.timesCorrect / this.timesAnswered) * 100);
});

// Update statistics after answer
QuestionSchema.methods.recordAnswer = async function(isCorrect) {
  this.timesAnswered += 1;
  if (isCorrect) {
    this.timesCorrect += 1;
  }
  await this.save();
};

// Index for efficient queries
QuestionSchema.index({ type: 1, difficulty: 1, topic: 1 });
QuestionSchema.index({ isActive: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
