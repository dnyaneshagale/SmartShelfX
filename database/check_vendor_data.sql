-- Check vendor assignments in database
-- Run this in MySQL Workbench to verify data

-- 1. Check all users with VENDOR role
SELECT id, username, full_name, role, active 
FROM users 
WHERE role = 'VENDOR' AND active = true;

-- 2. Check products assigned to vendors
SELECT p.id, p.sku, p.name, p.category, p.current_stock, p.vendor_id,
       u.full_name as vendor_name, u.username as vendor_username
FROM products p
LEFT JOIN users u ON p.vendor_id = u.id
WHERE p.vendor_id IS NOT NULL;

-- 3. Check purchase orders for vendors
SELECT po.id, po.status, po.quantity, po.total_cost,
       p.name as product_name,
       v.full_name as vendor_name
FROM purchase_orders po
JOIN products p ON po.product_id = p.id
JOIN users v ON po.vendor_id = v.id
ORDER BY po.order_date DESC;

-- 4. If no data, assign products to vendors
-- First, get a vendor user ID
SELECT id, username, full_name FROM users WHERE role = 'VENDOR' LIMIT 1;

-- Then update some products to assign them to that vendor
-- Replace <vendor_id> with actual vendor ID from above query
-- UPDATE products SET vendor_id = <vendor_id> WHERE id IN (1, 2, 3, 4, 5);

-- Example with ID 7 (adjust as needed):
-- UPDATE products SET vendor_id = 7 WHERE vendor_id IS NULL LIMIT 10;
