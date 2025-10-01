import { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Calendar } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/Layout';

export default function InvoicesPage() {
  const { savedInvoices } = useAppContext();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredInvoices = savedInvoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || inv.date.includes(dateFilter);
    return matchesSearch && matchesDate;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-card border rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
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

          <div className="space-y-3">
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
                        <span className="font-bold text-lg text-primary">{invoice.invoice_number}</span>
                        {invoice.remaining_due > 0 && (
                          <Badge variant="destructive" data-testid={`badge-due-${invoice.id}`}>Due: Rs. {invoice.remaining_due.toFixed(2)}</Badge>
                        )}
                        {invoice.remaining_due === 0 && (
                          <Badge className="bg-chart-2 text-white">Paid</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">Customer: {invoice.customer_name}</div>
                      <div className="text-sm text-muted-foreground">Date: {invoice.date}</div>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm">Total: <span className="font-semibold">Rs. {invoice.total_amount.toFixed(2)}</span></span>
                        <span className="text-sm">Paid: <span className="font-semibold">Rs. {invoice.amount_paid.toFixed(2)}</span></span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation(`/invoice/${invoice.id}`)}
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
        </div>
      </div>
    </Layout>
  );
}
