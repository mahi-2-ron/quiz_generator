# Antigravity Quiz Generator

A "Top 1%" quality, full-stack real-time quiz platform built with clean architecture, strict TypeScript typing, and industry-standard security.

## 🚀 Features

- **Real-time Engine**: Powered by Socket.io for micro-latency quiz sessions.
- **Admin Dashboard**: Create, publish, and manage quizzes with a powerful Quiz Builder.
- **Live Rooms**: Host rooms with 6-character hex codes; control flow (Start/Next/End) in real-time.
- **Student Experience**: Join rooms instantly, submit answers, and see live results.
- **AI-Ready**: Integrated structure for AI-powered quiz generation.
- **Accessibility (A11y)**: Fully semantic HTML with ARIA roles, high-contrast support, and keyboard navigation.

## 🛠️ Technology Stack

### Backend (`/server`)
- **Core**: Node.js, Express 5
- **Database**: MongoDB + Mongoose 9
- **Real-time**: Socket.io 4
- **Security**: JWT (Access + Refresh Rotation), Bcrypt, Express Rate Limit
- **Validation**: Zod (Runtime schema enforcement)
- **Logging**: Pino (Structured JSON logging)
- **Language**: TypeScript 6 (Node16 Module System)

### Frontend (`/client`)
- **Core**: React 19, Vite 8
- **State**: Zustand (Atomic store management)
- **Data Fetching**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Styling**: Vanilla CSS (Custom "Antigravity" tokens) + Lucide Icons
- **Performance**: Route-based code splitting (React.lazy)

## 🔐 Security Standards (Audit Grade)

This codebase has passed a rigorous 14-point security audit:
- **Refresh Token Rotation**: Self-healing, revocable sessions with httpOnly cookies.
- **Socket Authentication**: Every socket handshake is verified against JWT; host events are strictly isolated.
- **Mass Assignment Protection**: Route-level schema validation prevents overwriting protected DB fields.
- **Rate Limiting**: Brute-force protection on all authentication endpoints.
- **Fail-Fast Startup**: Server refuses to boot if `NODE_ENV` or critical secrets are missing.
- **Safe State**: `useRef` based socket management to prevent stale-closure memory leaks.

## 🏁 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB instance (Atlas or local)

### 1. Clone & Setup
```bash
git clone https://github.com/mahi-2-ron/quiz_generator.git
cd quiz_generator
```

### 2. Backend Configuration
Navigate to `/server` and create a `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_ACCESS_EXPIRES_IN=15m
BCRYPT_SALT_ROUNDS=10
CORS_ORIGINS=http://localhost:5173
```
Running the backend:
```bash
cd server
npm install
npm run dev
```

### 3. Frontend Configuration
Navigate to `/client` and create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```
Running the frontend:
```bash
cd client
npm install
npm run dev
```

## 🏗️ Architecture

The project follows a modular controller-service-route pattern:
- **Middleware-First**: All requests pass through `validate()` (Zod) and `protect()` (JWT) before reaching business logic.
- **Shared Types**: Centralized domain types in `client/src/types` to ensure frontend-backend sync.
- **Async Handling**: Custom `catchAsync` wrapper ensures zero unhandled rejections.

## 📄 License
MIT
