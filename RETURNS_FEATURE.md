# Product Returns Feature

## Overview
The Product Returns feature allows you to track and manage product returns from customers. When items are returned, they are automatically added back to your inventory.

## Setup Instructions

### 1. Database Setup
Run the SQL schema in your Supabase SQL Editor:

```bash
# The schema file is located at: returns_schema.sql
```

Open your Supabase dashboard:
1. Go to SQL Editor
2. Copy the contents of `returns_schema.sql`
3. Execute the SQL to create the necessary tables

This will create:
- `product_returns` table - Stores return records
- `return_line_items` table - Stores individual items in each return
- Necessary indexes and triggers
- Row Level Security policies

### 2. Verify Installation
After running the schema, verify the tables exist:
```sql
SELECT * FROM product_returns LIMIT 1;
SELECT * FROM return_line_items LIMIT 1;
```

## Features

### 1. Create Product Returns
- **Return Number**: Auto-generated sequential numbers (RET-00001, RET-00002, etc.)
- **Customer Selection**: Link returns to existing customers
- **Invoice Reference**: Optionally link returns to specific invoices
- **Multiple Items**: Add multiple items to a single return
- **Inventory Integration**: Items are automatically added back to inventory
- **Notes**: Add optional notes for each return

### 2. Return Items Management
Two ways to add items:
1. **From Inventory**: Select from existing inventory items (auto-fills cost price)
2. **Manual Entry**: Enter item details manually for items not in inventory

For each item, track:
- Item name
- Quantity returned
- Sale price (original selling price)
- Cost price (for tracking purposes)

### 3. Returns History
- View all returns with filtering options
- Search by return number, invoice number, or customer name
- Filter by date
- See detailed information for each return including:
  - Customer details
  - Related invoice (if any)
  - All returned items
  - Return date
  - Notes

### 4. Automatic Inventory Updates
When a return is created:
- The system automatically adds returned quantities back to inventory
- Only items linked to inventory are updated
- Manual entries don't affect inventory (useful for non-tracked items)

## How to Use

### Creating a Return

1. **Navigate to Returns Page**
   - Click "Returns" in the navigation menu

2. **Click "New Return"**
   - A dialog will open with a form

3. **Fill in Return Details**
   - Return number is auto-generated
   - Select return date (defaults to today)
   - Select customer (required)
   - Optionally select related invoice

4. **Add Return Items**
   - Click "Add Item"
   - For each item:
     - Select from inventory OR enter manually
     - Enter quantity
     - Enter sale price and cost price
   - Remove items with the X button if needed

5. **Add Notes (Optional)**
   - Add any relevant information about the return

6. **Review and Submit**
   - Check the total items count
   - Click "Create Return"
   - Inventory will be automatically updated

### Viewing Returns

1. **Returns List**
   - All returns are displayed as cards
   - Most recent returns appear first

2. **Search and Filter**
   - Use search box to find specific returns
   - Filter by date to see returns in a date range

3. **Return Details**
   - Each card shows:
     - Return number and date
     - Customer information
     - Related invoice (if any)
     - All returned items with quantities and prices
     - Notes (if any)

## API Functions

The following functions are available in `supabaseService.ts`:

### `getProductReturns(startDate?, endDate?)`
Fetch all returns with optional date filtering
```typescript
const returns = await getProductReturns();
const recentReturns = await getProductReturns('2024-01-01', '2024-12-31');
```

### `getProductReturnById(id)`
Fetch a specific return with all its line items
```typescript
const returnData = await getProductReturnById(returnId);
```

### `createProductReturn(returnData, lineItems)`
Create a new return and update inventory
```typescript
await createProductReturn(
  {
    return_number: 'RET-00001',
    customer_id: 'customer-uuid',
    customer_name: 'John Doe',
    return_date: '2024-01-15',
    total_items: 2,
    notes: 'Defective items'
  },
  [
    {
      item_id: 'item-uuid',
      item_name: 'Product A',
      quantity: 2,
      sale_price: 100,
      cost_price: 50
    }
  ]
);
```

### `getNextReturnNumber()`
Get the next available return number
```typescript
const nextNumber = await getNextReturnNumber(); // Returns 'RET-00001'
```

## Database Schema

### product_returns Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| return_number | TEXT | Unique return identifier |
| invoice_id | UUID | Optional reference to invoice |
| invoice_number | TEXT | Invoice number for display |
| customer_id | UUID | Reference to customer |
| customer_name | TEXT | Customer name |
| customer_phone | TEXT | Customer phone |
| return_date | DATE | Date of return |
| total_items | INTEGER | Total quantity of items returned |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### return_line_items Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| return_id | UUID | Reference to product_returns |
| item_id | UUID | Optional reference to inventory_items |
| item_name | TEXT | Item name |
| quantity | INTEGER | Quantity returned |
| sale_price | DECIMAL | Original sale price |
| cost_price | DECIMAL | Cost price |
| created_at | TIMESTAMP | Record creation time |

## TypeScript Types

```typescript
interface ProductReturn {
  id: string;
  return_number: string;
  invoice_id?: string | null;
  invoice_number?: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone?: string;
  return_date: string;
  total_items: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface ReturnLineItem {
  id: string;
  return_id: string;
  item_id?: string | null;
  item_name: string;
  quantity: number;
  sale_price: number;
  cost_price: number;
  created_at?: string;
}
```

## Important Notes

### Amount Handling
- The current implementation does NOT handle refunds or payment adjustments
- Returns are tracked for inventory purposes only
- You mentioned you'll handle the amount part later
- When implementing refunds, you may want to:
  - Add a `refund_amount` field to `product_returns`
  - Create payment history entries for refunds
  - Update customer due amounts if applicable

### Inventory Updates
- Only items with a valid `item_id` (linked to inventory) will update stock
- Manual entries (no `item_id`) are tracked but don't affect inventory
- Stock is increased immediately when return is created
- There's no undo functionality currently

### Future Enhancements
Consider adding:
- Return approval workflow
- Refund amount tracking
- Return reasons (defective, wrong item, etc.)
- Return status (pending, approved, rejected)
- Edit/delete return functionality
- Return statistics and reports
- Integration with payment system for refunds

## Troubleshooting

### Returns not appearing
- Ensure the database schema was executed successfully
- Check browser console for errors
- Verify Supabase connection

### Inventory not updating
- Verify the item has a valid `item_id`
- Check that the item exists in `inventory_items` table
- Look for errors in browser console

### Permission errors
- Ensure RLS policies are created correctly
- Check that your Supabase API key has proper permissions

## Navigation
The Returns page is accessible from:
- **Main navigation menu** - Returns button in the top header
- **Home page** - "Process Return" button in the right sidebar (Quick Access section)
- **Direct URL** - `/returns`

## User Interface Improvements

### Searchable Customer Selection
Instead of a dropdown, the Returns page now features:
- **Search-as-you-type** - Type customer name or phone number
- **Live filtering** - Results update as you type
- **Quick selection** - Click on a customer to select
- **Selected customer display** - Shows selected customer with option to change
- **Better UX** - Faster and more intuitive than scrolling through a long list

### Quick Access Button on Home Page
A prominent "Process Return" button is now available on the Home page:
- Located in the right sidebar below Quick Stats
- Distinctive orange styling for easy identification
- One-click navigation to Returns page
- Helpful description text
