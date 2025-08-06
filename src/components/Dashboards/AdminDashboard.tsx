import React, { useState } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User as UserIcon,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Tag,
  Download,
  Save,
  UserCheck,
  UserX,
  Bell,
  Shield,
  Database,
  Server,
  Activity,
  Zap,
  Globe,
  Lock,
  FileText,
  Megaphone,
  Calendar,
  Building,
  Phone,
  MapPin,
  Star,
  UserPlus,
  Truck,
  Store,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRegistrationForm } from '../UserManagement/UserRegistrationForm';
import { User as UserType, Order, Promotion, PendingUser, WholesalerAnalytics } from '../../types';

interface AdminDashboardProps {
  activeTab: string;
}

export function AdminDashboard({ activeTab }: AdminDashboardProps) {
  const { state, dispatch } = useApp();
  
  // All useState hooks at the top level
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [announcement, setAnnouncement] = useState({ message: '', type: 'info' });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [localSettings, setLocalSettings] = useState(state.platformSettings);
  const [selectedWholesaler, setSelectedWholesaler] = useState<string>('all');
  const [showWholesalerDetails, setShowWholesalerDetails] = useState<WholesalerAnalytics | null>(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);
  const [showPendingUsers, setShowPendingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'retailer' as 'wholesaler' | 'retailer',
    businessName: '',
    phone: '',
    address: ''
  });
  const [showUserRegistration, setShowUserRegistration] = useState(false);

  const currentUser = state.currentUser!;

  const filteredUsers = state.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUpdateSettings = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    dispatch({ type: 'UPDATE_PLATFORM_SETTINGS', payload: localSettings });
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      dispatch({ type: 'RESET_SETTINGS_TO_DEFAULT' });
      setLocalSettings(state.platformSettings);
      alert('Settings reset to default values!');
    }
  };

  const handleBulkVerifyUsers = () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to verify');
      return;
    }
    dispatch({ type: 'BULK_VERIFY_USERS', payload: selectedUsers });
    setSelectedUsers([]);
    alert(`${selectedUsers.length} users verified successfully!`);
  };

  const handleSuspendUser = (userId: string) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      dispatch({ type: 'SUSPEND_USER', payload: userId });
      alert('User suspended successfully!');
    }
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.message.trim()) {
      alert('Please enter an announcement message');
      return;
    }
    dispatch({ type: 'BROADCAST_ANNOUNCEMENT', payload: announcement });
    setAnnouncement({ message: '', type: 'info' });
    setShowAnnouncementModal(false);
    alert('Announcement broadcasted successfully!');
  };

  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      users: state.users,
      orders: state.orders,
      products: state.products,
      tickets: state.tickets,
      promotions: state.promotions,
      analytics: state.analytics,
      platformSettings: state.platformSettings
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nwi-platform-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowExportModal(false);
    alert('Report exported successfully!');
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

  const exportWholesalerData = () => {
    const dataToExport = selectedWholesaler === 'all' 
      ? state.wholesalerAnalytics 
      : state.wholesalerAnalytics.filter(w => w.wholesalerId === selectedWholesaler);
    
    const csvContent = generateWholesalerCSV(dataToExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wholesaler_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateWholesalerCSV = (data: WholesalerAnalytics[]) => {
    const headers = [
      'Wholesaler Name',
      'Business Name',
      'Total Revenue',
      'Total Orders',
      'Total Products',
      'Active Promotions',
      'Average Order Value',
      'Customer Count',
      'Repeat Customer Rate',
      'Stock Turnover',
      'Average Rating',
      'Support Tickets',
      'Return Rate',
      'Fulfillment Rate',
      'Join Date',
      'Last Order Date'
    ];
    
    const csvRows = [
      headers.join(','),
      ...data.map(wholesaler => [
        wholesaler.wholesalerName,
        wholesaler.businessName,
        wholesaler.totalRevenue,
        wholesaler.totalOrders,
        wholesaler.totalProducts,
        wholesaler.activePromotions,
        wholesaler.averageOrderValue,
        wholesaler.customerCount,
        `${wholesaler.repeatCustomerRate}%`,
        wholesaler.stockTurnover,
        wholesaler.averageRating,
        wholesaler.supportTickets,
        `${wholesaler.returnRate}%`,
        `${wholesaler.fulfillmentRate}%`,
        wholesaler.joinDate,
        wholesaler.lastOrderDate
      ].join(','))
    ];
    
    return csvRows.join('\n');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleApproveUser = (pendingUserId: string) => {
    dispatch({ 
      type: 'APPROVE_USER', 
      payload: { 
        pendingUserId, 
        adminId: state.currentUser!.id 
      } 
    });
    alert('User approved successfully!');
  };

  const handleRejectUser = (pendingUserId: string, reason: string) => {
    dispatch({ 
      type: 'REJECT_USER', 
      payload: { 
        pendingUserId, 
        adminId: state.currentUser!.id, 
        reason 
      } 
    });
    alert('User application rejected.');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Add user logic here
    setShowAddUser(false);
    setNewUser({
      name: '',
      email: '',
      role: 'retailer',
      businessName: '',
      phone: '',
      address: ''
    });
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
              <p className="text-sm font-medium text-gray-600">Support Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{state.tickets.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {state.orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <ShoppingCart className="w-4 h-4 text-gray-600" />
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

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {state.users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'wholesaler' ? 'bg-green-100 text-green-800' :
                  user.role === 'retailer' ? 'bg-orange-100 text-orange-800' :
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'wholesaler' | 'retailer'})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="retailer">Retailer</option>
                  <option value="wholesaler">Wholesaler</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={newUser.businessName}
                  onChange={(e) => setNewUser({...newUser, businessName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+27-123-456-789"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending User Details Modal */}
      {selectedPendingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">User Registration Details</h3>
              <button
                onClick={() => setSelectedPendingUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <UserIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedPendingUser.name}</h4>
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
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Business Name:</span>
                      <span className="font-medium">{selectedPendingUser.businessName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{selectedPendingUser.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-500">Address:</span>
                      <span className="font-medium">{selectedPendingUser.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Registration Details</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Submitted:</span>
                      <span className="font-medium">{new Date(selectedPendingUser.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {selectedPendingUser.documents && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Documents:</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {selectedPendingUser.documents.map((doc, index) => (
                            <div key={index} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                              📄 {doc}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  Approve User
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason:');
                    if (reason) {
                      handleRejectUser(selectedPendingUser.id, reason);
                      setSelectedPendingUser(null);
                    }
                  }}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject User
                </button>
              </div>
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
            onClick={() => setShowUserRegistration(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
          <div className="text-sm text-gray-500">
            {state.users.length} total users
          </div>
        </div>
      </div>

      {/* Pending Applications Section */}
      {state.pendingUsers.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-500" />
              Pending Applications
            </h3>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {state.pendingUsers.length} waiting for approval
            </span>
          </div>
          
          <div className="space-y-4">
            {state.pendingUsers.map((pendingUser) => (
              <div key={pendingUser.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        {pendingUser.role === 'wholesaler' ? (
                          <Building className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Store className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{pendingUser.name}</h4>
                        <p className="text-sm text-gray-600">{pendingUser.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        pendingUser.role === 'wholesaler' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {pendingUser.role === 'wholesaler' ? '🏭 Wholesaler' : '🏪 Retailer'}
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
                        <span className="text-gray-500">Applied:</span>
                        <span className="ml-2 font-medium">{new Date(pendingUser.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-gray-500 text-sm">Address:</span>
                      <p className="text-gray-900 font-medium">{pendingUser.address}</p>
                    </div>
                    
                    <div className="bg-white/50 rounded-lg p-3">
                      <span className="text-gray-500 text-sm">Registration Reason:</span>
                      <p className="text-gray-900 mt-1">{pendingUser.registrationReason}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:w-32">
                    <button
                      onClick={() => handleApproveUser(pendingUser.id)}
                      className="flex-1 bg-green-50 text-green-600 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) {
                          handleRejectUser(pendingUser.id, reason);
                        }
                      }}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="bg-gray-100 p-3 rounded-xl">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'wholesaler' ? 'bg-green-100 text-green-800' :
                      user.role === 'retailer' ? 'bg-orange-100 text-orange-800' :
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                    {user.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 font-medium">{user.email}</span>
                    </div>
                    {user.businessName && (
                      <div>
                        <span className="text-gray-500">Business:</span>
                        <span className="ml-2 font-medium">{user.businessName}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Joined:</span>
                      <span className="ml-2 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {!user.verified && (
                  <button
                    onClick={() => handleBulkVerifyUsers()}
                    className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Verify
                  </button>
                )}
                <button
                  onClick={() => handleSuspendUser(user.id)}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  Suspend
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <UserRegistrationForm 
        isOpen={showUserRegistration} 
        onClose={() => setShowUserRegistration(false)} 
      />
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">All Orders</h2>
        <div className="text-sm text-gray-500">
          {state.orders.length} total orders
        </div>
      </div>

      <div className="space-y-4">
        {state.orders.map((order) => (
          <div key={order.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
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
                    <span className={`ml-2 font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-600' :
                      order.paymentStatus === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {order.paymentStatus}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="text-right">
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
          {state.products.length} total products
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.products.map((product) => (
          <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
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
                <div className="text-right">
                  <p className="text-xs text-gray-500">Wholesaler ID:</p>
                  <p className="font-medium text-gray-900">#{product.wholesalerId}</p>
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
        <div className="text-sm text-gray-500">
          {state.promotions.length} total promotions
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.promotions.map((promotion) => (
          <div key={promotion.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{promotion.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{promotion.description}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(promotion.status)}`}>
                {getStatusIcon(promotion.status)}
                {promotion.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Discount:</span>
                <span className="font-bold text-purple-600">{promotion.discount}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valid From:</span>
                <span className="font-medium">{new Date(promotion.validFrom).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valid To:</span>
                <span className="font-medium">{new Date(promotion.validTo).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Products:</span>
                <span className="font-medium">{promotion.productIds.length}</span>
              </div>
            </div>

            {promotion.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprovePromotion(promotion.id)}
                  className="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRejectPromotion(promotion.id)}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
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
            <option value="all">All Wholesalers</option>
            {state.wholesalerAnalytics.map(wholesaler => (
              <option key={wholesaler.wholesalerId} value={wholesaler.wholesalerId}>
                {wholesaler.businessName}
              </option>
            ))}
          </select>
          <button
            onClick={exportWholesalerData}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Wholesalers</p>
              <p className="text-3xl font-bold text-gray-900">{state.users.filter(u => u.role === 'wholesaler').length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Combined Revenue</p>
              <p className="text-3xl font-bold text-gray-900">R{state.wholesalerAnalytics.reduce((sum, w) => sum + w.totalRevenue, 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{state.wholesalerAnalytics.reduce((sum, w) => sum + w.totalProducts, 0)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-3xl font-bold text-gray-900">{state.wholesalerAnalytics.reduce((sum, w) => sum + w.activePromotions, 0)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Wholesaler Cards */}
      <div className="space-y-4">
        {(selectedWholesaler === 'all' ? state.wholesalerAnalytics : state.wholesalerAnalytics.filter(w => w.wholesalerId === selectedWholesaler)).map((wholesaler) => (
          <div key={wholesaler.wholesalerId} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{wholesaler.businessName}</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Wholesaler
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{wholesaler.averageRating}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">Owner: {wholesaler.wholesalerName}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Revenue:</span>
                    <span className="ml-2 font-bold text-green-600">R{wholesaler.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Orders:</span>
                    <span className="ml-2 font-medium">{wholesaler.totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Products:</span>
                    <span className="ml-2 font-medium">{wholesaler.totalProducts}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Customers:</span>
                    <span className="ml-2 font-medium">{wholesaler.totalCustomers}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fulfillment:</span>
                    <span className="ml-2 font-medium text-green-600">{wholesaler.fulfillmentRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Return Rate:</span>
                    <span className="ml-2 font-medium text-red-600">{wholesaler.returnRate}%</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWholesalerDetails(wholesaler)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Avg Order Value</p>
                    <p className="text-lg font-bold text-gray-900">R{wholesaler.averageOrderValue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Repeat Customers</p>
                    <p className="text-lg font-bold text-gray-900">{wholesaler.repeatCustomerRate}%</p>
                  </div>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Stock Turnover</p>
                    <p className="text-lg font-bold text-gray-900">{wholesaler.stockTurnover}x</p>
                  </div>
                  <Package className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Support Tickets</p>
                    <p className="text-lg font-bold text-gray-900">{wholesaler.supportTickets}</p>
                  </div>
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Wholesaler Details Modal */}
      {showWholesalerDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{showWholesalerDetails.businessName} - Detailed Analytics</h3>
              <button
                onClick={() => setShowWholesalerDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Business Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Business Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-medium">{showWholesalerDetails.wholesalerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Join Date:</span>
                      <span className="font-medium">{new Date(showWholesalerDetails.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Order:</span>
                      <span className="font-medium">{new Date(showWholesalerDetails.lastOrderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{showWholesalerDetails.averageRating}/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fulfillment Rate:</span>
                      <span className="font-medium text-green-600">{showWholesalerDetails.fulfillmentRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Return Rate:</span>
                      <span className="font-medium text-red-600">{showWholesalerDetails.returnRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Repeat Customer Rate:</span>
                      <span className="font-medium text-blue-600">{showWholesalerDetails.repeatCustomerRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Stock Turnover:</span>
                      <span className="font-medium">{showWholesalerDetails.stockTurnover}x per year</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {showWholesalerDetails.monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="bg-blue-500 rounded-t w-full min-h-[4px]"
                          style={{ 
                            height: `${(month.revenue / Math.max(...showWholesalerDetails.monthlyRevenue.map(m => m.revenue))) * 100}%` 
                          }}
                        ></div>
                        <span className="text-xs text-gray-600 mt-2">{month.month}</span>
                        <span className="text-xs font-medium text-gray-900">R{(month.revenue / 1000).toFixed(0)}k</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Top Performing Products</h4>
                <div className="space-y-3">
                  {showWholesalerDetails.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">R{product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{product.sales} units sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {showWholesalerDetails.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{activity.activity}</p>
                        <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-semibold text-blue-600">{activity.value}</span>
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

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Platform Settings</h2>
        <div className="flex gap-3">
          <button
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
          <button
            onClick={handleResetSettings}
            className="bg-gradient-to-r from-gray-600 to-slate-600 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-slate-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RotateCcw className="w-5 h-5" />
            Reset to Default
          </button>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{state.users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold">{state.orders.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold">{state.products.length}</p>
            </div>
            <Package className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Support Tickets</p>
              <p className="text-3xl font-bold">{state.tickets.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Active Promotions</p>
              <p className="text-3xl font-bold">{state.promotions.filter(p => p.active).length}</p>
            </div>
            <Tag className="w-8 h-8 text-pink-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Return Requests</p>
              <p className="text-3xl font-bold">{state.returnRequests.length}</p>
            </div>
            <Package className="w-8 h-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Verified Users</p>
              <p className="text-3xl font-bold">{state.users.filter(u => u.verified).length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-teal-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Pending Issues</p>
              <p className="text-3xl font-bold">{state.tickets.filter(t => t.status === 'open').length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          System Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-gray-900">User Registration</h4>
                <p className="text-sm text-gray-500">Allow new users to register</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.userRegistrationEnabled}
                  onChange={(e) => handleUpdateSettings('userRegistrationEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-500">Send email notifications to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.emailNotificationsEnabled}
                  onChange={(e) => handleUpdateSettings('emailNotificationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-gray-900">Auto-approve Promotions</h4>
                <p className="text-sm text-gray-500">Automatically approve new promotions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoApprovePromotions}
                  onChange={(e) => handleUpdateSettings('autoApprovePromotions', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-gray-900">Maintenance Mode</h4>
                <p className="text-sm text-gray-500">Put platform in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.maintenanceMode}
                  onChange={(e) => handleUpdateSettings('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={localSettings.commissionRate}
                onChange={(e) => handleUpdateSettings('commissionRate', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Order Value (R)</label>
              <input
                type="number"
                min="0"
                value={localSettings.minimumOrderValue}
                onChange={(e) => handleUpdateSettings('minimumOrderValue', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Products per Wholesaler</label>
              <input
                type="number"
                min="1"
                value={localSettings.maxProductsPerWholesaler}
                onChange={(e) => handleUpdateSettings('maxProductsPerWholesaler', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Support Response Time (hours)</label>
              <input
                type="number"
                min="1"
                max="168"
                value={localSettings.supportResponseTime}
                onChange={(e) => handleUpdateSettings('supportResponseTime', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          System Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <Server className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Server Uptime</p>
            <p className="text-2xl font-bold text-green-600">{state.systemStats.serverUptime}%</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Response Time</p>
            <p className="text-2xl font-bold text-blue-600">{state.systemStats.responseTime}ms</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
            <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Active Sessions</p>
            <p className="text-2xl font-bold text-purple-600">{state.systemStats.activeSessions.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Daily Transactions</p>
            <p className="text-2xl font-bold text-orange-600">{state.systemStats.dailyTransactions}</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
            <CheckCircle className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-teal-600">{state.systemStats.transactionSuccessRate}%</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Failed Payments</p>
            <p className="text-2xl font-bold text-red-600">{state.systemStats.failedPayments}</p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Security & Compliance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500">Require 2FA for all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.twoFactorRequired}
                  onChange={(e) => handleUpdateSettings('twoFactorRequired', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-gray-900">Data Encryption</h4>
                <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.dataEncryptionEnabled}
                  onChange={(e) => handleUpdateSettings('dataEncryptionEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-semibold text-gray-900">Audit Logging</h4>
                <p className="text-sm text-gray-500">Log all administrative actions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.auditLoggingEnabled}
                  onChange={(e) => handleUpdateSettings('auditLoggingEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Security Status</h4>
              </div>
              <p className="text-sm text-green-700">All security features are active and functioning properly.</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Data Backup</h4>
              </div>
              <p className="text-sm text-blue-700">Last backup: {new Date().toLocaleDateString()} - All data secured.</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Compliance</h4>
              </div>
              <p className="text-sm text-purple-700">GDPR compliant - Data protection policies active.</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Management Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Megaphone className="w-6 h-6" />
            Broadcast Announcement
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download className="w-6 h-6" />
            Export Reports
          </button>
          
          <button
            onClick={handleBulkVerifyUsers}
            className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <UserCheck className="w-6 h-6" />
            Bulk Verify Users
          </button>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Broadcast Announcement</h3>
            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter your announcement message..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={announcement.type}
                  onChange={(e) => setAnnouncement({...announcement, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Export Platform Report</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Report Contents:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All user data and statistics</li>
                  <li>• Order history and analytics</li>
                  <li>• Product catalog information</li>
                  <li>• Support tickets and resolutions</li>
                  <li>• Promotion campaigns data</li>
                  <li>• Platform settings and configuration</li>
                </ul>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportReport}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  Export Report
                </button>
              </div>
            </div>
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