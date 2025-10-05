import { forwardRef } from 'react';

interface ReturnLineItem {
  id?: string;
  item_id?: string;
  item_name: string;
  quantity: number;
  sale_price: number;
  cost_price?: number;
}

interface ReturnReceiptPrintProps {
  returnNumber: string;
  returnDate: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  customerName: string;
  customerPhone?: string;
  lineItems: ReturnLineItem[];
  refundAmount: number;
  notes?: string;
  companyInfo: {
    name: string;
    address: string;
    contact: string;
  };
  printFormat?: 'thermal';
}

const ReturnReceiptPrint = forwardRef<HTMLDivElement, ReturnReceiptPrintProps>(
  ({ 
    returnNumber, 
    returnDate, 
    invoiceNumber,
    invoiceDate,
    customerName, 
    customerPhone, 
    lineItems, 
    refundAmount, 
    notes,
    companyInfo, 
    printFormat = 'thermal' 
  }, ref) => {
    const currentDate = new Date(returnDate);
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
          {/* Return Receipt Style */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-2xl p-8 print:border-solid print:shadow-none" style={{ background: 'white', color: 'black' }}>
            {/* Header */}
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
              <div className="mt-3 pt-3 border-t border-gray-300">
                <h2 className="text-xl font-bold text-red-600">REFUND RECEIPT</h2>
              </div>
            </div>

            {/* Return Details */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200 border-dashed">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-dark uppercase tracking-wide mb-1">
                    <span className="text-gray-600 mr-2">Return#:</span>
                    {returnNumber}
                  </p>
                  {invoiceNumber && (
                    <p className="text-sm text-gray-900">
                      <span className="text-gray-600 mr-2">Original Invoice:</span>
                      {invoiceNumber}
                    </p>
                   
                )}
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-600 mr-2">Date:</span>
                    {formattedDate} {formattedTime}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="text-gray-600 mr-2">Customer:</span>
                    {customerName}
                  </p>
                
                </div>
               
              </div>
            </div>

            {/* Returned Items */}
            <div className="mb-6">
              <div className="border-b-2 border-gray-900 pb-2 mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Returned Items</p>
              </div>
              
              <div className="space-y-3">
                {lineItems.length > 0 ? (
                  lineItems.map((item, index) => (
                    <div key={item.id || index} className="border-b border-gray-300 pb-3">
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

            {/* Refund Total */}
            <div className="border-t-2 border-gray-900 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">REFUND AMOUNT:</span>
                <span className="text-2xl font-black text-green-600">
                  Rs. {refundAmount.toFixed(2)}
                </span>
              </div>
            </div>

           

            {/* Footer */}
            <div className="text-center pt-4 border-t-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-900 mb-1">Thank You for Your Business!</p>
              <p className="text-xs text-gray-600">Please visit again</p>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-500">
                  This is a computer-generated refund receipt
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReturnReceiptPrint.displayName = 'ReturnReceiptPrint';

export default ReturnReceiptPrint;
