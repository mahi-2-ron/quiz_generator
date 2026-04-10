# SmartQuiz Pro Master Dev Prompt

Use this prompt inside Antigravity IDE to build the application.

---

You are building a production-style full-stack web application called `SmartQuiz Pro`.

The current project contains a single prototype file named `sufiyan bhai.html`. Treat that file as a behavioral and feature reference only. Do not preserve its single-file architecture. Rebuild the product properly as a modern full-stack app.

Before writing code, read these documents in this exact order:
1. `PRD.md`
2. `TRD.md`
3. `FRONTEND_BUILDING.md`
4. `SYSTEM_DESIGN.md`
5. `UI_UX_WIREFRAMES.md`

After reading them, implement the full application according to those documents.

## Product Goal
Build a professional, full-stack quiz platform for admins and students with:
- real signup/login
- role-based access
- backend APIs
- MongoDB Atlas persistence
- live room/session flow
- timed quiz gameplay
- score and results persistence
- professional UI theme
- skeleton loading states

## Mandatory Stack

### Frontend
- React 18
- Vite
- TypeScript
- React Router
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Socket.IO client

### Backend
- Node.js 20+
- Express
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT authentication
- bcrypt
- Socket.IO

## Hard Requirements
- Do not keep auth as fake or local-only.
- Do not store passwords in plain text.
- Do not use the original single-file HTML structure as the main implementation.
- Use MongoDB Atlas-ready configuration through environment variables.
- Implement separate frontend and backend codebases or a clear monorepo structure.
- Add reusable skeleton loading components across required screens.
- Replace the playful theme with a polished professional SaaS-style interface.
- Ensure admin and student routes are protected appropriately.
- Implement real quiz CRUD and real room/session state.

## Build Scope

### Phase 1: Scaffolding
- Create project structure for `client` and `server`.
- Add shared TypeScript-friendly organization.
- Add environment variable templates.
- Add scripts for local development.

### Phase 2: Backend Foundation
- Set up Express server and MongoDB Atlas connection.
- Create models for `User`, `Quiz`, `RoomSession`, and `Attempt`.
- Add auth routes and middleware.
- Add structured error handling and validation.

### Phase 3: Frontend Foundation
- Set up routes, layouts, theme tokens, and reusable UI primitives.
- Build auth screens and protected route system.
- Build skeleton components for card, form, list, table, and page states.

### Phase 4: Core Product Features
- Admin dashboard
- Quiz builder with all required question types
- Quiz list and edit flow
- Room creation and host lobby
- Student join room flow
- Student live quiz flow
- Results page
- Student profile/history page

### Phase 5: Real-Time Features
- Add Socket.IO room handling.
- Sync participant joins and host session state.
- Start quiz from host and propagate to students.
- Keep room state and reconnect flow reliable.

### Phase 6: Polish and Quality
- Add loading, empty, success, and error states.
- Refine responsive behavior.
- Add tests for core flows.
- Add setup documentation.

## Implementation Rules
- Use TypeScript on both client and server.
- Prefer modular, reusable components and services.
- Keep API responses consistent.
- Keep validation strict.
- Keep UI accessible and responsive.
- Use optimistic UI only where safe.
- Use REST for CRUD and initial state fetches.
- Use sockets for live room/session updates.

## Required Features Checklist
- Signup
- Login
- Logout
- Current user session restore
- Admin-only quiz management
- Quiz creation, edit, delete, publish
- Room/session creation with unique code
- Student join room using valid code
- Live lobby participant updates
- Timed quiz answering
- Result persistence
- Student attempt history
- Basic admin analytics
- Professional theme
- Skeleton loaders

## UI Expectations
- Use the wireframes and theme guidance from `UI_UX_WIREFRAMES.md`.
- Use a professional tone and layout.
- Remove emoji-heavy navigation and visual clutter.
- Keep motion restrained and meaningful.
- Maintain strong spacing and hierarchy.

## Deliverables
- Full source code for frontend and backend
- Environment example files
- MongoDB Atlas connection-ready configuration
- Readable project structure
- Tests for major flows
- Local run instructions in README

## Definition of Done
The build is complete only when:
- A user can sign up and log in with real backend auth.
- Data persists in MongoDB Atlas.
- Admin can create and host a quiz.
- Student can join a real room and complete a quiz.
- Results are stored and viewable.
- Skeleton loaders exist on the key loading screens.
- The UI is clearly professional and not a demo-style toy.
- The app runs locally without manual patchwork.

## Final Build Instruction
Implement the application end to end. Do not stop at mockups or partial scaffolding. Build the real full-stack product described in the documents, and keep the implementation aligned with them throughout development.
