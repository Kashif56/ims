import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Layout from '@/components/Layout';
import InvoiceHeader from '@/components/InvoiceHeader';
import CustomerSelector from '@/components/CustomerSelector';
import InvoiceLineItems from '@/components/InvoiceLineItems';
import InvoiceCalculations from '@/components/InvoiceCalculations';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { createInvoice, getNextInvoiceNumber, updateCustomer, createCustomer } from '@/lib/supabaseService';

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

export default function Home() {
  const { toast } = useToast();
  const { customers, setCustomers, inventory, companyInfo, setCompanyInfo, refreshData } = useAppContext();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [cashPaid, setCashPaid] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('INV-00001');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInvoiceNumber = async () => {
      try {
        const nextNumber = await getNextInvoiceNumber();
        setInvoiceNumber(nextNumber);
      } catch (error) {
        console.error('Error fetching invoice number:', error);
      }
    };
    fetchInvoiceNumber();
  }, []);

  const totalSales = lineItems.reduce((sum, item) => sum + (item.quantity * item.sale_price), 0);
  const totalCost = lineItems.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);
  const previousDue = selectedCustomer?.current_due || 0;

  const handleCreateCustomer = async (customer: Omit<Customer, 'id' | 'current_due'>) => {
    try {
      const newCustomer = await createCustomer({
        ...customer,
        current_due: 0,
      });
      setCustomers([...customers, newCustomer]);
      setSelectedCustomer(newCustomer);
      toast({
        title: "Customer Created",
        description: `${customer.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create customer.",
        variant: "destructive",
      });
    }
  };


  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }

    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const totalPayable = totalSales + previousDue;
      const remainingDue = totalPayable - cashPaid;

      const invoiceData = {
        invoice_number: invoiceNumber,
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_phone: selectedCustomer.phone,
        customer_address: selectedCustomer.address,
        date: new Date().toISOString().split('T')[0],
        total_amount: totalPayable,
        amount_paid: cashPaid,
        remaining_due: remainingDue,
        company_name: companyInfo.name,
        company_address: companyInfo.address,
        company_contact: companyInfo.contact,
      };

      const lineItemsData = lineItems.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        sale_price: item.sale_price,
        cost_price: item.cost_price,
      }));

      await createInvoice(invoiceData, lineItemsData);

      // Update customer due balance
      await updateCustomer(selectedCustomer.id, { current_due: remainingDue });

      // Refresh data from Supabase
      await refreshData();

      toast({
        title: "Invoice Saved",
        description: `Invoice ${invoiceNumber} has been saved successfully.`,
      });

      // Reset form
      setSelectedCustomer(null);
      setLineItems([]);
      setCashPaid(0);
      
      // Get next invoice number
      const nextNumber = await getNextInvoiceNumber();
      setInvoiceNumber(nextNumber);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  //todo: remove mock functionality
  const handlePrint = () => {
    window.print();
  };

  //todo: remove mock functionality
  const handleNewInvoice = () => {
    setSelectedCustomer(null);
    setLineItems([]);
    setCashPaid(0);
    toast({
      title: "New Invoice",
      description: "Form has been reset for a new invoice.",
    });
  };


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-card border rounded-lg shadow-lg p-6 md:p-8">
          <InvoiceHeader
            invoiceNumber={invoiceNumber}
            date={new Date().toLocaleDateString()}
            companyInfo={companyInfo}
            onCompanyInfoUpdate={setCompanyInfo}
          />

          <CustomerSelector
            customers={customers.map(c => ({ ...c, currentDue: c.current_due }))}
            selectedCustomer={selectedCustomer ? { ...selectedCustomer, currentDue: selectedCustomer.current_due } : null}
            onSelectCustomer={(customer) => setSelectedCustomer(customer as any)}
            onCreateCustomer={handleCreateCustomer}
          />

          <InvoiceLineItems
            items={lineItems}
            inventory={inventory}
            onAddItem={(item) => setLineItems([...lineItems, item])}
            onUpdateItem={(id, item) => setLineItems(lineItems.map(i => i.id === id ? item : i))}
            onRemoveItem={(id) => setLineItems(lineItems.filter(i => i.id !== id))}
          />

          <InvoiceCalculations
            totalSales={totalSales}
            totalCost={totalCost}
            previousDue={previousDue}
            cashPaid={cashPaid}
            onCashPaidChange={setCashPaid}
          />

          <div className="mt-8 flex gap-3 justify-end print:hidden">
            <Button variant="outline" onClick={handlePrint} data-testid="button-print">
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
            <Button 
              onClick={handleSaveInvoice} 
              size="lg" 
              disabled={saving}
              data-testid="button-save-invoice"
            >
              {saving ? 'Saving...' : 'Save Invoice'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
