const express = require('express');
const router = express.Router();
const adminProductController = require('../controllers/adminProductController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ==========================================
// BẮT BUỘC BẢO MẬT: Tất cả API ở đây đều phải là Admin
// ==========================================
router.use(protect);
router.use(isAdmin);

// --- Thao tác với SẢN PHẨM GỐC ---
router.get('/', adminProductController.getAllAdminProducts);
router.post('/', adminProductController.createBaseProduct);
router.put('/:productId', adminProductController.updateBaseProduct);
router.put('/:productId/status', adminProductController.toggleProductStatus); // Ẩn/Hiện sản phẩm

// --- Thao tác với BIẾN THỂ (Variant) ---
router.post('/:productId/variants', adminProductController.addProductVariant);
router.put('/variants/:variantId', adminProductController.updateVariant);
router.delete('/variants/:variantId', adminProductController.deleteVariant);

module.exports = router;