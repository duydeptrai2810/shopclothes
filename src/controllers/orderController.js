const db = require('../config/db');

// ==========================================
// 1. Xem trước chi tiết Đơn hàng, tính phí ship
// API này đọc giỏ hàng hiện tại và tính toán tổng chi phí trước khi khách bấm Đặt hàng
// ==========================================
exports.previewCheckout = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Lấy giỏ hàng của user
        const [carts] = await db.execute('SELECT cart_id FROM CART WHERE user_id = ?', [userId]);
        if (carts.length === 0) {
            throw new Error('Giỏ hàng của bạn đang trống!');
        }
        const cartId = carts[0].cart_id;

        // Lấy danh sách sản phẩm trong giỏ
        const query = `
            SELECT 
                ci.variant_id, 
                ci.quantity, 
                (p.base_price + IFNULL(pv.price_adjustment, 0)) AS price
            FROM CART_ITEM ci
            JOIN PRODUCT_VARIANT pv ON ci.variant_id = pv.variant_id
            JOIN PRODUCT p ON pv.product_id = p.product_id
            WHERE ci.cart_id = ?
        `;
        const [items] = await db.execute(query, [cartId]);

        if (items.length === 0) {
            throw new Error('Giỏ hàng của bạn đang trống!');
        }

        // Tính tiền hàng
        const subTotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        
        // Tính phí ship (Ví dụ giả lập: Free ship cho đơn > 500k, còn lại đồng giá 30k)
        const shippingFee = subTotal >= 500000 ? 0 : 30000;
        
        // Tổng thanh toán
        const totalAmount = subTotal + shippingFee;

        res.status(200).json({
            success: true,
            message: 'Tính toán chi phí đơn hàng thành công',
            data: {
                subTotal,
                shippingFee,
                totalAmount,
                itemCount: items.length
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Xác nhận Đặt hàng (Place Order) - DÙNG TRANSACTION
// ==========================================
exports.placeOrder = async (req, res) => {
    const connection = await db.getConnection(); // Bắt buộc lấy 1 connection riêng để chạy Transaction
    try {
        const userId = req.user.userId;
        const { shippingAddress, recipientPhone, recipientName, paymentMethod } = req.body;

        if (!shippingAddress || !recipientPhone || !recipientName || !paymentMethod) {
            throw new Error('Vui lòng cung cấp đầy đủ thông tin giao hàng và phương thức thanh toán!');
        }

        await connection.beginTransaction(); // BẮT ĐẦU TRANSACTION

        // 1. Đọc giỏ hàng
        const [carts] = await connection.execute('SELECT cart_id FROM CART WHERE user_id = ?', [userId]);
        if (carts.length === 0) throw new Error('Không tìm thấy giỏ hàng!');
        const cartId = carts[0].cart_id;

        const [items] = await connection.execute(`
            SELECT 
                ci.variant_id, ci.quantity, pv.stock_quantity,
                (p.base_price + IFNULL(pv.price_adjustment, 0)) AS unit_price
            FROM CART_ITEM ci
            JOIN PRODUCT_VARIANT pv ON ci.variant_id = pv.variant_id
            JOIN PRODUCT p ON pv.product_id = p.product_id
            WHERE ci.cart_id = ?
        `, [cartId]);

        if (items.length === 0) throw new Error('Giỏ hàng trống, không thể đặt hàng!');

        // 2. Tính toán tiền và kiểm tra Tồn kho
        let subTotal = 0;
        for (const item of items) {
            if (item.stock_quantity < item.quantity) {
                throw new Error(`Sản phẩm (Biến thể ID: ${item.variant_id}) không đủ số lượng trong kho!`);
            }
            subTotal += Number(item.unit_price) * item.quantity;
        }

        const shippingFee = subTotal >= 500000 ? 0 : 30000;
        const totalAmount = subTotal + shippingFee;

        // 3. Tạo Đơn hàng (Bảng ORDERS)
        const [orderResult] = await connection.execute(
            `INSERT INTO ORDERS (user_id, total_amount, shipping_fee, shipping_address, recipient_phone, recipient_name, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
            [userId, totalAmount, shippingFee, shippingAddress, recipientPhone, recipientName]
        );
        const orderId = orderResult.insertId;

        // 4. Chuyển Cart Item sang Order Detail và Trừ tồn kho
        for (const item of items) {
            const itemSubtotal = Number(item.unit_price) * item.quantity;
            
            // Lưu vào Order Detail
            await connection.execute(
                `INSERT INTO ORDER_DETAIL (order_id, variant_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.variant_id, item.quantity, item.unit_price, itemSubtotal]
            );

            // Trừ tồn kho
            await connection.execute(
                `UPDATE PRODUCT_VARIANT SET stock_quantity = stock_quantity - ? WHERE variant_id = ?`,
                [item.quantity, item.variant_id]
            );
        }

        // 5. Ghi nhận phương thức thanh toán vào bảng PAYMENT
        await connection.execute(
            `INSERT INTO PAYMENT (order_id, payment_method, payment_status) VALUES (?, ?, 'Pending')`,
            [orderId, paymentMethod] // paymentMethod ví dụ: 'COD', 'VNPAY'
        );

        // 6. Xóa giỏ hàng
        await connection.execute('DELETE FROM CART_ITEM WHERE cart_id = ?', [cartId]);

        await connection.commit(); // LƯU THÀNH CÔNG TẤT CẢ VÀO DB
        
        res.status(201).json({ 
            success: true, 
            message: 'Đặt hàng thành công!', 
            data: { orderId, totalAmount } 
        });
    } catch (error) {
        await connection.rollback(); // NẾU CÓ LỖI: HỦY BỎ TOÀN BỘ CÁC BƯỚC Ở TRÊN
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release(); // Nhả kết nối lại cho Pool
    }
};

// ==========================================
// 3. Lấy Lịch sử mua hàng của User
// ==========================================
exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [orders] = await db.execute(`
            SELECT order_id, total_amount, status, order_date 
            FROM ORDERS 
            WHERE user_id = ? 
            ORDER BY order_date DESC
        `, [userId]);

        res.status(200).json({
            success: true,
            message: 'Lấy lịch sử đơn hàng thành công',
            data: orders
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Xem chi tiết và hành trình một Đơn hàng
// ==========================================
exports.getOrderDetail = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.params;

        // Lấy thông tin chung của Đơn hàng và Thanh toán
        const [orders] = await db.execute(`
            SELECT o.*, p.payment_method, p.payment_status 
            FROM ORDERS o
            LEFT JOIN PAYMENT p ON o.order_id = p.order_id
            WHERE o.order_id = ? AND o.user_id = ?
        `, [orderId, userId]);

        if (orders.length === 0) {
            throw new Error('Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn!');
        }

        // Lấy danh sách sản phẩm trong Đơn hàng
        const [details] = await db.execute(`
            SELECT 
                od.order_detail_id, od.quantity, od.unit_price, od.subtotal,
                pv.size, pv.color, 
                p.name AS product_name,
                (SELECT image_url FROM PRODUCT_IMAGES WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) AS image_url
            FROM ORDER_DETAIL od
            JOIN PRODUCT_VARIANT pv ON od.variant_id = pv.variant_id
            JOIN PRODUCT p ON pv.product_id = p.product_id
            WHERE od.order_id = ?
        `, [orderId]);

        res.status(200).json({
            success: true,
            message: 'Lấy chi tiết đơn hàng thành công',
            data: {
                orderInfo: orders[0],
                items: details
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. Hủy Đơn hàng đang chờ xử lý (DÙNG TRANSACTION)
// ==========================================
exports.cancelOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const userId = req.user.userId;
        const { orderId } = req.params;

        await connection.beginTransaction();

        // Kiểm tra xem đơn hàng có phải của user này và đang ở trạng thái Pending không
        const [orders] = await connection.execute(
            'SELECT status FROM ORDERS WHERE order_id = ? AND user_id = ? FOR UPDATE', 
            [orderId, userId]
        );

        if (orders.length === 0) throw new Error('Đơn hàng không tồn tại!');
        if (orders[0].status !== 'Pending') throw new Error('Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ xử lý (Pending)!');

        // Cập nhật trạng thái thành Cancelled
        await connection.execute('UPDATE ORDERS SET status = "Cancelled" WHERE order_id = ?', [orderId]);

        // Lấy danh sách sản phẩm trong đơn để hoàn lại tồn kho
        const [items] = await connection.execute('SELECT variant_id, quantity FROM ORDER_DETAIL WHERE order_id = ?', [orderId]);

        // Hoàn tồn kho
        for (const item of items) {
            await connection.execute(
                'UPDATE PRODUCT_VARIANT SET stock_quantity = stock_quantity + ? WHERE variant_id = ?',
                [item.quantity, item.variant_id]
            );
        }

        // Cập nhật trạng thái thanh toán thành Cancelled
        await connection.execute('UPDATE PAYMENT SET payment_status = "Cancelled" WHERE order_id = ?', [orderId]);

        await connection.commit();
        
        res.status(200).json({ success: true, message: 'Đã hủy đơn hàng thành công!' });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};