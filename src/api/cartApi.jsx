const API_URL = "http://localhost:3000/api";

// 1. Lấy danh sách sản phẩm trong giỏ hàng
// Khớp với: router.get('/', cartController.getCart);
export const getCart = async (token) => {
    const res = await fetch(`${API_URL}/cart`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}

// 2. Thêm sản phẩm vào giỏ hàng
// Khớp với: router.post('/add', cartController.addItemToCart);
export const addToCart = async (token, itemData) => {
    const res = await fetch(`${API_URL}/cart/add`, { 
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(itemData) // Gửi { variantId, quantity }
    });
    return await res.json();
}

// 3. Cập nhật số lượng sản phẩm
// Khớp với: router.put('/update/:cartItemId', cartController.updateItemQuantity);
export const updateCartQuantity = async (token, cartItemId, quantity) => {
    const res = await fetch(`${API_URL}/cart/update/${cartItemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
    });
    return await res.json();
}

// 4. Xóa một sản phẩm khỏi giỏ hàng
// Khớp với: router.delete('/remove/:cartItemId', cartController.removeItemFromCart);
export const removeCartItem = async (token, cartItemId) => {
    const res = await fetch(`${API_URL}/cart/remove/${cartItemId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}

// 5. Làm trống toàn bộ giỏ hàng
// Khớp với: router.delete('/clear', cartController.clearCart);
export const clearCart = async (token) => {
    const res = await fetch(`${API_URL}/cart/clear`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}