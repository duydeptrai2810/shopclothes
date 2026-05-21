const API_URL = "http://localhost:3000/api/orders";

export const orderApi = {
    placeOrder: async (token, orderData) => {
        const res = await fetch(`${API_URL}/place`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        return await res.json();
    }
};

// Gộp các hàm vào một hằng số duy nhất tên là orderApi
export const orderApi = {
    previewCheckout: async (token) => {
        const res = await fetch(`${API_URL}/checkout/preview`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },

    placeOrder: async (token, orderData) => {
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        return await res.json();
    },

    getMyOrders: async (token) => {
        const res = await fetch(`${API_URL}/orders`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    }
};