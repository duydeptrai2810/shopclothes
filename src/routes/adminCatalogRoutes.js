const express = require('express');
const router = express.Router();
const adminCatalogController = require('../controllers/adminCatalogController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ==========================================
// BẮT BUỘC BẢO MẬT: Chỉ Admin mới được can thiệp vào cấu hình danh mục
// ==========================================
router.use(protect);
router.use(isAdmin);

// Tham số :type trên URL sẽ quyết định API này thao tác với bảng nào
// Ví dụ: POST /api/admin/catalog/brand, PUT /api/admin/catalog/category/1
router.post('/:type', adminCatalogController.createCatalogItem);
router.put('/:type/:id', adminCatalogController.updateCatalogItem);
router.delete('/:type/:id', adminCatalogController.deleteCatalogItem);

module.exports = router;