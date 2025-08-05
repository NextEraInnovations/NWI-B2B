import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { SupabaseService } from '../services/supabaseService';
import { User, Product, Order, SupportTicket, Promotion, Analytics, ReturnRequest, PendingUser, WholesalerAnalytics } from '../types';

interface PlatformSettings {
  userRegistrationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  autoApprovePromotions: boolean;
  maintenanceMode: boolean;
  commissionRate: number;
  minimumOrderValue: number;
  maxProductsPerWholesaler: number;
  supportResponseTime: number;
  twoFactorRequired: boolean;
  dataEncryptionEnabled: boolean;
  auditLoggingEnabled: boolean;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  pendingUsers: PendingUser[];
  products: Product[];
  orders: Order[];
  tickets: SupportTicket[];
  promotions: Promotion[];
  returnRequests: ReturnRequest[];
  analytics: Analytics;
  wholesalerAnalytics: WholesalerAnalytics[];
  platformSettings: PlatformSettings;
  systemStats: {
    serverUptime: number;
    responseTime: number;
    activeSessions: number;
    dailyTransactions: number;
    transactionSuccessRate: number;
    failedPayments: number;
    dailyActiveUsers: number;
    newRegistrations: number;
    bounceRate: number;
  };
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_PENDING_USER'; payload: PendingUser }
  | { type: 'APPROVE_USER'; payload: { pendingUserId: string; adminId: string } }
  | { type: 'REJECT_USER'; payload: { pendingUserId: string; adminId: string; reason: string } }
  | { type: 'UPDATE_PLATFORM_SETTINGS'; payload: Partial<PlatformSettings> }
  | { type: 'BULK_VERIFY_USERS'; payload: string[] }
  | { type: 'SUSPEND_USER'; payload: string }
  | { type: 'BROADCAST_ANNOUNCEMENT'; payload: { message: string; type: string } }
  | { type: 'RESET_SETTINGS_TO_DEFAULT' }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'ADD_TICKET'; payload: SupportTicket }
  | { type: 'UPDATE_TICKET'; payload: SupportTicket }
  | { type: 'ADD_PROMOTION'; payload: Promotion }
  | { type: 'UPDATE_PROMOTION'; payload: Promotion }
  | { type: 'APPROVE_PROMOTION'; payload: { id: string; adminId: string } }
  | { type: 'REJECT_PROMOTION'; payload: { id: string; adminId: string; reason: string } }
  | { type: 'ADD_RETURN_REQUEST'; payload: ReturnRequest }
  | { type: 'UPDATE_RETURN_REQUEST'; payload: ReturnRequest }
  | { type: 'APPROVE_RETURN_REQUEST'; payload: { id: string; supportId: string; approvedAmount: number; refundMethod: string } }
  | { type: 'REJECT_RETURN_REQUEST'; payload: { id: string; supportId: string; reason: string } };

const initialState: AppState = {
  currentUser: null,
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Admin User',
      email: 'Aadamabdurahman1974@gmail.com',
      role: 'admin',
      businessName: 'NWI B2B Platform',
      phone: '+27 123 456 789',
      address: 'Platform Administration',
      verified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Test Wholesaler',
      email: 'wholesaler@test.com',
      role: 'wholesaler',
      businessName: 'Test Wholesale Business',
      phone: '+27 123 456 790',
      address: 'Test Wholesale Address',
      verified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Test Retailer',
      email: 'retailer@test.com',
      role: 'retailer',
      businessName: 'Test Retail Business',
      phone: '+27 123 456 791',
      address: 'Test Retail Address',
      verified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Test Support',
      email: 'support@test.com',
      role: 'support',
      businessName: 'NWI B2B Support',
      phone: '+27 123 456 792',
      address: 'Support Department',
      verified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'NWI Support',
      email: 'Support@nwi.com',
      role: 'support',
      businessName: 'NWI B2B Support Team',
      phone: '+27 123 456 793',
      address: 'NWI Support Department',
      verified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  platformSettings: {
    userRegistrationEnabled: true,
    emailNotificationsEnabled: true,
    autoApprovePromotions: false,
    maintenanceMode: false,
    commissionRate: 5,
    minimumOrderValue: 100,
    maxProductsPerWholesaler: 1000,
    supportResponseTime: 24,
    twoFactorRequired: false,
    dataEncryptionEnabled: true,
    auditLoggingEnabled: true
  },
  systemStats: {
    serverUptime: 99.8,
    responseTime: 245,
    activeSessions: 1247,
    dailyTransactions: 342,
    transactionSuccessRate: 98.5,
    failedPayments: 5,
    dailyActiveUsers: 892,
    newRegistrations: 23,
    bounceRate: 12.3
  },
  pendingUsers: [],
  products: [],
  orders: [],
  tickets: [],
  promotions: [],
  returnRequests: [],
  analytics: {
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    monthlyRevenue: [],
    ordersByStatus: [
      { status: 'completed', count: 0 },
      { status: 'pending', count: 0 },
      { status: 'ready', count: 0 },
      { status: 'accepted', count: 0 }
    ],
    topProducts: []
  },
  wholesalerAnalytics: []
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'ADD_PENDING_USER':
      return { ...state, pendingUsers: [...state.pendingUsers, action.payload] };
    case 'APPROVE_USER':
      const pendingUser = state.pendingUsers.find(u => u.id === action.payload.pendingUserId);
      if (pendingUser) {
        const newUser: User = {
          id: Date.now().toString(),
          name: pendingUser.name,
          email: pendingUser.email,
          role: pendingUser.role,
          businessName: pendingUser.businessName,
          phone: pendingUser.phone,
          address: pendingUser.address,
          verified: true,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        return {
          ...state,
          users: [...state.users, newUser],
          pendingUsers: state.pendingUsers.filter(u => u.id !== action.payload.pendingUserId)
        };
      }
      return state;
    case 'REJECT_USER':
      return {
        ...state,
        pendingUsers: state.pendingUsers.filter(u => u.id !== action.payload.pendingUserId)
      };
    case 'UPDATE_PLATFORM_SETTINGS':
      return { 
        ...state, 
        platformSettings: { ...state.platformSettings, ...action.payload }
      };
    case 'BULK_VERIFY_USERS':
      return {
        ...state,
        users: state.users.map(user => 
          action.payload.includes(user.id) 
            ? { ...user, verified: true }
            : user
        )
      };
    case 'SUSPEND_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload 
            ? { ...user, verified: false }
            : user
        )
      };
    case 'BROADCAST_ANNOUNCEMENT':
      // In a real app, this would send notifications to all users
      console.log('Broadcasting announcement:', action.payload);
      return state;
    case 'RESET_SETTINGS_TO_DEFAULT':
      return {
        ...state,
        platformSettings: {
          userRegistrationEnabled: true,
          emailNotificationsEnabled: true,
          autoApprovePromotions: false,
          maintenanceMode: false,
          commissionRate: 5,
          minimumOrderValue: 100,
          maxProductsPerWholesaler: 1000,
          supportResponseTime: 24,
          twoFactorRequired: false,
          dataEncryptionEnabled: true,
          auditLoggingEnabled: true
        }
      };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o)
      };
    case 'ADD_TICKET':
      return { ...state, tickets: [...state.tickets, action.payload] };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'ADD_PROMOTION':
      return { ...state, promotions: [...state.promotions, action.payload] };
    case 'UPDATE_PROMOTION':
      return {
        ...state,
        promotions: state.promotions.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'APPROVE_PROMOTION':
      return {
        ...state,
        promotions: state.promotions.map(p => 
          p.id === action.payload.id 
            ? { ...p, status: 'approved', active: true, reviewedAt: new Date().toISOString(), reviewedBy: action.payload.adminId }
            : p
        )
      };
    case 'REJECT_PROMOTION':
      return {
        ...state,
        promotions: state.promotions.map(p => 
          p.id === action.payload.id 
            ? { ...p, status: 'rejected', active: false, reviewedAt: new Date().toISOString(), reviewedBy: action.payload.adminId, rejectionReason: action.payload.reason }
            : p
        )
      };
    case 'ADD_RETURN_REQUEST':
      return { ...state, returnRequests: [...state.returnRequests, action.payload] };
    case 'UPDATE_RETURN_REQUEST':
      return {
        ...state,
        returnRequests: state.returnRequests.map(r => r.id === action.payload.id ? action.payload : r)
      };
    case 'APPROVE_RETURN_REQUEST':
      return {
        ...state,
        returnRequests: state.returnRequests.map(r => 
          r.id === action.payload.id 
            ? { 
                ...r, 
                status: 'approved', 
                approvedAmount: action.payload.approvedAmount,
                refundMethod: action.payload.refundMethod as any,
                processedBy: action.payload.supportId,
                processedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : r
        )
      };
    case 'REJECT_RETURN_REQUEST':
      return {
        ...state,
        returnRequests: state.returnRequests.map(r => 
          r.id === action.payload.id 
            ? { 
                ...r, 
                status: 'rejected', 
                rejectionReason: action.payload.reason,
                processedBy: action.payload.supportId,
                processedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : r
        )
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { 
    users, 
    products, 
    orders, 
    tickets, 
    promotions, 
    returnRequests, 
    pendingUsers, 
    loading, 
    error 
  } = useSupabaseData();

  // Update state with real data from Supabase
  const enhancedState = {
    ...state,
    users: error ? state.users : (users.length > 0 ? users : state.users),
    products: error ? state.products : (products.length > 0 ? products : state.products),
    orders: error ? state.orders : (orders.length > 0 ? orders : state.orders),
    tickets: error ? state.tickets : (tickets.length > 0 ? tickets : state.tickets),
    promotions: error ? state.promotions : (promotions.length > 0 ? promotions : state.promotions),
    returnRequests: error ? state.returnRequests : (returnRequests.length > 0 ? returnRequests : state.returnRequests),
    pendingUsers: error ? state.pendingUsers : (pendingUsers.length > 0 ? pendingUsers : state.pendingUsers),
    loading,
    error
  };

  // Enhanced dispatch that also updates Supabase
  const enhancedDispatch = async (action: AppAction) => {
    // First update local state for immediate UI feedback
    dispatch(action);
    
    // Check if Supabase is configured
    const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Changes will only persist in memory.');
      return;
    }
    
    try {
      switch (action.type) {
        case 'ADD_PRODUCT':
          await SupabaseService.createProduct(action.payload);
          break;
        case 'UPDATE_PRODUCT':
          await SupabaseService.updateProduct(action.payload.id, action.payload);
          break;
        case 'DELETE_PRODUCT':
          await SupabaseService.deleteProduct(action.payload);
          break;
        case 'ADD_ORDER':
          await SupabaseService.createOrder(action.payload);
          break;
        case 'UPDATE_ORDER':
          await SupabaseService.updateOrder(action.payload.id, action.payload);
          break;
        case 'ADD_TICKET':
          await SupabaseService.createSupportTicket(action.payload);
          break;
        case 'UPDATE_TICKET':
          await SupabaseService.updateSupportTicket(action.payload.id, action.payload);
          break;
        case 'ADD_PROMOTION':
          await SupabaseService.createPromotion(action.payload);
          break;
        case 'UPDATE_PROMOTION':
          await SupabaseService.updatePromotion(action.payload.id, action.payload);
          break;
        case 'APPROVE_PROMOTION':
          const promotion = enhancedState.promotions.find(p => p.id === action.payload.id);
          if (promotion) {
            await SupabaseService.updatePromotion(action.payload.id, {
              ...promotion,
              status: 'approved',
              active: true,
              reviewedAt: new Date().toISOString(),
              reviewedBy: action.payload.adminId
            });
          }
          break;
        case 'REJECT_PROMOTION':
          const rejectedPromotion = enhancedState.promotions.find(p => p.id === action.payload.id);
          if (rejectedPromotion) {
            await SupabaseService.updatePromotion(action.payload.id, {
              ...rejectedPromotion,
              status: 'rejected',
              active: false,
              reviewedAt: new Date().toISOString(),
              reviewedBy: action.payload.adminId,
              rejectionReason: action.payload.reason
            });
          }
          break;
        case 'ADD_RETURN_REQUEST':
          await SupabaseService.createReturnRequest(action.payload);
          break;
        case 'APPROVE_RETURN_REQUEST':
          const returnRequest = enhancedState.returnRequests.find(r => r.id === action.payload.id);
          if (returnRequest) {
            await SupabaseService.updateReturnRequest(action.payload.id, {
              ...returnRequest,
              status: 'approved',
              approvedAmount: action.payload.approvedAmount,
              refundMethod: action.payload.refundMethod as any,
              processedBy: action.payload.supportId,
              processedAt: new Date().toISOString()
            });
          }
          break;
        case 'REJECT_RETURN_REQUEST':
          const rejectedReturn = enhancedState.returnRequests.find(r => r.id === action.payload.id);
          if (rejectedReturn) {
            await SupabaseService.updateReturnRequest(action.payload.id, {
              ...rejectedReturn,
              status: 'rejected',
              rejectionReason: action.payload.reason,
              processedBy: action.payload.supportId,
              processedAt: new Date().toISOString()
            });
          }
          break;
        case 'APPROVE_USER':
          await SupabaseService.approvePendingUser(action.payload.pendingUserId, action.payload.adminId);
          break;
        case 'REJECT_USER':
          await SupabaseService.rejectPendingUser(action.payload.pendingUserId, action.payload.adminId, action.payload.reason);
          break;
        case 'ADD_PENDING_USER':
          await SupabaseService.createPendingUser(action.payload);
          break;
        // For other actions, they only update local state
      }
    } catch (error) {
      console.error('Error updating Supabase:', error);
      // Show user-friendly error message
      if (error instanceof Error) {
        console.warn(`Database operation failed: ${error.message}. Changes saved locally only.`);
      }
      // The local state was already updated above for immediate feedback
    }
  };

  return (
    <AppContext.Provider value={{ state: enhancedState, dispatch: enhancedDispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}