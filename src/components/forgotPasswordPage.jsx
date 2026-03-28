// File: src/components/forgotPasswordPage.jsx
import { useState } from "react";
import { forgotPassword, resetPassword } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import './authPage.css';
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
        <div className="auth-page">
            <div className="auth-form-section">
                <div className="auth-form-container">
                    {/* Phần Logo giống trang Auth */}
                    <div className="auth-logo">
                        <div className="logo-text-gradient" style={{fontSize: '28px'}}>Khôi phục mật khẩu</div>
                    </div>

                    <div className="auth-header">
                        <h1>{step === 1 ? "Quên mật khẩu?" : "Xác thực mã"}</h1>
                        <p>{step === 1 
                            ? "Nhập email của bạn để nhận mã xác nhận." 
                            : "Vui lòng nhập mã và mật khẩu mới."}
                        </p>
                    </div>
                    
                    {/* Phần hiển thị thông báo lỗi/thành công */}
                    {message.text && (
                        <div className={`message-banner ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendEmail} className="auth-form">
                            <div className="input-group">
                                <label>Email</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={20} />
                                    <input type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="auth-form">
                            <div className="input-group">
                                <label>Mã xác nhận</label>
                                <div className="input-wrapper">
                                    <KeyRound className="input-icon" size={20} />
                                    <input type="text" placeholder="Nhập mã xác nhận" value={token} onChange={(e) => setToken(e.target.value)} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Mật khẩu mới</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input type="password" placeholder="********" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                            </button>

                            <div className="toggle-auth">
                                Chưa nhận được mã? <span onClick={!loading ? handleResendEmail : undefined}>Gửi lại mã</span>
                            </div>
                        </form>
                    )}

                    <div className="auth-footer" style={{ marginTop: '30px', textAlign: 'center' }}>
                        <Link to="/auth" className="forgot-pw" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <ArrowLeft size={16} /> Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>

            {/* Phần Info Section bên phải (giống trang đăng nhập) */}
            <div className="auth-info-section">
                <div className="info-content">
                    <div className="info-icon-wrapper">
                        <Lock size={40} color="white" />
                    </div>
                    <h2>Bảo mật tài khoản</h2>
                    <p>Đảm bảo mật khẩu của bạn có ít nhất 8 ký tự bao gồm chữ cái và số để bảo vệ thông tin cá nhân tốt nhất.</p>
                </div>
            </div>
        </div>
    );
}