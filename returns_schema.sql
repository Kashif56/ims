-- Product Returns Table Schema
-- Run this in your Supabase SQL Editor to add the returns functionality

-- Returns Table
CREATE TABLE IF NOT EXISTS product_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_number TEXT UNIQUE NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  invoice_number TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_items INTEGER NOT NULL DEFAULT 0,
  refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Return Line Items Table
CREATE TABLE IF NOT EXISTS return_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID REFERENCES product_returns(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_returns_return_number ON product_returns(return_number);
CREATE INDEX IF NOT EXISTS idx_product_returns_customer_id ON product_returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_returns_invoice_id ON product_returns(invoice_id);
CREATE INDEX IF NOT EXISTS idx_product_returns_return_date ON product_returns(return_date);
CREATE INDEX IF NOT EXISTS idx_return_line_items_return_id ON return_line_items(return_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_product_returns_updated_at ON product_returns;
CREATE TRIGGER update_product_returns_updated_at BEFORE UPDATE ON product_returns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE product_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_line_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on product_returns" ON product_returns FOR ALL USING (true);
CREATE POLICY "Allow all operations on return_line_items" ON return_line_items FOR ALL USING (true);
