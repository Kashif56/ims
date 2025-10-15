import { Link, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/Layout';
import ReceiptPrint from '@/components/ReceiptPrint';
import { useState } from 'react';

export default function ViewBillPage() {
  const [, params] = useRoute('/bill/:id');
  const { savedInvoices, companyInfo } = useAppContext();
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  
  const bill = savedInvoices.find(inv => inv.id === params?.id);

  if (!bill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Bill Not Found</h2>
          <Link href="/bills">
            <Button>Back to Bills</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    setPrintFormat('thermal');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const totalSales = bill.lineItems?.reduce((sum, item) => sum + (item.quantity * item.sale_price), 0) || 0;
  const totalCost = bill.lineItems?.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0) || 0;
  const totalProfit = totalSales - totalCost;
  const previousDue = bill.total_amount - totalSales;
  const balanceDue = bill.remaining_due;

  // Convert bill data to match ReceiptPrint props
  const customer = {
    id: bill.id,
    name: bill.customer_name,
    phone: bill.customer_phone || '',
    address: bill.customer_address || '',
    current_due: bill.remaining_due
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-4 print:hidden flex gap-2">
          <Button onClick={handlePrint} variant="default" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
          <Link href="/bills">
            <Button variant="outline" size="sm">
              Back to Bills
            </Button>
          </Link>
        </div>

        {/* Admin Profit Display - Hidden on Print */}
        <div className="mb-4 print:hidden bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              Profit on this Bill
            </span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
              Rs. {totalProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Display Receipt on Screen - Non-printable version */}
        <div className="print:hidden">
          <ReceiptPrint
            billNumber={bill.invoice_number}
            date={bill.date}
            customer={customer}
            lineItems={bill.lineItems || []}
            totalSales={totalSales}
            previousDue={previousDue}
            cashPaid={bill.amount_paid}
            balanceDue={balanceDue}
            companyInfo={companyInfo}
            printFormat={printFormat}
          />
        </div>

        {/* Hidden Receipt for Printing */}
        <div className="hidden print:block">
          <ReceiptPrint
            billNumber={bill.invoice_number}
            date={bill.date}
            customer={customer}
            lineItems={bill.lineItems || []}
            totalSales={totalSales}
            previousDue={previousDue}
            cashPaid={bill.amount_paid}
            balanceDue={balanceDue}
            companyInfo={companyInfo}
            printFormat={printFormat}
          />
        </div>
      </div>
    </Layout>
  );
}
