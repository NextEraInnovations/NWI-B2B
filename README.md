# demo-

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/NextEraInnovations/demo-)

## PayFast Integration Setup

This application includes a custom PayFast payment integration. To set up PayFast payments:

### 1. Configure PayFast Credentials

Edit `src/components/Payment/PayFastIntegration.tsx` and update the `PAYFAST_CONFIG` object:

```typescript
const PAYFAST_CONFIG = {
  merchant_id: 'YOUR_MERCHANT_ID',     // Replace with your PayFast merchant ID
  merchant_key: 'YOUR_MERCHANT_KEY',   // Replace with your PayFast merchant key
  passphrase: 'YOUR_PASSPHRASE',       // Replace with your PayFast passphrase (optional)
  sandbox: true,                       // Set to false for production
  return_url: `${window.location.origin}/payment/success`,
  cancel_url: `${window.location.origin}/payment/cancel`,
  notify_url: `${window.location.origin}/api/payfast/notify`,
};
```

### 2. Implement Signature Generation

The PayFast integration requires proper signature generation. Update the `generateSignature` function in `PayFastIntegration.tsx`:

```typescript
const generateSignature = (data: any) => {
  // Implement PayFast signature generation according to their documentation
  // See: https://developers.payfast.co.za/docs#signature_generation
  
  const queryString = Object.keys(data)
    .filter(key => data[key] !== '' && data[key] !== null)
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');
  
  const stringToHash = PAYFAST_CONFIG.passphrase 
    ? `${queryString}&passphrase=${PAYFAST_CONFIG.passphrase}`
    : queryString;
  
  // Generate MD5 hash using crypto library
  return crypto.createHash('md5').update(stringToHash).digest('hex');
};
```

### 3. Set Up Webhook Endpoint

Create a webhook endpoint to handle PayFast notifications. Example using Express.js:

```javascript
app.post('/api/payfast/notify', express.raw({ type: 'application/x-www-form-urlencoded' }), async (req, res) => {
  try {
    const webhookData = new URLSearchParams(req.body.toString());
    const data = Object.fromEntries(webhookData.entries());
    
    // Process the webhook using the provided PayFastWebhookHandler
    const result = await PayFastWebhookHandler.processWebhook(data);
    
    if (result.success) {
      res.status(200).send('OK');
    } else {
      res.status(400).send(result.error);
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
```

### 4. Customize Payment Flow

You can customize the payment flow in three ways:

1. **Direct Form Submission** (default): Redirects user to PayFast
2. **API Integration**: Call your backend API to handle PayFast
3. **Custom Flow**: Implement your own payment processing logic

Update the `initiatePayFastPayment` function in `PayFastIntegration.tsx` to use your preferred method.

### 5. Handle Payment Responses

The integration includes handlers for:
- Payment success
- Payment failure
- Payment cancellation
- Webhook notifications

Customize these handlers in `PayFastWebhookHandler.tsx` to match your business logic.

### 6. Testing

- Use sandbox mode for testing (`sandbox: true`)
- PayFast provides test card numbers for sandbox testing
- Monitor console logs for payment flow debugging

### 7. Production Deployment

Before going live:
- Set `sandbox: false` in the configuration
- Update all URLs to production endpoints
- Implement proper error handling and logging
- Set up monitoring for webhook endpoints
- Test with real PayFast credentials

For more information, refer to the [PayFast Developer Documentation](https://developers.payfast.co.za/).