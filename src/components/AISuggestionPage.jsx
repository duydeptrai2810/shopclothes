import React, { useState, useEffect, useContext } from "react";
import { Sparkles, BrainCircuit, Zap, RefreshCcw, ShoppingBag } from "lucide-react";
import { AuthContext } from "../context/authContext";
import {getPersonalizedRecommendations} from "../api/aiApi";
import { useNavigate } from "react-router-dom";
import "./AISuggestionPage.css";

export default function AISuggestionPage() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load gợi ý khi vào trang
    useEffect(() => {
        if (token) {
            fetchAI();
        }
    }, [token]);

    const fetchAI = async () => {
        setLoading(true);
        try {
            const res = await getPersonalizedRecommendations(token);
            if (res.success) {
                setProducts(res.data || []);
            }
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Nếu chưa đăng nhập
    if (!token) {
        return (
            <div className="ai-page-unauth">
                <div className="ai-hero-section">
                    <div className="ai-icon-wrapper"><BrainCircuit size={48} /></div>
                    <h1>Gợi ý thông minh từ AI</h1>
                    <p>Vui lòng đăng nhập để AI có thể phân tích hành vi và đề xuất sản phẩm dành riêng cho bạn.</p>
                    <button className="ai-btn-primary" onClick={() => navigate("/auth")}>Đăng nhập ngay</button>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-suggestion-page">
            {/* 1. HERO SECTION */}
            <header className="ai-hero-section">
                <div className="ai-icon-wrapper pulse-animation">
                    <Sparkles size={40} color="#fff" />
                </div>
                <h1>Gợi ý thông minh từ AI</h1>
                <p>Hệ thống AI phân tích sở thích, phong cách và hành vi mua sắm của bạn để đề xuất những sản phẩm phù hợp nhất.</p>
                
                <div className="ai-hero-actions">
                    <button className="ai-btn-white" onClick={fetchAI} disabled={loading}>
                        <RefreshCcw size={18} className={loading ? "spin" : ""} />
                        {loading ? "Đang phân tích..." : "Phân tích lại sở thích"}
                    </button>
                </div>

                <div className="ai-stats-row">
                    <div className="stat-card"><h3>98%</h3><p>Độ chính xác</p></div>
                    <div className="stat-card"><h3>10K+</h3><p>Người dùng</p></div>
                    <div className="stat-card"><h3>AI</h3><p>Công nghệ</p></div>
                </div>
            </header>

            {/* 2. CÁCH AI HOẠT ĐỘNG (Dựa trên Logic BE) */}
            <section className="ai-how-it-works">
                <div className="container">
                    <h2 className="section-title">Cách AI hoạt động</h2>
                    <div className="how-grid">
                        <div className="step-card">
                            <div className="step-icon color-1"><Zap /></div>
                            <h4>Phân tích hành vi</h4>
                            <p>Thu thập và phân tích dữ liệu lịch sử xem và tương tác của bạn.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon color-2"><RefreshCcw /></div>
                            <h4>Học sở thích</h4>
                            <p>Xác định phong cách, giá cả và danh mục bạn ưa thích.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon color-3"><Sparkles /></div>
                            <h4>Đề xuất cá nhân</h4>
                            <p>Hiển thị danh sách sản phẩm tối ưu dành riêng cho bạn.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. DANH SÁCH SẢN PHẨM GỢI Ý */}
            <main className="container ai-results">
                <div className="results-header">
                    <div className="title-box">
                        <div className="mini-icon"><ShoppingBag size={20} /></div>
                        <div>
                            <h3>Sản phẩm được đề xuất</h3>
                            <p>Được chọn lọc bởi AI dành riêng cho bạn</p>
                        </div>
                    </div>
                    <span className="badge-count">{products.length} sản phẩm</span>
                </div>

                {loading ? (
                    <div className="ai-loading-state">Đang quét cơ sở dữ liệu...</div>
                ) : products.length > 0 ? (
                    <div className="product-grid">
                        {products.map((item) => (
                            <div key={item.product_id} className="ai-product-card" onClick={() => navigate(`/products/${item.product_id}`)}>
                                <div className="img-container">
                                    <img src={item.image_url} alt={item.name} />
                                    <span className="ai-tag">AI Pick</span>
                                </div>
                                <div className="card-body">
                                    <h4>{item.name}</h4>
                                    <div className="price-row">
                                        <span className="price">{new Intl.NumberFormat('vi-VN').format(item.base_price)}đ</span>
                                        <div className="color-dots">
                                            <span className="dot" style={{background: '#000'}}></span>
                                            <span className="dot" style={{background: '#555'}}></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="ai-empty">
                        <p>Bạn chưa có hành vi mua sắm nào để AI phân tích. Hãy dạo quanh cửa hàng nhé!</p>
                        <button className="ai-btn-primary" onClick={() => navigate("/")}>Khám phá ngay</button>
                    </div>
                )}
            </main>
        </div>
    );
}