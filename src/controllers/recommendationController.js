const db = require('../config/db');

// ==========================================
// 0. API Ẩn: Ghi nhận hành vi người dùng (Tracking)
// Frontend sẽ gọi API này ngầm khi user click xem hoặc thêm vào giỏ
// ==========================================
exports.trackUserAction = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null; // Có thể null nếu khách chưa đăng nhập
        const { productId, actionType, durationSeconds } = req.body; 
        // actionType: 'VIEW', 'ADD_TO_CART'

        if (!productId || !actionType) {
            throw new Error('Thiếu thông tin hành vi!');
        }

        await db.execute(
            'INSERT INTO USER_ACTION (user_id, product_id, action_type, duration_seconds) VALUES (?, ?, ?, ?)',
            [userId, productId, actionType, durationSeconds || 0]
        );

        res.status(200).json({ success: true, message: 'Đã ghi nhận hành vi.' });
    } catch (error) {
        // API tracking không nên báo lỗi làm gián đoạn trải nghiệm UX
        res.status(200).json({ success: false, message: error.message });
    }
};

// ==========================================
// 1. Gợi ý Sản phẩm liên quan (Dành cho trang Chi tiết sản phẩm)
// Dựa vào cùng Danh mục (Category) hoặc cùng Thương hiệu (Brand)
// ==========================================
exports.getRelatedProducts = async (req, res) => {
    try {
        const { productId } = req.params;

        // Tìm thông tin của sản phẩm hiện tại để lấy category_id
        const [currentProduct] = await db.execute('SELECT category_id, brand_id FROM PRODUCT WHERE product_id = ?', [productId]);
        
        if (currentProduct.length === 0) throw new Error('Sản phẩm không tồn tại!');

        const categoryId = currentProduct[0].category_id;

        // Truy vấn 8 sản phẩm cùng danh mục, KHÔNG bao gồm sản phẩm hiện tại
        const query = `
            SELECT 
                p.product_id, p.name, p.base_price, 
                (SELECT image_url FROM PRODUCT_IMAGES WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) AS image_url
            FROM PRODUCT p
            WHERE p.category_id = ? AND p.product_id != ? AND p.is_active = 1
            ORDER BY p.created_at DESC
            LIMIT 8
        `;
        const [relatedProducts] = await db.execute(query, [categoryId, productId]);

        res.status(200).json({
            success: true,
            message: 'Lấy sản phẩm liên quan thành công',
            data: relatedProducts
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Gợi ý Sản phẩm cá nhân hóa (Dành cho Trang chủ)
// Sử dụng thuật toán Content-based cơ bản bằng SQL (Dựa trên lịch sử)
// ==========================================
exports.getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.user.userId;

        // BƯỚC 1: Tìm danh mục (Category) mà User này hay xem hoặc hay mua nhất
        const findFavoriteCategoryQuery = `
            SELECT p.category_id, COUNT(*) AS interaction_score
            FROM USER_ACTION ua
            JOIN PRODUCT p ON ua.product_id = p.product_id
            WHERE ua.user_id = ?
            GROUP BY p.category_id
            ORDER BY interaction_score DESC
            LIMIT 1
        `;
        const [favoriteCategories] = await db.execute(findFavoriteCategoryQuery, [userId]);

        let recommendations = [];

        // Nếu người dùng ĐÃ CÓ lịch sử tương tác -> Gợi ý theo sở thích
        if (favoriteCategories.length > 0) {
            const bestCategoryId = favoriteCategories[0].category_id;
            
            const query = `
                SELECT 
                    p.product_id, p.name, p.base_price,
                    (SELECT image_url FROM PRODUCT_IMAGES WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) AS image_url
                FROM PRODUCT p
                WHERE p.category_id = ? AND p.is_active = 1
                ORDER BY RAND() -- Trộn ngẫu nhiên để không bị nhàm chán
                LIMIT 10
            `;
            [recommendations] = await db.execute(query, [bestCategoryId]);
        } 
        
        // Nếu người dùng MỚI TINH (Chưa có lịch sử) -> Trả về Top 10 Bán Chạy Nhất (Best Sellers)
        if (recommendations.length === 0) {
            const fallbackQuery = `
                SELECT 
                    p.product_id, p.name, p.base_price,
                    SUM(od.quantity) as total_sold,
                    (SELECT image_url FROM PRODUCT_IMAGES WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) AS image_url
                FROM PRODUCT p
                JOIN PRODUCT_VARIANT pv ON p.product_id = pv.product_id
                JOIN ORDER_DETAIL od ON pv.variant_id = od.variant_id
                WHERE p.is_active = 1
                GROUP BY p.product_id, p.name, p.base_price
                ORDER BY total_sold DESC
                LIMIT 10
            `;
            [recommendations] = await db.execute(fallbackQuery);
        }

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách gợi ý cá nhân hóa thành công',
            data: recommendations
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};