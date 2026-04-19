// File: src/config/db.js
const mysql = require("mysql2/promise");

// Tạo pool kết nối database
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "duydeptrai28",
  database: "shopclo",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối
db.getConnection()
  .then((conn) => {
    console.log("✅ Đã kết nối MySQL thành công với Shop Clothes!");
    conn.release(); // Nhả kết nối lại cho Pool
  })
  .catch((err) => {
    console.error("❌ Kết nối database thất bại:", err);
  });

module.exports = db;