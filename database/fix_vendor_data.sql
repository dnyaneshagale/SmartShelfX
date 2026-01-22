-- Fix script to assign vendors to products and purchase orders
USE smartshelfx;

-- Step 1: Get vendor user ID
SET @vendor_id = (SELECT id FROM users WHERE role = 'VENDOR' LIMIT 1);

-- Step 2: Display vendor info
SELECT 'Selected Vendor:' as info;
SELECT id, username, email, full_name 
FROM users 
WHERE id = @vendor_id;

-- Step 3: Assign this vendor to all products that don't have a vendor
UPDATE products 
SET vendor_id = @vendor_id 
WHERE vendor_id IS NULL;

-- Step 4: Show how many products were updated
SELECT 
    'Products Updated:' as info,
    ROW_COUNT() as updated_count;

-- Step 5: Update purchase orders with vendor from their product
UPDATE purchase_orders po
INNER JOIN products p ON po.product_id = p.id
SET po.vendor_id = p.vendor_id
WHERE po.vendor_id IS NULL 
  AND p.vendor_id IS NOT NULL;

-- Step 6: Show how many purchase orders were updated
SELECT 
    'Purchase Orders Updated:' as info,
    ROW_COUNT() as updated_count;

-- Step 7: Verify the results
SELECT 'Final Status:' as info;
SELECT 
    'Products' as table_name,
    COUNT(*) as total,
    COUNT(vendor_id) as with_vendor,
    COUNT(*) - COUNT(vendor_id) as without_vendor
FROM products
UNION ALL
SELECT 
    'Purchase Orders' as table_name,
    COUNT(*) as total,
    COUNT(vendor_id) as with_vendor,
    COUNT(*) - COUNT(vendor_id) as without_vendor
FROM purchase_orders;

-- Step 8: Show sample products with vendor
SELECT 'Sample Products with Vendor:' as info;
SELECT 
    p.id,
    p.name,
    p.sku,
    u.full_name as vendor_name,
    u.email as vendor_email
FROM products p
INNER JOIN users u ON p.vendor_id = u.id
LIMIT 5;

-- Step 9: Show sample purchase orders with vendor
SELECT 'Sample Purchase Orders with Vendor:' as info;
SELECT 
    po.id,
    po.po_number,
    po.status,
    p.name as product_name,
    v.full_name as vendor_name
FROM purchase_orders po
INNER JOIN products p ON po.product_id = p.id
INNER JOIN users v ON po.vendor_id = v.id
LIMIT 5;
