const db = require('../config/db');

// ==========================================
// 1. API Lấy danh sách cấu trúc Danh mục (Get Categories Hierarchy)
// ==========================================
exports.getCategoriesHierarchy = async (req, res) => {
    try {
        // Lấy tất cả danh mục
        const [categories] = await db.execute('SELECT * FROM CATEGORY');

        // Thuật toán chuyển mảng phẳng (flat array) thành dạng Cây (Tree/Hierarchy)
        // Giả định trong bảng CATEGORY có cột parent_id để nhận biết danh mục cha/con
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parent_id === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id) // Đệ quy tìm con của danh mục hiện tại
                }));
        };

        // Nếu bảng CATEGORY của bạn không có parent_id, biến tree sẽ rỗng. 
        // Ta xử lý linh hoạt: Nếu có parent_id thì trả về tree, không thì trả list gốc.
        const hasParentId = categories.length > 0 && 'parent_id' in categories[0];
        const dataResult = hasParentId ? buildTree(categories) : categories;

        res.status(200).json({
            success: true,
            message: 'Lấy cấu trúc danh mục thành công!',
            data: dataResult
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. API Lấy danh sách Thương hiệu đang hoạt động (Get Active Brands)
// ==========================================
exports.getActiveBrands = async (req, res) => {
    try {
        // Giả định bảng BRAND có cột is_active. Nếu không có, bạn có thể xóa "WHERE is_active = 1"
        const query = 'SELECT * FROM BRAND WHERE is_active = 1';
        // Nếu không có cột is_active, hãy dùng: const query = 'SELECT * FROM BRAND';
        
        const [brands] = await db.execute(query);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách thương hiệu thành công!',
            data: brands
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. API Lấy danh sách Phong cách/Bộ sưu tập (Get Styles/Collections)
// ==========================================
exports.getStyles = async (req, res) => {
    try {
        const [styles] = await db.execute('SELECT * FROM STYLE');

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách phong cách thành công!',
            data: styles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. API Lấy thông tin chi tiết (Get Catalog Details)
// ==========================================
// Gộp chung 1 API thông minh: Client truyền vào loại (category, brand, style) và id
exports.getCatalogDetail = async (req, res) => {
    try {
        const { type, id } = req.params;
        let tableName = '';

        // Xác định bảng cần truy vấn dựa vào tham số type
        if (type === 'category') tableName = 'CATEGORY';
        else if (type === 'brand') tableName = 'BRAND';
        else if (type === 'style') tableName = 'STYLE';
        else {
            throw new Error('Tham số type không hợp lệ. Chỉ hỗ trợ: category, brand, style');
        }

        const [result] = await db.execute(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);

        if (result.length === 0) {
            throw new Error(`Không tìm thấy dữ liệu cho ${type} có ID là ${id}`);
        }

        res.status(200).json({
            success: true,
            message: `Lấy chi tiết ${type} thành công!`,
            data: result[0]
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};