import React, { useState, useEffect, useContext } from "react";
import { 
    LayoutDashboard, Package, ShoppingCart, Users, Eye, Search, 
    Plus, Edit3, Trash2, LogOut, TrendingUp, DollarSign, UserCheck, Calendar
} from "lucide-react";
import { AuthContext } from "../context/authContext";
import * as adminApi from "../api/adminApi";
import "./AdminPanel.css";

export default function AdminPanel() {
    const { token, user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [data, setData] = useState({ sales: null, inventory: null, products: [], orders: [], users: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadTabContent = async () => {
            setLoading(true);
            try {
                if (activeTab === "dashboard") {
                    const s = await adminApi.getSalesStats(token);
                    const i = await adminApi.getInventoryStats(token);
                    const u = await adminApi.adminGetUsers(token);
                    setData(prev => ({ ...prev, sales: s.data, inventory: i.data, users: u.data || [] }));
                } else if (activeTab === "products") {
                    const p = await adminApi.adminGetProducts(token);
                    setData(prev => ({ ...prev, products: p.data || [] }));
                } else if (activeTab === "orders") {
                    const o = await adminApi.adminGetOrders(token);
                    setData(prev => ({ ...prev, orders: o.data || [] }));
                } else if (activeTab === "users") {
                    const u = await adminApi.adminGetUsers(token);
                    setData(prev => ({ ...prev, users: u.data || [] }));
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
            }
            setLoading(false);
        };
        loadTabContent();
    }, [activeTab, token]);

    return (
        <div className="ap-wrapper">
            {/* --- SIDEBAR --- */}
            <aside className="ap-sidebar">
                <div className="ap-logo">FASHION HUB</div>
                <nav className="ap-nav">
                    <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard/>} label="Dashboard" />
                    <NavItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package/>} label="Sản phẩm" />
                    <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart/>} label="Đơn hàng" />
                    <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users/>} label="Người dùng" />
                </nav>
                <div className="ap-user-info">
                    <div className="ap-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
                    <div>
                        <p className="ap-uname">{user?.username}</p>
                        <p className="ap-umail">{user?.email}</p>
                    </div>
                    <LogOut className="ap-logout" size={18} onClick={logout} />
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="ap-main">
                <header className="ap-header">
                    <h2>{activeTab === "dashboard" ? "Bảng điều khiển" : activeTab === "products" ? "Quản lý sản phẩm" : activeTab === "orders" ? "Quản lý đơn hàng" : "Quản lý người dùng"}</h2>
                    <button className="ap-btn-view" onClick={() => window.open('/')}><Eye size={18}/> Xem web</button>
                </header>

                {loading ? <div className="ap-loading">Đang tải dữ liệu...</div> : (
                    <>
                        {/* --- TAB: DASHBOARD --- */}
                        {activeTab === "dashboard" && data.sales && (
                            <div className="ap-dashboard">
                                <div className="ap-stats">
                                    <StatCard label="Doanh thu" val={`${(data.sales.overall.totalRevenue || 0).toLocaleString()}đ`} icon={<DollarSign/>} color="#7e22ce" bg="#f3e8ff" />
                                    <StatCard label="Đơn hàng" val={data.sales.overall.totalOrders || 0} icon={<ShoppingCart/>} color="#be185d" bg="#fce7f3" />
                                    <StatCard label="Sản phẩm" val={data.inventory?.overview?.total_products || 0} icon={<Package/>} color="#c2410c" bg="#fff7ed" />
                                    <StatCard label="Khách hàng" val={data.users?.length || 0} icon={<Users/>} color="#1d4ed8" bg="#eff6ff" />
                                </div>
                                <div className="ap-charts">
                                    <div className="ap-chart-box">
                                        <h3>Doanh thu tháng này</h3>
                                        <p className="chart-val">{(data.sales.monthly[0]?.revenue || 0).toLocaleString()}đ</p>
                                        <div className="placeholder-line"></div>
                                    </div>
                                    <div className="ap-chart-box">
                                        <h3>Sản phẩm sắp hết hàng</h3>
                                        <p className="chart-val">{data.inventory?.lowStockWarnings?.length || 0} biến thể</p>
                                        <div className="placeholder-bar"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SẢN PHẨM --- */}
                        {activeTab === "products" && (
                            <div className="ap-table-container">
                                <div className="ap-table-top">
                                    <div className="ap-search"><Search size={18}/><input placeholder="Tìm tên sản phẩm..."/></div>
                                    <button className="ap-btn-add"><Plus size={18}/> Thêm mới</button>
                                </div>
                                <table className="ap-table">
                                    <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá gốc</th><th>Kho</th><th>Thao tác</th></tr></thead>
                                    <tbody>
                                        {data.products.map(p => (
                                            <tr key={p.product_id}>
                                                <td className="td-product">
                                                    <div className="ap-img-placeholder">{p.name.charAt(0)}</div>
                                                    <div><p className="p-name">{p.name}</p><p className="p-id">ID: {p.product_id}</p></div>
                                                </td>
                                                <td><span className="ap-badge badge-purple">{p.category_name}</span></td>
                                                <td className="p-bold">{p.base_price?.toLocaleString()}đ</td>
                                                <td>{p.total_stock || 0}</td>
                                                <td><div className="ap-row-actions"><Edit3 size={16} className="edit"/><Trash2 size={16} className="delete"/></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- TAB: ĐƠN HÀNG --- */}
                        {activeTab === "orders" && (
                            <div className="ap-table-container">
                                <div className="ap-table-top">
                                    <div className="ap-search"><Search size={18}/><input placeholder="Tìm mã đơn hàng..."/></div>
                                </div>
                                <table className="ap-table">
                                    <thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                                    <tbody>
                                        {data.orders.length > 0 ? data.orders.map(o => (
                                            <tr key={o.order_id}>
                                                <td>#{o.order_id}</td>
                                                <td>{new Date(o.order_date).toLocaleDateString('vi-VN')}</td>
                                                <td>{o.username || o.recipient_name}</td>
                                                <td className="p-bold">{o.total_amount?.toLocaleString()}đ</td>
                                                <td><span className={`ap-badge badge-blue`}>{o.status}</span></td>
                                                <td><div className="ap-row-actions"><Eye size={18} className="edit"/></div></td>
                                            </tr>
                                        )) : <tr><td colSpan="6" style={{textAlign:'center', padding:'40px'}}>Chưa có đơn hàng nào.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- TAB: NGƯỜI DÙNG --- */}
                        {activeTab === "users" && (
                            <div className="ap-table-container">
                                <div className="ap-table-top">
                                    <div className="ap-search"><Search size={18}/><input placeholder="Tìm email hoặc tên..."/></div>
                                </div>
                                <table className="ap-table">
                                    <thead><tr><th>Người dùng</th><th>Email</th><th>Quyền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                                    <tbody>
                                        {data.users.map(u => (
                                            <tr key={u.user_id}>
                                                <td><b>{u.username}</b><br/><small>{u.full_name || '---'}</small></td>
                                                <td>{u.email}</td>
                                                <td><span className={`ap-badge ${u.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span></td>
                                                <td><span className={`ap-badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Hoạt động' : 'Bị khóa'}</span></td>
                                                <td><div className="ap-row-actions"><Edit3 size={16} className="edit"/><Trash2 size={16} className="delete"/></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// Component con cho NavItem
const NavItem = ({ active, onClick, icon, label }) => (
    <div className={`ap-nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon} <span>{label}</span></div>
);

// Component con cho Thẻ thống kê
const StatCard = ({ label, val, icon, color, bg }) => (
    <div className="ap-stat-card">
        <div className="ap-stat-icon" style={{background: bg, color: color}}>{icon}</div>
        <div className="ap-stat-info"><p>{label}</p><h3>{val}</h3></div>
        <TrendingUp className="ap-stat-trend" size={16} />
    </div>
);