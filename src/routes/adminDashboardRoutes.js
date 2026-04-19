const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ==========================================
// BẮT BUỘC BẢO MẬT: Chỉ Admin mới được xem Báo cáo
// ==========================================
router.use(protect);
router.use(isAdmin);

// --- CỤM BÁO CÁO & THỐNG KÊ ---
router.get('/sales', adminDashboardController.getSalesStatistics);
router.get('/inventory', adminDashboardController.getInventoryStatistics);

module.exports = router;