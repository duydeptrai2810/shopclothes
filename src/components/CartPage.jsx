import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, Ticket } from "lucide-react";
import "./CartPage.css";

export default function CartPage() {
    const [cartItems, setCartItems] = useState([
        // Dữ liệu giả lập để hiển thị giống ảnh ngay lập tức
        { id: 1, name: "Áo Thun Basic Premium", color: "Trắng", colorHex: "#e879f9", size: "M", price: 299000, quantity: 2, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
        { id: 2, name: "Quần Jean Slim Fit", color: "Xanh đậm", colorHex: "#6366f1", size: "L", price: 599000, quantity: 1, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500" }
    ]);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const updateQty = (id, delta) => {
        setCartItems(prev => prev.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    return (
        <div className="cart-page">
            {/* Header màu Gradient */}
            <header className="cart-header">
                <div className="container">
                    <div className="header-content">
                        <div className="icon-box">
                            <ShoppingBag size={28} color="#fff" />
                        </div>
                        <div>
                            <h1>Giỏ hàng của bạn</h1>
                            <p>{cartItems.length} sản phẩm</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container cart-layout">
                {/* Danh sách sản phẩm */}
                <div className="cart-list">
                    {cartItems.map((item) => (
                        <div key={item.id} className="cart-item-card">
                            <img src={item.image} alt={item.name} className="item-img" />
                            <div className="item-info">
                                <div className="item-title-row">
                                    <h3>{item.name}</h3>
                                    <button className="delete-btn"><Trash2 size={20} color="#999" /></button>
                                </div>
                                <div className="item-meta">
                                    <span className="dot" style={{background: item.colorHex}}></span>
                                    <span>{item.color}</span>
                                    <span className="size-badge">Size: {item.size}</span>
                                </div>
                                <div className="item-footer">
                                    <div className="qty-controls">
                                        <button onClick={() => updateQty(item.id, -1)}><Minus size={16}/></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQty(item.id, 1)}><Plus size={16}/></button>
                                    </div>
                                    <div className="price-box">
                                        <p className="item-total">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ</p>
                                        <p className="item-unit">{new Intl.NumberFormat('vi-VN').format(item.price)}đ / sản phẩm</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tóm tắt đơn hàng */}
                <aside className="cart-summary">
                    <h3>Tóm tắt đơn hàng</h3>
                    <div className="promo-section">
                        <label>Mã giảm giá</label>
                        <div className="promo-input">
                            <Ticket className="input-icon" size={20} color="#999" />
                            <input type="text" placeholder="Nhập mã giảm giá" />
                            <button className="apply-btn">Áp dụng</button>
                        </div>
                        <p className="promo-hint">Thử: WELCOME10, SUMMER20, VIP30</p>
                    </div>

                    <div className="summary-details">
                        <div className="row">
                            <span>Tạm tính</span>
                            <span>{new Intl.NumberFormat('vi-VN').format(subtotal)}đ</span>
                        </div>
                        <div className="row">
                            <span>Phí vận chuyển</span>
                            <span className="free">Miễn phí</span>
                        </div>
                        <hr />
                        <div className="row total-row">
                            <span>Tổng cộng</span>
                            <span className="total-price">{new Intl.NumberFormat('vi-VN').format(total)}đ</span>
                        </div>
                    </div>
                    <button className="checkout-btn">Thanh toán ngay</button>
                </aside>
            </div>
        </div>
    );
}