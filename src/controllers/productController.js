const db = require('../config/db');

// ==========================================
// 1. Lấy danh sách Sản phẩm kèm bộ lọc và phân trang (Khám phá)
// ==========================================
exports.getProducts = async (req, res) => {
    try {
        // Lấy các tham số từ Query URL
        const { categoryId, brandId, minPrice, maxPrice, sort, page, limit } = req.query;
        
        // Cấu hình phân trang
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const offset = (pageNum - 1) * limitNum;

        let query = `
            SELECT 
                p.product_id, p.name, p.base_price, 
                c.name AS category_name, b.name AS brand_name,
                (SELECT image_url FROM PRODUCT_IMAGES WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) AS image_url
            FROM PRODUCT p
            LEFT JOIN CATEGORY c ON p.category_id = c.category_id
            LEFT JOIN BRAND b ON p.brand_id = b.brand_id
            WHERE p.is_active = 1
        `;
        let countQuery = `SELECT COUNT(*) AS total FROM PRODUCT p WHERE p.is_active = 1`;
        let queryParams = [];
        let countParams = [];

        // Áp dụng bộ lọc (Filters)
        if (categoryId) {
            query += ` AND p.category_id = ?`;
            countQuery += ` AND p.category_id = ?`;
            queryParams.push(categoryId);
            countParams.push(categoryId);
        }
        if (brandId) {
            query += ` AND p.brand_id = ?`;
            countQuery += ` AND p.brand_id = ?`;
            queryParams.push(brandId);
            countParams.push(brandId);
        }
        if (minPrice) {
            query += ` AND p.base_price >= ?`;
            countQuery += ` AND p.base_price >= ?`;
            queryParams.push(minPrice);
            countParams.push(minPrice);
        }
        if (maxPrice) {
            query += ` AND p.base_price <= ?`;
            countQuery += ` AND p.base_price <= ?`;
            queryParams.push(maxPrice);
            countParams.push(maxPrice);
        }

        // Sắp xếp (Sorting)
        if (sort === 'price_asc') query += ` ORDER BY p.base_price ASC`;
        else if (sort === 'price_desc') query += ` ORDER BY p.base_price DESC`;
        else if (sort === 'newest') query += ` ORDER BY p.created_at DESC`;
        else query += ` ORDER BY p.created_at DESC`; // Mặc định mới nhất

        // Thêm phân trang
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(limitNum, offset);

        // Thực thi truy vấn
        const [products] = await db.query(query, queryParams);
        const [totalRows] = await db.query(countQuery, countParams);
        const totalProducts = totalRows[0].total;

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalProducts,
                totalPages: Math.ceil(totalProducts / limitNum),
                currentPage: pageNum,
                limit: limitNum
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Tìm kiếm Sản phẩm bằng từ khóa
// ==========================================
exports.searchProducts = async (req, res) => {
    try {
        const { keyword, page, limit } = req.query;

        if (!keyword) {
            throw new Error('Vui lòng nhập từ khóa tìm kiếm!');
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const offset = (pageNum - 1) * limitNum;
        const searchKeyword = `%${keyword}%`;

        const query = `
            SELECT 
                p.product_id, p.name, p.base_price, 
                (SELECT image_url FROM PRODUCT_IMAGES WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) AS image_url
            FROM PRODUCT p
            WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ?)
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(*) AS total 
            FROM PRODUCT p 
            WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ?)
        `;

        const [products] = await db.query(query, [searchKeyword, searchKeyword, limitNum, offset]);
        const [totalRows] = await db.query(countQuery, [searchKeyword, searchKeyword]);

        res.status(200).json({
            success: true,
            message: `Kết quả tìm kiếm cho: "${keyword}"`,
            data: products,
            pagination: {
                totalProducts: totalRows[0].total,
                totalPages: Math.ceil(totalRows[0].total / limitNum),
                currentPage: pageNum
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Lấy chi tiết Sản phẩm cùng các biến thể màu/size
// ==========================================
exports.getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;

        // 3.1. Lấy thông tin chung của sản phẩm
        const [products] = await db.execute(`
            SELECT 
                p.product_id, p.name, p.description, p.base_price, p.material, p.gender_target,
                c.name AS category_name, b.name AS brand_name, s.name AS style_name
            FROM PRODUCT p
            LEFT JOIN CATEGORY c ON p.category_id = c.category_id
            LEFT JOIN BRAND b ON p.brand_id = b.brand_id
            LEFT JOIN STYLE s ON p.style_id = s.style_id
            WHERE p.product_id = ? AND p.is_active = 1
        `, [productId]);

        if (products.length === 0) {
            throw new Error('Sản phẩm không tồn tại hoặc đã bị ẩn!');
        }

        // 3.2. Lấy toàn bộ biến thể (Size, Màu, Tồn kho)
        const [variants] = await db.execute(`
            SELECT variant_id, size, color, sku, stock_quantity, price_adjustment 
            FROM PRODUCT_VARIANT 
            WHERE product_id = ?
        `, [productId]);

        // 3.3. Lấy toàn bộ hình ảnh
        const [images] = await db.execute(`
            SELECT image_url, is_primary 
            FROM PRODUCT_IMAGES 
            WHERE product_id = ?
            ORDER BY is_primary DESC
        `, [productId]);

        res.status(200).json({
            success: true,
            data: {
                info: products[0],
                images: images,
                variants: variants
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};