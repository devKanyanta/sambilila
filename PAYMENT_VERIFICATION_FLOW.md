# Lenco Payment Verification Flow - Complete Implementation

## Overview

Fixed the critical issue where subscriptions were marked ACTIVE without verifying payment completion. The system now follows proper asynchronous payment verification flow.

## Problem

Previously:
- User clicks "Subscribe" → `POST /api/subscriptions/lenco/initiate`
- Backend immediately sets subscription status to `ACTIVE`
- Result: User got premium features without confirming payment (dangerous for production)

## Solution

Implemented three-stage verification process:

### Stage 1: Payment Initiation
**Endpoint:** `POST /api/subscriptions/lenco/initiate`

```json
Request Body:
{
  "planSlug": "weekly",
  "phone": "+260976543210",
  "operator": "MTN"
}

Response (200):
{
  "success": true,
  "reference": "TXN1704067200000_abc1234def",
  "transactionId": "lenco_12345",
  "status": "pending",
  "message": "Payment initiated successfully"
}
```

**Backend Action:**
1. Creates subscription record with status `PAST_DUE`
2. Stores `providerId = reference` from Lenco
3. Does NOT activate subscription yet
4. Returns payment reference to frontend

### Stage 2: Webhook Confirmation (Primary)
**Endpoint:** `POST /api/subscriptions/lenco/webhook` (called by Lenco)

Lenco calls this when payment completes. Expected payload:
```json
{
  "reference": "TXN1704067200000_abc1234def",
  "status": "completed",
  "transaction_id": "lenco_12345",
  "amount": 10,
  "currency": "ZMW"
}
```

**Backend Action:**
1. Finds subscription by `providerId`
2. Verifies with Lenco's API (extra security)
3. If status='completed':
   - Calculates billing period end:
     - Weekly: `now + 7 days`
     - Monthly: `now + 1 month`
   - Sets subscription status to `ACTIVE`
   - Stores `currentPeriodStart` and `currentPeriodEnd`
4. If status='failed' or 'cancelled':
   - Sets status to `EXPIRED`
5. Returns 200 to Lenco

### Stage 3: Manual Verification (Fallback)
**Endpoint:** `POST /api/subscriptions/lenco/verify`

Frontend can manually poll this endpoint if webhook is delayed.

```json
Request Body:
{
  "reference": "TXN1704067200000_abc1234def"
}

Response (200):
{
  "success": true,
  "paymentStatus": "completed",
  "subscriptionStatus": "activated",
  "message": "Payment verified and subscription activated"
}
```

**Backend Action:**
1. Finds subscription by `providerId`
2. Calls Lenco's verify endpoint: `GET /api/payment/verify/{reference}`
3. If status='completed' and subscription is `PAST_DUE`:
   - Activates subscription with billing period dates
   - Returns "activated" status
4. Otherwise returns current payment status

## Subscription Status Transitions

```
CREATE subscription
  ↓
STATUS = PAST_DUE (payment pending)
  ↓
[Lenco webhook received OR frontend verification succeeds]
  ↓
STATUS = ACTIVE (if payment status is "completed")
  ↓
[... active period ...]
  ↓
[Period ends OR user cancels]
  ↓
STATUS = EXPIRED
```

## Flow Diagrams

### Happy Path (Webhook)
```
Frontend                    Backend                     Lenco
   │                          │                          │
   ├──POST /initiate ────────>│                          │
   │                          ├──POST /payment/request ─>│
   │                          │<──{reference, status}────┤
   │<──{reference}────────────┤                          │
   │ (show pending)           │                          │
   │                          │<──POST /webhook ─────────┤
   │                          ├──GET /verify/:ref ──────>│
   │                          │<──{status: completed}────┤
   │                          │ update subscription ACTIVE
   │                          │                          │
   │<──GET /my ────────────────┤                          │
   │   {status: ACTIVE}        │                          │
   │ (show premium features)   │                          │
```

### Manual Verification Path
```
Frontend                    Backend                     Lenco
   │                          │                          │
   ├──POST /initiate ────────>│                          │
   │                          ├──POST /payment/request ─>│
   │                          │<──{reference, status}────┤
   │<──{reference}────────────┤                          │
   │                          │                          │
   │ [poll every 2-3s]        │                          │
   ├──POST /verify ──────────>│                          │
   │                          ├──GET /verify/:ref ──────>│
   │                          │<──{status: pending}──────┤
   │<──{paymentStatus: pending}                          │
   │                          │                          │
   │ [poll again]             │                          │
   ├──POST /verify ──────────>│                          │
   │                          ├──GET /verify/:ref ──────>│
   │                          │<──{status: completed}────┤
   │                          │ update subscription ACTIVE
   │<──{subscriptionStatus: activated}                   │
   │ (show premium features)  │                          │
```

## Files Modified

### `/app/api/subscriptions/lenco/initiate/route.ts`
- **Change:** Removed immediate subscription activation
- **Now:** Creates subscription with `PAST_DUE` status, stores `providerId`
- **Amount Conversion:** Fixed to `Math.round(plan.priceUSD * 10)` for USD→ZMW

### `/app/api/subscriptions/lenco/webhook/route.ts`
- **Change:** Replaced async queue with direct webhook processing
- **New Behavior:** Validates payment, activates subscription on completion
- **Security:** Calls `verifyPayment()` for double-verification

### `/app/api/subscriptions/lenco/verify/route.ts` (New)
- **Purpose:** Manual verification endpoint for frontend polling
- **Entry Point:** `POST /api/subscriptions/lenco/verify`
- **Payload:** `{ reference: "..." }`
- **Response:** Current payment status and whether subscription was activated

## Configuration

No additional environment variables needed. Uses existing:
- `LENCO_API_BASE`: Base URL of Lenco payment API
- `LENCO_API_KEY`: API key for authentication

Ensure these are set in `.env.local`:
```
LENCO_API_BASE=http://64.227.39.246:5555
LENCO_API_KEY=your_api_key_here
```

## Testing

### Test 1: Initiate Payment
```bash
curl -X POST http://localhost:3000/api/subscriptions/lenco/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "planSlug": "weekly",
    "phone": "+260976543210",
    "operator": "MTN"
  }'
```

Expected: Returns `reference` and subscription has status `PAST_DUE`

```sql
SELECT id, status, "providerId" FROM "Subscription" 
  WHERE id = <subscription_id>;
-- Should show: PAST_DUE, reference stored
```

### Test 2: Manual Verification
```bash
curl -X POST http://localhost:3000/api/subscriptions/lenco/verify \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TXN1704067200000_abc1234def"
  }'
```

Expected: Returns payment status. If `completed`, subscription becomes `ACTIVE`

### Test 3: Simulate Webhook
```bash
curl -X POST http://localhost:3000/api/subscriptions/lenco/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TXN1704067200000_abc1234def",
    "status": "completed",
    "transaction_id": "lenco_12345",
    "amount": 10,
    "currency": "ZMW"
  }'
```

Expected: Returns success. Subscription status changes to `ACTIVE`, `currentPeriodEnd` is set.

### Verification Query
```sql
SELECT id, status, "currentPeriodStart", "currentPeriodEnd", "providerId"
  FROM "Subscription"
  WHERE id = <subscription_id>;
```

Expected after webhook/verify:
- `status`: `ACTIVE`
- `currentPeriodStart`: Current time
- `currentPeriodEnd`: `now + 7 days` (weekly) or `now + 1 month` (monthly)
- `providerId`: Lenco reference

## Frontend Integration

### After Initiate Call
```typescript
const response = await fetch('/api/subscriptions/lenco/initiate', {
  method: 'POST',
  body: JSON.stringify({ planSlug, phone, operator })
})

const { reference, status } = await response.json()

if (status === 'pending') {
  showLoader('Processing payment...')
  // Start polling or wait for webhook
}
```

### Polling for Completion
```typescript
async function pollPaymentStatus(reference: string) {
  let attempts = 0
  const maxAttempts = 60 // 3 minutes at 3s intervals

  while (attempts < maxAttempts) {
    const response = await fetch('/api/subscriptions/lenco/verify', {
      method: 'POST',
      body: JSON.stringify({ reference })
    })

    const { paymentStatus, subscriptionStatus } = await response.json()

    if (subscriptionStatus === 'activated' || paymentStatus === 'completed') {
      showSuccess('Subscription activated!')
      redirectToDashboard()
      return
    }

    if (paymentStatus === 'failed') {
      showError('Payment failed')
      return
    }

    attempts++
    await sleep(3000) // Wait 3 seconds before next poll
  }

  showError('Payment verification timeout')
}
```

## Error Handling

### Possible Error Cases

1. **Subscription Not Found**
   - HTTP 404 from `/verify`
   - Cause: Reference doesn't match any subscription
   - Frontend action: Show error, restart flow

2. **Payment Failed**
   - Webhook status='failed' or '/verify' returns status='failed'
   - Subscription status: `EXPIRED`
   - Frontend action: Show retry option

3. **Verification Timeout**
   - No webhook after 5 minutes
   - Call `/verify` endpoint manually
   - Frontend action: Manual retry or support contact

## Security Considerations

1. **Double Verification:** Webhook calls `verifyPayment()` before activating
2. **Reference Matching:** Subscription matched by stored `providerId`
3. **Idempotent Webhook:** Safe to call multiple times (checks subscription status)
4. **Status Validation:** Only ACTIVE on status='completed'

## Debugging

Enable logging by checking server logs:

```bash
# Watch server logs
tail -f .next/server.log | grep -i lenco

# Check subscription status
psql sambilila_db -U mapalo -c "SELECT id, status, provider, \"providerId\" FROM \"Subscription\" LIMIT 5;"
```

Key log messages:
- `[Lenco Verify] Checking payment status for reference: ...`
- `[Lenco Webhook] Received payment notification: ...`
- `[Lenco Webhook] Subscription activated: ...`

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `/initiate/route.ts` | Removed immediate ACTIVE status | Subscription stays PENDING until verified |
| `/webhook/route.ts` | Direct processing instead of queue | Immediate activation on payment completion |
| `/verify/route.ts` | New endpoint | Frontend can manually verify payment status |
| `lib/lenco.ts` | No changes needed | Existing `verifyPayment()` called from webhook/verify |

**Result:** Secure payment-to-subscription lifecycle with proper verification at each stage.
