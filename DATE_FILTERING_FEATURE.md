# Date and Time Filtering Feature

## Overview
Added comprehensive date and time filtering capabilities to Profit Analysis and Payment History pages, allowing users to analyze data for specific time periods.

## Features Added

### 1. **Profit Analysis Page - Date Filtering**
- **Location**: `/profit-analysis`
- **Features**:
  - Start Date and End Date input fields
  - "Apply Filter" button to fetch filtered data
  - "Clear" button to reset filters and show all data
  - Visual indicator showing the active date range
  - Filters apply to invoice dates
  - All summary cards (Revenue, Cost, Profit, Margin) update based on filtered data
  - Product breakdown table shows only items sold within the date range

### 2. **Payment History Page - Date Filtering**
- **Location**: `/payment-history`
- **Features**:
  - Start Date and End Date input fields
  - "Apply Filter" button to fetch filtered payments
  - "Clear" button to reset filters
  - Visual indicator showing the active date range
  - Filters apply to payment creation timestamps
  - Summary cards update to show filtered totals
  - Payment type filters work in combination with date filters

### 3. **Customer Payment History Page - Date Filtering**
- **Location**: `/customer-payments`
- **Features**:
  - Start Date and End Date input fields per customer
  - "Apply" and "Clear" buttons
  - Visual indicator showing the active date range
  - Filters apply to payment timestamps for the selected customer
  - Total paid amount updates based on filtered data

## Technical Implementation

### Database Service Updates (`client/src/lib/supabaseService.ts`)

#### Updated Functions:

1. **`getProfitAnalysis(startDate?, endDate?)`**
   - Accepts optional start and end date parameters
   - Filters invoice line items by invoice date
   - Uses Supabase `.gte()` and `.lte()` operators

2. **`getProfitByProduct(startDate?, endDate?)`**
   - Passes date parameters to `getProfitAnalysis()`
   - Aggregates profit data for the filtered date range

3. **`getPaymentHistory(startDate?, endDate?)`**
   - Accepts optional start and end date parameters
   - Filters payment records by `created_at` timestamp
   - Adds one day to end date to include entire end date (inclusive filtering)

4. **`getPaymentHistoryByCustomer(customerId, startDate?, endDate?)`**
   - Filters customer-specific payments by date range
   - Maintains customer ID filtering while applying date filters

### UI Components

#### Date Filter Card
Each page includes a consistent date filter UI:
```tsx
- Start Date input (type="date")
- End Date input (type="date")
- Apply Filter button (with Calendar icon)
- Clear button (with X icon, disabled when no dates selected)
- Active filter indicator (shows selected date range)
```

#### Validation
- Validates that start date is before end date
- Shows error toast if invalid date range is selected
- Disables "Clear" button when no dates are selected
- Disables buttons during loading state

## User Experience

### How to Use Date Filtering

#### On Profit Analysis Page:
1. Navigate to **Profit** in the menu
2. Locate the "Date Filter" card at the top
3. Select a **Start Date** (optional)
4. Select an **End Date** (optional)
5. Click **Apply Filter** to view profit data for that period
6. Click **Clear** to reset and view all-time data

#### On Payment History Page:
1. Navigate to **Payments** in the menu
2. Use the "Date Filter" card to select date range
3. Click **Apply Filter**
4. Optionally use payment type filters (Invoice, Partial, Due) in combination
5. Click **Clear** to reset date filters

#### On Customer Payment History Page:
1. Navigate to **Customer Pay** in the menu
2. Select a customer from the list
3. Use the "Date Filter" card below customer info
4. Click **Apply** to filter that customer's payments
5. Click **Clear** to view all payments for that customer

## Date Range Behavior

### Inclusive Filtering
- **Start Date**: Includes all transactions from 00:00:00 on the start date
- **End Date**: Includes all transactions up to 23:59:59 on the end date
- Implementation: Adds one day to end date and uses "less than" operator

### Partial Date Selection
- Can select only start date (shows all data from that date forward)
- Can select only end date (shows all data up to that date)
- Can select both for a specific range

### Visual Feedback
When dates are selected, a message appears:
- "Showing data from [start date] to [end date]"
- "Showing data from [start date]" (if only start date)
- "Showing data to [end date]" (if only end date)

## Benefits

### Business Intelligence
- **Analyze specific periods**: Monthly, quarterly, or yearly analysis
- **Compare time periods**: Filter different date ranges to compare performance
- **Seasonal trends**: Identify which products are profitable in specific seasons
- **Payment tracking**: Monitor payment collection over time

### Financial Reporting
- Generate reports for specific accounting periods
- Track payment history for tax purposes
- Analyze profit margins over different time frames
- Identify payment patterns and trends

### Performance Optimization
- Reduces data load by fetching only relevant records
- Improves page load times for businesses with large datasets
- Server-side filtering ensures efficient database queries

## Technical Notes

### Date Format
- Uses HTML5 date input (`type="date"`)
- Stores dates in ISO 8601 format (YYYY-MM-DD)
- Converts to local date strings for display

### Database Queries
- Profit analysis filters by `invoices.date` (date field)
- Payment history filters by `created_at` (timestamp field)
- Uses Supabase query builder for efficient filtering

### State Management
- Date states managed locally in each component
- Filters persist until cleared or page refresh
- Independent filtering per page

## Future Enhancements (Optional)

- **Quick date presets**: Today, This Week, This Month, Last Month, This Year
- **Date range picker**: Single component for selecting start and end dates
- **Export filtered data**: Download filtered reports as PDF/Excel
- **Save filters**: Remember user's preferred date ranges
- **Time filtering**: Add hour/minute filtering for more granular analysis
- **Comparison mode**: Compare two different date ranges side by side
- **Date range validation**: Prevent selecting dates in the future

## Testing Recommendations

1. **Test with no dates**: Verify all data loads correctly
2. **Test with start date only**: Verify data from start date forward
3. **Test with end date only**: Verify data up to end date
4. **Test with both dates**: Verify data within range
5. **Test invalid range**: Verify error message when start > end
6. **Test edge cases**: Same start and end date, dates with no data
7. **Test with payment type filters**: Verify combination filtering works
8. **Test clear functionality**: Verify filters reset properly
