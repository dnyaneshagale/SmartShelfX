-- Complete Setup Script for SmartShelfX
-- This script:
-- 1. Creates stock_approval_requests table (for approval workflow)
-- 2. Sets up vendor dashboard data (assigns products and creates orders)

USE smartshelfx;

-- ============================================
-- PART 1: Create Stock Approval Requests Table
-- ============================================
SELECT '========================================' as '';
SELECT 'PART 1: Creating Stock Approval Table' as '';
SELECT '========================================' as '';

CREATE TABLE IF NOT EXISTS stock_approval_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remarks VARCHAR(500),
    vendor_remarks VARCHAR(500),
    created_at DATETIME NOT NULL,
    responded_at DATETIME,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id),
    FOREIGN KEY (requested_by) REFERENCES users(id)
);

SELECT 'Table stock_approval_requests created/verified' as Status;

-- Verify table structure
SELECT 'Table Structure:' as '';
DESCRIBE stock_approval_requests;

-- ============================================
-- PART 2: Setup Vendor Dashboard Data
-- ============================================
SELECT '' as '';
SELECT '========================================' as '';
SELECT 'PART 2: Setting Up Vendor Dashboard Data' as '';
SELECT '========================================' as '';

-- Step 1: Check current vendor users
SELECT 'Step 1: Current Vendors' as '';
SELECT id, username, full_name, email, role 
FROM users 
WHERE role = 'VENDOR' AND active = true;

-- Step 2: Check current product assignments
SELECT '' as '';
SELECT 'Step 2: Product Assignment Status' as '';
SELECT COUNT(*) as total_products, 
       COUNT(vendor_id) as assigned_products,
       COUNT(*) - COUNT(vendor_id) as unassigned_products
FROM products;

-- Step 3: Assign products to vendors
SELECT '' as '';
SELECT 'Step 3: Assigning Products to Vendor' as '';

-- Get the first active vendor
SET @vendor_id = (SELECT id FROM users WHERE role = 'VENDOR' AND active = true LIMIT 1);

-- Display the vendor we're using
SELECT CONCAT('Using Vendor ID: ', @vendor_id) as Info;
SELECT id, username, full_name, email FROM users WHERE id = @vendor_id;

-- Assign products to this vendor (update products that don't have a vendor)
UPDATE products 
SET vendor_id = @vendor_id 
WHERE vendor_id IS NULL 
LIMIT 15;

SELECT ROW_COUNT() as 'Products Assigned';

-- Step 4: Verify products are now assigned
SELECT '' as '';
SELECT 'Step 4: Vendor Products (showing first 5)' as '';
SELECT p.id, p.sku, p.name, p.category, p.current_stock, p.reorder_level, p.price
FROM products p
WHERE p.vendor_id = @vendor_id
LIMIT 5;

-- Step 5: Create purchase orders for the vendor
SELECT '' as '';
SELECT 'Step 5: Creating Purchase Orders' as '';

-- Check existing purchase orders
SELECT CONCAT('Existing orders for vendor: ', COUNT(*)) as Info
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

SELECT ROW_COUNT() as 'Purchase Orders Created';

-- ============================================
-- PART 3: Final Verification
-- ============================================
SELECT '' as '';
SELECT '========================================' as '';
SELECT 'PART 3: Final Verification & Summary' as '';
SELECT '========================================' as '';

-- Show vendor dashboard summary
SELECT '' as '';
SELECT 'Vendor Dashboard Data Summary:' as '';
SELECT 
    @vendor_id as 'Vendor ID',
    (SELECT username FROM users WHERE id = @vendor_id) as 'Vendor Username',
    (SELECT full_name FROM users WHERE id = @vendor_id) as 'Vendor Name',
    (SELECT COUNT(*) FROM products WHERE vendor_id = @vendor_id) as 'Assigned Products',
    (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = @vendor_id AND status = 'PENDING') as 'Pending Orders',
    (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = @vendor_id AND status = 'APPROVED') as 'Approved Orders',
    (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = @vendor_id AND status = 'REJECTED') as 'Rejected Orders';

-- Show sample products with full details
SELECT '' as '';
SELECT 'Sample Products Assigned to Vendor:' as '';
SELECT p.id, p.sku, p.name, p.category, p.current_stock, p.reorder_level, 
       CONCAT('$', p.price) as price,
       CASE 
           WHEN p.current_stock < p.reorder_level THEN 'Low Stock'
           ELSE 'OK'
       END as stock_status
FROM products p
WHERE p.vendor_id = @vendor_id
LIMIT 5;

-- Show sample orders with details
SELECT '' as '';
SELECT 'Sample Purchase Orders for Vendor:' as '';
SELECT po.id, p.name as product_name, po.quantity, 
       CONCAT('$', po.total_cost) as total_cost, 
       po.status, 
       DATE_FORMAT(po.order_date, '%Y-%m-%d %H:%i') as order_date
FROM purchase_orders po
JOIN products p ON po.product_id = p.id
WHERE po.vendor_id = @vendor_id
ORDER BY po.order_date DESC
LIMIT 5;

-- ============================================
-- PART 4: Setup Complete Message
-- ============================================
SELECT '' as '';
SELECT '========================================' as '';
SELECT '✅ SETUP COMPLETE!' as '';
SELECT '========================================' as '';
SELECT '' as '';
SELECT 'Next Steps:' as '';
SELECT '1. Restart your frontend: cd frontend && npm start' as Step;
SELECT '2. Login with vendor credentials' as Step;
SELECT '3. Vendor dashboard should now show data' as Step;
SELECT '' as '';
SELECT 'Vendor Login Info:' as '';
SELECT CONCAT('Username: ', username) as Info, CONCAT('Vendor ID: ', id) as Note
FROM users WHERE id = @vendor_id;
SELECT '' as '';
SELECT '⚠️  Note: Use the username shown above to login as vendor' as Important;
SELECT '⚠️  If you need to check the password, it was set during user creation' as Important;
