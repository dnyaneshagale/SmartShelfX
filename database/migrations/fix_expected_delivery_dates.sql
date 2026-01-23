-- Update existing purchase orders to add expected delivery dates
-- This fixes the blank Expected Delivery column issue

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

UPDATE purchase_orders 
SET expected_delivery_date = DATE(DATE_ADD(created_at, INTERVAL 7 DAY))
WHERE expected_delivery_date IS NULL;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
