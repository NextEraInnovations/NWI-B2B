import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';

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
}

export function PayFastIntegration({ orderData, onSuccess, onError, onCancel }: PayFastIntegrationProps) {
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
    sandbox: false // Set to true for testing
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
    // Listen for payment success messages
    const handlePaymentSuccess = (event: MessageEvent) => {
      if (event.data.type === 'PAYFAST_SUCCESS') {
        setPaymentStatus('success');
        onSuccess(event.data.paymentData);
      } else if (event.data.type === 'PAYFAST_ERROR') {
        setPaymentStatus('error');
        onError(event.data.error);
      }
    };

    window.addEventListener('message', handlePaymentSuccess);
    return () => window.removeEventListener('message', handlePaymentSuccess);
  }, [onSuccess, onError]);

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
            <span className="text-sm font-medium">Payment Successful!</span>
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
            disabled={isProcessing || paymentStatus === 'success'}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              isProcessing || paymentStatus === 'success'
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
            disabled={isProcessing}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
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