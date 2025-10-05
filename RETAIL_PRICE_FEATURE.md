# Retail Price Feature Implementation

## Overview
Added a retail price field to inventory items that serves as the default sale price when creating bills/invoices.

## Changes Made

### 1. Database Migration
**File:** `add_retail_price_migration.sql`
- Added `retail_price` column to `inventory_items` table
- Set default value to 0
- Auto-populated existing items with retail_price = cost_price * 1.2 (20% markup)

**To apply migration:**
```sql
-- Run this SQL in your Supabase SQL Editor
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10, 2) DEFAULT 0;

UPDATE inventory_items 
SET retail_price = cost_price * 1.2 
WHERE retail_price = 0 OR retail_price IS NULL;
```

### 2. TypeScript Interface Updates
**File:** `client/src/lib/supabase.ts`
- Updated `InventoryItem` interface to include `retail_price: number`

### 3. Component Updates

#### Inventory Modal (`client/src/components/InventoryModal.tsx`)
- Added "Retail Price" input field
- Updated form state to include `retailPrice`
- Display shows both cost and retail price for each item
- Format: "Cost: Rs. X.XX • Retail: Rs. Y.YY"

#### Invoice Line Items (`client/src/components/InvoiceLineItems.tsx`)
- Updated to use `retail_price` as default sale price when adding items
- Fallback logic: `retail_price || cost_price * 1.2`
- Item suggestions now show retail price instead of cost price

#### Inventory Page (`client/src/pages/Inventory.tsx`)
- Added "Retail Price" input field in the add/edit form
- Updated form state management
- Display shows both cost and retail price for inventory items

#### Home Page (`client/src/pages/Home.tsx`)
- Updated `InventoryItem` interface to include `retail_price`

#### App Context (`client/src/context/AppContext.tsx`)
- Updated `InventoryItem` interface to include `retail_price`

## How It Works

### Adding New Inventory Items
1. Navigate to Inventory page
2. Fill in item details including:
   - Item Name
   - SKU
   - **Wholesale Cost** (purchase price)
   - **Retail Price** (selling price)
   - Stock Quantity
   - Reorder Level
3. Save the item

### Creating Bills/Invoices
1. On the Home page, search for an item
2. The item suggestion shows the retail price
3. When you select an item:
   - The **retail price** is automatically used as the sale price
   - You can still override the price manually if needed
4. Complete the sale as usual

## Benefits
- **Consistent Pricing:** Set retail prices once in inventory
- **Faster Billing:** No need to manually enter prices for each sale
- **Flexibility:** Can still override prices on individual invoices
- **Better Profit Tracking:** Clear separation between cost and retail prices

## Migration Steps
1. **Run the SQL migration** in Supabase SQL Editor
2. **Restart your development server** to pick up the changes
3. **Update existing inventory items** with retail prices through the Inventory page
4. New items will require retail price when adding

## Notes
- Existing items will have retail_price auto-calculated as cost_price * 1.2
- You should review and update these prices as needed
- The retail price is optional in the form but recommended for accurate billing
- If retail_price is 0 or not set, the system falls back to cost_price * 1.2
