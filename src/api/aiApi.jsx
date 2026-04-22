const API_URL = "http://localhost:3000/api/recommendations";

/**
 * 1. GHI NHẬN HÀNH VI NGƯỜI DÙNG (Tracking)
 * Gọi hàm này khi người dùng xem sản phẩm, nhấn vào sản phẩm...
 * @param {string} token - Token xác thực (nếu có)
 * @param {number} productId - ID của sản phẩm đang tương tác
 * @param {string} actionType - Loại hành động: 'view', 'click', 'add_to_cart'
 */
export const trackUserAction = async (token, productId, actionType) => {
    try {
        const headers = {
            "Content-Type": "application/json"
        };
        
        // Nếu người dùng đã đăng nhập thì gửi kèm Token
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/track`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ productId, actionType })
        });
        
        return await res.json();
    } catch (error) {
        console.error("Lỗi Tracking AI:", error);
        return { success: false, message: "Không thể ghi nhận hành vi" };
    }
};

/**
 * 2. LẤY SẢN PHẨM LIÊN QUAN (Related Products)
 * Dùng ở trang Chi tiết sản phẩm (ProductDetail)
 * @param {number} productId - ID sản phẩm đang xem
 */
export const getRelatedProducts = async (productId) => {
    try {
        const res = await fetch(`${API_URL}/related/${productId}`);
        return await res.json();
    } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
        return { success: false, data: [] };
    }
};

/**
 * 3. LẤY GỢI Ý CÁ NHÂN HÓA (Personalized AI)
 * Dùng ở trang "Gợi ý AI" hoặc trang chủ
 * @param {string} token - Bắt buộc phải có Token để AI biết bạn là ai
 */
export const getPersonalizedRecommendations = async (token) => {
    try {
        if (!token) throw new Error("Cần đăng nhập để nhận gợi ý cá nhân hóa");

        const res = await fetch(`${API_URL}/personalized`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        return await res.json();
    } catch (error) {
        console.error("Lỗi lấy gợi ý cá nhân hóa:", error);
        return { success: false, data: [], message: error.message };
    }
};