const express = require('express');
const router = express.Router();
const {
  startAttempt,
  saveAnswer,
  saveAnswers,
  markQuestion,
  submitAttempt,
  getAttempt,
  getUserAttempts,
  getAttemptReview,
  abandonAttempt
} = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');
const { checkExamAccess, checkReviewAccess } = require('../middleware/subscription');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getUserAttempts)
  .post(checkExamAccess, startAttempt);

router.post('/start', checkExamAccess, startAttempt);

router.route('/:id')
  .get(getAttempt);

router.put('/:id/answer', saveAnswer);
router.put('/:id/answers', saveAnswers);
router.put('/:id/mark', markQuestion);
router.put('/:id/submit', submitAttempt);
router.put('/:id/abandon', abandonAttempt);
router.get('/:id/review', checkReviewAccess, getAttemptReview);

module.exports = router;
