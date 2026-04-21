import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart, Heart, ShieldCheck, Truck } from "lucide-react";
import { getProductDetail } from "../api/productApi";
import "./productDetail.css";

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchDetail = async () => {
            const res = await getProductDetail(id);
            if (res.success) {
                setProduct(res.data);
                // Mặc định chọn size đầu tiên nếu có
                if (res.data.variants.length > 0) {
                    setSelectedSize(res.data.variants[0].size);
                }
            }
            setLoading(false);
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="loading">Đang tải...</div>;
    if (!product) return <div className="error">Sản phẩm không tồn tại!</div>;

    const { info, images, variants } = product;

    return (
        <div className="product-detail-container">
            <div className="product-detail-grid">
                {/* Cột trái: Hình ảnh */}
                <div className="product-images-section">
                    <div className="main-image">
                        <img src={images[0]?.image_url} alt={info.name} />
                    </div>
                    <div className="thumbnail-list">
                        {images.map((img, index) => (
                            <img key={index} src={img.image_url} alt="thumbnail" />
                        ))}
                    </div>
                </div>

                {/* Cột phải: Thông tin */}
                <div className="product-info-section">
                    <span className="brand-badge">{info.brand_name}</span>
                    <h1 className="product-title">{info.name}</h1>
                    <p className="product-category">{info.category_name} | {info.material || "Chất liệu cao cấp"}</p>
                    
                    <div className="price-tag">
                        {new Intl.NumberFormat("vi-VN").format(info.base_price)} ₫
                    </div>

                    <div className="selection-group">
                        <label>Chọn kích thước:</label>
                        <div className="size-options">
                            {[...new Set(variants.map(v => v.size))].map(size => (
                                <button 
                                    key={size}
                                    className={`size-btn ${selectedSize === size ? "active" : ""}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="quantity-control">
                        <label>Số lượng:</label>
                        <div className="qty-input">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="add-to-cart-btn">
                            <ShoppingCart size={20} /> Thêm vào giỏ hàng
                        </button>
                        <button className="wishlist-btn">
                            <Heart size={20} />
                        </button>
                    </div>

                    <div className="policy-highlights">
                        <div className="policy-item">
                            <Truck size={20} />
                            <span>Giao hàng miễn phí toàn quốc</span>
                        </div>
                        <div className="policy-item">
                            <ShieldCheck size={20} />
                            <span>Bảo hành chính hãng 12 tháng</span>
                        </div>
                    </div>

                    <div className="product-description">
                        <h3>Mô tả sản phẩm</h3>
                        <p>{info.description || "Chưa có mô tả cho sản phẩm này."}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}