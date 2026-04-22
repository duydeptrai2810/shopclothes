import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, ShieldCheck, Truck } from "lucide-react";
import { getProductDetail } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { AuthContext } from "../context/authContext";
import "./productDetail.css";
import ProductReviews from "./ProductReviews";
import { trackUserAction } from "../api/aiApi";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(""); 
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await getProductDetail(id);
                console.log("Dữ liệu gốc từ API:", res); // LOG ĐỂ KIỂM TRA

                if (res.success && res.data) {
                    setProduct(res.data);
                    
                    // Lấy danh sách biến thể (variants)
                    const variants = res.data.variants || [];
                    
                    // Nếu có biến thể, mặc định chọn size của biến thể đầu tiên
                    if (variants.length > 0) {
                        setSelectedSize(variants[0].size);
                    }
                    if (token) {
                    trackUserAction(token, id, "VIEW").catch(err => console.log(err));
                }
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleAddToCart = async () => {
        if (!token) {
            alert("Vui lòng đăng nhập!");
            return navigate("/auth");
        }

        // Tìm variant_id từ size đang chọn
        const variant = product.variants.find(v => v.size === selectedSize);

        if (!variant) {
            return alert("Vui lòng chọn kích thước!");
        }

        setAdding(true);
        try {
            const res = await addToCart(token, {
                variantId: variant.variant_id,
                quantity: quantity
            });
            if (res.success) {
                alert("Đã thêm vào giỏ hàng thành công!");
            }
        } catch (error) {
            alert("Lỗi server!");
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <div className="loading">Đang tải...</div>;
    if (!product || !product.info) return <div className="error">Sản phẩm không tồn tại!</div>;

    const { info, images, variants } = product;

    return (
        <div className="product-detail-container">
            <div className="product-detail-grid">
                <div className="product-images-section">
                    <div className="main-image">
                        <img src={images[0]?.image_url} alt={info.name} />
                    </div>
                </div>

                <div className="product-info-section">
                    <span className="brand-badge">{info.brand_name}</span>
                    <h1 className="product-title">{info.name}</h1>
                    
                    <div className="price-tag">
                        {new Intl.NumberFormat("vi-VN").format(info.base_price)} ₫
                    </div>

                    {/* --- PHẦN KÍCH THƯỚC (QUAN TRỌNG) --- */}
                    <div className="selection-group">
                        <p className="label">Kích thước: <strong>{selectedSize || "Chưa chọn"}</strong></p>
                        <div className="size-options">
                            {variants && variants.length > 0 ? (
                                // Loại bỏ các size trùng nhau nếu có nhiều màu
                                [...new Set(variants.map(v => v.size))].map(size => (
                                    <button 
                                        key={size}
                                        className={`size-btn ${selectedSize === size ? "active" : ""}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))
                            ) : (
                                <p className="no-data">Sản phẩm này hiện chưa có size.</p>
                            )}
                        </div>
                    </div>

                    <div className="quantity-control">
                        <p className="label">Số lượng:</p>
                        <div className="qty-input">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={adding}>
                            <ShoppingCart size={20} /> {adding ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}