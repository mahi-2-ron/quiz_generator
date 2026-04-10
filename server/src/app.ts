import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/error';
import authRoutes from './routes/auth.routes';
import quizRoutes from './routes/quiz.routes';
import roomRoutes from './routes/room.routes';
import attemptRoutes from './routes/attempt.routes';
import { ALLOWED_ORIGINS } from './config'; // F-10: single authoritative list

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser()); // required for reading httpOnly refresh token cookie (F-03)

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/attempts', attemptRoutes);

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Error handling (must be last)
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

export default app;
