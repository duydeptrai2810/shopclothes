import React, { useEffect, useState } from "react";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getListProduct } from "../api/productApi"; // Đường dẫn file api của bạn
import "./productSection.css";

export default function ProductSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await getListProduct(1,4);
                if (res.success) {
                    setProducts(res.data);
                }
            } catch (error) {
                console.error("Lỗi fetch sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <div className="loading">Đang tải sản phẩm...</div>;

    return (
        <section className="featured-section">
            <div className="container">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Sản phẩm nổi bật</h2>
                        <p className="section-subtitle">Khám phá những thiết kế mới nhất từ các thương hiệu</p>
                    </div>
                    <button className="view-all-btn" onClick={() => navigate("/products")}>
                        Xem tất cả <ChevronRight size={18} />
                    </button>
                </div>

                <div className="product-grid">
                    {products.map((item) => (
                        <div 
                            key={item.product_id} 
                            className="product-card"
                            onClick={() => navigate(`/products/${item.product_id}`)}
                        >
                            <div className="product-image">
                                <img 
                                    src={item.image_url || "https://via.placeholder.com/300x400?text=No+Image"} 
                                    alt={item.name} 
                                />
                                <div className="hover-action">
                                    <button className="add-to-cart-quick">
                                        <ShoppingCart size={18} /> Thêm vào giỏ
                                    </button>
                                </div>
                            </div>

                            <div className="product-details">
                                <div className="brand-category">
                                    <span className="category-tag">{item.category_name}</span>
                                    <span className="brand-name">{item.brand_name}</span>
                                </div>
                                <h3 className="product-name">{item.name}</h3>
                                <p className="product-price">
                                    {new Intl.NumberFormat("vi-VN").format(item.base_price)} ₫
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}