# SmartQuiz Pro System Design

## 1. Overview
SmartQuiz Pro is a client-server web application with a real-time quiz session layer. It consists of:
- A React frontend for admin and student experiences
- An Express API backend
- MongoDB Atlas for persistence
- Socket.IO for live room and quiz events

## 2. High-Level Architecture

```text
[ Browser Client ]
       |
       | HTTPS / REST
       v
[ React Frontend ]
       |
       | API Calls / WebSocket
       v
[ Express + Socket.IO Server ]
       |
       | Mongoose
       v
[ MongoDB Atlas ]
```

## 3. Logical Components

### Frontend
- Auth UI
- Admin dashboard
- Quiz builder
- Room lobby and session controls
- Student join flow
- Live quiz player
- Results and profile views

### Backend API
- Auth controller/service
- User service
- Quiz service
- Room/session service
- Attempt service
- Analytics service

### Real-Time Layer
- Socket authentication
- Room subscription management
- Participant presence tracking
- Host event broadcasting
- Quiz state broadcasting

### Database
- User documents
- Quiz documents with embedded questions
- Room session documents
- Attempt documents

## 4. Key Flows

### 4.1 Signup and Login Flow
1. User submits signup or login form from client.
2. Frontend sends request to `/api/v1/auth/signup` or `/api/v1/auth/login`.
3. Backend validates input.
4. Backend hashes password on signup or verifies hash on login.
5. Backend returns authenticated user and access token/session.
6. Frontend stores session and loads role-appropriate routes.

### 4.2 Admin Quiz Creation Flow
1. Admin opens quiz builder.
2. Frontend renders form and local draft state.
3. Admin submits quiz data.
4. Backend validates quiz schema.
5. Quiz document is stored in MongoDB Atlas.
6. Response returns normalized quiz object.
7. Frontend refreshes quiz list and dashboard metrics.

### 4.3 Room Creation and Lobby Flow
1. Admin selects a published quiz and creates room.
2. Backend generates unique room code and creates `RoomSession`.
3. Frontend displays room code and connects to socket namespace/room.
4. Students enter room code and join.
5. Backend validates room and registers participant.
6. Host sees joined participant list in real time.

### 4.4 Quiz Start and Live Play Flow
1. Host clicks start.
2. Backend updates room status to `live`.
3. Server emits `quiz:started` and current question payload.
4. Students answer questions in the client.
5. Client submits answers via REST or socket event.
6. Backend evaluates answer and persists attempt progress.
7. Server emits result feedback if immediate mode is enabled.
8. After final question, backend marks attempts complete and emits completion state.

### 4.5 Result and Analytics Flow
1. Final attempt data is persisted.
2. Student result page fetches attempt summary.
3. Admin analytics endpoints aggregate attempts and scores.
4. Dashboard and analytics pages render summaries and charts.

## 5. Room State Model
Room session state machine:

```text
draft -> lobby -> live -> completed -> closed
```

Rules:
- Only published quizzes can enter `lobby`.
- Students may join only while room is in `lobby`.
- Once started, room becomes `live`.
- When quiz ends, room becomes `completed`.
- Closing the room prevents new access and ends live updates.

## 6. Data Ownership
- `User` owns auth and identity data.
- `Quiz` is owned by admin user.
- `RoomSession` belongs to one host and one selected quiz.
- `Attempt` belongs to one student and one room session.

## 7. API vs Socket Responsibilities

### REST API
Use for:
- Auth
- CRUD actions
- Initial dashboard/session fetches
- Results/history fetches
- Room creation

### Socket.IO
Use for:
- Live participant joins/leaves
- Room lobby updates
- Quiz start event
- Live question progression
- Leaderboard or room state updates

## 8. Security Design
- JWT validation for protected HTTP routes.
- Socket connection must validate auth/session before joining protected channels.
- Server-generated room codes only.
- Authorization enforced on quiz ownership and room control.
- Input validation on all APIs and socket payloads.
- Rate limiting on auth and room join endpoints.

## 9. Scaling Notes
The MVP can start with a single backend instance. If traffic grows:
- Introduce Redis adapter for Socket.IO scaling.
- Add shared cache for room presence and event fan-out.
- Consider background jobs for analytics aggregation.

## 10. Reliability and Failure Handling
- If socket connection drops, client should attempt reconnection.
- On reconnection, client should request latest room state.
- Backend should persist authoritative quiz progress in the database.
- Timer logic should be server-aware for live sessions to avoid major drift.

## 11. Suggested Deployment Topology

```text
Frontend: Vercel / Netlify
Backend: Render / Railway / Fly.io
Database: MongoDB Atlas
```

Optional production additions:
- CDN for static assets
- Managed log aggregation
- Error monitoring service

## 12. Monitoring and Observability
- Capture API error logs.
- Log room lifecycle events.
- Log socket connect/disconnect events.
- Track quiz start, completion, and failure counts.

## 13. Backup and Recovery
- Use MongoDB Atlas managed backups.
- Keep seed scripts and schema migrations versioned.
- Protect against accidental destructive operations in production.

## 14. Design Constraints
- The current prototype file can guide UX behavior but should not remain the final app architecture.
- Real-time room accuracy is more important than animation complexity.
- Persistence and security take priority over cosmetic extras.

## 15. Engineering Priorities
1. Secure auth and data model integrity.
2. Stable room/session lifecycle.
3. Accurate quiz play and scoring.
4. Professional frontend implementation.
5. Analytics and deeper polish.
