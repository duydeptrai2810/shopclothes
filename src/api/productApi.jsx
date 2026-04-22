const API_URL = "http://localhost:3000/api/products";

export const getListProduct = async () => {
    try {
        
        const res = await fetch(`${API_URL}/products`, {
            method: "GET"
        });
        const data = await res.json();
        return data;
    } catch (error) {
        return { success: false };
    }
}


export const getProductDetail = async (id) => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        return await res.json();
    } catch (error) {
        console.error("Lỗi getProductDetail:", error);
        return { success: false };
    }
}

export const searchProduct = async (keyword) => {
    try {
        // BE của bạn dùng query ?keyword= nên phải truyền đúng tên biến
        const res = await fetch(`${API_URL}/products/search?keyword=${encodeURIComponent(keyword)}`, {
            method: "GET"
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Lỗi searchProduct:", error);
        return { success: false, data: [] };
    }
}