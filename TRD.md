# SmartQuiz Pro TRD

## 1. Purpose
This document defines the technical requirements for building SmartQuiz Pro as a full-stack web application. The existing `sufiyan bhai.html` file should be treated as a behavioral reference and prototype only, not as the final architecture.

## 2. Recommended Stack

### Frontend
- React 18
- Vite
- TypeScript
- React Router
- Tailwind CSS
- TanStack Query for server state
- Zustand or lightweight context store for local UI/auth/session state
- Socket.IO client for live room updates
- React Hook Form + Zod for form validation
- Lucide icons

### Backend
- Node.js 20+
- Express
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT auth with refresh-token or secure httpOnly cookie approach
- bcrypt for password hashing
- Zod or Joi for request validation
- Socket.IO for real-time session events
- pino or winston for logging

### Testing
- Frontend: Vitest + React Testing Library
- Backend: Vitest or Jest + Supertest
- Optional E2E: Playwright

## 3. Repository Structure
Recommended monorepo structure:

```text
/client
  /src
    /api
    /app
    /components
    /features
    /hooks
    /layouts
    /pages
    /routes
    /store
    /styles
    /types
    /utils
/server
  /src
    /config
    /controllers
    /db
    /middleware
    /models
    /routes
    /services
    /sockets
    /types
    /utils
/shared
  /types
  /constants
```

## 4. Environment Variables

### Client
- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

### Server
- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `COOKIE_SECRET`

## 5. Core Technical Decisions
- Use TypeScript across frontend and backend.
- Use MongoDB Atlas for all persistent application data.
- Use JWT-based authentication with secure cookie or token storage strategy.
- Use role-based middleware for admin-only routes.
- Use Socket.IO for real-time room, lobby, and quiz events.
- Use REST APIs for CRUD and session bootstrap.

## 6. Data Models

### 6.1 User
Fields:
- `_id`
- `name`
- `email` unique indexed
- `passwordHash`
- `role` enum: `admin | student`
- `avatarUrl` optional
- `isActive`
- `lastLoginAt`
- `createdAt`
- `updatedAt`

### 6.2 Quiz
Fields:
- `_id`
- `title`
- `description`
- `category`
- `difficulty` enum: `easy | medium | hard`
- `timerSeconds`
- `status` enum: `draft | published | archived`
- `createdBy` reference `User`
- `questions` array
- `totalPoints`
- `createdAt`
- `updatedAt`

### 6.3 Question
Embedded inside `Quiz.questions`
- `_id`
- `type` enum: `mcq | tf | text`
- `prompt`
- `options` string array for MCQ
- `correctOptionIndex` nullable
- `correctBoolean` nullable
- `correctText` nullable
- `points`
- `explanation` optional
- `mediaUrl` optional
- `order`

Validation:
- `mcq` requires at least 2 options and `correctOptionIndex`.
- `tf` requires `correctBoolean`.
- `text` requires `correctText`.

### 6.4 RoomSession
Fields:
- `_id`
- `code` unique indexed
- `quizId` reference `Quiz`
- `hostId` reference `User`
- `mode` enum: `score | time | battle`
- `status` enum: `lobby | live | completed | closed`
- `currentQuestionIndex`
- `startedAt`
- `endedAt`
- `participants` array of participant snapshots
- `settings`
- `createdAt`
- `updatedAt`

Participant snapshot:
- `userId`
- `name`
- `joinedAt`
- `socketId` optional
- `isConnected`
- `score`

### 6.5 Attempt
Fields:
- `_id`
- `roomSessionId`
- `quizId`
- `studentId`
- `answers` array
- `score`
- `correctCount`
- `wrongCount`
- `rank` optional
- `startedAt`
- `completedAt`
- `status` enum: `in_progress | submitted | timed_out | completed`
- `createdAt`
- `updatedAt`

Answer item:
- `questionId`
- `submittedValue`
- `isCorrect`
- `pointsAwarded`
- `timeTakenMs`

## 7. API Design
Base path: `/api/v1`

### 7.1 Auth
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`

#### Signup request
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPass123",
  "role": "admin"
}
```

#### Login request
```json
{
  "email": "jane@example.com",
  "password": "StrongPass123"
}
```

#### Auth response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "admin"
    },
    "accessToken": "jwt_token"
  }
}
```

### 7.2 Quiz Management
- `GET /quizzes`
- `POST /quizzes`
- `GET /quizzes/:quizId`
- `PATCH /quizzes/:quizId`
- `DELETE /quizzes/:quizId`
- `PATCH /quizzes/:quizId/status`

### 7.3 Room Sessions
- `POST /rooms`
- `GET /rooms/:code`
- `POST /rooms/:code/join`
- `POST /rooms/:code/start`
- `POST /rooms/:code/close`
- `GET /rooms/:code/leaderboard`

### 7.4 Attempts
- `POST /attempts/:roomSessionId/answers`
- `POST /attempts/:roomSessionId/complete`
- `GET /attempts/me`
- `GET /attempts/:attemptId`

### 7.5 Analytics
- `GET /analytics/overview`
- `GET /analytics/quizzes/:quizId`

## 8. Socket.IO Events

### Client to Server
- `room:join`
- `room:leave`
- `room:host:start`
- `quiz:answer`
- `quiz:request-state`

### Server to Client
- `room:state`
- `room:participant-joined`
- `room:participant-left`
- `quiz:started`
- `quiz:question`
- `quiz:answer-result`
- `quiz:completed`
- `leaderboard:update`
- `error:event`

## 9. Auth and Security Requirements
- Passwords must be hashed with bcrypt.
- No plain-text password storage anywhere.
- Access tokens should be short-lived.
- Refresh tokens or secure cookie sessions should be implemented.
- Admin-only routes require role check middleware.
- Rate limit auth routes.
- Sanitize and validate all incoming payloads.
- Restrict CORS to approved frontend origins.
- Do not expose MongoDB URI or secrets to the client.

## 10. Validation Rules

### User
- Name: 2 to 60 chars
- Email: valid email format, unique
- Password: minimum 8 chars, at least one letter and one number

### Quiz
- Title: required, 3 to 120 chars
- Timer: 5 to 120 seconds
- Must contain at least 1 question
- Question order must be unique within quiz

### Room
- Room code must be server-generated
- Room must reference a published quiz
- Students cannot join `completed` or `closed` rooms

## 11. Error Response Standard
All errors should follow this shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

## 12. Backend Folder Responsibilities
- `controllers`: parse request and shape response
- `services`: business logic
- `models`: mongoose schemas
- `routes`: route definitions
- `middleware`: auth, role, validation, error handling
- `sockets`: real-time connection logic
- `db`: database connection and helpers

## 13. Frontend-Backend Contract Requirements
- Use typed API clients.
- Centralize base fetch/axios wrapper with auth handling.
- Normalize API success and error shapes.
- Handle expired auth by refreshing or redirecting.

## 14. Performance Requirements
- Dashboard pages should render skeletons immediately while data loads.
- API list endpoints should support pagination where needed.
- Server should index frequently queried fields.
- Socket events should send minimal payloads.

## 15. Logging and Observability
- Log auth events, room lifecycle events, and server errors.
- Include request id or correlation id where practical.
- Avoid logging sensitive payloads like passwords and tokens.

## 16. Testing Requirements

### Backend
- Auth signup/login tests
- Role protection tests
- Quiz CRUD tests
- Room create/join/start tests
- Attempt submission tests

### Frontend
- Form validation tests
- Protected route tests
- Quiz builder interaction tests
- Skeleton loading rendering tests
- Student play flow tests

### E2E
- Admin signup/login
- Create quiz
- Launch room
- Student joins and completes quiz

## 17. Deployment Requirements
- Frontend deployable to Vercel or Netlify.
- Backend deployable to Render, Railway, Fly.io, or similar.
- MongoDB Atlas configured with production IP/network rules.
- Separate env configs for development and production.

## 18. Technical Definition of Done
- Real auth is fully functional.
- MongoDB Atlas persistence works for all core entities.
- Room join and quiz play work with real backend state.
- Skeleton loading exists on required views.
- Tests cover critical flows.
- App can be run locally with setup documentation.
