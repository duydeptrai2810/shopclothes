const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// TẤT CẢ các thao tác liên quan đến Đơn hàng đều bắt buộc Đăng nhập
router.use(protect); 

// Cụm API Quản lý Đơn hàng (Checkout & Orders)
router.get('/preview', orderController.previewCheckout);
router.post('/place', orderController.placeOrder);
router.get('/history', orderController.getOrderHistory);
router.get('/details/:orderId', orderController.getOrderDetail);
router.put('/cancel/:orderId', orderController.cancelOrder);

module.exports = router;