import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, CreditCard, DollarSign, Search, Calendar, X, Plus } from 'lucide-react';
import { getPaymentHistoryByCustomer, createPaymentHistory, updateCustomer } from '@/lib/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { PaymentHistory as PaymentHistoryType } from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CustomerPaymentHistory() {
  const { toast } = useToast();
  const { customers, setCustomers, refreshData } = useAppContext();
  const [location] = useLocation();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Check URL parameters for customer ID
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const customerId = params.get('customer');
    if (customerId && customers.find(c => c.id === customerId)) {
      setSelectedCustomerId(customerId);
    }
  }, [location, customers]);

  const fetchCustomerPayments = async (customerId: string, start?: string, end?: string) => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      const data = await getPaymentHistoryByCustomer(customerId, start, end);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching customer payment history:', error);
      toast({
        title: "Error",
        description: "Failed to load customer payment history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date.",
        variant: "destructive",
      });
      return;
    }
    if (selectedCustomerId) {
      fetchCustomerPayments(selectedCustomerId, startDate || undefined, endDate || undefined);
    }
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    if (selectedCustomerId) {
      fetchCustomerPayments(selectedCustomerId);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerPayments(selectedCustomerId, startDate || undefined, endDate || undefined);
    }
  }, [selectedCustomerId]);

  const handleAddPayment = async () => {
    if (!selectedCustomerId) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    if (!selectedCustomer) return;

    try {
      setSaving(true);
      
      // Record payment in history
      await createPaymentHistory({
        customer_id: selectedCustomerId,
        customer_name: selectedCustomer.name,
        amount: amount,
        payment_type: 'due_payment',
        notes: paymentNotes || `Manual payment recorded`,
      });

      // Update customer due balance
      const newDue = Math.max(0, selectedCustomer.current_due - amount);
      await updateCustomer(selectedCustomerId, { current_due: newDue });

      // Refresh data
      await refreshData();
      await fetchCustomerPayments(selectedCustomerId, startDate || undefined, endDate || undefined);

      toast({
        title: "Payment Recorded",
        description: `Payment of Rs. ${amount.toFixed(2)} has been recorded successfully.`,
      });

      // Reset form
      setPaymentAmount('');
      setPaymentNotes('');
      setAddPaymentOpen(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'invoice_payment':
        return 'Invoice Payment';
      case 'partial_payment':
        return 'Partial Payment';
      case 'due_payment':
        return 'Due Payment';
      default:
        return type;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'invoice_payment':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'partial_payment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'due_payment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="w-8 h-8 text-primary" />
            Customer Payment History
          </h1>
          <p className="text-muted-foreground mt-2">
            View payment history for individual customers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Select Customer</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No customers found
                  </p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedCustomerId === customer.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card hover:bg-muted border-border'
                      }`}
                    >
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm opacity-80">{customer.phone}</div>
                      {customer.current_due > 0 && (
                        <div className="text-xs mt-1 font-medium">
                          Due: Rs. {customer.current_due.toFixed(2)}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedCustomerId ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a customer to view their payment history</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Customer Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {selectedCustomer?.name}
                      </span>
                      <Button
                        onClick={() => setAddPaymentOpen(true)}
                        size="sm"
                        disabled={loading}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-semibold">{selectedCustomer?.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Due</p>
                        <p className="font-semibold text-red-600">
                          Rs. {selectedCustomer?.current_due.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="font-semibold text-green-600">
                          Rs. {totalPaid.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Date Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Date Filter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="flex-1 min-w-[180px]">
                        <label className="text-sm font-medium mb-2 block">Start Date</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <label className="text-sm font-medium mb-2 block">End Date</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleApplyFilter} disabled={loading} size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Apply
                        </Button>
                        <Button 
                          onClick={handleClearFilter} 
                          variant="outline" 
                          size="sm"
                          disabled={loading || (!startDate && !endDate)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    </div>
                    {(startDate || endDate) && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        Showing payments {startDate ? `from ${new Date(startDate).toLocaleDateString()}` : ''}
                        {startDate && endDate ? ' ' : ''}
                        {endDate ? `to ${new Date(endDate).toLocaleDateString()}` : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment History Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Transactions ({payments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading payment history...
                      </div>
                    ) : payments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No payment records found for this customer.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-semibold">Date</th>
                              <th className="text-left py-3 px-4 font-semibold">Type</th>
                              <th className="text-right py-3 px-4 font-semibold">Amount</th>
                              <th className="text-left py-3 px-4 font-semibold">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((payment) => (
                              <tr 
                                key={payment.id} 
                                className="border-b hover:bg-muted/50 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  {new Date(payment.created_at || '').toLocaleDateString()}
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(payment.created_at || '').toLocaleTimeString()}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeBadge(payment.payment_type)}`}>
                                    {getPaymentTypeLabel(payment.payment_type)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-green-600">
                                  Rs. {payment.amount.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {payment.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 font-bold bg-muted/30">
                              <td colSpan={2} className="py-3 px-4">TOTAL PAID</td>
                              <td className="py-3 px-4 text-right text-green-600">
                                Rs. {totalPaid.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedCustomer?.name}. Current due: Rs. {selectedCustomer?.current_due.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount (Rs.)</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                disabled={saving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (Optional)</Label>
              <Textarea
                id="payment-notes"
                placeholder="Add any notes about this payment..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                disabled={saving}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddPaymentOpen(false);
                setPaymentAmount('');
                setPaymentNotes('');
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPayment} disabled={saving}>
              {saving ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
