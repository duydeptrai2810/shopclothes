const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY_CUA_BAN';
const JWT_EXPIRATION = '1h';
const REFRESH_TOKEN_EXPIRATION = '7d';

const generateToken = (userId, email, role) => {
    return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        if (!email || !password || !username) {
            throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
        }

        const [existingUser] = await db.execute('SELECT user_id FROM USER WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            throw new Error('Email này đã được sử dụng!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            `INSERT INTO USER (username, email, password_hash, phone_number, role) VALUES (?, ?, ?, ?, 'CUSTOMER')`,
            [username, email, hashedPassword, phone || null]
        );

        res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute('SELECT * FROM USER WHERE email = ?', [email]);
        if (users.length === 0) {
            throw new Error('Tài khoản không tồn tại!');
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Mật khẩu không chính xác!');
        }

        const token = generateToken(user.user_id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.user_id);

        await db.execute('UPDATE USER SET refresh_token = ? WHERE user_id = ?', [refreshToken, user.user_id]);

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            data: { accessToken: token, refreshToken, user: { id: user.user_id, username: user.username, email: user.email, role: user.role } }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const userId = req.user.userId; 
        await db.execute('UPDATE USER SET refresh_token = NULL WHERE user_id = ?', [userId]);
        res.status(200).json({ success: true, message: 'Đăng xuất thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const [users] = await db.execute('SELECT user_id, email FROM USER WHERE email = ?', [email]);
        if (users.length === 0) {
            throw new Error('Không tìm thấy tài khoản với email này!');
        }

        const user = users[0];
        const resetToken = crypto.randomBytes(20).toString('hex');
        const expireTime = new Date(Date.now() + 15 * 60 * 1000); 

        await db.execute(
            'UPDATE USER SET reset_password_token = ?, reset_password_expires = ? WHERE user_id = ?',
            [resetToken, expireTime, user.user_id]
        );

        res.status(200).json({ 
            success: true, 
            message: 'Hướng dẫn khôi phục mật khẩu đã được gửi vào email của bạn!',
            resetToken: resetToken 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        const [users] = await db.execute(
            'SELECT user_id FROM USER WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [resetToken]
        );

        if (users.length === 0) {
            throw new Error('Mã xác nhận không hợp lệ hoặc đã hết hạn!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.execute(
            'UPDATE USER SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL, refresh_token = NULL WHERE user_id = ?',
            [hashedPassword, users[0].user_id]
        );

        res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;

        const [users] = await db.execute('SELECT password_hash FROM USER WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            throw new Error('Người dùng không tồn tại!');
        }

        const isMatch = await bcrypt.compare(oldPassword, users[0].password_hash);
        if (!isMatch) {
            throw new Error('Mật khẩu cũ không chính xác!');
        }

        const isSame = await bcrypt.compare(newPassword, users[0].password_hash);
        if (isSame) {
            throw new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.execute(
            'UPDATE USER SET password_hash = ?, refresh_token = NULL WHERE user_id = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const { OAuth2Client } = require('google-auth-library');
// THAY CHUỖI CLIENT_ID CỦA BẠN VÀO ĐÂY:
const client = new OAuth2Client('183837234413-fugqaldelm9s2b8kiho214aocs34osl2.apps.googleusercontent.com'); 

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body; // Frontend sẽ gửi token này lên

        // 1. Nhờ Google xác minh xem token này có chuẩn không
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '183837234413-fugqaldelm9s2b8kiho214aocs34osl2.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload; // Lấy thông tin từ Google

        // 2. Kiểm tra xem email này đã có trong Database của mình chưa
        const [users] = await db.execute('SELECT * FROM USER WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            // NẾU CHƯA CÓ: Tự động tạo tài khoản mới cho họ
            // Vì mật khẩu là bắt buộc trong DB, ta tạo 1 mật khẩu ngẫu nhiên rất dài mà họ không cần nhớ
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            const [result] = await db.execute(
                `INSERT INTO USER (username, email, password_hash, full_name, avatar_url, role) VALUES (?, ?, ?, ?, ?, 'CUSTOMER')`,
                [name, email, hashedPassword, name, picture]
            );
            user = { user_id: result.insertId, email: email, username: name, role: 'CUSTOMER' };
        } else {
            // NẾU ĐÃ CÓ: Lấy thông tin user đó ra
            user = users[0];
        }

        // 3. Tạo Token của riêng trang web mình và cho phép đăng nhập
        const jwtToken = generateToken(user.user_id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.user_id);

        await db.execute('UPDATE USER SET refresh_token = ? WHERE user_id = ?', [refreshToken, user.user_id]);

        res.status(200).json({
            success: true,
            message: 'Đăng nhập Google thành công!',
            data: { accessToken: jwtToken, refreshToken, user: { id: user.user_id, username: user.username, email: user.email, role: user.role } }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Xác thực Google thất bại: ' + error.message });
    }
};