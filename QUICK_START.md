# Quick Start Guide - StockFlowPro

Get your Invoice Management System up and running in 10 minutes!

## 🚀 Fast Setup (3 Steps)

### Step 1: Install Dependencies (2 minutes)
```bash
npm install
```

### Step 2: Set Up Supabase (5 minutes)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Sign up/Login
   - Click "New Project"
   - Name it "StockFlowPro"
   - Choose a password and region
   - Wait ~2 minutes for setup

2. **Run Database Schema**
   - In Supabase dashboard, go to **SQL Editor**
   - Click "New Query"
   - Copy all content from `supabase_schema.sql`
   - Paste and click "Run"

3. **Get API Credentials**
   - Go to **Settings** → **API**
   - Copy your **Project URL**
   - Copy your **anon public** key

### Step 3: Configure & Run (3 minutes)

1. **Create .env file**
   ```bash
   cp .env.example .env
   ```

2. **Add your credentials to .env**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Start the app**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to http://localhost:5000

## ✅ You're Done!

The app is now running with Supabase backend!

## 🎯 First Steps

### 1. Add Your Company Info
- Go to Supabase dashboard → **Table Editor**
- Select `company_info` table
- Edit the default row with your business details

### 2. Add Sample Inventory
- In Supabase, go to `inventory_items` table
- Click "Insert row"
- Add a few products:
  ```
  Name: iPhone 15 Pro
  SKU: IPH15P
  Cost Price: 1000
  Stock Quantity: 10
  Reorder Level: 5
  ```

### 3. Add Sample Customer
- Go to `customers` table
- Click "Insert row"
- Add a customer:
  ```
  Name: John Doe
  Phone: 555-0123
  Address: 123 Main St
  Current Due: 0
  ```

### 4. Create Your First Invoice
- Go to the app homepage
- Select the customer you created
- Search and add items from inventory
- Enter cash paid amount
- Click "Save Invoice"

## 📱 Navigation

The top navbar is always visible:
- **New Invoice** - Create invoices
- **Invoices** - View all saved invoices
- **Inventory** - Manage products
- **Dashboard** - Business analytics
- **Theme Toggle** - Switch light/dark mode

## 🔧 Troubleshooting

### "Failed to fetch"
- Check your `.env` file has correct Supabase credentials
- Verify Supabase project is active
- Check browser console for errors

### "No data showing"
- Add sample data via Supabase Table Editor
- Refresh the page
- Check Supabase SQL Editor for schema errors

### "Can't save invoice"
- Ensure database schema was created successfully
- Check browser console for specific errors
- Verify RLS policies are enabled

## 📚 More Information

- **Detailed Setup**: See `SUPABASE_SETUP.md`
- **Full Documentation**: See `README.md`
- **Recent Changes**: See `IMPLEMENTATION_SUMMARY.md`

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Review Supabase logs in dashboard
3. Verify all tables were created in SQL Editor
4. Ensure `.env` file is in project root

---

**That's it! You're ready to manage invoices like a pro! 🎉**
