import mongoose from 'mongoose';

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  type: 'mcq' | 'tf' | 'text';
  prompt: string;
  options?: string[]; // for mcq
  correctOptionIndex?: number; // for mcq
  correctBoolean?: boolean; // for tf
  correctText?: string; // for text
  points: number;
  explanation?: string;
  mediaUrl?: string;
  order: number;
}

export interface IQuiz extends mongoose.Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timerSeconds: number;
  status: 'draft' | 'published' | 'archived';
  createdBy: mongoose.Types.ObjectId;
  questions: IQuestion[];
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new mongoose.Schema<IQuestion>({
  type: { type: String, enum: ['mcq', 'tf', 'text'], required: true },
  prompt: { type: String, required: true },
  options: [{ type: String }],
  correctOptionIndex: { type: Number },
  correctBoolean: { type: Boolean },
  correctText: { type: String },
  points: { type: Number, required: true, default: 10 },
  explanation: { type: String },
  mediaUrl: { type: String },
  order: { type: Number, required: true },
});

const quizSchema = new mongoose.Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    timerSeconds: { type: Number, required: true, default: 30 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [questionSchema],
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizSchema.pre('save', function (next: any) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }
  next();
});

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
