const API_URL = "http://localhost:3000/api/reviews";

export const getProductReviews = async (productId) => {
    const res = await fetch(`${API_URL}/product/${productId}`);
    return await res.json();
};

export const addReview = async (token, productId, reviewData) => {
    const res = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            productId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            orderDetailId: reviewData.orderDetailId || null
        })
    });
    return await res.json();
};