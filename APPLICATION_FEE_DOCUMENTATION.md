# Application Fee Payment System - Complete Documentation

## 📋 Overview

A complete payment system for collecting a **₦20,000 application fee** from users. This is a **one-time payment** separate from the subscription system, typically paid during or before registration.

## 💰 Payment Details

- **Amount**: ₦20,000 (Twenty Thousand Naira)
- **Type**: One-time payment
- **Payment Method**: Paystack (Card, Bank Transfer, USSD)
- **Purpose**: Application processing fee
- **When**: Can be paid anytime (typically before or during registration)

## 🏗️ Architecture

```
User → Initiate Payment → Paystack → Webhook/Callback → Verification → User Updated
  ↓          ↓               ↓            ↓                  ↓              ↓
Request    Generate       Process     Notify Server      Confirm       Mark Paid
           Payment URL     Payment     Auto/Manual        Success       in Database
```

## 📁 File Structure

```
src/modules/applicationFee/
├── controllers/
│   └── ApplicationFeeController.ts       # HTTP request handlers
├── models/
│   └── ApplicationFee.ts                 # Mongoose model
├── repositories/
│   └── ApplicationFeeRepository.ts       # Data access layer
├── routes/
│   └── applicationFee.ts                 # API endpoints
├── services/
│   └── ApplicationFeeService.ts          # Business logic
└── validators/
    └── applicationFeeValidators.ts       # Request validation

src/types/
└── applicationFee.ts                     # TypeScript interfaces

Updated Files:
├── src/types/user.ts                     # Added applicationFeePaid field
├── src/modules/user/models/User.ts       # Added applicationFeePaid field
├── src/routes/index.ts                   # Registered application fee routes
├── src/subscription/controllers/WebhookController.ts  # Webhook support
└── src/types/index.ts                    # Exported application fee types
```

## 🚀 API Endpoints

### 1. Initiate Payment

```http
POST /api/application-fee/pay
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "metadata": {
    "purpose": "application_registration",
    "referrer": "website"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application fee payment initiated successfully",
  "data": {
    "applicationFee": {
      "_id": "...",
      "userId": "...",
      "amount": 20000,
      "currency": "NGN",
      "status": "pending",
      "paystackReference": "APP-1234567890",
      "paystackAuthorizationUrl": "https://checkout.paystack.com/..."
    },
    "paymentUrl": "https://checkout.paystack.com/..."
  }
}
```

### 2. Verify Payment

```http
GET /api/application-fee/verify?reference=APP-1234567890
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Application fee payment verified successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "amount": 20000,
    "status": "paid",
    "paymentDate": "2025-10-16T12:00:00.000Z",
    "paystackReference": "APP-1234567890"
  }
}
```

### 3. Get Payment Status

```http
GET /api/application-fee/status
Authorization: Bearer <jwt_token>
```

**Response (Not Paid):**
```json
{
  "success": true,
  "message": "No application fee payment found",
  "data": {
    "hasPaid": false,
    "amount": 20000
  }
}
```

**Response (Paid):**
```json
{
  "success": true,
  "message": "Application fee payment status retrieved successfully",
  "data": {
    "hasPaid": true,
    "applicationFee": {
      "_id": "...",
      "status": "paid",
      "amount": 20000,
      "paymentDate": "2025-10-16T12:00:00.000Z"
    }
  }
}
```

### 4. Check If User Has Paid

```http
GET /api/application-fee/check
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Application fee has been paid",
  "data": {
    "hasPaid": true,
    "amount": 20000,
    "currency": "NGN"
  }
}
```

### 5. Get Statistics (Admin Only)

```http
GET /api/application-fee/stats
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Application fee statistics retrieved successfully",
  "data": {
    "totalRevenue": 2000000,
    "totalApplications": 125,
    "paidApplications": 100,
    "pendingPayments": 20,
    "failedPayments": 5,
    "applicationFeeAmount": 20000
  }
}
```

## 💻 Usage Examples

### Frontend Implementation

#### React Example

```tsx
import { useState } from 'react';

function ApplicationFeePayment() {
  const [loading, setLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // Check if user has already paid
  const checkPaymentStatus = async () => {
    const response = await fetch('/api/application-fee/check', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    setHasPaid(data.data.hasPaid);
  };

  // Initiate payment
  const handlePay = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/application-fee/pay', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata: {
            purpose: 'registration',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to Paystack
        window.location.href = data.data.paymentUrl;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (hasPaid) {
    return (
      <div className="payment-success">
        <h3>✅ Application Fee Paid</h3>
        <p>Your application fee has been successfully processed.</p>
      </div>
    );
  }

  return (
    <div className="payment-form">
      <h3>Application Fee</h3>
      <p>Amount: ₦20,000</p>
      <p>This is a one-time payment to process your application.</p>
      <button onClick={handlePay} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
```

#### Payment Verification Page

```tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function ApplicationFeeVerification() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('error');
        setMessage('No payment reference found');
        return;
      }

      try {
        const response = await fetch(
          `/api/application-fee/verify?reference=${reference}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Application fee paid successfully!');
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return <div>Verifying payment...</div>;
  }

  return (
    <div className={`verification-${status}`}>
      <h2>{status === 'success' ? '✅ Success' : '❌ Error'}</h2>
      <p>{message}</p>
      <a href="/dashboard">Go to Dashboard</a>
    </div>
  );
}
```

### Backend Usage

#### Require Payment Before Access

```typescript
// Middleware to check application fee payment
export const requireApplicationFeePaid = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    
    if (!user?.applicationFeePaid) {
      const response: ApiResponse = {
        success: false,
        message: 'Application fee payment required',
        data: {
          requiresPayment: true,
          amount: 20000,
          paymentUrl: '/application-fee/pay'
        }
      };
      res.status(403).json(response);
      return;
    }

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to verify application fee payment'
    };
    res.status(500).json(response);
  }
};

// Usage
router.post('/apply',
  authMiddleware.authenticate,
  requireApplicationFeePaid,
  applicationController.submitApplication
);
```

## 🔄 Payment Flow

```
Step 1: User clicks "Pay Application Fee"
  ↓
Step 2: POST /api/application-fee/pay
  ↓
Step 3: System generates Paystack payment URL
  ↓
Step 4: User redirected to Paystack
  ↓
Step 5: User completes payment
  ↓
Step 6: Webhook fires (automatic) OR User redirected (manual)
  ↓
Step 7: System verifies payment with Paystack
  ↓
Step 8: Database updated:
  - ApplicationFee.status = 'paid'
  - User.applicationFeePaid = true
  ↓
Step 9: User can proceed with application
```

## 🔒 Security Features

1. **Duplicate Prevention**: Users can only have one application fee payment
2. **Idempotent Verification**: Safe to verify multiple times
3. **Webhook Signature Verification**: All webhooks cryptographically verified
4. **Reference Validation**: Unique references prevent fraud
5. **User Authorization**: Users can only access their own payments

## 🧪 Testing

### Test Cards (Paystack)

```
Success:
Card: 4084 0840 8408 4081
CVV: 408
Expiry: Any future date
PIN: 0000

Insufficient Funds:
Card: 5060 6666 6666 6666 4444
CVV: 123
```

### Test Workflow

```bash
# 1. Login/Register
POST /api/auth/login

# 2. Check status (should be false)
GET /api/application-fee/check

# 3. Initiate payment
POST /api/application-fee/pay

# 4. Complete payment on Paystack (use test card)

# 5. Verify payment
GET /api/application-fee/verify?reference=APP-xxx

# 6. Check status again (should be true)
GET /api/application-fee/check
```

## 📊 Database Schema

### ApplicationFee Collection

```typescript
{
  _id: ObjectId,
  userId: String (ref: 'User'),
  amount: Number (20000),
  currency: String ('NGN'),
  status: 'pending' | 'paid' | 'failed' | 'refunded',
  paystackReference: String (unique),
  paystackAccessCode: String,
  paystackAuthorizationUrl: String,
  paymentMethod: String,
  paymentDate: Date,
  metadata: Object,
  failureReason: String,
  refundedAt: Date,
  refundReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### User Model Addition

```typescript
{
  // ... existing fields
  applicationFeePaid: Boolean (default: false)
}
```

## 🎯 Key Differences from Subscription

| Feature | Application Fee | Subscription |
|---------|----------------|--------------|
| **Amount** | ₦20,000 | ₦600,000 |
| **Frequency** | One-time | Recurring (installments) |
| **Purpose** | Application processing | Course access |
| **Payment Plans** | No | Yes (3 plans) |
| **Installments** | No | Yes |
| **Refundable** | Optional | No |
| **Tracks Semesters** | No | Yes |

## ⚙️ Configuration

### Change Application Fee Amount

Edit `src/modules/applicationFee/services/ApplicationFeeService.ts`:

```typescript
private readonly APPLICATION_FEE_AMOUNT = 25000; // Change to new amount
```

### Enable/Disable Application Fee

Create middleware to bypass if needed:

```typescript
// Skip application fee check for certain roles
if (user.role === UserRole.ADMIN) {
  next();
  return;
}
```

## 🎨 Integration Tips

### 1. Show Payment Status on Dashboard

```tsx
const { user } = useAuth();

return (
  <div>
    {!user.applicationFeePaid && (
      <Alert type="warning">
        <p>Please pay the application fee to proceed</p>
        <Link to="/application-fee/pay">Pay Now</Link>
      </Alert>
    )}
  </div>
);
```

### 2. Block Actions Until Paid

```tsx
const handleSubmitApplication = () => {
  if (!user.applicationFeePaid) {
    alert('Please pay application fee first');
    router.push('/application-fee/pay');
    return;
  }
  
  // Proceed with application
};
```

### 3. Admin Dashboard Widget

```tsx
const ApplicationFeeStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/application-fee/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data.data));
  }, []);

  return (
    <div className="stats-card">
      <h3>Application Fee Revenue</h3>
      <p>Total: ₦{stats?.totalRevenue.toLocaleString()}</p>
      <p>Paid: {stats?.paidApplications}</p>
      <p>Pending: {stats?.pendingPayments}</p>
    </div>
  );
};
```

## 📝 Common Use Cases

### 1. Require Payment Before Registration Completion

```typescript
// In registration flow
const user = await createUser(userData);
const applicationFee = await createApplicationFee(user._id);

return {
  user,
  nextStep: 'payment',
  paymentUrl: applicationFee.paymentUrl
};
```

### 2. Require Payment Before Subscription

```typescript
// Check before allowing subscription
if (!user.applicationFeePaid) {
  throw new Error('Please pay application fee before subscribing');
}
```

### 3. Refund Application Fee

```typescript
// Manual refund (requires admin action)
await ApplicationFee.findByIdAndUpdate(feeId, {
  status: 'refunded',
  refundedAt: new Date(),
  refundReason: 'User request'
});

await User.findByIdAndUpdate(userId, {
  applicationFeePaid: false
});
```

## 🚨 Error Handling

### Common Errors

```typescript
// User already paid
{
  "success": false,
  "message": "Application fee has already been paid"
}

// Payment verification failed
{
  "success": false,
  "message": "Payment failed: Insufficient funds"
}

// Invalid reference
{
  "success": false,
  "message": "Application fee record not found"
}
```

## 📈 Analytics

Track important metrics:
- Total revenue from application fees
- Payment success rate
- Average time to payment
- Payment method distribution
- Failed payment reasons

## ✅ Summary

**What You Have:**
- ✅ Complete application fee payment system
- ✅ ₦20,000 one-time payment
- ✅ Paystack integration
- ✅ Webhook support
- ✅ Manual verification fallback
- ✅ Admin statistics
- ✅ User payment tracking
- ✅ Duplicate prevention
- ✅ Full API documentation
- ✅ Ready for production

**Next Steps:**
1. Test with Paystack test cards
2. Integrate into your frontend
3. Add payment status checks where needed
4. Monitor payments in admin dashboard
5. Go live with real Paystack keys

---

**🎉 Congratulations!** Your application fee payment system is fully implemented and ready to use!

