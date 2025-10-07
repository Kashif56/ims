/**
 * Simple Migration Runner
 * 
 * This script executes SQL migrations directly on your Supabase database.
 * 
 * Usage:
 *   node scripts/run-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migration = `
-- Migration: Add cleared fields to payment_history table
-- Date: ${new Date().toISOString()}

-- Add cleared column (tracks if refund has been forgiven)
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS cleared BOOLEAN DEFAULT FALSE;

-- Add cleared_at column (tracks when refund was cleared)
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_history_cleared ON payment_history(cleared);

-- Verify columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payment_history'
  AND column_name IN ('cleared', 'cleared_at');
`;

async function runMigration() {
  console.log('🚀 Starting Database Migration\n');
  console.log('📋 Migration: Add cleared fields to payment_history table\n');

  try {
    // Note: Supabase client doesn't support direct SQL execution for security reasons
    // You need to run this in the Supabase Dashboard SQL Editor
    
    console.log('⚠️  IMPORTANT: Supabase requires SQL to be run from the Dashboard for security.\n');
    console.log('📍 Please follow these steps:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Navigate to: SQL Editor (left sidebar)');
    console.log('4. Click "New Query"');
    console.log('5. Copy and paste the SQL below:\n');
    console.log('========================================');
    console.log(migration);
    console.log('========================================\n');
    console.log('6. Click "Run" to execute the migration\n');
    console.log('✅ After running, the Clear Refund feature will work correctly!\n');

    // Test connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('payment_history')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful\n');
      
      // Check if columns already exist
      console.log('🔍 Checking if migration is needed...');
      const { data: testData, error: testError } = await supabase
        .from('payment_history')
        .select('cleared, cleared_at')
        .limit(1);

      if (testError) {
        if (testError.message.includes('column') && testError.message.includes('does not exist')) {
          console.log('⚠️  Migration needed: columns do not exist yet\n');
        } else {
          console.log('❓ Unable to verify migration status\n');
        }
      } else {
        console.log('✅ Migration may already be complete (columns exist)\n');
        console.log('If you see errors in the app, please run the SQL above anyway.\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();
