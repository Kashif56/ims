import { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Calendar, Trash2, Phone } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { deleteInvoice } from '@/lib/supabaseService';
import Layout from '@/components/Layout';

export default function InvoicesPage() {
  const { savedInvoices, refreshData } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredInvoices = savedInvoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhone = !phoneFilter || (inv.customer_phone && inv.customer_phone.includes(phoneFilter));
    const matchesDate = !dateFilter || inv.date.includes(dateFilter);
    return matchesSearch && matchesPhone && matchesDate;
  });

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(id);
      await deleteInvoice(id);
      await refreshData();
      toast({
        title: "Invoice Deleted",
        description: `Invoice ${invoiceNumber} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete invoice.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Invoices</h1>
          <p className="text-muted-foreground">Manage and view all your invoices</p>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice # or customer..."
                className="pl-10"
                data-testid="input-invoice-search"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Filter by phone number..."
                className="pl-10"
                data-testid="input-phone-filter"
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
        </div>

        {/* Invoice Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.length === 0 ? (
            <div className="bg-card border rounded-lg shadow-sm p-12 text-center">
              <div className="text-muted-foreground text-lg">No invoices found matching your criteria</div>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                data-testid={`invoice-card-${invoice.id}`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-xl text-primary">{invoice.invoice_number}</span>
                        {invoice.remaining_due > 0 ? (
                          <Badge variant="destructive" className="text-xs" data-testid={`badge-due-${invoice.id}`}>
                            Due: Rs. {invoice.remaining_due.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge className="bg-chart-2 text-white text-xs">✓ Paid</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Customer</div>
                          <div className="font-semibold">{invoice.customer_name}</div>
                          {invoice.customer_phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {invoice.customer_phone}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Date</div>
                          <div className="font-semibold">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-3 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground">Total Amount</div>
                          <div className="font-bold text-lg">Rs. {invoice.total_amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Paid</div>
                          <div className="font-bold text-lg text-chart-2">Rs. {invoice.amount_paid.toFixed(2)}</div>
                        </div>
                        {invoice.remaining_due > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground">Remaining</div>
                            <div className="font-bold text-lg text-destructive">Rs. {invoice.remaining_due.toFixed(2)}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => setLocation(`/invoice/${invoice.id}`)}
                        data-testid={`button-view-${invoice.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
                        disabled={deleting === invoice.id}
                        data-testid={`button-delete-${invoice.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleting === invoice.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
