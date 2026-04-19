const db = require('../config/db');

// ==========================================
// 1. Lấy toàn bộ danh sách Sản phẩm cho Admin
// Lấy cả sản phẩm đang ẩn (is_active = 0) và thống kê tổng tồn kho
// ==========================================
exports.getAllAdminProducts = async (req, res) => {
    try {
        // Truy vấn lấy sản phẩm kèm tên danh mục, tên thương hiệu và tổng số lượng tồn kho
        const query = `
            SELECT 
                p.product_id, p.name, p.base_price, p.is_active, p.created_at,
                c.name AS category_name,
                b.name AS brand_name,
                (SELECT SUM(stock_quantity) FROM PRODUCT_VARIANT WHERE product_id = p.product_id) AS total_stock,
                (SELECT COUNT(variant_id) FROM PRODUCT_VARIANT WHERE product_id = p.product_id) AS total_variants
            FROM PRODUCT p
            LEFT JOIN CATEGORY c ON p.category_id = c.category_id
            LEFT JOIN BRAND b ON p.brand_id = b.brand_id
            ORDER BY p.created_at DESC
        `;
        const [products] = await db.execute(query);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách sản phẩm quản trị thành công',
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Tạo Sản phẩm gốc mới
// ==========================================
exports.createBaseProduct = async (req, res) => {
    try {
        const { name, description, basePrice, brandId, categoryId, styleId, material, genderTarget } = req.body;

        if (!name || !basePrice) {
            throw new Error('Tên sản phẩm và Giá gốc là bắt buộc!');
        }

        const [result] = await db.execute(
            `INSERT INTO PRODUCT (name, description, base_price, brand_id, category_id, style_id, material, gender_target, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [name, description || '', basePrice, brandId || null, categoryId || null, styleId || null, material || '', genderTarget || 'Unisex']
        );

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm mới thành công!',
            data: { productId: result.insertId }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Cập nhật thông tin Sản phẩm gốc
// ==========================================
exports.updateBaseProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, basePrice, brandId, categoryId, styleId, material, genderTarget } = req.body;

        if (!name || !basePrice) {
            throw new Error('Tên sản phẩm và Giá gốc không được để trống!');
        }

        const [result] = await db.execute(
            `UPDATE PRODUCT 
             SET name = ?, description = ?, base_price = ?, brand_id = ?, category_id = ?, style_id = ?, material = ?, gender_target = ?
             WHERE product_id = ?`,
            [name, description, basePrice, brandId || null, categoryId || null, styleId || null, material, genderTarget, productId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Cập nhật thất bại. Sản phẩm không tồn tại!');
        }

        res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Vô hiệu hóa hoặc Kích hoạt lại Sản phẩm
// ==========================================
exports.toggleProductStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const { isActive } = req.body; // Gửi 1 để kích hoạt, 0 để ẩn

        if (isActive === undefined) throw new Error('Vui lòng truyền trạng thái isActive (1 hoặc 0)');

        const [result] = await db.execute(
            'UPDATE PRODUCT SET is_active = ? WHERE product_id = ?',
            [isActive, productId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Thao tác thất bại. Sản phẩm không tồn tại!');
        }

        const message = isActive == 1 ? 'Đã hiển thị sản phẩm!' : 'Đã ẩn sản phẩm!';
        res.status(200).json({ success: true, message });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. Thêm Biến thể cho Sản phẩm
// ==========================================
exports.addProductVariant = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size, color, sku, stockQuantity, priceAdjustment } = req.body;

        if (!stockQuantity || stockQuantity < 0) {
            throw new Error('Số lượng tồn kho phải từ 0 trở lên!');
        }

        // Kiểm tra SKU có bị trùng không (SKU là UNIQUE trong DB)
        if (sku) {
            const [existing] = await db.execute('SELECT variant_id FROM PRODUCT_VARIANT WHERE sku = ?', [sku]);
            if (existing.length > 0) throw new Error('Mã SKU này đã tồn tại trong hệ thống!');
        }

        const [result] = await db.execute(
            `INSERT INTO PRODUCT_VARIANT (product_id, size, color, sku, stock_quantity, price_adjustment) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [productId, size || null, color || null, sku || null, stockQuantity, priceAdjustment || 0]
        );

        res.status(201).json({
            success: true,
            message: 'Đã thêm biến thể mới!',
            data: { variantId: result.insertId }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 6. Cập nhật thông tin/Tồn kho của Biến thể
// ==========================================
exports.updateVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const { size, color, sku, stockQuantity, priceAdjustment } = req.body;

        if (stockQuantity !== undefined && stockQuantity < 0) {
            throw new Error('Số lượng tồn kho không hợp lệ!');
        }

        // Kiểm tra trùng SKU nếu SKU bị thay đổi
        if (sku) {
            const [existing] = await db.execute('SELECT variant_id FROM PRODUCT_VARIANT WHERE sku = ? AND variant_id != ?', [sku, variantId]);
            if (existing.length > 0) throw new Error('Mã SKU này đã bị trùng với biến thể khác!');
        }

        const [result] = await db.execute(
            `UPDATE PRODUCT_VARIANT 
             SET size = ?, color = ?, sku = ?, stock_quantity = ?, price_adjustment = ?
             WHERE variant_id = ?`,
            [size || null, color || null, sku || null, stockQuantity, priceAdjustment || 0, variantId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Cập nhật thất bại. Biến thể không tồn tại!');
        }

        res.status(200).json({ success: true, message: 'Đã cập nhật thông tin biến thể!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 7. Xóa Biến thể Sản phẩm
// ==========================================
exports.deleteVariant = async (req, res) => {
    try {
        const { variantId } = req.params;

        const [result] = await db.execute('DELETE FROM PRODUCT_VARIANT WHERE variant_id = ?', [variantId]);

        if (result.affectedRows === 0) {
            throw new Error('Xóa thất bại. Biến thể không tồn tại!');
        }

        res.status(200).json({ success: true, message: 'Đã xóa biến thể thành công!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};