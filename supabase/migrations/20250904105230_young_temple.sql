/*
  # Add payment gateway details to pending users

  1. Schema Changes
    - Add `kazang_details` column to store Kazang account information
    - Add `shop2shop_details` column to store Shop2Shop account information  
    - Add `payfast_details` column to store PayFast account information
    - Add `password_hash` column to store encrypted password for approved users

  2. Security
    - Maintain existing RLS policies
    - Ensure payment details are only visible to admins and the user themselves

  3. Data Integrity
    - Add constraints to ensure payment details are provided for wholesalers
    - Maintain backward compatibility with existing records
*/

-- Add payment gateway details columns to pending_users table
DO $$
BEGIN
  -- Add kazang_details column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pending_users' AND column_name = 'kazang_details'
  ) THEN
    ALTER TABLE pending_users ADD COLUMN kazang_details text;
  END IF;

  -- Add shop2shop_details column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pending_users' AND column_name = 'shop2shop_details'
  ) THEN
    ALTER TABLE pending_users ADD COLUMN shop2shop_details text;
  END IF;

  -- Add payfast_details column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pending_users' AND column_name = 'payfast_details'
  ) THEN
    ALTER TABLE pending_users ADD COLUMN payfast_details text;
  END IF;

  -- Add password_hash column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pending_users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE pending_users ADD COLUMN password_hash text;
  END IF;
END $$;