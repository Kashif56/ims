# Return Process - What Happens When You Process a Return

## Overview
When you process a product return in the IMS (Inventory Management System), several automated operations occur to maintain data integrity across inventory, customer accounts, and financial records.

## Step-by-Step Process

### 1. **Return Record Creation**
- A new return record is created with a unique return number (e.g., RET-00001)
- Return details are saved including:
  - Customer information
  - Original invoice reference (if applicable)
  - Return date
  - Items being returned with quantities
  - Refund amount

### 2. **Inventory Adjustment** ✅
**Location:** `supabaseService.ts` - `createProductReturn()` function (lines 558-576)

For each returned item:
```
Current Stock + Returned Quantity = New Stock
```

**Example:**
- Item: iPhone 15 Pro Max
- Current Stock: 5 units
- Returned Quantity: 2 units
- **New Stock: 7 units** ✅

**What happens:**
- System fetches current stock quantity from `inventory_items` table
- Adds the returned quantity back to stock
- Updates the inventory record

### 3. **Invoice Line Item Tracking** ✅
**Location:** `supabaseService.ts` - `createProductReturn()` function (lines 531-556)

If the return is linked to an original invoice:
- The system tracks how many units have been returned for each line item
- Updates the `returned_quantity` field in `invoice_line_items` table
- This prevents returning more items than originally purchased

**Example:**
- Original Invoice: Customer bought 5 units
- First Return: 2 units returned → `returned_quantity = 2`
- Second Return: 1 unit returned → `returned_quantity = 3`
- System prevents returning more than 5 units total

### 4. **Customer Balance Adjustment** ✅
**Location:** `supabaseService.ts` - `createProductReturn()` function (lines 579-596)

The refund amount is deducted from the customer's due balance:
```
New Balance = Current Due - Refund Amount
```

**Example Scenarios:**

**Scenario A: Customer has positive due**
- Current Due: Rs. 5,000 (customer owes money)
- Refund Amount: Rs. 2,000
- **New Balance: Rs. 3,000** (still owes Rs. 3,000)

**Scenario B: Refund exceeds due**
- Current Due: Rs. 1,000 (customer owes money)
- Refund Amount: Rs. 2,000
- **New Balance: Rs. -1,000** (customer has Rs. 1,000 credit)

**Scenario C: Customer already has credit**
- Current Due: Rs. -500 (customer has Rs. 500 credit)
- Refund Amount: Rs. 1,000
- **New Balance: Rs. -1,500** (customer now has Rs. 1,500 credit)

### 5. **Payment History Entry** ✅
**Location:** `supabaseService.ts` - `createProductReturn()` function (lines 598-606)

A **negative payment record** is created in the payment history:
- Amount: **-Rs. [Refund Amount]** (negative value)
- Payment Type: `due_payment`
- Notes: "Refund for return RET-XXXXX: [reason]"

This negative entry:
- Appears in the "Returns & Refunds" tab in Payment History
- Is displayed in red to indicate it's a refund
- Can be deleted if needed (which will reverse the refund)

---

## Summary Table

| Action | What Happens | Example |
|--------|--------------|---------|
| **Inventory** | Returned items added back to stock | 5 units → 7 units (+2 returned) |
| **Invoice Tracking** | Returned quantity tracked per line item | `returned_quantity` updated |
| **Customer Balance** | Refund deducted from customer's due | Rs. 5,000 due → Rs. 3,000 due (after Rs. 2,000 refund) |
| **Payment History** | Negative payment entry created | -Rs. 2,000 (shown as refund) |

---

## What Happens When You Delete a Payment Record

### Deleting Regular Payments
When you delete a payment from Payment History:
1. **Payment record is removed** from the database
2. **Customer balance is adjusted**: The payment amount is added back to their due
3. **Example:**
   - Customer paid Rs. 2,000 (due was Rs. 5,000, became Rs. 3,000)
   - Delete the Rs. 2,000 payment
   - Customer's due becomes Rs. 5,000 again

### Deleting Refund Records (Negative Payments)
When you delete a refund from Payment History:
1. **Refund record is removed** from the database
2. **Customer balance is adjusted**: The refund is reversed (customer owes more)
3. **⚠️ IMPORTANT:** Inventory is NOT adjusted automatically
   - The returned items remain in stock
   - You must manually adjust inventory if needed
4. **Example:**
   - Customer received Rs. 2,000 refund (due was Rs. 5,000, became Rs. 3,000)
   - Delete the refund record
   - Customer's due becomes Rs. 5,000 again
   - **Items remain in inventory** (manual adjustment needed if you want to remove them)

---

## Important Notes

### ✅ Automated Operations
- Inventory stock updates
- Customer balance adjustments
- Payment history tracking
- Invoice line item tracking

### ⚠️ Manual Considerations
- If you delete a refund payment, inventory is NOT automatically adjusted
- Always verify inventory levels after deleting refund records
- Deleting payments should be done carefully as it affects customer balances

### 🔒 Data Integrity
- All operations are transactional
- Customer balances always reflect payment history
- Inventory levels are maintained accurately
- Audit trail is preserved through payment history

---

## File References

**Main Return Processing Logic:**
- File: `client/src/lib/supabaseService.ts`
- Function: `createProductReturn()` (lines 481-613)

**Payment Deletion Logic:**
- File: `client/src/pages/PaymentHistory.tsx`
- Function: `confirmDeletePayment()` (lines 111-167)

**Inventory Update on Sale:**
- File: `client/src/lib/supabaseService.ts`
- Function: `createInvoice()` (lines 207-264)
