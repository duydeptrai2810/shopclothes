const db = require('../config/db');

// ==========================================
// PHẦN 1: QUẢN LÝ ĐƠN HÀNG (ADMIN ORDERS)
// ==========================================

// 1. Lấy toàn bộ danh sách Đơn hàng trên hệ thống
exports.getAllOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.order_id, o.total_amount, o.status, o.order_date, o.recipient_name, o.recipient_phone,
                u.email, u.username,
                p.payment_method, p.payment_status
            FROM ORDERS o
            LEFT JOIN USER u ON o.user_id = u.user_id
            LEFT JOIN PAYMENT p ON o.order_id = p.order_id
            ORDER BY o.order_date DESC
        `;
        const [orders] = await db.execute(query);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách toàn bộ đơn hàng thành công',
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Xem chi tiết một Đơn hàng bất kỳ
exports.getAdminOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Lấy thông tin chung của Đơn hàng, Thanh toán và Người dùng
        const [orders] = await db.execute(`
            SELECT 
                o.*, 
                u.username, u.email, u.avatar_url,
                p.payment_method, p.payment_status, p.transaction_id
            FROM ORDERS o
            LEFT JOIN USER u ON o.user_id = u.user_id
            LEFT JOIN PAYMENT p ON o.order_id = p.order_id
            WHERE o.order_id = ?
        `, [orderId]);

        if (orders.length === 0) {
            throw new Error('Không tìm thấy đơn hàng này!');
        }

        // Lấy danh sách sản phẩm trong Đơn hàng
        const [items] = await db.execute(`
            SELECT 
                od.order_detail_id, od.quantity, od.unit_price, od.subtotal,
                pv.size, pv.color, pv.sku,
                prod.name AS product_name,
                (SELECT image_url FROM PRODUCT_IMAGES WHERE product_id = prod.product_id AND is_primary = 1 LIMIT 1) AS image_url
            FROM ORDER_DETAIL od
            JOIN PRODUCT_VARIANT pv ON od.variant_id = pv.variant_id
            JOIN PRODUCT prod ON pv.product_id = prod.product_id
            WHERE od.order_id = ?
        `, [orderId]);

        res.status(200).json({
            success: true,
            message: 'Lấy chi tiết đơn hàng quản trị thành công',
            data: {
                orderInfo: orders[0],
                items: items
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 3. Cập nhật trạng thái vòng đời Đơn hàng
exports.updateOrderStatus = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { orderId } = req.params;
        const { status, paymentStatus } = req.body; 
        // Các trạng thái gợi ý: Pending, Processing, Shipped, Delivered, Cancelled

        if (!status) throw new Error('Vui lòng cung cấp trạng thái mới của đơn hàng!');

        await connection.beginTransaction();

        // Kiểm tra trạng thái hiện tại của đơn hàng (Khóa dòng để tránh xung đột)
        const [orders] = await connection.execute('SELECT status FROM ORDERS WHERE order_id = ? FOR UPDATE', [orderId]);
        if (orders.length === 0) throw new Error('Đơn hàng không tồn tại!');
        
        const currentStatus = orders[0].status;

        // NẾU HỦY ĐƠN (từ trạng thái khác chuyển sang Cancelled) -> Phải hoàn lại tồn kho
        if (status === 'Cancelled' && currentStatus !== 'Cancelled') {
            const [items] = await connection.execute('SELECT variant_id, quantity FROM ORDER_DETAIL WHERE order_id = ?', [orderId]);
            for (const item of items) {
                await connection.execute(
                    'UPDATE PRODUCT_VARIANT SET stock_quantity = stock_quantity + ? WHERE variant_id = ?',
                    [item.quantity, item.variant_id]
                );
            }
        } 
        // NẾU PHỤC HỒI ĐƠN (Từ Cancelled chuyển sang trạng thái khác) -> Phải trừ lại tồn kho
        else if (currentStatus === 'Cancelled' && status !== 'Cancelled') {
            const [items] = await connection.execute('SELECT variant_id, quantity FROM ORDER_DETAIL WHERE order_id = ?', [orderId]);
            for (const item of items) {
                // Kiểm tra xem kho còn đủ không trước khi phục hồi
                const [variants] = await connection.execute('SELECT stock_quantity FROM PRODUCT_VARIANT WHERE variant_id = ?', [item.variant_id]);
                if (variants[0].stock_quantity < item.quantity) {
                    throw new Error(`Kho hàng không đủ số lượng để phục hồi đơn này!`);
                }
                await connection.execute(
                    'UPDATE PRODUCT_VARIANT SET stock_quantity = stock_quantity - ? WHERE variant_id = ?',
                    [item.quantity, item.variant_id]
                );
            }
        }

        // Cập nhật trạng thái Đơn hàng
        await connection.execute('UPDATE ORDERS SET status = ? WHERE order_id = ?', [status, orderId]);

        // (Tùy chọn) Cập nhật trạng thái Thanh toán nếu được truyền lên (ví dụ: khi giao thành công thì thu tiền COD)
        if (paymentStatus) {
            await connection.execute('UPDATE PAYMENT SET payment_status = ? WHERE order_id = ?', [paymentStatus, orderId]);
        }

        await connection.commit();
        res.status(200).json({ success: true, message: `Đã cập nhật đơn hàng thành trạng thái: ${status}` });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

// ==========================================
// PHẦN 2: QUẢN LÝ NGƯỜI DÙNG (ADMIN USERS)
// ==========================================

// 4. Lấy danh sách toàn bộ Người dùng
exports.getAllUsers = async (req, res) => {
    try {
        // Mẹo: Không Select password_hash và token để bảo mật
        const query = `
            SELECT 
                user_id, username, email, full_name, phone_number, role, is_active, created_at 
            FROM USER 
            ORDER BY created_at DESC
        `;
        const [users] = await db.execute(query);

        res.status(200).json({ success: true, message: 'Lấy danh sách người dùng thành công', data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Xem chi tiết hồ sơ & lịch sử của một Người dùng
exports.getAdminUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        // 5.1 Thông tin cá nhân
        const [users] = await db.execute(`
            SELECT user_id, username, email, full_name, phone_number, gender, date_of_birth, role, is_active, address, avatar_url, created_at 
            FROM USER WHERE user_id = ?
        `, [userId]);

        if (users.length === 0) throw new Error('Người dùng không tồn tại!');

        // 5.2 Lấy số liệu thống kê (Tổng tiền đã mua, Tổng số đơn)
        const [stats] = await db.execute(`
            SELECT 
                COUNT(order_id) AS total_orders,
                SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END) AS total_spent
            FROM ORDERS WHERE user_id = ?
        `, [userId]);

        res.status(200).json({
            success: true,
            data: {
                profile: users[0],
                stats: stats[0]
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 6. Khóa tài khoản hoặc Cấp quyền Admin cho Người dùng
exports.updateUserRoleStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, isActive } = req.body;

        // Tránh việc Admin tự khóa chính mình hoặc tước quyền chính mình
        if (req.user.userId === parseInt(userId)) {
            throw new Error('Bạn không thể tự thay đổi quyền hoặc tự khóa tài khoản của chính mình!');
        }

        let updates = [];
        let params = [];

        if (role) {
            updates.push('role = ?');
            // Chuẩn hóa role thành viết hoa (ADMIN / CUSTOMER)
            params.push(role.toUpperCase()); 
        }

        if (isActive !== undefined) {
            updates.push('is_active = ?');
            params.push(isActive);
        }

        if (updates.length === 0) throw new Error('Không có dữ liệu cập nhật!');

        params.push(userId);
        
        const query = `UPDATE USER SET ${updates.join(', ')} WHERE user_id = ?`;
        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) throw new Error('Thao tác thất bại!');

        res.status(200).json({ success: true, message: 'Cập nhật tài khoản người dùng thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};