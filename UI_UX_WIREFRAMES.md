# SmartQuiz Pro UI/UX Wireframes

## 1. Design Intent
SmartQuiz Pro should look like a trustworthy education SaaS platform, not a colorful demo toy. The product should feel focused, premium, and efficient for both teachers and students.

## 2. Visual System

### Color Palette
- Primary: `#2563EB`
- Primary dark: `#1D4ED8`
- Accent: `#0F766E`
- Surface: `#FFFFFF`
- App background: `#F8FAFC`
- Border: `#E2E8F0`
- Strong text: `#0F172A`
- Muted text: `#475569`
- Success: `#059669`
- Warning: `#D97706`
- Danger: `#DC2626`

### Typography
- Heading font: `Sora`
- Body font: `Manrope`

### UI Style Rules
- Use rounded corners in the 12px to 18px range.
- Use subtle shadows only on cards, modals, and raised panels.
- Use iconography from a single set such as Lucide.
- Remove emoji from primary UI controls.
- Use whitespace and hierarchy over decoration.

## 3. Global UX Rules
- Every page must define loading, empty, error, and success states.
- Buttons must have hover, active, disabled, and loading states.
- Forms must show inline errors beneath fields.
- Skeletons should mirror the real layout shape.
- Navigation should remain consistent across the app.

## 4. Wireframe: Public Landing / Login

```text
+------------------------------------------------------+
| SmartQuiz Pro                         Login / Signup |
|------------------------------------------------------|
|              Welcome back to SmartQuiz Pro           |
|     Short trust-building message about live quizzes  |
|                                                      |
|   [ Email input                                  ]   |
|   [ Password input                               ]   |
|   [ Login button                              ]      |
|                                                      |
|   Forgot password?        Need an account? Sign up   |
+------------------------------------------------------+
```

Notes:
- Center the auth card.
- Add brand mark and concise message.
- No playful background confetti.
- Optional subtle gradient or soft mesh background.

## 5. Wireframe: Signup

```text
+------------------------------------------------------+
| SmartQuiz Pro                                        |
|------------------------------------------------------|
|                Create your account                   |
|                                                      |
|   [ Full name                                    ]   |
|   [ Email                                        ]   |
|   [ Role dropdown: Admin / Student               ]   |
|   [ Password                                     ]   |
|   [ Confirm password                             ]   |
|   [ Create account button                        ]   |
+------------------------------------------------------+
```

## 6. Wireframe: Admin Dashboard

```text
+------------------+-----------------------------------+
| Sidebar          | Dashboard Header                  |
| - Overview       | "Overview"         [New Quiz]     |
| - Quizzes        |-----------------------------------|
| - Rooms          | [Stat] [Stat] [Stat] [Stat]       |
| - Analytics      |                                   |
| - Settings       | Recent Quizzes                    |
|                  | [Quiz row.....................]   |
|                  | [Quiz row.....................]   |
|                  |                                   |
|                  | Active Rooms                      |
|                  | [Room card] [Room card]           |
+------------------+-----------------------------------+
```

Notes:
- Sidebar should be quiet and structured.
- Use card grids for summary numbers.
- Provide clear primary actions.

## 7. Wireframe: Quiz Builder

```text
+--------------------------------------------------------------+
| Quiz Builder                           [Save Draft][Publish] |
|--------------------------------------------------------------|
| Title input                                                   |
| Description input                                             |
| Category | Difficulty | Timer                                 |
|--------------------------------------------------------------|
| Question 1                                                    |
| [Prompt input............................................]    |
| [Type tabs: MCQ | True/False | Text]                         |
| [Type-specific answer editor]                                 |
| [Points] [Media URL] [Delete Question]                        |
|--------------------------------------------------------------|
| + Add Question                                                |
+--------------------------------------------------------------+
```

Notes:
- Editing surface should feel spacious.
- Reorder questions with drag handles or move actions.
- Validation summary can appear at top before publish.

## 8. Wireframe: Room Setup / Host Lobby

```text
+------------------------------------------------------+
| Room Setup                                           |
|------------------------------------------------------|
| Select Quiz [dropdown]                               |
| Mode [Score] [Time] [Battle]                         |
|                                                      |
| Room Code                                            |
| [   AB12CD   ] [Copy]                                |
|                                                      |
| Participants                                          |
| [Student 1]                                           |
| [Student 2]                                           |
|                                                      |
|                          [Start Quiz] [Close Room]   |
+------------------------------------------------------+
```

Notes:
- Participant list updates live.
- Status badge shows `Lobby`, `Live`, or `Completed`.

## 9. Wireframe: Student Join Room

```text
+-----------------------------------------------+
| Join a Quiz Room                              |
|-----------------------------------------------|
| [ Your name                               ]   |
| [ Room code                               ]   |
| [ Join room button                        ]   |
|                                               |
| Need an account? Sign in or create one        |
+-----------------------------------------------+
```

## 10. Wireframe: Student Lobby

```text
+--------------------------------------------------+
| Room AB12CD                                      |
|--------------------------------------------------|
| Waiting for host to start the quiz               |
|                                                  |
| Participants                                     |
| [You]                                            |
| [Other student]                                  |
|                                                  |
| Connection status: Connected                     |
+--------------------------------------------------+
```

## 11. Wireframe: Quiz Player

```text
+------------------------------------------------------+
| Question 3 of 10                    Timer 00:12      |
| [Progress bar------------------------------------]   |
|------------------------------------------------------|
| Which planet is known as the Red Planet?             |
|                                                      |
| [ A. Venus                                       ]   |
| [ B. Mars                                        ]   |
| [ C. Jupiter                                     ]   |
| [ D. Saturn                                      ]   |
|                                                      |
| Feedback area / submission state                    |
+------------------------------------------------------+
```

Notes:
- Keep the question region focused and distraction-free.
- Highlight answer states clearly.
- On text questions, replace options with input + submit button.

## 12. Wireframe: Results

```text
+------------------------------------------------------+
| Quiz Completed                                       |
|------------------------------------------------------|
| Your Score: 82                                       |
| Correct: 8    Wrong: 2    Rank: 3                    |
|                                                      |
| [ Breakdown card ]                                   |
| [ Leaderboard preview ]                              |
|                                                      |
| [Back to dashboard] [View history]                   |
+------------------------------------------------------+
```

## 13. Wireframe: Student Profile

```text
+------------------------------------------------------+
| Profile                                              |
|------------------------------------------------------|
| Avatar  Name                                         |
| Role: Student                                        |
|                                                      |
| [Total attempts] [Average score] [Best score]        |
|                                                      |
| Recent Attempts                                      |
| [Row............................................]    |
| [Row............................................]    |
+------------------------------------------------------+
```

## 14. Skeleton Patterns

### Auth Skeleton
- Logo bar placeholder
- Title line placeholder
- 3 to 5 input skeleton bars
- Button skeleton

### Dashboard Skeleton
- 4 stat card skeletons
- Table/list row skeletons
- Secondary panel card skeletons

### Quiz Builder Skeleton
- Title and metadata rows
- 1 to 2 question card placeholders
- Action button placeholders

### Student Play Skeleton
- Header line
- Progress bar
- Question block
- 4 answer option placeholders

## 15. Empty States
- No quizzes yet: invite admin to create first quiz.
- No students joined yet: show room code sharing tips.
- No quiz history: invite student to join a room.
- No analytics data: explain that insights appear after quiz completions.

## 16. Error States
- Invalid room code.
- Session expired.
- Quiz no longer available.
- Network connection interrupted.
- Unauthorized role access.

## 17. Responsive Notes
- Mobile auth cards use nearly full width.
- Admin sidebar becomes drawer below desktop breakpoint.
- Quiz player uses sticky header for timer and progress.
- Tables become stacked cards on smaller screens.

## 18. Interaction Notes
- Keep motion subtle and quick.
- Use toast notifications for secondary actions only.
- Use inline messages for form and critical state errors.
- Favor clarity over novelty.
