# Complete Supabase Setup & Operation Guide

## 🚀 Initial Database Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Set project name: "NWI B2B Platform"
5. Set database password (save this securely!)
6. Choose region closest to your users
7. Click "Create new project"

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: `eyJ...` (long string)
3. Update your `.env` file with these values

### Step 3: Run Database Migrations
Your project includes pre-built migration files. Run them in this exact order:

#### Migration 1: Core Tables Setup
```sql
-- Go to SQL Editor in Supabase Dashboard
-- Copy and paste this content from supabase/migrations/20250801091544_silver_heart.sql

/*
  # Initial Schema Setup

  1. New Tables
    - `users` - User accounts and profiles
    - `products` - Product catalog
    - `orders` & `order_items` - Order management
    - `support_tickets` - Customer support
  
  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('wholesaler', 'retailer', 'admin', 'support')),
  business_name text,
  phone text,
  address text,
  verified boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wholesaler_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price > 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_order_quantity integer NOT NULL DEFAULT 1 CHECK (min_order_quantity > 0),
  category text NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  retailer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wholesaler_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total numeric(10,2) NOT NULL CHECK (total > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'ready', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  pickup_time timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price > 0),
  total numeric(10,2) NOT NULL CHECK (total > 0),
  created_at timestamptz DEFAULT now()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_wholesaler ON products(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_orders_retailer ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_wholesaler ON orders(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- Add update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Migration 2: Add Remaining Tables
```sql
-- Copy and paste this content from your other migration files
-- This adds promotions, return requests, pending users, and platform settings tables
-- Run each migration file in chronological order
```

## 🔐 Setting Up Row Level Security (RLS)

### Understanding RLS Policies
RLS ensures users can only access data they're authorized to see. Your app uses these policies:

#### Users Table Policies
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (uid() = id)
  WITH CHECK (uid() = id);

-- Admins have full access
CREATE POLICY "Admins have full access to users" ON users
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = uid() AND role = 'admin'
  ));
```

#### Products Table Policies
```sql
-- Anyone can view available products
CREATE POLICY "Anyone can view available products" ON products
  FOR SELECT TO public
  USING (available = true);

-- Wholesalers can manage their products
CREATE POLICY "Wholesalers can manage their products" ON products
  FOR ALL TO authenticated
  USING (wholesaler_id = uid() OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = uid() AND role IN ('admin', 'support')
  ));
```

## 📊 Real-time Features Setup

### 1. Enable Real-time
In your Supabase dashboard:
1. Go to **Database > Replication**
2. Enable replication for these tables:
   - users
   - products
   - orders
   - order_items
   - support_tickets
   - promotions
   - return_requests

### 2. How Real-time Works in Your App
Your app automatically subscribes to changes:

```typescript
// This happens automatically in useSupabaseData.ts
supabase
  .channel('products-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'products' 
  }, (payload) => {
    // Updates UI automatically
    console.log('Product updated:', payload);
  })
  .subscribe();
```

## 🔧 Database Management

### 1. Viewing Data
**Supabase Dashboard:**
- Go to **Table Editor**
- Select any table to view/edit data
- Use filters to find specific records

**SQL Editor:**
```sql
-- View all users
SELECT * FROM users ORDER BY created_at DESC;

-- View products with wholesaler info
SELECT p.*, u.name as wholesaler_name 
FROM products p 
JOIN users u ON p.wholesaler_id = u.id;

-- View orders with customer details
SELECT o.*, u.name as customer_name, u.business_name
FROM orders o
JOIN users u ON o.retailer_id = u.id
ORDER BY o.created_at DESC;
```

### 2. Common Operations

**Approve a Pending User:**
```sql
-- Move from pending_users to users table
INSERT INTO users (name, email, role, business_name, phone, address, verified, status)
SELECT name, email, role, business_name, phone, address, true, 'active'
FROM pending_users 
WHERE id = 'pending-user-id';

-- Update pending user status
UPDATE pending_users 
SET status = 'approved', reviewed_at = now(), reviewed_by = 'admin-user-id'
WHERE id = 'pending-user-id';
```

**Update Product Stock:**
```sql
UPDATE products 
SET stock = stock - 10 
WHERE id = 'product-id';
```

**Change Order Status:**
```sql
UPDATE orders 
SET status = 'completed', updated_at = now()
WHERE id = 'order-id';
```

## 🔔 Authentication Configuration

### 1. Auth Settings
In Supabase Dashboard > Authentication > Settings:

**Site URL:** `http://localhost:5173` (development) or your production URL

**Redirect URLs:** Add these for production:
- `https://your-domain.com`
- `https://your-domain.com/auth/callback`

**Email Templates:** Customize signup confirmation emails

### 2. User Registration Flow
1. User fills registration form in your app
2. Creates record in `pending_users` table
3. Admin reviews and approves/rejects
4. If approved, user is moved to `users` table
5. User can then login normally

## 📈 Analytics & Monitoring

### 1. Built-in Analytics
Your app includes comprehensive analytics:
- Sales performance by wholesaler
- Customer behavior tracking
- Product performance metrics
- Payment method analytics

### 2. Database Functions
Your app can use stored procedures for complex analytics:

```sql
-- Example: Get wholesaler performance
CREATE OR REPLACE FUNCTION get_wholesaler_analytics(wholesaler_uuid uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_revenue', COALESCE(SUM(o.total), 0),
    'total_orders', COUNT(o.id),
    'unique_customers', COUNT(DISTINCT o.retailer_id)
  ) INTO result
  FROM orders o
  WHERE o.wholesaler_id = wholesaler_uuid
    AND o.status != 'cancelled';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## 🛡️ Security Best Practices

### 1. Environment Variables
Never expose these in your code:
- `VITE_SUPABASE_URL` - Safe to expose (public)
- `VITE_SUPABASE_ANON_KEY` - Safe to expose (public)
- Service role key - NEVER expose in frontend

### 2. RLS Policies
Always test your policies:
```sql
-- Test as different user types
SET request.jwt.claims TO '{"sub": "user-id", "role": "authenticated"}';
SELECT * FROM products; -- Should only show allowed products
```

### 3. API Security
- Use RLS instead of API-level security
- Validate all inputs
- Use prepared statements
- Monitor for unusual activity

## 🔄 Backup & Recovery

### 1. Automatic Backups
Supabase automatically backs up your database daily.

### 2. Manual Backup
```sql
-- Export specific table data
COPY users TO '/tmp/users_backup.csv' WITH CSV HEADER;
```

### 3. Point-in-Time Recovery
Available in Supabase Pro plan for critical data recovery.

## 📱 Mobile & PWA Features

Your app includes:
- **Service Worker**: Offline functionality
- **Push Notifications**: Real-time alerts
- **Local Storage**: Cart persistence
- **Responsive Design**: Works on all devices

## 🚨 Troubleshooting Common Issues

### Connection Problems
```bash
# Test connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/users?select=count"
```

### RLS Issues
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View existing policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Performance Issues
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);
```

## 📊 Monitoring Your Database

### 1. Supabase Dashboard Metrics
- **Database**: Monitor connections, queries, and performance
- **API**: Track API usage and response times
- **Auth**: Monitor user signups and logins
- **Storage**: Track file uploads and bandwidth

### 2. Custom Monitoring
```sql
-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';
```

## 🔧 Advanced Configuration

### 1. Custom Functions
Create stored procedures for complex business logic:

```sql
-- Example: Calculate order totals with promotions
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid uuid)
RETURNS numeric AS $$
DECLARE
  total_amount numeric := 0;
BEGIN
  SELECT SUM(oi.total) INTO total_amount
  FROM order_items oi
  WHERE oi.order_id = order_uuid;
  
  RETURN COALESCE(total_amount, 0);
END;
$$ LANGUAGE plpgsql;
```

### 2. Database Triggers
Automate business logic:

```sql
-- Auto-update order totals when items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders 
  SET total = calculate_order_total(NEW.order_id),
      updated_at = now()
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_total
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_order_total();
```

## 📧 Email Configuration

### 1. SMTP Settings
In Supabase Dashboard > Authentication > Settings:
- Configure custom SMTP for branded emails
- Set up email templates for:
  - User confirmation
  - Password reset
  - Order notifications

### 2. Email Templates
Customize in Authentication > Email Templates:
- **Confirm signup**: Welcome new users
- **Reset password**: Password recovery
- **Magic link**: Alternative login method

## 🚀 Production Deployment

### 1. Environment Setup
```env
# Production .env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

### 2. Security Checklist
- [ ] RLS enabled on all tables
- [ ] Policies tested for all user roles
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled

### 3. Performance Optimization
```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created 
ON orders(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_available 
ON products(category, available) WHERE available = true;

-- Analyze table statistics
ANALYZE users;
ANALYZE products;
ANALYZE orders;
```

## 🔍 Debugging Guide

### 1. Check Logs
In Supabase Dashboard > Logs:
- **API Logs**: See all API requests
- **Database Logs**: Monitor queries and errors
- **Auth Logs**: Track authentication events

### 2. Common Error Solutions

**"relation does not exist"**
- Run all migration files
- Check table names match exactly

**"permission denied"**
- Check RLS policies
- Verify user authentication
- Test with different user roles

**"connection timeout"**
- Check network connectivity
- Verify Supabase project is active
- Check for rate limiting

### 3. Testing Queries
```sql
-- Test as specific user
SELECT auth.uid(); -- Current user ID
SELECT * FROM users WHERE id = auth.uid(); -- Current user data

-- Test RLS policies
SET request.jwt.claims TO '{"sub": "test-user-id"}';
SELECT * FROM products; -- Should respect RLS
```

This guide covers the essential operations for your Supabase database. The key is understanding that your app is designed to work seamlessly with Supabase's real-time features, authentication, and security model.