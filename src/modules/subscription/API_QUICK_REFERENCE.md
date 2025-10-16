# Subscription API - Quick Reference Card

## 🔑 Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Payment Plans

### Get All Plans
```http
GET /api/subscriptions/plans
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Early Bird Plan",
      "type": "early_bird",
      "totalAmount": 600000,
      "installmentAmount": 150000,
      "numberOfInstallments": 4
    }
  ]
}
```

### Get Plan by Type
```http
GET /api/subscriptions/plans/:type
```
**Parameters:** `type` = `early_bird` | `mid` | `normal`

---

## 💳 Create & Pay

### Create Subscription
```http
POST /api/subscriptions
Content-Type: application/json

{
  "planType": "early_bird",
  "metadata": {}
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": { ... },
    "transaction": { ... },
    "paymentUrl": "https://checkout.paystack.com/..."
  }
}
```
**Next Step:** Redirect user to `paymentUrl`

### Verify Payment
```http
GET /api/subscriptions/verify?reference=SUB-123456
```
**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "transaction": { "status": "success" },
    "subscription": { "status": "active", "currentSemester": 1 }
  }
}
```

### Make Next Payment
```http
POST /api/subscriptions/:subscriptionId/pay
Content-Type: application/json

{
  "metadata": {}
}
```

---

## 📊 View Subscriptions

### My Subscriptions
```http
GET /api/subscriptions/my-subscriptions
```

### Active Subscription
```http
GET /api/subscriptions/active
```

### Subscription by ID
```http
GET /api/subscriptions/:id
```

### Check Access
```http
GET /api/subscriptions/check-access
```
**Response:**
```json
{
  "success": true,
  "hasAccess": true,
  "message": "Access granted",
  "data": { ... }
}
```

---

## 💰 Transactions

### My Transactions
```http
GET /api/subscriptions/transactions/my-transactions
```

### Subscription Transactions
```http
GET /api/subscriptions/:subscriptionId/transactions
```

---

## ⚙️ Management

### Cancel Subscription
```http
PATCH /api/subscriptions/:id/cancel
Content-Type: application/json

{
  "reason": "Optional cancellation reason"
}
```

### Payment Statistics (Admin Only)
```http
GET /api/subscriptions/stats/payments
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 5400000,
    "totalSubscriptions": 45,
    "activeSubscriptions": 38,
    "pendingPayments": 12,
    "earlyBirdSubscriptions": 20,
    "midSubscriptions": 15,
    "normalSubscriptions": 10
  }
}
```

---

## 🧪 Paystack Test Cards

### Successful Payment
```
Card: 4084 0840 8408 4081
CVV: 408
Expiry: 12/25 (any future date)
PIN: 0000
```

### Insufficient Funds
```
Card: 5060 6666 6666 6666 4444
CVV: 123
```

---

## 🔄 Typical Flow

```
1. GET /api/subscriptions/plans
   → Get available plans

2. POST /api/subscriptions
   Body: { "planType": "early_bird" }
   → Returns paymentUrl

3. Redirect to paymentUrl
   → User pays on Paystack

4. Paystack redirects back
   → With ?reference=SUB-xxx

5. GET /api/subscriptions/verify?reference=SUB-xxx
   → Verify payment

6. GET /api/subscriptions/check-access
   → Confirm access granted

7. POST /api/subscriptions/:id/pay
   → Make next payment (for installment plans)
```

---

## 📱 Status Codes

- `200` - Success
- `201` - Created (new subscription)
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (no access)
- `404` - Not found
- `500` - Server error

---

## 🎯 Quick Tips

1. **Always check** `success` field in response
2. **Save transaction reference** for verification
3. **Use test cards** in development
4. **Verify payments** after Paystack redirect
5. **Check access** before showing protected content
6. **Handle errors** gracefully in your UI

---

## 🔐 Middleware Usage

### Require Active Subscription
```typescript
router.get('/content',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireActiveSubscription,
  controller.getContent
);
```

### Require Semester Access
```typescript
router.get('/semester-2',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireSemesterAccess(2),
  controller.getSemester2
);
```

---

## 💡 Common Errors

### "User already has an active subscription"
- User trying to create duplicate subscription
- Check existing subscription first

### "Payment plan not found"
- Invalid `planType` value
- Run seed script: `npm run seed:payment-plans`

### "Invalid payment amount"
- Amount doesn't match plan's installment amount
- Use exact amount from plan

### "Subscription is fully paid"
- Trying to pay when no amount remaining
- Check `amountRemaining` before payment

### "No active subscription found"
- User hasn't subscribed yet
- Direct them to subscription page

---

## 📧 Environment Variables

```env
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/subscriptions/verify
```

---

## 🚀 Quick Start Command

```bash
# 1. Seed payment plans
npm run seed:payment-plans

# 2. Start server
npm run dev

# 3. Test with Postman/Frontend
```

---

**Need more details?** Check the full documentation:
- `README.md` - Complete module documentation
- `INTEGRATION_GUIDE.md` - Integration examples
- `SUBSCRIPTION_MODULE_SUMMARY.md` - Implementation overview

