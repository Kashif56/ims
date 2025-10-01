import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  getCustomers, 
  getInventoryItems, 
  getInvoices, 
  getCompanyInfo
} from '@/lib/supabaseService';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  current_due: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
}

interface LineItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  sale_price: number;
  cost_price: number;
}

interface SavedInvoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  date: string;
  total_amount: number;
  amount_paid: number;
  remaining_due: number;
  lineItems?: LineItem[];
  company_name?: string;
  company_address?: string;
  company_contact?: string;
}

interface AppContextType {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
  savedInvoices: SavedInvoice[];
  setSavedInvoices: (invoices: SavedInvoice[]) => void;
  companyInfo: {
    id?: string;
    name: string;
    address: string;
    contact: string;
  };
  setCompanyInfo: (info: { id?: string; name: string; address: string; contact: string }) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [companyInfo, setCompanyInfo] = useState<{
    id?: string;
    name: string;
    address: string;
    contact: string;
  }>({
    name: "Mobile Hub Electronics",
    address: "123 Commerce Street, Business District",
    contact: "Ph: (555) 123-4567 | Email: sales@mobilehub.com"
  });
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [customersData, inventoryData, invoicesData, companyData] = await Promise.all([
        getCustomers(),
        getInventoryItems(),
        getInvoices(),
        getCompanyInfo().catch(() => null)
      ]);

      setCustomers(customersData);
      setInventory(inventoryData);
      setSavedInvoices(invoicesData);
      
      if (companyData) {
        setCompanyInfo({
          id: companyData.id,
          name: companyData.name,
          address: companyData.address,
          contact: companyData.contact
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <AppContext.Provider
      value={{
        customers,
        setCustomers,
        inventory,
        setInventory,
        savedInvoices,
        setSavedInvoices,
        companyInfo,
        setCompanyInfo,
        loading,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
