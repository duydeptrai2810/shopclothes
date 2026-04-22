import React, { useState, useEffect, useContext } from "react";
import { Trash2, Plus, Minus, ShoppingBag, LogIn, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { getCart, updateCartQuantity, removeCartItem } from "../api/cartApi";
import "./CartPage.css";

export default function CartPage() {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);

    // 1. Fetch data
    useEffect(() => {
        if (token) {
            fetchCartData(true);
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchCartData = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await getCart(token);
            if (res.success) {
                setCartItems(res.data.items || []);
                setTotalAmount(res.data.totalAmount || 0);
            }
        } catch (error) {
            console.error("Lỗi fetch giỏ hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Cập nhật số lượng
    const handleUpdateQty = async (itemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;
        try {
            const res = await updateCartQuantity(token, itemId, newQty);
            if (res.success) fetchCartData(false);
        } catch (error) {
            console.error("Lỗi cập nhật số lượng:", error);
        }
    };

    // 3. Xóa sản phẩm (Cập nhật UI tức thì)
    const handleDeleteItem = async (itemId) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            try {
                const res = await removeCartItem(token, itemId);
                if (res.success) {
                    setCartItems(prev => prev.filter(item => item.cart_item_id != itemId));
                    fetchCartData(false); 
                }
            } catch (error) {
                console.error("Lỗi xóa sản phẩm:", error);
            }
        }
    };

    if (loading) return <div className="loading">Đang chuẩn bị giỏ hàng...</div>;

    // GIAO DIỆN CHƯA ĐĂNG NHẬP
    if (!token) {
        return (
            <div className="cart-page">
                <div className="container centered-wrapper">
                    <div className="status-card shadow-card">
                        <div className="status-icon-box">
                            <LogIn size={40} color="#fff" />
                        </div>
                        <h2>Dừng lại một chút!</h2>
                        <p>Vui lòng đăng nhập để xem những món đồ bạn đã chọn và tiến hành thanh toán.</p>
                        <button className="checkout-btn" onClick={() => navigate("/auth")}>
                            ĐĂNG NHẬP NGAY <ArrowRight size={18} style={{marginLeft: '8px'}}/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <header className="cart-header">
                <div className="container header-content">
                    <div className="icon-box">
                        <ShoppingBag size={28} color="#fff" />
                    </div>
                    <div>
                        <h1>Giỏ hàng</h1>
                        <p>{cartItems.length} món đồ trong danh sách</p>
                    </div>
                </div>
            </header>

            <div className="container main-content">
                {cartItems.length > 0 ? (
                    /* CÓ HÀNG: HIỆN 2 CỘT */
                    <div className="cart-layout">
                        <div className="cart-list">
                            {cartItems.map((item) => (
                                <div key={item.cart_item_id} className="cart-item-card">
                                    <img 
                                        src={item.image_url} 
                                        alt={item.product_name} 
                                        className="item-img clickable"
                                        onClick={() => navigate(`/products/${item.product_id}`)}
                                    />
                                    <div className="item-info">
                                        <div className="item-title-row">
                                            <h3 onClick={() => navigate(`/products/${item.product_id}`)} className="clickable">
                                                {item.product_name}
                                            </h3>
                                            <button className="delete-btn" onClick={() => handleDeleteItem(item.cart_item_id)}>
                                                <Trash2 size={20} color="#ff4d4d" />
                                            </button>
                                        </div>
                                        <div className="item-meta">
                                            <span className="size-badge">Màu: {item.color}</span>
                                            <span className="size-badge">Size: {item.size}</span>
                                        </div>
                                        <div className="item-footer">
                                            <div className="qty-controls">
                                                <button onClick={() => handleUpdateQty(item.cart_item_id, item.quantity, -1)}><Minus size={16}/></button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => handleUpdateQty(item.cart_item_id, item.quantity, 1)}><Plus size={16}/></button>
                                            </div>
                                            <div className="price-box">
                                                <p className="item-total">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ</p>
                                                <p className="item-unit">{new Intl.NumberFormat('vi-VN').format(item.price)}đ / cái</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="cart-summary shadow-card">
                            <h3>Tóm tắt đơn hàng</h3>
                            <div className="summary-details">
                                <div className="row"><span>Tạm tính</span><span>{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</span></div>
                                <div className="row"><span>Giao hàng</span><span className="free">Miễn phí</span></div>
                                <div className="row total-row"><span>Tổng cộng</span><span>{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</span></div>
                            </div>
                            <button className="checkout-btn" onClick={() => navigate('/checkout')}>THANH TOÁN NGAY</button>
                        </aside>
                    </div>
                ) : (
                    /* TRỐNG: HIỆN CARD CĂN GIỮA */
                    <div className="centered-wrapper" style={{minHeight: '60vh'}}>
                        <div className="status-card shadow-card">
                            <div className="status-icon-box secondary-gradient">
                                <ShoppingBag size={40} color="#fff" />
                            </div>
                            <h3>Trống trải quá...</h3>
                            <p>Hãy khám phá thêm nhiều sản phẩm mới để lấp đầy giỏ hàng của bạn.</p>
                            <button className="discover-btn" style={{maxWidth: '280px'}} onClick={() => navigate('/')}>
                                KHÁM PHÁ NGAY
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}