const db = require('../config/db');

// ==========================================
// 1. Tạo phiên thanh toán và lấy mã giao dịch ẢO
// ==========================================
exports.createPaymentIntent = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId, paymentMethod } = req.body; 
        // paymentMethod có thể truyền lên: 'VNPAY_SANDBOX', 'MOMO_TEST', 'VIRTUAL_WALLET'

        if (!orderId || !paymentMethod) {
            throw new Error('Vui lòng cung cấp mã đơn hàng và phương thức thanh toán!');
        }

        // 1. Kiểm tra đơn hàng có hợp lệ và thuộc về user không
        const [orders] = await db.execute(
            'SELECT total_amount, status FROM ORDERS WHERE order_id = ? AND user_id = ?', 
            [orderId, userId]
        );

        if (orders.length === 0) throw new Error('Đơn hàng không tồn tại!');
        if (orders[0].status !== 'Pending') throw new Error('Đơn hàng này không ở trạng thái chờ thanh toán!');

        // 2. Tạo Transaction ID ảo nội bộ
        const transactionId = `MOCK_TXN_${orderId}_${Date.now()}`;
        const totalAmount = orders[0].total_amount;

        // 3. Cập nhật hoặc Tạo mới bản ghi PAYMENT vào Database
        const [existingPayment] = await db.execute('SELECT payment_id FROM PAYMENT WHERE order_id = ?', [orderId]);
        
        if (existingPayment.length > 0) {
            await db.execute(
                'UPDATE PAYMENT SET transaction_id = ?, payment_method = ?, payment_status = "Pending" WHERE order_id = ?',
                [transactionId, paymentMethod, orderId]
            );
        } else {
            await db.execute(
                'INSERT INTO PAYMENT (order_id, payment_method, payment_status, transaction_id) VALUES (?, ?, "Pending", ?)',
                [orderId, paymentMethod, transactionId]
            );
        }

        res.status(200).json({
            success: true,
            message: 'Tạo phiên thanh toán ảo thành công!',
            data: {
                transactionId: transactionId,
                amount: totalAmount,
                instruction: 'Lấy transactionId này và gọi API POST /api/payments/webhook để giả lập thanh toán thành công!'
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Webhook ẢO phản hồi trạng thái từ Cổng thanh toán
// KHÔNG DÙNG MIDDLEWARE PROTECT VÌ ĐÂY LÀ API MỞ CHO BÊN THỨ 3 GỌI VÀO
// ==========================================
exports.paymentWebhook = async (req, res) => {
    const connection = await db.getConnection();
    try {
        // Trong thực tế, cổng thanh toán sẽ gửi data lên body kèm Chữ ký bảo mật (Signature).
        // Ở môi trường ảo, chúng ta chỉ cần nhận transactionId và trạng thái giả lập.
        const { transactionId, status } = req.body; // status truyền lên là 'SUCCESS' hoặc 'FAILED'

        if (!transactionId) {
            return res.status(400).json({ success: false, message: 'Thiếu mã giao dịch transactionId!' });
        }

        await connection.beginTransaction();

        // Tìm giao dịch trong DB (Dùng FOR UPDATE để khóa dòng, tránh lỗi đụng độ)
        const [payments] = await connection.execute(
            'SELECT order_id, payment_status FROM PAYMENT WHERE transaction_id = ? FOR UPDATE', 
            [transactionId]
        );

        if (payments.length === 0) {
            throw new Error('Giao dịch không tồn tại trong hệ thống!');
        }

        const payment = payments[0];

        // Nếu giao dịch đã được xử lý xong từ trước thì bỏ qua (Tránh Webhook gọi 2 lần)
        if (payment.payment_status === 'Completed' || payment.payment_status === 'Failed') {
            await connection.rollback();
            return res.status(200).json({ success: true, message: 'Giao dịch này đã được ghi nhận từ trước.' }); 
        }

        if (status === 'SUCCESS') {
            // THANH TOÁN ẢO THÀNH CÔNG
            await connection.execute('UPDATE PAYMENT SET payment_status = "Completed", payment_date = NOW() WHERE transaction_id = ?', [transactionId]);
            await connection.execute('UPDATE ORDERS SET status = "Processing" WHERE order_id = ?', [payment.order_id]);
        } else {
            // THANH TOÁN ẢO THẤT BẠI
            await connection.execute('UPDATE PAYMENT SET payment_status = "Failed" WHERE transaction_id = ?', [transactionId]);
        }

        await connection.commit();

        res.status(200).json({ 
            success: true, 
            message: status === 'SUCCESS' ? 'Đã ghi nhận thanh toán thành công, đơn hàng chuyển sang Processing' : 'Thanh toán thất bại!'
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

// ==========================================
// 3. Yêu cầu hoàn tiền giao dịch (Dành cho Admin)
// ==========================================
exports.requestRefund = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Kiểm tra đơn hàng có hợp lệ để hoàn tiền không
        const [orders] = await db.execute(`
            SELECT o.status, p.payment_status, p.transaction_id, p.payment_method
            FROM ORDERS o
            JOIN PAYMENT p ON o.order_id = p.order_id
            WHERE o.order_id = ?
        `, [orderId]);

        if (orders.length === 0) throw new Error('Đơn hàng không tồn tại!');
        
        const info = orders[0];
        
        // Điều kiện: Đơn hàng phải bị Hủy và Tiền phải đang ở trạng thái Đã thu (Completed)
        if (info.status !== 'Cancelled') throw new Error('Chỉ có thể hoàn tiền cho đơn hàng đã bị Hủy (Cancelled)!');
        if (info.payment_status !== 'Completed') throw new Error('Đơn hàng này chưa được thanh toán thành công, không thể hoàn tiền!');

        // Cập nhật Database: Chuyển trạng thái thanh toán sang Đã hoàn tiền
        await db.execute('UPDATE PAYMENT SET payment_status = "Refunded" WHERE order_id = ?', [orderId]);

        res.status(200).json({ 
            success: true, 
            message: `(ẢO) Đã gửi yêu cầu hoàn tiền thành công qua cổng ${info.payment_method}! Tiền sẽ về tài khoản khách trong 24h.` 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};