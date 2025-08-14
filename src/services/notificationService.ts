export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export class NotificationService {
  private static isInitialized = false;
  private static registration: ServiceWorkerRegistration | null = null;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('🔔 Notification permission:', permission);
        
        if (permission === 'granted') {
          console.log('✅ Push notifications enabled');
        } else {
          console.warn('⚠️ Push notifications denied by user');
        }
      }

      // Register service worker for push notifications
      if ('serviceWorker' in navigator) {
        try {
          this.registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registered:', this.registration);
        } catch (error) {
          console.warn('⚠️ Service Worker registration failed:', error);
        }
      }

      this.isInitialized = true;
      console.log('🚀 Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  static async sendPushNotification(options: PushNotificationOptions): Promise<void> {
    try {
      // Check if notifications are supported and permitted
      if (!('Notification' in window)) {
        console.warn('⚠️ This browser does not support notifications');
        return;
      }

      if (Notification.permission !== 'granted') {
        console.warn('⚠️ Notification permission not granted');
        return;
      }

      // Create notification
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Handle navigation based on notification data
        if (options.data) {
          this.handleNotificationClick(options.data);
        }
        
        notification.close();
      };

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      console.log('🔔 Push notification sent:', options.title);
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
    }
  }

  static handleNotificationClick(data: any): void {
    try {
      // Navigate based on notification type
      switch (data.type) {
        case 'order':
          // Navigate to orders page
          window.dispatchEvent(new CustomEvent('navigate', { 
            detail: { tab: 'orders', data: { orderId: data.orderId } }
          }));
          break;
        case 'product':
          // Navigate to products page
          window.dispatchEvent(new CustomEvent('navigate', { 
            detail: { tab: 'browse', data: { productId: data.productId } }
          }));
          break;
        case 'promotion':
          // Navigate to promotions page
          window.dispatchEvent(new CustomEvent('navigate', { 
            detail: { tab: 'browse', data: { promotionId: data.promotionId } }
          }));
          break;
        case 'support':
          // Navigate to support page
          window.dispatchEvent(new CustomEvent('navigate', { 
            detail: { tab: 'support', data: { ticketId: data.ticketId } }
          }));
          break;
        case 'return':
          // Navigate to returns page
          window.dispatchEvent(new CustomEvent('navigate', { 
            detail: { tab: 'returns', data: { returnId: data.returnId } }
          }));
          break;
        default:
          console.log('🔔 Notification clicked:', data);
      }
    } catch (error) {
      console.error('❌ Failed to handle notification click:', error);
    }
  }

  static async sendBroadcastNotification(
    title: string, 
    message: string, 
    targetRoles?: string[], 
    targetUsers?: string[]
  ): Promise<void> {
    try {
      // Send push notification to all targeted users
      const pushOptions: PushNotificationOptions = {
        title: `📢 ${title}`,
        body: message,
        icon: '/favicon.ico',
        tag: 'broadcast',
        requireInteraction: true,
        data: { type: 'broadcast', timestamp: Date.now() }
      };

      await this.sendPushNotification(pushOptions);
      
      // Dispatch custom event for app-level handling
      window.dispatchEvent(new CustomEvent('broadcast-notification', {
        detail: { title, message, targetRoles, targetUsers }
      }));

      console.log('📢 Broadcast notification sent:', title);
    } catch (error) {
      console.error('❌ Failed to send broadcast notification:', error);
    }
  }

  static async sendTargetedNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    data?: any
  ): Promise<void> {
    try {
      const pushOptions: PushNotificationOptions = {
        title,
        body: message,
        icon: '/favicon.ico',
        tag: `${type}-${userId}`,
        data: { ...data, type, userId }
      };

      await this.sendPushNotification(pushOptions);
      
      console.log('🎯 Targeted notification sent:', title, 'to user:', userId);
    } catch (error) {
      console.error('❌ Failed to send targeted notification:', error);
    }
  }

  static getPermissionStatus(): NotificationPermission {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }

  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }
}