const express = require('express');
const app = express();
const port = 3000;
require("./src/config/db");

const cors = require('cors'); 
app.use(cors()); 

app.use(express.json());

// Import các routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Định tuyến API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với Backend Website Bán Quần Áo!');
});

// Chạy server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});

