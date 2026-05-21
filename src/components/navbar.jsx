import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
// Thêm icon ShieldCheck cho Admin
import { Home, LayoutGrid, Sparkles, User, ShoppingCart, ShoppingBag, LogOut, ShieldCheck } from "lucide-react";
import { AuthContext } from "../context/authContext";
import "./navbar.css";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/auth");
    };

    // Hàm kiểm tra đường dẫn đang hoạt động
    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">

                {/* LOGO */}
                <div className="navbar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <ShoppingBag className="logo-icon" size={32} />
                    <span className="logo-text">FASHION HUB</span>
                </div>

                {/* LINKS CHÍNH */}
                <div className="navbar-links">
                    <Link to="/" className={`nav-item ${isActive("/")}`}>
                        <Home size={20} />
                        <span>Trang chủ</span>
                    </Link>

                    <Link to="/products" className={`nav-item ${isActive("/products")}`}>
                        <LayoutGrid size={20} />
                        <span>Sản phẩm</span>
                    </Link>

                    <Link to="/ai-suggest" className={`nav-item ${isActive("/ai-suggest")}`}>
                        <Sparkles size={20} />
                        <span>Gợi ý AI</span>
                    </Link>
                </div>

                {/* ACTIONS (USER & CART) */}
                <div className="navbar-actions">
                    {user ? (
                        <div
                            className="user-profile-menu"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                fontWeight: "500",
                                color: "#333"
                            }}
                        >
                            <User size={20} />
                            <span>{user.username}</span>

                            {/* DROPDOWN MENU */}
                            {isHovered && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        right: "0",
                                        paddingTop: "15px",
                                        zIndex: 1000,
                                        minWidth: "180px"
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: "#fff",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            borderRadius: "8px",
                                            padding: "5px",
                                            border: "1px solid #eee"
                                        }}
                                    >
                                        {/* 1. Nút Trang quản trị (Chỉ dành cho ADMIN) */}
                                        {(user.role === 'ADMIN' || user.role === 'admin') && (
                                            <div
                                                onClick={() => navigate("/admin")}
                                                className={`menu-item ${isActive("/admin")}`}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    color: "#9c27b0", // Màu tím nổi bật cho Admin
                                                    padding: "10px",
                                                    borderRadius: "4px",
                                                    transition: "0.2s",
                                                    fontWeight: "600"
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3e8ff"}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                            >
                                                <ShieldCheck size={18} />
                                                <span>Trang quản trị</span>
                                            </div>
                                        )}

                                        {/* 2. Nút Hồ sơ cá nhân */}
                                        <div
                                            onClick={() => navigate("/profile")}
                                            className={`menu-item ${isActive("/profile")}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                color: "#333",
                                                padding: "10px",
                                                borderRadius: "4px",
                                                transition: "0.2s",
                                                fontWeight: "normal"
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                        >
                                            <User size={18} />
                                            <span>Hồ sơ cá nhân</span>
                                        </div>

                                        {/* 3. Nút Đăng xuất */}
                                        <div
                                            onClick={handleLogout}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                color: "#ff3333",
                                                padding: "10px",
                                                borderRadius: "4px",
                                                transition: "0.2s",
                                                fontWeight: "normal",
                                                borderTop: "1px solid #eee",
                                                marginTop: "5px"
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fff0f0"}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                        >
                                            <LogOut size={18} />
                                            <span>Đăng xuất</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* CHƯA ĐĂNG NHẬP */
                        <Link to="/auth" className={`login-link ${isActive("/auth")}`}>
                            <User size={20} />
                            <span>Đăng nhập</span>
                        </Link>
                    )}

                    {/* NÚT GIỎ HÀNG */}
                    <button className="cart-button" onClick={() => navigate("/cart")}>
                        <ShoppingCart size={20} />
                        <span>Giỏ hàng</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}