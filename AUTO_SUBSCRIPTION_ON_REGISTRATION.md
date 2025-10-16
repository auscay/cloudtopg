# Auto Subscription on Registration

## ✅ What Was Implemented

When a user registers/signs up, a **pending subscription** is automatically created with the **Early Bird plan** as the default. This ensures every user has a subscription record that they can activate by making payment.

## 🔄 How It Works

### Registration Flow

```
User Registers → User Created → Pending Subscription Created → User Reference Updated
     ↓                ↓                    ↓                           ↓
  Account         Database            Early Bird Plan            subscription field
   Created         Entry               Status: PENDING              populated
```

### What Happens Automatically

1. **User Signs Up** with email, name, password, etc.
2. **User Account Created** in the database
3. **Pending Subscription Created** with:
   - Plan Type: `early_bird` (default)
   - Status: `pending`
   - Amount Remaining: ₦600,000
   - Current Semester: 0
4. **User Record Updated** with subscription reference
5. **User Can Now See Subscription** in their profile

## 📊 Example Response

### Before (User Just Registered)

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "68f09b1e524eb7e75a9ee6d3",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "student",
    "status": "active",
    "subscription": {
      "_id": "68f0a1b2c3d4e5f6a7b8c9d0",
      "userId": "68f09b1e524eb7e75a9ee6d3",
      "planId": "68f0a1b2c3d4e5f6a7b8c9d1",
      "status": "pending",
      "startDate": "2025-10-16T12:00:00.000Z",
      "endDate": "2026-10-16T12:00:00.000Z",
      "currentSemester": 0,
      "totalAmountPaid": 0,
      "amountRemaining": 600000,
      "nextPaymentDue": "2025-10-23T12:00:00.000Z",
      "nextPaymentAmount": 150000,
      "createdAt": "2025-10-16T12:00:00.000Z"
    },
    "isEmailVerified": false,
    "createdAt": "2025-10-16T12:00:00.000Z",
    "fullName": "John Doe"
  }
}
```

### After Payment

```json
{
  "subscription": {
    "_id": "68f0a1b2c3d4e5f6a7b8c9d0",
    "status": "active",           // ✅ Changed from pending
    "currentSemester": 1,          // ✅ Updated to 1
    "totalAmountPaid": 150000,     // ✅ Payment recorded
    "amountRemaining": 450000,     // ✅ Remaining balance
    "nextPaymentDue": "2026-01-16T12:00:00.000Z",  // ✅ Next payment date
    "nextPaymentAmount": 150000
  }
}
```

## 🎯 Key Features

### 1. **Default Plan: Early Bird**
- All new users get Early Bird plan by default
- Can be changed later if needed
- 4 installments of ₦150,000 each

### 2. **Smart Duplicate Prevention**
- If a pending subscription already exists, it's reused
- No duplicate pending subscriptions created
- Safe to call multiple times

### 3. **Non-Blocking**
- Registration succeeds even if subscription creation fails
- Errors are logged but don't stop registration
- User experience is never interrupted

### 4. **Metadata Tracking**
- Tracks when subscription was created
- Marks subscriptions created during registration
- Helps with analytics and reporting

## 📡 API Endpoints to Check Subscription

### 1. Get User Profile (with Subscription)

```http
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "email": "user@example.com",
    "subscription": {
      "_id": "...",
      "status": "pending",
      "amountRemaining": 600000,
      "currentSemester": 0
    }
  }
}
```

### 2. Get Active Subscription Details

```http
GET /api/subscriptions/active
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "planId": "...",
    "status": "pending",
    "totalAmountPaid": 0,
    "amountRemaining": 600000,
    "currentSemester": 0,
    "nextPaymentAmount": 150000
  }
}
```

### 3. Check Access Status

```http
GET /api/subscriptions/check-access
Authorization: Bearer <your_jwt_token>
```

**Response (Before Payment):**
```json
{
  "success": false,
  "hasAccess": false,
  "message": "Subscription is not active"
}
```

**Response (After Payment):**
```json
{
  "success": true,
  "hasAccess": true,
  "message": "Access granted",
  "data": {
    "status": "active",
    "currentSemester": 1
  }
}
```

## 🔧 Customization Options

### Change Default Plan

Edit `src/modules/auth/services/AuthService.ts`:

```typescript
const pendingSubscription = await this.subscriptionService.createSubscription({
  userId: newUser._id.toString(),
  planType: PaymentPlanType.MID,  // Change to MID or NORMAL
  metadata: {
    createdDuringRegistration: true,
    registrationDate: new Date()
  }
});
```

### Add Custom Metadata

```typescript
const pendingSubscription = await this.subscriptionService.createSubscription({
  userId: newUser._id.toString(),
  planType: PaymentPlanType.EARLY_BIRD,
  metadata: {
    createdDuringRegistration: true,
    registrationDate: new Date(),
    referralSource: userData.howDidYouHearAboutUs,  // Track source
    userRole: userData.role,                          // Track role
    customField: 'your-value'                        // Any custom data
  }
});
```

## 🎨 Frontend Integration

### Display Subscription Status on Dashboard

```typescript
// Fetch user profile
const response = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();

// Check subscription status
if (data.subscription) {
  if (data.subscription.status === 'pending') {
    // Show "Complete Payment" button
    showPaymentButton(data.subscription);
  } else if (data.subscription.status === 'active') {
    // Show subscription details
    showSubscriptionInfo(data.subscription);
  }
} else {
  // No subscription (shouldn't happen for new users)
  showCreateSubscriptionButton();
}
```

### Example React Component

```tsx
function SubscriptionStatus({ user }) {
  const { subscription } = user;

  if (!subscription) {
    return <p>No subscription found</p>;
  }

  if (subscription.status === 'pending') {
    return (
      <div className="subscription-pending">
        <h3>Complete Your Subscription</h3>
        <p>Plan: Early Bird (₦150,000 per semester)</p>
        <p>Total: ₦600,000 (4 semesters)</p>
        <p>Amount Due: ₦{subscription.nextPaymentAmount.toLocaleString()}</p>
        <button onClick={() => initiatePayment(subscription._id)}>
          Pay Now
        </button>
      </div>
    );
  }

  if (subscription.status === 'active') {
    return (
      <div className="subscription-active">
        <h3>✅ Subscription Active</h3>
        <p>Current Semester: {subscription.currentSemester} of 4</p>
        <p>Total Paid: ₦{subscription.totalAmountPaid.toLocaleString()}</p>
        <p>Remaining: ₦{subscription.amountRemaining.toLocaleString()}</p>
        {subscription.nextPaymentDue && (
          <p>Next Payment: {new Date(subscription.nextPaymentDue).toLocaleDateString()}</p>
        )}
      </div>
    );
  }

  return null;
}
```

## 🔍 Testing

### Test Registration

```bash
# Register a new user
POST /api/auth/register
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "Test@1234",
  "confirmPassword": "Test@1234",
  "phoneNumber": "1234567890"
}

# Check their profile (should have pending subscription)
GET /api/auth/profile
Authorization: Bearer <token_from_registration>
```

### Verify Subscription Created

```bash
# Check user's subscriptions
GET /api/subscriptions/my-subscriptions
Authorization: Bearer <token>

# Should return array with one pending subscription
```

## 📝 Database Changes

### User Model
- Added `subscription` field (ObjectId reference to Subscription)
- Automatically populated on user fetch
- Indexed for quick lookups

### Subscription Model
- No changes needed
- Works with existing structure

## ⚠️ Important Notes

1. **Payment Required**: Users must complete payment to activate subscription
2. **Status Flow**: `pending` → `active` (after first payment)
3. **Early Bird Default**: All new users get Early Bird plan
4. **No Duplicates**: System prevents duplicate pending subscriptions
5. **Graceful Failure**: Registration succeeds even if subscription creation fails

## 🚀 Benefits

✅ **Better UX** - Users immediately see their subscription status  
✅ **Simpler Flow** - No separate subscription creation step  
✅ **Clear CTAs** - Easy to show "Complete Payment" prompts  
✅ **Tracking** - All users have subscription records from day 1  
✅ **Analytics** - Can track conversion from registration to payment  

## 📊 Next Steps

1. **Complete Payment** - User pays to activate subscription
2. **Webhook Processes** - Subscription status updated to active
3. **Access Granted** - User can access content
4. **Semester Progress** - Tracked automatically with each payment

---

**Summary**: Every new user now gets a pending Early Bird subscription automatically upon registration, ready to be activated with their first payment!

