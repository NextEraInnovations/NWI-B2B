import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using demo mode.');
}

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://demo.supabase.co', 'demo-key');

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'wholesaler' | 'retailer' | 'admin' | 'support';
          business_name: string | null;
          phone: string | null;
          address: string | null;
          verified: boolean;
          status: 'active' | 'pending' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'wholesaler' | 'retailer' | 'admin' | 'support';
          business_name?: string | null;
          phone?: string | null;
          address?: string | null;
          verified?: boolean;
          status?: 'active' | 'pending' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'wholesaler' | 'retailer' | 'admin' | 'support';
          business_name?: string | null;
          phone?: string | null;
          address?: string | null;
          verified?: boolean;
          status?: 'active' | 'pending' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          wholesaler_id: string;
          name: string;
          description: string;
          price: number;
          stock: number;
          min_order_quantity: number;
          category: string;
          image_url: string | null;
          available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wholesaler_id: string;
          name: string;
          description: string;
          price: number;
          stock?: number;
          min_order_quantity?: number;
          category: string;
          image_url?: string | null;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wholesaler_id?: string;
          name?: string;
          description?: string;
          price?: number;
          stock?: number;
          min_order_quantity?: number;
          category?: string;
          image_url?: string | null;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          retailer_id: string;
          wholesaler_id: string;
          total: number;
          status: 'pending' | 'accepted' | 'ready' | 'completed' | 'cancelled';
          payment_status: 'pending' | 'paid' | 'failed';
          pickup_time: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          retailer_id: string;
          wholesaler_id: string;
          total: number;
          status?: 'pending' | 'accepted' | 'ready' | 'completed' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'failed';
          pickup_time?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          retailer_id?: string;
          wholesaler_id?: string;
          total?: number;
          status?: 'pending' | 'accepted' | 'ready' | 'completed' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'failed';
          pickup_time?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          price: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          price: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          price?: number;
          total?: number;
          created_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          subject: string;
          description: string;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_name: string;
          subject: string;
          description: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_name?: string;
          subject?: string;
          description?: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      promotions: {
        Row: {
          id: string;
          wholesaler_id: string;
          title: string;
          description: string;
          discount: number;
          valid_from: string;
          valid_to: string;
          active: boolean;
          product_ids: string[];
          status: 'pending' | 'approved' | 'rejected';
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wholesaler_id: string;
          title: string;
          description: string;
          discount: number;
          valid_from: string;
          valid_to: string;
          active?: boolean;
          product_ids: string[];
          status?: 'pending' | 'approved' | 'rejected';
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wholesaler_id?: string;
          title?: string;
          description?: string;
          discount?: number;
          valid_from?: string;
          valid_to?: string;
          active?: boolean;
          product_ids?: string[];
          status?: 'pending' | 'approved' | 'rejected';
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      return_requests: {
        Row: {
          id: string;
          order_id: string;
          retailer_id: string;
          wholesaler_id: string;
          reason: string;
          description: string;
          status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          requested_amount: number;
          approved_amount: number | null;
          images: string[];
          processed_by: string | null;
          processed_at: string | null;
          rejection_reason: string | null;
          refund_method: 'original_payment' | 'store_credit' | 'bank_transfer' | null;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          retailer_id: string;
          wholesaler_id: string;
          reason: string;
          description: string;
          status?: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          requested_amount: number;
          approved_amount?: number | null;
          images?: string[];
          processed_by?: string | null;
          processed_at?: string | null;
          rejection_reason?: string | null;
          refund_method?: 'original_payment' | 'store_credit' | 'bank_transfer' | null;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          retailer_id?: string;
          wholesaler_id?: string;
          reason?: string;
          description?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          requested_amount?: number;
          approved_amount?: number | null;
          images?: string[];
          processed_by?: string | null;
          processed_at?: string | null;
          rejection_reason?: string | null;
          refund_method?: 'original_payment' | 'store_credit' | 'bank_transfer' | null;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      return_items: {
        Row: {
          id: string;
          return_request_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          reason: string;
          condition: 'damaged' | 'defective' | 'wrong_item' | 'not_as_described' | 'other';
          unit_price: number;
          total_refund: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          return_request_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          reason: string;
          condition: 'damaged' | 'defective' | 'wrong_item' | 'not_as_described' | 'other';
          unit_price: number;
          total_refund: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          return_request_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          reason?: string;
          condition?: 'damaged' | 'defective' | 'wrong_item' | 'not_as_described' | 'other';
          unit_price?: number;
          total_refund?: number;
          created_at?: string;
        };
      };
      pending_users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'wholesaler' | 'retailer';
          business_name: string;
          phone: string;
          address: string;
          registration_reason: string;
          documents: string[];
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'wholesaler' | 'retailer';
          business_name: string;
          phone: string;
          address: string;
          registration_reason: string;
          documents?: string[];
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'wholesaler' | 'retailer';
          business_name?: string;
          phone?: string;
          address?: string;
          registration_reason?: string;
          documents?: string[];
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
        };
      };
      platform_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}