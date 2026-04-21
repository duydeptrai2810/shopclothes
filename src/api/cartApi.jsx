const API_URL = "http://localhost:3000/api";

export const getCart = async (token) => {
    const res = await fetch(`${API_URL}/cart`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}

export const addToCart = async (token, itemData) => {
    const res = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
    });
    return await res.json();
}

export const updateCartItem = async (token, itemId, quantity) => {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
    });
    return await res.json();
}

export const removeCartItem = async (token, itemId) => {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
}