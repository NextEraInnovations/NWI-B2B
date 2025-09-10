# Database Migrations Guide

## 📋 Migration Files Overview

Your project includes several migration files that must be run in order:

### 1. Core Schema (20250801091544_silver_heart.sql)
- Creates basic tables: users, products, orders, support_tickets
- Sets up RLS policies
- Adds performance indexes

### 2. Extended Features (20250801104422_amber_palace.sql)
- Adds promotions system
- Adds return requests functionality
- Extends user management

### 3. Platform Settings (20250805085157_noisy_dew.sql)
- Adds platform_settings table
- Adds pending_users table
- Adds analytics functions

### 4. Additional Enhancements (remaining migrations)
- Payment gateway integrations
- Advanced analytics
- Performance optimizations

## 🚀 How to Run Migrations

### Method 1: Supabase Dashboard (Recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the entire content of each migration file
5. Run them one by one in chronological order

### Method 2: Supabase CLI (Advanced)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## ✅ Verification Steps

After running migrations, verify everything is set up correctly:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- users
- pending_users
- products
- orders
- order_items
- support_tickets
- promotions
- return_requests
- return_items
- platform_settings

### 2. Check RLS is Enabled
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

All tables should have RLS enabled.

### 3. Test Policies
```sql
-- Test as authenticated user
SELECT current_setting('request.jwt.claims', true);

-- Test product access
SELECT count(*) FROM products;

-- Test user access
SELECT count(*) FROM users;
```

## 🔧 Troubleshooting Migrations

### Common Issues:

**"relation already exists"**
- Migration was already run
- Skip to next migration file

**"permission denied"**
- Make sure you're using the service role key
- Check you're the project owner

**"function does not exist"**
- Run migrations in correct order
- Some functions depend on others

### Recovery Steps:
```sql
-- If you need to reset (DANGER: This deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run all migrations
```

## 📝 Creating New Migrations

When you need to modify the database:

### 1. Create New Migration File
```bash
# Name format: YYYYMMDDHHMMSS_description.sql
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_new_feature.sql
```

### 2. Migration Template
```sql
/*
  # Add New Feature

  1. New Tables
    - `new_table` - Description of what it stores
  
  2. Changes
    - Add column to existing table
    - Update RLS policies
  
  3. Security
    - Enable RLS on new table
    - Add appropriate policies
*/

-- Your SQL changes here
CREATE TABLE IF NOT EXISTS new_table (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- other columns
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can read own data" ON new_table
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

### 3. Test Migration
```sql
-- Always test your migration
BEGIN;
-- Run your migration SQL here
-- Test that it works
ROLLBACK; -- or COMMIT if satisfied
```

## 🔄 Data Seeding

### 1. Create Admin User
```sql
INSERT INTO users (id, name, email, role, verified, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin User',
  'admin@nwi-b2b.com',
  'admin',
  true,
  'active'
);
```

### 2. Create Sample Data
```sql
-- Sample wholesaler
INSERT INTO users (id, name, email, role, business_name, phone, verified, status)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'John Wholesaler',
  'wholesaler@example.com',
  'wholesaler',
  'Wholesale Co',
  '+27123456789',
  true,
  'active'
);

-- Sample products
INSERT INTO products (wholesaler_id, name, description, price, stock, category)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'Sample Product 1', 'Description', 99.99, 100, 'Electronics'),
  ('00000000-0000-0000-0000-000000000002', 'Sample Product 2', 'Description', 149.99, 50, 'Clothing');
```

This migration system ensures your database schema stays consistent across environments and team members.