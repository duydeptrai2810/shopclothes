const API_URL = "http://localhost:3000/api";

export const getProductReviews = async (productId) => {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`);
    return await res.json();
}

export const addReview = async (token, productId, reviewData) => {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });
    return await res.json();
}