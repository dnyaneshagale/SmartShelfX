-- Database Schema Verification and Update Script for SmartShelfX
-- Run this script to ensure vendor relationships are properly configured

USE smartshelfx;

-- 1. Check if vendor_id column exists in products table
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'smartshelfx' 
  AND TABLE_NAME = 'products' 
  AND COLUMN_NAME = 'vendor_id';

-- 2. If vendor_id doesn't exist, add it (this will be skipped if column exists)
-- ALTER TABLE products ADD COLUMN vendor_id BIGINT;
-- ALTER TABLE products ADD CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES users(id);

-- 3. Check if vendor_id column exists in purchase_orders table
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'smartshelfx' 
  AND TABLE_NAME = 'purchase_orders' 
  AND COLUMN_NAME = 'vendor_id';

-- 4. Verify products with vendors assigned
SELECT 
    p.id,
    p.sku,
    p.name,
    p.vendor_id,
    u.full_name as vendor_name,
    u.email as vendor_email
FROM products p
LEFT JOIN users u ON p.vendor_id = u.id
WHERE p.vendor_id IS NOT NULL;

-- 5. Verify purchase orders with vendors
SELECT 
    po.id,
    po.po_number,
    po.product_id,
    p.name as product_name,
    po.vendor_id,
    v.full_name as vendor_name,
    v.email as vendor_email,
    po.quantity,
    po.status,
    po.created_at
FROM purchase_orders po
INNER JOIN products p ON po.product_id = p.id
LEFT JOIN users v ON po.vendor_id = v.id
ORDER BY po.created_at DESC;

-- 6. Check vendor users
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    active
FROM users 
WHERE role = 'VENDOR'
ORDER BY id;

-- 7. Update purchase orders to have correct vendor_id if missing
-- This query will set vendor_id from the product's assigned vendor
UPDATE purchase_orders po
INNER JOIN products p ON po.product_id = p.id
SET po.vendor_id = p.vendor_id
WHERE po.vendor_id IS NULL 
  AND p.vendor_id IS NOT NULL;

-- 8. Show products without vendors (need assignment)
SELECT 
    id,
    sku,
    name,
    category,
    current_stock,
    reorder_level
FROM products 
WHERE vendor_id IS NULL
ORDER BY name;

-- 9. Show statistics
SELECT 
    'Total Products' as metric,
    COUNT(*) as count
FROM products
UNION ALL
SELECT 
    'Products with Vendors',
    COUNT(*) 
FROM products 
WHERE vendor_id IS NOT NULL
UNION ALL
SELECT 
    'Products without Vendors',
    COUNT(*) 
FROM products 
WHERE vendor_id IS NULL
UNION ALL
SELECT 
    'Total Purchase Orders',
    COUNT(*) 
FROM purchase_orders
UNION ALL
SELECT 
    'POs with Vendors',
    COUNT(*) 
FROM purchase_orders 
WHERE vendor_id IS NOT NULL
UNION ALL
SELECT 
    'Total Vendor Users',
    COUNT(*) 
FROM users 
WHERE role = 'VENDOR';

-- 10. Verify foreign key constraints
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smartshelfx'
  AND TABLE_NAME IN ('products', 'purchase_orders')
  AND REFERENCED_TABLE_NAME IS NOT NULL;
