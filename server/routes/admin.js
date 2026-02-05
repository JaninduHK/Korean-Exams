const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { checkAnalyticsAccess } = require('../middleware/subscription');
const { uploadAudio, uploadImage } = require('../middleware/upload');
const {
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserSubscription,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  uploadAudioFile,
  uploadImageFile,
  getExams,
  getExamDetails,
  createExam,
  updateExam,
  deleteExam,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getPayments,
  updatePayment,
  createPayment,
  getAnalytics
} = require('../controllers/adminController');

// All routes require admin auth
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/analytics', checkAnalyticsAccess, getAnalytics);

// User Management
router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/users/:id/subscription', updateUserSubscription);

// File Upload
router.post('/upload/audio', uploadAudio, uploadAudioFile);
router.post('/upload/image', uploadImage, uploadImageFile);

// Question Management
router.route('/questions')
  .get(getQuestions)
  .post(createQuestion);

router.post('/questions/bulk', bulkCreateQuestions);

router.route('/questions/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);

// Exam Management
router.route('/exams')
  .get(getExams)
  .post(createExam);

router.route('/exams/:id')
  .get(getExamDetails)
  .put(updateExam)
  .delete(deleteExam);

// Subscription Plans
router.route('/plans')
  .get(getPlans)
  .post(createPlan);

router.route('/plans/:id')
  .put(updatePlan)
  .delete(deletePlan);

// Payments/Orders
router.route('/payments')
  .get(getPayments)
  .post(createPayment);

router.route('/payments/:id')
  .put(updatePayment);

module.exports = router;
