import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PayFastIntegrationProps {
  orderData: {
    orderId: string;
    amount: number;
    customerEmail: string;
    customerName: string;
    description: string;
  };
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  onReturnToDashboard?: () => void;
  onReturnToCart?: () => void;
}

export function PayFastIntegration({ 
  orderData, 
  onSuccess, 
  onError, 
  onCancel, 
  onReturnToDashboard,
  onReturnToCart 
}: PayFastIntegrationProps) {
  const { state } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(orderData.amount);
  const formRef = useRef<HTMLFormElement>(null);

  // Your custom PayFast configuration
  const PAYFAST_CONFIG = {
    receiver: '31365409', // Your PayFast receiver ID
    action_url: 'https://payment.payfast.io/eng/process',
    item_name: orderData.description || 'NWI B2B Order',
    sandbox: false, // Set to true for testing
    return_url: `${window.location.origin}/payment/success?order_id=${orderData.orderId}`,
    cancel_url: `${window.location.origin}/payment/cancel?order_id=${orderData.orderId}`
  };

  // Your custom JavaScript functions integrated into React
  const customQuantitiesPayFast = (formElement: HTMLFormElement): boolean => {
    const amountInput = formElement.elements.namedItem('amount') as HTMLInputElement;
    const quantityInput = formElement.elements.namedItem('custom_quantity') as HTMLInputElement;
    
    if (amountInput && quantityInput) {
      const baseAmount = parseFloat(amountInput.dataset.baseAmount || amountInput.value);
      const quantity = parseFloat(quantityInput.value);
      amountInput.value = (baseAmount * quantity).toFixed(2);
    }
    return true;
  };

  const actionPayFastJavascript = (formElement: HTMLFormElement): boolean => {
    // Check if shipping validation exists (you can customize this)
    const shippingValidOrOff = true; // Set your shipping validation logic here
    const customValid = shippingValidOrOff ? customQuantitiesPayFast(formElement) : false;
    
    if (!shippingValidOrOff) {
      return false;
    }
    
    if (typeof customValid !== 'undefined' && !customValid) {
      return false;
    }
    
    return true;
  };

  // Handle form submission with your custom validation
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus('processing');

    const formElement = e.currentTarget;
    
    // Run your custom PayFast JavaScript validation
    const isValid = actionPayFastJavascript(formElement);
    
    if (!isValid) {
      setIsProcessing(false);
      setPaymentStatus('error');
      onError('Payment validation failed');
      return;
    }

    // Submit the form to PayFast
    try {
      formElement.submit();
    } catch (error) {
      setIsProcessing(false);
      setPaymentStatus('error');
      onError('Failed to submit payment form');
    }
  };

  // Handle quantity changes and update amount
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    setAmount(orderData.amount * newQuantity);
  };

  // Handle payment success (called from return URL or webhook)
  useEffect(() => {
    // Listen for payment success/failure messages from PayFast return URLs
    const handlePaymentSuccess = (event: MessageEvent) => {
      if (event.data.type === 'PAYFAST_SUCCESS') {
        setPaymentStatus('success');
        setIsProcessing(false);
        onSuccess(event.data.paymentData);
        
        // Navigate back to dashboard after successful payment
        setTimeout(() => {
          if (onReturnToDashboard) {
            onReturnToDashboard();
          }
        }, 2000);
      } else if (event.data.type === 'PAYFAST_ERROR') {
        setPaymentStatus('error');
        setIsProcessing(false);
        onError(event.data.error);
      } else if (event.data.type === 'PAYFAST_CANCELLED') {
        setPaymentStatus('cancelled');
        setIsProcessing(false);
        
        // Navigate back to cart after payment cancellation
        setTimeout(() => {
          if (onReturnToCart) {
            onReturnToCart();
          } else {
            onCancel();
          }
        }, 1000);
      }
    };

    // Listen for URL changes to detect return from PayFast
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      const orderId = urlParams.get('order_id');
      
      if (orderId === orderData.orderId) {
        if (paymentStatus === 'success') {
          setPaymentStatus('success');
          setIsProcessing(false);
          onSuccess({ orderId, status: 'success' });
          
          // Navigate back to dashboard
          setTimeout(() => {
            if (onReturnToDashboard) {
              onReturnToDashboard();
            }
          }, 2000);
        } else if (paymentStatus === 'cancelled') {
          setPaymentStatus('cancelled');
          setIsProcessing(false);
          
          // Navigate back to cart
          setTimeout(() => {
            if (onReturnToCart) {
              onReturnToCart();
            } else {
              onCancel();
            }
          }, 1000);
        }
      }
    };

    window.addEventListener('message', handlePaymentSuccess);
    window.addEventListener('popstate', handleUrlChange);
    
    // Check URL on component mount
    handleUrlChange();

    return () => {
      window.removeEventListener('message', handlePaymentSuccess);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [onSuccess, onError, onCancel, onReturnToDashboard, onReturnToCart, orderData.orderId]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">PayFast Payment</h3>
          <p className="text-sm text-gray-600">Secure payment processing</p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Order ID:</span>
            <span className="ml-2 font-medium">{orderData.orderId}</span>
          </div>
          <div>
            <span className="text-gray-500">Base Amount:</span>
            <span className="ml-2 font-bold text-green-600">R{orderData.amount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500">Quantity:</span>
            <span className="ml-2 font-medium">{quantity}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Amount:</span>
            <span className="ml-2 font-bold text-green-600">R{amount.toFixed(2)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Description:</span>
            <span className="ml-2 font-medium">{orderData.description}</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
        <div className="flex items-center gap-2 text-green-800">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Secure Payment</span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Your payment is secured with PayFast's encryption
        </p>
      </div>

      {/* Payment Status */}
      {paymentStatus === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Processing Payment...</span>
          </div>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Payment Successful! Returning to dashboard...</span>
          </div>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Payment Failed</span>
          </div>
        </div>
      )}

      {paymentStatus === 'cancelled' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Payment Cancelled. Returning to cart...</span>
          </div>
        </div>
      )}

      {/* Your Custom PayFast Form */}
      <form 
        ref={formRef}
        onSubmit={handleFormSubmit}
        name="PayFastPayNowForm" 
        action={PAYFAST_CONFIG.action_url} 
        method="post"
        className="space-y-4"
      >
        {/* Hidden PayFast fields */}
        <input type="hidden" name="cmd" value="_paynow" />
        <input type="hidden" name="receiver" value={PAYFAST_CONFIG.receiver} />
        <input type="hidden" name="item_name" value={PAYFAST_CONFIG.item_name} />
        <input type="hidden" name="return_url" value={PAYFAST_CONFIG.return_url} />
        <input type="hidden" name="cancel_url" value={PAYFAST_CONFIG.cancel_url} />
        
        {/* Amount field with base amount stored in data attribute */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="PayFastAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (R):
            </label>
            <input
              required
              id="PayFastAmount"
              type="number"
              step="0.01"
              name="amount"
              min="5.00"
              value={amount.toFixed(2)}
              data-base-amount={orderData.amount.toFixed(2)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
          
          <div>
            <label htmlFor="custom_quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity:
            </label>
            <input
              required
              id="custom_quantity"
              type="number"
              name="custom_quantity"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isProcessing || paymentStatus === 'success' || paymentStatus === 'cancelled'}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              isProcessing || paymentStatus === 'success' || paymentStatus === 'cancelled'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Pay R${amount.toFixed(2)}`
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing || paymentStatus === 'success'}
            className={`px-6 py-3 border border-gray-300 rounded-xl font-medium transition-colors ${
              isProcessing || paymentStatus === 'success'
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* PayFast Branding */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Powered by PayFast - South Africa's leading payment gateway
        </p>
      </div>

      {/* Development Notice */}
      {PAYFAST_CONFIG.sandbox && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Development Mode:</strong> Using PayFast sandbox environment
          </p>
        </div>
      )}
    </div>
  );
}