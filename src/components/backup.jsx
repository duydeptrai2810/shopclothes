
import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { login, register } from "../api/authApi";
import { useNavigate } from "react-router-dom";
export default function authPage() {
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
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
    const handleLogin = async () => {
        try {
            setLoading(true);
            setServerError("");
            const data = await login(
                formData.email,
                formData.password
            );
            console.log("Login success:", data);
            localStorage.setItem("token", data.token);
            alert("Đăng nhập thành công!");
            navigate("/");
        } catch (error) {
            setServerError(error.message);
        } finally {
            setLoading(false);
        }
        console.log("handleLogin called");
    };
    const handleRegister = async () => {
        try {
            setLoading(true);
            setServerError("");
            const data = await register(
                formData.name,
                formData.email,
                formData.password
            );
            console.log("Register success:", data);
            alert("Đăng ký thành công!");
            setLogin(true);
            code
            Code
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
            newErrors.name = "Name is required!";
        }
        if (!formData.email) {
            newErrors.email = "Email is required!";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid!";
        }
        if (!formData.password) {
            newErrors.password = "Password is required!";
        }
        if (!isLogin) {
            if (!formData.confirmpassword) {
                newErrors.confirmpassword = "Confirm password is required!";
            } else if (formData.confirmpassword !== formData.password) {
                newErrors.confirmpassword = "Confirm password is not match!";
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
    }

    return (
        <div>
            <div>
                {isLogin ? (
                    <>
                        <h1>Chào mừng trở lại !</h1>
                        <p>Đăng nhập để tiếp tục mua sắm</p>
                    </>
                ) : (
                    <>
                        <h1>Tạo tài khoản mới</h1>
                        <p>Tham gia cộng đồng thời trang hiện đại</p>
                    </>
                )
                }
            </div>
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Name" />
                        <p>{errors.name}</p>
                    </>
                )}

                <input type="text" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                <p>{errors.email}</p>
                <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} placeholder="Password" />
                <p>{errors.password}</p>
                {!isLogin && (
                    <>
                        <input type="password" name="confirmpassword" id="confirmpassword" value={formData.confirmpassword} onChange={handleChange} placeholder="Confirm password" />
                        <p>{errors.confirmpassword}</p>
                    </>
                )}
                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : isLogin ? "Login" : "Register"}
                </button>
                {serverError && <p style={{ color: "red" }}>{serverError}</p>}
                {isLogin ? (
                    <>
                        <h3>Chưa có tài khoản?<span style={{ color: "blue", cursor: "pointer" }} onClick={() => setLogin(false)}>Đăng ký ngay!</span></h3>
                    </>
                ) : (
                    <>
                        <h3>Đã có tài khoản?<span style={{ color: "blue", cursor: "pointer" }} onClick={() => setLogin(true)}>Đăng nhập ngay!</span></h3>
                    </>
                )}


            </form>
        </div>
    )
} 