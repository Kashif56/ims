import { Link, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/Layout';
import ReturnReceiptPrint from '@/components/ReturnReceiptPrint';
import { useState, useEffect } from 'react';
import { getProductReturnById } from '@/lib/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function ViewReturnPage() {
  const [, params] = useRoute('/return/:id');
  const { companyInfo } = useAppContext();
  const { toast } = useToast();
  const [printFormat, setPrintFormat] = useState('thermal');
  const [returnData, setReturnData] = useState<any>(null);
  const [customerBalance, setCustomerBalance] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReturn = async () => {
      if (!params?.id) return;
      
      try {
        setLoading(true);
        const data = await getProductReturnById(params.id);
        setReturnData(data);
        
        // Fetch customer current balance if customer_id exists
        if (data.customer_id) {
          const { data: customer, error } = await supabase
            .from('customers')
            .select('current_due')
            .eq('id', data.customer_id)
            .single();
          
          if (!error && customer) {
            setCustomerBalance(customer.current_due);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load return details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReturn();
  }, [params?.id]);

  const handlePrint = () => {
    setPrintFormat('thermal');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading return details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!returnData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Return Not Found</h2>
            <Link href="/returns">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Returns
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-4 print:hidden flex gap-2">
          <Button onClick={handlePrint} variant="default" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
          <Link href="/returns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Returns
            </Button>
          </Link>
        </div>

        {/* Display Receipt on Screen - Non-printable version */}
        <div className="print:hidden">
          <ReturnReceiptPrint
            returnNumber={returnData.return_number}
            returnDate={returnData.return_date}
            invoiceNumber={returnData.invoice_number}
            invoiceDate={returnData.invoice_date}
            customerName={returnData.customer_name}
            customerPhone={returnData.customer_phone}
            lineItems={returnData.lineItems || []}
            refundAmount={returnData.refund_amount}
            notes={returnData.notes}
            customerCurrentBalance={customerBalance}
            companyInfo={companyInfo}

          />
        </div>

        {/* Hidden Receipt for Printing */}
        <div className="hidden print:block">
          <ReturnReceiptPrint
            returnNumber={returnData.return_number}
            returnDate={returnData.return_date}
            invoiceNumber={returnData.invoice_number}
            invoiceDate={returnData.invoice_date}
            customerName={returnData.customer_name}
            customerPhone={returnData.customer_phone}
            lineItems={returnData.lineItems || []}
            refundAmount={returnData.refund_amount}
            notes={returnData.notes}
            customerCurrentBalance={customerBalance}
            companyInfo={companyInfo}
    
          />
        </div>
      </div>
    </Layout>
  );
}
