# Dashboard Redesign Specification

> **Status:** Draft (based on user interview)  
> **Date:** May 21, 2026

---

## 1. Core Design Principles

| Principle | Description |
|-----------|-------------|
| **No gradients** | Replace all gradient backgrounds with solid colors. Exception: progress bars keep their gradient fills. |
| **Subtle cards** | Remove borders from cards. Use `shadow-md` for separation on white backgrounds. |
| **Generous spacing** | Increase overall whitespace — padding, gaps between sections, internal card padding. |
| **Consistent alignment** | Standardize heading sizes, card padding, and grid gaps across all dashboard pages. |
| **Color hierarchy** | Green (`#193827` family) = primary brand. Red (`#ff5252` family) = secondary/CTA. Warm greys (`#ececec` / `#f5f5f5`) = backgrounds. |

---

## 2. Color System (No Changes to Palette)

Keep existing CSS variables as defined in `app/globals.css` and `lib/theme.ts`:

- **Primary (Forest Green):** `#193827` → `#2d6b4d` → `#4d8567` → tints
- **Secondary (Bright Red):** `#ff5252` → `#fc0b06` → tints
- **Neutral (Warm Greys):** `#ececec` → `#e0e0e0` → `#8a8a8a` → `#2c2c2c`
- **Accent (Gold):** Keep as-is for badges/awards

---

## 3. Card Design

### Current → Target

| Aspect | Current | Target |
|--------|---------|--------|
| Background | `bg-white` | `bg-white` (unchanged) |
| Border | `border border-neutral-200` | **Remove border entirely** |
| Shadow | None (relies on border) | `shadow-md` (moderate) |
| Border radius | `rounded-xl` (12px) | `rounded-xl` (unchanged) |
| Internal padding | Inconsistent (p-4, p-5 mixed) | **Standardize to p-5** for main cards, p-4 for compact cards |

### Card Categories
| Card Type | Padding | Additional Notes |
|-----------|---------|------------------|
| Main content cards | `p-5` | Stats panels, action grids, activity lists |
| Compact/stat cards | `p-4` | Small stat displays, mini-cards |
| Modals/overlays | `p-6` | Create forms, job modals |

---

## 4. Gradient Replacement Map

Every gradient in the dashboard must be changed according to the table below:

### 4.1 Main Dashboard (`app/dashboard/page.tsx`)

| Location | Current | Replacement |
|----------|---------|-------------|
| Welcome header icon (line 254) | `bg-gradient-to-br from-[#193827]/10 to-[#ff5252]/10` border | `bg-[#193827]/10` border |
| Top subject progress bar (line 508) | `bg-gradient-to-r from-[#ff5252] to-[#ff7a7a]` | **Keep gradient** (progress bars exempted) |
| StreakCard fire icon bg | `bg-gradient-to-br from-orange-50 to-rose-50` | `bg-[#ff5252]/10` |
| StreakCard progress bar | `bg-gradient-to-r from-orange-400 to-[#ff5252]` | **Keep gradient** (progress bars exempted) |

### 4.2 Flashcards

| Location | Current | Replacement |
|----------|---------|-------------|
| CreateForm header icon (line 106) | `bg-gradient-to-br from-[#2d6b4d] to-[#4d8567]` | `bg-primary-500` (solid #2d6b4d) |
| FlashcardViewer — front (line 70) | `bg-gradient-to-br from-[#2d6b4d] to-[#4d8567]` | `bg-primary-500` (solid #2d6b4d) |
| FlashcardViewer — back (line 81) | `bg-gradient-to-br from-[#58a4b0] to-[#373f51]` | Solid dark teal `bg-[#373f51]` or keep as neutral dark `bg-neutral-800` |

### 4.3 Profile

| Location | Current | Replacement |
|----------|---------|-------------|
| ProfileCard avatar placeholder (line 47) | `bg-gradient-to-br from-[#193827]/10 to-[#ff5252]/10` | `bg-[#193827]/10` |

### 4.4 Layout

| Location | Current | Replacement |
|----------|---------|-------------|
| Sidebar study tip card (line 147) | `bg-gradient-to-br from-[#193827]/5 to-[#ff5252]/5` | `bg-[#193827]/8` |
| Sidebar study tip card border | `border-[#193827]/10` | `border-primary-100` or no border |

### 4.5 CSS Classes (`app/globals.css`)

| Class | Action |
|-------|--------|
| `.gradient-text-primary` | Keep — gradient text may still be useful for hero sections on landing page |
| `.gradient-text-red` | Keep |
| `.gradient-text-gold` | Keep |

### 4.6 Landing Page & Auth Pages

These are out of scope for this dashboard-specific spec. Focus is `app/dashboard/*` only.

---

## 5. Spacing Standardization

### 5.1 Section/Grid Gaps

| Context | Current | Target |
|---------|---------|--------|
| Main section spacing | `space-y-6` | `space-y-8` |
| Card grid gaps | `gap-3` | `gap-4` |
| Two-column layouts | `gap-6` | `gap-8` |

### 5.2 Internal Card Padding

| Component | Current | Target |
|-----------|---------|--------|
| Stat cards (dashboard) | `p-4` | `p-4` (compact OK) |
| Quick Actions card | `p-5` | `p-6` |
| Recent Activity card | `p-5` | `p-6` |
| Performance card | `p-5` | `p-6` |
| Top Subject card | `p-5` | `p-6` |
| Flashcard stats | `p-5` | `p-4` (compact OK) |
| Quiz dashboard cards | `p-4` or `p-5` | `p-5` (standardize) |
| Profile cards | `p-5` | `p-6` |
| Motion list items | `p-2.5` | `p-3` |

### 5.3 Heading Size Consistency

| Heading Role | Size | Font Stack |
|-------------|------|------------|
| Page title (h1) | `text-xl` | `font-heading font-semibold` |
| Section title (h2) | `text-base` | `font-heading font-semibold` |
| Card subtitle (h3) | `text-sm` | `font-heading font-medium` |
| Stat value | `text-lg` | `font-heading font-semibold` |
| Stat label | `text-xs` | `font-medium` (Inter) |

---

## 6. Page-by-Page Changes

### 6.1 Dashboard Home (`app/dashboard/page.tsx`)

- **Welcome header:** Remove gradient from icon bg → solid tint. Standardize spacing.
- **Stat cards:** Remove borders, add shadow-md. All cards get same padding.
- **Quick Actions card:** Remove border, shadow-md, increase internal padding to p-6.
- **Recent Activity card:** Same treatment. Increase list item padding to p-3.
- **Performance card:** Same treatment. Increase gap between items to gap-4.
- **Top Subject card:** Remove gradient from progress bar bg (keep gradient fill). Remove border.
- **Error/loading states:** Ensure consistent card styling.

### 6.2 Flashcards (`app/dashboard/flashcards/page.tsx`)

- **Header:** Keep as-is (already minimal).
- **Stats row:** Remove borders, add shadow-md. Standardize padding.
- **Generate button:** Keep current red CTA style.
- **CreateForm modal:** Replace gradient icon with solid primary-500. Keep card styling but no border on the inner card.
- **FlashcardViewer:** Front card = solid primary-500 green. Back card = solid dark. Remove gradients.
- **JobStatusModal:** Ensure card has shadow, no border.

### 6.3 Quiz (`app/dashboard/quiz/page.tsx`)

- **Stats cards:** Remove borders, shadow-md, standardize padding.
- **Action cards:** Same treatment, increase gap between icon and text.
- **Recent quizzes:** Remove border, shadow-md.
- **QuizForm modal:** Remove border from inner content area, use shadow instead.
- **QuizResults modal:** Same treatment — shadow over border.
- **QuizView:** Ensure consistent heading sizes.

### 6.4 Profile (`app/dashboard/profile/`)

- **ProfileHeader:** Keep page title style consistent with other pages.
- **ProfileCard:** Remove border, add shadow-md. Replace gradient avatar placeholder with solid tint.
- **StatsCard:** Remove border, shadow-md. Standardize padding.
- **ActivityCard:** Remove border, shadow-md.
- **SettingsCard:** Remove border, shadow-md.
- **Loading/Error states:** Ensure cards match the new style.

### 6.5 Layout (`app/dashboard/layout.tsx`)

- **Sidebar study tip card:** Replace gradient mix with solid green tint (`bg-[#193827]/8`).
- **Navbar:** Keep current style (already no border issues).
- **Mobile bottom nav:** Keep current style.

---

## 7. Component-Specific Changes

### 7.1 StreakCard
- Remove border from outer card, add shadow-md
- Replace gradient fire icon bg with solid tint (`bg-[#ff5252]/10`)
- Keep progress bar gradient
- Increase padding to match section (currently p-5 → check if needs to match)

### 7.2 AnimatedSection
- No visual changes needed — animations stay as-is

### 7.3 Notification Component
- Keep current styling (error/success alerts don't need shadow changes)

### 7.4 Skeleton/Loading States
- Ensure skeletons match the new card dimensions (no border, shadow-md spacing)

---

## 8. Implementation Order

1. **CSS variables/globals** — update card base classes (`.card`, `.card-hover`) to remove border defaults and add shadow
2. **Dashboard home page** — the main page, highest impact
3. **Layout (sidebar)** — study tip card gradient removal
4. **Flashcards page** — gradient replacements + card restyling
5. **Quiz page** — card restyling + consistency fixes
6. **Profile pages** — card restyling + consistency fixes
7. **Review pass** — ensure consistency across all pages

---

## 9. Out of Scope

- Landing page (`app/page.tsx`, `app/landing/*`)
- Auth pages (`app/auth/*`)
- Progress bar gradients (explicitly exempted)
- Mobile nav design (keep as-is)
- Sidebar nav style (keep as-is)
- Font changes (handled in previous session)
- Animation/transition changes

---

## 10. Acceptance Criteria

- [ ] **Zero gradients** used in any dashboard component (except progress bars)
- [ ] **All cards** use `shadow-md` with no border
- [ ] **Spacing** is consistent: same padding for same-level cards, same grid gaps
- [ ] **Heading sizes** follow the standardized hierarchy
- [ ] **Page feels** cleaner, more spacious, and visually unified
- [ ] **No regressions** — all functionality preserved, no layout breakage
- [ ] **Typecheck passes** — `npx next build` completes without errors
