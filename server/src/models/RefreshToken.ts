import mongoose from 'mongoose';

export interface IRefreshToken extends mongoose.Document {
  tokenHash: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// MongoDB TTL index — automatically deletes expired documents
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
