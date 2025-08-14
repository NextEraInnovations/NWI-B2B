// PayFast Utility Functions
// Helper functions for PayFast integration

import crypto from 'crypto';

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  sandbox: boolean;
}

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
}

export class PayFastUtils {
  // Generate MD5 signature for PayFast
  static generateSignature(data: PayFastPaymentData, passphrase?: string): string {
    // Create query string from data
    const queryString = Object.keys(data)
      .filter(key => data[key as keyof PayFastPaymentData] !== '' && 
                    data[key as keyof PayFastPaymentData] !== null &&
                    data[key as keyof PayFastPaymentData] !== undefined)
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key as keyof PayFastPaymentData] as string)}`)
      .join('&');
    
    // Add passphrase if provided
    const stringToHash = passphrase 
      ? `${queryString}&passphrase=${passphrase}`
      : queryString;
    
    // Generate MD5 hash
    return crypto.createHash('md5').update(stringToHash).digest('hex');
  }

  // Validate PayFast signature
  static validateSignature(data: any, receivedSignature: string, passphrase?: string): boolean {
    const { signature, ...dataWithoutSignature } = data;
    const calculatedSignature = this.generateSignature(dataWithoutSignature, passphrase);
    return calculatedSignature === receivedSignature;
  }

  // Get PayFast URL based on environment
  static getPayFastUrl(sandbox: boolean = true): string {
    return sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }

  // Format amount for PayFast (2 decimal places)
  static formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  // Create PayFast payment form HTML
  static createPaymentForm(
    paymentData: PayFastPaymentData, 
    config: PayFastConfig,
    formId: string = 'payfast-form'
  ): string {
    const signature = this.generateSignature(paymentData, config.passphrase);
    const payFastUrl = this.getPayFastUrl(config.sandbox);
    
    const formFields = Object.entries({ ...paymentData, signature })
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('\n');
    
    return `
      <form id="${formId}" method="POST" action="${payFastUrl}">
        ${formFields}
      </form>
    `;
  }

  // Submit payment form programmatically
  static submitPaymentForm(
    paymentData: PayFastPaymentData, 
    config: PayFastConfig
  ): void {
    const signature = this.generateSignature(paymentData, config.passphrase);
    const payFastUrl = this.getPayFastUrl(config.sandbox);
    
    // Create form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payFastUrl;
    form.style.display = 'none';
    
    // Add all payment data as hidden inputs
    Object.entries({ ...paymentData, signature }).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    });
    
    // Submit form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  // Create payment data object
  static createPaymentData(
    config: PayFastConfig,
    orderData: {
      orderId: string;
      amount: number;
      description: string;
      customerName?: string;
      customerEmail?: string;
    },
    urls: {
      returnUrl?: string;
      cancelUrl?: string;
      notifyUrl?: string;
    } = {}
  ): PayFastPaymentData {
    const nameParts = orderData.customerName?.split(' ') || ['', ''];
    
    return {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      m_payment_id: orderData.orderId,
      amount: this.formatAmount(orderData.amount),
      item_name: orderData.description,
      item_description: `Order #${orderData.orderId}`,
      name_first: nameParts[0] || '',
      name_last: nameParts.slice(1).join(' ') || '',
      email_address: orderData.customerEmail || '',
      return_url: urls.returnUrl || '',
      cancel_url: urls.cancelUrl || '',
      notify_url: urls.notifyUrl || '',
      custom_str1: orderData.orderId,
      custom_str2: 'NWI_B2B_PLATFORM'
    };
  }

  // Verify PayFast server (for webhook validation)
  static async verifyPayFastServer(serverIP: string): Promise<boolean> {
    // PayFast server IP addresses (as of documentation)
    const validIPs = [
      '197.97.145.144',
      '197.97.145.145',
      '197.97.145.146',
      '197.97.145.147',
      '197.97.145.148'
    ];
    
    return validIPs.includes(serverIP);
  }

  // Parse PayFast webhook data
  static parseWebhookData(body: string): Record<string, string> {
    const params = new URLSearchParams(body);
    return Object.fromEntries(params.entries());
  }
}

// Example usage:
/*
const config: PayFastConfig = {
  merchantId: 'YOUR_MERCHANT_ID',
  merchantKey: 'YOUR_MERCHANT_KEY',
  passphrase: 'YOUR_PASSPHRASE',
  sandbox: true
};

const orderData = {
  orderId: 'ORDER-123',
  amount: 100.00,
  description: 'Test Order',
  customerName: 'John Doe',
  customerEmail: 'john@example.com'
};

const urls = {
  returnUrl: 'https://yoursite.com/payment/success',
  cancelUrl: 'https://yoursite.com/payment/cancel',
  notifyUrl: 'https://yoursite.com/api/payfast/notify'
};

const paymentData = PayFastUtils.createPaymentData(config, orderData, urls);
PayFastUtils.submitPaymentForm(paymentData, config);
*/