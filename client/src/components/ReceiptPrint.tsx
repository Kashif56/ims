import { forwardRef } from 'react';
import { Receipt, Phone, MapPin, Calendar } from 'lucide-react';

interface LineItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  sale_price: number;
  cost_price: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  current_due: number;
}

interface ReceiptPrintProps {
  billNumber: string;
  date: string;
  customer: Customer | null;
  lineItems: LineItem[];
  totalSales: number;
  previousDue: number;
  cashPaid: number;
  balanceDue: number;
  companyInfo: {
    name: string;
    address: string;
    contact: string;
  };
  printFormat?: 'a4' | 'thermal';
}

const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(
  ({ billNumber, date, customer, lineItems, totalSales, previousDue, cashPaid, balanceDue, companyInfo, printFormat = 'a4' }, ref) => {
    const totalPayable = totalSales + previousDue;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const formattedTime = currentDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <div 
        ref={ref} 
        className="block" 
        style={{ background: 'white', color: 'black' }}
        data-print-format={printFormat}
      >
        <div className="max-w-2xl mx-auto" style={{ background: 'white' }}>
          {/* POS Receipt Style */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-2xl p-8 print:border-solid print:shadow-none" style={{ background: 'white', color: 'black' }}>
            {/* Header with Receipt Icon */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">

              <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
                {companyInfo.name || 'POS SYSTEM'}
              </h1>
              <p className="text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
                {companyInfo.address || '123 Commerce Street'}
              </p>
              <p className="text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
                {companyInfo.contact || 'Ph: (555) 123-4567'}
              </p>
            </div>

            {/* Bill Number & Date */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200 border-dashed">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-dark uppercase tracking-wide mb-1">
                    <span className="text-gray-600 mr-2">Receipt#:</span>
                    {billNumber}</p>
          
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-600 mr-2">Date:</span>
                    {formattedDate} {formattedTime}</p>
                  {customer && (
                    <p className="text-sm text-gray-900">
                      <span className="text-gray-600 mr-2">Customer:</span>
                      {customer.name}
                    </p>
                  )}
                </div>
               
              </div>
            </div>


            {/* Items - Receipt Style */}
            <div className="mb-6">
              <div className="border-b-2 border-gray-900 pb-2 mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Items Purchased</p>
              </div>
              
              <div className="space-y-3">
                {lineItems.length > 0 ? (
                  lineItems.map((item, index) => (
                    <div key={item.id} className="border-b border-gray-300 pb-3">
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
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No items</p>
                )}
              </div>
            </div>

            {/* Totals Section */}
            <div className="border-t-2 border-gray-900 pt-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900 text-sm">Rs. {totalSales.toFixed(2)}</span>
                </div>
                
                {previousDue > 0 && (
                  <div className="flex justify-between items-center text-amber-700">
                    <span className="text-sm">Previous Due:</span>
                    <span className="font-semibold text-sm">Rs. {previousDue.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-400 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                    <span className="text-lg font-black text-gray-900">Rs. {totalPayable.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 mt-3 border border-green-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-green-800">Cash Paid:</span>
                    <span className="text-lg font-bold text-green-700">Rs. {cashPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Balance Due:</span>
                    <span className={`text-lg font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Rs. {balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {balanceDue === 0 && cashPaid > 0 && (
                  <div className="text-center bg-green-100 text-green-800 font-bold py-2 rounded-lg mt-2">
                    ✓ FULLY PAID
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-900 mb-1">Thank You for Your Purchase!</p>
              <p className="text-xs text-gray-600">Please visit again</p>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-500">
                  This is a computer-generated receipt
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptPrint.displayName = 'ReceiptPrint';

export default ReceiptPrint;
