-- Migration to track returned quantities for invoice line items
-- This prevents returning more items than purchased

-- Add a column to track how much of each invoice line item has been returned
ALTER TABLE invoice_line_items 
ADD COLUMN IF NOT EXISTS returned_quantity INTEGER NOT NULL DEFAULT 0;

-- Add a check constraint to ensure returned quantity doesn't exceed purchased quantity
ALTER TABLE invoice_line_items 
ADD CONSTRAINT check_returned_quantity 
CHECK (returned_quantity >= 0 AND returned_quantity <= quantity);

-- Create an index for better performance when checking returned items
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_returned 
ON invoice_line_items(invoice_id, returned_quantity);

-- Verify the schema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'invoice_line_items'
ORDER BY ordinal_position;
