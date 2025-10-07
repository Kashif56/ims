import { createClient } from '@supabase/supabase-js';

export const supabase = createClient("https://thmdhjmwlksqomebhtgz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobWRoam13bGtzcW9tZWJodGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDAxNjgsImV4cCI6MjA3NDkxNjE2OH0.QQBltt2_PNK5DNxhGGLqQUBoIQ5DHFLZ-t1muv3KITY");

// Database Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  current_due: number;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  cost_price: number;
  retail_price: number;
  stock_quantity: number;
  reorder_level: number;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  date: string;
  total_amount: number;
  amount_paid: number;
  remaining_due: number;
  company_name?: string;
  company_address?: string;
  company_contact?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  sale_price: number;
  cost_price: number;
  returned_quantity?: number;
  created_at?: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  address: string;
  contact: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentHistory {
  id: string;
  invoice_id?: string | null;
  customer_id: string;
  customer_name: string;
  amount: number;
  payment_type: 'invoice_payment' | 'partial_payment' | 'due_payment';
  notes?: string;
  cleared?: boolean;
  cleared_at?: string;
  created_at?: string;
}

export interface ProductReturn {
  id: string;
  return_number: string;
  invoice_id?: string | null;
  invoice_number?: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone?: string;
  return_date: string;
  total_items: number;
  refund_amount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReturnLineItem {
  id: string;
  return_id: string;
  item_id?: string | null;
  item_name: string;
  quantity: number;
  sale_price: number;
  cost_price: number;
  created_at?: string;
}
