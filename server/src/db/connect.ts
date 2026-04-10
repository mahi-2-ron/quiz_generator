import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const conn = await mongoose.connect(uri);
  logger.info(`MongoDB connected: ${conn.connection.host}`);
};
