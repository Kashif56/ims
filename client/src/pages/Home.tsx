import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Package, BarChart3, Eye, Printer } from 'lucide-react';
import InvoiceHeader from '@/components/InvoiceHeader';
import CustomerSelector from '@/components/CustomerSelector';
import InvoiceLineItems from '@/components/InvoiceLineItems';
import InvoiceCalculations from '@/components/InvoiceCalculations';
import InventoryModal from '@/components/InventoryModal';
import DashboardModal from '@/components/DashboardModal';
import InvoiceListModal from '@/components/InvoiceListModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';

//todo: remove mock functionality - this is mock data for the prototype
interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  currentDue: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
}

interface LineItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  salePrice: number;
  costPrice: number;
}

interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  totalAmount: number;
  amountPaid: number;
  remainingDue: number;
}

export default function Home() {
  const { toast } = useToast();

  //todo: remove mock functionality
  const [companyInfo, setCompanyInfo] = useState({
    name: "Mobile Hub Electronics",
    address: "123 Commerce Street, Business District",
    contact: "Ph: (555) 123-4567 | Email: sales@mobilehub.com"
  });

  //todo: remove mock functionality
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'John Smith', phone: '555-0101', address: '123 Main St', currentDue: 450.00 },
    { id: '2', name: 'Sarah Johnson', phone: '555-0102', address: '456 Oak Ave', currentDue: 0 },
    { id: '3', name: 'Mike Wilson', phone: '555-0103', address: '789 Pine Rd', currentDue: 1200.50 },
  ]);

  //todo: remove mock functionality
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'iPhone 15 Pro Max 256GB', sku: 'IPH15PM256', costPrice: 1100, stockQuantity: 15, reorderLevel: 10 },
    { id: '2', name: 'Samsung Galaxy S24 Ultra', sku: 'SGS24U', costPrice: 1000, stockQuantity: 5, reorderLevel: 10 },
    { id: '3', name: 'Google Pixel 8 Pro', sku: 'GPX8P', costPrice: 850, stockQuantity: 12, reorderLevel: 10 },
    { id: '4', name: 'OnePlus 12', sku: 'OP12', costPrice: 700, stockQuantity: 20, reorderLevel: 10 },
    { id: '5', name: 'AirPods Pro Gen 3', sku: 'APP3', costPrice: 220, stockQuantity: 3, reorderLevel: 15 },
  ]);

  //todo: remove mock functionality
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([
    { id: '1', invoiceNumber: 'INV-00001', customerName: 'John Smith', date: '2025-09-28', totalAmount: 2799.97, amountPaid: 2799.97, remainingDue: 0 },
    { id: '2', invoiceNumber: 'INV-00002', customerName: 'Sarah Johnson', date: '2025-09-29', totalAmount: 1599.99, amountPaid: 1000, remainingDue: 599.99 },
    { id: '3', invoiceNumber: 'INV-00003', customerName: 'Mike Wilson', date: '2025-09-30', totalAmount: 3249.99, amountPaid: 2000, remainingDue: 1249.99 },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [cashPaid, setCashPaid] = useState(0);
  const [invoiceNumber] = useState(`INV-${String(savedInvoices.length + 1).padStart(5, '0')}`);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [showInvoiceListModal, setShowInvoiceListModal] = useState(false);

  const totalSales = lineItems.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
  const totalCost = lineItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  const previousDue = selectedCustomer?.currentDue || 0;

  //todo: remove mock functionality
  const handleCreateCustomer = (customer: Omit<Customer, 'id' | 'currentDue'>) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
      currentDue: 0,
    };
    setCustomers([...customers, newCustomer]);
    setSelectedCustomer(newCustomer);
    toast({
      title: "Customer Created",
      description: `${customer.name} has been added successfully.`,
    });
  };

  //todo: remove mock functionality
  const handleAddInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setInventory([...inventory, newItem]);
    toast({
      title: "Item Added",
      description: `${item.name} has been added to inventory.`,
    });
  };

  //todo: remove mock functionality
  const handleUpdateInventoryItem = (id: string, item: Omit<InventoryItem, 'id'>) => {
    setInventory(inventory.map(i => i.id === id ? { ...item, id } : i));
    toast({
      title: "Item Updated",
      description: "Inventory item has been updated.",
    });
  };

  //todo: remove mock functionality
  const handleDeleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(i => i.id !== id));
    toast({
      title: "Item Deleted",
      description: "Item has been removed from inventory.",
    });
  };

  //todo: remove mock functionality
  const handleSaveInvoice = () => {
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

    const totalPayable = totalSales + previousDue;
    const remainingDue = totalPayable - cashPaid;

    const newInvoice: SavedInvoice = {
      id: Date.now().toString(),
      invoiceNumber,
      customerName: selectedCustomer.name,
      date: new Date().toLocaleDateString(),
      totalAmount: totalPayable,
      amountPaid: cashPaid,
      remainingDue,
    };

    setSavedInvoices([...savedInvoices, newInvoice]);

    // Update customer due balance
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, currentDue: remainingDue }
        : c
    ));

    toast({
      title: "Invoice Saved",
      description: `Invoice ${invoiceNumber} has been saved successfully.`,
    });

    // Reset form
    setSelectedCustomer(null);
    setLineItems([]);
    setCashPaid(0);
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

  //todo: remove mock functionality
  const dashboardStats = {
    totalRevenue: savedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    totalProfit: savedInvoices.reduce((sum, inv) => sum + (inv.totalAmount * 0.15), 0),
    invoicesToday: savedInvoices.filter(inv => inv.date === new Date().toLocaleDateString()).length,
    lowStockItems: inventory.filter(item => item.stockQuantity < item.reorderLevel).length,
  };

  const lowStockItems = inventory.filter(item => item.stockQuantity < item.reorderLevel);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 print:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Mobile Shop Manager</h1>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleNewInvoice} variant="outline" size="sm" data-testid="button-new-invoice">
                <FileText className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button onClick={() => setShowInvoiceListModal(true)} variant="outline" size="sm" data-testid="button-view-invoices">
                <Eye className="w-4 h-4 mr-2" />
                View Invoices
              </Button>
              <Button onClick={() => setShowInventoryModal(true)} variant="outline" size="sm" data-testid="button-inventory">
                <Package className="w-4 h-4 mr-2" />
                Inventory
              </Button>
              <Button onClick={() => setShowDashboardModal(true)} variant="outline" size="sm" data-testid="button-dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-card border rounded-lg shadow-lg p-6 md:p-8">
          <InvoiceHeader
            invoiceNumber={invoiceNumber}
            date={new Date().toLocaleDateString()}
            companyInfo={companyInfo}
            onCompanyInfoUpdate={setCompanyInfo}
          />

          <CustomerSelector
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
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
            <Button onClick={handleSaveInvoice} size="lg" data-testid="button-save-invoice">
              Save Invoice
            </Button>
          </div>
        </div>
      </main>

      <InventoryModal
        open={showInventoryModal}
        onOpenChange={setShowInventoryModal}
        items={inventory}
        onAddItem={handleAddInventoryItem}
        onUpdateItem={handleUpdateInventoryItem}
        onDeleteItem={handleDeleteInventoryItem}
      />

      <DashboardModal
        open={showDashboardModal}
        onOpenChange={setShowDashboardModal}
        stats={dashboardStats}
        lowStockItems={lowStockItems}
      />

      <InvoiceListModal
        open={showInvoiceListModal}
        onOpenChange={setShowInvoiceListModal}
        invoices={savedInvoices}
        onViewInvoice={(invoice) => {
          console.log('View invoice:', invoice);
          toast({
            title: "View Invoice",
            description: `Viewing ${invoice.invoiceNumber} - Feature coming soon!`,
          });
        }}
      />
    </div>
  );
}
