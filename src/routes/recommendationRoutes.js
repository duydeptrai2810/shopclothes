const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// 1. Ghi nhận hành vi (Public hoặc Private đều được)
// Dùng middleware linh hoạt: không bắt buộc chặng lỗi nếu không có token
router.post('/track', (req, res, next) => {
    // Nếu có token thì lấy userId, không thì bỏ qua
    if (req.headers.authorization) {
        return protect(req, res, next);
    }
    next();
}, recommendationController.trackUserAction);

// 2. Sản phẩm liên quan (Ai cũng xem được)
router.get('/related/:productId', recommendationController.getRelatedProducts);

// 3. Sản phẩm cá nhân hóa (Bắt buộc phải đăng nhập để biết là ai)
router.get('/personalized', protect, recommendationController.getPersonalizedRecommendations);

module.exports = router;