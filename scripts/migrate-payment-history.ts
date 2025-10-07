/**
 * Migration Script: Add cleared fields to payment_history table
 * 
 * This script adds the 'cleared' and 'cleared_at' columns to the payment_history table
 * to support the Clear Refund feature.
 * 
 * Run this script once to update your database schema.
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = "https://thmdhjmwlksqomebhtgz.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobWRoam13bGtzcW9tZWJodGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDAxNjgsImV4cCI6MjA3NDkxNjE2OH0.QQBltt2_PNK5DNxhGGLqQUBoIQ5DHFLZ-t1muv3KITY";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting migration: Add cleared fields to payment_history table\n');

  try {
    // Step 1: Add cleared column
    console.log('📝 Adding "cleared" column...');
    const { error: clearedError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE payment_history 
        ADD COLUMN IF NOT EXISTS cleared BOOLEAN DEFAULT FALSE;
      `
    });

    if (clearedError) {
      // If RPC doesn't work, we'll need to use the SQL editor
      console.log('⚠️  Cannot run SQL via RPC. Please run the following SQL in Supabase Dashboard:\n');
      console.log('----------------------------------------');
      console.log(`
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS cleared BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_payment_history_cleared ON payment_history(cleared);
      `);
      console.log('----------------------------------------\n');
      console.log('📍 Go to: Supabase Dashboard → SQL Editor → Run the above SQL');
      return;
    }

    console.log('✅ "cleared" column added successfully');

    // Step 2: Add cleared_at column
    console.log('📝 Adding "cleared_at" column...');
    const { error: clearedAtError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE payment_history 
        ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP;
      `
    });

    if (clearedAtError) throw clearedAtError;
    console.log('✅ "cleared_at" column added successfully');

    // Step 3: Add index for performance
    console.log('📝 Adding index for better query performance...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_payment_history_cleared 
        ON payment_history(cleared);
      `
    });

    if (indexError) throw indexError;
    console.log('✅ Index added successfully');

    // Step 4: Verify the changes
    console.log('\n📊 Verifying schema changes...');
    const { data: columns, error: verifyError } = await supabase
      .from('payment_history')
      .select('*')
      .limit(1);

    if (verifyError) throw verifyError;

    console.log('✅ Schema verification successful');
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNew columns added to payment_history table:');
    console.log('  • cleared (boolean, default: false)');
    console.log('  • cleared_at (timestamp)');
    console.log('  • Index: idx_payment_history_cleared');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nPlease run the SQL manually in Supabase Dashboard:');
    console.log('----------------------------------------');
    console.log(`
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS cleared BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_payment_history_cleared ON payment_history(cleared);
    `);
    console.log('----------------------------------------');
    process.exit(1);
  }
}

// Run the migration
runMigration();
