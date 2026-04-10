import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// F-12: Concrete settings interface — replaces mongoose.Schema.Types.Mixed
// ---------------------------------------------------------------------------
export interface IRoomSettings {
  showLeaderboard: boolean;
  allowLateJoin: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface IParticipantSnapshot {
  userId: mongoose.Types.ObjectId;
  name: string;
  joinedAt: Date;
  socketId?: string;
  isConnected: boolean;
  score: number;
}

export interface IRoomSession extends mongoose.Document {
  code: string;
  quizId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  mode: 'score' | 'time' | 'battle';
  status: 'lobby' | 'live' | 'completed' | 'closed';
  currentQuestionIndex: number;
  startedAt?: Date;
  endedAt?: Date;
  participants: IParticipantSnapshot[];
  settings: IRoomSettings;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new mongoose.Schema<IParticipantSnapshot>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  socketId: { type: String },
  isConnected: { type: Boolean, default: true },
  score: { type: Number, default: 0 },
});

// F-12: Typed sub-schema replaces Schema.Types.Mixed
const settingsSchema = new mongoose.Schema<IRoomSettings>(
  {
    showLeaderboard: { type: Boolean, default: true },
    allowLateJoin: { type: Boolean, default: false },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
  },
  { _id: false } // embedded sub-doc, no separate _id needed
);

const roomSessionSchema = new mongoose.Schema<IRoomSession>(
  {
    code: { type: String, required: true, unique: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mode: { type: String, enum: ['score', 'time', 'battle'], default: 'score' },
    status: { type: String, enum: ['lobby', 'live', 'completed', 'closed'], default: 'lobby' },
    currentQuestionIndex: { type: Number, default: 0 },
    startedAt: { type: Date },
    endedAt: { type: Date },
    participants: [participantSchema],
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const RoomSession = mongoose.model<IRoomSession>('RoomSession', roomSessionSchema);
