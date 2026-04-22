import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { orderApi } from '../api/orderApi';
import { paymentApi } from '../api/paymentApi';
import { getCart } from '../api/cartApi'; // SỬA: Import từ cartApi

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
                // SỬA: Dùng getCart thay vì previewCheckout
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
                alert(`Tạo đơn thành công! Mã thanh toán ảo của bạn là: ${paymentRes.data.transactionId}`);
            } else {
                alert('Đặt hàng thành công! Cửa hàng sẽ sớm giao hàng cho bạn.');
            }
            navigate('/profile'); 
        } catch (error) {
            alert('Lỗi đặt hàng: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải thông tin...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Thanh Toán</h2>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <form onSubmit={handlePlaceOrder} style={{ flex: '1', minWidth: '300px' }}>
                    <h3>Thông tin giao hàng</h3>
                    <input type="text" name="recipientName" placeholder="Họ và Tên" required value={formData.recipientName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginBottom: '15px' }} />
                    <input type="tel" name="recipientPhone" placeholder="Số điện thoại" required value={formData.recipientPhone} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginBottom: '15px' }} />
                    <textarea name="shippingAddress" placeholder="Địa chỉ chi tiết" required rows="3" value={formData.shippingAddress} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginBottom: '15px' }}></textarea>

                    <h3>Phương thức thanh toán</h3>
                    <label style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}>
                        <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} /> COD
                    </label>
                    <label style={{ display: 'block', marginBottom: '20px', cursor: 'pointer' }}>
                        <input type="radio" name="paymentMethod" value="VNPAY_SANDBOX" checked={formData.paymentMethod === 'VNPAY_SANDBOX'} onChange={handleInputChange} /> VNPAY Ảo
                    </label>
                    <button type="submit" disabled={submitting} style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', cursor: 'pointer' }}>XÁC NHẬN ĐẶT HÀNG</button>
                </form>

                <div style={{ flex: '1', minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                    {/* SỬA: Lấy độ dài mảng items */}
                    <h3>Tóm tắt ({previewData?.items?.length || 0} sản phẩm)</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                        <span>Tiền hàng:</span>
                        <strong>{previewData?.totalAmount?.toLocaleString('vi-VN')} đ</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CheckoutPage;