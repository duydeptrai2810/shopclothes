// File: src/components/forgotPasswordPage.jsx
import { useState } from "react";
import { forgotPassword, resetPassword } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import "./authPage.css"; // Dùng chung CSS với trang Auth

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await forgotPassword(email);
            // Trong thực tế sẽ gửi qua mail, ở đây ta hiển thị luôn token để test cho nhanh
            setMessage({ type: "success", text: `Đã gửi mã! (Test token: ${res.resetToken})` });
            setStep(2);
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            await resetPassword(token, newPassword);
            alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            navigate("/auth");
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Hàm mới: Xử lý gửi lại mã
    const handleResendEmail = async () => {
        if (!email) return; // Nếu không có email thì không làm gì cả
        
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await forgotPassword(email);
            setMessage({ type: "success", text: `Đã gửi lại mã mới! (Test token mới: ${res.resetToken})` });
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '450px', margin: '50px auto' }}>
                <h2 className="auth-title">Khôi phục mật khẩu</h2>
                
                {message.text && (
                    <div className={`auth-message ${message.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '15px', color: message.type === 'error' ? 'red' : 'green' }}>
                        {message.text}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendEmail} className="auth-form">
                        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>Nhập email của bạn để nhận mã xác nhận đổi mật khẩu.</p>
                        <div className="input-group">
                            <Mail className="input-icon" size={20} />
                            <input type="email" placeholder="Email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="input-group">
                            <KeyRound className="input-icon" size={20} />
                            <input type="text" placeholder="Nhập mã xác nhận" value={token} onChange={(e) => setToken(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <Lock className="input-icon" size={20} />
                            <input type="password" placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </button>

                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                            <span style={{ color: '#666', fontSize: '14px' }}>Chưa nhận được mã? </span>
                            <span 
                                onClick={!loading ? handleResendEmail : undefined} 
                                style={{ 
                                    color: loading ? '#999' : '#4f46e5', 
                                    cursor: loading ? 'not-allowed' : 'pointer', 
                                    fontWeight: '500', 
                                    fontSize: '14px',
                                    textDecoration: 'underline'
                                }}
                            >
                                Gửi lại mã
                            </span>
                        </div>
                        {/* ============================================== */}
                        
                    
                    </form>
                )}

                <div className="auth-footer" style={{ marginTop: '20px' }}>
                    <Link to="/auth" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#4f46e5' }}>
                        <ArrowLeft size={16} /> Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}