# Subscription & Access Control Implementation Spec

## 1. Overview

Implement subscription tiers, usage-based access control, and payment integration for the Lernopia learning platform. Three plans (Free, Weekly, Monthly) with feature limiting, payment via **PayPal Subscriptions (auto-renew)** and **Lenco mobile money (manual)**, and a Postgres-based queue for webhook processing.

---

## 2. Database Schema Changes

### 2.1 New Models

#### `BillingPlan` (config table — seeded on deploy)

```prisma
model BillingPlan {
  id        String   @id @default(cuid())
  name      String   @unique         // "Free", "Weekly", "Monthly"
  slug      String   @unique         // "free", "weekly", "monthly"
  priceUSD  Float                     // 0, 0.99, 3.99
  period    String                    // "month", "week", "month"
  features  Json                     // Full feature list for display
  limits    Json                     // Machine-readable limits object
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subscriptions Subscription[]

  @@map("billing_plans")
}
```

**Seeded `limits` JSON values:**
```json
// Free
{
  "maxQuizzesPerWeek": 3,
  "maxFlashcardsTotal": 50,
  "maxQuestionsPerQuiz": 10,
  "priorityProcessing": false,
  "progressTracking": false
}

// Weekly
{
  "maxQuizzesPerWeek": null,        // unlimited
  "maxFlashcardsTotal": 500,
  "maxQuestionsPerQuiz": 100,
  "priorityProcessing": false,
  "progressTracking": true
}

// Monthly
{
  "maxQuizzesPerWeek": null,
  "maxFlashcardsTotal": null,
  "maxQuestionsPerQuiz": 200,
  "priorityProcessing": true,
  "progressTracking": true
}
```

#### `Subscription`

```prisma
model Subscription {
  id            String    @id @default(cuid())
  userId        String
  planId        String
  status        SubscriptionStatus @default(ACTIVE)
  provider      PaymentProvider    // PAYPAL or LENCO
  providerId    String?            // PayPal subscription ID or Lenco txn reference
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  canceledAt    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan          BillingPlan @relation(fields: [planId], references: [id])

  @@index([userId])
  @@index([providerId])
  @@map("subscriptions")
}
```

#### `UsageRecord`

Tracks per-user resource usage on a rolling window basis.

```prisma
model UsageRecord {
  id         String   @id @default(cuid())
  userId     String
  resource   UsageResource   // QUIZ_CREATION, FLASHCARD_CREATION
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, resource, createdAt])
  @@map("usage_records")
}
```

#### `WebhookEvent`

Postgres-backed queue for processing payment webhooks.

```prisma
model WebhookEvent {
  id          String     @id @default(cuid())
  provider    PaymentProvider
  eventType   String
  payload     Json
  status      WebhookEventStatus @default(PENDING)
  attempts    Int        @default(0)
  maxAttempts Int        @default(5)
  lastError   String?
  processedAt DateTime?
  createdAt   DateTime   @default(now())

  @@index([status, createdAt])
  @@map("webhook_events")
}
```

### 2.2 Enums

```prisma
enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELED
  PAST_DUE
}

enum PaymentProvider {
  PAYPAL
  LENCO
}

enum UsageResource {
  QUIZ_CREATION
  FLASHCARD_CREATION
}

enum WebhookEventStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

### 2.3 User Model Changes

Add to existing `User` model:

```prisma
model User {
  // ... existing fields ...

  // New fields
  subscriptions Subscription[]
  usageRecords   UsageRecord[]
}
```

---

## 3. Plan Configuration (Constants)

Create `lib/plans.ts` as the source of truth for plan definitions.

```typescript
// lib/plans.ts

export interface PlanLimits {
  maxQuizzesPerWeek: number | null   // null = unlimited
  maxFlashcardsTotal: number | null
  maxQuestionsPerQuiz: number | null
  priorityProcessing: boolean
  progressTracking: boolean
}

export interface PlanDefinition {
  name: string
  slug: string
  priceUSD: number
  period: 'week' | 'month'
  description: string
  features: string[]
  limits: PlanLimits
  highlighted: boolean
  paypalPlanId?: string  // PayPal plan ID for subscriptions
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    name: 'Free',
    slug: 'free',
    priceUSD: 0,
    period: 'month',
    description: 'Best for students trying out the app',
    features: [
      'Create up to 3 quizzes per week',
      'Create up to 50 flashcards total',
      'Max 10 questions per quiz',
    ],
    limits: {
      maxQuizzesPerWeek: 3,
      maxFlashcardsTotal: 50,
      maxQuestionsPerQuiz: 10,
      priorityProcessing: false,
      progressTracking: false,
    },
    highlighted: false,
  },
  weekly: {
    name: 'Weekly',
    slug: 'weekly',
    priceUSD: 0.99,
    period: 'week',
    description: 'Best for short term studying during exams',
    features: [
      'Create unlimited quizzes',
      'Create up to 500 flashcards total',
      'Max 50 questions per quiz',
      'Access full quiz history',
    ],
    limits: {
      maxQuizzesPerWeek: null,
      maxFlashcardsTotal: 500,
      maxQuestionsPerQuiz: 100,
      priorityProcessing: false,
      progressTracking: true,
    },
    highlighted: true,
    paypalPlanId: process.env.PAYPAL_WEEKLY_PLAN_ID,
  },
  monthly: {
    name: 'Monthly',
    slug: 'monthly',
    priceUSD: 3.99,
    period: 'month',
    description: 'Best for committed students & exam preparation',
    features: [
      'Create unlimited quizzes',
      'Create unlimited flashcards',
      'Progress tracking',
      'Performance stats',
      'Priority processing',
    ],
    limits: {
      maxQuizzesPerWeek: null,
      maxFlashcardsTotal: null,
      maxQuestionsPerQuiz: 200,
      priorityProcessing: true,
      progressTracking: true,
    },
    highlighted: false,
    paypalPlanId: process.env.PAYPAL_MONTHLY_PLAN_ID,
  },
}
```

---

## 4. Usage Enforcement Logic

### 4.1 Helper: `lib/limits.ts`

```typescript
// lib/limits.ts — check and record usage

export async function checkUsageLimit(
  userId: string,
  resource: 'quiz' | 'flashcard'
): Promise<{ allowed: boolean; limit?: number; used?: number; plan: string }> {
  // 1. Get user's active subscription (if any)
  //    - If no active subscription → use Free plan
  //    - If active subscription → use that plan's limits
  
  // 2. If limits.maxQuizzesPerWeek or maxFlashcardsTotal is null → allowed: true

  // 3. For QUIZ_CREATION (weekly rolling):
  //    - Count UsageRecord rows for this user + resource 
  //      where createdAt > now - 7 days
  //    - Compare against plan.limits.maxQuizzesPerWeek

  // 4. For FLASHCARD_CREATION (total):
  //    - Count UsageRecord rows for this user + resource (all time)
  //    - Compare against plan.limits.maxFlashcardsTotal

  // 5. Return { allowed, limit, used, plan }
}

export async function recordUsage(
  userId: string,
  resource: UsageResource
): Promise<void> {
  // Insert a UsageRecord for this action
}

export async function getCurrentLimits(userId: string): Promise<PlanLimits> {
  // Return the effective limits for the user based on their active subscription
}
```

### 4.2 Enforcement Points

The enforcement is done at the **API route level** before creating quiz/flashcard generation jobs:

1. **`POST /api/quizzes/upload`** — Before creating a QuizJob:
   - Call `checkUsageLimit(userId, 'quiz')`
   - If not allowed → return 403 with `{ error: 'limit_reached', message: '...', limit, used, plan }`
   - If allowed → call `recordUsage(userId, 'quiz')` **after** successful job creation

2. **`POST /api/flashcards/upload`** — Before creating a FlashcardJob:
   - Call `checkUsageLimit(userId, 'flashcard')`
   - If not allowed → return 403
   - If allowed → call `recordUsage(userId, 'flashcard')` after success

3. **`POST /api/quizzes`** (text input) — Same check as upload route.

4. **`POST /api/flashcards`** (text input) — Same check.

### 4.3 Updating Pricing.tsx

Keep the existing plan definitions but link the "Get Started"/"Start with weekly" buttons to the subscription flow page instead of `/auth/register`. Also show a dynamic "Current Plan" indicator for logged-in users.

---

## 5. Subscription API Routes

### 5.1 `GET /api/subscriptions/plans`
Returns the plan definitions (from `lib/plans.ts`) with PayPal plan IDs.

### 5.2 `GET /api/subscriptions/my`
Returns the current user's active subscription (if any) + usage stats.

**Response:**
```json
{
  "subscription": null | {
    "id": "...",
    "plan": "free" | "weekly" | "monthly",
    "status": "ACTIVE",
    "provider": "PAYPAL",
    "currentPeriodEnd": "2026-07-05T00:00:00Z",
    "canceledAt": null
  },
  "usage": {
    "quizzesCreatedThisWeek": 2,
    "flashcardsCreated": 15,
    "limits": {
      "maxQuizzesPerWeek": 3,
      "maxFlashcardsTotal": 50
    }
  }
}
```

### 5.3 `POST /api/subscriptions/paypal/create`
Creates a PayPal subscription. Steps:
1. Get user's auth token
2. Validate plan slug
3. Call PayPal Subscriptions API to create a subscription
4. Return the PayPal approval URL to the frontend
5. Create a Subscription record with status PENDING

**Request:**
```json
{ "planSlug": "weekly" }
```

**Response:**
```json
{ "approvalUrl": "https://www.paypal.com/...", "subscriptionId": "..." }
```

### 5.4 `POST /api/subscriptions/paypal/webhook`
Handles PayPal IPN webhooks. Steps:
1. Verify webhook signature
2. Insert a WebhookEvent record (status: PENDING)
3. A worker (polled or triggered) processes the event:
   - `BILLING.SUBSCRIPTION.ACTIVATED` → activate subscription
   - `BILLING.SUBSCRIPTION.CANCELLED` → cancel subscription
   - `BILLING.SUBSCRIPTION.EXPIRED` → mark as expired
   - `PAYMENT.SALE.COMPLETED` → extend period end

### 5.5 `POST /api/subscriptions/lenco/initiate`
Initiates a Lenco mobile money payment. Steps:
1. Get user + plan info
2. Create a Subscription record (status: PENDING)
3. Call Lenco API to request payment
4. Return transaction details (user completes on their phone)

### 5.6 `POST /api/subscriptions/lenco/webhook`
Handles Lenco payment status updates. Same pattern: insert WebhookEvent → process via queue.

### 5.7 `POST /api/subscriptions/cancel`
Cancel active subscription. Steps:
1. For PayPal: call PayPal Subscriptions API to cancel
2. Update subscription status to CANCELED
3. Note: user keeps access until `currentPeriodEnd` (immediate downgrade per our decision)

### 5.8 `POST /api/subscriptions/webhook/process` (Internal)
Processes pending webhook events from the Postgres queue. To be called by a cron job (e.g., every minute via Vercel Cron Jobs or a simple `setInterval` worker).

---

## 6. Frontend Changes

### 6.1 Dashboard Usage Bar

In `app/dashboard/layout.tsx`, add a subscription/usage bar below the navbar.

**Behavior:**
- Shows current plan name (Free / Weekly / Monthly)
- Shows usage meter for the most restrictive limit
- If Free: "2 of 3 quizzes used this week"
- If near limit (≥80%): show orange color
- If at limit: show red and "Upgrade" CTA
- Clicking anywhere on the bar opens the upgrade/subscription modal
- "Upgrade" button in the existing navbar → same upgrade flow

**Mobile:** Collapsed to just show plan badge + progress dots.

### 6.2 Upgrade Modal / Page

Create `app/dashboard/subscription/page.tsx` or a modal component (`app/dashboard/components/UpgradeModal.tsx`).

**Content:**
- Current plan card (highlighted)
- Other plan cards (with upgrade CTA)
- For Free users: Weekly and Monthly cards with "Upgrade" buttons
- For paid users: current plan details + "Cancel" option
- Payment method section:
  - PayPal button (redirects to PayPal approval page)
  - Lenco mobile money form (phone number, operator selection)

### 6.3 Upgrade Flow States

1. **User clicks "Upgrade"** → Opens upgrade modal / navigates to subscription page
2. **User selects plan** → Payment method selection (PayPal or Lenco)
3. **PayPal:** Redirects to PayPal for approval → returns to success page
4. **Lenco:** Shows phone number form → initiates payment → user confirms on phone → pool for confirmation
5. **Success:** Shows confirmation + updated plan badge in dashboard

### 6.4 Limit Reached UI

When a user hits a limit (403 from API):
- In the quiz creation form: Show an inline banner saying "You've hit your weekly limit. Upgrade to create more quizzes."
- In the flashcards page: Show a similar banner
- The banner should include an "Upgrade Now" button that opens the upgrade modal
- The API returns a structured error with `error: 'limit_reached'` so the frontend can detect it

### 6.5 Profile / Settings Page

Add a subscription section to the profile page:
- Current plan
- Usage stats
- Payment history
- Cancel subscription button

---

## 7. PayPal Subscriptions Integration

### 7.1 Environment Variables

```env
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox # sandbox or live
PAYPAL_WEEKLY_PLAN_ID=
PAYPAL_MONTHLY_PLAN_ID=
PAYPAL_WEBHOOK_ID=
```

### 7.2 `lib/paypal.ts`

```typescript
export async function getAccessToken(): Promise<string>
export async function createSubscription(planId: string, userId: string): Promise<{ approvalUrl: string; subscriptionId: string }>
export async function cancelSubscription(subscriptionId: string): Promise<void>
export async function getSubscriptionDetails(subscriptionId: string): Promise<any>
export async function verifyWebhookSignature(headers: Headers, body: string): Promise<boolean>
```

### 7.3 PayPal Product & Plan Setup (Manual)

The PayPal product and billing plans should be created manually in the PayPal Developer Dashboard:

- **Product:** "Lernopia Subscription"
- **Weekly Plan:** $0.99/week, Plan ID → `PAYPAL_WEEKLY_PLAN_ID`
- **Monthly Plan:** $3.99/month, Plan ID → `PAYPAL_MONTHLY_PLAN_ID`

---

## 8. Lenco Mobile Money Integration

Reference `PAYMENT_PROCESS.md` for the Lenco API. We'll create `lib/lenco.ts`.

### 8.1 `lib/lenco.ts`

```typescript
export async function initiatePayment(amount: number, phone: string, operator: string, country: string): Promise<{ reference: string; transactionId: string }>
export async function verifyPayment(reference: string): Promise<{ status: 'pending' | 'completed' | 'failed' | 'cancelled' }>
```

### 8.2 Flow
1. User enters phone number + selects operator
2. Backend calls Lenco to initiate payment
3. User receives mobile money prompt on phone
4. User confirms payment
5. Webhook/callback from Lenco updates subscription status
6. Frontend polls for success (or shows success on webhook)

---

## 9. Webhook Queue (Postgres-based)

### 9.1 Worker

Create `lib/webhookWorker.ts`:

```typescript
export async function processWebhookQueue(): Promise<void> {
  // 1. Fetch next PENDING WebhookEvent (ordered by createdAt ASC)
  // 2. Mark as PROCESSING
  // 3. Process based on provider + eventType
  // 4. Mark as COMPLETED or increment attempts / mark FAILED
  // 5. If attempts >= maxAttempts, mark as FAILED
}
```

### 9.2 Trigger

- **Vercel Cron:** Use `vercel.json` to run every minute
- **Or a simple server-side interval** in development
- **Or manual trigger** via the admin endpoint

---

## 10. Database Seed Script

Create `prisma/seed.ts` to seed `BillingPlan` records:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { PLANS } from '../lib/plans'

const prisma = new PrismaClient()

async function main() {
  for (const [slug, plan] of Object.entries(PLANS)) {
    await prisma.billingPlan.upsert({
      where: { slug },
      update: {
        name: plan.name,
        priceUSD: plan.priceUSD,
        period: plan.period,
        features: plan.features,
        limits: plan.limits,
      },
      create: {
        name: plan.name,
        slug,
        priceUSD: plan.priceUSD,
        period: plan.period,
        features: plan.features,
        limits: plan.limits,
      },
    })
  }
  console.log('Seeded billing plans')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

---

## 11. Implementation Order

1. **Database migrations** — Add new models and enums
2. **Seed script** — Create BillingPlan records
3. **`lib/plans.ts`** — Plan configuration
4. **`lib/limits.ts`** — Usage checking and recording
5. **API routes for subscriptions** — Plans list, my subscription, cancel
6. **Usage enforcement** — Add checks to existing quiz/flashcard creation routes
7. **PayPal integration** — `lib/paypal.ts`, create subscription route, webhook
8. **Lenco integration** — `lib/lenco.ts`, initiate payment route, webhook
9. **Webhook queue** — `lib/webhookWorker.ts`, webhook event processing
10. **Dashboard usage bar** — Add subscription info to layout
11. **Upgrade modal/page** — Full upgrade UI
12. **Pricing page update** — Link to upgrade flow for logged-in users
13. **Profile subscription section** — Show plan + usage
14. **Error states** — Handle limit reached, payment failures, etc.

---

## 12. Edge Cases & Decisions

| Scenario | Behavior |
|----------|----------|
| User hits quiz limit mid-creation | Show inline error with "Upgrade" CTA, don't lose their input |
| User hits flashcard limit | Show error + CTA, keep their form data |
| Payment fails (insufficient funds) | Subscription stays PENDING; retry option shown |
| Webhook processing fails | Retry up to 5 times; then mark FAILED and notify admin |
| PayPal webhook delay | Subscription becomes ACTIVE only after webhook confirms |
| User cancels PayPal subscription | `BILLING.SUBSCRIPTION.CANCELLED` → set status to CANCELED + immediate downgrade |
| User deletes account | Cascade deletes subscription and usage records |
| Phone number format validation | Use Lenco's expected format per country |
| User on Weekly wants to upgrade to Monthly | Cancel Weekly subscription, create Monthly subscription |
| Downgrade from Monthly to Weekly | Cancel Monthly, user can subscribe to Weekly next billing period |
| Usage counter overflow edge case | `null` limits = unlimited; Postgres handles counting |

---

## 13. Frontend API Hooks

### `useSubscription()` hook

```typescript
// app/hooks/useSubscription.ts
export function useSubscription() {
  return {
    subscription: Subscription | null,
    usage: { quizzesCreatedThisWeek: number, flashcardsCreated: number },
    limits: PlanLimits,
    isLoading: boolean,
    refresh: () => Promise<void>,
    upgrade: (planSlug: string, provider: 'PAYPAL' | 'LENCO') => Promise<void>,
    cancel: () => Promise<void>,
  }
}
```

---

## 14. Key Files to Create/Modify

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add new models, enums, user field |
| `prisma/seed.ts` | New seed file |
| `lib/plans.ts` | New — plan config |
| `lib/limits.ts` | New — usage enforcement |
| `lib/paypal.ts` | New — PayPal API |
| `lib/lenco.ts` | New — Lenco API |
| `lib/webhookWorker.ts` | New — queue processor |
| `app/hooks/useSubscription.ts` | New — subscription hook |
| `app/api/subscriptions/plans/route.ts` | New |
| `app/api/subscriptions/my/route.ts` | New |
| `app/api/subscriptions/paypal/create/route.ts` | New |
| `app/api/subscriptions/paypal/webhook/route.ts` | New |
| `app/api/subscriptions/lenco/initiate/route.ts` | New |
| `app/api/subscriptions/lenco/webhook/route.ts` | New |
| `app/api/subscriptions/cancel/route.ts` | New |
| `app/api/subscriptions/webhook/process/route.ts` | New |
| `app/api/quizzes/upload/route.ts` | Add usage check |
| `app/api/flashcards/upload/route.ts` | Add usage check |
| `app/api/quizzes/route.ts` | Add usage check (text input) |
| `app/api/flashcards/route.ts` | Add usage check (text input) |
| `app/dashboard/layout.tsx` | Add usage bar |
| `app/dashboard/components/SubscriptionBar.tsx` | New — usage bar |
| `app/dashboard/components/UpgradeModal.tsx` | New — upgrade UI |
| `app/dashboard/subscription/page.tsx` | New — subscription page |
| `app/dashboard/profile/page.tsx` | Add subscription section |
| `app/landing/Pricing.tsx` | Link to upgrade flow |
| `app/dashboard/page.tsx` | Show usage info |
