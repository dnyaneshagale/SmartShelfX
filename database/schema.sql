-- ========================================
-- SmartShelfX Database Schema
-- ========================================

DROP DATABASE IF EXISTS smartshelfx;
CREATE DATABASE smartshelfx;
USE smartshelfx;

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    role ENUM('ADMIN', 'MANAGER', 'VENDOR') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PRODUCTS TABLE
-- ========================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    current_stock INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    vendor_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- ========================================
-- STOCK TRANSACTIONS TABLE
-- ========================================
CREATE TABLE stock_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    transaction_type ENUM('IN', 'OUT') NOT NULL,
    quantity INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ========================================
-- FORECASTS TABLE
-- ========================================
CREATE TABLE forecasts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    sku VARCHAR(50) NOT NULL,
    predicted_quantity INT NOT NULL,
    forecast_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ========================================
-- PURCHASE ORDERS TABLE
-- ========================================
CREATE TABLE purchase_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_product_sku ON products(sku);
CREATE INDEX idx_stock_product ON stock_transactions(product_id);
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
