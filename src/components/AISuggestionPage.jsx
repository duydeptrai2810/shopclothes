import React, { useState, useEffect, useContext } from "react";
import { Sparkles, BrainCircuit, Zap, RefreshCcw, ShoppingBag, LogIn, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/authContext";
import { getPersonalizedRecommendations } from "../api/aiApi"; // Đảm bảo import đúng hàm này
import { useNavigate } from "react-router-dom";
import "./AISuggestionPage.css";

export default function AISuggestionPage() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Tự động load khi vào trang
    useEffect(() => {
        if (token) {
            fetchAI();
        }
    }, [token]);

    const fetchAI = async () => {
        setLoading(true);
        try {
            // Backend của bạn sẽ trả về Gợi ý cá nhân hóa 
            // HOẶC Top bán chạy (nếu chưa có lịch sử) trong cùng 1 API này
            const res = await getPersonalizedRecommendations(token);
            
            if (res.success) {
                // Gán dữ liệu vào state để hiển thị
                setProducts(res.data || []);
            } else {
                console.error("Server message:", res.message);
            }
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // GIAO DIỆN KHI CHƯA ĐĂNG NHẬP (Giữ nguyên cấu trúc bạn yêu cầu)
    if (!token) {
        return (
            <div className="ai-suggestion-page unauth-bg">
                <div className="container centered-wrapper">
                    <div className="status-card shadow-card">
                        <div className="status-icon-box ai-icon-bg">
                            <BrainCircuit size={40} color="#fff" />
                        </div>
                        <h2>Trải nghiệm AI cá nhân hóa</h2>
                        <p>Đăng nhập ngay để hệ thống AI của Fashion Hub bắt đầu phân tích phong cách và đưa ra những đề xuất "chữa lành" tủ đồ của bạn.</p>
                        <button className="ai-btn-primary" onClick={() => navigate("/auth")}>
                            ĐĂNG NHẬP NGAY <ArrowRight size={18} style={{marginLeft: '8px'}}/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-suggestion-page">
            {/* 1. HERO SECTION (TĨNH) */}
            <header className="ai-hero-section">
                <div className="container">
                    <div className="ai-icon-wrapper pulse-animation">
                        <Sparkles size={40} color="#fff" />
                    </div>
                    <h1>Gợi ý thông minh từ AI</h1>
                    <p>Hệ thống AI phân tích sở thích, phong cách và hành vi mua sắm của bạn để đề xuất những sản phẩm phù hợp nhất.</p>
                    
                    <div className="ai-hero-actions">
                        <button className="ai-btn-white" onClick={fetchAI} disabled={loading}>
                            <RefreshCcw size={18} className={loading ? "spin" : ""} />
                            {loading ? "Đang quét dữ liệu..." : "LÀM MỚI GỢI Ý"}
                        </button>
                    </div>

                    <div className="ai-stats-row">
                        <div className="stat-card"><h3>98%</h3><p>Độ chính xác</p></div>
                        <div className="stat-card"><h3>10K+</h3><p>Người dùng</p></div>
                        <div className="stat-card"><h3>AI</h3><p>Công nghệ</p></div>
                    </div>
                </div>
            </header>

            {/* 2. CÁCH AI HOẠT ĐỘNG (TĨNH) */}
            <section className="ai-how-it-works">
                <div className="container">
                    <h2 className="section-title">Cách AI hoạt động</h2>
                    <div className="how-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-icon color-1"><Zap size={24}/></div>
                            <h4>Phân tích hành vi</h4>
                            <p>Thu thập dữ liệu từ lịch sử xem, tìm kiếm và sản phẩm bạn quan tâm.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-icon color-2"><RefreshCcw size={24}/></div>
                            <h4>Học hỏi sở thích</h4>
                            <p>Xác định gu thời trang, màu sắc và mức giá phù hợp với bạn nhất.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-icon color-3"><Sparkles size={24}/></div>
                            <h4>Đề xuất cá nhân</h4>
                            <p>Tạo ra danh sách sản phẩm tối ưu, dành riêng cho một mình bạn.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. DANH SÁCH SẢN PHẨM GỢI Ý (ĐỘNG) */}
            <main className="container ai-results-section">
                <div className="results-header">
                    <div className="title-box">
                        <div className="mini-icon"><ShoppingBag size={20} /></div>
                        <div>
                            <h3>Sản phẩm dành cho bạn</h3>
                            <p>{products.length > 0 ? "Dựa trên xu hướng và sở thích cá nhân" : "Đang tìm kiếm xu hướng mới nhất"}</p>
                        </div>
                    </div>
                    {products.length > 0 && <span className="badge-count">✨ {products.length} đề xuất</span>}
                </div>

                {loading ? (
                    <div className="ai-loading-state">
                        <div className="loader-dots"><span></span><span></span><span></span></div>
                        <p>AI đang phân tích phong cách của bạn...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="product-grid">
                        {products.map((item) => (
                            <div 
                                key={item.product_id} 
                                className="ai-product-card" 
                                onClick={() => navigate(`/products/${item.product_id}`)}
                            >
                                <div className="img-container">
                                    <img 
                                        src={item.image_url || "https://via.placeholder.com/300x400"} 
                                        alt={item.name} 
                                    />
                                    {/* Backend không phân biệt loại gợi ý, nên ta để chung là AI Pick */}
                                    <div className="ai-tag">✨ AI Pick</div>
                                </div>
                                <div className="card-body">
                                    <h4>{item.name}</h4>
                                    <div className="price-row">
                                        <span className="price">
                                            {new Intl.NumberFormat('vi-VN').format(item.base_price)}đ
                                        </span>
                                        <div className="color-dots">
                                            <span className="dot" style={{background: '#333'}}></span>
                                            <span className="dot" style={{background: '#888'}}></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* CHỈ HIỆN KHI CẢ CÁ NHÂN HÓA VÀ TOP BÁN CHẠY ĐỀU KHÔNG CÓ DỮ LIỆU (DATABASE TRỐNG) */
                    <div className="ai-empty-state shadow-card">
                        <div className="empty-icon"><ShoppingBag size={48} color="#d946ef" /></div>
                        <h3>Hệ thống đang cập nhật</h3>
                        <p>Dữ liệu gợi ý đang được chuẩn bị. Hãy khám phá các sản phẩm khác trong lúc chờ đợi nhé!</p>
                        <button className="ai-btn-primary" onClick={() => navigate("/")}>Khám phá ngay</button>
                    </div>
                )}
            </main>
        </div>
    );
}