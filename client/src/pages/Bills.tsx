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

export default function BillsPage() {
  const { savedInvoices, refreshData } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredBills = savedInvoices.filter(bill => {
    const matchesSearch = bill.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bill.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhone = !phoneFilter || (bill.customer_phone && bill.customer_phone.includes(phoneFilter));
    const matchesDate = !dateFilter || bill.date.includes(dateFilter);
    return matchesSearch && matchesPhone && matchesDate;
  });

  const handleDelete = async (id: string, billNumber: string) => {
    if (!confirm(`Are you sure you want to delete bill ${billNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(id);
      await deleteInvoice(id);
      await refreshData();
      toast({
        title: "Bill Deleted",
        description: `Bill ${billNumber} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete bill.",
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
          <h1 className="text-3xl font-bold mb-2">Bills</h1>
          <p className="text-muted-foreground">Manage and view all your bills</p>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bill # or customer..."
                className="pl-10"
                data-testid="input-bill-search"
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

        {/* Bill Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredBills.length === 0 ? (
            <div className="bg-card border rounded-lg shadow-sm p-12 text-center">
              <div className="text-muted-foreground text-lg">No bills found matching your criteria</div>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                data-testid={`bill-card-${bill.id}`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-xl text-primary">{bill.invoice_number}</span>
                        {bill.remaining_due > 0 ? (
                          <Badge variant="destructive" className="text-xs" data-testid={`badge-due-${bill.id}`}>
                            Due: Rs. {bill.remaining_due.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge className="bg-chart-2 text-white text-xs">✓ Paid</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Customer</div>
                          <div className="font-semibold">{bill.customer_name}</div>
                          {bill.customer_phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {bill.customer_phone}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Date</div>
                          <div className="font-semibold">{new Date(bill.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-3 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground">Total Amount</div>
                          <div className="font-bold text-lg">Rs. {bill.total_amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Paid</div>
                          <div className="font-bold text-lg text-chart-2">Rs. {bill.amount_paid.toFixed(2)}</div>
                        </div>
                        {bill.remaining_due > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground">Remaining</div>
                            <div className="font-bold text-lg text-destructive">Rs. {bill.remaining_due.toFixed(2)}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => setLocation(`/bill/${bill.id}`)}
                        data-testid={`button-view-${bill.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(bill.id, bill.invoice_number)}
                        disabled={deleting === bill.id}
                        data-testid={`button-delete-${bill.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleting === bill.id ? 'Deleting...' : 'Delete'}
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
