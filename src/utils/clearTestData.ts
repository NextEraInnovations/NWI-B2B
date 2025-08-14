import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class DatabaseCleaner {
  static async clearAllProducts(): Promise<void> {
    try {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Cannot clear database products.');
        return;
      }

      console.log('🗑️ Clearing all products from database...');

      // Delete all products from the database
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products (using a condition that matches all)

      if (error) {
        console.error('❌ Error clearing products:', error);
        throw error;
      }

      console.log('✅ All products cleared from database successfully');
    } catch (error) {
      console.error('❌ Failed to clear products from database:', error);
      throw error;
    }
  }

  static async clearAllTestData(): Promise<void> {
    try {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Cannot clear database.');
        return;
      }

      console.log('🗑️ Clearing all test data from database...');

      // Clear products
      await this.clearAllProducts();

      // Clear orders and order items
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (orderItemsError) {
        console.error('❌ Error clearing order items:', orderItemsError);
      } else {
        console.log('✅ Order items cleared');
      }

      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (ordersError) {
        console.error('❌ Error clearing orders:', ordersError);
      } else {
        console.log('✅ Orders cleared');
      }

      // Clear promotions
      const { error: promotionsError } = await supabase
        .from('promotions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (promotionsError) {
        console.error('❌ Error clearing promotions:', promotionsError);
      } else {
        console.log('✅ Promotions cleared');
      }

      // Clear support tickets
      const { error: ticketsError } = await supabase
        .from('support_tickets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (ticketsError) {
        console.error('❌ Error clearing support tickets:', ticketsError);
      } else {
        console.log('✅ Support tickets cleared');
      }

      // Clear return requests and items
      const { error: returnItemsError } = await supabase
        .from('return_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (returnItemsError) {
        console.error('❌ Error clearing return items:', returnItemsError);
      } else {
        console.log('✅ Return items cleared');
      }

      const { error: returnRequestsError } = await supabase
        .from('return_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (returnRequestsError) {
        console.error('❌ Error clearing return requests:', returnRequestsError);
      } else {
        console.log('✅ Return requests cleared');
      }

      console.log('🎉 All test data cleared from database successfully!');
    } catch (error) {
      console.error('❌ Failed to clear test data from database:', error);
      throw error;
    }
  }

  static async runCleanup(): Promise<void> {
    try {
      console.log('🚀 Starting database cleanup...');
      await this.clearAllProducts();
      console.log('✅ Database cleanup completed successfully!');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
    }
  }
}

// Auto-run cleanup when this file is imported in development
if (import.meta.env.DEV) {
  console.log('🗑️ Development mode detected - clearing test products from database...');
  setTimeout(() => {
    DatabaseCleaner.runCleanup();
  }, 2000); // Wait 2 seconds for app initialization
}