const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'lifetime'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    },
    examsRemaining: {
      type: Number,
      default: 2 // free tier: 2 exams / month; subscription records override
    }
  },
  profile: {
    targetExamDate: Date,
    studyHoursPerWeek: Number,
    preferredLanguage: {
      type: String,
      default: 'en'
    }
  },
  stats: {
    totalExams: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0 // in seconds
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    lastStudyDate: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'default-secret-change-this',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Update stats after exam completion
UserSchema.methods.updateStats = async function(score, timeSpent) {
  const totalScoreSum = this.stats.averageScore * this.stats.totalExams + score;
  this.stats.totalExams += 1;
  this.stats.averageScore = totalScoreSum / this.stats.totalExams;
  this.stats.totalStudyTime += timeSpent;

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (this.stats.lastStudyDate) {
    const lastStudy = new Date(this.stats.lastStudyDate);
    lastStudy.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.stats.currentStreak += 1;
    } else if (diffDays > 1) {
      this.stats.currentStreak = 1;
    }
  } else {
    this.stats.currentStreak = 1;
  }

  this.stats.lastStudyDate = new Date();
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);
