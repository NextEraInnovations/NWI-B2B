import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  Building, 
  Smartphone,
  Check,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Order, OrderItem } from '../../types';
import { PayFastIntegration } from '../Payment/PayFastIntegration';

interface CheckoutPageProps {
  cart: { [productId: string]: number };
  onBack: () => void;
  onOrderComplete: () => void;
}

export function CheckoutPage({ cart, onBack, onOrderComplete }: CheckoutPageProps) {
  const { state, dispatch } = useApp();
  const [selectedPayment, setSelectedPayment] = useState<'payfast' | 'kazang' | 'shop2shop' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showPayFastIntegration, setShowPayFastIntegration] = useState(false);

  const currentUser = state.currentUser!;

  // Get cart items with product details
  const getCartItems = () => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = state.products.find(p => p.id === productId);
      return product ? { product, quantity } : null;
    }).filter(Boolean) as { product: Product; quantity: number }[];
  };

  const cartItems = getCartItems();

  // Get active promotions and calculate discounts
  const activePromotions = state.promotions.filter(p => p.active && p.status === 'approved');
  
  const isProductOnPromotion = (productId: string) => {
    return activePromotions.some(promo => promo.productIds.includes(productId));
  };
  
  const getProductDiscount = (productId: string) => {
    const promotion = activePromotions.find(promo => promo.productIds.includes(productId));
    return promotion ? promotion.discount : 0;
  };
  
  const getDiscountedPrice = (product: Product) => {
    const discount = getProductDiscount(product.id);
    return discount > 0 ? product.price * (1 - discount / 100) : product.price;
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, { product, quantity }) => {
    return total + (product.price * quantity);
  }, 0);

  const totalDiscount = cartItems.reduce((total, { product, quantity }) => {
    const originalPrice = product.price * quantity;
    const discountedPrice = getDiscountedPrice(product) * quantity;
    return total + (originalPrice - discountedPrice);
  }, 0);

  const finalTotal = cartItems.reduce((total, { product, quantity }) => {
    return total + (getDiscountedPrice(product) * quantity);
  }, 0);

  // Group items by wholesaler for separate orders
  const getOrdersByWholesaler = () => {
    const ordersByWholesaler: { [wholesalerId: string]: { items: { product: Product; quantity: number }[], wholesaler: any } } = {};
    
    cartItems.forEach(({ product, quantity }) => {
      const wholesaler = state.users.find(u => u.id === product.wholesalerId);
      if (!ordersByWholesaler[product.wholesalerId]) {
        ordersByWholesaler[product.wholesalerId] = {
          items: [],
          wholesaler
        };
      }
      ordersByWholesaler[product.wholesalerId].items.push({ product, quantity });
    });
    
    return Object.values(ordersByWholesaler);
  };

  const orderGroups = getOrdersByWholesaler();

  const handlePayment = async () => {
    if (!selectedPayment) return;
    
    // Handle PayFast payment with custom integration
    if (selectedPayment === 'payfast') {
      setShowPayFastIntegration(true);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create orders for each wholesaler
      orderGroups.forEach((orderGroup, index) => {
        const orderItems: OrderItem[] = orderGroup.items.map(({ product, quantity }) => ({
          productId: product.id,
          productName: product.name,
          quantity,
          price: getDiscountedPrice(product),
          total: getDiscountedPrice(product) * quantity
        }));

        const order: Order = {
          id: `${Date.now()}-${index}`,
          retailerId: currentUser.id,
          wholesalerId: orderGroup.wholesaler.id,
          items: orderItems,
          total: orderItems.reduce((sum, item) => sum + item.total, 0),
          status: 'pending',
          paymentStatus: 'paid', // Mark as paid since payment was processed
          paymentMethod: selectedPayment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_ORDER', payload: order });
      });
      
      setOrderPlaced(true);
      
      // Auto-complete after showing success message
      setTimeout(() => {
        onOrderComplete();
      }, 3000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayFastSuccess = (paymentData: any) => {
    console.log('PayFast payment successful:', paymentData);
    
    // Update the order total based on the actual payment amount
    const actualTotal = paymentData.amount || finalTotal;
    
    // Create orders for each wholesaler
    orderGroups.forEach((orderGroup, index) => {
      const orderItems: OrderItem[] = orderGroup.items.map(({ product, quantity }) => ({
        productId: product.id,
        productName: product.name,
        quantity,
        price: getDiscountedPrice(product),
        total: getDiscountedPrice(product) * quantity
      }));

      const order: Order = {
        id: `${Date.now()}-${index}`,
        retailerId: currentUser.id,
        wholesalerId: orderGroup.wholesaler.id,
        items: orderItems,
        total: actualTotal,
        status: 'pending',
        paymentStatus: 'paid',
        paymentMethod: 'payfast',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_ORDER', payload: order });
    });
    
    setOrderPlaced(true);
    setShowPayFastIntegration(false);
    
    // Auto-complete after showing success message
    setTimeout(() => {
      onOrderComplete();
    }, 3000);
  };

  const handlePayFastError = (error: string) => {
    console.error('PayFast payment failed:', error);
    alert(`Payment failed: ${error}`);
    setShowPayFastIntegration(false);
  };

  const handlePayFastCancel = () => {
    setShowPayFastIntegration(false);
    setSelectedPayment(null);
  };

  // Show PayFast integration if selected
  if (showPayFastIntegration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handlePayFastCancel}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">PayFast Payment</h1>
              <p className="text-gray-600">Complete your payment securely</p>
            </div>
          </div>

          <PayFastIntegration
            orderData={{
              orderId: `ORDER-${Date.now()}`,
              amount: finalTotal,
              customerEmail: currentUser.email,
              customerName: currentUser.name,
              description: `${cartItems.map(item => item.product.name).join(', ')}`
            }}
            onSuccess={handlePayFastSuccess}
            onError={handlePayFastError}
            onCancel={handlePayFastCancel}
            onReturnToDashboard={() => {
              // Clear cart and return to dashboard
              onOrderComplete();
            }}
            onReturnToCart={() => {
              // Return to cart (checkout page)
              setShowPayFastIntegration(false);
            }}
          />
        </div>
      </div>
    );
  }
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your {orderGroups.length} order{orderGroups.length > 1 ? 's have' : ' has'} been placed and payment has been processed.
          </p>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-sm text-green-700">
              <strong>Total Paid:</strong> R{finalTotal.toLocaleString()}
            </p>
            <p className="text-sm text-green-700 mt-1">
              <strong>Payment Method:</strong> {selectedPayment?.charAt(0).toUpperCase() + selectedPayment?.slice(1)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Review your order and complete payment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">{currentUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Business</p>
                  <p className="font-semibold text-gray-900">{currentUser.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {currentUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {currentUser.phone}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {currentUser.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items by Wholesaler */}
            {orderGroups.map((orderGroup, groupIndex) => (
              <div key={groupIndex} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order from {orderGroup.wholesaler?.businessName || orderGroup.wholesaler?.name}
                </h3>
                <div className="space-y-4">
                  {orderGroup.items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {isProductOnPromotion(product.id) && (
                            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                              {getProductDiscount(product.id)}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Qty: {quantity}</p>
                        <div className="flex flex-col items-end">
                          {isProductOnPromotion(product.id) ? (
                            <>
                              <span className="text-sm text-gray-400 line-through">R{(product.price * quantity).toLocaleString()}</span>
                              <span className="font-bold text-green-600">R{(getDiscountedPrice(product) * quantity).toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="font-bold text-gray-900">R{(product.price * quantity).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Payment Methods */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h3>
              <div className="space-y-3">
                {/* PayFast */}
                <button
                  onClick={() => setSelectedPayment('payfast')}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                    selectedPayment === 'payfast'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">PayFast</h4>
                    <p className="text-sm text-gray-600">Custom PayFast integration</p>
                  </div>
                  {selectedPayment === 'payfast' && (
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {/* Kazang */}
                <button
                  onClick={() => setSelectedPayment('kazang')}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                    selectedPayment === 'kazang'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">Kazang</h4>
                    <p className="text-sm text-gray-600">Pay at participating stores</p>
                  </div>
                  {selectedPayment === 'kazang' && (
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {/* Shop2Shop */}
                <button
                  onClick={() => setSelectedPayment('shop2shop')}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                    selectedPayment === 'shop2shop'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Smartphone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">Shop2Shop</h4>
                    <p className="text-sm text-gray-600">Mobile payment solution</p>
                  </div>
                  {selectedPayment === 'shop2shop' && (
                    <div className="bg-purple-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">R{subtotal.toLocaleString()}</span>
                </div>
                
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promotions:</span>
                    <span className="font-semibold">-R{totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">R{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <p className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {cartItems.reduce((total, { quantity }) => total + quantity, 0)} items
                </p>
                <p className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {orderGroups.length} supplier{orderGroups.length > 1 ? 's' : ''}
                </p>
              </div>

              {!selectedPayment && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Please select a payment method</span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={!selectedPayment || isProcessing}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                  selectedPayment && !isProcessing
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay R${finalTotal.toLocaleString()}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}