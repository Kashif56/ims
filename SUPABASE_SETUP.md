# Supabase Setup Guide for StockFlowPro

This guide will help you set up Supabase for your Invoice Management System.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: StockFlowPro (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (takes ~2 minutes)

## Step 2: Set Up the Database Schema

1. In your Supabase project dashboard, click on the **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase_schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create all necessary tables:
- `company_info` - Store your company details
- `customers` - Customer information
- `inventory_items` - Product inventory
- `invoices` - Invoice records
- `invoice_line_items` - Individual items in each invoice

## Step 3: Get Your API Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 4: Configure Environment Variables

1. In your project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Replace the values with your actual Supabase URL and anon key from Step 3.

## Step 5: Install Dependencies

If you haven't already, install the required dependencies:

```bash
npm install
```

The `@supabase/supabase-js` package is already included in package.json.

## Step 6: Start the Application

```bash
npm run dev
```

The application will now connect to your Supabase database!

## Step 7: Add Initial Data (Optional)

The schema includes a default company info entry. You can add sample data through the Supabase dashboard:

### Add Sample Customers:
1. Go to **Table Editor** in Supabase dashboard
2. Select `customers` table
3. Click "Insert" → "Insert row"
4. Add customer details

### Add Sample Inventory:
1. Select `inventory_items` table
2. Click "Insert" → "Insert row"
3. Add product details (name, SKU, cost_price, stock_quantity, reorder_level)

## Database Schema Overview

### Tables Structure:

**company_info**
- `id` (UUID, Primary Key)
- `name` (Text)
- `address` (Text)
- `contact` (Text)
- `created_at`, `updated_at` (Timestamps)

**customers**
- `id` (UUID, Primary Key)
- `name` (Text)
- `phone` (Text)
- `address` (Text)
- `current_due` (Decimal)
- `created_at`, `updated_at` (Timestamps)

**inventory_items**
- `id` (UUID, Primary Key)
- `name` (Text)
- `sku` (Text, Unique)
- `cost_price` (Decimal)
- `stock_quantity` (Integer)
- `reorder_level` (Integer)
- `created_at`, `updated_at` (Timestamps)

**invoices**
- `id` (UUID, Primary Key)
- `invoice_number` (Text, Unique)
- `customer_id` (UUID, Foreign Key)
- `customer_name` (Text)
- `customer_phone` (Text)
- `customer_address` (Text)
- `date` (Date)
- `total_amount` (Decimal)
- `amount_paid` (Decimal)
- `remaining_due` (Decimal)
- `company_name`, `company_address`, `company_contact` (Text)
- `created_at`, `updated_at` (Timestamps)

**invoice_line_items**
- `id` (UUID, Primary Key)
- `invoice_id` (UUID, Foreign Key)
- `item_id` (UUID, Foreign Key)
- `item_name` (Text)
- `quantity` (Integer)
- `sale_price` (Decimal)
- `cost_price` (Decimal)
- `created_at` (Timestamp)

## Security Notes

### Row Level Security (RLS)
The schema enables RLS on all tables with permissive policies for development. For production:

1. Go to **Authentication** → **Policies** in Supabase dashboard
2. Update policies to restrict access based on your authentication requirements
3. Consider implementing user authentication

### API Keys
- **Never commit** your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use environment variables in production

## Troubleshooting

### "Failed to fetch data"
- Check that your Supabase URL and anon key are correct in `.env`
- Verify your Supabase project is active
- Check browser console for specific error messages

### "Permission denied"
- Verify RLS policies are set correctly
- Check that tables were created successfully

### "Table does not exist"
- Re-run the SQL schema from `supabase_schema.sql`
- Check for any SQL errors in the Supabase SQL Editor

## Testing the Connection

1. Start your application: `npm run dev`
2. Open the browser console (F12)
3. Navigate to the Dashboard page
4. You should see data loading from Supabase
5. If you see errors, check the console for details

## Next Steps

1. **Add Authentication** (Optional):
   - Enable authentication in Supabase dashboard
   - Update RLS policies to restrict access by user
   - Add login/signup pages

2. **Customize Company Info**:
   - Go to Supabase Table Editor
   - Edit the `company_info` table
   - Update with your actual business details

3. **Backup Strategy**:
   - Set up automated backups in Supabase dashboard
   - Export data regularly for local backups

## Support

For Supabase-specific issues:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

For application issues:
- Check the browser console for errors
- Review the `CHANGES.md` file for recent updates
