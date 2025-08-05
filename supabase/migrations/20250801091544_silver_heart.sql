/*
  # Initial Database Schema for NWI B2B Platform

  1. New Tables
    - `users` - Store user accounts (wholesalers, retailers, admins, support)
    - `products` - Store product catalog from wholesalers
    - `orders` - Store order transactions between retailers and wholesalers
    - `order_items` - Store individual items within orders
    - `support_tickets` - Store customer support tickets
    - `promotions` - Store promotional campaigns from wholesalers
    - `return_requests` - Store product return requests
    - `return_items` - Store individual items within return requests
    - `pending_users` - Store user registration requests awaiting approval
    - `platform_settings` - Store platform configuration settings

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure data access based on user roles and ownership

  3. Features
    - UUID primary keys for all tables
    - Timestamps for audit trails
    - Proper foreign key relationships
    - Indexes for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Pending users table for registration approvals
CREATE TABLE IF NOT EXISTS pending_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('wholesaler', 'retailer')),
  business_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  registration_reason text NOT NULL,
  documents text[] DEFAULT '{}',
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wholesaler_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price > 0),
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
  total decimal(10,2) NOT NULL CHECK (total > 0),
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
  price decimal(10,2) NOT NULL CHECK (price > 0),
  total decimal(10,2) NOT NULL CHECK (total > 0),
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

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wholesaler_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  discount decimal(5,2) NOT NULL CHECK (discount > 0 AND discount <= 100),
  valid_from timestamptz NOT NULL,
  valid_to timestamptz NOT NULL,
  active boolean DEFAULT false,
  product_ids uuid[] NOT NULL DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (valid_to > valid_from)
);

-- Return requests table
CREATE TABLE IF NOT EXISTS return_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  retailer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wholesaler_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  requested_amount decimal(10,2) NOT NULL CHECK (requested_amount > 0),
  approved_amount decimal(10,2),
  images text[] DEFAULT '{}',
  processed_by uuid REFERENCES users(id),
  processed_at timestamptz,
  rejection_reason text,
  refund_method text CHECK (refund_method IN ('original_payment', 'store_credit', 'bank_transfer')),
  tracking_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Return items table
CREATE TABLE IF NOT EXISTS return_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_request_id uuid NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  reason text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('damaged', 'defective', 'wrong_item', 'not_as_described', 'other')),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price > 0),
  total_refund decimal(10,2) NOT NULL CHECK (total_refund > 0),
  created_at timestamptz DEFAULT now()
);

-- Platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
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
CREATE INDEX IF NOT EXISTS idx_promotions_wholesaler ON promotions(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for products table
CREATE POLICY "Anyone can read available products" ON products
  FOR SELECT TO authenticated
  USING (available = true);

CREATE POLICY "Wholesalers can manage own products" ON products
  FOR ALL TO authenticated
  USING (
    wholesaler_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

-- RLS Policies for orders table
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (
    retailer_id = auth.uid() OR 
    wholesaler_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

CREATE POLICY "Retailers can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    retailer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'retailer'
    )
  );

CREATE POLICY "Order participants can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (
    retailer_id = auth.uid() OR 
    wholesaler_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

-- RLS Policies for order_items table
CREATE POLICY "Users can read order items for their orders" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id AND (
        retailer_id = auth.uid() OR 
        wholesaler_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
      )
    )
  );

CREATE POLICY "Retailers can create order items" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id AND retailer_id = auth.uid()
    )
  );

-- RLS Policies for support_tickets table
CREATE POLICY "Users can read own tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Support can update tickets" ON support_tickets
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

-- RLS Policies for promotions table
CREATE POLICY "Anyone can read approved promotions" ON promotions
  FOR SELECT TO authenticated
  USING (
    status = 'approved' OR
    wholesaler_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

CREATE POLICY "Wholesalers can manage own promotions" ON promotions
  FOR ALL TO authenticated
  USING (
    wholesaler_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for return_requests table
CREATE POLICY "Users can read own return requests" ON return_requests
  FOR SELECT TO authenticated
  USING (
    retailer_id = auth.uid() OR 
    wholesaler_id = auth.uid() OR
    processed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

CREATE POLICY "Retailers can create return requests" ON return_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    retailer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'retailer'
    )
  );

CREATE POLICY "Support can update return requests" ON return_requests
  FOR UPDATE TO authenticated
  USING (
    retailer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

-- RLS Policies for return_items table
CREATE POLICY "Users can read return items for their requests" ON return_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM return_requests 
      WHERE id = return_items.return_request_id AND (
        retailer_id = auth.uid() OR 
        wholesaler_id = auth.uid() OR
        processed_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'support')
        )
      )
    )
  );

CREATE POLICY "Retailers can create return items" ON return_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM return_requests 
      WHERE id = return_items.return_request_id AND retailer_id = auth.uid()
    )
  );

-- RLS Policies for pending_users table
CREATE POLICY "Admins can manage pending users" ON pending_users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for platform_settings table
CREATE POLICY "Admins can manage platform settings" ON platform_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert initial platform settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('user_registration_enabled', 'true', 'Enable new user registrations'),
  ('email_notifications_enabled', 'true', 'Enable email notifications'),
  ('auto_approve_promotions', 'false', 'Automatically approve promotions'),
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('commission_rate', '5', 'Platform commission rate percentage'),
  ('minimum_order_value', '100', 'Minimum order value in currency'),
  ('max_products_per_wholesaler', '1000', 'Maximum products per wholesaler'),
  ('support_response_time', '24', 'Support response time in hours'),
  ('two_factor_required', 'false', 'Require two-factor authentication'),
  ('data_encryption_enabled', 'true', 'Enable data encryption'),
  ('audit_logging_enabled', 'true', 'Enable audit logging')
ON CONFLICT (key) DO NOTHING;

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_return_requests_updated_at BEFORE UPDATE ON return_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();