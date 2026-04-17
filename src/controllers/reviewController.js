const db = require('../config/db');

// ==========================================
// 1. Lấy danh sách Đánh giá của một Sản phẩm
// API này không cần đăng nhập (Ai cũng xem được)
// ==========================================
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // Lấy danh sách đánh giá kèm thông tin user
        const query = `
            SELECT 
                r.review_id, r.rating, r.comment, r.created_at,
                u.username, u.avatar_url, u.full_name
            FROM REVIEW r
            JOIN USER u ON r.user_id = u.user_id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `;
        const [reviews] = await db.execute(query, [productId]);

        // Tính toán thông kê số sao trung bình
        let averageRating = 0;
        let totalReviews = reviews.length;
        if (totalReviews > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (sum / totalReviews).toFixed(1); // Làm tròn 1 chữ số thập phân
        }

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách đánh giá thành công',
            data: {
                summary: {
                    averageRating: Number(averageRating),
                    totalReviews
                },
                reviews
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Gửi Đánh giá & Chấm điểm mới (Submit)
// Yêu cầu đăng nhập & Phải từng mua hàng
// ==========================================
exports.submitReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderDetailId, rating, comment } = req.body;

        if (!orderDetailId || !rating || rating < 1 || rating > 5) {
            throw new Error('Vui lòng cung cấp mã chi tiết đơn hàng và số sao (từ 1 đến 5)!');
        }

        // 1. Kiểm tra xem người dùng có thực sự sở hữu món hàng này không
        // Truy vấn ngược từ order_detail_id -> order_id (lấy user_id) và variant_id (lấy product_id)
        const [purchases] = await db.execute(`
            SELECT o.user_id, o.status, pv.product_id 
            FROM ORDER_DETAIL od
            JOIN ORDERS o ON od.order_id = o.order_id
            JOIN PRODUCT_VARIANT pv ON od.variant_id = pv.variant_id
            WHERE od.order_detail_id = ?
        `, [orderDetailId]);

        if (purchases.length === 0) {
            throw new Error('Không tìm thấy thông tin mua hàng hợp lệ!');
        }

        const purchase = purchases[0];

        // Bảo mật: Đảm bảo chi tiết đơn hàng này thuộc về user đang đăng nhập
        if (purchase.user_id !== userId) {
            throw new Error('Bạn không có quyền đánh giá sản phẩm này!');
        }

        // (Tùy chọn nâng cao): Chỉ cho phép đánh giá nếu trạng thái đơn là Hoàn Thành/Delivered
        // if (purchase.status !== 'Completed' && purchase.status !== 'Delivered') {
        //     throw new Error('Bạn chỉ có thể đánh giá sau khi đơn hàng đã giao thành công!');
        // }

        // 2. Ràng buộc UNIQUE: Kiểm tra xem đã đánh giá món này chưa
        const [existingReviews] = await db.execute(
            'SELECT review_id FROM REVIEW WHERE order_detail_id = ?',
            [orderDetailId]
        );
        if (existingReviews.length > 0) {
            throw new Error('Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi!');
        }

        // 3. Tiến hành lưu đánh giá
        await db.execute(
            'INSERT INTO REVIEW (user_id, product_id, order_detail_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [userId, purchase.product_id, orderDetailId, rating, comment || '']
        );

        res.status(201).json({ success: true, message: 'Cảm ơn bạn đã gửi đánh giá!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Chỉnh sửa Đánh giá
// ==========================================
exports.updateReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            throw new Error('Số sao phải nằm trong khoảng từ 1 đến 5!');
        }

        // Cập nhật (Kèm theo điều kiện user_id để đảm bảo chỉ chủ nhân mới được sửa)
        const [result] = await db.execute(
            'UPDATE REVIEW SET rating = COALESCE(?, rating), comment = COALESCE(?, comment) WHERE review_id = ? AND user_id = ?',
            [rating, comment, reviewId, userId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Cập nhật thất bại. Đánh giá không tồn tại hoặc bạn không có quyền sửa!');
        }

        res.status(200).json({ success: true, message: 'Đã cập nhật đánh giá thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Xóa/Ẩn Đánh giá của bản thân
// LƯU Ý: Vì Database của bạn không có cột is_hidden, ta sẽ dùng Delete cứng (Xóa hẳn khỏi DB).
// ==========================================
exports.deleteReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { reviewId } = req.params;

        const [result] = await db.execute(
            'DELETE FROM REVIEW WHERE review_id = ? AND user_id = ?',
            [reviewId, userId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Xóa thất bại. Đánh giá không tồn tại hoặc bạn không có quyền xóa!');
        }

        res.status(200).json({ success: true, message: 'Đã xóa đánh giá thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};