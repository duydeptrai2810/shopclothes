import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { getMyProfile, updateProfile } from "../api/userApi";
import { changePassword } from "../api/authApi";
import { User, Lock, Phone, MapPin, Mail } from "lucide-react";
import ProfileSidebar from "./profileSidebar";
import "./profilePage.css";

export default function ProfilePage() {
    const { token, user: contextUser, login } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("info");
    const [profile, setProfile] = useState({ fullName: "", phone: "", address: "", email: "" });
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyProfile(token);
                setProfile({
                    fullName: res.data.full_name || "Nguyễn Văn A",
                    phone: res.data.phone || "0123456789",
                    address: res.data.address || "123 Đường ABC, Quận 1, TP.HCM",
                    email: res.data.email || "user@example.com"
                });
            } catch (error) { console.error(error); }
        };
        if (token) fetchProfile();
    }, [token]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(token, profile);
            setMessage("Cập nhật thông tin thành công!");
            login(token, { ...contextUser, username: profile.fullName });
        } catch (error) { setMessage(error.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="header-content">
                    <div className="avatar-circle">
                        <User size={40} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý tài khoản</h1>
                        <p style={{ opacity: 0.9 }}>Xin chào, {profile.fullName}!</p>
                    </div>
                </div>
            </header>

            <main className="profile-main">
                <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                <section className="content-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                        <div style={{ background: '#f3e8ff', padding: '8px', borderRadius: '8px' }}>
                            {activeTab === 'info' ? <User color="#9333ea" /> : <Lock color="#9333ea" />}
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>{activeTab === 'info' ? 'Thông tin cá nhân' : 'Đổi mật khẩu'}</h3>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Quản lý thông tin của bạn</p>
                        </div>
                    </div>

                    {message && <div style={{ background: '#ecfdf5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}

                    {activeTab === "info" ? (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group">
                                <label>Email</label>
                                <div className="input-wrapper">
                                    <Mail size={18} />
                                    <input type="email" value={profile.email} disabled style={{ background: '#f9fafb' }} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <div className="input-wrapper">
                                    <User size={18} />
                                    <input type="text" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <div className="input-wrapper">
                                    <Phone size={18} />
                                    <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ giao hàng</label>
                                <div className="input-wrapper">
                                    <MapPin size={18} />
                                    <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Lưu thay đổi"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input type="password" placeholder="********" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input type="password" placeholder="Nhập mật khẩu mới" />
                                </div>
                            </div>
                            <button type="submit" className="btn-submit">Cập nhật mật khẩu</button>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
}