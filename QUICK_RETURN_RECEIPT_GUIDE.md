# Quick Guide: Return Receipt Feature

## ✅ What's New

### 1. View Return Receipts
- Each return now has a **"View Receipt"** button
- Click to see detailed return receipt
- Print-ready format for 80mm thermal printers

### 2. Navigation
```
/returns → Main returns page
/return/:id → View specific return receipt
```

### 3. User Actions

**From Returns List:**
```
[Return Card] → Click "View Receipt" → View Return Page
```

**From Recent Returns (Sidebar):**
```
[Recent Return] → Click → View Return Page
```

**Print Receipt:**
```
View Return Page → Click "Print Receipt" → Thermal Print (80mm)
```

## 🔧 Database Setup

Run this SQL in Supabase if you haven't already:

```sql
ALTER TABLE product_returns 
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
```

## 🐛 Bug Fixed

**Issue:** 400 Bad Request when creating returns

**Fix Applied:** 
- Cleaned data before sending to Supabase
- Converted `undefined` to `null` for optional fields
- Explicitly mapped all database columns

## 📋 Receipt Format

The return receipt includes:
- ✓ Company header (name, address, contact)
- ✓ "REFUND RECEIPT" title
- ✓ Return number and date
- ✓ Customer information
- ✓ Original invoice reference
- ✓ List of returned items
- ✓ Refund amount (highlighted)
- ✓ Optional notes
- ✓ Footer message

## 🖨️ Printing

**Thermal Printer (80mm):**
- Optimized font sizes
- Minimal spacing
- Clean, professional layout
- Auto-adjusts for thermal paper

**Print Process:**
1. Click "Print Receipt" button
2. Format switches to thermal (80mm)
3. Browser print dialog opens
4. Select your thermal printer
5. Print!

## 🎨 Design Consistency

Return receipts match the existing invoice receipt design:
- Same header style
- Same company info layout
- Same item list format
- Same footer structure
- Consistent typography

## 📱 Responsive Design

- Desktop: Full-width receipt display
- Mobile: Optimized for smaller screens
- Print: 80mm thermal format

## 🚀 Quick Test

1. Go to `/returns`
2. Create a test return
3. Click "View Receipt" on the return
4. Verify all details are correct
5. Click "Print Receipt" to test printing

## 💡 Tips

- Returns are automatically linked to original invoices
- Refund amounts are calculated from returned items
- Inventory is automatically updated when returns are processed
- Customer due balance is adjusted for refunds
- All returns are searchable by return number, invoice number, or customer name
