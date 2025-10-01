# Setup Instructions - StockFlowPro

## Issues Fixed

### 1. ✅ TypeScript Type Error in AppContext
**Problem**: `id` property mismatch between state and interface
**Solution**: Made `id` optional in state initialization to match interface definition

### 2. ✅ Inventory Not Saving to Supabase
**Problem**: Inventory page was only updating local state, not calling Supabase functions
**Solution**: Updated Inventory.tsx to use `createInventoryItem`, `updateInventoryItem`, and `deleteInventoryItem` from supabaseService

### 3. ✅ WebSocket Connection Errors
**Problem**: Vite HMR trying to connect to undefined port
**Solution**: Configured Vite server with explicit port 5000 and HMR settings

### 4. ⚠️ Environment Variables Not Loading
**Problem**: Trailing slash in Supabase URL and need for server restart
**Solution**: Removed trailing slash from `.env` file

## Next Steps

### 1. Run the Database Schema in Supabase

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase_schema.sql`
5. Paste and click **Run**

This will create:
- All necessary tables (company_info, customers, inventory_items, invoices, invoice_line_items)
- Indexes for performance
- Row Level Security policies
- Default company info

### 2. Restart the Development Server

**IMPORTANT**: Stop your current dev server (Ctrl+C) and restart it:

```bash
npm run dev
```

This is required because:
- Vite only loads `.env` variables at startup
- New Vite config needs to be applied
- Updated code needs to be compiled

### 3. Verify Everything Works

After restarting:
1. Navigate to the Inventory page
2. Add a new item
3. Check your Supabase dashboard to confirm the item was saved
4. Refresh the page - the item should persist

## Environment Variables

Your `.env` file should look like this (NO trailing slash):

```env
VITE_SUPABASE_URL=https://thmdhjmwlksqomebhtgz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Security Note

⚠️ **IMPORTANT**: Never hardcode Supabase credentials in your source code. Always use environment variables. The credentials are currently hardcoded in `supabase.ts` - this should be reverted to use environment variables once the server is properly restarted.

## Common Issues

### "useAppContext must be used within an AppProvider"
- This error should disappear after server restart
- If it persists, check that App.tsx has AppProvider wrapping all routes

### Items not persisting
- Ensure you've run the SQL schema in Supabase
- Check browser console for any Supabase errors
- Verify your Supabase URL and key are correct

### WebSocket errors
- Should be resolved after server restart with new Vite config
- If they persist, they won't affect functionality (just HMR)
