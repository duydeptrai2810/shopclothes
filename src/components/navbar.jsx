import React, { useState, useContext } from "react";
import { Home, LayoutGrid, Sparkles, User, ShoppingCart, ShoppingBag, LogOut } from "lucide-react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/auth");
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate("/")}>
                    <ShoppingBag className="logo-icon" size={32} />
                    <span className="logo-text">FASHION HUB</span>
                </div>

                <div className="navbar-links">
                    <a href="/" className="nav-item active">
                        <Home size={20} />
                        <span>Trang chủ</span>
                    </a>
                    <a href="/products" className="nav-item">
                        <LayoutGrid size={20} />
                        <span>Sản phẩm</span>
                    </a>
                    <a href="/ai-suggest" className="nav-item">
                        <Sparkles size={20} />
                        <span>Gợi ý AI</span>
                    </a>
                </div>

                <div className="navbar-actions">
                    {/* Kiểm tra: Nếu có user thì hiện tên, không thì hiện nút Đăng nhập */}
                    {user ? (
                        <div 
                            className="user-profile-menu"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', color: '#333' }}
                        >
                            <User size={20} />
                            <span>{user.username}</span>

                            {/* Dropdown Đăng xuất hiện ra khi trỏ chuột (hover) */}
                            {isHovered && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    paddingTop: '15px', // Tạo khoảng trống để chuột không bị trượt mất
                                    zIndex: 1000,
                                    minWidth: '150px'
                                }}>
                                    <div style={{
                                        backgroundColor: '#fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        borderRadius: '8px',
                                        padding: '5px',
                                        border: '1px solid #eee'
                                    }}>
                                        <div 
                                                onClick={() => navigate('/profile')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333', padding: '10px', borderRadius: '4px', transition: '0.2s', fontWeight: 'normal' }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <User size={18} />
                                                <span>Hồ sơ cá nhân</span>
                                        </div>

                                        <div 
                                            onClick={handleLogout}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff3333', padding: '10px', borderRadius: '4px', transition: '0.2s', fontWeight: 'normal' }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff0f0'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <LogOut size={18} />
                                            <span>Đăng xuất</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/auth" className="login-link">
                            <User size={20} />
                            <span>Đăng nhập</span>
                        </a>
                    )}

                    <button className="cart-button">
                        <ShoppingCart size={20} />
                        <span>Giỏ hàng</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}