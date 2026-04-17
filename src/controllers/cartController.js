const db = require('../config/db');

// --- HÀM HỖ TRỢ: Lấy giỏ hàng hiện tại hoặc tạo mới nếu chưa có ---
const getOrCreateCart = async (userId) => {
    // 1. Kiểm tra user đã có giỏ hàng chưa
    const [carts] = await db.execute('SELECT cart_id FROM CART WHERE user_id = ?', [userId]);
    if (carts.length > 0) {
        return carts[0].cart_id;
    }
    // 2. Nếu chưa có, tạo giỏ hàng mới cho User
    const [result] = await db.execute('INSERT INTO CART (user_id) VALUES (?)', [userId]);
    return result.insertId;
};

// ==========================================
// 1. Lấy thông tin Giỏ hàng hiện tại
// ==========================================
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cartId = await getOrCreateCart(userId);

        // Truy vấn danh sách item: 
        // - Nối CART_ITEM, PRODUCT_VARIANT, PRODUCT
        // - Tính giá: base_price + price_adjustment
        // - Lấy ảnh chính từ PRODUCT_IMAGES
        const query = `
            SELECT 
                ci.cart_item_id, 
                ci.variant_id, 
                ci.quantity, 
                pv.size, 
                pv.color, 
                (p.base_price + IFNULL(pv.price_adjustment, 0)) AS price, 
                pv.stock_quantity AS stock,
                p.name AS product_name, 
                (
                    SELECT image_url 
                    FROM PRODUCT_IMAGES 
                    WHERE product_id = p.product_id AND is_primary = 1 
                    LIMIT 1
                ) AS image_url
            FROM CART_ITEM ci
            JOIN PRODUCT_VARIANT pv ON ci.variant_id = pv.variant_id
            JOIN PRODUCT p ON pv.product_id = p.product_id
            WHERE ci.cart_id = ?
        `;
        const [items] = await db.execute(query, [cartId]);

        // Tính tổng tiền giỏ hàng
        const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin giỏ hàng thành công',
            data: {
                cartId: cartId,
                items: items,
                totalAmount: totalAmount
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Thêm Sản phẩm/Biến thể vào Giỏ hàng
// ==========================================
exports.addItemToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { variantId, quantity } = req.body;

        if (!variantId || !quantity || quantity <= 0) {
            throw new Error('Thông tin sản phẩm hoặc số lượng không hợp lệ!');
        }

        const cartId = await getOrCreateCart(userId);

        // Kiểm tra biến thể có tồn tại và còn đủ tồn kho không
        const [variants] = await db.execute('SELECT stock_quantity FROM PRODUCT_VARIANT WHERE variant_id = ?', [variantId]);
        if (variants.length === 0) {
            throw new Error('Sản phẩm hoặc biến thể này không tồn tại!');
        }
        if (variants[0].stock_quantity < quantity) {
            throw new Error(`Sản phẩm này chỉ còn ${variants[0].stock_quantity} trong kho!`);
        }

        // Kiểm tra xem sản phẩm (biến thể) đã có trong giỏ chưa
        const [existingItems] = await db.execute(
            'SELECT cart_item_id, quantity FROM CART_ITEM WHERE cart_id = ? AND variant_id = ?',
            [cartId, variantId]
        );

        if (existingItems.length > 0) {
            // Đã có -> Cộng dồn số lượng
            const newQuantity = existingItems[0].quantity + quantity;
            
            // Check lại tồn kho cho tổng số lượng mới
            if (variants[0].stock_quantity < newQuantity) {
                throw new Error(`Không thể thêm. Tổng số lượng trong giỏ vượt quá tồn kho (${variants[0].stock_quantity})!`);
            }

            await db.execute(
                'UPDATE CART_ITEM SET quantity = ? WHERE cart_item_id = ?',
                [newQuantity, existingItems[0].cart_item_id]
            );
        } else {
            // Chưa có -> Thêm mới bản ghi vào giỏ
            await db.execute(
                'INSERT INTO CART_ITEM (cart_id, variant_id, quantity) VALUES (?, ?, ?)',
                [cartId, variantId, quantity]
            );
        }

        res.status(200).json({ success: true, message: 'Đã thêm sản phẩm vào giỏ hàng!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Cập nhật số lượng của một Sản phẩm trong Giỏ
// ==========================================
exports.updateItemQuantity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            throw new Error('Số lượng cập nhật phải lớn hơn 0. Nếu muốn xóa, vui lòng dùng tính năng Xóa!');
        }

        // Lấy cartId để đảm bảo user chỉ sửa được item trong giỏ của chính họ
        const cartId = await getOrCreateCart(userId);
        const [items] = await db.execute(
            'SELECT variant_id FROM CART_ITEM WHERE cart_item_id = ? AND cart_id = ?',
            [cartItemId, cartId]
        );

        if (items.length === 0) {
            throw new Error('Sản phẩm không có trong giỏ hàng của bạn!');
        }

        // Kiểm tra tồn kho từ bảng PRODUCT_VARIANT
        const [variants] = await db.execute('SELECT stock_quantity FROM PRODUCT_VARIANT WHERE variant_id = ?', [items[0].variant_id]);
        if (variants[0].stock_quantity < quantity) {
            throw new Error(`Chỉ còn tối đa ${variants[0].stock_quantity} sản phẩm trong kho!`);
        }

        // Thực hiện cập nhật
        await db.execute(
            'UPDATE CART_ITEM SET quantity = ? WHERE cart_item_id = ?',
            [quantity, cartItemId]
        );

        res.status(200).json({ success: true, message: 'Đã cập nhật số lượng sản phẩm!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Xóa một Sản phẩm khỏi Giỏ hàng
// ==========================================
exports.removeItemFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cartItemId } = req.params;

        const cartId = await getOrCreateCart(userId);

        const [result] = await db.execute(
            'DELETE FROM CART_ITEM WHERE cart_item_id = ? AND cart_id = ?',
            [cartItemId, cartId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Xóa thất bại. Không tìm thấy sản phẩm trong giỏ của bạn!');
        }

        res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. Làm trống toàn bộ Giỏ hàng
// ==========================================
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cartId = await getOrCreateCart(userId);

        await db.execute('DELETE FROM CART_ITEM WHERE cart_id = ?', [cartId]);

        res.status(200).json({ success: true, message: 'Đã làm trống giỏ hàng!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};