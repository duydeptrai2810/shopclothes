import { User, Lock, ShoppingBag, Heart, LogOut } from "lucide-react";

export default function ProfileSidebar({ activeTab, setActiveTab }) {
    return (
        <aside>
            <div className="sidebar-card">
                <nav className="sidebar-menu">
                    <button 
                        className={`menu-item ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        <User size={18} /> Thông tin cá nhân
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <Lock size={18} /> Đổi mật khẩu
                    </button>
                    <button className="menu-item">
                        <ShoppingBag size={18} /> Đơn hàng của tôi
                    </button>
                    <button className="menu-item">
                        <Heart size={18} /> Sản phẩm yêu thích
                    </button>
                    <button className="menu-item logout">
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </nav>
            </div>

            <div className="stats-card">
                <h4 style={{ marginBottom: '15px' }}>Thống kê</h4>
                <div className="stat-row">
                    <span>Đơn hàng</span>
                    <span className="stat-value">12</span>
                </div>
                <div className="stat-row">
                    <span>Yêu thích</span>
                    <span className="stat-value">8</span>
                </div>
                <div className="stat-row">
                    <span>Điểm tích lũy</span>
                    <span className="stat-points">2,450</span>
                </div>
            </div>
        </aside>
    );
}