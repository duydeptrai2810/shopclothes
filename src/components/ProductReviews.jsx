import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { getProductReviews, addReview } from "../api/reviewApi";
import { Star, Send } from "lucide-react";

export default function ProductReviews({ productId }) {
    const { token } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await getProductReviews(productId);
            if (res.success) setReviews(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return alert("Vui lòng đăng nhập để đánh giá!");
        
        setLoading(true);
        try {
            const res = await addReview(token, productId, { rating, comment, orderDetailId: null });
            if (res.success) {
                alert("Cảm ơn bạn đã đánh giá!");
                setComment("");
                fetchReviews(); // Load lại danh sách
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: "50px", borderTop: "1px solid #eee", paddingTop: "30px" }}>
            <h3>Đánh giá sản phẩm ({reviews.length})</h3>
            
            {/* Form viết đánh giá */}
            <form onSubmit={handleSubmit} style={{ background: "#f9fafb", padding: "20px", borderRadius: "12px", margin: "20px 0" }}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Chất lượng sản phẩm:</label>
                    <div style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={24} fill={star <= rating ? "#fbbf24" : "none"} color={star <= rating ? "#fbbf24" : "#cbd5e1"} onClick={() => setRating(star)} />
                        ))}
                    </div>
                </div>
                <textarea 
                    rows="3" 
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..." 
                    value={comment} onChange={(e) => setComment(e.target.value)} required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" }}
                ></textarea>
                <button type="submit" disabled={loading} style={{ background: "#111", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <Send size={16} /> {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
            </form>

            {/* Danh sách bình luận */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {reviews.map(rev => (
                    <div key={rev.review_id} style={{ borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <strong>{rev.username}</strong>
                            <span style={{ color: "#999", fontSize: "13px" }}>{new Date(rev.created_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={14} fill={star <= rev.rating ? "#fbbf24" : "none"} color={star <= rev.rating ? "#fbbf24" : "#cbd5e1"} />
                            ))}
                        </div>
                        <p style={{ color: "#444", margin: 0 }}>{rev.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}