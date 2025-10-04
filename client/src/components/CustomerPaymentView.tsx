import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, Plus, X, Calendar, Receipt } from 'lucide-react';
import { getPaymentHistoryByCustomer, getInvoicesByCustomer, createPaymentHistory, updateCustomer, updateInvoice } from '@/lib/supabaseService';
import { PaymentHistory as PaymentHistoryType, Invoice } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  current_due: number;
}

interface CustomerPaymentViewProps {
  customer: Customer;
  onClose: () => void;
  onPaymentRecorded: () => void;
}

export default function CustomerPaymentView({ customer, onClose, onPaymentRecorded }: CustomerPaymentViewProps) {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'general' | 'invoice'>('general');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [customer.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsData, invoicesData] = await Promise.all([
        getPaymentHistoryByCustomer(customer.id),
        getInvoicesByCustomer(customer.id)
      ]);
      setPayments(paymentsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    if (paymentType === 'invoice' && !selectedInvoiceId) {
      toast({
        title: "Invoice Required",
        description: "Please select an invoice for this payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      let invoiceNumber = undefined;
      
      // If payment is for an invoice, update the invoice
      if (paymentType === 'invoice' && selectedInvoiceId) {
        const invoice = invoices.find(inv => inv.id === selectedInvoiceId);
        if (invoice) {
          invoiceNumber = invoice.invoice_number;
          const newAmountPaid = invoice.amount_paid + amount;
          const newRemainingDue = invoice.total_amount - newAmountPaid;
          
          await updateInvoice(selectedInvoiceId, {
            amount_paid: newAmountPaid,
            remaining_due: Math.max(0, newRemainingDue)
          });
        }
      }

      // Record payment in history
      await createPaymentHistory({
        invoice_id: paymentType === 'invoice' ? selectedInvoiceId : undefined,
        customer_id: customer.id,
        customer_name: customer.name,
        amount: amount,
        payment_type: paymentType === 'invoice' ? 'invoice_payment' : 'due_payment',
        notes: paymentNotes || (paymentType === 'invoice' ? `Payment for invoice ${invoiceNumber}` : 'General payment'),
      });

      // Update customer due balance
      const newDue = Math.max(0, customer.current_due - amount);
      await updateCustomer(customer.id, { current_due: newDue });

      toast({
        title: "Payment Recorded",
        description: `Payment of Rs. ${amount.toFixed(2)} has been recorded successfully.`,
      });

      // Reset form and refresh data
      setPaymentAmount('');
      setPaymentNotes('');
      setPaymentType('general');
      setSelectedInvoiceId('');
      setAddPaymentOpen(false);
      
      await fetchData();
      onPaymentRecorded();
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

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const unpaidInvoices = invoices.filter(inv => inv.remaining_due > 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Current Due</p>
                <p className="text-2xl font-bold text-red-600">
                  Rs. {customer.current_due.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  Rs. {totalPaid.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
                <p className="text-2xl font-bold text-amber-600">
                  {unpaidInvoices.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Add Payment Button */}
          <Button onClick={() => setAddPaymentOpen(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment History ({payments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading payment history...
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payment records found.
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Rs. {payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at || '').toLocaleDateString()} at{' '}
                            {new Date(payment.created_at || '').toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeBadge(payment.payment_type)}`}>
                          {getPaymentTypeLabel(payment.payment_type)}
                        </span>
                      </div>
                      {payment.notes && (
                        <p className="text-sm text-muted-foreground">{payment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {customer.name}. Current due: Rs. {customer.current_due.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select value={paymentType} onValueChange={(value: 'general' | 'invoice') => {
                setPaymentType(value);
                setSelectedInvoiceId('');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Payment</SelectItem>
                  <SelectItem value="invoice">Payment for Invoice/Bill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentType === 'invoice' && (
              <div className="space-y-2">
                <Label>Select Invoice</Label>
                <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an invoice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unpaidInvoices.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No unpaid invoices</div>
                    ) : (
                      unpaidInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            <span>{invoice.invoice_number}</span>
                            <span className="text-muted-foreground">
                              - Due: Rs. {invoice.remaining_due.toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedInvoiceId && (
                  <p className="text-sm text-muted-foreground">
                    Invoice due: Rs. {invoices.find(inv => inv.id === selectedInvoiceId)?.remaining_due.toFixed(2)}
                  </p>
                )}
              </div>
            )}

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
                setPaymentType('general');
                setSelectedInvoiceId('');
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
    </div>
  );
}
