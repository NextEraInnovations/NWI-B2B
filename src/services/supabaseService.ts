import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Product, Order, OrderItem, SupportTicket, Promotion, ReturnRequest, ReturnItem, PendingUser } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseService {
  // Handle errors gracefully
  private static handleError(error: any, operation: string) {
    console.error(`Supabase ${operation} error:`, error);
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Data changes will only persist in memory.');
      return;
    }
    throw error;
  }

  // User operations
  static async createUser(user: Omit<User, 'id' | 'createdAt'>) {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. User creation skipped.');
      return { ...user, id: uuidv4(), createdAt: new Date().toISOString() } as User;
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: uuidv4(),
        name: user.name,
        email: user.email,
        role: user.role,
        business_name: user.businessName,
        phone: user.phone,
        address: user.address,
        verified: user.verified,
        status: user.status
      }])
      .select()
      .single();

    if (error) this.handleError(error, 'createUser');
    return this.transformUser(data);
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        role: updates.role,
        business_name: updates.businessName,
        phone: updates.phone,
        address: updates.address,
        verified: updates.verified,
        status: updates.status
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.transformUser(data);
  }

  static async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformUser) || [];
  }

  // Product operations
  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        id: uuidv4(),
        wholesaler_id: product.wholesalerId,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        min_order_quantity: product.minOrderQuantity,
        category: product.category,
        image_url: product.imageUrl,
        available: product.available
      }])
      .select()
      .single();

    if (error) throw error;
    return this.transformProduct(data);
  }

  static async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        stock: updates.stock,
        min_order_quantity: updates.minOrderQuantity,
        category: updates.category,
        image_url: updates.imageUrl,
        available: updates.available
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.transformProduct(data);
  }

  static async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformProduct) || [];
  }

  // Order operations
  static async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    const orderId = uuidv4();
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: orderId,
        retailer_id: order.retailerId,
        wholesaler_id: order.wholesalerId,
        total: order.total,
        status: order.status,
        payment_status: order.paymentStatus,
        pickup_time: order.pickupTime,
        notes: order.notes
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = order.items.map(item => ({
      order_id: orderData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return this.transformOrder(orderData, order.items);
  }

  static async updateOrder(id: string, updates: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: updates.status,
        payment_status: updates.paymentStatus,
        pickup_time: updates.pickupTime,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Get order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    const items = itemsData?.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      total: parseFloat(item.total)
    })) || [];

    return this.transformOrder(data, items);
  }

  static async getOrders() {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*');

    if (itemsError) throw itemsError;

    return ordersData?.map(order => {
      const orderItems = itemsData?.filter(item => item.order_id === order.id) || [];
      const items = orderItems.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total)
      }));
      return this.transformOrder(order, items);
    }) || [];
  }

  // Support ticket operations
  static async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{
        id: uuidv4(),
        user_id: ticket.userId,
        user_name: ticket.userName,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assigned_to: ticket.assignedTo
      }])
      .select()
      .single();

    if (error) throw error;
    return this.transformTicket(data);
  }

  static async updateSupportTicket(id: string, updates: Partial<SupportTicket>) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        subject: updates.subject,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        assigned_to: updates.assignedTo,
        user_name: updates.userName
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.transformTicket(data);
  }

  static async getSupportTickets() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformTicket) || [];
  }

  // Promotion operations
  static async createPromotion(promotion: Omit<Promotion, 'id' | 'submittedAt'>) {
    const { data, error } = await supabase
      .from('promotions')
      .insert({
        wholesaler_id: promotion.wholesalerId,
        title: promotion.title,
        description: promotion.description,
        discount: promotion.discount,
        valid_from: promotion.validFrom,
        valid_to: promotion.validTo,
        active: promotion.active,
        product_ids: promotion.productIds,
        status: promotion.status
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformPromotion(data);
  }

  static async updatePromotion(id: string, updates: Partial<Promotion>) {
    const { data, error } = await supabase
      .from('promotions')
      .update({
        title: updates.title,
        description: updates.description,
        discount: updates.discount,
        valid_from: updates.validFrom,
        valid_to: updates.validTo,
        active: updates.active,
        product_ids: updates.productIds,
        status: updates.status,
        reviewed_at: updates.reviewedAt,
        reviewed_by: updates.reviewedBy,
        rejection_reason: updates.rejectionReason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.transformPromotion(data);
  }

  static async getPromotions() {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformPromotion) || [];
  }

  // Return request operations
  static async createReturnRequest(returnRequest: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data: returnData, error: returnError } = await supabase
      .from('return_requests')
      .insert({
        order_id: returnRequest.orderId,
        retailer_id: returnRequest.retailerId,
        wholesaler_id: returnRequest.wholesalerId,
        reason: returnRequest.reason,
        description: returnRequest.description,
        status: returnRequest.status,
        priority: returnRequest.priority,
        requested_amount: returnRequest.requestedAmount,
        images: returnRequest.images
      })
      .select()
      .single();

    if (returnError) throw returnError;

    // Insert return items
    const returnItems = returnRequest.items.map(item => ({
      return_request_id: returnData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      reason: item.reason,
      condition: item.condition,
      unit_price: item.unitPrice,
      total_refund: item.totalRefund
    }));

    const { error: itemsError } = await supabase
      .from('return_items')
      .insert(returnItems);

    if (itemsError) throw itemsError;

    return this.transformReturnRequest(returnData, returnRequest.items);
  }

  static async updateReturnRequest(id: string, updates: Partial<ReturnRequest>) {
    const { data, error } = await supabase
      .from('return_requests')
      .update({
        status: updates.status,
        approved_amount: updates.approvedAmount,
        processed_by: updates.processedBy,
        processed_at: updates.processedAt,
        rejection_reason: updates.rejectionReason,
        refund_method: updates.refundMethod,
        tracking_number: updates.trackingNumber
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Get return items
    const { data: itemsData, error: itemsError } = await supabase
      .from('return_items')
      .select('*')
      .eq('return_request_id', id);

    if (itemsError) throw itemsError;

    const items = itemsData?.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      reason: item.reason,
      condition: item.condition,
      unitPrice: parseFloat(item.unit_price),
      totalRefund: parseFloat(item.total_refund)
    })) || [];

    return this.transformReturnRequest(data, items);
  }

  static async getReturnRequests() {
    const { data: returnsData, error: returnsError } = await supabase
      .from('return_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (returnsError) throw returnsError;

    const { data: itemsData, error: itemsError } = await supabase
      .from('return_items')
      .select('*');

    if (itemsError) throw itemsError;

    return returnsData?.map(returnReq => {
      const returnItems = itemsData?.filter(item => item.return_request_id === returnReq.id) || [];
      const items = returnItems.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        reason: item.reason,
        condition: item.condition,
        unitPrice: parseFloat(item.unit_price),
        totalRefund: parseFloat(item.total_refund)
      }));
      return this.transformReturnRequest(returnReq, items);
    }) || [];
  }

  // Pending user operations
  static async createPendingUser(pendingUser: Omit<PendingUser, 'id' | 'submittedAt'>) {
    const { data, error } = await supabase
      .from('pending_users')
      .insert([{
        id: uuidv4(),
        name: pendingUser.name,
        email: pendingUser.email,
        role: pendingUser.role,
        business_name: pendingUser.businessName,
        phone: pendingUser.phone,
        address: pendingUser.address,
        registration_reason: pendingUser.registrationReason,
        documents: pendingUser.documents
      }])
      .select()
      .single();

    if (error) throw error;
    return this.transformPendingUser(data);
  }

  static async approvePendingUser(pendingUserId: string, adminId: string) {
    // Get pending user data
    const { data: pendingUser, error: fetchError } = await supabase
      .from('pending_users')
      .select('*')
      .eq('id', pendingUserId)
      .single();

    if (fetchError) throw fetchError;

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name: pendingUser.name,
        email: pendingUser.email,
        role: pendingUser.role,
        business_name: pendingUser.business_name,
        phone: pendingUser.phone,
        address: pendingUser.address,
        verified: true,
        status: 'active'
      })
      .select()
      .single();

    if (createError) throw createError;

    // Update pending user status
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId
      })
      .eq('id', pendingUserId);

    if (updateError) throw updateError;

    return this.transformUser(newUser);
  }

  static async rejectPendingUser(pendingUserId: string, adminId: string, reason: string) {
    const { error } = await supabase
      .from('pending_users')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        rejection_reason: reason
      })
      .eq('id', pendingUserId);

    if (error) throw error;
  }

  static async getPendingUsers() {
    const { data, error } = await supabase
      .from('pending_users')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.transformPendingUser) || [];
  }

  // Platform settings operations
  static async getPlatformSettings() {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*');

    if (error) throw error;
    
    // Convert to key-value object
    const settings: Record<string, any> = {};
    data?.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    
    return settings;
  }

  static async updatePlatformSetting(key: string, value: any, updatedBy: string) {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({
        key,
        value,
        updated_by: updatedBy
      });

    if (error) throw error;
  }

  // Transform database rows to application types
  private static transformUser(row: any): User {
    return {
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
    };
  }

  private static transformProduct(row: any): Product {
    return {
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
    };
  }

  private static transformOrder(row: any, items: OrderItem[]): Order {
    return {
      id: row.id,
      retailerId: row.retailer_id,
      wholesalerId: row.wholesaler_id,
      items,
      total: parseFloat(row.total),
      status: row.status,
      paymentStatus: row.payment_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      pickupTime: row.pickup_time,
      notes: row.notes
    };
  }

  private static transformTicket(row: any): SupportTicket {
    return {
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
    };
  }

  private static transformPromotion(row: any): Promotion {
    return {
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
    };
  }

  private static transformReturnRequest(row: any, items: ReturnItem[]): ReturnRequest {
    return {
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
      items,
      images: row.images || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      processedBy: row.processed_by,
      processedAt: row.processed_at,
      rejectionReason: row.rejection_reason,
      refundMethod: row.refund_method,
      trackingNumber: row.tracking_number
    };
  }

  private static transformPendingUser(row: any): PendingUser {
    return {
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
    };
  }
}