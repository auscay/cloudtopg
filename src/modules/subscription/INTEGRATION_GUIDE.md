# Subscription Module - Integration Guide

## Quick Start

### 1. Set Up Environment Variables

Add to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/subscriptions/verify
```

### 2. Seed Payment Plans

Run the seed script to create the three payment plans in your database:

```bash
npm run seed:payment-plans
```

This will create:
- **Early Bird Plan**: ₦150,000 × 4 payments (per semester)
- **Mid Plan**: ₦300,000 × 2 payments (every 2 semesters)
- **Normal Plan**: ₦600,000 × 1 payment (full upfront)

### 3. Test the API

Start your server:
```bash
npm run dev
```

## Frontend Integration Examples

### React Example - Create Subscription

```tsx
import { useState } from 'react';

function SubscriptionPage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planType: 'early_bird' | 'mid' | 'normal') => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planType })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to Paystack payment page
        window.location.href = data.data.paymentUrl;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Choose Your Payment Plan</h1>
      
      <div className="plan-card">
        <h3>Early Bird Plan</h3>
        <p>₦150,000 per semester</p>
        <button onClick={() => handleSubscribe('early_bird')} disabled={loading}>
          Subscribe
        </button>
      </div>

      <div className="plan-card">
        <h3>Mid Plan</h3>
        <p>₦300,000 per 2 semesters</p>
        <button onClick={() => handleSubscribe('mid')} disabled={loading}>
          Subscribe
        </button>
      </div>

      <div className="plan-card">
        <h3>Normal Plan</h3>
        <p>₦600,000 upfront</p>
        <button onClick={() => handleSubscribe('normal')} disabled={loading}>
          Subscribe
        </button>
      </div>
    </div>
  );
}
```

### React Example - Payment Verification

```tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function PaymentVerification() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
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
          `/api/subscriptions/verify?reference=${reference}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Payment successful! Your subscription is now active.');
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
    <div>
      <h1>{status === 'success' ? '✅ Success' : '❌ Error'}</h1>
      <p>{message}</p>
      <a href="/dashboard">Go to Dashboard</a>
    </div>
  );
}
```

### React Example - Protected Content with Access Check

```tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedResource() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/subscriptions/check-access', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        setHasAccess(data.hasAccess);
      } catch (error) {
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <Navigate to="/subscribe" />;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>You have access to this content because you have an active subscription!</p>
    </div>
  );
}
```

## Backend Integration Examples

### Protect Entire Routes

```typescript
// Example: Protected course content routes
import { Router } from 'express';
import { authMiddleware } from '../modules/auth/middleware/auth';
import { subscriptionAccessMiddleware } from '../modules/subscription/middleware/subscriptionAccess';
import { CourseController } from '../controllers/CourseController';

const router = Router();
const courseController = new CourseController();

// All routes here require active subscription
router.use(authMiddleware.authenticate);
router.use(subscriptionAccessMiddleware.requireActiveSubscription);

router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourse);
router.get('/courses/:id/lessons', courseController.getLessons);

export default router;
```

### Protect Specific Semesters

```typescript
// Example: Semester-specific content
import { Router } from 'express';
import { authMiddleware } from '../modules/auth/middleware/auth';
import { subscriptionAccessMiddleware } from '../modules/subscription/middleware/subscriptionAccess';

const router = Router();

// Semester 1 - Requires payment for at least 1 semester
router.get('/semester-1/*',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireSemesterAccess(1),
  // ... your handlers
);

// Semester 2 - Requires payment for at least 2 semesters
router.get('/semester-2/*',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireSemesterAccess(2),
  // ... your handlers
);

// Semester 3 - Requires payment for at least 3 semesters
router.get('/semester-3/*',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireSemesterAccess(3),
  // ... your handlers
);

// Semester 4 - Requires payment for all 4 semesters
router.get('/semester-4/*',
  authMiddleware.authenticate,
  subscriptionAccessMiddleware.requireSemesterAccess(4),
  // ... your handlers
);

export default router;
```

### Manual Access Check in Controller

```typescript
import { Response } from 'express';
import { SubscriptionService } from '../modules/subscription/services/SubscriptionService';
import { AuthenticatedRequest, ApiResponse } from '../types';

export class ContentController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  public getContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      // Check access
      const accessInfo = await this.subscriptionService.checkUserAccess(userId);

      if (!accessInfo.hasAccess) {
        const response: ApiResponse = {
          success: false,
          message: accessInfo.message,
          data: {
            requiresSubscription: true,
            redirectUrl: '/subscribe'
          }
        };
        res.status(403).json(response);
        return;
      }

      // User has access, return content
      const response: ApiResponse = {
        success: true,
        message: 'Content retrieved successfully',
        data: {
          content: 'Your protected content here...',
          subscription: accessInfo.subscription
        }
      };

      res.status(200).json(response);
    } catch (error) {
      // Handle error
    }
  };
}
```

## Testing with Paystack

### Test Mode

Paystack provides test keys and test cards for development:

**Test Cards:**
- **Success**: 4084 0840 8408 4081 (CVV: 408, Expiry: any future date)
- **Insufficient Funds**: 5060 6666 6666 6666 4444 (CVV: 123)
- **Invalid Card**: 4084 0000 0000 0001 (CVV: 999)

### Webhook Integration (Optional)

For automatic payment verification, set up webhooks:

```typescript
// Example webhook handler
router.post('/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const hash = crypto
      .createHmac('sha512', config.paystack.secretKey)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;

      if (event.event === 'charge.success') {
        // Auto-verify payment
        await subscriptionService.verifyPayment(event.data.reference);
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  }
);
```

## Common Scenarios

### 1. User Wants to View Available Plans

```bash
GET /api/subscriptions/plans
```

### 2. User Subscribes (Early Bird)

```bash
POST /api/subscriptions
{
  "planType": "early_bird"
}
# Returns paymentUrl, redirect user there
```

### 3. Payment Completed, Verify

```bash
GET /api/subscriptions/verify?reference=SUB-xxx
# Updates subscription, grants access to semester 1
```

### 4. User Makes Next Payment (Semester 2)

```bash
POST /api/subscriptions/{subscriptionId}/pay
# Returns new paymentUrl
```

### 5. Check If User Can Access Content

```bash
GET /api/subscriptions/check-access
# Returns hasAccess: true/false
```

### 6. Admin Views Statistics

```bash
GET /api/subscriptions/stats/payments
# Returns revenue, subscription counts, etc.
```

## Error Handling

The module provides detailed error messages:

- `User already has an active subscription`
- `Payment plan not found`
- `Invalid payment amount`
- `Subscription is fully paid`
- `No active subscription found`
- `Access denied. Payment required for semester X`

Always check the `success` field in responses and handle errors appropriately.

## Support

For issues or questions:
1. Check the main README.md in this module
2. Review the API endpoint documentation
3. Test with Paystack test cards
4. Contact the development team

