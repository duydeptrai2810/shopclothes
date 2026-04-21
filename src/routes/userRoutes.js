const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Đảm bảo bạn đã tạo sẵn thư mục 'uploads' trong project
  },
  filename: function (req, file, cb) {
    // Tạo tên file an toàn: tên_field - thời_gian_hiện_tại . đuôi_file
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Tất cả API ở đây đều cần phải đăng nhập (sử dụng protect middleware)
router.get('/profile', protect, userController.getMyProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;