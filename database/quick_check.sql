-- Quick database check for vendor issues
USE smartshelfx;

-- Check 1: Do we have vendor users?
SELECT 'VENDOR USERS:' as check_name;
SELECT id, username, email, full_name, role 
FROM users 
WHERE role = 'VENDOR';

-- Check 2: How many products have vendor_id?
SELECT 'PRODUCTS WITH VENDOR:' as check_name;
SELECT 
    COUNT(*) as total_products,
    COUNT(vendor_id) as products_with_vendor,
    COUNT(*) - COUNT(vendor_id) as products_without_vendor
FROM products;

-- Check 3: Show some products with their vendor status
SELECT 'SAMPLE PRODUCTS:' as check_name;
SELECT 
    p.id, 
    p.name, 
    p.sku,
    p.vendor_id,
    u.full_name as vendor_name
FROM products p
LEFT JOIN users u ON p.vendor_id = u.id
LIMIT 10;

-- Check 4: How many purchase orders have vendor_id?
SELECT 'PURCHASE ORDERS WITH VENDOR:' as check_name;
SELECT 
    COUNT(*) as total_orders,
    COUNT(vendor_id) as orders_with_vendor,
    COUNT(*) - COUNT(vendor_id) as orders_without_vendor
FROM purchase_orders;

-- Check 5: Show some purchase orders
SELECT 'SAMPLE PURCHASE ORDERS:' as check_name;
SELECT 
    po.id,
    po.po_number,
    po.status,
    po.product_id,
    p.name as product_name,
    po.vendor_id,
    v.full_name as vendor_name
FROM purchase_orders po
LEFT JOIN products p ON po.product_id = p.id
LEFT JOIN users v ON po.vendor_id = v.id
LIMIT 10;
