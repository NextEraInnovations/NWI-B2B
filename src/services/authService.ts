import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
}

export class AuthService {
  // Sign up new user
  static async signUp(email: string, password: string, userData: {
    name: string;
    role: 'wholesaler' | 'retailer';
    businessName: string;
    phone: string;
    address: string;
  }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          business_name: userData.businessName,
          phone: userData.phone,
          address: userData.address
        }
      }
    });

    if (error) throw error;
    return data;
  }

  // Sign in existing user
  static async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      // Demo mode - simulate authentication
      return {
        user: { id: 'demo-user', email },
        session: { access_token: 'demo-token' }
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  // Sign out user
  static async signOut() {
    if (!isSupabaseConfigured) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current session
  static async getCurrentSession() {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Get current user
  static async getCurrentUser() {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Listen for auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  }

  // Get user profile from database
  static async getUserProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      businessName: data.business_name,
      phone: data.phone,
      address: data.address,
      verified: data.verified,
      status: data.status,
      createdAt: data.created_at
    };
  }

  // Create or update user profile in database
  static async upsertUserProfile(authUser: AuthUser): Promise<User> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const userData = {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email.split('@')[0],
      email: authUser.email,
      role: authUser.user_metadata?.role || 'retailer',
      business_name: authUser.user_metadata?.business_name || '',
      phone: authUser.user_metadata?.phone || '',
      address: authUser.user_metadata?.address || '',
      verified: true,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      businessName: data.business_name,
      phone: data.phone,
      address: data.address,
      verified: data.verified,
      status: data.status,
      createdAt: data.created_at
    };
  }
}