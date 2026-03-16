CREATE DATABASE IF NOT EXISTS shopclothes;
USE shopclothes;

<<<<<<< HEAD
-- 1. Bảng USER (Người dùng)
=======

-- 1. Bảng USER (Người dùng) 
>>>>>>> origin/main
CREATE TABLE USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    full_name VARCHAR(100),
    gender VARCHAR(10),
    date_of_birth DATE,
    role VARCHAR(20) DEFAULT 'customer',

    -- Auth fields
    refresh_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,

    -- Profile
    address TEXT,
    avatar_url VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng BRAND
CREATE TABLE BRAND (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- 3. Bảng CATEGORY
CREATE TABLE CATEGORY (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id INT,
    FOREIGN KEY (parent_category_id) REFERENCES CATEGORY(category_id) ON DELETE SET NULL
);

-- 4. Bảng STYLE
CREATE TABLE STYLE (
    style_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 5. Bảng SEASON
CREATE TABLE SEASON (
    season_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 6. Bảng PRODUCT
CREATE TABLE PRODUCT (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    brand_id INT,
    category_id INT,
    style_id INT,
    material VARCHAR(100),
    gender_target VARCHAR(20),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (brand_id) REFERENCES BRAND(brand_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id) ON DELETE SET NULL,
    FOREIGN KEY (style_id) REFERENCES STYLE(style_id) ON DELETE SET NULL
);

-- 7. Bảng PRODUCT_VARIANT
CREATE TABLE PRODUCT_VARIANT (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    size VARCHAR(20),
    color VARCHAR(50),
    sku VARCHAR(100) UNIQUE,
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    price_adjustment DECIMAL(10,2) DEFAULT 0,

    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE
);

-- 8. Bảng PRODUCT_IMAGES
CREATE TABLE PRODUCT_IMAGES (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    variant_id INT,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT 0,

    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES PRODUCT_VARIANT(variant_id) ON DELETE SET NULL
);

-- 9. Bảng PRODUCT_SEASON
CREATE TABLE PRODUCT_SEASON (
    product_id INT,
    season_id INT,
    PRIMARY KEY (product_id, season_id),

    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES SEASON(season_id) ON DELETE CASCADE
);

-- 10. Bảng USER_ACTION
CREATE TABLE USER_ACTION (
    action_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    action_type VARCHAR(50),
    duration_seconds INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE
);

-- 11. Bảng CART
CREATE TABLE CART (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

-- 12. Bảng CART_ITEM
CREATE TABLE CART_ITEM (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    variant_id INT,
    quantity INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cart_id) REFERENCES CART(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES PRODUCT_VARIANT(variant_id) ON DELETE CASCADE
);

-- 13. Bảng ORDERS
CREATE TABLE ORDERS (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    shipping_address TEXT,
    recipient_phone VARCHAR(20),
    recipient_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

-- 14. Bảng ORDER_DETAIL
CREATE TABLE ORDER_DETAIL (
    order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    variant_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES PRODUCT_VARIANT(variant_id) ON DELETE SET NULL
);

-- 15. Bảng PAYMENT
CREATE TABLE PAYMENT (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE
);

-- 16. Bảng REVIEW
CREATE TABLE REVIEW (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    order_detail_id INT UNIQUE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    FOREIGN KEY (order_detail_id) REFERENCES ORDER_DETAIL(order_detail_id) ON DELETE SET NULL
);


-- 1. Thêm các cột phục vụ Xác thực và Profile vào bảng USER
ALTER TABLE USER 
ADD COLUMN refresh_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN reset_password_expires DATETIME DEFAULT NULL,
ADD COLUMN address TEXT DEFAULT NULL,
ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;

-- 2. Thêm cột trạng thái vào bảng BRAND (để API getActiveBrands hoạt động)
ALTER TABLE BRAND 
ADD COLUMN is_active BOOLEAN DEFAULT 1;