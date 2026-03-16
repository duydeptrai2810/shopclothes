// File: src/components/profilePage.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { getMyProfile, updateProfile } from "../api/userApi";
import { changePassword } from "../api/authApi";
import { User, Lock, Phone, MapPin, Mail } from "lucide-react";

export default function ProfilePage() {
    const { token, user: contextUser, login } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("info");
    const [profile, setProfile] = useState({ fullName: "", phone: "", address: "", email: "", username: "" });
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyProfile(token);
                setProfile({
                    fullName: res.data.full_name || "",
                    phone: res.data.phone || "",
                    address: res.data.address || "",
                    email: res.data.email || "",
                    username: res.data.username || ""
                });
            } catch (error) {
                console.error(error);
            }
        };
        if (token) fetchProfile();
    }, [token]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // eslint-disable-next-line no-unused-vars
            const res = await updateProfile(token, profile);
            setMessage("Cập nhật thông tin thành công!");
            // Cập nhật lại Context cho Navbar nhận diện tên mới
            login(token, { ...contextUser, username: profile.fullName || profile.username });
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await changePassword(token, passwords.oldPassword, passwords.newPassword);
            setMessage("Đổi mật khẩu thành công! Lần đăng nhập sau hãy dùng mật khẩu mới.");
            setPasswords({ oldPassword: "", newPassword: "" });
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <h2>Quản lý tài khoản</h2>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                <button onClick={() => { setActiveTab("info"); setMessage(""); }} style={{ fontWeight: activeTab === 'info' ? 'bold' : 'normal', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>Thông tin cá nhân</button>
                <button onClick={() => { setActiveTab("password"); setMessage(""); }} style={{ fontWeight: activeTab === 'password' ? 'bold' : 'normal', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>Đổi mật khẩu</button>
            </div>

            {message && <div style={{ padding: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', marginBottom: '20px', borderRadius: '5px' }}>{message}</div>}

            {activeTab === "info" ? (
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Mail size={20} color="#666" />
                        <input type="email" value={profile.email} disabled style={{ flex: 1, padding: '10px', background: '#f5f5f5', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <User size={20} color="#666" />
                        <input type="text" placeholder="Họ và tên" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Phone size={20} color="#666" />
                        <input type="text" placeholder="Số điện thoại" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <MapPin size={20} color="#666" />
                        <input type="text" placeholder="Địa chỉ giao hàng" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                    <button type="submit" disabled={loading} style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Lock size={20} color="#666" />
                        <input type="password" placeholder="Mật khẩu hiện tại" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} required style={{ flex: 1, padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Lock size={20} color="#666" />
                        <input type="password" placeholder="Mật khẩu mới" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required style={{ flex: 1, padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                    <button type="submit" disabled={loading} style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                        {loading ? "Đang đổi..." : "Xác nhận đổi mật khẩu"}
                    </button>
                </form>
            )}
        </div>
    );
}