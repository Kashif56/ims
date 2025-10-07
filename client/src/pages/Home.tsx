import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Receipt, Trash2, User, DollarSign, ShoppingCart, Printer, RotateCcw } from 'lucide-react';
import Layout from '@/components/Layout';
import CustomerSelector from '@/components/CustomerSelector';
import InvoiceLineItems from '@/components/InvoiceLineItems';
import InvoiceHeader from '@/components/InvoiceHeader';
import ReceiptPrint from '@/components/ReceiptPrint';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { createInvoice, getNextInvoiceNumber, updateCustomer, createCustomer, updateCompanyInfo, createPaymentHistory } from '@/lib/supabaseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';

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
  retail_price: number;
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
  const [, setLocation] = useLocation();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [cashPaid, setCashPaid] = useState(0);
  const [billNumber, setBillNumber] = useState('INV-00001');
  const [saving, setSaving] = useState(false);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBillNumber = async () => {
      try {
        const nextNumber = await getNextInvoiceNumber();
        setBillNumber(nextNumber);
      } catch (error) {
        console.error('Error fetching bill number:', error);
      }
    };
    fetchBillNumber();
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


  const handleSaveBill = async () => {
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
        description: "Please add at least one item to the bill.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const totalPayable = totalSales + previousDue;
      const remainingDue = totalPayable - cashPaid;

      const billData = {
        invoice_number: billNumber,
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

      const invoice = await createInvoice(billData, lineItemsData);

      // Record payment history if any payment was made
      if (cashPaid > 0) {
        await createPaymentHistory({
          invoice_id: invoice.id,
          customer_id: selectedCustomer.id,
          customer_name: selectedCustomer.name,
          amount: cashPaid,
          payment_type: 'invoice_payment',
          notes: `Payment for invoice ${billNumber}`
        });
      }

      // Update customer due balance
      await updateCustomer(selectedCustomer.id, { current_due: remainingDue });

      // Refresh data from Supabase
      await refreshData();

      toast({
        title: "Bill Saved",
        description: `Bill ${billNumber} has been saved successfully.`,
      });

      // Reset form
      setSelectedCustomer(null);
      setLineItems([]);
      setCashPaid(0);
      
      // Get next bill number
      const nextNumber = await getNextInvoiceNumber();
      setBillNumber(nextNumber);
    } catch (error) {
      console.error('Error saving bill:', error);
      toast({
        title: "Error",
        description: "Failed to save bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (!selectedCustomer || lineItems.length === 0) {
      toast({
        title: "Cannot Print",
        description: "Please select a customer and add items before printing.",
        variant: "destructive",
      });
      return;
    }
    setPrintFormat('thermal');
    // Add a small delay to ensure state updates before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleCompanyInfoUpdate = async (info: { name: string; address: string; contact: string }) => {
    try {
      if (companyInfo.id) {
        await updateCompanyInfo(companyInfo.id, info);
      }
      setCompanyInfo({ ...companyInfo, ...info });
      toast({
        title: "Success",
        description: "Business header updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business header.",
        variant: "destructive",
      });
    }
  };

  //todo: remove mock functionality
  const handleNewBill = () => {
    setSelectedCustomer(null);
    setLineItems([]);
    setCashPaid(0);
    toast({
      title: "New Bill",
      description: "Form has been reset for a new bill.",
    });
  };


  const totalPayable = totalSales + previousDue;
  const balanceDue = totalPayable - cashPaid;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Business Header Editor - Hidden on Print */}
        <div className="mb-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Business Header</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceHeader
                invoiceNumber={billNumber}
                date={new Date().toLocaleDateString()}
                companyInfo={companyInfo}
                onCompanyInfoUpdate={handleCompanyInfoUpdate}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          
          {/* LEFT SIDE - Items & Customer */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Bill Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Receipt className="w-6 h-6" />
                    New Bill
                  </h2>
                  <p className="text-sm opacity-90 mt-1">Bill #{billNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Date</p>
                  <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerSelector
                  customers={customers.map(c => ({ ...c, currentDue: c.current_due }))}
                  selectedCustomer={selectedCustomer ? { ...selectedCustomer, currentDue: selectedCustomer.current_due } : null}
                  onSelectCustomer={(customer) => setSelectedCustomer(customer as any)}
                  onCreateCustomer={handleCreateCustomer}
                />
                {selectedCustomer && previousDue !== 0 && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    previousDue > 0 
                      ? 'bg-amber-50 border border-amber-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className={`text-sm font-semibold ${
                      previousDue > 0 ? 'text-amber-800' : 'text-green-800'
                    }`}>
                      {previousDue > 0 ? 'Previous Due' : 'Credit Balance'}: Rs. {Math.abs(previousDue).toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Items ({lineItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceLineItems
                  items={lineItems}
                  inventory={inventory}
                  onAddItem={(item) => setLineItems([...lineItems, item])}
                  onUpdateItem={(id, item) => setLineItems(lineItems.map(i => i.id === id ? item : i))}
                  onRemoveItem={(id) => setLineItems(lineItems.filter(i => i.id !== id))}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE - Billing Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              
              {/* Totals Card */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3 bg-primary/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Bill Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-lg">Rs. {totalSales.toFixed(2)}</span>
                  </div>

                  {/* Previous Due/Credit */}
                  {previousDue !== 0 && (
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className={`text-sm ${
                        previousDue > 0 ? 'text-amber-700' : 'text-green-700'
                      }`}>
                        {previousDue > 0 ? 'Previous Due' : 'Credit Balance'}
                      </span>
                      <span className={`font-semibold text-lg ${
                        previousDue > 0 ? 'text-amber-700' : 'text-green-700'
                      }`}>
                        {previousDue > 0 ? '+' : '-'} Rs. {Math.abs(previousDue).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Total Payable */}
                  <div className="flex justify-between items-center py-3 bg-primary/10 rounded-lg px-3">
                    <span className="font-bold text-base">Total Payable</span>
                    <span className="font-bold text-2xl text-primary">Rs. {totalPayable.toFixed(2)}</span>
                  </div>

                  {/* Cash Paid Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Cash Paid</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
                      <Input
                        type="number"
                        value={cashPaid || ''}
                        onChange={(e) => setCashPaid(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="pl-12 text-lg font-semibold h-12"
                        data-testid="input-cash-paid"
                      />
                    </div>
                  </div>

                  {/* Balance Due */}
                  <div className={`flex justify-between items-center py-3 rounded-lg px-3 dark:bg-primary/10 ${
                    balanceDue > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                  }`}>
                    <span className="font-bold text-base">Balance Due</span>
                    <span className={`font-bold text-2xl ${
                      balanceDue > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      Rs. {balanceDue.toFixed(2)}
                    </span>
                  </div>

                  {balanceDue === 0 && cashPaid > 0 && (
                    <div className="text-center py-2 bg-green-100 text-green-800 font-bold rounded-lg">
                      ✓ FULLY PAID
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button 
                      onClick={handleSaveBill} 
                      size="lg" 
                      className="w-full h-14 text-lg font-bold"
                      disabled={saving || !selectedCustomer || lineItems.length === 0}
                      data-testid="button-save-bill"
                    >
                      <Receipt className="w-5 h-5 mr-2" />
                      {saving ? 'Processing...' : 'Complete Sale'}
                    </Button>
                    
                    <Button 
                      onClick={handlePrint}
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      disabled={saving || !selectedCustomer || lineItems.length === 0}
                      data-testid="button-print-receipt"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      Print Receipt
                    </Button>
                    
                    <Button 
                      onClick={handleNewBill} 
                      variant="outline"
                      size="lg"
                      className="w-full"
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items Count:</span>
                      <span className="font-semibold">{lineItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Qty:</span>
                      <span className="font-semibold">
                        {lineItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Access - Returns */}
              <Card className="border-2 border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                <CardContent className="pt-4">
                  <Button 
                    onClick={() => setLocation('/returns')}
                    variant="outline"
                    size="lg"
                    className="w-full border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Process Return
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Handle product returns and refunds
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Hidden Receipt for Printing */}
        <div className="hidden print:block">
          <ReceiptPrint
            ref={receiptRef}
            billNumber={billNumber}
            date={new Date().toLocaleDateString()}
            customer={selectedCustomer}
            lineItems={lineItems}
            totalSales={totalSales}
            previousDue={previousDue}
            cashPaid={cashPaid}
            balanceDue={balanceDue}
            companyInfo={companyInfo}
            printFormat={printFormat}
          />
        </div>
      </div>
    </Layout>
  );
}
