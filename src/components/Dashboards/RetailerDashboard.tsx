import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  CreditCard, 
  MessageSquare, 
  Plus, 
  Minus,
  Eye,
  Search,
  Filter,
  Star,
  User,
  Phone,
  MapPin,
  Mail,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Order, OrderItem, SupportTicket } from '../../types';
import { CheckoutPage } from '../Checkout/CheckoutPage';

interface RetailerDashboardProps {
  activeTab: string;
}

export function RetailerDashboard({ activeTab }: RetailerDashboardProps) {
  const { state, dispatch } = useApp();
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' as const });
  const [showCheckout, setShowCheckout] = useState(false);

  const currentUser = state.currentUser!;
  const myOrders = state.orders.filter(o => o.retailerId === currentUser.id);
  const myTickets = state.tickets.filter(t => t.userId === currentUser.id);

  // Get active promotions
  const activePromotions = state.promotions.filter(p => p.active && p.status === 'approved');
  
  // Check if a product is on promotion
  const isProductOnPromotion = (productId: string) => {
    return activePromotions.some(promo => promo.productIds.includes(productId));
  };
  
  // Get promotion discount for a product
  const getProductDiscount = (productId: string) => {
    const promotion = activePromotions.find(promo => promo.productIds.includes(productId));
    return promotion ? promotion.discount : 0;
  };
  
  // Calculate discounted price
  const getDiscountedPrice = (product: Product) => {
    const discount = getProductDiscount(product.id);
    return discount > 0 ? product.price * (1 - discount / 100) : product.price;
  };
  
  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.available;
  }).sort((a, b) => {
    // Sort promoted products to the top
    const aOnPromotion = isProductOnPromotion(a.id);
    const bOnPromotion = isProductOnPromotion(b.id);
    
    if (aOnPromotion && !bOnPromotion) return -1;
    if (!aOnPromotion && bOnPromotion) return 1;
    
    // If both are promoted or both are not promoted, sort by name
    return a.name.localeCompare(b.name);
  });

  const categories = [...new Set(state.products.map(p => p.category))];

  const addToCart = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
      const currentQuantity = cart[productId] || 0;
      const newQuantity = currentQuantity + product.minOrderQuantity;
      if (newQuantity <= product.stock && product.available) {
        setCart({ ...cart, [productId]: newQuantity });
      } else if (!product.available) {
        alert('This product is currently unavailable');
      } else {
        alert(`Only ${product.stock} units available in stock`);
      }
    }
  };

  const removeFromCart = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
      const currentQuantity = cart[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity - product.minOrderQuantity);
      if (newQuantity === 0) {
        const newCart = { ...cart };
        delete newCart[productId];
        setCart(newCart);
      } else {
        setCart({ ...cart, [productId]: newQuantity });
      }
    }
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = state.products.find(p => p.id === productId);
      return total + (product ? getDiscountedPrice(product) * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) return;
    setShowCheckout(true);
  };

  const handleCheckoutComplete = () => {
    setCart({});
    setShowCheckout(false);
  };

  // Show checkout page if in checkout mode
  if (showCheckout) {
    return (
      <CheckoutPage 
        cart={cart}
        onBack={() => setShowCheckout(false)}
        onOrderComplete={handleCheckoutComplete}
      />
    );
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: SupportTicket = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      ...newTicket,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TICKET', payload: ticket });
    setNewTicket({ subject: '', description: '', priority: 'medium' });
    setShowNewTicket(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Retailer Dashboard</h2>
        <div className="text-sm text-gray-500">
          Welcome back, {currentUser.name}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{myOrders.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900">R{myOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cart Items</p>
              <p className="text-3xl font-bold text-gray-900">{getCartItemCount()}</p>
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
              <p className="text-3xl font-bold text-gray-900">{myTickets.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
        </div>
        <div className="p-6">
          {myOrders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">R{order.total.toLocaleString()}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBrowse = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Browse Products</h2>
        {getCartItemCount() > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Cart: {getCartItemCount()} items (R{getCartTotal().toLocaleString()})
            </div>
            <button
              onClick={handleCheckout}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ShoppingCart className="w-5 h-5" />
              Checkout
            </button>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="space-y-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Categories:</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                  selectedCategory === '' 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                All Categories
              </button>
              {categories.map((category, index) => {
                const colors = [
                  'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                  'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                  'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                  'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
                  'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
                  'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
                  'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                  'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                      selectedCategory === category 
                        ? `bg-gradient-to-r ${colorClass} text-white shadow-lg transform scale-105` 
                        : `bg-gradient-to-r ${colorClass} text-white opacity-70 hover:opacity-100 hover:shadow-md hover:transform hover:scale-102`
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className={`backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 ${
            isProductOnPromotion(product.id) 
              ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-orange-300 ring-2 ring-orange-200 shadow-orange-100' 
              : 'bg-white/80 border-white/20'
          }`}>
            {/* Promotion Badge */}
            {isProductOnPromotion(product.id) && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  🔥 {getProductDiscount(product.id)}% OFF
                </div>
              </div>
            )}
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className={`w-full h-32 sm:h-48 object-cover ${
                isProductOnPromotion(product.id) ? 'ring-2 ring-orange-200' : ''
              }`}
            />
            <div className="p-3 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className={`font-bold text-base sm:text-lg line-clamp-2 ${
                  isProductOnPromotion(product.id) ? 'text-orange-900' : 'text-gray-900'
                }`}>{product.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ml-2">
                  {product.category}
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">Price:</span>
                  <div className="text-right">
                    {isProductOnPromotion(product.id) ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 line-through">R{product.price}</span>
                        <span className="font-bold text-red-600 text-sm sm:text-base">R{getDiscountedPrice(product).toFixed(0)}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-green-600 text-sm sm:text-base">R{product.price}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">Stock:</span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">Min Order:</span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{product.minOrderQuantity}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    disabled={!cart[product.id]}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <span className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base">
                    {cart[product.id] || 0}
                  </span>
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0 || (cart[product.id] || 0) >= product.stock}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-gray-500">Total:</p>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">
                    R{((cart[product.id] || 0) * getDiscountedPrice(product)).toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">My Orders</h2>
        <div className="text-sm text-gray-500">
          {myOrders.length} total orders
        </div>
      </div>

      <div className="space-y-4">
        {myOrders.map((order) => (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Payments</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-bold text-green-600">R{myOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid Orders:</span>
              <span className="font-medium">{myOrders.filter(o => o.paymentStatus === 'paid').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Payments:</span>
              <span className="font-medium text-yellow-600">{myOrders.filter(o => o.paymentStatus === 'pending').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Credit Card</span>
              </div>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium">Bank Transfer</span>
              </div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
        </div>
        <div className="p-6">
          {myOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">R{order.total.toLocaleString()}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Support</h2>
        <button
          onClick={() => setShowNewTicket(true)}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      <div className="space-y-4">
        {myTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{ticket.description}</p>
                <div className="text-sm text-gray-500">
                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Create Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Profile</h2>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-6 mb-8">
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 w-20 h-20 rounded-2xl flex items-center justify-center">
            <User className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentUser.name}</h3>
            <p className="text-gray-600">{currentUser.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Retailer Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Business Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Business Name</label>
                <p className="text-gray-900 font-medium">{currentUser.businessName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {currentUser.phone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {currentUser.address}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Details
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {currentUser.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Verification Status</label>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Verified Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'overview':
      return renderOverview();
    case 'browse':
      return renderBrowse();
    case 'orders':
      return renderOrders();
    case 'payments':
      return renderPayments();
    case 'support':
      return renderSupport();
    case 'profile':
      return renderProfile();
    default:
      return renderOverview();
  }
}