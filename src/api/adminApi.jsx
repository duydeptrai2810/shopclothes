const BASE_URL = "http://localhost:3000/api/admin";

// Hàm hỗ trợ lấy Header có kèm Token
const getHeaders = (token) => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
});

// ==========================================
// 1. DASHBOARD & THỐNG KÊ (Khớp adminDashboardRoutes)
// ==========================================

// Lấy thống kê doanh thu (sales)
export const getSalesStats = async (token) => {
    const res = await fetch(`${BASE_URL}/dashboard/sales`, { 
        headers: getHeaders(token) 
    });
    return await res.json();
};

// Lấy thống kê kho hàng (inventory)
export const getInventoryStats = async (token) => {
    const res = await fetch(`${BASE_URL}/dashboard/inventory`, { 
        headers: getHeaders(token) 
    });
    return await res.json();
};

// ==========================================
// 2. QUẢN LÝ SẢN PHẨM (Khớp adminProductRoutes)
// ==========================================

// Lấy danh sách sản phẩm admin
export const adminGetProducts = async (token) => {
    const res = await fetch(`${BASE_URL}/products`, { 
        headers: getHeaders(token) 
    });
    return await res.json();
};

// Vô hiệu hóa hoặc Kích hoạt lại Sản phẩm
export const toggleProductStatus = async (token, productId, isActive) => {
    const res = await fetch(`${BASE_URL}/products/${productId}/status`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify({ isActive })
    });
    return await res.json();
};

// ==========================================
// 3. QUẢN LÝ VẬN HÀNH - OPS (Khớp adminOpsRoutes)
// ==========================================

// Lấy danh sách toàn bộ Đơn hàng
export const adminGetOrders = async (token) => {
    const res = await fetch(`${BASE_URL}/operations/orders`, { 
        headers: getHeaders(token) 
    });
    return await res.json();
};

// Lấy danh sách toàn bộ Người dùng
export const adminGetUsers = async (token) => {
    const res = await fetch(`${BASE_URL}/operations/users`, { 
        headers: getHeaders(token) 
    });
    return await res.json();
};

// Cập nhật quyền hoặc trạng thái người dùng
export const adminUpdateUserRole = async (token, userId, data) => {
    const res = await fetch(`${BASE_URL}/operations/users/${userId}/role`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(data) // { role, isActive }
    });
    return await res.json();
};

// ==========================================
// 4. CẤU HÌNH DANH MỤC - CATALOG (Khớp adminCatalogRoutes)
// ==========================================

// Tạo mới Brand/Category/Style
export const createCatalogItem = async (token, type, data) => {
    const res = await fetch(`${BASE_URL}/catalog/${type}`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(data)
    });
    return await res.json();
};