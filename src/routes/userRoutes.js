const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Cấu hình Multer để upload file ảnh vào thư mục 'uploads/'
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

// Tất cả API ở đây đều cần phải đăng nhập (sử dụng protect middleware)
router.get('/profile', protect, userController.getMyProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;