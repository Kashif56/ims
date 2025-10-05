import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, RotateCcw, Package, User, Phone, FileText, Printer, Check, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductReturns, createProductReturn, getNextReturnNumber, getInvoiceByNumber } from '@/lib/supabaseService';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'wouter';

interface InvoiceLineItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  sale_price: number;
  cost_price: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  date: string;
  total_amount: number;
  amount_paid: number;
  remaining_due: number;
  lineItems: InvoiceLineItem[];
}

interface ReturnItem {
  item_id: string;
  item_name: string;
  original_quantity: number;
  return_quantity: number;
  sale_price: number;
  cost_price: number;
  selected: boolean;
}

interface ProductReturnWithItems {
  id: string;
  return_number: string;
  invoice_id?: string | null;
  invoice_number?: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone?: string;
  return_date: string;
  total_items: number;
  refund_amount: number;
  notes?: string;
  created_at?: string;
  lineItems?: any[];
}

export default function ReturnsPage() {
  const { toast } = useToast();
  const { refreshData } = useAppContext();
  const printRef = useRef<HTMLDivElement>(null);

  // History view state
  const [returns, setReturns] = useState<ProductReturnWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Return creation state
  const [step, setStep] = useState<'search' | 'select' | 'confirm'>('search');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [searchingInvoice, setSearchingInvoice] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [notes, setNotes] = useState('');
  const [returnNumber, setReturnNumber] = useState('RET-00001');
  const [processing, setProcessing] = useState(false);
  const [lastCreatedReturn, setLastCreatedReturn] = useState<ProductReturnWithItems | null>(null);

  useEffect(() => {
    fetchReturns();
    fetchReturnNumber();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await getProductReturns();
      setReturns(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch returns.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnNumber = async () => {
    try {
      const nextNumber = await getNextReturnNumber();
      setReturnNumber(nextNumber);
    } catch (error) {
      console.error('Error fetching return number:', error);
    }
  };

  const handleSearchInvoice = async () => {
    if (!invoiceNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invoice number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSearchingInvoice(true);
      const invoices = await getInvoiceByNumber(invoiceNumber);
      
      if (!invoices) {
        toast({
          title: "Not Found",
          description: `Invoice ${invoiceNumber} not found.`,
          variant: "destructive",
        });
        return;
      }

      setInvoice(invoices as Invoice);
      
      // Initialize return items from invoice line items
      const items: ReturnItem[] = (invoices.lineItems || []).map((item: InvoiceLineItem) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        original_quantity: item.quantity,
        return_quantity: item.quantity, // Default to full quantity
        sale_price: item.sale_price,
        cost_price: item.cost_price,
        selected: false, // Not selected by default
      }));
      
      setReturnItems(items);
      setStep('select');
      
      toast({
        title: "Invoice Found",
        description: `Loaded invoice ${invoiceNumber} with ${items.length} items.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch invoice.",
        variant: "destructive",
      });
    } finally {
      setSearchingInvoice(false);
    }
  };

  const handleToggleItem = (index: number) => {
    const newItems = [...returnItems];
    newItems[index].selected = !newItems[index].selected;
    setReturnItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...returnItems];
    const maxQty = newItems[index].original_quantity;
    newItems[index].return_quantity = Math.min(Math.max(1, quantity), maxQty);
    setReturnItems(newItems);
  };

  const calculateRefund = () => {
    return returnItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.return_quantity * item.sale_price), 0);
  };

  const getTotalReturnItems = () => {
    return returnItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.return_quantity, 0);
  };

  const handleProcessReturn = async () => {
    const selectedItems = returnItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item to return.",
        variant: "destructive",
      });
      return;
    }

    if (!invoice) return;

    try {
      setProcessing(true);
      
      const refundAmount = calculateRefund();
      const totalItems = getTotalReturnItems();

      const returnData = await createProductReturn(
        {
          return_number: returnNumber,
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          customer_id: invoice.customer_id,
          customer_name: invoice.customer_name,
          customer_phone: invoice.customer_phone,
          return_date: new Date().toISOString().split('T')[0],
          total_items: totalItems,
          refund_amount: refundAmount,
          notes: notes,
        },
        selectedItems.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          quantity: item.return_quantity,
          sale_price: item.sale_price,
          cost_price: item.cost_price,
        }))
      );

      setLastCreatedReturn({
        ...returnData,
        lineItems: selectedItems.map(item => ({
          item_name: item.item_name,
          quantity: item.return_quantity,
          sale_price: item.sale_price,
        })),
      });

      toast({
        title: "Return Processed",
        description: `Return ${returnNumber} has been processed successfully. Refund: Rs. ${refundAmount.toFixed(2)}`,
      });

      // Refresh data
      await fetchReturns();
      await fetchReturnNumber();
      await refreshData();

      // Move to confirm step
      setStep('confirm');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process return.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (printRef.current) {
      window.print();
    }
  };

  const handleNewReturn = () => {
    setStep('search');
    setInvoiceNumber('');
    setInvoice(null);
    setReturnItems([]);
    setNotes('');
    setLastCreatedReturn(null);
  };

  const filteredReturns = returns.filter(returnRecord => {
    const matchesSearch = returnRecord.return_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          returnRecord.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (returnRecord.invoice_number && returnRecord.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = !dateFilter || returnRecord.return_date.includes(dateFilter);
    return matchesSearch && matchesDate;
  });

  const selectedItems = returnItems.filter(item => item.selected);
  const refundAmount = calculateRefund();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl print:hidden">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Product Returns & Refunds</h1>
          <p className="text-muted-foreground">Process returns by entering invoice number</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE - Return Processing */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Step 1: Search Invoice */}
            {step === 'search' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Enter Invoice/Receipt Number
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Invoice Number</Label>
                    <div className="flex gap-2">
                      <Input
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="Enter invoice number (e.g., INV-00001)"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchInvoice()}
                        className="text-lg"
                      />
                      <Button 
                        onClick={handleSearchInvoice}
                        disabled={searchingInvoice}
                        size="lg"
                      >
                        {searchingInvoice ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Select Items to Return */}
            {step === 'select' && invoice && (
              <>
                {/* Invoice Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Invoice Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Invoice #:</span>
                        <span className="ml-2 font-semibold">{invoice.invoice_number}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="ml-2 font-semibold">{new Date(invoice.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="ml-2 font-semibold">{invoice.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="ml-2 font-semibold">{invoice.customer_phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="ml-2 font-semibold">Rs. {invoice.total_amount.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount Paid:</span>
                        <span className="ml-2 font-semibold">Rs. {invoice.amount_paid.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Select Items */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Select Items to Return
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {returnItems.map((item, index) => (
                      <Card key={index} className={item.selected ? 'border-primary border-2' : ''}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={() => handleToggleItem(index)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold">{item.item_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Price: Rs. {item.sale_price.toFixed(2)} | Original Qty: {item.original_quantity}
                                  </p>
                                </div>
                                {item.selected && (
                                  <Badge variant="default">Selected</Badge>
                                )}
                              </div>
                              
                              {item.selected && (
                                <div className="flex items-center gap-3 mt-2">
                                  <Label className="text-sm">Return Quantity:</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={item.original_quantity}
                                    value={item.return_quantity}
                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                    className="w-24"
                                  />
                                  <span className="text-sm font-semibold">
                                    Refund: Rs. {(item.return_quantity * item.sale_price).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add reason for return or any additional notes..."
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleNewReturn}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProcessReturn}
                    disabled={processing || selectedItems.length === 0}
                    className="flex-1"
                    size="lg"
                  >
                    {processing ? 'Processing...' : `Process Return (Rs. ${refundAmount.toFixed(2)})`}
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirm' && lastCreatedReturn && (
              <Card className="border-green-500 border-2">
                <CardHeader className="bg-green-50 dark:bg-green-950">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Check className="w-6 h-6" />
                    Return Processed Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center py-6">
                    <p className="text-2xl font-bold mb-2">{lastCreatedReturn.return_number}</p>
                    <p className="text-muted-foreground mb-4">Return has been processed</p>
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 inline-block">
                      <p className="text-sm text-muted-foreground">Refund Amount</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                        Rs. {lastCreatedReturn.refund_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handlePrintReceipt} variant="outline" className="flex-1">
                      <Printer className="w-4 h-4 mr-2" />
                      Print Receipt
                    </Button>
                    <Button onClick={handleNewReturn} className="flex-1">
                      Process Another Return
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT SIDE - Summary & History */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Return Summary */}
            {step === 'select' && (
              <Card className="sticky top-20">
                <CardHeader className="pb-3 bg-primary/5">
                  <CardTitle>Return Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return #:</span>
                    <span className="font-semibold">{returnNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items Selected:</span>
                    <span className="font-semibold">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Quantity:</span>
                    <span className="font-semibold">{getTotalReturnItems()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Refund Amount:</span>
                      <span className="font-bold text-2xl text-primary">
                        Rs. {refundAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Returns */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {returns.slice(0, 5).map((ret) => (
                    <Link key={ret.id} href={`/return/${ret.id}`}>
                      <div className="text-sm border-b pb-2 last:border-0 hover:bg-accent/50 p-2 -m-2 rounded cursor-pointer transition-colors">
                        <div className="flex justify-between">
                          <span className="font-semibold">{ret.return_number}</span>
                          <span className="text-green-600 font-semibold">
                            Rs. {ret.refund_amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {ret.customer_name} • {new Date(ret.return_date).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {returns.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No returns yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Returns History Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Returns History</h2>
          
          {/* Filters */}
          <div className="bg-card border rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search return #, invoice #, or customer..."
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Returns List */}
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="bg-card border rounded-lg shadow-sm p-12 text-center">
                <p className="text-muted-foreground">Loading returns...</p>
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="bg-card border rounded-lg shadow-sm p-12 text-center">
                <RotateCcw className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No returns found</p>
              </div>
            ) : (
              filteredReturns.map((returnRecord) => (
                <Card key={returnRecord.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <RotateCcw className="w-5 h-5 text-primary" />
                          {returnRecord.return_number}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(returnRecord.return_date).toLocaleDateString()}
                          </div>
                          {returnRecord.invoice_number && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              Invoice: {returnRecord.invoice_number}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {returnRecord.total_items} {returnRecord.total_items === 1 ? 'item' : 'items'}
                        </Badge>
                        <p className="text-lg font-bold text-green-600">
                          Rs. {returnRecord.refund_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{returnRecord.customer_name}</span>
                        {returnRecord.customer_phone && (
                          <>
                            <Phone className="w-4 h-4 text-muted-foreground ml-2" />
                            <span className="text-muted-foreground">{returnRecord.customer_phone}</span>
                          </>
                        )}
                      </div>

                      {returnRecord.lineItems && returnRecord.lineItems.length > 0 && (
                        <div className="border-t pt-3">
                          <div className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Returned Items:
                          </div>
                          <div className="space-y-1">
                            {returnRecord.lineItems.map((item: any, idx: number) => (
                              <div key={idx} className="text-sm text-muted-foreground pl-6">
                                • {item.item_name} - Qty: {item.quantity} @ Rs. {item.sale_price.toFixed(2)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {returnRecord.notes && (
                        <div className="border-t pt-3">
                          <div className="text-sm">
                            <span className="font-medium">Notes: </span>
                            <span className="text-muted-foreground">{returnRecord.notes}</span>
                          </div>
                        </div>
                      )}

                      {/* View Receipt Button */}
                      <div className="border-t pt-3 mt-3">
                        <Link href={`/return/${returnRecord.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Receipt
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Print Receipt */}
      {lastCreatedReturn && invoice && (
        <div className="hidden print:block">
          <div ref={printRef} className="max-w-2xl mx-auto p-8" style={{ background: 'white', color: 'black' }}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              {/* Header */}
              <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                <h1 className="text-3xl font-black text-gray-900 mb-1">REFUND RECEIPT</h1>
                <p className="text-sm text-gray-600 font-medium">{invoice.customer_name}</p>
                <p className="text-sm text-gray-600 font-medium">{invoice.customer_phone}</p>
              </div>

              {/* Return Details */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Return #:</span>
                    <span className="ml-2 font-semibold">{lastCreatedReturn.return_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-semibold">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Original Invoice:</span>
                    <span className="ml-2 font-semibold">{invoice.invoice_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="ml-2 font-semibold">{new Date(invoice.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Returned Items */}
              <div className="mb-6">
                <div className="border-b-2 border-gray-900 pb-2 mb-3">
                  <p className="text-xs font-bold text-gray-700 uppercase">Returned Items</p>
                </div>
                <div className="space-y-3">
                  {lastCreatedReturn.lineItems?.map((item: any, index: number) => (
                    <div key={index} className="border-b border-gray-300 pb-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-gray-900 flex-1 text-sm">
                          <span className="text-gray-500 mr-2">{index + 1}.</span>
                          {item.item_name}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm ml-5">
                        <p className="text-gray-600 text-sm">
                          {item.quantity} × Rs. {item.sale_price.toFixed(2)}
                        </p>
                        <p className="font-bold text-gray-900 text-sm">
                          Rs. {(item.quantity * item.sale_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund Total */}
              <div className="border-t-2 border-gray-900 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">REFUND AMOUNT:</span>
                  <span className="text-2xl font-black text-green-600">
                    Rs. {lastCreatedReturn.refund_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {lastCreatedReturn.notes && (
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600">{lastCreatedReturn.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-600">Thank you for your business</p>
                <p className="text-xs text-gray-500 mt-1">
                  This is a computer-generated refund receipt
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
