import React, { useState } from 'react';
import { AnalyticsService, WholesalerAnalytics } from '../../services/analyticsService';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  UserCheck,
  UserX,
  Settings,
  Bell,
  Shield,
  Database,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Mail,
  MessageSquare,
  BarChart3,
  Tag,
  Truck,
  Building,
  Phone,
  MapPin,
  Calendar,
  Star,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  User,
  FileText,
  Globe,
  Lock,
  Unlock,
  Power,
  HardDrive,
  Wifi,
  Server,
  Monitor
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType, PendingUser, Product, Order, Promotion, WholesalerAnalytics } from '../../types';
import { WholesalerAnalyticsModal } from '../Analytics/WholesalerAnalyticsModal';

interface AdminDashboardProps {
  activeTab: string;
}

export function AdminDashboard({ activeTab }: AdminDashboardProps) {
  const { state, dispatch } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [userFilter, setUserFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [promotionFilter, setPromotionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedWholesaler, setSelectedWholesaler] = useState<UserType | null>(null);
  const [showWholesalerAnalytics, setShowWholesalerAnalytics] = useState(false);
  const [selectedWholesalerAnalytics, setSelectedWholesalerAnalytics] = useState<WholesalerAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const currentUser = state.currentUser!;

  // Quick action handlers
  const handleVerifyAllUsers = () => {
    const unverifiedUsers = state.users.filter(u => !u.verified).map(u => u.id);
    if (unverifiedUsers.length > 0) {
      dispatch({ type: 'BULK_VERIFY_USERS', payload: unverifiedUsers });
      alert(`Verified ${unverifiedUsers.length} users successfully!`);
    } else {
      alert('All users are already verified.');
    }
  };

  const handleApproveAllPromotions = () => {
    const pendingPromotions = state.promotions.filter(p => p.status === 'pending');
    if (pendingPromotions.length > 0) {
      pendingPromotions.forEach(promotion => {
        dispatch({ 
          type: 'APPROVE_PROMOTION', 
          payload: { id: promotion.id, adminId: currentUser.id } 
        });
      });
      alert(`Approved ${pendingPromotions.length} promotions successfully!`);
    } else {
      alert('No pending promotions to approve.');
    }
  };

  const handleSendAnnouncement = () => {
    setShowAnnouncementModal(true);
  };

  const handleBroadcastAnnouncement = () => {
    if (announcementText.trim()) {
      dispatch({ 
        type: 'BROADCAST_ANNOUNCEMENT', 
        payload: { message: announcementText, type: 'announcement' } 
      });
      
      // Create notifications for all users
      state.users.forEach(user => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `announcement-${Date.now()}-${user.id}`,
            userId: user.id,
            type: 'system',
            title: '📢 Platform Announcement',
            message: announcementText,
            data: { type: 'announcement', from: 'admin' },
            read: false,
            priority: 'high',
            createdAt: new Date().toISOString()
          }
        });
      });
      
      setAnnouncementText('');
      setShowAnnouncementModal(false);
      alert('Announcement sent to all users successfully!');
    }
  };

  const handleBackupData = () => {
    const data = {
      users: state.users,
      products: state.products,
      orders: state.orders,
      promotions: state.promotions,
      tickets: state.tickets,
      returnRequests: state.returnRequests,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nwi-b2b-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Data backup downloaded successfully!');
  };

  const handleSystemMaintenance = () => {
    const isMaintenanceMode = state.platformSettings.maintenanceMode;
    dispatch({ 
      type: 'UPDATE_PLATFORM_SETTINGS', 
      payload: { maintenanceMode: !isMaintenanceMode } 
    });
    
    const message = !isMaintenanceMode 
      ? 'System maintenance mode enabled. Users will see a maintenance message.'
      : 'System maintenance mode disabled. Platform is now accessible to all users.';
    
    alert(message);
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all platform settings to default values? This action cannot be undone.')) {
      dispatch({ type: 'RESET_SETTINGS_TO_DEFAULT' });
      alert('Platform settings have been reset to default values.');
    }
  };

  const handleBulkUserActions = () => {
    setShowBulkActions(!showBulkActions);
    setSelectedUsers([]);
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkVerify = () => {
    if (selectedUsers.length > 0) {
      dispatch({ type: 'BULK_VERIFY_USERS', payload: selectedUsers });
      alert(`Verified ${selectedUsers.length} users successfully!`);
      setSelectedUsers([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkSuspend = () => {
    if (selectedUsers.length > 0 && confirm(`Are you sure you want to suspend ${selectedUsers.length} users?`)) {
      selectedUsers.forEach(userId => {
        dispatch({ type: 'SUSPEND_USER', payload: userId });
      });
      alert(`Suspended ${selectedUsers.length} users successfully!`);
      setSelectedUsers([]);
      setShowBulkActions(false);
    }
  };

  const handleWholesalerClick = (wholesaler: UserType) => {
    setSelectedWholesaler(wholesaler);
    setShowWholesalerAnalytics(true);
  };

  // Filter functions
  const filteredUsers = state.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
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

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': case 'approved': case 'active': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': case 'rejected': case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': case 'approved': case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': case 'rejected': case 'suspended': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleApproveUser = (pendingUserId: string) => {
    dispatch({ type: 'APPROVE_USER', payload: { pendingUserId, adminId: currentUser.id } });
  };

  const handleRejectUser = (pendingUserId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      dispatch({ type: 'REJECT_USER', payload: { pendingUserId, adminId: currentUser.id, reason } });
    }
  };

  const handleApprovePromotion = (promotionId: string) => {
    dispatch({ type: 'APPROVE_PROMOTION', payload: { id: promotionId, adminId: currentUser.id } });
  };

  const handleRejectPromotion = (promotionId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      dispatch({ type: 'REJECT_PROMOTION', payload: { id: promotionId, adminId: currentUser.id, reason } });
    }
  };

  const handleWholesalerClick = async (wholesaler: User) => {
    setAnalyticsLoading(true);
    setShowWholesalerAnalytics(true);
    
    try {
      console.log('📊 Loading analytics for wholesaler:', wholesaler.name);
      const analytics = await AnalyticsService.getWholesalerAnalytics(wholesaler.id);
      setSelectedWholesalerAnalytics(analytics);
    } catch (error) {
      console.error('❌ Error loading wholesaler analytics:', error);
      alert('Failed to load analytics data. Please try again.');
      setShowWholesalerAnalytics(false);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="text-sm text-gray-500">
          Platform administration and management
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
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{state.products.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{state.orders.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">R{state.orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleVerifyAllUsers}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <UserCheck className="w-5 h-5" />
            Verify All Users
          </button>
          
          <button
            onClick={handleApproveAllPromotions}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Tag className="w-5 h-5" />
            Approve Promotions
          </button>
          
          <button
            onClick={handleSendAnnouncement}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Bell className="w-5 h-5" />
            Send Announcement
          </button>
          
          <button
            onClick={handleBackupData}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            Backup Data
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Uptime:</span>
              <span className="font-bold text-green-600">{state.systemStats.serverUptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-bold text-blue-600">{state.systemStats.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Sessions:</span>
              <span className="font-bold text-purple-600">{state.systemStats.activeSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Daily Transactions:</span>
              <span className="font-bold text-orange-600">{state.systemStats.dailyTransactions}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Maintenance Mode:</span>
              <button
                onClick={handleSystemMaintenance}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  state.platformSettings.maintenanceMode 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {state.platformSettings.maintenanceMode ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">User Registration:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                state.platformSettings.userRegistrationEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {state.platformSettings.userRegistrationEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Commission Rate:</span>
              <span className="font-bold text-gray-900">{state.platformSettings.commissionRate}%</span>
            </div>
            <button
              onClick={handleResetSettings}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Reset to Defaults
            </button>
          </div>
        <p className="text-gray-600 mb-6">Click on any wholesaler's name in the Users section to view their detailed analytics.</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Analytics Features Include:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Sales & Revenue Analytics
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customer Insights & Retention
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Performance Metrics
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment & Financial Analytics
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Marketing & Promotion Impact
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth Trends & Forecasting
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Send Platform Announcement</h3>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder="Enter your announcement message..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcastAnnouncement}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
              >
                Send to All Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleBulkUserActions}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            Bulk Actions
          </button>
          <div className="text-sm text-gray-500">
            {filteredUsers.length} users
          </div>
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

      {/* Bulk Actions Panel */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-900">Bulk Actions ({selectedUsers.length} selected)</h3>
            <button
              onClick={() => setShowBulkActions(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBulkVerify}
              disabled={selectedUsers.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Selected
            </button>
            <button
              onClick={handleBulkSuspend}
              disabled={selectedUsers.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suspend Selected
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              {showBulkActions && (
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserSelection(user.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              )}
              <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 
                    className={`text-lg font-bold ${
                      user.role === 'wholesaler' 
                        ? 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline' 
                        : 'text-gray-900'
                    }`}
                    onClick={() => user.role === 'wholesaler' && handleWholesalerClick(user)}
                  >
                    {user.name}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'wholesaler' ? 'bg-green-100 text-green-800' :
                    user.role === 'retailer' ? 'bg-orange-100 text-orange-800' :
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                  {user.verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Business:</span>
                    <span className="ml-2 font-medium">{user.businessName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <span className="ml-2 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                {user.role === 'wholesaler' && (
                  <button
                    onClick={() => handleWholesalerClick(user)}
                    className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors font-medium flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center">
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
                    {selectedUser.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedUser.phone}</span>
                      </div>
                    )}
                    {selectedUser.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{selectedUser.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Account Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{selectedUser.businessName || 'No business name'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span>Status: {selectedUser.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wholesaler Analytics Modal */}
      {selectedWholesaler && (
        <WholesalerAnalyticsModal
          wholesaler={selectedWholesaler}
          isOpen={showWholesalerAnalytics}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
            {analyticsLoading ? (
              <div className="flex items-center justify-center p-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-600">Loading Analytics...</p>
                  <p className="text-sm text-gray-500 mt-2">Calculating comprehensive metrics</p>
                </div>
              </div>
            ) : selectedWholesalerAnalytics ? (
              <WholesalerAnalyticsModal
                analytics={selectedWholesalerAnalytics}
                isOpen={showWholesalerAnalytics}
                onClose={() => {
                  setShowWholesalerAnalytics(false);
                  setSelectedWholesalerAnalytics(null);
                }}
              />
            ) : (
              <div className="flex items-center justify-center p-20">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600">Failed to Load Analytics</p>
                  <p className="text-sm text-gray-500 mt-2">Please try again later</p>
                  <button
                    onClick={() => setShowWholesalerAnalytics(false)}
                    className="mt-4 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderPendingApplications = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Pending Applications</h2>
        <div className="text-sm text-gray-500">
          {state.pendingUsers.length} applications awaiting review
        </div>
      </div>

      <div className="space-y-4">
        {state.pendingUsers.map((pendingUser) => (
          <div key={pendingUser.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{pendingUser.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    pendingUser.role === 'wholesaler' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {pendingUser.role}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{pendingUser.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Business:</span>
                    <span className="ml-2 font-medium">{pendingUser.businessName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Applied:</span>
                    <span className="ml-2 font-medium">{new Date(pendingUser.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Registration Reason:</strong> {pendingUser.registrationReason}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleApproveUser(pendingUser.id)}
                  className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleRejectUser(pendingUser.id)}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => setSelectedPendingUser(pendingUser)}
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

      {/* Pending User Details Modal */}
      {selectedPendingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
              <button
                onClick={() => setSelectedPendingUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedPendingUser.name}</h4>
                  <p className="text-gray-600">{selectedPendingUser.email}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    selectedPendingUser.role === 'wholesaler' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    Applying as {selectedPendingUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedPendingUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedPendingUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedPendingUser.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Business Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{selectedPendingUser.businessName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Applied {new Date(selectedPendingUser.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Registration Reason</h5>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-700">{selectedPendingUser.registrationReason}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleApproveUser(selectedPendingUser.id);
                    setSelectedPendingUser(null);
                  }}
                  className="flex-1 bg-green-50 text-green-600 px-4 py-3 rounded-xl hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Application
                </button>
                <button
                  onClick={() => {
                    handleRejectUser(selectedPendingUser.id);
                    setSelectedPendingUser(null);
                  }}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Application
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
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">All Orders</h2>
        <div className="flex items-center gap-4">
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
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
                    <span className="text-gray-500">Payment:</span>
                    <span className="ml-2 font-medium">{order.paymentMethod || 'N/A'}</span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
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
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method:</span>
                      <span className="font-medium">{selectedOrder.paymentMethod || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.productName}</h5>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                        {user.role === 'wholesaler' ? (
                          <button
                            onClick={() => handleWholesalerClick(user)}
                            className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <BarChart3 className="w-3 h-3" />
                            Analytics
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            View
                          </button>
                        )}
                        <p className="font-semibold text-gray-900">R{item.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">R{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">All Products</h2>
        <div className="text-sm text-gray-500">
          {state.products.length} products
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.products.map((product) => (
          <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
            <img 
              src={product.imageUrl || 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=400'} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{product.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ml-2">
                  {product.category}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Price:</span>
                  <span className="font-bold text-green-600">R{product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Stock:</span>
                  <span className="font-medium text-gray-900">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Min Order:</span>
                  <span className="font-medium text-gray-900">{product.minOrderQuantity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.available ? 'Available' : 'Unavailable'}
                </span>
                <div className="text-xs text-gray-500">
                  Added {new Date(product.createdAt).toLocaleDateString()}
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
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Promotions</h2>
        <div className="flex items-center gap-4">
          <select
            value={promotionFilter}
            onChange={(e) => setPromotionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
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
                  <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                    {promotion.discount}% OFF
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{promotion.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectPromotion(promotion.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Promotion Details</h3>
              <button
                onClick={() => setSelectedPromotion(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
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
                  <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                    {selectedPromotion.discount}% OFF
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{selectedPromotion.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Review Information</h5>
                  <div className="space-y-2 text-sm">
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
                    {selectedPromotion.rejectionReason && (
                      <div>
                        <span className="text-gray-500">Rejection Reason:</span>
                        <p className="text-red-600 mt-1">{selectedPromotion.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedPromotion.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleApprovePromotion(selectedPromotion.id);
                      setSelectedPromotion(null);
                    }}
                    className="flex-1 bg-green-50 text-green-600 px-4 py-3 rounded-xl hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Promotion
                  </button>
                  <button
                    onClick={() => {
                      handleRejectPromotion(selectedPromotion.id);
                      setSelectedPromotion(null);
                    }}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
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
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Wholesaler Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Wholesalers</h3>
          <div className="space-y-3">
            {state.users.filter(u => u.role === 'wholesaler').slice(0, 5).map((wholesaler, index) => {
              const wholesalerOrders = state.orders.filter(o => o.wholesalerId === wholesaler.id);
              const totalRevenue = wholesalerOrders.reduce((sum, order) => sum + order.total, 0);
              
              return (
                <div key={wholesaler.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{wholesaler.name}</p>
                      <p className="text-sm text-gray-500">{wholesaler.businessName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R{totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{wholesalerOrders.length} orders</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Wholesalers:</span>
              <span className="font-bold text-green-600">{state.users.filter(u => u.role === 'wholesaler').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Retailers:</span>
              <span className="font-bold text-orange-600">{state.users.filter(u => u.role === 'retailer').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Products:</span>
              <span className="font-bold text-blue-600">{state.products.filter(p => p.available).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed Orders:</span>
              <span className="font-bold text-purple-600">{state.orders.filter(o => o.status === 'completed').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Promotions:</span>
              <span className="font-bold text-pink-600">{state.promotions.filter(p => p.active && p.status === 'approved').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...new Set(state.products.map(p => p.category))].map(category => {
            const categoryProducts = state.products.filter(p => p.category === category);
            const categoryRevenue = state.orders.reduce((sum, order) => {
              const categoryItems = order.items.filter(item => 
                categoryProducts.some(p => p.id === item.productId)
              );
              return sum + categoryItems.reduce((itemSum, item) => itemSum + item.total, 0);
            }, 0);
            
            return (
              <div key={category} className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">{category}</h4>
                <p className="text-2xl font-bold text-green-600">R{categoryRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{categoryProducts.length} products</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Platform Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">User Registration</p>
                <p className="text-sm text-gray-500">Allow new users to register</p>
              </div>
              <button
                onClick={() => dispatch({ 
                  type: 'UPDATE_PLATFORM_SETTINGS', 
                  payload: { userRegistrationEnabled: !state.platformSettings.userRegistrationEnabled } 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  state.platformSettings.userRegistrationEnabled ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.platformSettings.userRegistrationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Send email notifications to users</p>
              </div>
              <button
                onClick={() => dispatch({ 
                  type: 'UPDATE_PLATFORM_SETTINGS', 
                  payload: { emailNotificationsEnabled: !state.platformSettings.emailNotificationsEnabled } 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  state.platformSettings.emailNotificationsEnabled ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.platformSettings.emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-approve Promotions</p>
                <p className="text-sm text-gray-500">Automatically approve new promotions</p>
              </div>
              <button
                onClick={() => dispatch({ 
                  type: 'UPDATE_PLATFORM_SETTINGS', 
                  payload: { autoApprovePromotions: !state.platformSettings.autoApprovePromotions } 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  state.platformSettings.autoApprovePromotions ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.platformSettings.autoApprovePromotions ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-500">Put platform in maintenance mode</p>
              </div>
              <button
                onClick={handleSystemMaintenance}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  state.platformSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.platformSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Business Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                value={state.platformSettings.commissionRate}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_PLATFORM_SETTINGS', 
                  payload: { commissionRate: Number(e.target.value) } 
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (R)</label>
              <input
                type="number"
                value={state.platformSettings.minimumOrderValue}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_PLATFORM_SETTINGS', 
                  payload: { minimumOrderValue: Number(e.target.value) } 
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Products per Wholesaler</label>
              <input
                type="number"
                value={state.platformSettings.maxProductsPerWholesaler}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_PLATFORM_SETTINGS', 
                  payload: { maxProductsPerWholesaler: Number(e.target.value) } 
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Response Time (hours)</label>
              <input
                type="number"
                value={state.platformSettings.supportResponseTime}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_PLATFORM_SETTINGS', 
                  payload: { supportResponseTime: Number(e.target.value) } 
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">System Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleBackupData}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            Backup Data
          </button>
          
          <button
            onClick={handleResetSettings}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-5 h-5" />
            Reset Settings
          </button>
          
          <button
            onClick={handleSendAnnouncement}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Bell className="w-5 h-5" />
            Send Announcement
          </button>
          
          <button
            onClick={handleBulkUserActions}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Users className="w-5 h-5" />
            Bulk User Actions
          </button>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'overview':
      return renderOverview();
    case 'users':
      return renderUsers();
    case 'pending-applications':
      return renderPendingApplications();
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