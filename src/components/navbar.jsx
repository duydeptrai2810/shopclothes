import React from "react";
import { Home, LayoutGrid, Sparkles, User, ShoppingCart, ShoppingBag } from "lucide-react";
import "./navbar.css";

export default function Navbar() {
    return (

        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
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
                    <a href="/auth" className="login-link">
                        <User size={20} />
                        <span>Đăng nhập</span>
                    </a>
                    <button className="cart-button">
                        <ShoppingCart size={20} />
                        <span>Giỏ hàng</span>
                    </button>
                </div>
            </div>
        </nav>


    );
}