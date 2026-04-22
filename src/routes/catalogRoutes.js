const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

// ==========================================
// CỤM API PUBLIC: Khám phá Danh mục, Thương hiệu
// Mở công khai cho Frontend hiển thị Menu & Bộ lọc
// ==========================================

// 1. Lấy danh sách Danh mục (Có dựng cây phân cấp nếu có parent_id)
router.get('/categories', catalogController.getCategoriesHierarchy);

// 2. Lấy danh sách Thương hiệu đang hoạt động
router.get('/brands', catalogController.getActiveBrands);

// 3. Lấy danh sách Phong cách (Styles)
router.get('/styles', catalogController.getStyles);

// 4. Lấy chi tiết của một đối tượng cụ thể (Ví dụ: /api/catalog/category/1)
router.get('/:type/:id', catalogController.getCatalogDetail);

module.exports = router;