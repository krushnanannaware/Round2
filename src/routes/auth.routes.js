const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
} = require('../controllers/auth.controller');

const { signupValidator, loginValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
