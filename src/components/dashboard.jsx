import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { getSalesStats, adminGetProducts } from "../api/adminApi";
import { LayoutDashboard, Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function Dashboard() {
    const { token, user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Chỉ gọi API nếu là Admin (Bạn nhớ set role = ADMIN trong DB nhé)
        if (user?.role?.toUpperCase() === "ADMIN") {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === "overview") {
                const res = await getSalesStats(token);
                setStats(res.data.overall);
            } else if (activeTab === "products") {
                const res = await adminGetProducts(token);
                setProducts(res.data);
            }
        } catch (error) {
            console.error("Lỗi Admin:", error);
        }
    };

    if (user?.role?.toUpperCase() !== "ADMIN") {
        return <h2 style={{ textAlign: "center", marginTop: "100px", color: "red" }}>Truy cập bị từ chối. Bạn không phải là Quản trị viên!</h2>;
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6", paddingTop: "60px" }}>
            {/* Sidebar Admin */}
            <aside style={{ width: "250px", background: "#1f2937", color: "white", padding: "20px 0" }}>
                <div style={{ padding: "0 20px", marginBottom: "30px", fontSize: "20px", fontWeight: "bold" }}>Admin Portal</div>
                <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => setActiveTab("overview")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "15px 20px", background: activeTab === "overview" ? "#374151" : "transparent", color: "white", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                        <LayoutDashboard size={20} /> Tổng quan
                    </button>
                    <button onClick={() => setActiveTab("products")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "15px 20px", background: activeTab === "products" ? "#374151" : "transparent", color: "white", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                        <Package size={20} /> Kho Sản phẩm
                    </button>
                    <button onClick={() => setActiveTab("orders")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "15px 20px", background: activeTab === "orders" ? "#374151" : "transparent", color: "white", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                        <ShoppingCart size={20} /> Đơn hàng
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: "30px" }}>
                {activeTab === "overview" && (
                    <div>
                        <h2>Thống kê kinh doanh</h2>
                        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                            <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                                <div style={{ color: "#6b7280", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                                    <span>Tổng Doanh Thu</span> <DollarSign color="#10b981" />
                                </div>
                                <h3 style={{ fontSize: "28px", margin: 0 }}>{stats?.totalRevenue ? new Intl.NumberFormat("vi-VN").format(stats.totalRevenue) : 0} ₫</h3>
                            </div>
                            <div style={{ flex: 1, background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                                <div style={{ color: "#6b7280", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                                    <span>Đơn hàng hoàn tất</span> <ShoppingCart color="#3b82f6" />
                                </div>
                                <h3 style={{ fontSize: "28px", margin: 0 }}>{stats?.totalOrders || 0} đơn</h3>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "products" && (
                    <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h2>Quản lý Sản phẩm</h2>
                            <button style={{ background: "#a855f7", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}>+ Thêm sản phẩm</button>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>ID</th>
                                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Tên sản phẩm</th>
                                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Giá gốc</th>
                                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.product_id} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: "12px" }}>#{p.product_id}</td>
                                        <td style={{ padding: "12px", fontWeight: "bold" }}>{p.name}</td>
                                        <td style={{ padding: "12px", color: "#a855f7" }}>{new Intl.NumberFormat("vi-VN").format(p.base_price)} ₫</td>
                                        <td style={{ padding: "12px" }}>
                                            <span style={{ background: p.is_active ? "#dcfce7" : "#fee2e2", color: p.is_active ? "#166534" : "#991b1b", padding: "4px 8px", borderRadius: "12px", fontSize: "12px" }}>
                                                {p.is_active ? "Đang bán" : "Đã ẩn"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}