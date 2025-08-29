// Local Storage utilities for offline data persistence
export class LocalStorageService {
  private static readonly STORAGE_KEYS = {
    USER_SESSION: 'nwi_user_session',
    CART_DATA: 'nwi_cart_data',
    DRAFT_PRODUCTS: 'nwi_draft_products',
    DRAFT_ORDERS: 'nwi_draft_orders',
    OFFLINE_ACTIONS: 'nwi_offline_actions',
    LAST_SYNC: 'nwi_last_sync'
  };

  // User session management
  static saveUserSession(user: any) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER_SESSION, JSON.stringify({
        user,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save user session:', error);
    }
  }

  static getUserSession() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_SESSION);
      if (stored) {
        const { user, timestamp } = JSON.parse(stored);
        // Check if session is less than 7 days old
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          return user;
        }
      }
    } catch (error) {
      console.error('Failed to get user session:', error);
    }
    return null;
  }

  static clearUserSession() {
    localStorage.removeItem(this.STORAGE_KEYS.USER_SESSION);
  }

  // Cart data persistence
  static saveCartData(cart: { [productId: string]: number }) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CART_DATA, JSON.stringify({
        cart,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save cart data:', error);
    }
  }

  static getCartData(): { [productId: string]: number } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CART_DATA);
      if (stored) {
        const { cart, timestamp } = JSON.parse(stored);
        // Check if cart is less than 24 hours old
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return cart;
        }
      }
    } catch (error) {
      console.error('Failed to get cart data:', error);
    }
    return {};
  }

  static clearCartData() {
    localStorage.removeItem(this.STORAGE_KEYS.CART_DATA);
  }

  // Draft data for offline editing
  static saveDraftProducts(products: any[]) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.DRAFT_PRODUCTS, JSON.stringify({
        products,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save draft products:', error);
    }
  }

  static getDraftProducts(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.DRAFT_PRODUCTS);
      if (stored) {
        const { products } = JSON.parse(stored);
        return products || [];
      }
    } catch (error) {
      console.error('Failed to get draft products:', error);
    }
    return [];
  }

  // Offline actions queue
  static saveOfflineAction(action: any) {
    try {
      const existing = this.getOfflineActions();
      existing.push({
        ...action,
        timestamp: Date.now(),
        id: Date.now().toString()
      });
      localStorage.setItem(this.STORAGE_KEYS.OFFLINE_ACTIONS, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save offline action:', error);
    }
  }

  static getOfflineActions(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.OFFLINE_ACTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get offline actions:', error);
      return [];
    }
  }

  static clearOfflineActions() {
    localStorage.removeItem(this.STORAGE_KEYS.OFFLINE_ACTIONS);
  }

  // Sync timestamp
  static updateLastSync() {
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  }

  static getLastSync(): number {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
      return stored ? parseInt(stored) : 0;
    } catch (error) {
      return 0;
    }
  }

  // Clear all stored data
  static clearAll() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}