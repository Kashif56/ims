import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, TrendingUp, Calendar, X, Trash2, RotateCcw, CheckCircle } from 'lucide-react';
import { getPaymentHistory, deletePaymentHistory, clearRefundPayment } from '@/lib/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { PaymentHistory as PaymentHistoryType } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PaymentHistory() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'invoice_payment' | 'partial_payment' | 'due_payment'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clearingPaymentId, setClearingPaymentId] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      const data = await getPaymentHistory(start, end);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history.",
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
    fetchPayments(startDate || undefined, endDate || undefined);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchPayments();
  };

  // Separate payments into invoice payments and refunds
  const invoicePayments = payments.filter(p => p.amount >= 0); // Positive amounts are payments
  const refundPayments = payments.filter(p => p.amount < 0); // Negative amounts are refunds
  
  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.payment_type === filter);

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const invoicePaymentsByType = payments.filter(p => p.payment_type === 'invoice_payment');
  const partialPayments = payments.filter(p => p.payment_type === 'partial_payment');
  const duePayments = payments.filter(p => p.payment_type === 'due_payment');

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

  const handleDeletePayment = async (payment: PaymentHistoryType) => {
    setDeletingPaymentId(payment.id);
    setShowDeleteDialog(true);
  };

  const handleClearRefund = async (payment: PaymentHistoryType) => {
    setClearingPaymentId(payment.id);
    setShowClearDialog(true);
  };

  const confirmClearRefund = async () => {
    if (!clearingPaymentId) return;

    const payment = payments.find(p => p.id === clearingPaymentId);
    if (!payment) return;

    try {
      await clearRefundPayment(clearingPaymentId);
      
      // Update local state to mark as cleared
      setPayments(payments.map(p => 
        p.id === clearingPaymentId 
          ? { ...p, cleared: true, cleared_at: new Date().toISOString() }
          : p
      ));
      
      toast({
        title: "Refund Cleared",
        description: `Refund of Rs. ${Math.abs(payment.amount).toFixed(2)} has been cleared. Customer balance updated.`,
      });
    } catch (error) {
      console.error('Error clearing refund:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear refund.",
        variant: "destructive",
      });
    } finally {
      setShowClearDialog(false);
      setClearingPaymentId(null);
    }
  };

  const confirmDeletePayment = async () => {
    if (!deletingPaymentId) return;

    const payment = payments.find(p => p.id === deletingPaymentId);
    if (!payment) return;

    try {
      // Update customer balance - reverse the payment
      if (payment.customer_id) {
        const { data: customer, error: fetchError } = await supabase
          .from('customers')
          .select('current_due')
          .eq('id', payment.customer_id)
          .single();
        
        if (fetchError) throw fetchError;
        
        // Reverse the payment: 
        // - For positive amounts (payments): add back to customer's due
        // - For negative amounts (refunds): subtract from customer's due (they owe more)
        const newDue = customer.current_due + payment.amount;
        
        const { error: updateError } = await supabase
          .from('customers')
          .update({ current_due: newDue })
          .eq('id', payment.customer_id);
        
        if (updateError) throw updateError;
      }

      // Delete the payment record
      await deletePaymentHistory(deletingPaymentId);
      
      // Update local state
      setPayments(payments.filter(p => p.id !== deletingPaymentId));
      
      toast({
        title: "Payment Deleted",
        description: "Payment record has been removed and customer balance updated.",
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete payment.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletingPaymentId(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-primary" />
            Payment History
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete payment transaction history
          </p>
        </div>

        {/* Date Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyFilter} disabled={loading}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Apply Filter
                </Button>
                <Button 
                  onClick={handleClearFilter} 
                  variant="outline" 
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invoice Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">
                  Rs. {invoicePayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {invoicePayments.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600">
                  Rs. {Math.abs(refundPayments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {refundPayments.length} refunds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Invoice Payments and Refunds */}
        <Tabs defaultValue="invoice-payments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="invoice-payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Invoice Payments ({invoicePayments.length})
            </TabsTrigger>
            <TabsTrigger value="refunds" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Returns & Refunds ({refundPayments.length})
            </TabsTrigger>
          </TabsList>

          {/* Invoice Payments Tab */}
          <TabsContent value="invoice-payments">
            {/* Filter Buttons for Invoice Payments */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                All Payments
              </button>
              <button
                onClick={() => setFilter('invoice_payment')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'invoice_payment'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Invoice Payments
              </button>
              <button
                onClick={() => setFilter('partial_payment')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'partial_payment'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Partial Payments
              </button>
              <button
                onClick={() => setFilter('due_payment')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'due_payment'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Due Payments
              </button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Payment Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading payment history...
                  </div>
                ) : invoicePayments.filter(p => filter === 'all' || p.payment_type === filter).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No payment records found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Date</th>
                          <th className="text-left py-3 px-4 font-semibold">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold">Type</th>
                          <th className="text-right py-3 px-4 font-semibold">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold">Notes</th>
                          <th className="text-center py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoicePayments.filter(p => filter === 'all' || p.payment_type === filter).map((payment) => (
                          <tr 
                            key={payment.id} 
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              {new Date(payment.created_at || '').toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-medium">{payment.customer_name}</td>
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
                            <td className="py-3 px-4 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePayment(payment)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds">
            <Card>
              <CardHeader>
                <CardTitle>Returns & Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading refund history...
                  </div>
                ) : refundPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No refund records found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Date</th>
                          <th className="text-left py-3 px-4 font-semibold">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold">Type</th>
                          <th className="text-right py-3 px-4 font-semibold">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold">Notes</th>
                          <th className="text-center py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {refundPayments.map((payment) => (
                          <tr 
                            key={payment.id} 
                            className={`border-b hover:bg-muted/50 transition-colors ${payment.cleared ? 'opacity-60 bg-muted/30' : ''}`}
                          >
                            <td className="py-3 px-4">
                              {new Date(payment.created_at || '').toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-medium">{payment.customer_name}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2 items-center">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Refund
                                </span>
                                {payment.cleared && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Cleared
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-bold ${payment.cleared ? 'line-through text-muted-foreground' : 'text-red-600'}`}>
                                Rs. {Math.abs(payment.amount).toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {payment.notes || '-'}
                              {payment.cleared && payment.cleared_at && (
                                <div className="text-xs text-green-600 mt-1">
                                  Cleared on {new Date(payment.cleared_at).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-1 justify-center">
                                {!payment.cleared && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleClearRefund(payment)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Clear refund (forgive amount)"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeletePayment(payment)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  title="Delete refund record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Clear Refund Confirmation Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Refund Amount?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-3">
                  <p>This will mark the refund as "cleared" (forgiven) and adjust the customer's balance.</p>
                  {clearingPaymentId && payments.find(p => p.id === clearingPaymentId) && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg space-y-2">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">What will happen:</p>
                      <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                        <li>✓ Refund amount of Rs. {Math.abs(payments.find(p => p.id === clearingPaymentId)!.amount).toFixed(2)} will be added to customer's due</li>
                        <li>✓ Return record stays in history with "Cleared" badge</li>
                        <li>✓ Customer will owe more (refund is forgiven)</li>
                        <li>✓ Inventory remains unchanged</li>
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Note: This action can be reversed by deleting the payment record if needed.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmClearRefund}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Clear Refund
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Payment Record?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the payment record and automatically adjust the customer's balance.
                {deletingPaymentId && payments.find(p => p.id === deletingPaymentId)?.amount && payments.find(p => p.id === deletingPaymentId)!.amount > 0 ? (
                  <span className="block mt-2 font-semibold">
                    • The customer's due amount will be increased by Rs. {payments.find(p => p.id === deletingPaymentId)?.amount.toFixed(2)}
                  </span>
                ) : (
                  <span className="block mt-2 font-semibold">
                    • The refund will be reversed and customer's due will be adjusted
                  </span>
                )}
                <span className="block mt-2 text-red-600">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeletePayment}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Payment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
