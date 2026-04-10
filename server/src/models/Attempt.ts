import mongoose from 'mongoose';

export interface IAnswerItem {
  questionId: mongoose.Types.ObjectId;
  submittedValue: string | boolean | number;
  isCorrect: boolean;
  pointsAwarded: number;
  timeTakenMs: number;
}

export interface IAttempt extends mongoose.Document {
  roomSessionId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IAnswerItem[];
  score: number;
  correctCount: number;
  wrongCount: number;
  rank?: number;
  status: 'in_progress' | 'submitted' | 'timed_out' | 'completed';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerItemSchema = new mongoose.Schema<IAnswerItem>({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  submittedValue: { type: mongoose.Schema.Types.Mixed },
  isCorrect: { type: Boolean, required: true },
  pointsAwarded: { type: Number, required: true, default: 0 },
  timeTakenMs: { type: Number, default: 0 },
});

const attemptSchema = new mongoose.Schema<IAttempt>(
  {
    roomSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomSession', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [answerItemSchema],
    score: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    rank: { type: Number },
    status: { type: String, enum: ['in_progress', 'submitted', 'timed_out', 'completed'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Attempt = mongoose.model<IAttempt>('Attempt', attemptSchema);
