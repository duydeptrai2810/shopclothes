const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Tất cả API giỏ hàng đều yêu cầu đăng nhập (xác thực token)
router.use(protect); 

// Cụm API Quản lý Giỏ hàng
router.get('/', cartController.getCart);
router.post('/add', cartController.addItemToCart);
router.put('/update/:cartItemId', cartController.updateItemQuantity);
router.delete('/remove/:cartItemId', cartController.removeItemFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;