import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  BarChart3, 
  DollarSign,
  Eye,
  X,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  User,
  Phone,
  Mail,
  Calendar,
  Building,
  MapPin,
  Tag,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Order, SupportTicket, Promotion } from '../../types';

interface WholesalerDashboardProps {
  activeTab: string;
}

export function WholesalerDashboard({ activeTab }: WholesalerDashboardProps) {
  const { state, dispatch } = useApp();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewPromotion, setShowNewPromotion] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    minOrderQuantity: '',
    category: '',
    imageUrl: '',
    imageFile: null as File | null
  });
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    description: '',
    discount: '',
    validFrom: '',
    validTo: '',
    productIds: [] as string[],
    selectedProducts: [] as Product[]
  });
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' as const });
  const [dragActive, setDragActive] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);

  const currentUser = state.currentUser!;
  const myProducts = state.products.filter(p => p.wholesalerId === currentUser.id);
  const myOrders = state.orders.filter(o => o.wholesalerId === currentUser.id);
  const myTickets = state.tickets.filter(t => t.userId === currentUser.id);
  const myPromotions = state.promotions.filter(p => p.wholesalerId === currentUser.id);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewProduct(prev => ({
          ...prev,
          imageUrl: result,
          imageFile: file
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setNewProduct(prev => ({
      ...prev,
      imageUrl: '',
      imageFile: null
    }));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would upload the image to a storage service first
    // For now, we'll use a placeholder or the data URL
    const imageUrl = newProduct.imageUrl || 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=300';
    
    const product: Product = {
      id: Date.now().toString(),
      wholesalerId: currentUser.id,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      minOrderQuantity: parseInt(newProduct.minOrderQuantity),
      category: newProduct.category,
      imageUrl,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_PRODUCT', payload: product });
    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock: '',
      minOrderQuantity: '',
      category: '',
      imageUrl: '',
      imageFile: null
    });
    setShowAddProduct(false);
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const imageUrl = newProduct.imageUrl || selectedProduct.imageUrl;
    
    const updatedProduct: Product = {
      ...selectedProduct,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      minOrderQuantity: parseInt(newProduct.minOrderQuantity),
      category: newProduct.category,
      imageUrl,
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
    setShowEditProduct(false);
    setSelectedProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock: '',
      minOrderQuantity: '',
      category: '',
      imageUrl: '',
      imageFile: null
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const order = myOrders.find(o => o.id === orderId);
    if (order) {
      // Update product stock when order is completed
      if (status === 'completed' && order.status !== 'completed') {
        order.items.forEach(item => {
          const product = state.products.find(p => p.id === item.productId);
          if (product && product.stock >= item.quantity) {
            dispatch({
              type: 'UPDATE_PRODUCT',
              payload: {
                ...product,
                stock: product.stock - item.quantity,
                updatedAt: new Date().toISOString()
              }
            });
          }
        });
      }
      
      dispatch({ 
        type: 'UPDATE_ORDER', 
        payload: { ...order, status, updatedAt: new Date().toISOString() }
      });
    }
  };

  const handleProductToggle = (product: Product) => {
    const isSelected = newPromotion.selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      setNewPromotion({
        ...newPromotion,
        selectedProducts: newPromotion.selectedProducts.filter(p => p.id !== product.id),
        productIds: newPromotion.productIds.filter(id => id !== product.id)
      });
    } else {
      setNewPromotion({
        ...newPromotion,
        selectedProducts: [...newPromotion.selectedProducts, product],
        productIds: [...newPromotion.productIds, product.id]
      });
    }
  };

  const handleSelectAllProducts = () => {
    if (newPromotion.selectedProducts.length === myProducts.length) {
      // Deselect all
      setNewPromotion({
        ...newPromotion,
        selectedProducts: [],
        productIds: []
      });
    } else {
      // Select all
      setNewPromotion({
        ...newPromotion,
        selectedProducts: myProducts,
        productIds: myProducts.map(p => p.id)
      });
    }
  };

  const handleCreatePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPromotion.selectedProducts.length === 0) {
      alert('Please select at least one product for the promotion');
      return;
    }
    
    const promotion: Promotion = {
      id: Date.now().toString(),
      wholesalerId: currentUser.id,
      ...newPromotion,
      discount: parseFloat(newPromotion.discount),
      active: false,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PROMOTION', payload: promotion });
    setNewPromotion({
      title: '',
      description: '',
      discount: '',
      validFrom: '',
      validTo: '',
      productIds: [],
      selectedProducts: []
    });
    setShowNewPromotion(false);
    setShowProductSelector(false);
  };

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

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      minOrderQuantity: product.minOrderQuantity.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      imageFile: null
    });
    setShowEditProduct(true);
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

  const renderImageUploadSection = () => (
    <div className="space-y-4">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
        <ImageIcon className="w-4 h-4 inline mr-2" />
        Product Image
      </label>
      
      {newProduct.imageUrl ? (
        <div className="relative">
          <img 
            src={newProduct.imageUrl} 
            alt="Product preview" 
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {newProduct.imageFile ? newProduct.imageFile.name : 'Current image'}
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Supports: JPG, PNG, GIF (Max 5MB)
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer font-medium"
          >
            <ImageIcon className="w-4 h-4" />
            Select Image
          </label>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        💡 Tip: High-quality images help customers make better purchasing decisions
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Wholesaler Dashboard</h2>
        <div className="text-sm text-gray-500">
          Welcome back, {currentUser.name}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{myProducts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{myOrders.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">R{myOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-3xl font-bold text-gray-900">{myPromotions.filter(p => p.active).length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Tag className="w-6 h-6 text-orange-600" />
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

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">My Products</h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {myProducts.map((product) => (
          <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-32 sm:h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=300';
                }}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => openEditModal(product)}
                  className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg hover:bg-white transition-colors shadow-sm"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg hover:bg-white transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
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
                  <span className={`font-medium text-sm sm:text-base ${
                    product.stock > 10 ? 'text-green-600' : 
                    product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {product.stock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">Min Order:</span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{product.minOrderQuantity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Add New Product</h3>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setNewProduct({
                    name: '',
                    description: '',
                    price: '',
                    stock: '',
                    minOrderQuantity: '',
                    category: '',
                    imageUrl: '',
                    imageFile: null
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {renderImageUploadSection()}
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Min Order Qty</label>
                  <input
                    type="number"
                    value={newProduct.minOrderQuantity}
                    onChange={(e) => setNewProduct({...newProduct, minOrderQuantity: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false);
                    setNewProduct({
                      name: '',
                      description: '',
                      price: '',
                      stock: '',
                      minOrderQuantity: '',
                      category: '',
                      imageUrl: '',
                      imageFile: null
                    });
                  }}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Product</h3>
              <button
                onClick={() => {
                  setShowEditProduct(false);
                  setSelectedProduct(null);
                  setNewProduct({
                    name: '',
                    description: '',
                    price: '',
                    stock: '',
                    minOrderQuantity: '',
                    category: '',
                    imageUrl: '',
                    imageFile: null
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-4">
              {renderImageUploadSection()}
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Price (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Min Order Qty</label>
                  <input
                    type="number"
                    value={newProduct.minOrderQuantity}
                    onChange={(e) => setNewProduct({...newProduct, minOrderQuantity: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProduct(false);
                    setSelectedProduct(null);
                    setNewProduct({
                      name: '',
                      description: '',
                      price: '',
                      stock: '',
                      minOrderQuantity: '',
                      category: '',
                      imageUrl: '',
                      imageFile: null
                    });
                  }}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Orders</h2>
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
              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    Accept
                  </button>
                )}
                {order.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                    className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                    className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Complete
                  </button>
                )}
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
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
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

  const renderPromotions = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Promotions</h2>
        <button
          onClick={() => setShowNewPromotion(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create Promotion
        </button>
      </div>

      <div className="space-y-4">
        {myPromotions.map((promotion) => (
          <div key={promotion.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{promotion.title}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    promotion.status === 'approved' ? 'bg-green-100 text-green-800' :
                    promotion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {promotion.status}
                  </span>
                  {promotion.active && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{promotion.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Discount:</span>
                    <span className="ml-2 font-bold text-red-600">{promotion.discount}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Valid From:</span>
                    <span className="ml-2 font-medium">{new Date(promotion.validFrom).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Valid To:</span>
                    <span className="ml-2 font-medium">{new Date(promotion.validTo).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Promotion Modal */}
      {showNewPromotion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Create Promotion</h3>
              <button
                onClick={() => setShowNewPromotion(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePromotion} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPromotion.title}
                  onChange={(e) => setNewPromotion({...newPromotion, title: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newPromotion.discount}
                  onChange={(e) => setNewPromotion({...newPromotion, discount: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Valid From</label>
                  <input
                    type="date"
                    value={newPromotion.validFrom}
                    onChange={(e) => setNewPromotion({...newPromotion, validFrom: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Valid To</label>
                  <input
                    type="date"
                    value={newPromotion.validTo}
                    onChange={(e) => setNewPromotion({...newPromotion, validTo: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Products for Promotion
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">
                      {newPromotion.selectedProducts.length} of {myProducts.length} products selected
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowProductSelector(!showProductSelector)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {showProductSelector ? 'Hide Products' : 'Select Products'}
                    </button>
                  </div>
                  
                  {showProductSelector && (
                    <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Available Products</span>
                        <button
                          type="button"
                          onClick={handleSelectAllProducts}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {newPromotion.selectedProducts.length === myProducts.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {myProducts.map((product) => (
                          <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id={`product-${product.id}`}
                              checked={newPromotion.selectedProducts.some(p => p.id === product.id)}
                              onChange={() => handleProductToggle(product)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`product-${product.id}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                  <p className="text-xs text-gray-500">{product.category} • R{product.price}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {newPromotion.selectedProducts.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-gray-700">Selected Products:</span>
                      <div className="flex flex-wrap gap-2">
                        {newPromotion.selectedProducts.map((product) => (
                          <span
                            key={product.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                          >
                            {product.name}
                            <button
                              type="button"
                              onClick={() => handleProductToggle(product)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewPromotion(false)}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Create Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center">
            <User className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentUser.name}</h3>
            <p className="text-gray-600">{currentUser.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Wholesaler Account
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
    case 'products':
      return renderProducts();
    case 'orders':
      return renderOrders();
    case 'promotions':
      return renderPromotions();
    case 'support':
      return renderSupport();
    case 'profile':
      return renderProfile();
    default:
      return renderOverview();
  }
}