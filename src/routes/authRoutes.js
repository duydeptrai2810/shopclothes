const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/google-login', authController.googleLogin);

// API này cần user phải đăng nhập mới đổi được pass
router.put('/change-password', protect, authController.changePassword); 

module.exports = router;