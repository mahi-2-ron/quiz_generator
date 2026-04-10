// ---------------------------------------------------------------------------
// Domain types shared across the client
// ---------------------------------------------------------------------------

export type UserRole = 'admin' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizStatus = 'draft' | 'published' | 'archived';
export type QuestionType = 'mcq' | 'tf' | 'text';

export interface Question {
  _id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctOptionIndex?: number;
  correctBoolean?: boolean;
  correctText?: string;
  points: number;
  order: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty: QuizDifficulty;
  timerSeconds: number;
  status: QuizStatus;
  questions: Question[];
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export type RoomStatus = 'lobby' | 'live' | 'completed' | 'closed';
export type RoomMode = 'score' | 'time' | 'battle';

export interface Participant {
  userId: string;
  name: string;
  score: number;
  isConnected: boolean;
}

export interface RoomSession {
  _id: string;
  code: string;
  quizId: string | Quiz;
  hostId: string;
  mode: RoomMode;
  status: RoomStatus;
  currentQuestionIndex: number;
  participants: Participant[];
  startedAt?: string;
  endedAt?: string;
}

// ---------------------------------------------------------------------------
// API response envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
