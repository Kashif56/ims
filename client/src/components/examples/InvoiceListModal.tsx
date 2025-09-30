import { useState } from 'react';
import InvoiceListModal from '../InvoiceListModal';
import { Button } from '@/components/ui/button';

export default function InvoiceListModalExample() {
  const [open, setOpen] = useState(false);

  const invoices = [
    { id: '1', invoiceNumber: 'INV-00001', customerName: 'John Smith', date: '2025-09-28', totalAmount: 2799.97, amountPaid: 2799.97, remainingDue: 0 },
    { id: '2', invoiceNumber: 'INV-00002', customerName: 'Sarah Johnson', date: '2025-09-29', totalAmount: 1599.99, amountPaid: 1000, remainingDue: 599.99 },
    { id: '3', invoiceNumber: 'INV-00003', customerName: 'Mike Wilson', date: '2025-09-30', totalAmount: 3249.99, amountPaid: 2000, remainingDue: 1249.99 },
  ];

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Invoice List</Button>
      <InvoiceListModal
        open={open}
        onOpenChange={setOpen}
        invoices={invoices}
        onViewInvoice={(inv) => console.log('View invoice:', inv)}
      />
    </div>
  );
}
