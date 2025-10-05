# Product Returns System V2 - Invoice-Based Returns with Refunds

## Overview
The new returns system is completely redesigned based on invoice lookup. It handles returns, refunds, inventory restoration, and payment adjustments automatically.

## Setup Instructions

### 1. Database Migration
Run this SQL in your Supabase SQL Editor to update the schema:

```sql
-- Add refund_amount column to existing product_returns table
ALTER TABLE product_returns 
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
```

If you haven't created the tables yet, run the complete `returns_schema.sql` file.

### 2. Verify Installation
```sql
SELECT * FROM product_returns LIMIT 1;
SELECT * FROM return_line_items LIMIT 1;
```

## New Workflow

### Step 1: Enter Invoice Number
- User enters the invoice/receipt number (e.g., INV-00001)
- System searches and loads the complete invoice with all details
- Shows customer information and all purchased items

### Step 2: Select Items to Return
- Displays all items from the invoice
- User selects which items to return using checkboxes
- For each selected item:
  - Can adjust return quantity (up to original quantity)
  - Shows refund amount per item
  - Real-time calculation of total refund
- Add optional notes (reason for return, condition, etc.)

### Step 3: Process Return
When user clicks "Process Return":
1. **Creates return record** with return number (RET-00001, etc.)
2. **Adds items back to inventory** (automatic stock restoration)
3. **Calculates refund amount** based on returned items
4. **Adjusts customer balance** (reduces their due by refund amount)
5. **Creates payment history entry** (negative amount for refund)
6. **Shows confirmation** with refund receipt

### Step 4: Print Refund Receipt
- Printable receipt similar to invoice format
- Shows return number, original invoice reference
- Lists all returned items with quantities and prices
- Displays total refund amount
- Includes notes if any

## Key Features

### ✅ Invoice-Based Returns
- No manual item entry needed
- All data pulled from original invoice
- Ensures accuracy and prevents errors

### ✅ Flexible Item Selection
- Return all items or select specific ones
- Adjust quantities (partial returns supported)
- Real-time refund calculation

### ✅ Automatic Inventory Management
- Returned items automatically added back to stock
- Only affects items linked to inventory
- Immediate stock updates

### ✅ Financial Integration
- **Refund Amount Tracking** - Exact refund calculated
- **Customer Balance Adjustment** - Due amount reduced by refund
- **Payment History** - Negative entry created for refund
- **Audit Trail** - Complete record of all transactions

### ✅ Professional Receipts
- Printable refund receipts
- Shows original invoice reference
- Clear breakdown of returned items
- Total refund amount highlighted

## How It Works

### Refund Calculation
```typescript
// For each selected item:
refund = return_quantity × sale_price

// Total refund:
total_refund = sum of all selected items
```

### Payment Adjustment
```typescript
// Customer's new balance:
new_due = current_due - refund_amount

// Example:
// Customer owes: Rs. 1000
// Refund given: Rs. 300
// New balance: Rs. 700 (they owe less)
```

### Payment History Entry
```typescript
{
  amount: -300,  // Negative for refund
  payment_type: 'due_payment',
  notes: 'Refund for return RET-00001: Defective product'
}
```

## User Interface

### Main Screen
- **Search Box** - Enter invoice number to start
- **Recent Returns** - Quick view of last 5 returns
- **Returns History** - Full searchable history with filters

### Return Processing Screen
- **Invoice Details Card** - Shows original invoice info
- **Item Selection** - Checkboxes with quantity adjusters
- **Return Summary** - Live calculation sidebar
- **Notes Field** - Optional reason/comments
- **Process Button** - Shows refund amount

### Confirmation Screen
- **Success Message** - Return number and refund amount
- **Print Button** - Generate refund receipt
- **New Return Button** - Process another return

## API Functions

### `getInvoiceByNumber(invoiceNumber)`
Fetch invoice by invoice number (not ID)
```typescript
const invoice = await getInvoiceByNumber('INV-00001');
// Returns invoice with all line items
```

### `createProductReturn(returnData, lineItems)`
Process return with refunds and adjustments
```typescript
await createProductReturn(
  {
    return_number: 'RET-00001',
    invoice_id: 'uuid',
    invoice_number: 'INV-00001',
    customer_id: 'uuid',
    customer_name: 'John Doe',
    return_date: '2024-01-15',
    total_items: 2,
    refund_amount: 500,
    notes: 'Defective items'
  },
  [
    {
      item_id: 'uuid',
      item_name: 'Product A',
      quantity: 2,
      sale_price: 250,
      cost_price: 100
    }
  ]
);
```

## What Happens Behind the Scenes

### When Return is Processed:

1. **Database Transactions**
   - Insert into `product_returns` table
   - Insert into `return_line_items` table
   - Update `inventory_items` stock quantities
   - Update `customers` current_due
   - Insert into `payment_history`

2. **Inventory Updates**
   ```sql
   -- For each returned item:
   UPDATE inventory_items 
   SET stock_quantity = stock_quantity + return_quantity
   WHERE id = item_id;
   ```

3. **Customer Balance**
   ```sql
   UPDATE customers 
   SET current_due = current_due - refund_amount
   WHERE id = customer_id;
   ```

4. **Payment Record**
   ```sql
   INSERT INTO payment_history (
     customer_id, 
     amount,  -- negative value
     payment_type,
     notes
   ) VALUES (...);
   ```

## Database Schema

### Updated product_returns Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| return_number | TEXT | Unique return identifier |
| invoice_id | UUID | Reference to original invoice |
| invoice_number | TEXT | Invoice number for display |
| customer_id | UUID | Reference to customer |
| customer_name | TEXT | Customer name |
| customer_phone | TEXT | Customer phone |
| return_date | DATE | Date of return |
| total_items | INTEGER | Total quantity returned |
| **refund_amount** | **DECIMAL** | **Total refund given** |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## Benefits Over Previous System

### Old System ❌
- Manual customer selection
- Manual item entry
- No invoice reference
- No refund tracking
- No payment adjustments
- No refund receipts

### New System ✅
- Invoice-based lookup
- Auto-populated items
- Direct invoice link
- Full refund tracking
- Automatic payment adjustments
- Professional refund receipts

## Usage Example

### Scenario: Customer returns 2 items from invoice INV-00005

1. **Staff enters**: `INV-00005`
2. **System shows**: 
   - Customer: John Doe
   - Invoice Date: Jan 10, 2024
   - 5 items purchased
3. **Staff selects**: 
   - Item A: Return 2 out of 3 (Rs. 100 each)
   - Item B: Return 1 out of 1 (Rs. 50)
4. **System calculates**: 
   - Refund: Rs. 250
5. **Staff adds note**: "Defective products"
6. **Staff clicks**: "Process Return"
7. **System does**:
   - Creates RET-00001
   - Adds 2 Item A + 1 Item B back to inventory
   - Reduces John's due by Rs. 250
   - Creates payment history entry
   - Shows success + print option

## Important Notes

### Refund Logic
- Refund reduces customer's outstanding balance
- If customer has no due, balance becomes negative (credit)
- Negative balance means customer has credit for future purchases

### Inventory
- Only items with valid `item_id` update inventory
- Stock increases immediately
- No approval workflow (instant processing)

### Payment History
- Refunds appear as negative amounts
- Clearly marked in notes
- Linked to both return and original invoice

## Future Enhancements

Consider adding:
- **Partial refunds** (return item but give less money)
- **Return approval workflow** (manager approval required)
- **Return reasons** (dropdown: defective, wrong item, etc.)
- **Restocking fees** (deduct from refund)
- **Exchange handling** (return + new purchase)
- **Return statistics** (most returned items, return rate)
- **Email notifications** (send refund receipt to customer)

## Troubleshooting

### Invoice not found
- Check invoice number spelling
- Ensure invoice exists in database
- Try searching in Bills page first

### Refund not reflecting
- Check customer's current_due in Customers page
- Verify payment history entry created
- Check browser console for errors

### Inventory not updating
- Ensure items have valid item_id
- Check inventory page for stock changes
- Verify item exists in inventory_items table

## Navigation
Access Returns from:
- **Main navigation** - Returns button
- **Home page** - "Process Return" button
- **Direct URL** - `/returns`
