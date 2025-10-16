# 🚀 Subscription Module - Setup Checklist

Follow this checklist to get your subscription system up and running!

## ✅ Step 1: Get Paystack Account

- [ ] Go to https://paystack.com
- [ ] Sign up for a free account
- [ ] Verify your email
- [ ] Navigate to **Settings** → **API Keys & Webhooks**
- [ ] Copy your **Test Secret Key** (starts with `sk_test_`)
- [ ] Copy your **Test Public Key** (starts with `pk_test_`)

> 💡 **Note**: Use test keys for development. Switch to live keys only when ready for production.

## ✅ Step 2: Configure Environment Variables

- [ ] Open your `.env` file (create one if it doesn't exist)
- [ ] Add the following lines:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/subscriptions/verify
```

- [ ] Replace `sk_test_your_actual_secret_key_here` with your actual Paystack secret key
- [ ] Replace `pk_test_your_actual_public_key_here` with your actual Paystack public key
- [ ] Save the file

## ✅ Step 3: Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

- [ ] Run the command above
- [ ] Verify no errors occurred

## ✅ Step 4: Seed Payment Plans

This creates the three payment plans in your database:

```bash
npm run seed:payment-plans
```

- [ ] Run the command above
- [ ] You should see output like:

```
Connected to MongoDB
Cleared existing payment plans
Successfully created 3 payment plans:

- Early Bird Plan (early_bird)
  Total Amount: ₦600,000
  Installment Amount: ₦150,000
  Number of Installments: 4
  Semesters per Installment: 1

- Mid Plan (Post-Early Bird) (mid)
  Total Amount: ₦600,000
  Installment Amount: ₦300,000
  Number of Installments: 2
  Semesters per Installment: 2

- Normal Plan (Late Bird) (normal)
  Total Amount: ₦600,000
  Installment Amount: ₦600,000
  Number of Installments: 1
  Semesters per Installment: 4

✅ Payment plans seeded successfully!
```

- [ ] Confirm you see the success message

## ✅ Step 5: Start Your Server

```bash
npm run dev
```

- [ ] Run the command above
- [ ] Server should start without errors
- [ ] You should see something like: `Server running on port 3000`

## ✅ Step 6: Test with Postman (Optional but Recommended)

### Import Collection
- [ ] Open Postman
- [ ] Click **Import**
- [ ] Select `src/modules/subscription/Subscription_API.postman_collection.json`
- [ ] Collection imported successfully

### Test Endpoints
- [ ] **Login** - Get your JWT token (token auto-saved in environment)
- [ ] **Get All Plans** - See the 3 payment plans
- [ ] **Create Early Bird Subscription** - Create a test subscription
- [ ] Copy the `paymentUrl` from response
- [ ] Open the URL in browser
- [ ] Use Paystack test card:
  - Card: `4084 0840 8408 4081`
  - CVV: `408`
  - Expiry: Any future date
  - PIN: `0000`
- [ ] Complete the payment
- [ ] You'll be redirected back
- [ ] **Verify Payment** - Confirm payment was successful
- [ ] **Check Access** - Verify you now have access

## ✅ Step 7: Verify in Database (Optional)

Using MongoDB Compass or CLI:

- [ ] Check `paymentplans` collection - should have 3 documents
- [ ] Check `subscriptions` collection - should have your test subscription
- [ ] Check `transactions` collection - should have your test transaction

## ✅ Step 8: Integrate with Your Frontend

Choose your integration method:

### Option A: Use Provided Examples
- [ ] Review `src/modules/subscription/INTEGRATION_GUIDE.md`
- [ ] Copy React/Vue/Angular examples
- [ ] Adapt to your frontend framework

### Option B: Build Custom Integration
- [ ] Review `src/modules/subscription/API_QUICK_REFERENCE.md`
- [ ] Implement payment flow in your frontend
- [ ] Test with test cards

## ✅ Step 9: Protect Your Routes

Add subscription protection to your backend routes:

```typescript
import { subscriptionAccessMiddleware } from './modules/subscription/middleware/subscriptionAccess';

// Protect entire route
router.use(subscriptionAccessMiddleware.requireActiveSubscription);

// Or protect specific routes
router.get('/protected',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireActiveSubscription,
  controller.getProtectedContent
);
```

- [ ] Identify routes that need protection
- [ ] Add subscription middleware
- [ ] Test access control

## ✅ Step 10: Test Complete Flow

### User Journey Test:
- [ ] User registers/logs in
- [ ] User views payment plans
- [ ] User selects a plan
- [ ] User is redirected to Paystack
- [ ] User completes payment
- [ ] System verifies payment
- [ ] User gets access to content
- [ ] Protected routes work correctly

## 📋 Post-Setup Tasks

### For Development
- [ ] Test all three payment plans
- [ ] Test payment failure scenarios
- [ ] Test access control on protected routes
- [ ] Test admin statistics endpoint

### For Production (When Ready)
- [ ] Get Paystack live keys
- [ ] Update `.env` with live keys
- [ ] Update `PAYSTACK_CALLBACK_URL` to production URL
- [ ] Test with small real payments first
- [ ] Set up webhook for automatic updates (optional)
- [ ] Monitor transactions in Paystack dashboard

## 🔧 Troubleshooting

### Issue: Seed script fails
**Solution:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in your `.env`
- Verify database connection

### Issue: Paystack initialization fails
**Solution:**
- Verify Paystack keys are correct
- Check keys start with `sk_test_` and `pk_test_`
- Ensure no extra spaces in `.env` file

### Issue: Payment verification fails
**Solution:**
- Ensure you completed payment on Paystack
- Check transaction reference is correct
- Verify payment was successful in Paystack dashboard

### Issue: Access denied after payment
**Solution:**
- Run payment verification endpoint
- Check subscription status in database
- Ensure user IDs match

## 📚 Quick Reference

### Important Files
- `src/modules/subscription/README.md` - Full documentation
- `src/modules/subscription/INTEGRATION_GUIDE.md` - Integration examples
- `src/modules/subscription/API_QUICK_REFERENCE.md` - API endpoints
- `SUBSCRIPTION_MODULE_SUMMARY.md` - Implementation overview

### Useful Commands
```bash
# Start development server
npm run dev

# Seed payment plans
npm run seed:payment-plans

# Build for production
npm run build

# Start production server
npm start
```

### Test Cards
```
Success: 4084 0840 8408 4081 (CVV: 408)
Fail: 5060 6666 6666 6666 4444 (CVV: 123)
```

## ✨ You're All Set!

Once you've completed this checklist:
- ✅ Subscription module is fully operational
- ✅ Payment processing is working
- ✅ Routes are protected
- ✅ Ready for integration

**Next Steps:**
1. Build your frontend subscription UI
2. Protect your course/content routes
3. Test thoroughly with test cards
4. Deploy to production when ready

---

**Need Help?**
- Check the documentation files listed above
- Review the Postman collection examples
- Test with the provided test cards
- Contact the development team

**Congratulations! 🎉**
Your subscription system is ready to accept payments!

