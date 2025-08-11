import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Settings, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar, 
  Star, 
  MessageSquare, 
  FileText, 
  Shield, 
  Activity, 
  Database, 
  Server, 
  Wifi, 
  HardDrive, 
  Cpu, 
  CreditCard,
  Truck,
  Tag,
  Users as UsersIcon,
  ShoppingBag,
  Percent,
  Target,
  TrendingDown,
  Lock,
  Globe,
  Bell,
  Zap,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType, Product, Order, SupportTicket, Promotion, PendingUser } from '../../types';

interface AdminDashboardProps {
  activeTab: string;
}

export function AdminDashboard({ activeTab }: AdminDashboardProps) {
  const { state, dispatch } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [promotionFilter, setPromotionFilter] = useState('all');
  const [showNewUser, setShowNewUser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'retailer' as 'wholesaler' | 'retailer' | 'admin' | 'support',
    businessName: '',
    phone: '',
    address: ''
  });

  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState(state.platformSettings);
  const [settingsChanged, setSettingsChanged] = useState(false);

  const currentUser = state.currentUser!;

  const handleApproveUser = (pendingUserId: string) => {
    dispatch({ type: 'APPROVE_USER', payload: { pendingUserId, adminId: currentUser.id } });
  };

  const handleRejectUser = (pendingUserId: string, reason: string) => {
    dispatch({ type: 'REJECT_USER', payload: { pendingUserId, adminId: currentUser.id, reason } });
  };

  const handleApprovePromotion = (promotionId: string) => {
    dispatch({ type: 'APPROVE_PROMOTION', payload: { id: promotionId, adminId: currentUser.id } });
  };

  const handleRejectPromotion = (promotionId: string, reason: string) => {
    dispatch({ type: 'REJECT_PROMOTION', payload: { id: promotionId, adminId: currentUser.id, reason } });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: UserType = {
      id: Date.now().toString(),
      ...newUser,
      verified: true,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_USER', payload: user });
    setNewUser({
      name: '',
      email: '',
      role: 'retailer',
      businessName: '',
      phone: '',
      address: ''
    });
    setShowNewUser(false);
  };

  const handleBulkVerifyUsers = () => {
    const unverifiedUserIds = state.users.filter(u => !u.verified).map(u => u.id);
    if (unverifiedUserIds.length > 0) {
      dispatch({ type: 'BULK_VERIFY_USERS', payload: unverifiedUserIds });
    }
  };

  const handleSuspendUser = (userId: string) => {
    dispatch({ type: 'SUSPEND_USER', payload: userId });
  };

  const handleBroadcastAnnouncement = () => {
    const message = prompt('Enter announcement message:');
    if (message) {
      dispatch({ type: 'BROADCAST_ANNOUNCEMENT', payload: { message, type: 'info' } });
      alert('Announcement sent to all users!');
    }
  };

  const handleUpdateSettings = (key: string, value: any) => {
    setPlatformSettings(prev => ({ ...prev, [key]: value }));
    setSettingsChanged(true);
  };

  const handleSaveSettings = () => {
    dispatch({ type: 'UPDATE_PLATFORM_SETTINGS', payload: platformSettings });
    setSettingsChanged(false);
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      dispatch({ type: 'RESET_SETTINGS_TO_DEFAULT' });
      setPlatformSettings(state.platformSettings);
      setSettingsChanged(false);
    }
  };

  const filteredUsers = state.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = productFilter === 'all' || 
                         (productFilter === 'available' && product.available) ||
                         (productFilter === 'unavailable' && !product.available);
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = state.orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesFilter;
  });

  const filteredPromotions = state.promotions.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = promotionFilter === 'all' || promotion.status === promotionFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
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
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-3xl font-bold text-gray-900">{state.pendingUsers.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowNewUser(true)}
            className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add New User
          </button>
          <button
            onClick={handleBulkVerifyUsers}
            className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium"
          >
            <CheckCircle className="w-5 h-5" />
            Verify All Users
          </button>
          <button
            onClick={handleBroadcastAnnouncement}
            className="flex items-center gap-3 p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium"
          >
            <Bell className="w-5 h-5" />
            Send Announcement
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-3 p-4 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
          >
            <Settings className="w-5 h-5" />
            Platform Settings
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {state.users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {getStatusIcon(user.status)}
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {state.orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">R{order.total.toLocaleString()}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowNewUser(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add New User
        </button>
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

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'wholesaler' ? 'bg-green-100 text-green-800' :
                    user.role === 'retailer' ? 'bg-orange-100 text-orange-800' :
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                    {getStatusIcon(user.status)}
                    {user.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Business:</span>
                    <span className="ml-2 font-medium">{user.businessName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{user.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Verified:</span>
                    <span className={`ml-2 font-medium ${user.verified ? 'text-green-600' : 'text-red-600'}`}>
                      {user.verified ? 'Yes' : 'No'}
                    </span>
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
                    onClick={() => handleBulkVerifyUsers()}
                    className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
                  >
                    Verify
                  </button>
                )}
                {user.status === 'active' && (
                  <button
                    onClick={() => handleSuspendUser(user.id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
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
                <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.role === 'wholesaler' ? 'bg-green-100 text-green-800' :
                      selectedUser.role === 'retailer' ? 'bg-orange-100 text-orange-800' :
                      selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                      {getStatusIcon(selectedUser.status)}
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{selectedUser.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Business Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Business:</span>
                      <span className="font-medium">{selectedUser.businessName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Joined:</span>
                      <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Verified:</span>
                      <span className={`font-medium ${selectedUser.verified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New User Modal */}
      {showNewUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="retailer">Retailer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="admin">Admin</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={newUser.businessName}
                  onChange={(e) => setNewUser({...newUser, businessName: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  rows={3}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewUser(false)}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Create User
                </button>
              </div>
            </form>
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
                  <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{pendingUser.name}</h3>
                    <p className="text-gray-600">{pendingUser.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    pendingUser.role === 'wholesaler' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {pendingUser.role}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Business:</span>
                    <span className="ml-2 font-medium">{pendingUser.businessName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{pendingUser.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <span className="ml-2 font-medium">{new Date(pendingUser.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-gray-500 text-sm">Registration Reason:</span>
                  <p className="text-gray-900 font-medium mt-1">{pendingUser.registrationReason}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPendingUser(pendingUser)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => handleApproveUser(pendingUser.id)}
                  className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason:');
                    if (reason) {
                      handleRejectUser(pendingUser.id, reason);
                    }
                  }}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending User Details Modal */}
      {selectedPendingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Application Details</h3>
              <button
                onClick={() => setSelectedPendingUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedPendingUser.name}</h4>
                  <p className="text-gray-600">{selectedPendingUser.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPendingUser.role === 'wholesaler' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    Applying as {selectedPendingUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Contact Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedPendingUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedPendingUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{selectedPendingUser.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Business Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Business:</span>
                      <span className="font-medium">{selectedPendingUser.businessName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium">{new Date(selectedPendingUser.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Registration Reason</h5>
                <p className="text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">{selectedPendingUser.registrationReason}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleApproveUser(selectedPendingUser.id);
                    setSelectedPendingUser(null);
                  }}
                  className="flex-1 bg-green-50 text-green-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-green-100 transition-colors font-medium text-sm sm:text-base"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason:');
                    if (reason) {
                      handleRejectUser(selectedPendingUser.id, reason);
                      setSelectedPendingUser(null);
                    }
                  }}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-red-100 transition-colors font-medium text-sm sm:text-base"
                >
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
                    <span className="text-gray-500">Retailer:</span>
                    <span className="ml-2 font-medium">#{order.retailerId}</span>
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
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Date:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Total:</span>
                      <span className="font-bold text-green-600 text-sm sm:text-base">R{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Payment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Status:</span>
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
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">{item.productName}</h5>
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
        <div className="flex items-center gap-4">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Products</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <div className="text-sm text-gray-500">
            {filteredProducts.length} products
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-32 sm:h-48 object-cover"
            />
            <div className="p-3 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-base sm:text-lg line-clamp-2 text-gray-900">{product.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ml-2">
                  {product.category}
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">Price:</span>
                  <span className="font-bold text-green-600 text-sm sm:text-base">R{product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">Stock:</span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">Status:</span>
                  <span className={`font-medium text-sm sm:text-base ${product.available ? 'text-green-600' : 'text-red-600'}`}>
                    {product.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedProduct(product)}
                className="w-full bg-blue-50 text-blue-600 py-2 sm:py-3 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Product Details</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name}
                  className="w-full sm:w-48 h-48 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{selectedProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-bold text-green-600">R{selectedProduct.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Stock:</span>
                      <span className="font-medium">{selectedProduct.stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Min Order:</span>
                      <span className="font-medium">{selectedProduct.minOrderQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${selectedProduct.available ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProduct.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) {
                          handleRejectPromotion(promotion.id, reason);
                        }
                      }}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
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
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2">{selectedPromotion.title}</h4>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPromotion.status)}`}>
                    {getStatusIcon(selectedPromotion.status)}
                    {selectedPromotion.status}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                    {selectedPromotion.discount}% OFF
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{selectedPromotion.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Promotion Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Discount:</span>
                      <span className="font-bold text-red-600 text-sm sm:text-base">{selectedPromotion.discount}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Valid From:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedPromotion.validFrom).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Valid To:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedPromotion.validTo).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Products:</span>
                      <span className="font-medium text-xs sm:text-sm">{selectedPromotion.productIds.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Status Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Submitted:</span>
                      <span className="font-medium text-xs sm:text-sm">{new Date(selectedPromotion.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {selectedPromotion.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs sm:text-sm">Reviewed:</span>
                        <span className="font-medium text-xs sm:text-sm">{new Date(selectedPromotion.reviewedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs sm:text-sm">Active:</span>
                      <span className={`font-medium text-xs sm:text-sm ${selectedPromotion.active ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedPromotion.active ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPromotion.rejectionReason && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Rejection Reason</h5>
                  <p className="text-red-600 bg-red-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">{selectedPromotion.rejectionReason}</p>
                </div>
              )}

              {selectedPromotion.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleApprovePromotion(selectedPromotion.id);
                      setSelectedPromotion(null);
                    }}
                    className="flex-1 bg-green-50 text-green-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-green-100 transition-colors font-medium text-sm sm:text-base"
                  >
                    Approve Promotion
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) {
                        handleRejectPromotion(selectedPromotion.id, reason);
                        setSelectedPromotion(null);
                      }
                    }}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-red-100 transition-colors font-medium text-sm sm:text-base"
                  >
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
      
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">R{state.orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Wholesalers</p>
              <p className="text-3xl font-bold text-gray-900">{state.users.filter(u => u.role === 'wholesaler').length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
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

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-3xl font-bold text-gray-900">{state.promotions.filter(p => p.active).length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Wholesaler Performance */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Wholesalers</h3>
        <div className="space-y-4">
          {state.users.filter(u => u.role === 'wholesaler').slice(0, 5).map((wholesaler, index) => {
            const wholesalerOrders = state.orders.filter(o => o.wholesalerId === wholesaler.id);
            const totalRevenue = wholesalerOrders.reduce((sum, order) => sum + order.total, 0);
            const totalProducts = state.products.filter(p => p.wholesalerId === wholesaler.id).length;
            
            return (
              <div key={wholesaler.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{wholesaler.name}</h4>
                    <p className="text-sm text-gray-500">{wholesaler.businessName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">R{totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{totalProducts} products • {wholesalerOrders.length} orders</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {['pending', 'accepted', 'ready', 'completed', 'cancelled'].map(status => {
              const count = state.orders.filter(o => o.status === status).length;
              const percentage = state.orders.length > 0 ? (count / state.orders.length) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Product Categories</h3>
          <div className="space-y-3">
            {[...new Set(state.products.map(p => p.category))].map(category => {
              const count = state.products.filter(p => p.category === category).length;
              const percentage = state.products.length > 0 ? (count / state.products.length) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Platform Settings</h2>
        <div className="flex gap-3">
          {settingsChanged && (
            <button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          )}
          <button
            onClick={handleResetSettings}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
          >
            <RefreshCw className="w-5 h-5 inline mr-2" />
            Reset to Default
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          General Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">User Registration</label>
                <p className="text-sm text-gray-500">Allow new users to register</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.userRegistrationEnabled}
                  onChange={(e) => handleUpdateSettings('userRegistrationEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Email Notifications</label>
                <p className="text-sm text-gray-500">Send email notifications to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.emailNotificationsEnabled}
                  onChange={(e) => handleUpdateSettings('emailNotificationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Auto-approve Promotions</label>
                <p className="text-sm text-gray-500">Automatically approve promotion requests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.autoApprovePromotions}
                  onChange={(e) => handleUpdateSettings('autoApprovePromotions', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Maintenance Mode</label>
                <p className="text-sm text-gray-500">Put the platform in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.maintenanceMode}
                  onChange={(e) => handleUpdateSettings('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-900 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={platformSettings.commissionRate}
                onChange={(e) => handleUpdateSettings('commissionRate', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">Minimum Order Value (R)</label>
              <input
                type="number"
                min="0"
                value={platformSettings.minimumOrderValue}
                onChange={(e) => handleUpdateSettings('minimumOrderValue', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">Max Products per Wholesaler</label>
              <input
                type="number"
                min="1"
                value={platformSettings.maxProductsPerWholesaler}
                onChange={(e) => handleUpdateSettings('maxProductsPerWholesaler', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">Support Response Time (hours)</label>
              <input
                type="number"
                min="1"
                value={platformSettings.supportResponseTime}
                onChange={(e) => handleUpdateSettings('supportResponseTime', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Security Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Two-Factor Authentication</label>
                <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.twoFactorRequired}
                  onChange={(e) => handleUpdateSettings('twoFactorRequired', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Data Encryption</label>
                <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.dataEncryptionEnabled}
                  onChange={(e) => handleUpdateSettings('dataEncryptionEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Audit Logging</label>
                <p className="text-sm text-gray-500">Log all admin actions for compliance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformSettings.auditLoggingEnabled}
                  onChange={(e) => handleUpdateSettings('auditLoggingEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          System Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Server Uptime</p>
                <p className="text-2xl font-bold text-green-600">{state.systemStats.serverUptime}%</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">{state.systemStats.responseTime}ms</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-900">Active Sessions</p>
                <p className="text-2xl font-bold text-purple-600">{state.systemStats.activeSessions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">Daily Transactions</p>
                <p className="text-2xl font-bold text-orange-600">{state.systemStats.dailyTransactions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {settingsChanged && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 font-medium">You have unsaved changes. Don't forget to save your settings!</p>
          </div>
        </div>
      )}
    </div>
  );

  // Settings Modal
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Platform Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        {renderSettings()}
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