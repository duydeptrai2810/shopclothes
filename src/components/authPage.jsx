import { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { login as loginApi, register as registerApi } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, CheckCircle2, Sparkles, ShoppingBag } from "lucide-react";
import "./authPage.css";

export default function AuthPage() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmpassword: ""
    });

    const [isLogin, setLogin] = useState(true);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login: contextLogin } = useContext(AuthContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            setServerError("");

            const responseData = await loginApi(
                formData.email,
                formData.password
            );

            const token = responseData.data.accessToken;
            const user = responseData.data.user;

            contextLogin(token, user);

            alert("Đăng nhập thành công!");
            navigate("/dashboard");

        } catch (error) {
            setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            setLoading(true);
            setServerError("");

            await registerApi(
                formData.name,
                formData.email,
                formData.password
            );

            alert("Đăng ký thành công! Vui lòng đăng nhập.");

            setLogin(true);
            setFormData({
                ...formData,
                password: "",
                confirmpassword: ""
            });

        } catch (error) {
            setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};

        if (!isLogin && !formData.name) {
            newErrors.name = "Họ và tên là bắt buộc!";
        }

        if (!formData.email) {
            newErrors.email = "Email là bắt buộc!";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ!";
        }

        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc!";
        }

        if (!isLogin) {
            if (!formData.confirmpassword) {
                newErrors.confirmpassword = "Vui lòng xác nhận mật khẩu!";
            } else if (formData.confirmpassword !== formData.password) {
                newErrors.confirmpassword = "Mật khẩu xác nhận không khớp!";
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            if (isLogin) {
                await handleLogin();
            } else {
                await handleRegister();
            }
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-form-section">

                <div className="auth-form-container">

                    <div className="auth-logo">
                        <ShoppingBag className="logo-icon-purple" />
                        <span className="logo-text-gradient">FASHION HUB</span>
                    </div>

                    <div className="auth-header">
                        <h1>{isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}</h1>
                        <p>
                            {isLogin
                                ? "Đăng nhập để tiếp tục mua sắm"
                                : "Tham gia cộng đồng thời trang hiện đại"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="actual-form">

                        {!isLogin && (
                            <div className="input-group">
                                <label>Họ và tên</label>
                                <div className="input-wrapper">
                                    <User className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>
                        )}

                        <div className="input-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                />
                            </div>
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="input-group">
                            <label>Mật khẩu</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />

                                <div
                                    className="eye-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>

                            {!isLogin && (
                                <small className="hint">
                                    Tối thiểu 6 ký tự
                                </small>
                            )}

                            {errors.password && (
                                <span className="error-text">
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="input-group">
                                <label>Xác nhận mật khẩu</label>

                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />

                                    <input
                                        type="password"
                                        name="confirmpassword"
                                        value={formData.confirmpassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                </div>

                                {errors.confirmpassword && (
                                    <span className="error-text">
                                        {errors.confirmpassword}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="form-options">

                            <label className="checkbox-container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>

                                {isLogin
                                    ? "Ghi nhớ đăng nhập"
                                    : "Tôi đồng ý với Điều khoản và Chính sách"}
                            </label>

                            {isLogin && (
                                <Link to="/forgot-password" className="forgot-pw">
                                    Quên mật khẩu?
                                </Link>
                            )}

                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Đang xử lý..."
                                : (isLogin ? "Đăng nhập" : "Đăng ký")}
                        </button>

                        {serverError && (
                            <p className="server-error">
                                {serverError}
                            </p>
                        )}

                        <div className="divider">
                            <span>Hoặc tiếp tục với</span>
                        </div>

                        <div className="social-btns">

                            <button type="button" className="social-btn google">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg"
                                    alt="Google"
                                />
                                Google
                            </button>

                            <button type="button" className="social-btn facebook">
                                Facebook
                            </button>

                        </div>

                        <p className="toggle-auth">
                            {isLogin
                                ? "Chưa có tài khoản? "
                                : "Đã có tài khoản? "}

                            <span onClick={() => setLogin(!isLogin)}>
                                {isLogin
                                    ? "Đăng ký ngay"
                                    : "Đăng nhập ngay"}
                            </span>
                        </p>

                    </form>

                </div>

            </div>

            <div className="auth-info-section">

                <div className="info-content">

                    <div className="info-icon-wrapper">
                        <Sparkles size={40} color="white" />
                    </div>

                    {isLogin ? (
                        <>
                            <h2>Khám phá phong cách của bạn</h2>

                            <p>
                                Tham gia cộng đồng Fashion Hub để nhận được gợi ý thời trang cá nhân hóa từ AI và ưu đãi độc quyền.
                            </p>

                            <ul className="feature-list">

                                <li>
                                    <CheckCircle2 size={20} />
                                    <div>
                                        <strong>Gợi ý AI thông minh:</strong>
                                        Sản phẩm đề xuất phù hợp với bạn
                                    </div>
                                </li>

                                <li>
                                    <CheckCircle2 size={20} />
                                    <div>
                                        <strong>Ưu đãi độc quyền:</strong>
                                        Giảm giá đặc biệt cho thành viên
                                    </div>
                                </li>

                                <li>
                                    <CheckCircle2 size={20} />
                                    <div>
                                        <strong>Miễn phí vận chuyển:</strong>
                                        Cho tất cả đơn hàng thành viên
                                    </div>
                                </li>

                            </ul>
                        </>
                    ) : (
                        <>
                            <h2>Bắt đầu hành trình thời trang</h2>

                            <p>
                                Tạo tài khoản để trải nghiệm mua sắm thông minh với công nghệ AI và nhận nhiều ưu đãi hấp dẫn.
                            </p>

                            <div className="stats-grid">

                                <div className="stat-card">
                                    <h3>10K+</h3>
                                    <p>Thành viên</p>
                                </div>

                                <div className="stat-card">
                                    <h3>500+</h3>
                                    <p>Sản phẩm</p>
                                </div>

                                <div className="stat-card">
                                    <h3>98%</h3>
                                    <p>Hài lòng</p>
                                </div>

                                <div className="stat-card">
                                    <h3>AI</h3>
                                    <p>Công nghệ</p>
                                </div>

                            </div>
                        </>
                    )}

                </div>

            </div>

        </div>
    );
}