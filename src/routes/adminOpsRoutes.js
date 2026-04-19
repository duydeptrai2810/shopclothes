const express = require('express');
const router = express.Router();
const adminOpsController = require('../controllers/adminOpsController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ==========================================
// BẮT BUỘC BẢO MẬT: Mọi API đều phải là Admin
// ==========================================
router.use(protect);
router.use(isAdmin);

// --- LUỒNG ĐƠN HÀNG (ORDERS) ---
router.get('/orders', adminOpsController.getAllOrders);
router.get('/orders/:orderId', adminOpsController.getAdminOrderDetails);
router.put('/orders/:orderId/status', adminOpsController.updateOrderStatus);

// --- LUỒNG NGƯỜI DÙNG (USERS) ---
router.get('/users', adminOpsController.getAllUsers);
router.get('/users/:userId', adminOpsController.getAdminUserDetails);
router.put('/users/:userId/role', adminOpsController.updateUserRoleStatus);

module.exports = router;