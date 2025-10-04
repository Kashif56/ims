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
