# Real-time Features Setup Guide

## 🔄 Real-time Architecture

Your NWI B2B Platform uses Supabase's real-time features to provide live updates across all connected users. Here's how it works:

### 1. Real-time Components
- **Database Changes**: Live updates when data changes
- **User Presence**: See who's online
- **Live Notifications**: Instant alerts for important events
- **Cart Synchronization**: Real-time cart updates
- **Order Status**: Live order tracking

### 2. How It's Implemented
```typescript
// Your app automatically subscribes to changes
const channel = supabase
  .channel('products-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'products' 
  }, (payload) => {
    // Automatically updates UI
    handleProductUpdate(payload);
  })
  .subscribe();
```

## 🚀 Enabling Real-time in Supabase

### Step 1: Enable Replication
1. Go to your Supabase Dashboard
2. Navigate to **Database > Replication**
3. Enable replication for these tables:

**Essential Tables:**
- ✅ users
- ✅ products  
- ✅ orders
- ✅ order_items
- ✅ support_tickets
- ✅ promotions
- ✅ return_requests
- ✅ return_items
- ✅ pending_users

### Step 2: Configure Publications
```sql
-- Check current publications
SELECT * FROM pg_publication;

-- Add tables to publication (if needed)
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE promotions;
ALTER PUBLICATION supabase_realtime ADD TABLE return_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE return_items;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_users;
```

### Step 3: Test Real-time Connection
```sql
-- In SQL Editor, run this to test
SELECT 'Real-time test' as message, now() as timestamp;
```

## 📡 Real-time Event Types

### 1. Database Events
Your app listens for these events:

**INSERT Events:**
- New user registration
- New product added
- New order placed
- New support ticket created
- New promotion submitted

**UPDATE Events:**
- Order status changes
- Product stock updates
- User profile changes
- Ticket status updates
- Promotion approvals

**DELETE Events:**
- Product removal
- Order cancellation
- Ticket closure

### 2. Event Handling
```typescript
// Example: Product updates
supabase
  .channel('products-changes')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'products' 
  }, (payload) => {
    console.log('New product added:', payload.new);
    // Add to products list
    setProducts(prev => [...prev, transformProduct(payload.new)]);
    
    // Send notification
    showNotification('New product available!', payload.new.name);
  })
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'products' 
  }, (payload) => {
    console.log('Product updated:', payload.new);
    // Update products list
    setProducts(prev => prev.map(p => 
      p.id === payload.new.id ? transformProduct(payload.new) : p
    ));
  })
  .subscribe();
```

## 🔔 Push Notifications

### 1. Service Worker Setup
Your app includes a service worker (`public/sw.js`) that handles:
- Push notifications
- Background sync
- Offline caching
- Message handling

### 2. Notification Types
```typescript
// Notification categories in your app
interface NotificationTypes {
  'order': 'New order received' | 'Order status changed';
  'product': 'New product added' | 'Stock low';
  'promotion': 'Promotion approved' | 'Promotion expired';
  'support': 'New ticket created' | 'Ticket resolved';
  'user': 'New user registered' | 'User approved';
  'return': 'Return requested' | 'Return processed';
  'system': 'System announcement' | 'Maintenance notice';
}
```

### 3. Sending Notifications
```typescript
// Automatic notifications (built into your app)
const sendOrderNotification = (order: Order) => {
  // Notify wholesaler of new order
  NotificationService.sendTargetedNotification(
    order.wholesalerId,
    '🛒 New Order Received',
    `Order #${order.id} from ${retailerName}`,
    'order',
    { orderId: order.id }
  );
  
  // Notify retailer of order confirmation
  NotificationService.sendTargetedNotification(
    order.retailerId,
    '✅ Order Confirmed',
    `Your order #${order.id} has been placed`,
    'order',
    { orderId: order.id }
  );
};
```

## 📊 Real-time Analytics

### 1. Live Dashboard Updates
Your analytics update automatically when:
- New orders are placed
- Products are sold
- Payments are processed
- Users register

### 2. Performance Monitoring
```sql
-- Monitor real-time performance
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY (n_tup_ins + n_tup_upd + n_tup_del) DESC;
```

### 3. Connection Monitoring
```typescript
// Your app monitors connection status
const monitorConnection = () => {
  supabase.realtime.onOpen(() => {
    console.log('✅ Real-time connected');
    setConnectionStatus('connected');
  });
  
  supabase.realtime.onClose(() => {
    console.log('❌ Real-time disconnected');
    setConnectionStatus('disconnected');
  });
  
  supabase.realtime.onError((error) => {
    console.error('❌ Real-time error:', error);
    setConnectionStatus('error');
  });
};
```

## 🛠 Troubleshooting Real-time

### 1. Common Issues

**No Real-time Updates:**
```sql
-- Check if replication is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Enable if missing
ALTER PUBLICATION supabase_realtime ADD TABLE your_table_name;
```

**Connection Drops:**
```typescript
// Your app handles reconnection automatically
const handleReconnection = () => {
  // Reconnect after network issues
  if (navigator.onLine) {
    supabase.realtime.connect();
  }
};

window.addEventListener('online', handleReconnection);
```

**Too Many Connections:**
```sql
-- Monitor active connections
SELECT 
  application_name,
  state,
  COUNT(*) as connection_count
FROM pg_stat_activity 
WHERE application_name LIKE '%supabase%'
GROUP BY application_name, state;
```

### 2. Performance Optimization

**Limit Subscriptions:**
```typescript
// Only subscribe to relevant data
const subscribeToUserData = (userId: string) => {
  return supabase
    .channel(`user-${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'orders',
      filter: `retailer_id=eq.${userId}`
    }, handleOrderUpdate)
    .subscribe();
};
```

**Batch Updates:**
```sql
-- Use transactions for multiple related changes
BEGIN;
  UPDATE orders SET status = 'completed' WHERE id = 'order-id';
  UPDATE products SET stock = stock - quantity WHERE id IN (...);
COMMIT;
```

## 📱 Mobile Real-time Considerations

### 1. Background Sync
```typescript
// Register background sync
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    return registration.sync.register('background-sync');
  });
}
```

### 2. Network Handling
```typescript
// Handle network changes
window.addEventListener('online', () => {
  console.log('📶 Back online - syncing data...');
  // Trigger data sync
  refetchAllData();
});

window.addEventListener('offline', () => {
  console.log('📵 Offline - using cached data');
  // Switch to offline mode
  setOfflineMode(true);
});
```

## 🔧 Advanced Real-time Features

### 1. Presence System
```typescript
// Track who's online (future enhancement)
const trackPresence = () => {
  const channel = supabase.channel('online-users');
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Online users:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: currentUser.id,
          user_name: currentUser.name,
          online_at: new Date().toISOString()
        });
      }
    });
};
```

### 2. Custom Channels
```typescript
// Create custom channels for specific features
const createOrderChannel = (orderId: string) => {
  return supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`
    }, (payload) => {
      // Handle order-specific updates
      updateOrderStatus(payload.new);
    })
    .subscribe();
};
```

### 3. Rate Limiting
```sql
-- Monitor real-time usage
SELECT 
  COUNT(*) as active_subscriptions,
  COUNT(DISTINCT application_name) as unique_apps
FROM pg_stat_activity 
WHERE application_name LIKE '%realtime%';
```

## 📈 Monitoring Real-time Performance

### 1. Dashboard Metrics
Monitor in Supabase Dashboard > Observability:
- Real-time connections
- Messages per second
- Connection duration
- Error rates

### 2. Custom Monitoring
```sql
-- Create monitoring view
CREATE OR REPLACE VIEW realtime_stats AS
SELECT 
  'connections' as metric,
  COUNT(*) as value
FROM pg_stat_activity 
WHERE application_name LIKE '%realtime%'
UNION ALL
SELECT 
  'publications' as metric,
  COUNT(*) as value
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

This real-time system ensures your B2B platform feels responsive and keeps all users synchronized with the latest data changes.