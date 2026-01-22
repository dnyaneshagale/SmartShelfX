-- ========================================
-- SmartShelfX Seed Data
-- ========================================

USE smartshelfx;

-- ========================================
-- SEED USERS
-- Password for all users: "password123" (BCrypt encoded)
-- JWT Secret: 3a4c18ff14cde780c200bb15e6c48684ad3725e189c60e0c5d3f88ff8a2a4d12
-- Correct BCrypt Hash: $2a$10$7f9Kt3b1U1kzxdWwkFgwGOeKT2qGxLU56z64uM//gVIle0MCTlAkm
-- ========================================
INSERT INTO users (username, password, full_name, email, role, active) VALUES
('admin', '$2a$10$7f9Kt3b1U1kzxdWwkFgwGOeKT2qGxLU56z64uM//gVIle0MCTlAkm', 'System Admin', 'admin@smartshelfx.com', 'ADMIN', true),
('manager1', '$2a$10$7f9Kt3b1U1kzxdWwkFgwGOeKT2qGxLU56z64uM//gVIle0MCTlAkm', 'John Manager', 'manager@smartshelfx.com', 'MANAGER', true),
('vendor1', '$2a$10$7f9Kt3b1U1kzxdWwkFgwGOeKT2qGxLU56z64uM//gVIle0MCTlAkm', 'ABC Supplies Ltd', 'vendor1@supplies.com', 'VENDOR', true),
('vendor2', '$2a$10$7f9Kt3b1U1kzxdWwkFgwGOeKT2qGxLU56z64uM//gVIle0MCTlAkm', 'XYZ Electronics', 'vendor2@electronics.com', 'VENDOR', true);

-- ========================================
-- SEED PRODUCTS
-- ========================================
INSERT INTO products (sku, name, category, price, current_stock, reorder_level, vendor_id) VALUES
('PROD-001', 'Laptop Dell Inspiron', 'Electronics', 45000.00, 15, 5, 4),
('PROD-002', 'Wireless Mouse Logitech', 'Electronics', 899.00, 8, 10, 4),
('PROD-003', 'Office Chair Premium', 'Furniture', 7500.00, 20, 8, 3),
('PROD-004', 'Notebook A4 Pack', 'Stationery', 250.00, 3, 15, 3),
('PROD-005', 'USB Cable Type-C', 'Electronics', 150.00, 45, 20, 4),
('PROD-006', 'Desk Lamp LED', 'Electronics', 1200.00, 12, 10, 3),
('PROD-007', 'Whiteboard Marker Set', 'Stationery', 120.00, 7, 12, 3),
('PROD-008', 'Monitor 24 inch LG', 'Electronics', 12000.00, 6, 5, 4),
('PROD-009', 'Keyboard Mechanical', 'Electronics', 3500.00, 9, 8, 4),
('PROD-010', 'Storage Box Plastic', 'Supplies', 450.00, 25, 15, 3);

-- ========================================
-- SEED STOCK TRANSACTIONS (Last 10 days)
-- ========================================
INSERT INTO stock_transactions (product_id, transaction_type, quantity, transaction_date, remarks) VALUES
-- Day -10
(1, 'OUT', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Sales'),
(2, 'OUT', 5, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Sales'),
(4, 'OUT', 8, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Sales'),
-- Day -9
(1, 'OUT', 1, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Sales'),
(5, 'OUT', 10, DATE_SUB(NOW(), INTERVAL 9 DAY), 'Sales'),
-- Day -8
(2, 'OUT', 3, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Sales'),
(4, 'OUT', 6, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Sales'),
(8, 'OUT', 2, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Sales'),
-- Day -7
(1, 'IN', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), 'Restocked'),
(3, 'OUT', 4, DATE_SUB(NOW(), INTERVAL 7 DAY), 'Sales'),
-- Day -6
(2, 'OUT', 4, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Sales'),
(5, 'OUT', 8, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Sales'),
-- Day -5
(1, 'OUT', 3, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Sales'),
(4, 'OUT', 5, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Sales'),
(7, 'OUT', 3, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Sales'),
-- Day -4
(2, 'OUT', 2, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Sales'),
(8, 'OUT', 1, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Sales'),
-- Day -3
(1, 'OUT', 2, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Sales'),
(4, 'OUT', 7, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Sales'),
(5, 'OUT', 12, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Sales'),
-- Day -2
(2, 'OUT', 6, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Sales'),
(7, 'OUT', 4, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Sales'),
-- Day -1
(1, 'OUT', 1, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Sales'),
(4, 'OUT', 9, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Sales'),
(9, 'OUT', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Sales');

-- ========================================
-- SEED PURCHASE ORDERS
-- ========================================
INSERT INTO purchase_orders (product_id, vendor_id, quantity, status, created_at) VALUES
(4, 3, 50, 'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 4, 30, 'PENDING', NOW()),
(8, 4, 10, 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 DAY));
