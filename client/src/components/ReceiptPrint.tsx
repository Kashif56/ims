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
  printFormat?: 'thermal';
}

const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(
  ({ billNumber, date, customer, lineItems, totalSales, previousDue, cashPaid, balanceDue, companyInfo, printFormat = 'thermal' }, ref) => {
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
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
            .urdu-text {
              font-family: 'Noto Nastaliq Urdu', serif;
              direction: rtl;
              text-align: right;
              line-height: 1.8;
            }
            @media print {
              .urdu-text {
                color: #000 !important;
              }
            }
          `}
        </style>
        <div className="max-w-2xl mx-auto print:max-w-full" style={{ background: 'white' }}>
          {/* POS Receipt Style */}
          <div className="bg-white rounded-lg shadow-2xl p-3 print:p-0 print:border-none print:shadow-none print:rounded-none" style={{ background: 'white', color: 'black' }}>
            {/* Header with Receipt Icon */}
            <div className="text-center mb-3 pb-2 border-b-2 border-gray-300 print:mb-2 print:pb-1">
              <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                {companyInfo.name || 'POS SYSTEM'}
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                {companyInfo.address || '123 Commerce Street'}
              </p>
              <p className="text-xs text-gray-600 font-medium">
                {companyInfo.contact || 'Ph: (555) 123-4567'}
              </p>
            </div>

            {/* Bill Number & Date */}
            <div className="mb-3 bg-gray-50 rounded p-2 border border-gray-200 border-dashed print:mb-2 print:p-1 print:bg-transparent print:border-gray-900">
              <div className="space-y-1">
                <div className='flex justify-between items-center'>
                  <p className="text-xs text-dark uppercase tracking-wide">
                    <span className="text-gray-600 mr-2">INV#:</span>
                    {billNumber}
                  </p>
                  <p className="text-xs text-gray-900">
                    <span className="text-gray-600 mr-2">Date:</span>
                    {formattedDate} {formattedTime}
                  </p>
                </div>
                {customer && (
                  <p className="text-xs text-gray-900">
                    <span className="text-gray-600 mr-2">Customer:</span>
                    {customer.name}
                  </p>
                )}
              </div>
            </div>


            {/* Items - Table Format */}
            <div className="mb-3 print:mb-2">
              <table className="w-full text-xs border-collapse print:text-[9px]">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="text-left py-1 font-bold text-gray-700 uppercase print:text-black print:py-0.5">Name</th>
                    <th className="text-center py-1 font-bold text-gray-700 uppercase w-12 print:text-black print:py-0.5">Qty</th>
                    <th className="text-right py-1 font-bold text-gray-700 uppercase w-16 print:text-black print:py-0.5">Price</th>
                    <th className="text-right py-1 font-bold text-gray-700 uppercase w-20 print:text-black print:py-0.5">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length > 0 ? (
                    lineItems.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-200 receipt-item">
                        <td className="py-1 text-gray-900 break-words print:text-black print:py-0.5">
                          <span className="text-gray-500 mr-1 print:text-black">{index + 1}.</span>
                          {item.item_name}
                        </td>
                        <td className="py-1 text-center text-gray-600 print:text-black print:py-0.5">
                          {item.quantity}
                        </td>
                        <td className="py-1 text-right text-gray-600 print:text-black print:py-0.5">
                          Rs. {item.sale_price.toFixed(0)}
                        </td>
                        <td className="py-1 text-right font-semibold text-gray-900 print:text-black print:py-0.5">
                          Rs. {(item.quantity * item.sale_price).toFixed(0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-2">No items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="border-t-2 border-gray-900 pt-2 mb-3 print:pt-1 print:mb-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 print:text-black">Subtotal:</span>
                  <span className="font-semibold text-gray-900 text-xs print:text-black">Rs. {totalSales.toFixed(0)}</span>
                </div>
                
                {previousDue > 0 && (
                  <div className="flex justify-between items-center text-amber-700 print:text-black">
                    <span className="text-xs">Previous Due:</span>
                    <span className="font-semibold text-xs">Rs. {previousDue.toFixed(0)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-400 pt-1 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900 print:text-black">TOTAL:</span>
                    <span className="text-sm font-black text-gray-900 print:text-black">Rs. {totalPayable.toFixed(0)}</span>
                  </div>
                </div>

                <div className="rounded p-2 mt-2 border border-green-200 print:mt-0 print:p-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-green-800 print:text-black">Cash Paid:</span>
                    <span className="text-sm font-bold text-green-700 print:text-black print:mt-0">Rs. {cashPaid.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-700 print:text-black">Balance Due:</span>
                    <span className={`text-sm font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'} print:text-black`}>
                      Rs. {balanceDue.toFixed(0)}
                    </span>
                  </div>
                </div>

                {balanceDue === 0 && cashPaid > 0 && (
                  <div className="text-center bg-green-100 text-green-800 font-bold py-1 rounded text-xs mt-1 print:bg-gray-100 print:text-black">
                    ✓ FULLY PAID
                  </div>
                )}
              </div>
            </div>

            {/* Urdu Warranty Terms */}
            <div className="pt-2 mb-3 print:pt-1 print:mb-2">
              <div className="urdu-text text-xs text-gray-800 space-y-1 leading-relaxed print:text-black">
                <p>۱- موبائل فون بس کمپنی کی وارنٹی میں ہو گا وہی کمپنی ذمہ دار ہو گی دوکاندار نئی یا کلیم دینے کا پابند نہیں ہو گا۔</p>
                <p>۲- استعمال شدہ چارجر، ہینڈ فری اور پھولی ہوئی بیٹری کی کوئی وارنٹی نہیں ہے۔</p>
                <p>۳- خریدا ہوا مال واپس یا تبدیل نہیں ہو گا۔</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center print:mt-1">
              <p className="text-xs font-semibold text-gray-900 mb-1 print:text-black print:mb-0.5">Thank You for Your Purchase!</p>
              <p className="text-xs text-gray-600 print:text-black">Please visit again</p>
              <div className="mt-2 pt-2 border-t border-gray-300 print:mt-1 print:pt-1">
                <p className="text-xs text-gray-500 print:text-black">
                  Powered by NinjaTech Solutions
                </p>
                <p className="text-xs text-blue-500 print:text-black">info.ninjatechsolutions@gmail.com</p>
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
