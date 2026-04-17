const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// API Public: Xem danh sách đánh giá của 1 sản phẩm không cần đăng nhập
router.get('/product/:productId', reviewController.getProductReviews);

// Cụm API thao tác với đánh giá (BẮT BUỘC ĐĂNG NHẬP)
router.use(protect); 
router.post('/', reviewController.submitReview);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;