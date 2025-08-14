import React, { useState, useEffect } from 'react';
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

  // TODO: Replace with your actual PayFast credentials
  const PAYFAST_CONFIG = {
    merchant_id: 'YOUR_MERCHANT_ID', // Replace with your PayFast merchant ID
    merchant_key: 'YOUR_MERCHANT_KEY', // Replace with your PayFast merchant key
    passphrase: 'YOUR_PASSPHRASE', // Replace with your PayFast passphrase (if used)
    sandbox: true, // Set to false for production
    return_url: `${window.location.origin}/payment/success`,
    cancel_url: `${window.location.origin}/payment/cancel`,
    notify_url: `${window.location.origin}/api/payfast/notify`, // Your webhook endpoint
  };

  // Generate PayFast payment data
  const generatePaymentData = () => {
    const paymentData = {
      // Merchant details
      merchant_id: PAYFAST_CONFIG.merchant_id,
      merchant_key: PAYFAST_CONFIG.merchant_key,
      
      // Transaction details
      m_payment_id: orderData.orderId,
      amount: orderData.amount.toFixed(2),
      item_name: orderData.description,
      item_description: `Order #${orderData.orderId}`,
      
      // Customer details
      name_first: orderData.customerName.split(' ')[0] || '',
      name_last: orderData.customerName.split(' ').slice(1).join(' ') || '',
      email_address: orderData.customerEmail,
      
      // URLs
      return_url: PAYFAST_CONFIG.return_url,
      cancel_url: PAYFAST_CONFIG.cancel_url,
      notify_url: PAYFAST_CONFIG.notify_url,
      
      // Additional fields
      custom_str1: orderData.orderId,
      custom_str2: 'NWI_B2B_PLATFORM',
    };

    return paymentData;
  };

  // Generate signature for PayFast (you'll need to implement this based on PayFast docs)
  const generateSignature = (data: any) => {
    // TODO: Implement PayFast signature generation
    // This should follow PayFast's signature generation algorithm
    // See: https://developers.payfast.co.za/docs#signature_generation
    
    // Example implementation (you need to complete this):
    const queryString = Object.keys(data)
      .filter(key => data[key] !== '' && data[key] !== null)
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&');
    
    // Add passphrase if configured
    const stringToHash = PAYFAST_CONFIG.passphrase 
      ? `${queryString}&passphrase=${PAYFAST_CONFIG.passphrase}`
      : queryString;
    
    // Generate MD5 hash (you'll need a crypto library or implement this)
    // For now, returning empty - you need to implement proper signature generation
    console.log('String to hash:', stringToHash);
    return ''; // TODO: Return actual MD5 hash
  };

  // Handle PayFast payment initiation
  const initiatePayFastPayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');

      const paymentData = generatePaymentData();
      const signature = generateSignature(paymentData);

      // Add signature to payment data
      const finalPaymentData = {
        ...paymentData,
        signature: signature
      };

      console.log('PayFast Payment Data:', finalPaymentData);

      // TODO: Replace this section with your custom PayFast integration
      // Option 1: Direct form submission to PayFast
      submitToPayFast(finalPaymentData);

      // Option 2: API call to your backend
      // await callYourPayFastAPI(finalPaymentData);

      // Option 3: Custom payment flow
      // await yourCustomPayFastFlow(finalPaymentData);

    } catch (error) {
      console.error('PayFast payment error:', error);
      setPaymentStatus('error');
      onError(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  // Submit form to PayFast (direct integration)
  const submitToPayFast = (paymentData: any) => {
    // Create a form and submit to PayFast
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = PAYFAST_CONFIG.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    // Add all payment data as hidden inputs
    Object.keys(paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // TODO: Add your custom PayFast API integration here
  const callYourPayFastAPI = async (paymentData: any) => {
    // Example API call to your backend
    const response = await fetch('/api/payfast/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentData,
        orderData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to initiate PayFast payment');
    }

    const result = await response.json();
    
    // Handle the response based on your API design
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    } else if (result.paymentUrl) {
      window.open(result.paymentUrl, '_blank');
    }
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
            <span className="text-gray-500">Amount:</span>
            <span className="ml-2 font-bold text-green-600">R{orderData.amount.toLocaleString()}</span>
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
          Your payment is secured with 256-bit SSL encryption
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={initiatePayFastPayment}
          disabled={isProcessing || paymentStatus === 'success'}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
            isProcessing || paymentStatus === 'success'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isProcessing ? 'Processing...' : `Pay R${orderData.amount.toLocaleString()}`}
        </button>
        
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
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