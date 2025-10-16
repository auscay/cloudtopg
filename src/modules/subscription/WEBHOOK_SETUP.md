# Paystack Webhook Setup Guide

This guide explains how to set up and use Paystack webhooks for automatic payment verification.

## Why Use Webhooks?

Webhooks are **more reliable** than callback URLs because:

1. **Server-to-Server Communication**: Direct communication between Paystack and your server
2. **No User Dependency**: Works even if user closes browser or doesn't complete redirect
3. **Automatic Retry**: Paystack automatically retries failed webhook deliveries
4. **Real-time Updates**: Get instant notifications about payment events
5. **More Secure**: Cryptographically signed requests ensure authenticity

## How It Works

```
User Pays → Paystack Processes → Paystack Sends Webhook → Your Server Verifies → Subscription Activated
```

**The Flow:**
1. User completes payment on Paystack
2. Paystack immediately sends a webhook to your server
3. Your server verifies the webhook signature
4. Your server processes the payment and updates the subscription
5. User gets instant access (no manual verification needed)

## Setup Steps

### 1. Configure Webhook URL in Environment

Add to your `.env` file:

```env
PAYSTACK_WEBHOOK_URL=https://yourdomain.com/api/subscriptions/webhook/paystack
```

**For Development (using ngrok or similar):**
```env
PAYSTACK_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/subscriptions/webhook/paystack
```

### 2. Register Webhook on Paystack Dashboard

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Webhook**
4. Enter your webhook URL: `https://yourdomain.com/api/subscriptions/webhook/paystack`
5. Click **Save**

### 3. Test Webhook (Development)

#### Option A: Use Paystack Test Mode
```bash
# Use test cards in development
Card: 4084 0840 8408 4081
CVV: 408
Expiry: Any future date
```

#### Option B: Use ngrok for Local Testing
```bash
# Install ngrok
npm install -g ngrok

# Start your local server
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Copy the ngrok URL and register it in Paystack dashboard
# Example: https://abc123.ngrok.io/api/subscriptions/webhook/paystack
```

#### Option C: Test Webhook Endpoint Manually
```bash
# Test if webhook endpoint is reachable
curl -X POST http://localhost:3000/api/subscriptions/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 4. Monitor Webhook Events

Check your server logs for webhook events:

```
Paystack webhook event: charge.success
Processing successful charge: {
  reference: 'SUB-1234567890',
  amount: 150000,
  email: 'user@example.com'
}
Payment verification result: {
  reference: 'SUB-1234567890',
  subscriptionId: '...',
  status: 'active',
  currentSemester: 1
}
```

## Webhook Events Handled

### `charge.success`
**When**: Payment is successful
**Action**: Automatically verifies payment and activates subscription
**Response**: Updates subscription status, semester access, and payment records

### `charge.failed`
**When**: Payment fails
**Action**: Logs the failure for monitoring
**Response**: Can send notification to user (optional)

## Security

### Signature Verification

Every webhook request is verified using HMAC SHA512:

```typescript
const hash = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(JSON.stringify(request.body))
  .digest('hex');

if (hash === request.headers['x-paystack-signature']) {
  // Valid webhook from Paystack
}
```

### Important Security Notes

1. **Never disable signature verification** in production
2. **Always return 200 status** to Paystack (even on errors)
3. **Use HTTPS** in production (required by Paystack)
4. **Keep your secret key safe** - it's used for signature verification

## Testing Webhooks

### 1. Test Endpoint Availability

```bash
curl -X POST http://localhost:3000/api/subscriptions/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Webhook endpoint is working",
  "data": {
    "receivedBody": {"test": "webhook"},
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Simulate Paystack Webhook (For Testing)

```bash
# Generate signature
SECRET_KEY="your_secret_key"
BODY='{"event":"charge.success","data":{"reference":"SUB-test-123"}}'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha512 -hmac "$SECRET_KEY" -hex | cut -d' ' -f2)

# Send webhook
curl -X POST http://localhost:3000/api/subscriptions/webhook/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: $SIGNATURE" \
  -d "$BODY"
```

### 3. Use Paystack Webhook Test Feature

In the Paystack dashboard:
1. Go to **Settings** → **Webhooks**
2. Click **Test** next to your webhook URL
3. Select event type (e.g., `charge.success`)
4. Click **Send Test Event**

## Comparing: Webhook vs Callback

| Feature | Webhook (Recommended) | Callback |
|---------|----------------------|----------|
| Reliability | ✅ Very High | ⚠️ Depends on user |
| Automatic | ✅ Yes | ❌ No |
| User closes browser | ✅ Still works | ❌ Fails |
| Retry mechanism | ✅ Automatic | ❌ Manual |
| Setup complexity | ⚠️ Medium | ✅ Easy |
| Production ready | ✅ Yes | ⚠️ Not recommended |

## Webhook Flow Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Initiates Payment
     ▼
┌──────────────┐
│   Paystack   │
└────┬────┬────┘
     │    │
     │    │ 2. Sends Webhook (instant)
     │    ▼
     │  ┌─────────────────┐
     │  │  Your Server    │
     │  │ - Verifies Sign │
     │  │ - Updates DB    │
     │  │ - Activates Sub │
     │  └─────────────────┘
     │
     │ 3. User Redirected (optional)
     ▼
┌──────────────┐
│ Success Page │
└──────────────┘
```

## Troubleshooting

### Webhook Not Receiving Events

**Check:**
1. ✅ Webhook URL is correct in Paystack dashboard
2. ✅ Server is publicly accessible (use ngrok for local dev)
3. ✅ HTTPS is enabled (required for production)
4. ✅ Endpoint returns 200 status code
5. ✅ No firewall blocking Paystack IPs

**Paystack IP Ranges** (for firewall whitelist):
```
52.31.139.75
52.49.173.169
52.214.14.220
```

### Webhook Signature Verification Failing

**Check:**
1. ✅ Using correct secret key
2. ✅ Request body is parsed as raw (not JSON)
3. ✅ No body modification before verification
4. ✅ Using `express.raw()` middleware

### Webhook Receives Event but Payment Not Updated

**Check:**
1. ✅ Check server logs for errors
2. ✅ Verify transaction reference exists in database
3. ✅ Check Paystack dashboard for event details
4. ✅ Ensure `verifyPayment()` service is working

## Best Practices

### 1. Idempotency
Webhooks may be sent multiple times. Your code already handles this:
```typescript
// Verification is idempotent - safe to call multiple times
await subscriptionService.verifyPayment(reference);
```

### 2. Asynchronous Processing
For production, consider queue-based processing:
```typescript
// Queue webhook for background processing
await webhookQueue.add('process-payment', { reference });
```

### 3. Logging
Always log webhook events for debugging:
```typescript
console.log('Webhook received:', {
  event: event.event,
  reference: event.data.reference,
  timestamp: new Date().toISOString()
});
```

### 4. Monitoring
Set up alerts for:
- Webhook failures
- Signature verification failures
- Payment processing errors

### 5. Error Handling
Always return 200 to Paystack:
```typescript
try {
  await processWebhook(event);
} catch (error) {
  console.error('Webhook error:', error);
  // Still return 200 to prevent retries
  res.status(200).send('Received');
}
```

## Production Checklist

- [ ] Webhook URL uses HTTPS
- [ ] Webhook URL registered in Paystack dashboard
- [ ] Secret key is secure and not exposed
- [ ] Signature verification is enabled
- [ ] Logging is set up
- [ ] Error monitoring is configured
- [ ] Tested with real payments
- [ ] Tested webhook retry mechanism
- [ ] Documented for team

## FAQ

**Q: Do I still need the callback URL?**
A: Keep it as a fallback, but webhooks are the primary method.

**Q: How long does Paystack retry failed webhooks?**
A: Paystack retries for up to 3 days with exponential backoff.

**Q: Can I use both webhook and callback?**
A: Yes! Webhook for automatic processing, callback for user experience.

**Q: What if webhook fails?**
A: Paystack retries automatically. User can also manually verify via the callback URL.

**Q: How do I test in development?**
A: Use ngrok to expose your local server or use Paystack's test mode.

## Support

- **Paystack Documentation**: https://paystack.com/docs/payments/webhooks
- **Integration Guide**: See `INTEGRATION_GUIDE.md`
- **API Reference**: See `API_QUICK_REFERENCE.md`

---

**Note**: Webhooks are the recommended approach for production. They provide the most reliable payment verification experience for your users.

