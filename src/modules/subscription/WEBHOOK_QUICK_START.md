# Webhook Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Add Webhook URL to Environment

```env
# Add to your .env file
PAYSTACK_WEBHOOK_URL=https://yourdomain.com/api/subscriptions/webhook/paystack
```

**For Local Development:**
```bash
# Terminal 1: Start your server
npm run dev

# Terminal 2: Expose with ngrok
npx ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Use: https://abc123.ngrok.io/api/subscriptions/webhook/paystack
```

### Step 2: Register Webhook in Paystack

1. Login to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings** → **Webhooks**
3. Click **Add Webhook**
4. Enter your webhook URL
5. Click **Save**

### Step 3: Test It!

```bash
# Make a test payment using test card
Card: 4084 0840 8408 4081
CVV: 408
Expiry: 12/25

# Check your server logs - you should see:
# "Paystack webhook event: charge.success"
# "Processing successful charge: {reference: 'SUB-xxx'}"
# "Payment verification result: {status: 'active'}"
```

## ✅ That's It!

Your payments are now automatically verified via webhook!

## 🧪 Testing

### Test Webhook Endpoint
```bash
curl -X POST http://localhost:3000/api/subscriptions/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Simulate Payment
```bash
# 1. Create subscription
POST /api/subscriptions
Body: { "planType": "early_bird" }

# 2. Use returned paymentUrl
# 3. Pay with test card
# 4. Webhook fires automatically!
# 5. Check logs or database
```

## 📊 What Happens Automatically

```
User Pays → Paystack Sends Webhook → Your Server:
  ✅ Verifies signature
  ✅ Checks payment status
  ✅ Updates subscription
  ✅ Activates user access
  ✅ Logs everything
```

## 🔍 Monitoring

### Check Webhook Logs in Paystack
1. Paystack Dashboard → Settings → Webhooks
2. Click on your webhook URL
3. View delivery history and responses

### Check Your Server Logs
```bash
# Look for these messages:
"Paystack webhook event: charge.success"
"Processing successful charge"
"Payment verification result"
```

## 🆘 Troubleshooting

**Webhook not firing?**
- ✅ Check URL is public and HTTPS (use ngrok for local dev)
- ✅ Verify URL is correct in Paystack dashboard
- ✅ Check server logs for errors
- ✅ Test webhook in Paystack dashboard

**Signature verification failing?**
- ✅ Using correct Paystack secret key
- ✅ Not modifying request body before verification
- ✅ Server returning 200 status code

**Payment verified but subscription not updated?**
- ✅ Check server logs for errors
- ✅ Verify transaction reference exists in database
- ✅ Check Paystack dashboard for payment details

## 📚 More Information

- **Detailed Setup**: See `WEBHOOK_SETUP.md`
- **Webhook vs Callback**: See `WEBHOOK_VS_CALLBACK.md`
- **API Reference**: See `API_QUICK_REFERENCE.md`
- **Integration Guide**: See `INTEGRATION_GUIDE.md`

## 💡 Pro Tips

1. **Use Both Webhook and Callback** for best reliability
2. **Monitor webhook logs** regularly
3. **Test with real payments** in staging
4. **Set up alerts** for webhook failures
5. **Use HTTPS** in production (required)

## 🎉 You're All Set!

Webhooks are now handling your payment verification automatically. No more manual verification needed!

