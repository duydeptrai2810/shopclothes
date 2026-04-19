const express = require('express');
const app = express();
const port = 3000;
require("./src/config/db");
const path = require('path');

const cors = require('cors'); 
app.use(cors()); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import các routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const adminProductRoutes = require('./src/routes/adminProductRoutes');
const adminCatalogRoutes = require('./src/routes/adminCatalogRoutes');
const adminOpsRoutes = require('./src/routes/adminOpsRoutes');
const adminDashboardRoutes = require('./src/routes/adminDashboardRoutes');

// Định tuyến API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/catalog', adminCatalogRoutes);
app.use('/api/admin/operations', adminOpsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với Backend Website Bán Quần Áo!');
});

// Chạy server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});

