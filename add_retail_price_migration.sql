-- Add retail_price column to inventory_items table
-- This migration adds a retail price field for items to be used as default sale price

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10, 2) DEFAULT 0;

-- Update existing items to have retail_price = cost_price * 1.2 (20% markup as default)
UPDATE inventory_items 
SET retail_price = cost_price * 1.2 
WHERE retail_price = 0 OR retail_price IS NULL;

-- Add comment to the column
COMMENT ON COLUMN inventory_items.retail_price IS 'Default retail/sale price for the item';
