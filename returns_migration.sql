-- Migration to fix product_returns table
-- Run this in your Supabase SQL Editor

-- Ensure refund_amount column exists
ALTER TABLE product_returns 
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'product_returns'
ORDER BY ordinal_position;
