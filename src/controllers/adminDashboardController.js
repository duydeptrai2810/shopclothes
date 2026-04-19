const db = require('../config/db');

// ==========================================
// 1. Thống kê Doanh thu & Tổng số Đơn hàng
// ==========================================
exports.getSalesStatistics = async (req, res) => {
    try {
        // 1.1 Thống kê Tổng quan (Chỉ tính những đơn không bị Hủy)
        const [overallStats] = await db.execute(`
            SELECT 
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM ORDERS 
            WHERE status != 'Cancelled'
        `);

        // 1.2 Thống kê Doanh thu theo từng tháng trong năm nay (Để vẽ biểu đồ)
        const [monthlyRevenue] = await db.execute(`
            SELECT 
                MONTH(order_date) AS month,
                COUNT(order_id) AS orders,
                SUM(total_amount) AS revenue
            FROM ORDERS 
            WHERE status != 'Cancelled' AND YEAR(order_date) = YEAR(CURRENT_DATE())
            GROUP BY MONTH(order_date)
            ORDER BY month ASC
        `);

        // 1.3 Đếm số lượng đơn hàng theo từng trạng thái (Pending, Delivered, Cancelled...)
        const [ordersByStatus] = await db.execute(`
            SELECT status, COUNT(order_id) AS count
            FROM ORDERS
            GROUP BY status
        `);

        res.status(200).json({
            success: true,
            message: 'Lấy dữ liệu thống kê doanh thu thành công',
            data: {
                overall: {
                    totalOrders: overallStats[0].total_orders || 0,
                    totalRevenue: overallStats[0].total_revenue || 0
                },
                monthly: monthlyRevenue,
                statusBreakdown: ordersByStatus
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Thống kê Tồn kho, Cảnh báo & Hiệu suất
// ==========================================
exports.getInventoryStatistics = async (req, res) => {
    try {
        const LOW_STOCK_THRESHOLD = 10; // Ngưỡng cảnh báo sắp hết hàng

        // 2.1 Tổng quan về kho hàng
        const [inventoryOverview] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM PRODUCT) AS total_products,
                (SELECT COUNT(*) FROM PRODUCT_VARIANT) AS total_variants,
                (SELECT SUM(stock_quantity) FROM PRODUCT_VARIANT) AS total_items_in_stock
        `);

        // 2.2 Cảnh báo sắp hết hàng (Lấy các biến thể có stock <= 10)
        const [lowStockVariants] = await db.execute(`
            SELECT 
                pv.variant_id, pv.size, pv.color, pv.sku, pv.stock_quantity,
                p.name AS product_name
            FROM PRODUCT_VARIANT pv
            JOIN PRODUCT p ON pv.product_id = p.product_id
            WHERE pv.stock_quantity <= ?
            ORDER BY pv.stock_quantity ASC
            LIMIT 20
        `, [LOW_STOCK_THRESHOLD]);

        // 2.3 Hiệu suất: Top 10 Sản phẩm bán chạy nhất (Tính tổng số lượng đã bán)
        const [topSellingProducts] = await db.execute(`
            SELECT 
                p.product_id, p.name,
                SUM(od.quantity) AS total_sold
            FROM ORDER_DETAIL od
            JOIN ORDERS o ON od.order_id = o.order_id
            JOIN PRODUCT_VARIANT pv ON od.variant_id = pv.variant_id
            JOIN PRODUCT p ON pv.product_id = p.product_id
            WHERE o.status != 'Cancelled'
            GROUP BY p.product_id, p.name
            ORDER BY total_sold DESC
            LIMIT 10
        `);

        res.status(200).json({
            success: true,
            message: 'Lấy dữ liệu thống kê kho hàng thành công',
            data: {
                overview: inventoryOverview[0],
                lowStockWarnings: lowStockVariants,
                topSellers: topSellingProducts
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};