const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getStats,
  getActivity,
  deleteAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.get('/stats', getStats);
router.get('/activity', getActivity);
router.delete('/account', deleteAccount);

module.exports = router;
