# Subscription Module - Architecture Overview

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend/Client                       │
│  (React, Vue, Angular, Mobile App, etc.)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │ JWT Authentication
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Express.js Server                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Routes (subscription.ts)                 │  │
│  │  - Payment Plans Endpoints                           │  │
│  │  - Subscription Endpoints                            │  │
│  │  - Payment Endpoints                                 │  │
│  │  - Transaction Endpoints                             │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                              │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │           Middleware Layer                           │  │
│  │  - Authentication (authMiddleware)                   │  │
│  │  - Authorization (role-based)                        │  │
│  │  - Validation (express-validator)                    │  │
│  │  - Subscription Access Control                       │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                              │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │        Controllers (SubscriptionController)          │  │
│  │  - Request Handling                                  │  │
│  │  - Response Formatting                               │  │
│  │  - Error Handling                                    │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                              │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │         Services (Business Logic)                    │  │
│  │  ┌──────────────────┐  ┌──────────────────────┐     │  │
│  │  │SubscriptionService│  │  PaystackService    │     │  │
│  │  │  - Create Sub    │  │  - Initialize       │     │  │
│  │  │  - Verify Pay    │  │  - Verify Payment   │     │  │
│  │  │  - Check Access  │  │  - API Calls        │     │  │
│  │  └──────────┬───────┘  └─────────┬────────────┘     │  │
│  └─────────────┼──────────────────────┼─────────────────┘  │
│                │                      │                     │
│  ┌─────────────▼──────────────────────▼─────────────────┐  │
│  │         Repositories (Data Access)                   │  │
│  │  - PaymentPlanRepository                             │  │
│  │  - SubscriptionRepository                            │  │
│  │  - TransactionRepository                             │  │
│  └────────────┬─────────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PaymentPlans │  │Subscriptions │  │ Transactions │     │
│  │  Collection  │  │  Collection  │  │  Collection  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Paystack API                         │  │
│  │  - Payment Initialization                            │  │
│  │  - Payment Verification                              │  │
│  │  - Transaction Management                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Payment Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. GET /subscriptions/plans
       ▼
┌──────────────┐
│   Get Plans  │
└──────┬───────┘
       │
       │ 2. POST /subscriptions
       │    { planType: "early_bird" }
       ▼
┌─────────────────────┐
│ Create Subscription │
│  & Initialize Pay   │
└──────┬──────────────┘
       │
       │ 3. Returns paymentUrl
       ▼
┌──────────────────┐
│ Redirect User to │
│  Paystack Page   │
└──────┬───────────┘
       │
       │ 4. User Enters Card Details
       │    & Completes Payment
       ▼
┌─────────────────┐
│ Paystack Charge │
└──────┬──────────┘
       │
       │ 5. Redirect back with reference
       ▼
┌────────────────────┐
│ GET /verify?       │
│ reference=SUB-xxx  │
└──────┬─────────────┘
       │
       │ 6. Verify with Paystack
       ▼
┌──────────────────┐
│ Update Subscription│
│ - totalAmountPaid │
│ - currentSemester │
│ - status: active  │
└──────┬───────────┘
       │
       │ 7. Return success
       ▼
┌──────────────┐
│ User has     │
│ Access!      │
└──────────────┘
```

## 🗂️ Data Model

### PaymentPlan
```typescript
{
  _id: ObjectId,
  name: string,              // "Early Bird Plan"
  type: enum,                // early_bird | mid | normal
  description: string,       // Plan details
  totalAmount: number,       // 600000
  installmentAmount: number, // 150000 (varies by plan)
  numberOfInstallments: number, // 4 (varies by plan)
  semestersPerInstallment: number, // 1 (varies by plan)
  isActive: boolean,         // true
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription
```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to User
  planId: ObjectId,          // Reference to PaymentPlan
  status: enum,              // pending | active | expired | cancelled
  startDate: Date,           // Subscription start
  endDate: Date,             // 12 months from start
  currentSemester: number,   // 0-4 (semesters paid for)
  totalAmountPaid: number,   // Amount paid so far
  amountRemaining: number,   // Amount still owed
  nextPaymentDue: Date,      // When next payment is due
  nextPaymentAmount: number, // Amount of next payment
  autoRenew: boolean,        // false
  lastPaymentDate: Date,     // Last successful payment
  cancelledAt: Date,         // If cancelled
  cancellationReason: string,
  metadata: object,          // Custom data
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```typescript
{
  _id: ObjectId,
  userId: ObjectId,              // Reference to User
  subscriptionId: ObjectId,      // Reference to Subscription
  planId: ObjectId,              // Reference to PaymentPlan
  amount: number,                // Payment amount
  currency: string,              // "NGN"
  status: enum,                  // pending | success | failed
  paymentMethod: enum,           // card | bank | ussd
  paystackReference: string,     // "SUB-1234567890"
  paystackAccessCode: string,    // Paystack access code
  paystackAuthorizationUrl: string, // Payment URL
  paymentDate: Date,             // When payment succeeded
  metadata: {
    paystackData: object,        // Full Paystack response
    semestersPaid: number,       // Semesters this payment covers
    installmentNumber: number    // Which installment
  },
  failureReason: string,         // If failed
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Access Control Flow

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ authMiddleware      │
│ - Verify JWT Token  │
│ - Load User         │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────────┐
│ subscriptionAccessMiddleware │
│ - Check Active Subscription  │
│ - Check Semester Access      │
└────────┬─────────────────────┘
         │
         ├─── Has Access ───▶ Continue to Route Handler
         │
         └─── No Access ────▶ 403 Forbidden Response
```

## 📦 Module Structure

```
src/modules/subscription/
├── controllers/
│   └── SubscriptionController.ts    # HTTP handlers
├── middleware/
│   └── subscriptionAccess.ts        # Access control
├── models/
│   ├── PaymentPlan.ts               # Payment plan schema
│   ├── Subscription.ts              # Subscription schema
│   └── Transaction.ts               # Transaction schema
├── repositories/
│   ├── PaymentPlanRepository.ts     # Payment plan data access
│   ├── SubscriptionRepository.ts    # Subscription data access
│   └── TransactionRepository.ts     # Transaction data access
├── routes/
│   └── subscription.ts              # API routes
├── scripts/
│   └── seedPaymentPlans.ts          # Database seeding
├── services/
│   ├── PaystackService.ts           # Paystack integration
│   └── SubscriptionService.ts       # Business logic
├── validators/
│   └── subscriptionValidators.ts    # Request validation
├── API_QUICK_REFERENCE.md
├── ARCHITECTURE.md                   # This file
├── INTEGRATION_GUIDE.md
├── README.md
└── Subscription_API.postman_collection.json
```

## 🔐 Security Measures

1. **Authentication**
   - JWT token required for all endpoints
   - Token verification on every request

2. **Authorization**
   - User can only access own subscriptions
   - Admin-only endpoints protected
   - Role-based access control

3. **Payment Security**
   - Paystack handles card data (PCI compliant)
   - Server-side payment verification
   - Transaction idempotency

4. **Input Validation**
   - express-validator on all inputs
   - Type checking with TypeScript
   - Sanitization of user data

5. **Error Handling**
   - No sensitive data in error messages
   - Proper HTTP status codes
   - Centralized error handling

## 🚀 Performance Considerations

1. **Database Indexes**
   - userId indexed on subscriptions
   - paystackReference unique index
   - status indexed for filtering
   - Compound indexes for common queries

2. **Caching** (Future Enhancement)
   - Cache payment plans (rarely change)
   - Cache user's active subscription
   - Redis for session management

3. **Async Operations**
   - All database operations are async
   - Non-blocking I/O
   - Proper error handling

## 🔄 State Machine

### Subscription Status Flow
```
        ┌──────────┐
        │ PENDING  │ ◀── Created, awaiting first payment
        └────┬─────┘
             │
    First    │
   Payment   │
   Success   ▼
        ┌──────────┐
        │  ACTIVE  │ ◀── Has access, may have pending payments
        └────┬─────┘
             │
             ├──── Fully Paid ────▶ Remain ACTIVE
             │
             ├──── Expired ───────▶ EXPIRED
             │
             └──── Cancelled ─────▶ CANCELLED
```

### Transaction Status Flow
```
┌─────────┐
│ PENDING │ ◀── Transaction created
└────┬────┘
     │
     ├──── Payment Success ───▶ SUCCESS
     │
     └──── Payment Failed ────▶ FAILED
```

## 📊 API Response Format

All endpoints follow consistent format:

```typescript
{
  success: boolean,
  message: string,
  data?: any,
  errors?: string[]
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Operation failed",
  "errors": ["Detailed error message"]
}
```

## 🧪 Testing Strategy

1. **Unit Tests** (Future)
   - Service layer logic
   - Repository methods
   - Utility functions

2. **Integration Tests** (Future)
   - API endpoints
   - Database operations
   - Paystack mock integration

3. **Manual Testing**
   - Postman collection provided
   - Test cards from Paystack
   - Complete user flows

## 📈 Scalability

Current implementation supports:
- Thousands of concurrent users
- Multiple payment plans
- Flexible semester access control
- Easy to add new features

Future enhancements:
- Caching layer (Redis)
- Queue for payment processing
- Webhook handlers for automation
- Analytics and reporting
- Automated payment reminders

## 🔄 Deployment Considerations

1. **Environment Variables**
   - Use different keys for staging/production
   - Secure secret storage
   - Environment-specific callbacks

2. **Database**
   - Index optimization
   - Regular backups
   - Connection pooling

3. **Monitoring**
   - Transaction success rates
   - Payment failures
   - API response times
   - Error tracking

## 📚 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **axios** - HTTP client for Paystack
- **express-validator** - Input validation
- **jsonwebtoken** - JWT authentication

## 🎓 Design Patterns Used

1. **Repository Pattern** - Data access abstraction
2. **Service Layer** - Business logic separation
3. **Singleton** - Service instances
4. **Middleware Chain** - Request processing
5. **Factory** - Model creation

---

This architecture is designed to be:
- ✅ Scalable
- ✅ Maintainable
- ✅ Testable
- ✅ Secure
- ✅ Extensible

