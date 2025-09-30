import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Calendar } from 'lucide-react';

interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  totalAmount: number;
  amountPaid: number;
  remainingDue: number;
}

interface InvoiceListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: SavedInvoice[];
  onViewInvoice: (invoice: SavedInvoice) => void;
}

export default function InvoiceListModal({ open, onOpenChange, invoices, onViewInvoice }: InvoiceListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || inv.date.includes(dateFilter);
    return matchesSearch && matchesDate;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Saved Invoices</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice # or customer name..."
              className="pl-10"
              data-testid="input-invoice-search"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10"
              data-testid="input-date-filter"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredInvoices.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No invoices found matching your criteria
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 border rounded-lg hover-elevate"
                data-testid={`invoice-card-${invoice.id}`}
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-primary">{invoice.invoiceNumber}</span>
                      {invoice.remainingDue > 0 && (
                        <Badge variant="destructive" data-testid={`badge-due-${invoice.id}`}>Due: ${invoice.remainingDue.toFixed(2)}</Badge>
                      )}
                      {invoice.remainingDue === 0 && (
                        <Badge className="bg-chart-2 text-white">Paid</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">Customer: {invoice.customerName}</div>
                    <div className="text-sm text-muted-foreground">Date: {invoice.date}</div>
                    <div className="flex gap-4 mt-2">
                      <span className="text-sm">Total: <span className="font-semibold">${invoice.totalAmount.toFixed(2)}</span></span>
                      <span className="text-sm">Paid: <span className="font-semibold">${invoice.amountPaid.toFixed(2)}</span></span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewInvoice(invoice)}
                    data-testid={`button-view-${invoice.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
