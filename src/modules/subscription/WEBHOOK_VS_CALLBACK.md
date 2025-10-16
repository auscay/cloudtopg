# Webhook vs Callback: Understanding the Difference

## Overview

Your subscription module now supports **BOTH** webhook and callback methods for payment verification. Here's what you need to know:

## Quick Comparison

| Aspect | Webhook (Recommended ✅) | Callback |
|--------|--------------------------|----------|
| **Trigger** | Paystack → Your Server | User Browser → Your Server |
| **Reliability** | 99.9% (Paystack retries) | Depends on user behavior |
| **User closes browser** | ✅ Still works | ❌ Fails |
| **Network issues** | ✅ Auto retry | ❌ Lost |
| **Speed** | ⚡ Instant | Depends on redirect |
| **Security** | 🔒 Cryptographically signed | 🔒 Token-based |
| **Setup** | Medium (requires public URL) | Easy |
| **Best for** | Production | Development/Fallback |

## How Each Works

### Webhook Flow (Server-to-Server)

```
1. User pays on Paystack
2. Paystack → Sends webhook to YOUR SERVER (instant)
3. Your server verifies & updates subscription
4. User can immediately access content
   
✅ Works even if user closes browser
✅ No user action required
✅ Automatic retry on failure
```

### Callback Flow (Browser Redirect)

```
1. User pays on Paystack
2. Paystack → Redirects user back to YOUR SITE
3. User's browser hits: /api/subscriptions/verify?reference=xxx
4. Your server verifies & updates subscription
5. User sees success page

❌ Fails if user closes browser
❌ Fails if network interrupts
❌ Requires manual retry
```

## When to Use Each

### Use Webhook When:
- ✅ Running in production
- ✅ Need 100% reliability
- ✅ Have public HTTPS URL
- ✅ Want automatic processing

### Use Callback When:
- ✅ Developing locally (no ngrok)
- ✅ As a fallback mechanism
- ✅ For user-facing confirmation
- ✅ Testing without webhook setup

### Use Both When:
- ✅ **Best Practice!**
- Webhook for reliability
- Callback for user experience
- Double verification

## Code Examples

### Frontend: Both Methods Work the Same

```typescript
// User flow is identical
const response = await fetch('/api/subscriptions', {
  method: 'POST',
  body: JSON.stringify({ planType: 'early_bird' })
});

const { paymentUrl } = response.data;
window.location.href = paymentUrl; // Redirect to Paystack
```

### Backend: Webhook (Automatic)

```typescript
// POST /api/subscriptions/webhook/paystack
// Paystack calls this automatically
// No frontend code needed!

app.post('/webhook/paystack', async (req, res) => {
  // Verify signature
  // Process payment
  // Update subscription
  res.sendStatus(200);
});
```

### Backend: Callback (Manual)

```typescript
// GET /api/subscriptions/verify?reference=xxx
// User's browser calls this after redirect
// Frontend triggers this

app.get('/verify', async (req, res) => {
  const { reference } = req.query;
  await verifyPayment(reference);
  res.json({ success: true });
});
```

## Real-World Scenarios

### Scenario 1: Perfect Flow (Both Working)
```
1. User pays ✅
2. Webhook fires → Subscription activated ⚡
3. User redirected → Sees success message ✅
Result: Great UX, subscription already active
```

### Scenario 2: User Closes Browser (Webhook Saves the Day)
```
1. User pays ✅
2. Webhook fires → Subscription activated ⚡
3. User closes browser ❌
4. User logs in later → Has access ✅
Result: Subscription still activated via webhook
```

### Scenario 3: Webhook Fails (Callback as Fallback)
```
1. User pays ✅
2. Webhook fails (server down) ❌
3. User redirected → Callback verifies ✅
4. Subscription activated ✅
Result: Callback catches what webhook missed
```

### Scenario 4: Network Issues (Best Setup)
```
1. User pays ✅
2. Webhook fires but times out ⚡
3. Paystack retries webhook (automatic) ✅
4. Retry succeeds → Subscription activated ✅
Result: Webhook retry mechanism works
```

## Production Setup

### Recommended: Use Both

```env
# Webhook for reliability
PAYSTACK_WEBHOOK_URL=https://api.yourdomain.com/api/subscriptions/webhook/paystack

# Callback for user experience
PAYSTACK_CALLBACK_URL=https://yourdomain.com/payment/success
```

### User Journey with Both

```
Step 1: User initiates payment
  ↓
Step 2: User completes payment on Paystack
  ↓ (simultaneously)
  ├─→ Webhook fires (background) → ⚡ Instant activation
  └─→ User redirected (foreground) → 👤 Success message
  ↓
Step 3: User sees success & has immediate access
```

## Testing Strategy

### Local Development (No Webhook)
```bash
# Just use callback
npm run dev
# Test payments with callback URL
```

### Development with Webhook
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 3000

# Use ngrok URL in Paystack dashboard
```

### Production
```bash
# Use real HTTPS URLs for both
WEBHOOK_URL=https://api.yourdomain.com/webhook
CALLBACK_URL=https://yourdomain.com/success
```

## Common Questions

**Q: Which should I use?**
A: Use BOTH! Webhook for reliability, callback for UX.

**Q: Can webhook replace callback completely?**
A: Technically yes, but keep callback for better UX and as fallback.

**Q: What if both fail?**
A: User can manually verify via "Check Payment Status" button that calls the verify endpoint.

**Q: Do I need HTTPS for webhook?**
A: Yes, Paystack requires HTTPS for webhooks in production.

**Q: Can I test webhook locally?**
A: Yes, use ngrok to expose your local server.

**Q: How do I know if webhook fired?**
A: Check your server logs or Paystack dashboard webhook logs.

**Q: What if payment succeeds but webhook fails?**
A: Paystack retries automatically. User can also use callback as fallback.

## Migration Guide

### Currently Using Callback Only?

**Step 1**: Add webhook endpoint
```typescript
// Already done! endpoint exists at:
POST /api/subscriptions/webhook/paystack
```

**Step 2**: Register webhook in Paystack
```
1. Go to Paystack Dashboard
2. Settings → Webhooks
3. Add your webhook URL
4. Save
```

**Step 3**: Test
```bash
# Make a test payment
# Check server logs for webhook event
```

**Step 4**: Monitor
```bash
# Watch logs for "Paystack webhook event: charge.success"
```

### Currently Using Webhook Only?

Keep it! Optionally add callback for better UX:
```typescript
// Redirect users to success page
window.location = callbackUrl + '?reference=' + reference;
```

## Best Practices

### ✅ DO:
- Use webhook as primary verification
- Keep callback as fallback
- Log all webhook events
- Monitor webhook failures
- Test both in staging
- Use HTTPS in production

### ❌ DON'T:
- Rely only on callback in production
- Disable webhook signature verification
- Ignore webhook failures
- Test only in production
- Mix up test/live keys

## Troubleshooting

### Webhook Not Working?
1. Check Paystack dashboard webhook logs
2. Verify webhook URL is public and HTTPS
3. Check server logs for signature errors
4. Test with Paystack's webhook test feature

### Callback Not Working?
1. Check callback URL is correct
2. Verify user completed payment
3. Check for reference in query params
4. Test manually with reference

## Summary

**For Best Results:**
1. ✅ Set up webhook (production reliability)
2. ✅ Keep callback (user experience)
3. ✅ Monitor both (observability)
4. ✅ Test thoroughly (quality)

**Remember:**
- Webhook = Server-to-server (reliable)
- Callback = Browser-to-server (user-facing)
- Both together = Best of both worlds! 🎉

---

For detailed setup instructions, see `WEBHOOK_SETUP.md`

