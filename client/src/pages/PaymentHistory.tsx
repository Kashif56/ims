import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, TrendingUp, Calendar, X } from 'lucide-react';
import { getPaymentHistory } from '@/lib/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { PaymentHistory as PaymentHistoryType } from '@/lib/supabase';

export default function PaymentHistory() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'invoice_payment' | 'partial_payment' | 'due_payment'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.payment_type === filter);

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const invoicePayments = payments.filter(p => p.payment_type === 'invoice_payment');
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">
                  Rs. {totalAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredPayments.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Invoice Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">
                  {invoicePayments.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rs. {invoicePayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Partial Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {partialPayments.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rs. {partialPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Due Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {duePayments.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rs. {duePayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
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

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading payment history...
              </div>
            ) : filteredPayments.length === 0 ? (
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
