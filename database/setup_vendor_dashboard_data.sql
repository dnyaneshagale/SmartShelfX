-- Vendor Dashboard Data Setup
-- This script ensures vendors have products and purchase orders assigned

USE smartshelfx;

-- Step 1: Check current vendor users
SELECT 'Current Vendors:' as Info;
SELECT id, username, full_name, email, role 
FROM users 
WHERE role = 'VENDOR' AND active = true;

-- Step 2: Check current product assignments
SELECT 'Products with Vendor Assignments:' as Info;
SELECT COUNT(*) as total_products, 
       COUNT(vendor_id) as assigned_products,
       COUNT(*) - COUNT(vendor_id) as unassigned_products
FROM products;

-- Step 3: Assign products to vendors if not already assigned
-- Get the first active vendor
SET @vendor_id = (SELECT id FROM users WHERE role = 'VENDOR' AND active = true LIMIT 1);

-- Display the vendor we're using
SELECT 'Assigning products to vendor:' as Info;
SELECT id, username, full_name FROM users WHERE id = @vendor_id;

-- Assign products to this vendor (update products that don't have a vendor)
UPDATE products 
SET vendor_id = @vendor_id 
WHERE vendor_id IS NULL 
LIMIT 15;

-- Step 4: Verify products are now assigned
SELECT 'Products assigned to vendor:' as Info;
SELECT p.id, p.sku, p.name, p.category, p.current_stock, p.reorder_level,
       u.full_name as vendor_name, u.username
FROM products p
JOIN users u ON p.vendor_id = u.id
WHERE p.vendor_id = @vendor_id;

-- Step 5: Create purchase orders for the vendor if none exist
-- Check existing purchase orders
SELECT 'Existing purchase orders for vendor:' as Info;
SELECT COUNT(*) as order_count
FROM purchase_orders
WHERE vendor_id = @vendor_id;

-- Create purchase orders for low stock products
INSERT INTO purchase_orders (product_id, vendor_id, quantity, total_cost, status, order_date, expected_delivery_date)
SELECT 
    p.id,
    @vendor_id,
    GREATEST(p.reorder_level - p.current_stock, 10) as quantity,
    p.price * GREATEST(p.reorder_level - p.current_stock, 10) as total_cost,
    'PENDING' as status,
    NOW() as order_date,
    DATE_ADD(NOW(), INTERVAL 7 DAY) as expected_delivery_date
FROM products p
WHERE p.vendor_id = @vendor_id
  AND p.current_stock < p.reorder_level
  AND NOT EXISTS (
      SELECT 1 FROM purchase_orders po 
      WHERE po.product_id = p.id 
        AND po.vendor_id = @vendor_id 
        AND po.status = 'PENDING'
  )
LIMIT 5;

-- Step 6: Verify the setup
SELECT 'Final Verification:' as Info;

SELECT '1. Vendor Products Count:' as Check_Item;
SELECT COUNT(*) as count
FROM products
WHERE vendor_id = @vendor_id;

SELECT '2. Pending Purchase Orders:' as Check_Item;
SELECT COUNT(*) as count
FROM purchase_orders
WHERE vendor_id = @vendor_id AND status = 'PENDING';

SELECT '3. Approved Purchase Orders:' as Check_Item;
SELECT COUNT(*) as count
FROM purchase_orders
WHERE vendor_id = @vendor_id AND status = 'APPROVED';

SELECT '4. Rejected Purchase Orders:' as Check_Item;
SELECT COUNT(*) as count
FROM purchase_orders
WHERE vendor_id = @vendor_id AND status = 'REJECTED';

-- Display summary for vendor dashboard
SELECT 'Vendor Dashboard Summary:' as Info;
SELECT 
    (SELECT COUNT(*) FROM products WHERE vendor_id = @vendor_id) as 'Assigned Products',
    (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = @vendor_id AND status = 'PENDING') as 'Pending Orders',
    (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = @vendor_id AND status = 'APPROVED') as 'Approved Orders',
    (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = @vendor_id AND status = 'REJECTED') as 'Rejected Orders';

-- Show sample products
SELECT 'Sample Assigned Products:' as Info;
SELECT p.id, p.sku, p.name, p.current_stock, p.reorder_level, p.price
FROM products p
WHERE p.vendor_id = @vendor_id
LIMIT 5;

-- Show sample orders
SELECT 'Sample Purchase Orders:' as Info;
SELECT po.id, p.name as product_name, po.quantity, po.total_cost, po.status, po.order_date
FROM purchase_orders po
JOIN products p ON po.product_id = p.id
WHERE po.vendor_id = @vendor_id
ORDER BY po.order_date DESC
LIMIT 5;
