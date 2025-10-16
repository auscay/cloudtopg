# Subscription Module

A comprehensive subscription and payment management system integrated with Paystack for handling student enrollments with flexible payment plans.

## Table of Contents

- [Overview](#overview)
- [Payment Structure](#payment-structure)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Models](#models)
- [Middleware](#middleware)

## Overview

This module manages student subscriptions for a 4-semester (12-month) program with a total cost of ₦600,000. It supports three different payment plans based on when students enroll.

## Payment Structure

### 1. Early Bird Plan
- **Who**: Students who join during the early registration period
- **Payment Mode**: Per semester (₦150,000 × 4 semesters)
- **Total Payment**: ₦600,000 (spread across semesters)
- **Payment Schedule**: Every 3 months (1 semester at a time)

### 2. Mid Plan (Post-Early Bird)
- **Who**: Students who join after the early bird period
- **Payment Mode**: Upfront for 2 semesters (₦300,000 × 2)
- **Total Payment**: ₦600,000
- **Payment Schedule**: Every 6 months (2 semesters at a time)

### 3. Normal Plan (Late Bird)
- **Who**: Students who join after both early bird and mid offers have closed
- **Payment Mode**: Full upfront payment for all 4 semesters
- **Total Payment**: ₦600,000 (paid once)
- **Payment Schedule**: One-time payment

## Setup

### 1. Install Dependencies

The required dependencies are already installed:
- `paystack-api` - For Paystack payment integration
- `axios` - For HTTP requests

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/subscriptions/verify
```

### 3. Seed Payment Plans

Run the seed script to initialize the payment plans:

```bash
npx ts-node src/modules/subscription/scripts/seedPaymentPlans.ts
```

## API Endpoints

### Payment Plans

#### Get All Plans
```
GET /api/subscriptions/plans
Authentication: Required
```

#### Get Plan by Type
```
GET /api/subscriptions/plans/:type
Authentication: Required
Params: type (early_bird | mid | normal)
```

### Subscriptions

#### Create Subscription and Initiate Payment
```
POST /api/subscriptions
Authentication: Required
Body: {
  "planType": "early_bird" | "mid" | "normal",
  "metadata": {} (optional)
}
Response: {
  "subscription": {...},
  "transaction": {...},
  "paymentUrl": "https://checkout.paystack.com/..."
}
```

#### Get User's Subscriptions
```
GET /api/subscriptions/my-subscriptions
Authentication: Required
```

#### Get Active Subscription
```
GET /api/subscriptions/active
Authentication: Required
```

#### Get Subscription by ID
```
GET /api/subscriptions/:id
Authentication: Required (Owner only)
```

#### Check User Access
```
GET /api/subscriptions/check-access
Authentication: Required
Response: {
  "hasAccess": true/false,
  "message": "...",
  "subscription": {...}
}
```

### Payments

#### Make Payment for Existing Subscription
```
POST /api/subscriptions/:subscriptionId/pay
Authentication: Required (Owner only)
Body: {
  "metadata": {} (optional)
}
```

#### Verify Payment
```
GET /api/subscriptions/verify?reference=SUB-xxx
Authentication: Required
```

### Transactions

#### Get User's Transactions
```
GET /api/subscriptions/transactions/my-transactions
Authentication: Required
```

#### Get Subscription Transactions
```
GET /api/subscriptions/:subscriptionId/transactions
Authentication: Required (Owner only)
```

### Management

#### Cancel Subscription
```
PATCH /api/subscriptions/:id/cancel
Authentication: Required (Owner only)
Body: {
  "reason": "Cancellation reason" (optional)
}
```

#### Get Payment Statistics (Admin)
```
GET /api/subscriptions/stats/payments
Authentication: Required (Admin only)
Response: {
  "totalRevenue": 0,
  "totalSubscriptions": 0,
  "activeSubscriptions": 0,
  "pendingPayments": 0,
  "earlyBirdSubscriptions": 0,
  "midSubscriptions": 0,
  "normalSubscriptions": 0
}
```

## Usage Examples

### 1. Create Subscription (Early Bird)

```typescript
// Frontend/Client
const response = await fetch('/api/subscriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    planType: 'early_bird'
  })
});

const data = await response.json();
// Redirect user to payment page
window.location.href = data.data.paymentUrl;
```

### 2. Verify Payment After Redirect

```typescript
// After Paystack redirects back to your callback URL
const urlParams = new URLSearchParams(window.location.search);
const reference = urlParams.get('reference');

const response = await fetch(`/api/subscriptions/verify?reference=${reference}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
if (data.success) {
  // Payment successful
  console.log('Subscription activated:', data.data.subscription);
}
```

### 3. Check User Access Before Showing Protected Content

```typescript
const response = await fetch('/api/subscriptions/check-access', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
if (data.hasAccess) {
  // Show protected content
} else {
  // Redirect to subscription page
}
```

### 4. Using Access Middleware in Routes

```typescript
import { subscriptionAccessMiddleware } from './modules/subscription/middleware/subscriptionAccess';

// Protect an entire route
router.get('/protected-resource',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireActiveSubscription,
  (req, res) => {
    // Only users with active subscriptions can access this
  }
);

// Protect based on semester
router.get('/semester-3-content',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireSemesterAccess(3),
  (req, res) => {
    // Only users who have paid for at least 3 semesters can access
  }
);
```

## Models

### PaymentPlan
- `name`: Plan name
- `type`: early_bird | mid | normal
- `description`: Plan description
- `totalAmount`: Total program cost (₦600,000)
- `installmentAmount`: Amount per payment
- `numberOfInstallments`: Number of payments required
- `semestersPerInstallment`: Semesters covered per payment
- `isActive`: Whether plan is currently available

### Subscription
- `userId`: Reference to User
- `planId`: Reference to PaymentPlan
- `status`: pending | active | expired | cancelled | suspended
- `startDate`: Subscription start date
- `endDate`: Subscription end date (12 months from start)
- `currentSemester`: Current semester (0-4)
- `totalAmountPaid`: Total amount paid so far
- `amountRemaining`: Amount still owed
- `nextPaymentDue`: Date when next payment is due
- `nextPaymentAmount`: Amount for next payment

### Transaction
- `userId`: Reference to User
- `subscriptionId`: Reference to Subscription
- `planId`: Reference to PaymentPlan
- `amount`: Transaction amount
- `currency`: NGN
- `status`: pending | success | failed | cancelled
- `paymentMethod`: card | bank | ussd | mobile_money
- `paystackReference`: Unique Paystack reference
- `paystackAccessCode`: Paystack access code
- `paystackAuthorizationUrl`: Payment URL
- `paymentDate`: Date payment was completed
- `metadata`: Additional transaction data

## Middleware

### subscriptionAccessMiddleware

#### requireActiveSubscription
Ensures user has an active subscription before accessing protected resources.

```typescript
router.get('/resource',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireActiveSubscription,
  controller.getResource
);
```

#### requireSemesterAccess(semesterNumber)
Ensures user has paid for a specific semester before accessing content.

```typescript
router.get('/semester-2',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireSemesterAccess(2),
  controller.getSemester2Content
);
```

## Payment Flow

1. **User selects a plan** → GET `/api/subscriptions/plans`
2. **Create subscription** → POST `/api/subscriptions` with `planType`
3. **System generates Paystack payment link** → Returns `paymentUrl`
4. **User redirected to Paystack** → Completes payment
5. **Paystack redirects back** → To callback URL with `reference`
6. **Verify payment** → GET `/api/subscriptions/verify?reference=xxx`
7. **System updates subscription** → Activates access based on payment
8. **User accesses content** → Protected by subscription middleware

## Notes

- All amounts are in Nigerian Naira (₦)
- Paystack amounts are converted to kobo (smallest unit)
- Payment verification is idempotent (safe to call multiple times)
- Subscriptions automatically calculate next payment dates
- Admin can view payment statistics across all plans
- Users can have only one active subscription at a time
- Subscriptions can be cancelled with optional reason

## Support

For issues or questions, please contact the development team.

