const db = require('../config/db');

// ==========================================
// 1. API Lấy thông tin cá nhân (Get My Profile)
// ==========================================
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Lấy từ token sau khi đăng nhập

        // Truy vấn bảng USER của web bán quần áo (không lấy cột password)
        const [users] = await db.execute(
            'SELECT id, username, email, full_name, phone, address, avatar_url, role, created_at FROM USER WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            throw new Error('Không tìm thấy thông tin người dùng!');
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin hồ sơ thành công',
            data: users[0]
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. API Cập nhật thông tin cá nhân (Update Profile)
// ==========================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fullName, phone, address } = req.body;

        // Cập nhật thông tin vào bảng USER
        const [result] = await db.execute(
            'UPDATE USER SET full_name = ?, phone = ?, address = ? WHERE id = ?',
            [fullName, phone, address, userId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Cập nhật thất bại. Người dùng không tồn tại.');
        }

        // Lấy lại dữ liệu sau khi cập nhật để trả về cho Frontend
        const [updatedUsers] = await db.execute(
            'SELECT id, username, email, full_name, phone, address, avatar_url FROM USER WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin cá nhân thành công!',
            data: updatedUsers[0]
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. API Tải lên/Cập nhật Ảnh đại diện (Upload Avatar)
// ==========================================
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;

        // req.file được tạo ra bởi thư viện Multer (sẽ cấu hình ở router)
        if (!req.file) {
            throw new Error('Vui lòng chọn một file ảnh hợp lệ!');
        }

        // Đường dẫn file ảnh sau khi upload lên server
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Lưu đường dẫn ảnh vào database
        await db.execute(
            'UPDATE USER SET avatar_url = ? WHERE id = ?',
            [avatarUrl, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công!',
            data: {
                avatarUrl: avatarUrl
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};