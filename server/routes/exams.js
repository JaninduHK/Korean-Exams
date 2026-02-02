const express = require('express');
const router = express.Router();
const {
  getExams,
  getExam,
  getExamForTaking,
  getFeaturedExams,
  createExam,
  updateExam,
  deleteExam
} = require('../controllers/examController');
const { protect, adminOnly } = require('../middleware/auth');
const { checkExamAccess } = require('../middleware/subscription');

// Public routes
router.get('/', getExams);
router.get('/featured', getFeaturedExams);
router.get('/:id', getExam);

// Protected routes
router.get('/:id/take', protect, checkExamAccess, getExamForTaking);

// Admin routes
router.post('/', protect, adminOnly, createExam);
router.put('/:id', protect, adminOnly, updateExam);
router.delete('/:id', protect, adminOnly, deleteExam);

module.exports = router;
