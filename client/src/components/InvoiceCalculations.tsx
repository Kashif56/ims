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
    <div className="mt-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Left Column - Sales Summary */}
        <div className="bg-muted/50 rounded-lg p-5 space-y-3 border">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Subtotal (Sales):</span>
            <span className="font-semibold text-base" data-testid="text-total-sales">Rs. {totalSales.toFixed(2)}</span>
          </div>
          {previousDue > 0 && (
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm text-muted-foreground">Previous Due Balance:</span>
              <span className="font-semibold text-base text-amber-600" data-testid="text-previous-due">Rs. {previousDue.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20">
            <span className="font-bold text-lg">Total Payable:</span>
            <span className="font-extrabold text-xl text-primary" data-testid="text-total-payable">Rs. {totalPayable.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 print:hidden">
            <span className="text-xs text-muted-foreground">Profit Margin:</span>
            <span className="font-semibold text-sm text-chart-2" data-testid="text-profit">Rs. {profit.toFixed(2)}</span>
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="bg-muted/50 rounded-lg p-5 space-y-3 border">
          <div className="print:hidden">
            <Label htmlFor="cashPaid" className="text-sm font-semibold mb-2 block">Cash Paid:</Label>
            <Input
              id="cashPaid"
              type="number"
              value={cashPaid}
              onChange={(e) => onCashPaidChange(parseFloat(e.target.value) || 0)}
              step="0.01"
              placeholder="0.00"
              className="text-lg font-semibold text-right h-12 bg-background"
              data-testid="input-cash-paid"
            />
          </div>
          <div className="hidden print:flex justify-between items-center py-2">
            <span className="font-bold text-base">Cash Paid:</span>
            <span className="font-extrabold text-base">Rs. {cashPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 print:border-t">
            <span className="font-bold text-lg">Remaining Due:</span>
            <span className={`font-extrabold text-xl ${remainingDue > 0 ? 'text-destructive' : 'text-chart-2'}`} data-testid="text-remaining-due">
              Rs. {remainingDue.toFixed(2)}
            </span>
          </div>
          {remainingDue > 0 && (
            <div className="text-xs text-center text-muted-foreground pt-2 print:hidden">
              Outstanding balance to be paid
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
