import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { orderApi } from '../api/orderApi';
import { paymentApi } from '../api/paymentApi';

import { getCart } from '../api/cartApi';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, CheckCircle } from 'lucide-react';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        recipientName: '',
        recipientPhone: '',
        shippingAddress: '',
        paymentMethod: 'COD' 
    });

    useEffect(() => {
        const fetchPreview = async () => {
            try {

                const res = await getCart(token);
                if (res.success && res.data.items.length > 0) {
                    setPreviewData(res.data);
                } else {
                    alert('Giỏ hàng trống!');
                    navigate('/cart');
                }
            } catch (error) {
                console.error(error);
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchPreview();
    }, [token, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const orderRes = await orderApi.placeOrder(token, formData);
            if (!orderRes.success) throw new Error(orderRes.message);
            
            const orderId = orderRes.data.orderId;

            if (formData.paymentMethod === 'VNPAY_SANDBOX') {
                const paymentRes = await paymentApi.createIntent(token, orderId, 'VNPAY_SANDBOX');

                alert(`Tạo đơn thành công! Mã giao dịch: ${paymentRes.data.transactionId}`);
            } else {
                alert('Đặt hàng thành công! Cửa hàng sẽ sớm liên hệ xác nhận.');
            }
            navigate('/profile'); 
        } catch (error) {
            alert('Lỗi đặt hàng: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) return <div className="loading">Đang tải thông tin thanh toán...</div>;

    return (
        <div className="checkout-page">
            {/* Header rực rỡ */}
            <header className="checkout-header">
                <div className="container header-wrap">
                    <button className="back-btn" onClick={() => navigate('/cart')}>
                        <ArrowLeft size={24} />
                    </button>
                    <div className="header-info">
                        <div className="header-icon"><CreditCard size={28} /></div>
                        <div>
                            <h1>Thanh Toán</h1>
                            <p>Hoàn tất đơn hàng của bạn</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container checkout-layout">
                {/* Cột trái: Form nhập liệu */}
                <form className="checkout-main" onSubmit={handlePlaceOrder}>
                    <section className="form-card shadow-card">
                        <div className="card-title">
                            <div className="title-icon"><Truck size={20} /></div>
                            <h3>Thông tin giao hàng</h3>
                        </div>
                        
                        <div className="input-group">
                            <label><CheckCircle size={14}/> Họ và tên</label>
                            <input type="text" name="recipientName" placeholder="Ví dụ: Nguyễn Văn A" required value={formData.recipientName} onChange={handleInputChange} />
                        </div>

                        <div className="input-group">
                            <label><CheckCircle size={14}/> Số điện thoại</label>
                            <input type="tel" name="recipientPhone" placeholder="Ví dụ: 0123456789" required value={formData.recipientPhone} onChange={handleInputChange} />
                        </div>

                        <div className="input-group">
                            <label><CheckCircle size={14}/> Địa chỉ chi tiết</label>
                            <textarea name="shippingAddress" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" required rows="3" value={formData.shippingAddress} onChange={handleInputChange}></textarea>
                        </div>
                    </section>

                    <section className="form-card shadow-card mt-30">
                        <div className="card-title">
                            <div className="title-icon"><CreditCard size={20} /></div>
                            <h3>Phương thức thanh toán</h3>
                        </div>

                        <div className="payment-options">
                            <label className={`payment-item ${formData.paymentMethod === 'COD' ? 'active' : ''}`}>
                                <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} />
                                <div className="payment-info">
                                    <strong>COD</strong>
                                    <span>Thanh toán khi nhận hàng</span>
                                </div>
                            </label>

                            <label className={`payment-item ${formData.paymentMethod === 'VNPAY_SANDBOX' ? 'active' : ''}`}>
                                <input type="radio" name="paymentMethod" value="VNPAY_SANDBOX" checked={formData.paymentMethod === 'VNPAY_SANDBOX'} onChange={handleInputChange} />
                                <div className="payment-info">
                                    <strong>VNPAY</strong>
                                    <span>Thanh toán qua ví điện tử VNPAY (Thử nghiệm)</span>
                                </div>
                            </label>
                        </div>
                    </section>
                </form>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <aside className="checkout-sidebar">
                    <div className="summary-card shadow-card">
                        <h3>Tóm tắt ({previewData?.items?.length || 0} sản phẩm)</h3>
                        
                        <div className="order-items-list">
                            {previewData?.items?.map((item, idx) => (
                                <div key={idx} className="mini-product-card">
                                    <img src={item.image_url} alt={item.product_name} />
                                    <div className="mini-info">
                                        <h4>{item.product_name}</h4>
                                        <span>x{item.quantity}</span>
                                    </div>
                                    <div className="mini-price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-details">
                            <div className="row">
                                <span>Tiền hàng</span>
                                <strong>{previewData?.totalAmount?.toLocaleString('vi-VN')} đ</strong>
                            </div>
                            <div className="row">
                                <span>Phí vận chuyển</span>
                                <span className="free-text">Miễn phí</span>
                            </div>
                            <div className="row total-row">
                                <span>Tổng cộng</span>
                                <span className="final-price">{previewData?.totalAmount?.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <button className="confirm-btn" onClick={handlePlaceOrder} disabled={submitting}>
                           <CheckCircle size={20} /> {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                        </button>

                        <div className="safety-box">
                            <ShieldCheck size={16} />
                            <div>
                                <strong>Đảm bảo an toàn</strong>
                                <p>Thông tin của bạn được bảo mật và mã hóa</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;