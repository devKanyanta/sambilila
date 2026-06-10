# Admin Dashboard — Specification

## 1. Overview

Create an admin dashboard within the Lernopia application that allows a designated administrator to manage users, view their subscription data, and monitor platform-wide usage and revenue. The dashboard lives inside the existing dashboard layout at `/dashboard/admin` and is only accessible to users whose email matches the `ADMIN_EMAIL` environment variable.

---

## 2. Authentication & Authorization

### 2.1 Admin Identification

- **Method**: Single email address stored in the `ADMIN_EMAIL` environment variable.
- **Check**: Every admin API route verifies that the authenticated user's email matches `process.env.ADMIN_EMAIL`.
- **Client-side**: A helper function `isAdmin()` checks the user's profile email against the env var (fetched from a lightweight `/api/admin/check` endpoint).
- **Edge case**: If `ADMIN_EMAIL` is not set, no user can access admin pages or endpoints.

### 2.2 Admin Helper (lib/admin.ts)

Create a shared helper module:

```typescript
// lib/admin.ts

export function getAdminEmail(): string | null {
  return process.env.ADMIN_EMAIL || null
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = getAdminEmail()
  if (!adminEmail) return false
  return email.toLowerCase() === adminEmail.toLowerCase()
}
```

### 2.3 API Middleware

All admin API routes use a shared `requireAdmin` helper that:
1. Extracts the JWT token from the `Authorization` header
2. Verifies the token and gets the `userId`
3. Fetches the user's email from the database
4. Checks `isAdminEmail(user.email)`
5. Returns 401 or 403 if not authorized

---

## 3. Route Structure

| Route | Description |
|-------|-------------|
| `/dashboard/admin` | Main admin dashboard page (server component wrapper → client component) |
| `/api/admin/check` | GET — returns `{ isAdmin: boolean }` for the current user |
| `/api/admin/users` | GET — paginated, searchable list of users with subscription & usage data |
| `/api/admin/users/[id]` | GET/PATCH/DELETE — get, update, or delete a specific user |
| `/api/admin/users/[id]/subscription` | PATCH — change/cancel/activate a user's subscription |
| `/api/admin/stats` | GET — aggregate platform stats (total users, revenue, plan distribution, user growth over time) |

---

## 4. Database / Schema Changes

### 4.1 Add `SUSPENDED` status to User model (optional tracking field)

No schema changes required for the initial implementation. User suspension can be tracked by either:
- Adding a `suspended` boolean field to the `User` model in Prisma
- Or using a separate `UserStatus` enum

**Decision**: Add a `suspended` boolean field (default `false`) to the `User` model so admins can suspend/activate users.

### 4.2 Prisma Schema Update

```prisma
model User {
  // ... existing fields ...
  suspended Boolean @default(false)
  
  // ... existing relations ...
}
```

### 4.3 Auth Check on Login/Requests

When authenticating any request (login, API calls), check if the user is suspended and reject with a 403 "Account suspended" error.

---

## 5. API Endpoints

### 5.1 `GET /api/admin/check`

**Purpose**: Lightweight check so the client can decide whether to show admin UI.

**Response**:
```json
{
  "isAdmin": true
}
```

### 5.2 `GET /api/admin/users`

**Purpose**: Paginated, searchable list of all users.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string, optional) — searches name and email (case-insensitive)
- `sortBy` (string, default: `createdAt`) — `name`, `email`, `createdAt`, `userType`, `plan`
- `sortOrder` (`asc` | `desc`, default: `desc`)
- `plan` (string, optional) — filter by plan slug (`free`, `weekly`, `monthly`)
- `status` (string, optional) — filter by account status (`active`, `suspended`)
- `userType` (string, optional) — filter by `STUDENT` or `TEACHER`

**Response**:
```json
{
  "users": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "userType": "STUDENT",
      "suspended": false,
      "createdAt": "2025-01-15T...",
      "subscription": {
        "planName": "Weekly",
        "planSlug": "weekly",
        "status": "ACTIVE",
        "priceUSD": 0.99,
        "period": "week",
        "currentPeriodEnd": "2025-06-17T..."
      } | null,
      "usage": {
        "quizzesCreatedThisWeek": 5,
        "flashcardsCreated": 3,
        "studySessionsTotal": 12,
        "quizResultsTotal": 8
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "summary": {
    "totalUsers": 156,
    "activeSubscriptions": 42,
    "suspendedUsers": 3,
    "totalRevenue": 78.45
  }
}
```

### 5.3 `GET /api/admin/users/[id]`

**Purpose**: Get full detail for a single user.

**Response**: Same shape as a single user object above, plus:
- Full subscription history (all past subscriptions)
- Usage breakdown by month (last 6 months)
- Recent activity (last 10 items: quiz attempts, study sessions)

### 5.4 `PATCH /api/admin/users/[id]`

**Purpose**: Update a user's profile (admin-level).

**Body**:
```json
{
  "name": "Updated Name",
  "userType": "TEACHER",
  "suspended": true  // toggle suspension
}
```

**Response**: Updated user object.

### 5.5 `DELETE /api/admin/users/[id]`

**Purpose**: Delete a user account and all associated data (irreversible). Requires a confirmation query parameter.

**Query**: `?confirm=true`

**Response**: `{ "message": "User deleted successfully" }`

### 5.6 `PATCH /api/admin/users/[id]/subscription`

**Purpose**: Manage a user's subscription.

**Body** (one of):
```json
// Change plan
{ "action": "change-plan", "planSlug": "monthly" }

// Cancel subscription
{ "action": "cancel" }

// Activate/Reactivate
{ "action": "activate", "planSlug": "weekly", "provider": "LENCO", "providerId": "manual-001" }
```

**Response**: Updated subscription object or `{ "message": "Subscription cancelled" }`.

### 5.7 `GET /api/admin/stats`

**Purpose**: Aggregate platform statistics for charts and summary cards.

**Response**:
```json
{
  "summary": {
    "totalUsers": 156,
    "totalStudents": 120,
    "totalTeachers": 36,
    "activeSubscriptions": 42,
    "totalRevenueUSD": 78.45,
    "mrrUSD": 45.87,
    "suspendedUsers": 3,
    "usersJoinedThisMonth": 12
  },
  "planDistribution": {
    "free": 114,
    "weekly": 28,
    "monthly": 14
  },
  "userGrowth": [
    { "month": "2025-01", "count": 24 },
    { "month": "2025-02", "count": 35 },
    { "month": "2025-03", "count": 48 },
    { "month": "2025-04", "count": 67 },
    { "month": "2025-05", "count": 89 },
    { "month": "2025-06", "count": 156 }
  ],
  "revenueOverTime": [
    { "month": "2025-01", "revenue": 0 },
    { "month": "2025-02", "revenue": 2.97 },
    { "month": "2025-03", "revenue": 8.91 },
    { "month": "2025-04", "revenue": 15.84 },
    { "month": "2025-05", "revenue": 35.64 },
    { "month": "2025-06", "revenue": 78.45 }
  ],
  "topUsersByUsage": [
    { "userId": "...", "name": "Jane Smith", "totalQuizzes": 15, "totalFlashcards": 8 }
  ]
}
```

---

## 6. Frontend — Admin Dashboard Page

### 6.1 File Structure

```
app/dashboard/admin/
├── page.tsx                    # Main admin dashboard page
├── AdminDashboardContent.tsx   # Client component with all the logic
├── hooks/
│   └── useAdminDashboard.ts    # Hook for data fetching and actions
├── components/
│   ├── UsersTable.tsx          # Paginated, searchable users table
│   ├── UserRow.tsx             # Single user row in the table
│   ├── UserDetailModal.tsx     # Modal/slide-over for user detail view
│   ├── UserActions.tsx         # Action dropdown (suspend, delete, change plan)
│   ├── StatsCards.tsx          # Summary stat cards
│   ├── RevenueChart.tsx        # Revenue over time chart
│   ├── UserGrowthChart.tsx     # User growth over time chart
│   ├── PlanDistributionPie.tsx # Plan distribution pie/donut chart
│   └── UsageBreakdown.tsx      # Per-user usage details in modal
└── types/
    └── admin.ts                # TypeScript interfaces
```

### 6.2 Page Layout

```
┌──────────────────────────────────────────────────┐
│  Page Header: "Admin" (Shield icon)               │
│  Subtitle: "Manage users, subscriptions & usage"  │
├──────────────────────────────────────────────────┤
│  Stats Cards (4 across on desktop, 2 on mobile)   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │Users │ │Active│ │Revenue│ │ MRR  │            │
│  │ 156  │ │  42  │ │$78.45│ │$45.87│            │
│  └──────┘ └──────┘ └──────┘ └──────┘            │
├──────────────────────────────────────────────────┤
│  Charts Row (2 across)                            │
│  ┌──────────────────┐ ┌──────────────────┐       │
│  │ User Growth      │ │ Plan Distribution│       │
│  │ (line chart)     │ │ (donut chart)    │       │
│  └──────────────────┘ └──────────────────┘       │
├──────────────────────────────────────────────────┤
│  Revenue Chart (full width)                       │
│  ┌────────────────────────────────────────┐      │
│  │ Revenue Over Time (bar/line chart)     │      │
│  └────────────────────────────────────────┘      │
├──────────────────────────────────────────────────┤
│  Users Table                                      │
│  ┌──Search bar───────────────[Plan filter]──┐    │
│  │ Name │ Email │ Plan │ Usage│ Status│Actions│  │
│  │ ...  │ ...   │ ...  │ ...  │ ...   │ [... ]│  │
│  │ ...  │ ...   │ ...  │ ...  │ ...   │ [... ]│  │
│  └───────────────[Page 1 of 8]──────────────┘   │
└──────────────────────────────────────────────────┘
```

### 6.3 Users Table Columns

| Column | Data | Sortable |
|--------|------|----------|
| Name | User's name + avatar (if available) | Yes |
| Email | User's email | Yes |
| User Type | STUDENT / TEACHER badge | Yes |
| Plan | Subscription plan name or "Free" badge | Yes |
| Usage | Quiz + flashcard counts | Yes |
| Status | Active / Suspended badge | No |
| Joined | Date joined (relative + absolute on hover) | Yes |
| Actions | Dropdown with management options | No |

### 6.4 User Detail Modal (On click)

Slide-over or modal that shows:
- Full profile info (name, email, type, avatar, joined date)
- Current subscription details (plan, status, provider, period end)
- Usage breakdown (quizzes this week, all-time flashcards, study sessions, quiz attempts)
- Monthly usage chart for last 6 months
- Recent activity (last 10 items)
- Action panel (suspend/activate, change plan, delete user)

### 6.5 User Actions Dropdown

Per-row actions:
- **View Details** → opens user detail modal
- **Suspend / Activate** → toggles suspension status (with confirmation dialog)
- **Change Plan** → opens a small modal to select a new plan
- **Cancel Subscription** → cancels active subscription (with confirmation)
- **Delete User** → irreversible deletion (double confirmation: "Are you sure? This will permanently delete all of this user's data.")

### 6.6 Navigation

The "Admin" nav item:
- Is conditionally rendered in the sidebar nav items array — only if the current user is an admin
- Rendered below "Profile" in both desktop sidebar and mobile bottom nav
- Hidden from non-admin users entirely (never visible)
- Uses a Shield icon (`Shield` from lucide-react) to distinguish it

### 6.7 Visual Style

- Follows the existing dashboard design language exactly (same components: `Card`, `PageHeader`, `AnimatedSection`, `StatBlock`)
- Uses the same color palette, typography, and spacing
- Stats cards use the same `StatBlock` component pattern
- Tables use Framer Motion for row animations
- Consistent with the existing shimmer loading states

---

## 7. Dashboard Layout Changes

### 7.1 Sidebar Nav

In `app/dashboard/layout.tsx`:
- Add an `Admin` nav item that is conditionally included based on an `isAdmin` state
- The `isAdmin` check is performed by calling `GET /api/admin/check` on mount
- If `isAdmin` is false, the nav item is omitted from the `navItems` and `mobileNavItems` arrays

### 7.2 Route Guard

The `/dashboard/admin/page.tsx` should also guard itself:
- On mount, check if the user is admin (via `/api/admin/check`)
- If not admin, redirect to `/dashboard` and show a "Not authorized" message
- This prevents direct URL access by non-admin users

---

## 8. Implementation Order

1. **Schema changes**: Add `suspended` field to User model, run migration
2. **Admin lib**: Create `lib/admin.ts` with `getAdminEmail()` and `isAdminEmail()`
3. **API routes**:
   - `GET /api/admin/check`
   - `GET /api/admin/stats`
   - `GET /api/admin/users`
   - `GET /api/admin/users/[id]`
   - `PATCH /api/admin/users/[id]`
   - `DELETE /api/admin/users/[id]`
   - `PATCH /api/admin/users/[id]/subscription`
4. **Types**: Create `app/dashboard/admin/types/admin.ts`
5. **Hook**: Create `useAdminDashboard.ts`
6. **Components** (bottom-up):
   - `StatsCards.tsx`
   - `RevenueChart.tsx`
   - `UserGrowthChart.tsx`
   - `PlanDistributionPie.tsx`
   - `UserActions.tsx`
   - `UsageBreakdown.tsx`
   - `UserRow.tsx`
   - `UserDetailModal.tsx`
   - `UsersTable.tsx`
7. **Page**: Create `AdminDashboardContent.tsx` and `page.tsx`
8. **Layout**: Update `dashboard/layout.tsx` with conditional nav item

---

## 9. Edge Cases & Considerations

- **No admin configured**: If `ADMIN_EMAIL` is not set, `/api/admin/check` returns `false` for everyone and all admin API routes return 403.
- **Self-admin**: The admin user is a regular user who happens to have the matching email. They should not be able to suspend or delete themselves (admin actions should block operating on the admin user's own ID).
- **Concurrent modification**: API routes that modify users/subscriptions should handle race conditions with proper Prisma transactions.
- **Suspended user login**: When a suspended user tries to log in, the login API should return a 403 with a clear message. When a suspended user's token is used for any other API, it should also be rejected.
- **Data volume**: For large user bases, the stats API should use efficient aggregation queries (Prisma `groupBy` and raw SQL if needed).
- **Charts**: For all-time data, aggregate by month. If there are many months of data, consider limiting to the last 24 months for chart readability.

---

## 10. Dependencies

- **Charts**: Consider using `recharts` (already a common dependency for Next.js projects) or a lightweight chart library that integrates well with the existing Framer Motion animations
- **No additional payment/IAM dependencies needed** — admin identification is handled via env var

---

## 11. Security Notes

- All admin API routes MUST check admin status on every request (relying on client-side hiding the nav item is insufficient)
- The admin check should use the email from the database (not from the JWT payload) to prevent token tampering
- Deletion and suspension actions should log an audit trail (at minimum, console.log with timestamp, admin email, and action details)
- Consider rate-limiting admin endpoints to prevent brute-force enumeration of users
