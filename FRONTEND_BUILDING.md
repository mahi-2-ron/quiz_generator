# SmartQuiz Pro Frontend Building Guide

## 1. Purpose
This document tells the frontend agent exactly how to build the SmartQuiz Pro user interface. The goal is to transform the existing single-file prototype into a professional, scalable, component-based frontend.

## 2. Frontend Objectives
- Build a clean and professional product UI.
- Support admin and student flows.
- Connect all real data to backend APIs.
- Use skeleton loaders and polished UX states throughout.
- Keep the interface responsive, accessible, and maintainable.

## 3. Recommended Frontend Stack
- React 18
- Vite
- TypeScript
- React Router
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Zustand or Context for auth/session store
- Socket.IO client
- Lucide icons

## 4. Route Map

### Public Routes
- `/`
- `/login`
- `/signup`
- `/join`

### Admin Routes
- `/admin`
- `/admin/dashboard`
- `/admin/quizzes`
- `/admin/quizzes/new`
- `/admin/quizzes/:quizId/edit`
- `/admin/rooms/new`
- `/admin/rooms/:code`
- `/admin/analytics`

### Student Routes
- `/student`
- `/student/profile`
- `/student/history`
- `/room/:code/lobby`
- `/play/:roomSessionId`
- `/results/:attemptId`

## 5. Layout System

### Public Layout
- Minimal top bar with brand.
- Centered auth/join forms.
- Strong visual hierarchy and trust-building copy.

### Admin Layout
- Left sidebar on desktop.
- Collapsible drawer on tablet/mobile.
- Top utility bar with account menu.
- Content area with page header, actions, cards, and tables.

### Student Layout
- Simplified top bar.
- Focus on quiz progression and clarity.
- Minimal distractions during active play.

## 6. Design Direction
The prototype's bright playful theme should be replaced with a professional, modern product look.

### Theme Principles
- Calm and credible.
- Structured and consistent.
- Slightly elevated SaaS/product styling.
- No emoji-heavy controls in core navigation.
- Use icons intentionally, not decoratively.

### Suggested Visual Tokens
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Primary: `#2563EB`
- Primary hover: `#1D4ED8`
- Accent: `#0F766E`
- Text strong: `#0F172A`
- Text muted: `#475569`
- Border: `#E2E8F0`
- Success: `#059669`
- Warning: `#D97706`
- Danger: `#DC2626`

### Typography
- Headings: `Sora`
- Body: `Manrope`

## 7. Core Pages and Components

### 7.1 Auth Screens
Pages:
- Login
- Signup

Components:
- AuthShell
- AuthCard
- TextField
- PasswordField
- RoleSelect
- AuthSubmitButton
- AuthFooterLinks

UX requirements:
- Inline validation.
- Loading spinner on submit.
- Error banner or inline field errors.
- Success state after signup.

### 7.2 Admin Dashboard
Components:
- StatsCard
- RecentQuizList
- ActiveRoomsPanel
- EmptyDashboardState
- DashboardSkeleton

### 7.3 Quiz Builder
Components:
- QuizForm
- QuestionBuilder
- QuestionTypeTabs
- McqOptionList
- TrueFalseEditor
- TextAnswerEditor
- MediaInput
- SaveDraftButton
- PublishButton

UX requirements:
- Unsaved changes indicator.
- Add/remove/reorder questions.
- Validation before publish.
- Skeleton when loading quiz for edit.

### 7.4 Room Setup and Live Session
Components:
- RoomCodeCard
- QuizSelector
- GameModeSelector
- ParticipantList
- SessionStatusBadge
- StartQuizButton

UX requirements:
- Copy room code action.
- Real-time participant updates.
- Clear session state transitions.

### 7.5 Student Join and Lobby
Components:
- JoinRoomForm
- JoinRoomCard
- LobbyStatusCard
- ParticipantPresenceList
- WaitingIndicator

### 7.6 Quiz Player
Components:
- QuizHeader
- TimerRing or TimerBar
- ProgressBar
- QuestionCard
- McqAnswers
- TrueFalseAnswers
- TextAnswerInput
- FeedbackPanel
- AnswerSubmitButton

UX requirements:
- Prevent double submission.
- Disable answers once submitted or timed out.
- Show current question number and total.

### 7.7 Result Screen
Components:
- ScoreHero
- BreakdownCard
- AnswerReviewList
- LeaderboardCard
- PlayAgainOrHomeActions

### 7.8 Student Profile
Components:
- ProfileSummaryCard
- AttemptHistoryTable
- EmptyHistoryState
- ProfileStatsCards

## 8. State Management

### Server State
Use TanStack Query for:
- Current user
- Quiz lists
- Quiz details
- Dashboard analytics
- Room session data
- Attempt history

### Local UI State
Use Zustand or Context for:
- Auth token/session memory
- Sidebar open state
- Selected quiz builder draft state
- Current live room socket state

## 9. API Integration Rules
- Create a typed `apiClient`.
- Centralize interceptors/error handling.
- Normalize backend error responses for forms.
- Add retry behavior only where appropriate.
- Do not hide meaningful API failures.

## 10. Skeleton Loading Requirements
Skeletons are mandatory in the following areas:
- Auth card initial load
- Admin dashboard stat cards
- Quiz list rows/cards
- Quiz edit form while quiz data loads
- Room participant panel while fetching
- Student profile and history
- Analytics charts/cards
- Result summary while fetching persisted attempt data

Recommended implementation:
- Use reusable skeleton components based on layout shape.
- Prefer subtle shimmer effect.
- Match final layout dimensions to avoid content jump.

## 11. Empty, Error, and Disabled States

### Empty States
- No quizzes created yet
- No room participants yet
- No attempt history yet
- No analytics data yet

### Error States
- Invalid credentials
- Expired session
- Room not found
- Quiz not published
- Network request failed

### Disabled States
- Submit buttons during requests
- Start quiz button until quiz and room are valid
- Publish button until quiz passes validation

## 12. Accessibility Requirements
- Semantic headings and form labels.
- Keyboard navigable forms and controls.
- Visible focus rings.
- Proper color contrast.
- Aria-live support for time-sensitive feedback where practical.
- Toasts should not be the only source of critical error messaging.

## 13. Responsive Requirements

### Mobile
- Stacked cards and simplified controls.
- Sidebar becomes drawer.
- Quiz screen prioritizes question and timer.

### Tablet
- Two-column layouts where useful.
- Room and analytics panels can collapse.

### Desktop
- Full dashboard layout with sidebar.
- Wider quiz builder and better list density.

## 14. Animation Rules
- Use restrained transitions.
- Animate skeleton fade, modal open, drawer slide, and route transitions lightly.
- Do not use playful bouncing or celebratory motion as a default.
- Use stronger motion only for clear success moments like quiz completion.

## 15. Frontend Folder Guidance

```text
src/
  api/
    auth.ts
    quizzes.ts
    rooms.ts
    attempts.ts
    analytics.ts
  components/
    ui/
    skeletons/
    forms/
  features/
    auth/
    admin/
    student/
    quiz/
    rooms/
  layouts/
  pages/
  store/
  hooks/
  utils/
  types/
```

## 16. Build Phases
1. Scaffold app and route structure.
2. Build shared UI kit and theme tokens.
3. Implement auth pages.
4. Implement protected layouts.
5. Implement admin dashboard and quiz management.
6. Implement room and live session flows.
7. Implement student join, play, results, and profile.
8. Add skeletons, empty states, and error polish.

## 17. Frontend Definition of Done
- All pages use real API integrations.
- Professional theme is consistent throughout.
- Skeletons exist for all required loading states.
- Protected routing works.
- Forms are validated and accessible.
- Responsive behavior is solid across breakpoints.
