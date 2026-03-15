const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db'); // Đảm bảo đã đổi sang mysql2/promise ở bước trước

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY_CUA_BAN';
const JWT_EXPIRATION = '1h';
const REFRESH_TOKEN_EXPIRATION = '7d';

// Hàm hỗ trợ tạo Token
const generateToken = (userId, email, role) => {
    return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

// ==========================================
// 1. API Đăng ký tài khoản (Register)
// ==========================================
exports.register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        if (!email || !password || !username) {
            throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
        }

        const [existingUser] = await db.execute('SELECT id FROM USER WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            throw new Error('Email này đã được sử dụng!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            `INSERT INTO USER (username, email, password, phone, role) VALUES (?, ?, ?, ?, 'CUSTOMER')`,
            [username, email, hashedPassword, phone || null]
        );

        res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. API Đăng nhập & Cấp Token (Login)
// ==========================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute('SELECT * FROM USER WHERE email = ?', [email]);
        if (users.length === 0) {
            throw new Error('Tài khoản không tồn tại!');
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Mật khẩu không chính xác!');
        }

        const token = generateToken(user.id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Lưu Refresh Token vào DB
        await db.execute('UPDATE USER SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            data: { accessToken: token, refreshToken, user: { id: user.id, username: user.username, email: user.email, role: user.role } }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. API Đăng xuất (Logout)
// ==========================================
exports.logout = async (req, res) => {
    try {
        // ID lấy từ token do authMiddleware cung cấp
        const userId = req.user.userId; 

        // Xóa refresh_token trong database để vô hiệu hóa phiên đăng nhập
        await db.execute('UPDATE USER SET refresh_token = NULL WHERE id = ?', [userId]);

        res.status(200).json({ success: true, message: 'Đăng xuất thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. API Quên mật khẩu & Gửi mã (Forgot Password)
// ==========================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const [users] = await db.execute('SELECT id, email FROM USER WHERE email = ?', [email]);
        if (users.length === 0) {
            throw new Error('Không tìm thấy tài khoản với email này!');
        }

        const user = users[0];

        // Tạo mã token reset ngẫu nhiên
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Cần cột reset_password_token và reset_password_expires trong DB (Hạn 15 phút)
        const expireTime = new Date(Date.now() + 15 * 60 * 1000); 

        await db.execute(
            'UPDATE USER SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetToken, expireTime, user.id]
        );

        // Ở đây bạn sẽ tích hợp Nodemailer để gửi email. Tạm thời trả về token để test.
        res.status(200).json({ 
            success: true, 
            message: 'Hướng dẫn khôi phục mật khẩu đã được gửi vào email của bạn!',
            resetToken: resetToken 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. API Đặt lại mật khẩu mới (Reset Password)
// ==========================================
exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Tìm user có token khớp và chưa hết hạn
        const [users] = await db.execute(
            'SELECT id FROM USER WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [resetToken]
        );

        if (users.length === 0) {
            throw new Error('Mã xác nhận không hợp lệ hoặc đã hết hạn!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật pass mới và xóa bỏ token reset
        await db.execute(
            'UPDATE USER SET password = ?, reset_password_token = NULL, reset_password_expires = NULL, refresh_token = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );

        res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 6. API Đổi mật khẩu khi đang đăng nhập (Change Password)
// ==========================================
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;

        const [users] = await db.execute('SELECT password FROM USER WHERE id = ?', [userId]);
        if (users.length === 0) {
            throw new Error('Người dùng không tồn tại!');
        }

        const isMatch = await bcrypt.compare(oldPassword, users[0].password);
        if (!isMatch) {
            throw new Error('Mật khẩu cũ không chính xác!');
        }

        const isSame = await bcrypt.compare(newPassword, users[0].password);
        if (isSame) {
            throw new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu và đăng xuất mọi thiết bị (xóa refresh_token)
        await db.execute(
            'UPDATE USER SET password = ?, refresh_token = NULL WHERE id = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};