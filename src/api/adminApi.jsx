const API_URL = "http://localhost:3000/api/admin";

export const adminGetProducts = async (token) => {
    const res = await fetch(`${API_URL}/products`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}

export const adminUpdateOrderStatus = async (token, orderId, status) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    return await res.json();
}

export const getSalesStats = async (token) => {
    const res = await fetch(`${API_URL}/stats/sales`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}