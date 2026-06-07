# Quiz UI Redesign — Specification

## Overview

Redesign all quiz-related screens in the dashboard with a more playful, animated, and engaging visual style, while keeping the existing Lernopia brand color theme. No dark mode support. The redesign covers the full quiz flow: dashboard, list, creation form, taking experience, and results.

---

## Scope (All Screens)

| Screen | File | Changes |
|--------|------|---------|
| Quiz Dashboard | `app/dashboard/quiz/page.tsx` | Redesign stats, quick actions, recent quizzes section |
| Quiz List | `app/dashboard/quiz/components/quizList.tsx` | Redesign layout to single-column list with animated cards |
| Quiz Creation Form | `app/dashboard/quiz/components/quizForm.tsx` | Redesign 3-step wizard with playful transitions |
| Quiz View (Taking) | `app/dashboard/quiz/components/quizView.tsx` | Redesign question display, options, navigation, add rich feedback |
| Quiz Results | `app/dashboard/quiz/components/quizResults.tsx` | Redesign as full inline page (not modal) with celebration effects |
| Job Status Modal | `app/dashboard/quiz/components/JobStatusModal.tsx` | Minimal visual updates to match new style |
| Shared Quiz Page | `app/share/quiz/[shareToken]/page.tsx` | Apply same visual treatment to shared/public quiz experience |

---

## Design Constraints

| Constraint | Decision |
|-----------|----------|
| **Color theme** | Keep existing Lernopia theme — primary greens (`#2d6b4d`, `#1f5238`), secondary reds (`#ff5252`, `#fc0b06`), warm neutrals (`#ececec`, `#f5f5f5`, `#2c2c2c`) |
| **Dark mode** | ❌ Not supported. No `.dark` variants |
| **Card style** | Flatter cards — keep current style (white bg, subtle border, light shadow), improve layout and typography |
| **Fonts** | Keep existing — Inter for body, Fredoka/Inter for headings via `font-heading` |
| **Icons** | Use `lucide-react` (existing dependency). Keep existing icon set, no new icon library |
| **Animations library** | `framer-motion` (existing dependency). Use for transitions, not raw CSS animations where possible |

---

## Quiz View (quizView.tsx) — Detailed Spec

### Layout
- Single question displayed at a time
- Max-width container (`max-w-2xl`) centered
- Smooth scroll-to-top on question change (keep current behavior)

### Header / Progress
- **Progress dots** (keep current approach): Row of small pill-shaped dots at top
  - Active dot: wider (`w-6`), primary green fill
  - Answered dot: normal width, light green fill
  - Unanswered dot: neutral gray fill
  - **Animation**: Dots pulse gently when active; answered dots scale in with a check mark
- Question counter: "Question X of Y" text
- "Ready" badge when all questions answered (keep but restyle)

### Question Card
- Clean white card with subtle border
- Question number badge (small colored pill/icon at top-left)
- Question text: medium size, readable
- **Animation**: Card slides in/fades in on question change using framer-motion

### Answer Options
- **Multiple Choice**: Radio-style options with circle indicators
  - Selected state: filled green circle with check mark, light green background
  - Hover: subtle background highlight
  - **Animation**: Option scales up slightly on hover; selected option has a brief bounce
- **True/False**: Two side-by-side buttons
  - True: selected state with green theme
  - False: selected state with red theme
  - **Animation**: Buttons pulse gently when selected
- **Short Answer**: Text input field
  - Clean border, focus ring in primary green
  - "Press Enter to save" hint

### Rich Feedback (NEW)
- After selecting an answer, show a colored feedback row below the options:
  - Correct answer: green background with checkmark icon + "Correct! Well done!" message
  - Wrong answer: red background with X icon + show the correct answer text
- **Animation**: Feedback row slides down from below options with a fade-in

### Navigation
- **Previous** button (left): only visible when not on first question
- **Next** button (right): enabled only when current question is answered
  - On last question, shows "Submit Quiz" instead of "Next"
- **Animation**: Navigation buttons scale on hover/active

### Submit
- Submit button on last question
- Disabled until all questions are answered
- Shows loading spinner during submission
- After submission → navigate to results page (inline, not modal)

---

## Quiz Results (quizResults.tsx) — Detailed Spec

### Layout: Full Inline Page (not modal)
- Not a fixed overlay — rendered inline in the page flow
- User can scroll naturally through results
- Remove `fixed inset-0`, `backdrop-blur`, modal structure

### Header Section
- Trophy icon with celebration animation
- "Quiz Complete!" heading
- Subtitle with encouraging message
- **Animation**: Trophy icon bounces/bobs on entrance with a scale-in effect; confetti-like particles (using framer-motion) burst on mount

### Score Overview
- Large percentage number (e.g., "80%")
- "X of Y correct" text
- Pass/Fail badge with checkmark or alert icon
- **Score Breakdown**: 4 mini-stat cards in a row:
  - Correct (green count)
  - Wrong (gray count)
  - Total (gray count)
  - Score (green or red depending on pass/fail)
- **Animation**: Numbers count up from 0 on mount using framer-motion; stat cards fade in sequentially

### Detailed Answer Review
- "Review Your Answers" heading
- List of all questions with user's answer and correct answer
- Each item:
  - Question number badge (green for correct, red for wrong)
  - Question text
  - User's answer (green text if correct, red if wrong)
  - Correct answer (shown only if user was wrong)
  - Correct/Wrong icon at right
- **Animation**: Items slide in sequentially with stagger delay

### Footer Actions
- **Review Again** button: neutral style, goes back to quiz view with answers preserved
- **Start New Quiz** button: primary green style, opens creation form
- **Animation**: Buttons scale on hover

---

## Quiz List (quizList.tsx) — Detailed Spec

### Layout: Single Column List
- Change from 2-column grid to single column full-width rows
- Each row is a card showing: title, subject badge, question count, date, share button
- **Animation**: Cards fade in sequentially on load; hover card lifts slightly

### Search Bar
- Keep search functionality
- Styled consistently with the rest of the UI
- Clear button appears when searching

### Empty State
- Icon + "No quizzes created yet" message
- "Create your first quiz →" link

### Row Content
- Left: colored dot/icon + quiz title + subject badge
- Right: question count + date + share icon
- Subject badge: colored pill using primary-50 bg

---

## Quiz Creation Form (quizForm.tsx) — Detailed Spec

### Layout: Multi-Step Wizard (3 Steps)
- Keep the 3-step flow: Title → Content → Settings
- **Animation**: Page transitions slide between steps using framer-motion

### Step Indicators
- Current design uses numbered circles with check marks for completed steps
- Keep this but animate: completed steps bounce/scale; current step pulses
- "Step X of 3" subtitle

### Step 1: Title
- Clean input field with label
- Required indicator
- Character limit hint (subtle)

### Step 2: Content
- Tab toggle: Text / PDF
- Text tab: large textarea
- PDF tab: file upload area with drag-and-drop style
- Selected file display with remove option
- **Animation**: Tab content switches with a crossfade

### Step 3: Settings
- Question count slider (range input) with live number display
- Difficulty toggle: Easy / Medium / Hard buttons
- Question types: checkable cards for Multiple Choice, True/False, Short Answer
- **Animation**: Slider fills with gradient; buttons have active bounce

### Footer
- Back/Cancel button (left)
- Continue/Create button (right)
- Disabled states when required fields are empty
- Loading state with spinner on "Create Quiz"

---

## Quiz Dashboard (page.tsx) — Detailed Spec

### Header
- Keep PageHeader component with "Quiz Generator" title and "Create" button
- **Animation**: Header fades in on mount

### Stats Cards
- Keep 2-column grid for stat blocks
- Quiz Created count + In Progress count
- **Animation**: Stats count up from 0

### Quick Actions
- "Browse Quizzes" card: keep as clickable card leading to quiz list
- **Animation**: Card lifts on hover

### Recent Quizzes
- Show last 3 quizzes as compact cards
- Loading state per card (spinner overlay while loading a specific quiz)
- "View all" link
- **Animation**: Items slide in with stagger

### Active Jobs
- Keep active job indicator bar
- Minimal visual update

---

## Shared Quiz Page — Noted

- The shared quiz page (`app/share/quiz/[shareToken]/page.tsx`) should receive the same visual treatment as the main quiz view
- Results on shared page should be inline (not modal) to match the main page
- Already has a "Sign up free" CTA — keep this

---

## Animation Inventory

| Element | Animation | Trigger |
|---------|-----------|---------|
| Progress dots | Pulse active dot; scale-in answered dot | On question change |
| Question card | Slide up + fade in | On question change |
| Options | Scale on hover; bounce on select | Hover / Click |
| Feedback row | Slide down + fade in | After answer selection |
| Navigation buttons | Scale on hover/active | Hover / Click |
| Quiz completion | Trophy bounce; confetti burst; scale-in | On results mount |
| Score numbers | Count up from 0 | On results mount |
| Detailed results | Slide in with stagger delay | On results mount |
| Quiz list items | Fade in sequentially | On page load |
| Form steps | Slide left/right between steps | Step change |
| Stats | Count up from 0 | On mount |
| Recent quizzes | Slide in with stagger | On mount |

---

## Excluded (Not in Scope)

- Dark mode support
- Star ratings on results
- Live score tracking during quiz
- Gift/icon-style question markers (keep dots)
- Changing the existing color palette
- New dependencies or icon libraries
- Changes to the API layer, hooks, or backend logic
- Changes to the authentication or subscription flows
- Changes to the root layout or globals.css

---

## Implementation Order

1. **Quiz View** — Core quiz-taking experience with rich feedback and animations
2. **Quiz Results** — Inline results page with celebration effects
3. **Quiz List** — Single-column animated list
4. **Quiz Creation Form** — Restyled 3-step wizard with transitions
5. **Quiz Dashboard** — Stats, quick actions, recent quizzes
6. **Shared Quiz Page** — Apply same treatment to public view
7. **Job Status Modal** — Minor visual polish

---

## Migration Notes

- `quizResults.tsx`: Change from modal (`fixed inset-0`) to inline component. The parent (`page.tsx`) needs to conditionally render results inline instead of as an overlay. The `showResultsModal` state can be replaced by checking if `quizResult` is set.
- `quizList.tsx`: Change grid from `grid-cols-1 md:grid-cols-2` to single column. Adjust card content layout accordingly.
- `page.tsx`: Update View type or add a 'results' view state if needed. Render quiz results inline rather than as a modal overlay.
- `shared quiz page`: Remove modal wrapper for results; render inline like the main page.
