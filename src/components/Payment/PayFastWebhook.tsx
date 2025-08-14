import React from 'react';

// PayFast Webhook Handler Component
// This component provides utilities for handling PayFast webhooks

export interface PayFastWebhookData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: 'COMPLETE' | 'FAILED' | 'CANCELLED';
  item_name: string;
  item_description: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
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
  name_first?: string;
  name_last?: string;
  email_address?: string;
  merchant_id: string;
  signature: string;
}

export class PayFastWebhookHandler {
  private static passphrase: string = 'YOUR_PASSPHRASE'; // Replace with your passphrase

  // Validate PayFast webhook signature
  static validateSignature(data: PayFastWebhookData): boolean {
    // TODO: Implement signature validation
    // This should follow PayFast's signature validation algorithm
    // See: https://developers.payfast.co.za/docs#signature_validation

    const { signature, ...dataWithoutSignature } = data;
    
    // Create query string from data (excluding signature)
    const queryString = Object.keys(dataWithoutSignature)
      .filter(key => dataWithoutSignature[key as keyof typeof dataWithoutSignature] !== '' && 
                    dataWithoutSignature[key as keyof typeof dataWithoutSignature] !== null)
      .sort()
      .map(key => `${key}=${encodeURIComponent(dataWithoutSignature[key as keyof typeof dataWithoutSignature] as string)}`)
      .join('&');
    
    // Add passphrase if configured
    const stringToHash = this.passphrase 
      ? `${queryString}&passphrase=${this.passphrase}`
      : queryString;
    
    // Generate MD5 hash and compare with signature
    // TODO: Implement MD5 hash generation
    console.log('String to validate:', stringToHash);
    console.log('Received signature:', signature);
    
    // For now, return true - you need to implement proper signature validation
    return true;
  }

  // Process PayFast webhook
  static async processWebhook(webhookData: PayFastWebhookData): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }> {
    try {
      // Validate signature first
      if (!this.validateSignature(webhookData)) {
        return {
          success: false,
          error: 'Invalid signature'
        };
      }

      // Extract order ID from payment ID or custom fields
      const orderId = webhookData.custom_str1 || webhookData.m_payment_id;

      // Process based on payment status
      switch (webhookData.payment_status) {
        case 'COMPLETE':
          await this.handleSuccessfulPayment(webhookData, orderId);
          return {
            success: true,
            orderId
          };

        case 'FAILED':
          await this.handleFailedPayment(webhookData, orderId);
          return {
            success: false,
            orderId,
            error: 'Payment failed'
          };

        case 'CANCELLED':
          await this.handleCancelledPayment(webhookData, orderId);
          return {
            success: false,
            orderId,
            error: 'Payment cancelled'
          };

        default:
          return {
            success: false,
            error: 'Unknown payment status'
          };
      }
    } catch (error) {
      console.error('PayFast webhook processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing error'
      };
    }
  }

  // Handle successful payment
  private static async handleSuccessfulPayment(data: PayFastWebhookData, orderId: string) {
    console.log('Processing successful PayFast payment:', {
      orderId,
      paymentId: data.pf_payment_id,
      amount: data.amount_gross
    });

    // TODO: Add your custom logic here
    // Examples:
    // - Update order status in database
    // - Send confirmation email
    // - Update inventory
    // - Trigger fulfillment process
    // - Send notifications

    // Example API call to update order
    /*
    await fetch('/api/orders/update-payment-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        paymentStatus: 'paid',
        paymentId: data.pf_payment_id,
        amount: parseFloat(data.amount_gross)
      })
    });
    */
  }

  // Handle failed payment
  private static async handleFailedPayment(data: PayFastWebhookData, orderId: string) {
    console.log('Processing failed PayFast payment:', {
      orderId,
      paymentId: data.pf_payment_id
    });

    // TODO: Add your custom logic here
    // Examples:
    // - Update order status to failed
    // - Send failure notification
    // - Log for retry attempts
  }

  // Handle cancelled payment
  private static async handleCancelledPayment(data: PayFastWebhookData, orderId: string) {
    console.log('Processing cancelled PayFast payment:', {
      orderId,
      paymentId: data.pf_payment_id
    });

    // TODO: Add your custom logic here
    // Examples:
    // - Update order status to cancelled
    // - Release reserved inventory
    // - Send cancellation notification
  }
}

// Express.js webhook endpoint example (for reference)
export const payFastWebhookEndpoint = `
// Example Express.js endpoint for PayFast webhooks
app.post('/api/payfast/notify', express.raw({ type: 'application/x-www-form-urlencoded' }), async (req, res) => {
  try {
    // Parse the webhook data
    const webhookData = new URLSearchParams(req.body.toString());
    const data = Object.fromEntries(webhookData.entries()) as PayFastWebhookData;
    
    // Process the webhook
    const result = await PayFastWebhookHandler.processWebhook(data);
    
    if (result.success) {
      res.status(200).send('OK');
    } else {
      res.status(400).send(result.error);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});
`;