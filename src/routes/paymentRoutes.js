const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// 1. API dành cho Khách hàng: Bắt buộc Đăng nhập mới được tạo phiên thanh toán
router.post('/create-intent', protect, paymentController.createPaymentIntent);

// 2. Webhook: BẮT BUỘC PUBLIC (Không có middleware bảo vệ)
// Để bạn có thể dùng Postman giả lập ngân hàng gọi thẳng vào hệ thống
router.post('/webhook', paymentController.paymentWebhook);

// 3. API dành cho Admin: Bắt buộc phải là Admin mới được phép ấn nút Hoàn tiền
router.post('/refund/:orderId', protect, isAdmin, paymentController.requestRefund);

module.exports = router;