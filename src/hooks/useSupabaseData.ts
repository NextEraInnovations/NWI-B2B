import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Product, Order, SupportTicket, Promotion, ReturnRequest, PendingUser } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useSupabaseData() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  // Transform database row to application type
  const transformUser = (row: any): User => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    businessName: row.business_name,
    phone: row.phone,
    address: row.address,
    verified: row.verified,
    status: row.status,
    createdAt: row.created_at
  });

  const transformProduct = (row: any): Product => ({
    id: row.id,
    wholesalerId: row.wholesaler_id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    stock: row.stock,
    minOrderQuantity: row.min_order_quantity,
    category: row.category,
    imageUrl: row.image_url || '',
    available: row.available,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });

  const transformOrder = (row: any, items: any[]): Order => ({
    id: row.id,
    retailerId: row.retailer_id,
    wholesalerId: row.wholesaler_id,
    items: items.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      total: parseFloat(item.total)
    })),
    total: parseFloat(row.total),
    status: row.status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pickupTime: row.pickup_time,
    notes: row.notes
  });

  const transformTicket = (row: any): SupportTicket => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    subject: row.subject,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignedTo: row.assigned_to
  });

  const transformPromotion = (row: any): Promotion => ({
    id: row.id,
    wholesalerId: row.wholesaler_id,
    title: row.title,
    description: row.description,
    discount: parseFloat(row.discount),
    validFrom: row.valid_from,
    validTo: row.valid_to,
    active: row.active,
    productIds: row.product_ids || [],
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    rejectionReason: row.rejection_reason
  });

  const transformReturnRequest = (row: any, items: any[]): ReturnRequest => ({
    id: row.id,
    orderId: row.order_id,
    retailerId: row.retailer_id,
    wholesalerId: row.wholesaler_id,
    reason: row.reason,
    description: row.description,
    status: row.status,
    priority: row.priority,
    requestedAmount: parseFloat(row.requested_amount),
    approvedAmount: row.approved_amount ? parseFloat(row.approved_amount) : undefined,
    items: items.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      reason: item.reason,
      condition: item.condition,
      unitPrice: parseFloat(item.unit_price),
      totalRefund: parseFloat(item.total_refund)
    })),
    images: row.images || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    processedBy: row.processed_by,
    processedAt: row.processed_at,
    rejectionReason: row.rejection_reason,
    refundMethod: row.refund_method,
    trackingNumber: row.tracking_number
  });

  const transformPendingUser = (row: any): PendingUser => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    businessName: row.business_name,
    phone: row.phone,
    address: row.address,
    registrationReason: row.registration_reason,
    submittedAt: row.submitted_at,
    documents: row.documents || []
  });

  // Real-time event handlers
  const handleRealtimeUpdate = (tableName: string) => (payload: any) => {
    console.log(`🔄 Live database update received for ${tableName}:`, payload.eventType, payload.new?.id || payload.old?.id);
    
    // Emit notification events for real-time updates
    if (payload.eventType === 'INSERT') {
      switch (tableName) {
        case 'products':
          window.dispatchEvent(new CustomEvent('notification-event', {
            detail: { type: 'product-added', data: transformProduct(payload.new) }
          }));
          console.log('📢 Product added notification sent');
          break;
        case 'orders':
          window.dispatchEvent(new CustomEvent('notification-event', {
            detail: { type: 'order-created', data: payload.new }
          }));
          console.log('📢 Order created notification sent');
          break;
        case 'promotions':
          if (payload.new.status === 'approved') {
            window.dispatchEvent(new CustomEvent('notification-event', {
              detail: { type: 'promotion-approved', data: transformPromotion(payload.new) }
            }));
            console.log('📢 Promotion approved notification sent');
          }
          break;
      }
    }
    
    console.log(`💾 Processing live update for ${tableName} table`);
    
    switch (tableName) {
      case 'users':
        if (payload.eventType === 'INSERT') {
          setUsers(prev => [...prev, transformUser(payload.new)]);
          console.log('✅ User added to live state');
        } else if (payload.eventType === 'UPDATE') {
          setUsers(prev => prev.map(item => item.id === payload.new.id ? transformUser(payload.new) : item));
          console.log('✅ User updated in live state');
        } else if (payload.eventType === 'DELETE') {
          setUsers(prev => prev.filter(item => item.id !== payload.old.id));
          console.log('✅ User removed from live state');
        }
        break;
        
      case 'products':
        if (payload.eventType === 'INSERT') {
          setProducts(prev => [...prev, transformProduct(payload.new)]);
          console.log('✅ Product added to live state');
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(item => item.id === payload.new.id ? transformProduct(payload.new) : item));
          console.log('✅ Product updated in live state');
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(item => item.id !== payload.old.id));
          console.log('✅ Product removed from live state');
        }
        break;
        
      case 'orders':
        // For orders, we need to refetch to get the items
        console.log('🔄 Refetching orders for live update');
        fetchOrders();
        break;
        
      case 'order_items':
        // When order items change, refetch orders
        console.log('🔄 Refetching orders due to order items change');
        fetchOrders();
        break;
        
      case 'support_tickets':
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [...prev, transformTicket(payload.new)]);
          console.log('✅ Support ticket added to live state');
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(item => item.id === payload.new.id ? transformTicket(payload.new) : item));
          console.log('✅ Support ticket updated in live state');
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(item => item.id !== payload.old.id));
          console.log('✅ Support ticket removed from live state');
        }
        break;
        
      case 'promotions':
        if (payload.eventType === 'INSERT') {
          setPromotions(prev => [...prev, transformPromotion(payload.new)]);
          console.log('✅ Promotion added to live state');
        } else if (payload.eventType === 'UPDATE') {
          setPromotions(prev => prev.map(item => item.id === payload.new.id ? transformPromotion(payload.new) : item));
          console.log('✅ Promotion updated in live state');
        } else if (payload.eventType === 'DELETE') {
          setPromotions(prev => prev.filter(item => item.id !== payload.old.id));
          console.log('✅ Promotion removed from live state');
        }
        break;
        
      case 'return_requests':
        // For return requests, we need to refetch to get the items
        console.log('🔄 Refetching return requests for live update');
        fetchReturnRequests();
        break;
        
      case 'return_items':
        // When return items change, refetch return requests
        console.log('🔄 Refetching return requests due to return items change');
        fetchReturnRequests();
        break;
        
      case 'pending_users':
        if (payload.eventType === 'INSERT') {
          setPendingUsers(prev => [...prev, transformPendingUser(payload.new)]);
          console.log('✅ Pending user added to live state');
        } else if (payload.eventType === 'UPDATE') {
          setPendingUsers(prev => prev.map(item => item.id === payload.new.id ? transformPendingUser(payload.new) : item));
          console.log('✅ Pending user updated in live state');
        } else if (payload.eventType === 'DELETE') {
          setPendingUsers(prev => prev.filter(item => item.id !== payload.old.id));
          console.log('✅ Pending user removed from live state');
        }
        break;
    }
    
    console.log(`✅ Live update processed successfully for ${tableName}`);
  };

  // Fetch individual data types
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && data) {
      setUsers(data.map(transformUser));
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setProducts(data.map(transformProduct));
    }
  };

  const fetchOrders = async () => {
    const [ordersResult, orderItemsResult] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('order_items').select('*')
    ]);

    if (!ordersResult.error && !orderItemsResult.error && ordersResult.data && orderItemsResult.data) {
      const ordersWithItems = ordersResult.data.map((order: any) => {
        const orderItems = orderItemsResult.data.filter((item: any) => item.order_id === order.id);
        return transformOrder(order, orderItems);
      });
      setOrders(ordersWithItems);
    }
  };

  const fetchTickets = async () => {
    const { data, error } = await supabase.from('support_tickets').select('*');
    if (!error && data) {
      setTickets(data.map(transformTicket));
    }
  };

  const fetchPromotions = async () => {
    const { data, error } = await supabase.from('promotions').select('*');
    if (!error && data) {
      setPromotions(data.map(transformPromotion));
    }
  };

  const fetchReturnRequests = async () => {
    const [returnRequestsResult, returnItemsResult] = await Promise.all([
      supabase.from('return_requests').select('*'),
      supabase.from('return_items').select('*')
    ]);

    if (!returnRequestsResult.error && !returnItemsResult.error && returnRequestsResult.data && returnItemsResult.data) {
      const returnRequestsWithItems = returnRequestsResult.data.map((returnReq: any) => {
        const returnItems = returnItemsResult.data.filter((item: any) => item.return_request_id === returnReq.id);
        return transformReturnRequest(returnReq, returnItems);
      });
      setReturnRequests(returnRequestsWithItems);
    }
  };

  const fetchPendingUsers = async () => {
    const { data, error } = await supabase.from('pending_users').select('*').eq('status', 'pending');
    if (!error && data) {
      setPendingUsers(data.map(transformPendingUser));
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        console.log('ℹ️ Running in demo mode - Supabase not configured');
        setLoading(false);
        setIsConnected(false);
        return;
      }

      // Test connection first with a simple query
      try {
        const connectionTest = await Promise.race([
          supabase.from('users').select('count').limit(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          )
        ]);
        
        if (connectionTest.error && connectionTest.error.message?.includes('Failed to fetch')) {
          console.warn('⚠️ Supabase connection failed - falling back to demo mode');
          setLoading(false);
          setIsConnected(false);
          return;
        }
      } catch (connectionError) {
        console.warn('⚠️ Supabase connection failed - falling back to demo mode');
        setLoading(false);
        setIsConnected(false);
        return;
      }

      // Fetch all data in parallel
      let results;
      try {
        console.log('📡 Fetching data from Supabase...');
        results = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('products').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('order_items').select('*'),
          supabase.from('support_tickets').select('*'),
          supabase.from('promotions').select('*'),
          supabase.from('return_requests').select('*'),
          supabase.from('return_items').select('*'),
          supabase.from('pending_users').select('*').eq('status', 'pending')
        ]);
      } catch (fetchError) {
        console.warn('⚠️ Failed to fetch data from Supabase - falling back to demo mode');
        setLoading(false);
        setIsConnected(false);
        return;
      }

      const [
        usersResult,
        productsResult,
        ordersResult,
        orderItemsResult,
        ticketsResult,
        promotionsResult,
        returnRequestsResult,
        returnItemsResult,
        pendingUsersResult
      ] = results;

      // Check for errors and handle missing tables gracefully
      const handleResult = (result: any, tableName: string) => {
        if (result.error) {
          if (result.error.code === '42P01' || result.error.message?.includes('relation') || result.error.message?.includes('does not exist')) {
            console.warn(`⚠️ Table ${tableName} does not exist yet. Please run database migrations.`);
            return [];
          }
          console.warn(`⚠️ Error fetching ${tableName}:`, result.error.message);
          return [];
        }
        return result.data || [];
      };

      // Transform and set data
      const usersData = handleResult(usersResult, 'users');
      const productsData = handleResult(productsResult, 'products');
      const ordersData = handleResult(ordersResult, 'orders');
      const orderItemsData = handleResult(orderItemsResult, 'order_items');
      const ticketsData = handleResult(ticketsResult, 'support_tickets');
      const promotionsData = handleResult(promotionsResult, 'promotions');
      const returnRequestsData = handleResult(returnRequestsResult, 'return_requests');
      const returnItemsData = handleResult(returnItemsResult, 'return_items');
      const pendingUsersData = handleResult(pendingUsersResult, 'pending_users');

      console.log('✅ Data fetched successfully:', {
        users: usersData.length,
        products: productsData.length,
        orders: ordersData.length,
        tickets: ticketsData.length,
        promotions: promotionsData.length,
        returnRequests: returnRequestsData.length,
        pendingUsers: pendingUsersData.length
      });
      
      setUsers(usersData.map(transformUser));
      setProducts(productsData.map(transformProduct));
      setTickets(ticketsData.map(transformTicket));
      setPromotions(promotionsData.map(transformPromotion));
      setPendingUsers(pendingUsersData.map(transformPendingUser));

      // Transform orders with their items
      const ordersWithItems = ordersData.map((order: any) => {
        const orderItems = orderItemsData.filter((item: any) => item.order_id === order.id);
        return transformOrder(order, orderItems);
      });
      setOrders(ordersWithItems);

      // Transform return requests with their items
      const returnRequestsWithItems = returnRequestsData.map((returnReq: any) => {
        const returnItems = returnItemsData.filter((item: any) => item.return_request_id === returnReq.id);
        return transformReturnRequest(returnReq, returnItems);
      });
      setReturnRequests(returnRequestsWithItems);

      setIsConnected(true);
    } catch (err) {
      console.warn('⚠️ Unexpected error - falling back to demo mode');
      setLoading(false);
      setIsConnected(false);
    } finally {
      // Loading state is handled in each branch above
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.log('🔄 Real-time updates disabled (demo mode)');
      return;
    }

    console.log('🔄 Setting up real-time subscriptions...');

    const newChannels = [
      supabase
        .channel('users-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, handleRealtimeUpdate('users'))
        .subscribe((status) => {
          console.log('Users channel status:', status);
        }),
      
      supabase
        .channel('products-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, handleRealtimeUpdate('products'))
        .subscribe((status) => {
          console.log('Products channel status:', status);
        }),
      
      supabase
        .channel('orders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handleRealtimeUpdate('orders'))
        .subscribe((status) => {
          console.log('Orders channel status:', status);
        }),
      
      supabase
        .channel('order-items-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, handleRealtimeUpdate('order_items'))
        .subscribe((status) => {
          console.log('Order items channel status:', status);
        }),
      
      supabase
        .channel('tickets-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, handleRealtimeUpdate('support_tickets'))
        .subscribe((status) => {
          console.log('Support tickets channel status:', status);
        }),
      
      supabase
        .channel('promotions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, handleRealtimeUpdate('promotions'))
        .subscribe((status) => {
          console.log('Promotions channel status:', status);
        }),
      
      supabase
        .channel('return-requests-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'return_requests' }, handleRealtimeUpdate('return_requests'))
        .subscribe((status) => {
          console.log('Return requests channel status:', status);
        }),
      
      supabase
        .channel('return-items-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'return_items' }, handleRealtimeUpdate('return_items'))
        .subscribe((status) => {
          console.log('Return items channel status:', status);
        }),
      
      supabase
        .channel('pending-users-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_users' }, handleRealtimeUpdate('pending_users'))
        .subscribe((status) => {
          console.log('Pending users channel status:', status);
        })
    ];

    setChannels(newChannels);
    console.log('✅ Real-time subscriptions established');

    return () => {
      console.log('🔄 Cleaning up real-time subscriptions...');
      newChannels.forEach(channel => supabase.removeChannel(channel));
      setChannels([]);
    };
  }, []);

  // Connection status monitoring
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('users').select('count').limit(1);
        setIsConnected(!error);
      } catch (err) {
        setIsConnected(false);
      }
    };

    // Check connection every 30 seconds
    const connectionInterval = setInterval(checkConnection, 30000);
    checkConnection(); // Initial check

    return () => clearInterval(connectionInterval);
  }, []);

  return {
    users: error ? [] : users,
    products: error ? [] : products,
    orders: error ? [] : orders,
    tickets: error ? [] : tickets,
    promotions: error ? [] : promotions,
    returnRequests: error ? [] : returnRequests,
    pendingUsers: error ? [] : pendingUsers,
    loading,
    error,
    isConnected,
    refetch: fetchData,
    // Individual refetch functions for targeted updates
    refetchUsers: fetchUsers,
    refetchProducts: fetchProducts,
    refetchOrders: fetchOrders,
    refetchTickets: fetchTickets,
    refetchPromotions: fetchPromotions,
    refetchReturnRequests: fetchReturnRequests,
    refetchPendingUsers: fetchPendingUsers
  };
}