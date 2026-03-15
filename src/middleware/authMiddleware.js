const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY_CUA_BAN'; // Đồng bộ với Controller

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Dùng chung một khóa bảo mật
            const decoded = jwt.verify(token, JWT_SECRET); 
            
            req.user = decoded; 
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token' });
    }
};

module.exports = { protect };