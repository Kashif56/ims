import { supabase, Customer, InventoryItem, Invoice, InvoiceLineItem, CompanyInfo, PaymentHistory } from './supabase';

// Company Info Operations
export const getCompanyInfo = async () => {
  const { data, error } = await supabase
    .from('company_info')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCompanyInfo = async (id: string, info: Partial<CompanyInfo>) => {
  const { data, error } = await supabase
    .from('company_info')
    .update(info)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Customer Operations
export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCustomer = async (id: string, customer: Partial<Customer>) => {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Inventory Operations
export const getInventoryItems = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([item])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(item)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Invoice Operations
export const getInvoices = async () => {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  if (!invoices || invoices.length === 0) return [];
  
  // Fetch line items for all invoices
  const invoiceIds = invoices.map(inv => inv.id);
  const { data: allLineItems, error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .select('*')
    .in('invoice_id', invoiceIds);
  
  if (lineItemsError) throw lineItemsError;
  
  // Map line items to their respective invoices
  return invoices.map(invoice => ({
    ...invoice,
    lineItems: allLineItems?.filter(item => item.invoice_id === invoice.id) || []
  }));
};

export const getInvoiceById = async (id: string) => {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
  
  if (invoiceError) throw invoiceError;

  const { data: lineItems, error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .select('*')
    .eq('invoice_id', id);
  
  if (lineItemsError) throw lineItemsError;

  return {
    ...invoice,
    lineItems: lineItems || []
  };
};

export const createInvoice = async (
  invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>,
  lineItems: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>[]
) => {
  // Insert invoice
  const { data: invoiceData, error: invoiceError } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();
  
  if (invoiceError) throw invoiceError;

  // Insert line items
  const lineItemsWithInvoiceId = lineItems.map(item => ({
    ...item,
    invoice_id: invoiceData.id
  }));

  const { data: lineItemsData, error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .insert(lineItemsWithInvoiceId)
    .select();
  
  if (lineItemsError) throw lineItemsError;

  return {
    ...invoiceData,
    lineItems: lineItemsData
  };
};

export const deleteInvoice = async (id: string) => {
  // First delete line items
  const { error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .delete()
    .eq('invoice_id', id);
  
  if (lineItemsError) throw lineItemsError;

  // Then delete invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (invoiceError) throw invoiceError;
};

// Generate next invoice number
export const getNextInvoiceNumber = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw error;

  if (!data || data.length === 0) {
    return 'INV-00001';
  }

  const lastNumber = data[0].invoice_number;
  const match = lastNumber.match(/INV-(\d+)/);
  
  if (match) {
    const nextNum = parseInt(match[1]) + 1;
    return `INV-${String(nextNum).padStart(5, '0')}`;
  }

  return 'INV-00001';
};

// Payment History Operations
export const createPaymentHistory = async (payment: Omit<PaymentHistory, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('payment_history')
    .insert([payment])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getPaymentHistory = async (startDate?: string, endDate?: string) => {
  let query = supabase
    .from('payment_history')
    .select('*');
  
  // Apply date filters if provided
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    // Add one day to endDate to include the entire end date
    const endDateTime = new Date(endDate);
    endDateTime.setDate(endDateTime.getDate() + 1);
    query = query.lt('created_at', endDateTime.toISOString());
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export const getPaymentHistoryByCustomer = async (customerId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('payment_history')
    .select('*')
    .eq('customer_id', customerId);
  
  // Apply date filters if provided
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    // Add one day to endDate to include the entire end date
    const endDateTime = new Date(endDate);
    endDateTime.setDate(endDateTime.getDate() + 1);
    query = query.lt('created_at', endDateTime.toISOString());
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

// Profit Analysis - Get all line items with profit calculation
export const getProfitAnalysis = async (startDate?: string, endDate?: string) => {
  let query = supabase
    .from('invoice_line_items')
    .select(`
      *,
      invoices!inner(date, invoice_number)
    `);
  
  // Apply date filters if provided
  if (startDate) {
    query = query.gte('invoices.date', startDate);
  }
  if (endDate) {
    query = query.lte('invoices.date', endDate);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data: lineItems, error } = await query;
  
  if (error) throw error;
  
  // Calculate profit for each item
  const itemsWithProfit = (lineItems || []).map((item: any) => ({
    ...item,
    profit: (item.sale_price - item.cost_price) * item.quantity,
    revenue: item.sale_price * item.quantity,
    cost: item.cost_price * item.quantity,
    date: item.invoices?.date,
    invoice_number: item.invoices?.invoice_number
  }));
  
  return itemsWithProfit;
};

// Get aggregated profit by product
export const getProfitByProduct = async (startDate?: string, endDate?: string) => {
  const profitData = await getProfitAnalysis(startDate, endDate);
  
  // Group by item_name and aggregate
  const productMap = new Map();
  
  profitData.forEach((item: any) => {
    const existing = productMap.get(item.item_name);
    if (existing) {
      existing.totalQuantity += item.quantity;
      existing.totalRevenue += item.revenue;
      existing.totalCost += item.cost;
      existing.totalProfit += item.profit;
      existing.transactionCount += 1;
    } else {
      productMap.set(item.item_name, {
        item_name: item.item_name,
        totalQuantity: item.quantity,
        totalRevenue: item.revenue,
        totalCost: item.cost,
        totalProfit: item.profit,
        transactionCount: 1
      });
    }
  });
  
  return Array.from(productMap.values()).sort((a, b) => b.totalProfit - a.totalProfit);
};
