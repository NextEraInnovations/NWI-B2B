export interface User {
  id: string;
  name: string;
  email: string;
  role: 'wholesaler' | 'retailer' | 'admin' | 'support';
  businessName?: string;
  phone?: string;
  address?: string;
  verified: boolean;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export interface Product {
  id: string;
  wholesalerId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minOrderQuantity: number;
  category: string;
  imageUrl: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  retailerId: string;
  wholesalerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  pickupTime?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: 'wholesaler' | 'retailer';
  businessName: string;
  phone: string;
  address: string;
  registrationReason: string;
  submittedAt: string;
  documents?: string[];
}

export interface Promotion {
  id: string;
  wholesalerId: string;
  title: string;
  description: string;
  discount: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  productIds: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  retailerId: string;
  wholesalerId: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedAmount: number;
  approvedAmount?: number;
  items: ReturnItem[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
  refundMethod?: 'original_payment' | 'store_credit' | 'bank_transfer';
  trackingNumber?: string;
}

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  condition: 'damaged' | 'defective' | 'wrong_item' | 'not_as_described' | 'other';
  unitPrice: number;
  totalRefund: number;
}

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  monthlyRevenue: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; sales: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'promotion' | 'support' | 'user' | 'product' | 'return' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expiresAt?: string;
}

export interface WholesalerAnalytics {
  wholesalerId: string;
  wholesalerName: string;
  businessName: string;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activePromotions: number;
  averageOrderValue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  customerCount: number;
  repeatCustomerRate: number;
  stockTurnover: number;
  promotionPerformance: { title: string; ordersGenerated: number; revenue: number }[];
  recentActivity: { date: string; activity: string; value: string }[];
  joinDate: string;
  lastOrderDate: string;
  totalCustomers: number;
  averageRating: number;
  supportTickets: number;
  returnRate: number;
  fulfillmentRate: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'promotion' | 'support' | 'user' | 'product' | 'return' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expiresAt?: string;
}