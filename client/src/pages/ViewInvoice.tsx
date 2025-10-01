import { Link, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/Layout';

export default function ViewInvoicePage() {
  const [, params] = useRoute('/invoice/:id');
  const { savedInvoices } = useAppContext();
  
  const invoice = savedInvoices.find(inv => inv.id === params?.id);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invoice Not Found</h2>
          <Link href="/invoices">
            <Button>Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const totalSales = invoice.lineItems?.reduce((sum, item) => sum + (item.quantity * item.sale_price), 0) || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4 print:hidden">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>
        <div className="bg-card border rounded-lg shadow-lg p-8">
          {/* Company Header */}
          <div className="text-center mb-6 pb-6 border-b">
            <h2 className="text-2xl font-bold text-primary mb-2">
              {invoice.company_name || 'Mobile Hub Electronics'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {invoice.company_address || '123 Commerce Street, Business District'}
            </p>
            <p className="text-sm text-muted-foreground">
              {invoice.company_contact || 'Ph: (555) 123-4567 | Email: sales@mobilehub.com'}
            </p>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Invoice Number</h3>
              <p className="font-bold text-lg">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Date</h3>
              <p className="font-bold text-lg">{invoice.date}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p className="font-semibold">{invoice.customer_name}</p>
            {invoice.customer_phone && <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>}
            {invoice.customer_address && <p className="text-sm text-muted-foreground">{invoice.customer_address}</p>}
          </div>

          {/* Line Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold text-sm">Item Description</th>
                    <th className="text-center p-3 font-semibold text-sm">Qty</th>
                    <th className="text-right p-3 font-semibold text-sm">Unit Price</th>
                    <th className="text-right p-3 font-semibold text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems && invoice.lineItems.length > 0 ? (
                    invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">{item.item_name}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">Rs. {item.sale_price.toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold">Rs. {(item.quantity * item.sale_price).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        No items in this invoice
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal (Sales):</span>
                <span className="font-semibold">Rs. {totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-3">
                <span className="font-bold">Total Payable:</span>
                <span className="font-extrabold text-primary">Rs. {invoice.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-lg border-t pt-3">
                <span className="font-bold">Cash Paid:</span>
                <span className="font-extrabold">Rs. {invoice.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-3">
                <span className="font-bold">Remaining Due:</span>
                <span className={`font-extrabold ${invoice.remaining_due > 0 ? 'text-destructive' : 'text-chart-2'}`}>
                  Rs. {invoice.remaining_due.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
