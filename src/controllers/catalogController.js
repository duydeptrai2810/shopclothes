const db = require('../config/db');

exports.getCategoriesHierarchy = async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM CATEGORY');

        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parent_category_id === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.category_id) 
                }));
        };

        const hasParentId = categories.length > 0 && 'parent_category_id' in categories[0];
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

exports.getActiveBrands = async (req, res) => {
    try {
        const query = 'SELECT * FROM BRAND WHERE is_active = 1';
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

exports.getCatalogDetail = async (req, res) => {
    try {
        const { type, id } = req.params;
        let tableName = '';
        let idColumn = ''; 

        if (type === 'category') { tableName = 'CATEGORY'; idColumn = 'category_id'; }
        else if (type === 'brand') { tableName = 'BRAND'; idColumn = 'brand_id'; }
        else if (type === 'style') { tableName = 'STYLE'; idColumn = 'style_id'; }
        else {
            throw new Error('Tham số type không hợp lệ. Chỉ hỗ trợ: category, brand, style');
        }

        const [result] = await db.execute(`SELECT * FROM ${tableName} WHERE ${idColumn} = ?`, [id]);

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