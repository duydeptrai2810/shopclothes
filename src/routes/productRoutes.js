const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// API Public: Xem, Lọc và Phân trang (VD: /api/products?categoryId=2&sort=price_asc&page=1)
router.get('/', productController.getProducts);

// API Public: Tìm kiếm từ khóa (VD: /api/products/search?keyword=áo thun)
router.get('/search', productController.searchProducts);

// API Public: Xem chi tiết 1 sản phẩm
router.get('/:productId', productController.getProductDetails);

module.exports = router;