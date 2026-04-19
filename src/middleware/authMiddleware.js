const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY_CUA_BAN'; // Đồng bộ với Controller

// ==========================================
// 1. Trạm kiểm soát Đăng nhập (Yêu cầu có Token hợp lệ)
// ==========================================
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Dùng chung một khóa bảo mật để giải mã
            const decoded = jwt.verify(token, JWT_SECRET); 
            
            // Gắn thông tin giải mã được (userId, email, role) vào req.user
            req.user = decoded; 
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Không có quyền truy cập, token không hợp lệ hoặc đã hết hạn' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập, không tìm thấy token' });
    }
};

// ==========================================
// 2. Trạm kiểm soát Quản trị viên (Yêu cầu Role là ADMIN)
// LƯU Ý: Middleware này phải được đặt SAU middleware `protect` ở trong Route
// ==========================================
const isAdmin = (req, res, next) => {
    // Kiểm tra xem req.user đã tồn tại (do protect truyền sang) và role có phải là ADMIN không
    // Dùng toUpperCase() để đảm bảo khớp dù database lưu là 'admin' hay 'ADMIN'
    if (req.user && req.user.role && req.user.role.toUpperCase() === 'ADMIN') {
        next(); // Hợp lệ -> Cho đi tiếp vào Controller
    } else {
        // Lỗi 403 (Forbidden) - Đã biết bạn là ai nhưng bạn không có quyền
        res.status(403).json({ 
            success: false, 
            message: 'Từ chối truy cập: Bạn không có quyền Quản trị viên!' 
        });
    }
};

module.exports = { protect, isAdmin };