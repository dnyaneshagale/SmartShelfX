-- Update existing purchase orders to generate PO numbers for NULL entries
-- This fixes the blank PO Number column issue

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Update NULL po_numbers with generated values based on ID
UPDATE purchase_orders 
SET po_number = CONCAT('PO-', UNIX_TIMESTAMP(created_at) * 1000 + id)
WHERE po_number IS NULL;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
