import { useState } from 'react';
import InvoiceCalculations from '../InvoiceCalculations';

export default function InvoiceCalculationsExample() {
  const [cashPaid, setCashPaid] = useState(2500);

  return (
    <InvoiceCalculations
      totalSales={2799.97}
      totalCost={2200}
      previousDue={450}
      cashPaid={cashPaid}
      onCashPaidChange={setCashPaid}
    />
  );
}
