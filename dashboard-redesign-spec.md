# Dashboard Redesign Specification

> **Status:** Draft (based on 6 rounds of user interview)  
> **Date:** May 28, 2026  
> **Author:** Buffy AI

---

## 1. Executive Summary

A full visual and UX redesign of the Lernopia student dashboard (`app/dashboard/*`). The goal is to transform the current dashboard from inconsistent and cluttered to **minimal, airy, and cohesive** — prioritizing study progress and activity while improving mobile experience and establishing a consistent visual language across all pages.

---

## 2. Design Principles

| # | Principle | How It Manifests |
|---|-----------|-----------------|
| 1 | **Minimal & airy** | Generous whitespace, restrained use of color, clean typography, subtle shadows, no visual noise |
| 2 | **Stats-first hierarchy** | Study streaks, learning time, and flashcard/quiz counts are the hero content on the home page |
| 3 | **Consistent card language** | White cards on light grey (`#ececec`) background — same border-radius, same shadow, same padding roles |
| 4 | **Mobile-first responsive** | Layouts adapt fluidly; swipeable cards, pull-to-refresh, bottom sheets for mobile interactions |
| 5 | **Expressive motion** | Bouncy spring animations, staggered reveals, playful micro-interactions throughout |
| 6 | **Color balance preserved** | Keep current brand color ratio (forest green primary, coral/red CTAs, warm grey backgrounds) |

---

## 3. Information Architecture (Unchanged)

Same 4-page structure, restyled:

| Page | Route | Purpose |
|------|-------|---------|
| **Home** | `/dashboard` | Stats, streak, activity, quick actions |
| **Flashcards** | `/dashboard/flashcards` | View sets, create/view flashcards |
| **Quiz Generator** | `/dashboard/quiz` | Create and take quizzes |
| **Profile** | `/dashboard/profile` | Activity timeline, stats, settings |

---

## 4. Navigation (Keep Current Structure, Restyled)

### Desktop
- **Top navbar:** Brand logo (left) + Home link + Upgrade CTA (right) — restyled for cleaner look
- **Sidebar:** Left sidebar with 4 nav items (Dashboard, Flashcards, Quiz Generator, Profile) + study tip card at bottom — refined styling, more breathing room

### Mobile
- **Bottom tab bar:** 4 tabs (Home, Cards, Quiz, Me) — restyled with active indicator
- **Burger menu:** That triggers the sidebar overlay

### New Mobile Patterns to Add
- Swipeable cards for navigating between sections
- Pull-to-refresh on data views
- Bottom sheets for forms and modals instead of full-screen overlays

---

## 5. Home Page Layout (Revised)

The home page is reorganized into this vertical flow:

```
┌─────────────────────────────────────────┐
│  Greeting + Streak Hero                  │  ← "Welcome back, [Name]! 🔥"
│  [Streak card with progress bar]         │
├─────────────────────────────────────────┤
│  Stat Blocks (2×2 grid)                  │  ← Clean stat blocks with icon + number + label
│  ┌─────────┐ ┌─────────┐               │
│  │ ⚡ Streak │ │ 📚 Sets  │               │
│  │  7 days  │ │   12    │               │
│  └─────────┘ └─────────┘               │
│  ┌─────────┐ ┌─────────┐               │
│  │ ⏱ Time   │ │ 📝 Quiz  │               │
│  │ 5.2 hrs  │ │   8     │               │
│  └─────────┘ └─────────┘               │
├─────────────────────────────────────────┤
│  Activity Timeline                       │  ← Chronological feed of recent study activity
│  - Studied "Biology 101" (2h ago)       │
│  - Completed "History Quiz" (yesterday)  │
│  - Created "French Vocab" set (2d ago)   │
├─────────────────────────────────────────┤
│  Quick Actions                           │  ← Two cards: "New Flashcards" + "Generate Quiz"
│  ┌──────────────┐ ┌──────────────┐     │
│  │  New Cards   │ │  New Quiz    │     │
│  └──────────────┘ └──────────────┘     │
└─────────────────────────────────────────┘
```

---

## 6. Component Design System

### 6.1 Card System

| Card Role | Padding | Shadow | Border | Radius |
|-----------|---------|--------|--------|--------|
| Main content cards | `p-5` | `shadow-md` | None | `rounded-xl` |
| Stat blocks | `p-4` | `shadow-sm` | None | `rounded-lg` |
| Quick action cards | `p-5` | `shadow-md` | None | `rounded-xl` |
| Modals/bottom sheets | `p-6` | `shadow-2xl` | None | `rounded-2xl` |
| Activity feed items | `p-3` | None | Bottom border | `rounded-lg` |

### 6.2 Typography (Keep Current Pairing)

| Role | Size | Weight | Font |
|------|------|--------|------|
| Page title (h1) | `text-2xl md:text-3xl` | `font-semibold` | Fredoka |
| Section heading (h2) | `text-lg` | `font-semibold` | Fredoka |
| Card subtitle (h3) | `text-sm` | `font-medium` | Fredoka |
| Stat value | `text-2xl` | `font-semibold` | Fredoka |
| Stat label | `text-xs` | `font-medium` | Inter |
| Body text | `text-sm` | `font-normal` | Inter |
| Small/meta text | `text-xs` | `font-normal` | Inter |

### 6.3 Color Usage

| Color | Role | Hex |
|-------|------|-----|
| Primary green | Brand elements, icons, active states | `#2d6b4d` |
| Secondary red | CTAs, important actions, badges | `#ff5252` |
| Neutral-50 | Page background | `#f5f5f5` |
| Neutral-100 | Section backgrounds, card bg | `#ffffff` + shadow |
| Neutral-400 | Secondary text, placeholder | `#a8a8a8` |
| Neutral-800 | Primary text, headings | `#2c2c2c` |

### 6.4 Spacing Scale

| Context | Value |
|---------|-------|
| Section spacing (vertical) | `space-y-8` or `gap-8` |
| Grid gaps | `gap-4` / `gap-6` for two-column |
| Card internal padding | `p-5` (standard), `p-4` (compact) |
| Page padding (horizontal) | `px-4 sm:px-6 lg:px-8` |
| List item padding | `p-3` |

### 6.5 Animation & Motion

- **Page transitions:** Fade + slight slide-up on route change
- **Staggered reveals:** Cards/elements animate in sequentially with `staggerChildren: 0.08`
- **Hover states:** Cards lift 2px on hover with smooth shadow transition
- **Button interactions:** Scale bounce on tap (`scale: 0.97` → spring back)
- **Progress bars:** Animate width on viewport entry
- **Swipeable:** Touch swipe gestures for mobile card navigation
- **Pull-to-refresh:** Mobile pull-down gesture to reload data

---

## 7. Page-by-Page Specifications

### 7.1 Flashcards Page

#### Desktop Layout
```
┌─────────────────────────────────────────┐
│  Flashcards (page title)                 │
├─────────────────────────────────────────┤
│  Stat row: Total Sets | Active Jobs     │  ← Clean stat blocks
├─────────────────────────────────────────┤
│  Create Form (bottom sheet / modal)     │  ← Multi-step: 1. Title → 2. Upload → 3. Generate
├─────────────────────────────────────────┤
│  Your Sets (grid of cards)              │
│  ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ Set 1  │ │ Set 2  │ │ Set 3  │     │
│  └────────┘ └────────┘ └────────┘     │
├─────────────────────────────────────────┤
│  Flashcard Viewer (modal)               │  ← Flip card animation (front/back)
└─────────────────────────────────────────┘
```

#### Mobile Adaptations
- Sets grid → single-column list
- Create form → bottom sheet (slides up from bottom)
- Flashcard viewer → swipe left/right between cards
- Pull-to-refresh to reload sets
- Bottom sheet for job status modal

#### Key Changes
- Create form becomes a **multi-step wizard** (Step 1: Name it → Step 2: Upload PDF or paste text → Step 3: Generate)
- Flashcards use a 3D flip animation for front/back
- Sets display in a responsive grid (2 columns mobile, 3-4 desktop)
- Job status uses a bottom sheet on mobile

### 7.2 Quiz Page

#### Desktop Layout
```
┌─────────────────────────────────────────┐
│  Quiz Generator (page title)             │
├─────────────────────────────────────────┤
│  Stat row: Total Quizzes | New          │
├─────────────────────────────────────────┤
│  Create Quiz (multi-step wizard)        │
│  Step 1: Upload content (text/PDF)      │
│  Step 2: Settings (difficulty, type, #) │
│  Step 3: Generate → view results        │
├─────────────────────────────────────────┤
│  Recent Quizzes (list)                  │
│  - Quiz 1 (score, date)                 │
│  - Quiz 2 (score, date)                 │
└─────────────────────────────────────────┘
```

#### Mobile Adaptations
- Multi-step wizard becomes vertical stepper (no horizontal sliding)
- Quiz view → full-screen with large touch targets
- Results → scrollable with expandable question review
- Bottom sheet for job status

#### Key Changes
- **Create and Take tabs merged** into a single multi-step wizard flow
- Step 1: Upload content (paste text or PDF)
- Step 2: Configure (difficulty, question types, count)
- Step 3: Generate → auto-navigate to quiz view
- Quiz view: one question at a time with progress indicator
- Results: scrollable summary with expandable answer review

### 7.3 Profile Page

#### Layout
```
┌─────────────────────────────────────────┐
│  Profile (page title)                    │
├─────────────────────────────────────────┤
│  Profile Header                          │
│  ┌──────────┐  Name + Email             │
│  │  Avatar  │  Member since             │
│  └──────────┘  Edit button              │
├─────────────────────────────────────────┤
│  Stats Row                              │
│  Total Sets | Quizzes | Streak | Time   │
├─────────────────────────────────────────┤
│  Activity Timeline (main content)       │  ← Primary focus per user
│  - Activity item 1                      │
│  - Activity item 2                      │
│  - Activity item 3                      │
├─────────────────────────────────────────┤
│  Account Settings (collapsible)         │
│  Password, theme, delete account        │
└─────────────────────────────────────────┘
```

#### Key Changes
- Activity timeline becomes the **primary content** (per user preference)
- Stats are clean stat blocks (icon + number + label)
- Settings section is collapsible/accordion
- Avatar upload with preview

---

## 8. Mobile-Specific Features

### 8.1 Swipeable Cards
- On flashcards page: swipe left/right between flashcard sets
- On quiz results: swipe between question reviews
- On activity feed: swipe to dismiss/take action

### 8.2 Pull-to-Refresh
- All data views (flashcards, quizzes, activity) support pull-to-refresh
- Custom animated pull indicator (matching brand colors)

### 8.3 Bottom Sheets
- Create flashcard form → bottom sheet
- Create quiz form → bottom sheet
- Job status modal → bottom sheet
- Flashcard viewer → bottom sheet or full-screen with drag-to-dismiss

### 8.4 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 640px | Single column, bottom nav visible, bottom sheets for modals |
| 640-1024px | 2-column grid where possible, sidebar collapses to icons |
| 1024px+ | Sidebar visible, 3-4 column grids, full layout |

---

## 9. Design Tokens to Standardize

These should be defined once and used consistently:

| Token | Current | Target |
|-------|---------|--------|
| Card border | `border border-neutral-200` (mixed usage) | **No border**, use `shadow-md` |
| Main card padding | Mixed `p-4` / `p-5` / `p-6` | **Standardized**: p-5 for main, p-4 for compact |
| Page title size | Inconsistent across pages | **Unified**: `text-2xl md:text-3xl font-heading font-semibold` |
| Section title size | `text-base` mixed | **Unified**: `text-lg font-heading font-semibold` |
| Stat value style | Varies by page | **Unified**: `text-2xl font-heading font-semibold` |
| Stat label style | Varies by page | **Unified**: `text-xs font-medium text-neutral-500` |
| Section spacing | `space-y-6` | **Increased**: `space-y-8` or `gap-8` |
| Grid gap | `gap-3` mixed | **Standardized**: `gap-4` |
| Button radius | Mixed | **Unified**: `rounded-xl` for primary, `rounded-lg` for small |

---

## 10. Component Checklist (All Dashboard Pages)

### Shared Components to Update
- [ ] **StatBlock** — reusable stat component: icon + number + label + optional trend
- [ ] **Card** — base card component: white bg + shadow-md + rounded-xl + padding variant
- [ ] **PageHeader** — consistent page title + optional subtitle/action
- [ ] **ActivityFeed** — shared timeline/list component
- [ ] **BottomSheet** — mobile-friendly slide-up panel (replaces modals on mobile)
- [ ] **PullToRefresh** — mobile pull-to-refresh wrapper
- [ ] **SwipeableContainer** — horizontal swipeable card container for mobile

### Pages
- [ ] **Dashboard Home** — reorganized layout (stats → activity → quick actions)
- [ ] **Flashcards** — multi-step create wizard, responsive grid, flip animation viewer
- [ ] **Quiz** — multi-step create wizard, one-at-a-time quiz view, expandable results
- [ ] **Profile** — activity timeline focus, collapsible settings, clean stat blocks
- [ ] **Layout** — refined sidebar + top navbar + bottom nav + mobile gestures

---

## 11. Implementation Order

| Phase | Scope | Estimated Effort |
|-------|-------|-----------------|
| **1. Foundation** | Create shared components (Card, StatBlock, PageHeader, BottomSheet, etc.) + update globals.css tokens | Medium |
| **2. Dashboard Home** | Restructure layout, stat blocks, activity feed, quick actions, streak card | Medium |
| **3. Flashcards** | Multi-step wizard, responsive grid, flip viewer, job status bottom sheet | Large |
| **4. Quiz** | Multi-step wizard, one-at-a-time view, expandable results | Large |
| **5. Profile** | Activity timeline focus, collapsible settings, clean stat blocks | Medium |
| **6. Layout + Navigation** | Sidebar restyle, mobile bottom nav polish, swipe + pull-to-refresh, transitions | Medium |
| **7. Review + Polish** | Animation pass, mobile testing, consistency audit, typecheck | Small |

---

## 12. Acceptance Criteria

- [ ] **Consistency:** All 4 dashboard pages use the same card language, heading hierarchy, spacing, and color balance
- [ ] **Stats-first home:** Streak and stats are immediately visible above the fold on dashboard home
- [ ] **Mobile experience:** Bottom sheets replace full-screen modals on mobile; swipeable cards work on flashcards; pull-to-refresh works on data views
- [ ] **Quiz wizard:** Create flow is a multi-step wizard (upload → settings → generate)
- [ ] **Flashcard wizard:** Create flow is a multi-step wizard (name → upload → generate)
- [ ] **Profile timeline:** Activity/history is the primary content on the profile page
- [ ] **Animations present:** Staggered reveals, hover/tap micro-interactions, page transitions throughout
- [ ] **No regressions:** All existing functionality preserved (upload, job polling, quiz submission, etc.)
- [ ] **Typecheck passes:** `npx next build` completes without TypeScript errors

---

## 13. Out of Scope

- Landing page (`app/page.tsx`, `app/landing/*`)
- Auth pages (`app/auth/*`)
- Backend/API changes
- Database schema changes
- New features beyond the scope of the restyle (e.g., new quiz types, collaboration features)
- Dark mode (can be addressed in a future iteration)
