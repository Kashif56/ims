# Database Migration Guide - Clear Refund Feature

## Overview
To enable the "Clear Refund" feature, you need to add two new columns to the `payment_history` table in your Supabase database.

---

## ⚡ Quick Start (Recommended)

### Option 1: Run from Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste this SQL:**

```sql
-- Add cleared fields to payment_history table
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS cleared BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_history_cleared ON payment_history(cleared);
```

4. **Click "Run"**
   - ✅ Migration complete!

---

## 🔧 Option 2: Run Migration Script from Code

### Step 1: Run the migration helper

```bash
npm run migrate
```

This will:
- Test your database connection
- Display the SQL you need to run
- Check if migration is already complete

### Step 2: Copy the SQL output

The script will output the exact SQL you need to run in the Supabase Dashboard.

---

## 📋 What Gets Added

### New Columns:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `cleared` | BOOLEAN | `FALSE` | Whether the refund has been cleared/forgiven |
| `cleared_at` | TIMESTAMP | `NULL` | When the refund was cleared |

### New Index:
- `idx_payment_history_cleared` - Improves query performance for cleared refunds

---

## ✅ Verify Migration

After running the SQL, verify it worked:

### Method 1: Check in Supabase Dashboard
1. Go to: Database → Tables → payment_history
2. Look for `cleared` and `cleared_at` columns

### Method 2: Test in your app
1. Run your app: `npm run dev`
2. Go to Payment History page
3. Navigate to "Returns & Refunds" tab
4. You should see a green checkmark button for refunds
5. If you see errors, the migration didn't run correctly

---

## 🚫 Why Can't We Run SQL Directly from Code?

**Security Reason:**
Supabase restricts direct SQL execution from client code to prevent SQL injection attacks and unauthorized schema changes.

**What Supabase Allows:**
- ✅ CRUD operations (SELECT, INSERT, UPDATE, DELETE)
- ✅ RPC functions (if you create them)
- ❌ DDL operations (ALTER TABLE, CREATE INDEX, etc.)

**Solution:**
Run DDL (Data Definition Language) commands through the Supabase Dashboard SQL Editor, which has proper authentication and authorization.

---

## 🔄 Alternative: Use Supabase Migrations (Advanced)

If you want version-controlled migrations:

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Initialize Supabase locally

```bash
supabase init
```

### Step 3: Create migration file

```bash
supabase migration new add_cleared_fields_to_payment_history
```

### Step 4: Edit the migration file

Add the SQL to the generated file in `supabase/migrations/`

### Step 5: Push migration to remote

```bash
supabase db push
```

---

## 🐛 Troubleshooting

### Error: "column already exists"
✅ **Solution:** Migration already ran successfully. You're good to go!

### Error: "permission denied"
❌ **Problem:** Using anon key instead of service role key
✅ **Solution:** Run SQL in Supabase Dashboard instead

### Error: "relation payment_history does not exist"
❌ **Problem:** Table name is different or doesn't exist
✅ **Solution:** Check your table name in Supabase Dashboard

### Feature not working after migration
1. Hard refresh your browser (Ctrl + Shift + R)
2. Clear browser cache
3. Restart your dev server
4. Check browser console for errors

---

## 📝 Manual SQL (Copy-Paste Ready)

If you prefer to do it manually, here's the complete SQL:

```sql
-- ============================================
-- Migration: Add Clear Refund Feature
-- Date: 2025-10-08
-- ============================================

-- Step 1: Add cleared column
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS cleared BOOLEAN DEFAULT FALSE;

-- Step 2: Add cleared_at column
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP;

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS idx_payment_history_cleared 
ON payment_history(cleared);

-- Step 4: Verify (optional)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payment_history'
  AND column_name IN ('cleared', 'cleared_at');
```

---

## 🎯 After Migration Checklist

- [ ] SQL executed successfully in Supabase Dashboard
- [ ] Verified columns exist in payment_history table
- [ ] Restarted dev server (`npm run dev`)
- [ ] Tested Clear Refund button appears
- [ ] Tested clearing a refund works
- [ ] Verified customer balance updates correctly
- [ ] Checked "Cleared" badge appears on cleared refunds

---

## 📞 Need Help?

If you encounter issues:

1. Check Supabase Dashboard → Database → Logs
2. Check browser console for JavaScript errors
3. Verify your Supabase connection in `.env` file
4. Make sure you're using the correct project in Supabase Dashboard

---

## 🔐 Security Note

**Never commit these to version control:**
- Service role keys
- Database passwords
- API secrets

Always use environment variables and keep `.env` files in `.gitignore`.
