const db = require('../config/db');

// --- HÀM HỖ TRỢ: Tự động chọn Bảng và Cột ID dựa vào 'type' ---
const resolveType = (type) => {
    const typeMap = {
        'category': { table: 'CATEGORY', idCol: 'category_id' },
        'brand': { table: 'BRAND', idCol: 'brand_id' },
        'style': { table: 'STYLE', idCol: 'style_id' }
    };

    if (!typeMap[type]) {
        throw new Error('Loại cấu hình không hợp lệ! Chỉ nhận "category", "brand", hoặc "style".');
    }
    return typeMap[type];
};

// ==========================================
// 1. Tạo Danh mục/Thương hiệu/Phong cách mới
// ==========================================
exports.createCatalogItem = async (req, res) => {
    try {
        const { type } = req.params;
        const { name, description, parentCategoryId } = req.body;
        const { table } = resolveType(type);

        if (!name) {
            throw new Error(`Vui lòng nhập tên cho ${type}!`);
        }

        let query, params;
        
        // Bảng CATEGORY có thêm cột parent_category_id
        if (type === 'category') {
            query = `INSERT INTO CATEGORY (name, description, parent_category_id) VALUES (?, ?, ?)`;
            params = [name, description || '', parentCategoryId || null];
        } else {
            query = `INSERT INTO ${table} (name, description) VALUES (?, ?)`;
            params = [name, description || ''];
        }

        const [result] = await db.execute(query, params);

        res.status(201).json({
            success: true,
            message: `Tạo ${type} mới thành công!`,
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Cập nhật Danh mục/Thương hiệu/Phong cách
// ==========================================
exports.updateCatalogItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { name, description, parentCategoryId, isActive } = req.body;
        const { table, idCol } = resolveType(type);

        if (!name) {
            throw new Error(`Tên ${type} không được để trống!`);
        }

        let query, params;

        // Xử lý truy vấn cập nhật linh hoạt theo từng bảng
        if (type === 'category') {
            query = `UPDATE CATEGORY SET name = ?, description = ?, parent_category_id = ? WHERE category_id = ?`;
            params = [name, description || '', parentCategoryId || null, id];
        } else if (type === 'brand') {
            // BRAND có thêm cột is_active do bạn đã ALTER TABLE
            query = `UPDATE BRAND SET name = ?, description = ?, is_active = COALESCE(?, is_active) WHERE brand_id = ?`;
            params = [name, description || '', isActive, id];
        } else {
            query = `UPDATE STYLE SET name = ?, description = ? WHERE style_id = ?`;
            params = [name, description || '', id];
        }

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            throw new Error(`Cập nhật thất bại. Không tìm thấy ${type} với ID này!`);
        }

        res.status(200).json({ success: true, message: `Cập nhật ${type} thành công!` });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Xóa Danh mục/Thương hiệu/Phong cách (Hard-delete)
// Nhờ DB có "ON DELETE SET NULL", sản phẩm cũ sẽ không bị xóa theo.
// ==========================================
exports.deleteCatalogItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { table, idCol } = resolveType(type);

        const [result] = await db.execute(`DELETE FROM ${table} WHERE ${idCol} = ?`, [id]);

        if (result.affectedRows === 0) {
            throw new Error(`Xóa thất bại. Không tìm thấy ${type}!`);
        }

        res.status(200).json({ success: true, message: `Đã xóa ${type} thành công!` });
    } catch (error) {
        // Bắt lỗi ràng buộc khóa ngoại (nếu có ngoại lệ SQL)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(400).json({ success: false, message: `Không thể xóa vì ${type} này đang chứa dữ liệu con!` });
        } else {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};