import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/error';
import authRoutes from './routes/auth.routes';
import quizRoutes from './routes/quiz.routes';
import roomRoutes from './routes/room.routes';
import attemptRoutes from './routes/attempt.routes';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL ?? 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175', // accommodate Vite port shifting in dev
];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

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
