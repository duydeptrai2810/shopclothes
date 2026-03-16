const db = require('../config/db');

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId; 

        // Alias user_id thành id để Frontend vẫn dùng data.id bình thường
        const [users] = await db.execute(
            'SELECT user_id as id, username, email, full_name, phone_number as phone, address, avatar_url, role, created_at FROM USER WHERE user_id = ?',
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

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fullName, phone, address } = req.body;

        const [result] = await db.execute(
            'UPDATE USER SET full_name = ?, phone_number = ?, address = ? WHERE user_id = ?',
            [fullName, phone, address, userId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Cập nhật thất bại. Người dùng không tồn tại.');
        }

        const [updatedUsers] = await db.execute(
            'SELECT user_id as id, username, email, full_name, phone_number as phone, address, avatar_url FROM USER WHERE user_id = ?',
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

exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) {
            throw new Error('Vui lòng chọn một file ảnh hợp lệ!');
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        await db.execute(
            'UPDATE USER SET avatar_url = ? WHERE user_id = ?',
            [avatarUrl, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công!',
            data: { avatarUrl: avatarUrl }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};