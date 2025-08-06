import React, { useState } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Plus, 
  Eye, 
  Check, 
  X, 
  Search, 
  Filter,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Store,
  Tag,
  MessageSquare,
  Shield,
  Database,
  Activity,
  Zap,
  Globe,
  Lock,
  FileText,
  Bell,
  Trash2,
  Edit,
  Save,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType, PendingUser, Product, Order, Promotion, WholesalerAnalytics } from '../../types';

interface AdminDashboardProps {
  activeTab: string;
}

export function AdminDashboard({ activeTab }: AdminDashboardProps) {
  const { state, dispatch } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [promotionFilter, setPromotionFilter] = useState('all');
  const [selectedWholesaler, setSelectedWholesaler] = useState<string>('');
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [tempSettings, setTempSettings] = useState(state.platformSettings);

  // Filter functions
  const filteredUsers = state.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = state.orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesFilter;
  });

  const filteredPromotions = state.promotions.filter(promotion => {
    const matchesFilter = promotionFilter === 'all' || promotion.status === promotionFilter;
    return matchesFilter;
  });

  // Handler functions
  const handleApproveUser = (pendingUserId: string) => {
    dispatch({ 
      type: 'APPROVE_USER', 
      payload: { pendingUserId, adminId: state.currentUser!.id } 
    });
  };

  const handleRejectUser = (pendingUserId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      dispatch({ 
        type: 'REJECT_USER', 
        payload: { pendingUserId, adminId: state.currentUser!.id, reason } 
      });
    }
  };

  const handleApprovePromotion = (promotionId: string) => {
    dispatch({ 
      type: 'APPROVE_PROMOTION', 
      payload: { id: promotionId, adminId: state.currentUser!.id } 
    });
  };

  const handleRejectPromotion = (promotionId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      dispatch({ 
        type: 'REJECT_PROMOTION', 
        payload: { id: promotionId, adminId: state.currentUser!.id, reason } 
      });
    }
  };

  const handleBulkVerifyUsers = () => {
    const unverifiedUserIds = state.users
      .filter(user => !user.verified)
      .map(user => user.id);
    
    if (unverifiedUserIds.length > 0) {
      dispatch({ type: 'BULK_VERIFY_USERS', payload: unverifiedUserIds });
    }
  };

  const handleSuspendUser = (userId: string) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      dispatch({ type: 'SUSPEND_USER', payload: userId });
    }
  };

  const handleBroadcastAnnouncement = () => {
    const message = prompt('Enter announcement message:');
    const type = prompt('Enter announcement type (info/warning/success):') || 'info';
    
    if (message) {
      dispatch({ 
        type: 'BROADCAST_ANNOUNCEMENT', 
        payload: { message, type } 
      });
      alert('Announcement broadcasted to all users!');
    }
  };

  const handleSaveSettings = () => {
    dispatch({ type: 'UPDATE_PLATFORM_SETTINGS', payload: tempSettings });
    setSettingsChanged(false);
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      dispatch({ type: 'RESET_SETTINGS_TO_DEFAULT' });
      setTempSettings(state.platformSettings);
      setSettingsChanged(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
    setSettingsChanged(true);
  };

  // Generate wholesaler analytics
  const generateWholesalerAnalytics = (): WholesalerAnalytics[] => {
    const wholesalers = state.users.filter(u => u.role === 'wholesaler');
    
    return wholesalers.map(wholesaler => {
      const wholesalerProducts = state.products.filter(p => p.wholesalerId === wholesaler.id);
      const wholesalerOrders = state.orders.filter(o => o.wholesalerId === wholesaler.id);
      const wholesalerPromotions = state.promotions.filter(p => p.wholesalerId === wholesaler.id && p.active);
      
      const totalRevenue = wholesalerOrders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = wholesalerOrders.length > 0 ? totalRevenue / wholesalerOrders.length : 0;
      
      const uniqueCustomers = new Set(wholesalerOrders.map(o => o.retailerId)).size;
      const repeatCustomers = wholesalerOrders.reduce((acc, order) => {
        const customerOrders = wholesalerOrders.filter(o => o.retailerId === order.retailerId);
        if (customerOrders.length > 1 && !acc.includes(order.retailerId)) {
          acc.push(order.retailerId);
        }
        return acc;
      }, [] as string[]);
      
      const repeatCustomerRate = uniqueCustomers > 0 ? (repeatCustomers.length / uniqueCustomers) * 100 : 0;
      
      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2024, i).toLocaleString('default', { month: 'short' });
        const monthOrders = wholesalerOrders.filter(order => {
          const orderMonth = new Date(order.createdAt).getMonth();
          return orderMonth === i;
        });
        const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
        return { month, revenue };
      });
      
      const ordersByStatus = [
        { status: 'pending', count: wholesalerOrders.filter(o => o.status === 'pending').length },
        { status: 'accepted', count: wholesalerOrders.filter(o => o.status === 'accepted').length },
        { status: 'ready', count: wholesalerOrders.filter(o => o.status === 'ready').length },
        { status: 'completed', count: wholesalerOrders.filter(o => o.status === 'completed').length }
      ];
      
      const topProducts = wholesalerProducts.map(product => {
        const productOrders = wholesalerOrders.flatMap(order => 
          order.items.filter(item => item.productId === product.id)
        );
        const sales = productOrders.reduce((sum, item) => sum + item.quantity, 0);
        const revenue = productOrders.reduce((sum, item) => sum + item.total, 0);
        return { name: product.name, sales, revenue };
      }).sort((a, b) => b.sales - a.sales).slice(0, 5);
      
      const promotionPerformance = wholesalerPromotions.map(promo => ({
        title: promo.title,
        ordersGenerated: wholesalerOrders.filter(order => 
          order.createdAt >= promo.validFrom && order.createdAt <= promo.validTo
        ).length,
        revenue: wholesalerOrders
          .filter(order => order.createdAt >= promo.validFrom && order.createdAt <= promo.validTo)
          .reduce((sum, order) => sum + order.total, 0)
      }));
      
      const recentActivity = [
        { date: new Date().toISOString(), activity: 'Products Added', value: wholesalerProducts.length.toString() },
        { date: new Date().toISOString(), activity: 'Orders Received', value: wholesalerOrders.length.toString() },
        { date: new Date().toISOString(), activity: 'Active Promotions', value: wholesalerPromotions.length.toString() }
      ];
      
      const lastOrder = wholesalerOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      const supportTickets = state.tickets.filter(t => t.userId === wholesaler.id).length;
      const returnRate = wholesalerOrders.length > 0 ? 
        (state.returnRequests.filter(r => r.wholesalerId === wholesaler.id).length / wholesalerOrders.length) * 100 : 0;
      const fulfillmentRate = wholesalerOrders.length > 0 ? 
        (wholesalerOrders.filter(o => o.status === 'completed').length / wholesalerOrders.length) * 100 : 0;

      return {
        wholesalerId: wholesaler.id,
        wholesalerName: wholesaler.name,
        businessName: wholesaler.businessName || 'N/A',
        totalRevenue,
        totalOrders: wholesalerOrders.length,
        totalProducts: wholesalerProducts.length,
        activePromotions: wholesalerPromotions.length,
        averageOrderValue,
        monthlyRevenue,
        ordersByStatus,
        topProducts,
        customerCount: uniqueCustomers,
        repeatCustomerRate,
        stockTurnover: wholesalerProducts.reduce((sum, p) => sum + p.stock, 0),
        promotionPerformance,
        recentActivity,
        joinDate: wholesaler.createdAt,
        lastOrderDate: lastOrder?.createdAt || 'No orders yet',
        totalCustomers: uniqueCustomers,
        averageRating: 4.5, // Mock rating
        supportTickets,
        returnRate,
        fulfillmentRate
      };
    });
  };

  const wholesalerAnalytics = generateWholesalerAnalytics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="text-sm text-gray-500">
          Platform overview and management
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{state.users.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{state.orders.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{state.products.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{state.pendingUsers.length + state.promotions.filter(p => p.status === 'pending').length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleBulkVerifyUsers}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <CheckCircle className="w-5 h-5" />
            Verify All Users
          </button>
          <button
            onClick={handleBroadcastAnnouncement}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Bell className="w-5 h-5" />
            Broadcast
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Data
          </button>
          <button
            onClick={() => alert('System backup initiated!')}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Database className="w-5 h-5" />
            Backup System
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Pending User Registrations</h3>
          <div className="space-y-3">
            {state.pendingUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role} - {user.businessName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveUser(user.id)}
                    className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRejectUser(user.id)}
                    className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Uptime</span>
              <span className="font-bold text-green-600">{state.systemStats.serverUptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Response Time</span>
              <span className="font-bold text-blue-600">{state.systemStats.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Sessions</span>
              <span className="font-bold text-purple-600">{state.systemStats.activeSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Daily Transactions</span>
              <span className="font-bold text-orange-600">{state.systemStats.dailyTransactions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-bold text-green-600">{state.systemStats.transactionSuccessRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">User Management</h2>
        <div className="text-sm text-gray-500">
          {filteredUsers.length} users
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Roles</option>
              <option value="wholesaler">Wholesalers</option>
              <option value="retailer">Retailers</option>
              <option value="admin">Admins</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pending Users */}
      {state.pendingUsers.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Registrations ({state.pendingUsers.length})</h3>
          <div className="space-y-4">
            {state.pendingUsers.map((user) => (
              <div key={user.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900">{user.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'wholesaler' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 font-medium">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Business:</span>
                      <span className="ml-2 font-medium">{user.businessName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 font-medium">{user.phone}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-500 text-sm">Reason:</span>
                    <p className="text-sm text-gray-700 mt-1">{user.registrationReason}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPendingUser(user)}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleApproveUser(user.id)}
                    className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectUser(user.id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'wholesaler' ? 'bg-green-100 text-green-800' :
                    user.role === 'retailer' ? 'bg-orange-100 text-orange-800' :
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    user.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusIcon(user.verified ? 'active' : 'suspended')}
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Business:</span>
                    <span className="ml-2 font-medium">{user.businessName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{user.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <span className="ml-2 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {!user.verified && (
                  <button
                    onClick={() => dispatch({ type: 'BULK_VERIFY_USERS', payload: [user.id] })}
                    className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify
                  </button>
                )}
                {user.verified && user.role !== 'admin' && (
                  <button
                    onClick={() => handleSuspendUser(user.id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Suspend
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.role === 'wholesaler' ? 'bg-green-100 text-green-800' :
                      selectedUser.role === 'retailer' ? 'bg-orange-100 text-orange-800' :
                      selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusIcon(selectedUser.verified ? 'active' : 'suspended')}
                      {selectedUser.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Business Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Business:</span>
                      <span className="font-medium">{selectedUser.businessName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{selectedUser.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Address:</span>
                      <span className="font-medium">{selectedUser.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Account Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Joined:</span>
                      <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium">{selectedUser.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Statistics */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Activity Statistics</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedUser.role === 'wholesaler' 
                        ? state.products.filter(p => p.wholesalerId === selectedUser.id).length
                        : selectedUser.role === 'retailer'
                        ? state.orders.filter(o => o.retailerId === selectedUser.id).length
                        : 0
                      }
                    </p>
                    <p className="text-xs text-blue-600">
                      {selectedUser.role === 'wholesaler' ? 'Products' : 'Orders'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedUser.role === 'wholesaler' 
                        ? state.orders.filter(o => o.wholesalerId === selectedUser.id).length
                        : selectedUser.role === 'retailer'
                        ? state.orders.filter(o => o.retailerId === selectedUser.id && o.status === 'completed').length
                        : 0
                      }
                    </p>
                    <p className="text-xs text-green-600">
                      {selectedUser.role === 'wholesaler' ? 'Orders Received' : 'Completed Orders'}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {state.tickets.filter(t => t.userId === selectedUser.id).length}
                    </p>
                    <p className="text-xs text-purple-600">Support Tickets</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      R{selectedUser.role === 'wholesaler' 
                        ? state.orders.filter(o => o.wholesalerId === selectedUser.id).reduce((sum, o) => sum + o.total, 0).toLocaleString()
                        : selectedUser.role === 'retailer'
                        ? state.orders.filter(o => o.retailerId === selectedUser.id).reduce((sum, o) => sum + o.total, 0).toLocaleString()
                        : '0'
                      }
                    </p>
                    <p className="text-xs text-orange-600">Total Value</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending User Details Modal */}
      {selectedPendingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Pending User Registration</h3>
              <button
                onClick={() => setSelectedPendingUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedPendingUser.name}</h4>
                  <p className="text-gray-600">{selectedPendingUser.email}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    selectedPendingUser.role === 'wholesaler' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedPendingUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Business Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Business:</span>
                      <span className="font-medium">{selectedPendingUser.businessName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{selectedPendingUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Address:</span>
                      <span className="font-medium">{selectedPendingUser.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Application Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{selectedPendingUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Applied:</span>
                      <span className="font-medium">{new Date(selectedPendingUser.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Documents:</span>
                      <span className="font-medium">{selectedPendingUser.documents?.length || 0} files</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Registration Reason</h5>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedPendingUser.registrationReason}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleApproveUser(selectedPendingUser.id);
                    setSelectedPendingUser(null);
                  }}
                  className="flex-1 bg-green-50 text-green-600 px-4 py-3 rounded-xl hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Approve Registration
                </button>
                <button
                  onClick={() => {
                    handleRejectUser(selectedPendingUser.id);
                    setSelectedPendingUser(null);
                  }}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Reject Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Order Management</h2>
        <div className="flex items-center gap-4">
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="text-sm text-gray-500">
            {filteredOrders.length} orders
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-2 font-bold text-green-600">R{order.total.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Items:</span>
                    <span className="ml-2 font-medium">{order.items.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Retailer:</span>
                    <span className="ml-2 font-medium">
                      {state.users.find(u => u.id === order.retailerId)?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-bold text-green-600">R{selectedOrder.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Parties Involved</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Retailer:</span>
                      <span className="font-medium">
                        {state.users.find(u => u.id === selectedOrder.retailerId)?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wholesaler:</span>
                      <span className="font-medium">
                        {state.users.find(u => u.id === selectedOrder.wholesalerId)?.name || 'Unknown'}
                      </span>
                    </div>
                    {selectedOrder.pickupTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pickup Time:</span>
                        <span className="font-medium">{new Date(selectedOrder.pickupTime).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base">{item.productName}</h5>
                        <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">R{item.total.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-gray-500">R{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Product Management</h2>
        <div className="text-sm text-gray-500">
          {state.products.length} products
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {state.products.map((product) => (
          <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-32 sm:h-48 object-cover"
            />
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2">{product.name}</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-bold text-green-600">R{product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stock:</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Wholesaler:</span>
                  <span className="font-medium text-xs">
                    {state.users.find(u => u.id === product.wholesalerId)?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPromotions = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Promotion Management</h2>
        <div className="flex items-center gap-4">
          <select
            value={promotionFilter}
            onChange={(e) => setPromotionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Promotions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="text-sm text-gray-500">
            {filteredPromotions.length} promotions
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPromotions.map((promotion) => (
          <div key={promotion.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{promotion.title}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(promotion.status)}`}>
                    {getStatusIcon(promotion.status)}
                    {promotion.status}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                    {promotion.discount}% OFF
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{promotion.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Wholesaler:</span>
                    <span className="ml-2 font-medium">
                      {state.users.find(u => u.id === promotion.wholesalerId)?.name || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Valid From:</span>
                    <span className="ml-2 font-medium">{new Date(promotion.validFrom).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Valid To:</span>
                    <span className="ml-2 font-medium">{new Date(promotion.validTo).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Products:</span>
                    <span className="ml-2 font-medium">{promotion.productIds.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {promotion.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprovePromotion(promotion.id)}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectPromotion(promotion.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedPromotion(promotion)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promotion Details Modal */}
      {selectedPromotion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Promotion Details</h3>
              <button
                onClick={() => setSelectedPromotion(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="text-lg font-bold text-gray-900">{selectedPromotion.title}</h4>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPromotion.status)}`}>
                    {getStatusIcon(selectedPromotion.status)}
                    {selectedPromotion.status}
                  </span>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                    {selectedPromotion.discount}% OFF
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{selectedPromotion.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Promotion Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount:</span>
                      <span className="font-bold text-red-600">{selectedPromotion.discount}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valid From:</span>
                      <span className="font-medium">{new Date(selectedPromotion.validFrom).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valid To:</span>
                      <span className="font-medium">{new Date(selectedPromotion.validTo).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Products:</span>
                      <span className="font-medium">{selectedPromotion.productIds.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active:</span>
                      <span className={`font-medium ${selectedPromotion.active ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedPromotion.active ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Submission Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wholesaler:</span>
                      <span className="font-medium">
                        {state.users.find(u => u.id === selectedPromotion.wholesalerId)?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitted:</span>
                      <span className="font-medium">{new Date(selectedPromotion.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {selectedPromotion.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reviewed:</span>
                        <span className="font-medium">{new Date(selectedPromotion.reviewedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedPromotion.reviewedBy && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reviewed By:</span>
                        <span className="font-medium">
                          {state.users.find(u => u.id === selectedPromotion.reviewedBy)?.name || 'Admin'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedPromotion.rejectionReason && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Rejection Reason</h5>
                  <p className="text-red-600 bg-red-50 p-4 rounded-lg">{selectedPromotion.rejectionReason}</p>
                </div>
              )}

              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Applicable Products</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPromotion.productIds.map((productId) => {
                    const product = state.products.find(p => p.id === productId);
                    return product ? (
                      <div key={productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">R{product.price}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {selectedPromotion.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleApprovePromotion(selectedPromotion.id);
                      setSelectedPromotion(null);
                    }}
                    className="flex-1 bg-green-50 text-green-600 px-4 py-3 rounded-xl hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Approve Promotion
                  </button>
                  <button
                    onClick={() => {
                      handleRejectPromotion(selectedPromotion.id);
                      setSelectedPromotion(null);
                    }}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reject Promotion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Wholesaler Analytics</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedWholesaler}
            onChange={(e) => setSelectedWholesaler(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Wholesalers</option>
            {state.users.filter(u => u.role === 'wholesaler').map(wholesaler => (
              <option key={wholesaler.id} value={wholesaler.id}>
                {wholesaler.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                R{wholesalerAnalytics.reduce((sum, w) => sum + w.totalRevenue, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">
                {wholesalerAnalytics.reduce((sum, w) => sum + w.totalOrders, 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Wholesalers</p>
              <p className="text-3xl font-bold text-gray-900">{wholesalerAnalytics.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">
                R{wholesalerAnalytics.length > 0 
                  ? Math.round(wholesalerAnalytics.reduce((sum, w) => sum + w.averageOrderValue, 0) / wholesalerAnalytics.length)
                  : 0
                }
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Wholesaler Performance Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-xl font-bold text-gray-900">Wholesaler Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wholesaler</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wholesalerAnalytics
                .filter(w => !selectedWholesaler || w.wholesalerId === selectedWholesaler)
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .map((wholesaler) => (
                <tr key={wholesaler.wholesalerId} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{wholesaler.wholesalerName}</div>
                        <div className="text-sm text-gray-500">{wholesaler.businessName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">R{wholesaler.totalRevenue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{wholesaler.totalOrders}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{wholesaler.totalProducts}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{wholesaler.customerCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">R{Math.round(wholesaler.averageOrderValue)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-900">{wholesaler.fulfillmentRate.toFixed(1)}%</div>
                      <div className={`w-2 h-2 rounded-full ${
                        wholesaler.fulfillmentRate >= 90 ? 'bg-green-500' :
                        wholesaler.fulfillmentRate >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Platform Settings</h2>
        <div className="flex gap-2">
          {settingsChanged && (
            <button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}
          <button
            onClick={handleResetSettings}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">User Registration</label>
                <p className="text-xs text-gray-500">Allow new users to register</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.userRegistrationEnabled}
                  onChange={(e) => updateSetting('userRegistrationEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Send email notifications to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.emailNotificationsEnabled}
                  onChange={(e) => updateSetting('emailNotificationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-approve Promotions</label>
                <p className="text-xs text-gray-500">Automatically approve new promotions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.autoApprovePromotions}
                  onChange={(e) => updateSetting('autoApprovePromotions', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                <p className="text-xs text-gray-500">Put the platform in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.maintenanceMode}
                  onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Business Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tempSettings.commissionRate}
                onChange={(e) => updateSetting('commissionRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (R)</label>
              <input
                type="number"
                min="0"
                value={tempSettings.minimumOrderValue}
                onChange={(e) => updateSetting('minimumOrderValue', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Products per Wholesaler</label>
              <input
                type="number"
                min="1"
                value={tempSettings.maxProductsPerWholesaler}
                onChange={(e) => updateSetting('maxProductsPerWholesaler', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Response Time (hours)</label>
              <input
                type="number"
                min="1"
                value={tempSettings.supportResponseTime}
                onChange={(e) => updateSetting('supportResponseTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Require 2FA for all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.twoFactorRequired}
                  onChange={(e) => updateSetting('twoFactorRequired', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Data Encryption</label>
                <p className="text-xs text-gray-500">Encrypt sensitive data at rest</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.dataEncryptionEnabled}
                  onChange={(e) => updateSetting('dataEncryptionEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Audit Logging</label>
                <p className="text-xs text-gray-500">Log all user actions for security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.auditLoggingEnabled}
                  onChange={(e) => updateSetting('auditLoggingEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Uptime</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">{state.systemStats.serverUptime}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  state.systemStats.responseTime < 300 ? 'bg-green-500' :
                  state.systemStats.responseTime < 500 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">{state.systemStats.responseTime}ms</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium">{state.systemStats.activeSessions}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Transactions</span>
              <span className="text-sm font-medium">{state.systemStats.dailyTransactions}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">{state.systemStats.transactionSuccessRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {settingsChanged && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              You have unsaved changes. Click "Save Changes" to apply them or "Reset to Default" to discard them.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  switch (activeTab) {
    case 'overview':
      return renderOverview();
    case 'users':
      return renderUsers();
    case 'orders':
      return renderOrders();
    case 'products':
      return renderProducts();
    case 'promotions':
      return renderPromotions();
    case 'analytics':
      return renderAnalytics();
    case 'settings':
      return renderSettings();
    default:
      return renderOverview();
  }
}