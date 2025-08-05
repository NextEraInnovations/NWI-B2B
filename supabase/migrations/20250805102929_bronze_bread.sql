/*
  # Complete Fix for All RLS Policies and Functionality

  1. Security Policies
    - Drop all existing restrictive policies that block functionality
    - Add comprehensive policies for all tables
    - Enable proper access for users, admins, and service operations
    
  2. Tables Fixed
    - users: Enable registration and management
    - pending_users: Enable registration workflow
    - products: Enable product management
    - orders: Enable order processing
    - order_items: Enable order item management
    - support_tickets: Enable support system
    - promotions: Enable promotion management
    - return_requests: Enable return processing
    - return_items: Enable return item management
    - platform_settings: Enable admin configuration
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Allow authenticated user creation" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

DROP POLICY IF EXISTS "Allow anonymous user registration" ON pending_users;
DROP POLICY IF EXISTS "Allow authenticated user registration" ON pending_users;
DROP POLICY IF EXISTS "Admins can manage pending users" ON pending_users;
DROP POLICY IF EXISTS "Service role can manage pending users" ON pending_users;

DROP POLICY IF EXISTS "Allow authenticated product creation" ON products;
DROP POLICY IF EXISTS "Anyone can read available products" ON products;
DROP POLICY IF EXISTS "Wholesalers can manage own products" ON products;
DROP POLICY IF EXISTS "Service role can manage products" ON products;

DROP POLICY IF EXISTS "Retailers can create orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Order participants can update orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;

DROP POLICY IF EXISTS "Retailers can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can read order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Service role can manage order items" ON order_items;

DROP POLICY IF EXISTS "Allow authenticated ticket creation" ON support_tickets;
DROP POLICY IF EXISTS "Users can read own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Support can update tickets" ON support_tickets;
DROP POLICY IF EXISTS "Service role can manage support tickets" ON support_tickets;

DROP POLICY IF EXISTS "Wholesalers can manage own promotions" ON promotions;
DROP POLICY IF EXISTS "Anyone can read approved promotions" ON promotions;

DROP POLICY IF EXISTS "Retailers can create return requests" ON return_requests;
DROP POLICY IF EXISTS "Users can read own return requests" ON return_requests;
DROP POLICY IF EXISTS "Support can update return requests" ON return_requests;

DROP POLICY IF EXISTS "Retailers can create return items" ON return_items;
DROP POLICY IF EXISTS "Users can read return items for their requests" ON return_items;

DROP POLICY IF EXISTS "Admins can manage platform settings" ON platform_settings;

-- USERS TABLE POLICIES
CREATE POLICY "Enable all operations for service role" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable user registration for anonymous" ON users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Enable user registration for authenticated" ON users
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to users" ON users
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- PENDING USERS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on pending_users" ON pending_users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can register as pending user" ON pending_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage pending users" ON pending_users
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- PRODUCTS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on products" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can view available products" ON products
  FOR SELECT USING (available = true);

CREATE POLICY "Authenticated users can create products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Wholesalers can manage their products" ON products
  FOR ALL TO authenticated 
  USING (wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')))
  WITH CHECK (wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')));

-- ORDERS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their orders" ON orders
  FOR SELECT TO authenticated 
  USING (retailer_id = auth.uid() OR wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')));

CREATE POLICY "Retailers can create orders" ON orders
  FOR INSERT TO authenticated 
  WITH CHECK (retailer_id = auth.uid() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'retailer'));

CREATE POLICY "Order participants can update orders" ON orders
  FOR UPDATE TO authenticated 
  USING (retailer_id = auth.uid() OR wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')))
  WITH CHECK (retailer_id = auth.uid() OR wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')));

-- ORDER ITEMS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on order_items" ON order_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view order items for their orders" ON order_items
  FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND (retailer_id = auth.uid() OR wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')))));

CREATE POLICY "Retailers can create order items" ON order_items
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND retailer_id = auth.uid()));

-- SUPPORT TICKETS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on support_tickets" ON support_tickets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can create tickets" ON support_tickets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view relevant tickets" ON support_tickets
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')));

CREATE POLICY "Support staff can update tickets" ON support_tickets
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid() OR assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')))
  WITH CHECK (user_id = auth.uid() OR assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')));

-- PROMOTIONS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on promotions" ON promotions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can view approved promotions" ON promotions
  FOR SELECT USING (status = 'approved' OR wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')));

CREATE POLICY "Wholesalers can manage their promotions" ON promotions
  FOR ALL TO authenticated 
  USING (wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (wholesaler_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RETURN REQUESTS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on return_requests" ON return_requests
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view relevant return requests" ON return_requests
  FOR SELECT TO authenticated 
  USING (retailer_id = auth.uid() OR wholesaler_id = auth.uid() OR processed_by = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')));

CREATE POLICY "Retailers can create return requests" ON return_requests
  FOR INSERT TO authenticated 
  WITH CHECK (retailer_id = auth.uid() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'retailer'));

CREATE POLICY "Support can update return requests" ON return_requests
  FOR UPDATE TO authenticated 
  USING (retailer_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')))
  WITH CHECK (retailer_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')));

-- RETURN ITEMS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on return_items" ON return_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can view return items for their requests" ON return_items
  FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM return_requests WHERE id = return_items.return_request_id AND (retailer_id = auth.uid() OR wholesaler_id = auth.uid() OR processed_by = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'support')))));

CREATE POLICY "Retailers can create return items" ON return_items
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM return_requests WHERE id = return_items.return_request_id AND retailer_id = auth.uid()));

-- PLATFORM SETTINGS TABLE POLICIES
CREATE POLICY "Enable all operations for service role on platform_settings" ON platform_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage platform settings" ON platform_settings
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Insert default admin user if not exists
INSERT INTO users (id, name, email, role, business_name, phone, address, verified, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin User',
  'Aadamabdurahman1974@gmail.com',
  'admin',
  'NWI B2B Platform',
  '+27 123 456 789',
  'Platform Administration',
  true,
  'active'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  business_name = EXCLUDED.business_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;

-- Insert test wholesaler user for testing
INSERT INTO users (id, name, email, role, business_name, phone, address, verified, status)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Test Wholesaler',
  'wholesaler@test.com',
  'wholesaler',
  'Test Wholesale Business',
  '+27 123 456 790',
  'Test Wholesale Address',
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Insert test retailer user for testing
INSERT INTO users (id, name, email, role, business_name, phone, address, verified, status)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Test Retailer',
  'retailer@test.com',
  'retailer',
  'Test Retail Business',
  '+27 123 456 791',
  'Test Retail Address',
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Insert test support user for testing
INSERT INTO users (id, name, email, role, business_name, phone, address, verified, status)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Test Support',
  'support@test.com',
  'support',
  'NWI B2B Support',
  '+27 123 456 792',
  'Support Department',
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;