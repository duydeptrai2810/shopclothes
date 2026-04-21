import React, { useState, useEffect } from "react";
import { getListProduct } from "../api/productApi";
import { useNavigate } from "react-router-dom";
import "./ProductsPage.css";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Các trạng thái của bộ lọc
    const [gender, setGender] = useState("Tất cả");
    const [category, setCategory] = useState("Tất cả");

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const res = await getListProduct();
            if (res.success) {
                setProducts(res.data);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(item => {
        const matchGender = gender === "Tất cả" || item.gender_target === gender;
        const matchCategory = category === "Tất cả" || item.category_name === category;
        return matchGender && matchCategory;
    });

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1>Tất cả sản phẩm</h1>
                    <p>Tìm thấy {filteredProducts.length} sản phẩm</p>
                </div>

                <div className="products-layout">
                    <aside className="filter-sidebar">
                        <div className="filter-group">
                            <h3>Giới tính</h3>
                            {["Tất cả", "Nam", "Nữ", "Unisex"].map(g => (
                                <label key={g} className="radio-container">
                                    <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} />
                                    <span className="checkmark"></span> {g}
                                </label>
                            ))}
                        </div>

                        <div className="filter-group">
                            <h3>Danh mục</h3>
                            {["Tất cả", "Áo Thun", "Quần Jean", "Áo Hoodie", "Giày Dép", "Áo Khoác", "Váy Đầm", "Áo Sơ Mi", "Thể Thao"].map(c => (
                                <label key={c} className="radio-container">
                                    <input type="radio" name="category" checked={category === c} onChange={() => setCategory(c)} />
                                    <span className="checkmark"></span> {c}
                                </label>
                            ))}
                        </div>

                        <div className="filter-group">
                            <h3>Khoảng giá</h3>
                            <label className="radio-container">
                                <input type="radio" name="price" defaultChecked />
                                <span className="checkmark"></span> Tất cả
                            </label>
                            <label className="radio-container">
                                <input type="radio" name="price" />
                                <span className="checkmark"></span> Dưới 500k
                            </label>
                        </div>
                    </aside>

                    <main className="products-grid">
                        {loading ? (
                            <p>Đang tải...</p>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <div 
                                    key={product.product_id} 
                                    className="product-card"
                                    onClick={() => navigate(`/products/${product.product_id}`)}
                                >
                                    <div className="image-box">
                                        <img src={product.image_url} alt={product.name} />
                                        <span className="badge">{product.gender_target}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="cat-name">{product.category_name}</span>
                                        <h3 className="prod-name">{product.name}</h3>
                                        <div className="price-row">
                                            <span className="prod-price">
                                                {new Intl.NumberFormat("vi-VN").format(product.base_price)} ₫
                                            </span>
                                            <div className="color-dots">
                                                <span className="dot" style={{background: '#eee'}}></span>
                                                <span className="dot" style={{background: '#000'}}></span>
                                                <span className="dot" style={{background: '#555'}}></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}