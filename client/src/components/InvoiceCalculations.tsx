import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvoiceCalculationsProps {
  totalSales: number;
  totalCost: number;
  previousDue: number;
  cashPaid: number;
  onCashPaidChange: (value: number) => void;
}

export default function InvoiceCalculations({ totalSales, totalCost, previousDue, cashPaid, onCashPaidChange }: InvoiceCalculationsProps) {
  const totalPayable = totalSales + previousDue;
  const remainingDue = totalPayable - cashPaid;
  const profit = totalSales - totalCost;

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal (Sales):</span>
          <span className="font-semibold" data-testid="text-total-sales">Rs. {totalSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Previous Due Balance:</span>
          <span className="font-semibold" data-testid="text-previous-due">Rs. {previousDue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg border-t pt-3">
          <span className="font-bold">Total Payable:</span>
          <span className="font-extrabold text-primary" data-testid="text-total-payable">Rs. {totalPayable.toFixed(2)}</span>
        </div>
        <div className="text-sm text-muted-foreground print:hidden">
          <span>Profit Margin: </span>
          <span className="font-semibold text-chart-2" data-testid="text-profit">Rs. {profit.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="print:hidden flex items-center justify-end gap-3">
          <Label htmlFor="cashPaid" className="font-bold">Cash Paid:</Label>
          <Input
            id="cashPaid"
            type="number"
            value={cashPaid}
            onChange={(e) => onCashPaidChange(parseFloat(e.target.value) || 0)}
            step="0.01"
            placeholder="0.00"
            className="text-lg font-semibold text-right w-40"
            data-testid="input-cash-paid"
          />
        </div>
        <div className="flex justify-between text-lg border-t pt-3">
          <span className="font-bold hidden print:inline">Cash Paid:</span>
          <span className="font-bold print:hidden">Remaining Due:</span>
          <span className="hidden print:inline font-extrabold">Rs. {cashPaid.toFixed(2)}</span>
          <span className={`font-extrabold print:hidden ${remainingDue > 0 ? 'text-destructive' : 'text-chart-2'}`} data-testid="text-remaining-due">
            Rs. {remainingDue.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-lg border-t pt-3 hidden print:flex">
          <span className="font-bold">Remaining Due:</span>
          <span className={`font-extrabold ${remainingDue > 0 ? 'text-destructive' : 'text-chart-2'}`}>
            Rs. {remainingDue.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
