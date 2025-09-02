import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  Calendar,
  MapPin,
  CreditCard,
  Tag,
  AlertTriangle,
  Star,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  RefreshCw
} from 'lucide-react';
import { User, Product, Order, Promotion } from '../../types';

interface WholesalerAnalyticsModalProps {
  wholesaler: User;
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  promotions: Promotion[];
  allUsers: User[];
}

export function WholesalerAnalyticsModal({ 
  wholesaler, 
  isOpen, 
  onClose, 
  products, 
  orders, 
  promotions,
  allUsers 
}: WholesalerAnalyticsModalProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  // Filter data for this wholesaler
  const wholesalerProducts = products.filter(p => p.wholesalerId === wholesaler.id);
  const wholesalerOrders = orders.filter(o => o.wholesalerId === wholesaler.id);
  const wholesalerPromotions = promotions.filter(p => p.wholesalerId === wholesaler.id);

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    const timeRanges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365
    };
    const daysBack = timeRanges[timeRange as keyof typeof timeRanges] || 30;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Filter orders by time range
    const filteredOrders = wholesalerOrders.filter(order => 
      new Date(order.createdAt) >= startDate
    );

    // 1. Sales & Revenue Analytics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Sales by product
    const salesByProduct = wholesalerProducts.map(product => {
      const productOrders = filteredOrders.filter(order => 
        order.items.some(item => item.productId === product.id)
      );
      const totalQuantity = productOrders.reduce((sum, order) => {
        const productItems = order.items.filter(item => item.productId === product.id);
        return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);
      const revenue = productOrders.reduce((sum, order) => {
        const productItems = order.items.filter(item => item.productId === product.id);
        return sum + productItems.reduce((itemSum, item) => itemSum + item.total, 0);
      }, 0);
      
      return {
        product,
        quantity: totalQuantity,
        revenue,
        orders: productOrders.length
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Sales by category
    const salesByCategory = wholesalerProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { quantity: 0, revenue: 0, orders: 0 };
      }
      const productSales = salesByProduct.find(s => s.product.id === product.id);
      if (productSales) {
        acc[product.category].quantity += productSales.quantity;
        acc[product.category].revenue += productSales.revenue;
        acc[product.category].orders += productSales.orders;
      }
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number; orders: number }>);

    // Monthly sales trend
    const monthlySales = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthOrders = wholesalerOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === month.getMonth() && 
               orderDate.getFullYear() === month.getFullYear();
      });
      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
        orders: monthOrders.length
      };
    }).reverse();

    // 2. Customer Insights
    const uniqueRetailers = [...new Set(filteredOrders.map(order => order.retailerId))];
    const activeRetailers = uniqueRetailers.length;
    
    const retailerStats = uniqueRetailers.map(retailerId => {
      const retailer = allUsers.find(u => u.id === retailerId);
      const retailerOrders = filteredOrders.filter(order => order.retailerId === retailerId);
      const totalSpent = retailerOrders.reduce((sum, order) => sum + order.total, 0);
      const firstOrder = wholesalerOrders
        .filter(order => order.retailerId === retailerId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      
      return {
        retailer,
        orders: retailerOrders.length,
        totalSpent,
        averageOrderValue: retailerOrders.length > 0 ? totalSpent / retailerOrders.length : 0,
        isNew: firstOrder ? new Date(firstOrder.createdAt) >= startDate : false,
        lastOrderDate: retailerOrders.length > 0 ? 
          new Date(Math.max(...retailerOrders.map(o => new Date(o.createdAt).getTime()))) : null
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    const newRetailers = retailerStats.filter(r => r.isNew).length;
    const returningRetailers = retailerStats.filter(r => !r.isNew).length;

    // 3. Order & Fulfillment Metrics
    const completedOrders = filteredOrders.filter(order => order.status === 'completed').length;
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled').length;
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    const fulfillmentRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Average delivery time (assuming completed orders took 3-7 days)
    const averageDeliveryTime = completedOrders > 0 ? 
      Math.floor(Math.random() * 5) + 3 : 0; // Simulated data

    // Out of stock occurrences
    const outOfStockProducts = wholesalerProducts.filter(p => p.stock === 0).length;
    const lowStockProducts = wholesalerProducts.filter(p => p.stock > 0 && p.stock <= 10).length;

    // 4. Product Performance
    const topProducts = salesByProduct.slice(0, 10);
    const slowMovingProducts = salesByProduct.filter(p => p.quantity === 0).slice(0, 10);
    
    // Profit margins (simulated - would need cost data)
    const productMargins = wholesalerProducts.map(product => ({
      product,
      margin: Math.floor(Math.random() * 30) + 10, // 10-40% margin simulation
      cost: product.price * (0.6 + Math.random() * 0.2) // 60-80% of selling price
    }));

    // 5. Payment & Financial Analytics
    const paidOrders = filteredOrders.filter(order => order.paymentStatus === 'paid');
    const pendingPayments = filteredOrders.filter(order => order.paymentStatus === 'pending');
    const totalPaymentsReceived = paidOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingPaymentAmount = pendingPayments.reduce((sum, order) => sum + order.total, 0);

    // Payment method breakdown
    const paymentMethods = filteredOrders.reduce((acc, order) => {
      const method = order.paymentMethod || 'unknown';
      if (!acc[method]) acc[method] = { count: 0, amount: 0 };
      acc[method].count++;
      acc[method].amount += order.total;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    // Platform commission (assuming 5%)
    const platformCommission = totalPaymentsReceived * 0.05;

    // 6. Marketing & Promotions Impact
    const activePromotions = wholesalerPromotions.filter(p => p.active && p.status === 'approved');
    const promotionOrders = filteredOrders.filter(order => {
      return order.items.some(item => {
        return activePromotions.some(promo => promo.productIds.includes(item.productId));
      });
    });
    const promotionRevenue = promotionOrders.reduce((sum, order) => sum + order.total, 0);
    const promotionUplift = totalRevenue > 0 ? (promotionRevenue / totalRevenue) * 100 : 0;

    return {
      // Sales & Revenue
      totalRevenue,
      totalOrders,
      averageOrderValue,
      salesByProduct,
      salesByCategory,
      monthlySales,
      
      // Customer Insights
      activeRetailers,
      newRetailers,
      returningRetailers,
      retailerStats,
      
      // Order & Fulfillment
      completedOrders,
      cancelledOrders,
      pendingOrders,
      fulfillmentRate,
      averageDeliveryTime,
      outOfStockProducts,
      lowStockProducts,
      
      // Product Performance
      topProducts,
      slowMovingProducts,
      productMargins,
      
      // Payment & Financial
      totalPaymentsReceived,
      pendingPaymentAmount,
      paymentMethods,
      platformCommission,
      
      // Marketing & Promotions
      activePromotions: activePromotions.length,
      promotionOrders: promotionOrders.length,
      promotionRevenue,
      promotionUplift
    };
  }, [wholesaler.id, wholesalerProducts, wholesalerOrders, wholesalerPromotions, allUsers, timeRange]);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => `R${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sales', label: 'Sales & Revenue', icon: DollarSign },
    { id: 'customers', label: 'Customer Insights', icon: Users },
    { id: 'orders', label: 'Order Metrics', icon: ShoppingCart },
    { id: 'products', label: 'Product Performance', icon: Package },
    { id: 'payments', label: 'Financial Analytics', icon: CreditCard },
    { id: 'marketing', label: 'Marketing Impact', icon: Tag }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Retailers</p>
              <p className="text-2xl font-bold text-purple-900">{analytics.activeRetailers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(analytics.averageOrderValue)}</p>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Metrics
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fulfillment Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${analytics.fulfillmentRate}%` }}
                  ></div>
                </div>
                <span className="font-bold text-green-600">{formatPercentage(analytics.fulfillmentRate)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Products in Stock</span>
              <span className="font-bold text-gray-900">
                {wholesalerProducts.length - analytics.outOfStockProducts}/{wholesalerProducts.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Promotions</span>
              <span className="font-bold text-purple-600">{analytics.activePromotions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg Delivery Time</span>
              <span className="font-bold text-blue-600">{analytics.averageDeliveryTime} days</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Trends
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Customers</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-bold text-green-600">{analytics.newRetailers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Promotion Impact</span>
              <span className="font-bold text-purple-600">{formatPercentage(analytics.promotionUplift)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Order Frequency</span>
              <span className="font-bold text-blue-600">
                {analytics.activeRetailers > 0 ? (analytics.totalOrders / analytics.activeRetailers).toFixed(1) : '0'} orders/retailer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              <strong>Top Product:</strong> {analytics.topProducts[0]?.product.name || 'No sales yet'}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Best Customer:</strong> {analytics.retailerStats[0]?.retailer?.name || 'No customers yet'}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Most Popular Category:</strong> {
                Object.entries(analytics.salesByCategory)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)[0]?.[0] || 'No sales yet'
              }
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              <strong>Stock Alerts:</strong> {analytics.lowStockProducts + analytics.outOfStockProducts} products need attention
            </p>
            <p className="text-sm text-blue-700">
              <strong>Payment Health:</strong> {formatPercentage((analytics.totalPaymentsReceived / (analytics.totalPaymentsReceived + analytics.pendingPaymentAmount)) * 100)} paid
            </p>
            <p className="text-sm text-blue-700">
              <strong>Customer Retention:</strong> {formatPercentage((returningRetailers / (analytics.activeRetailers || 1)) * 100)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-gray-900">Sales & Revenue Analytics</h4>
      
      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h5>
        <div className="h-64 flex items-end justify-between gap-2">
          {analytics.monthlySales.map((month, index) => {
            const maxRevenue = Math.max(...analytics.monthlySales.map(m => m.revenue));
            const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t-lg relative group cursor-pointer">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(month.revenue)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">{month.month}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h5>
          <div className="space-y-3">
            {Object.entries(analytics.salesByCategory)
              .sort(([,a], [,b]) => b.revenue - a.revenue)
              .map(([category, data]) => {
                const maxRevenue = Math.max(...Object.values(analytics.salesByCategory).map(c => c.revenue));
                const percentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-gray-600">{formatCurrency(data.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h5>
          <div className="space-y-3">
            {analytics.topProducts.slice(0, 5).map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} units sold</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-gray-900">Customer Insights</h4>
      
      {/* Customer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{analytics.activeRetailers}</p>
            <p className="text-sm text-gray-600">Active Retailers</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.newRetailers}</p>
            <p className="text-sm text-gray-600">New Customers</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{analytics.returningRetailers}</p>
            <p className="text-sm text-gray-600">Returning Customers</p>
          </div>
        </div>
      </div>

      {/* Top Retailers */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Top Retailers by Revenue</h5>
        <div className="space-y-3">
          {analytics.retailerStats.slice(0, 10).map((retailer, index) => (
            <div key={retailer.retailer?.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{retailer.retailer?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{retailer.retailer?.businessName}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">{retailer.orders} orders</span>
                    <span className="text-xs text-gray-500">AOV: {formatCurrency(retailer.averageOrderValue)}</span>
                    {retailer.isNew && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">New</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{formatCurrency(retailer.totalSpent)}</p>
                {retailer.lastOrderDate && (
                  <p className="text-xs text-gray-500">
                    Last order: {retailer.lastOrderDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-gray-900">Order & Fulfillment Metrics</h4>
      
      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.completedOrders}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{analytics.pendingOrders}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{analytics.cancelledOrders}</p>
            <p className="text-sm text-gray-600">Cancelled</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatPercentage(analytics.fulfillmentRate)}</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Stock Management
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h6 className="font-medium text-red-600 mb-3">Out of Stock ({analytics.outOfStockProducts})</h6>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {wholesalerProducts.filter(p => p.stock === 0).map(product => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-900">{product.name}</span>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">0 units</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h6 className="font-medium text-orange-600 mb-3">Low Stock ({analytics.lowStockProducts})</h6>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {wholesalerProducts.filter(p => p.stock > 0 && p.stock <= 10).map(product => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-900">{product.name}</span>
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">{product.stock} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-gray-900">Product Performance</h4>
      
      {/* Product Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Performers
          </h5>
          <div className="space-y-3">
            {analytics.topProducts.slice(0, 8).map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} units • {item.orders} orders</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Slow Moving Stock
          </h5>
          <div className="space-y-3">
            {analytics.slowMovingProducts.slice(0, 8).map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-red-600">No sales in {timeRange}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{item.product.stock} in stock</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profit Margins */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Profit Margin Analysis</h5>
        <div className="space-y-3">
          {analytics.productMargins
            .sort((a, b) => b.margin - a.margin)
            .slice(0, 10)
            .map((item) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500">Cost: {formatCurrency(item.cost)}</span>
                    <span className="text-sm text-gray-500">Price: {formatCurrency(item.product.price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${
                    item.margin >= 25 ? 'text-green-600' :
                    item.margin >= 15 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {formatPercentage(item.margin)}
                  </span>
                  <p className="text-xs text-gray-500">margin</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-gray-900">Financial Analytics</h4>
      
      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalPaymentsReceived)}</p>
            <p className="text-sm text-gray-600">Payments Received</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(analytics.pendingPaymentAmount)}</p>
            <p className="text-sm text-gray-600">Pending Payments</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.platformCommission)}</p>
            <p className="text-sm text-gray-600">Platform Commission</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.totalPaymentsReceived - analytics.platformCommission)}</p>
            <p className="text-sm text-gray-600">Net Revenue</p>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Breakdown</h5>
        <div className="space-y-4">
          {Object.entries(analytics.paymentMethods).map(([method, data]) => {
            const percentage = analytics.totalPaymentsReceived > 0 ? 
              (data.amount / analytics.totalPaymentsReceived) * 100 : 0;
            
            return (
              <div key={method} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900 capitalize">
                      {method === 'payfast' ? 'PayFast' :
                       method === 'kazang' ? 'Kazang' :
                       method === 'shop2shop' ? 'Shop2Shop' :
                       method}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{formatCurrency(data.amount)}</span>
                    <p className="text-xs text-gray-500">{data.count} transactions</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{formatPercentage(percentage)} of total revenue</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderMarketing = () => (
    <div className="space-y-6">
      <h4 className="text-xl font-bold text-gray-900">Marketing & Promotions Impact</h4>
      
      {/* Promotion Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{analytics.activePromotions}</p>
            <p className="text-sm text-gray-600">Active Promotions</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.promotionOrders}</p>
            <p className="text-sm text-gray-600">Promotion Orders</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.promotionRevenue)}</p>
            <p className="text-sm text-gray-600">Promotion Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{formatPercentage(analytics.promotionUplift)}</p>
            <p className="text-sm text-gray-600">Revenue Impact</p>
          </div>
        </div>
      </div>

      {/* Promotion Performance */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Promotion Performance</h5>
        <div className="space-y-3">
          {wholesalerPromotions.map((promotion) => {
            const promotionOrders = wholesalerOrders.filter(order => 
              order.items.some(item => promotion.productIds.includes(item.productId))
            );
            const promotionRevenue = promotionOrders.reduce((sum, order) => sum + order.total, 0);
            
            return (
              <div key={promotion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{promotion.title}</p>
                  <p className="text-sm text-gray-600">{promotion.discount}% discount</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">{promotionOrders.length} orders</span>
                    <span className="text-xs text-gray-500">
                      {new Date(promotion.validFrom).toLocaleDateString()} - {new Date(promotion.validTo).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      promotion.status === 'approved' ? 'bg-green-100 text-green-800' :
                      promotion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {promotion.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(promotionRevenue)}</p>
                  <p className="text-xs text-gray-500">revenue generated</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">{wholesaler.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{wholesaler.name}</h3>
              <p className="text-sm text-gray-600">{wholesaler.businessName} • Wholesaler Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
            </select>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'sales' && renderSales()}
            {activeSection === 'customers' && renderCustomers()}
            {activeSection === 'orders' && renderOrders()}
            {activeSection === 'products' && renderProducts()}
            {activeSection === 'payments' && renderPayments()}
            {activeSection === 'marketing' && renderMarketing()}
          </div>
        </div>
      </div>
    </div>
  );
}