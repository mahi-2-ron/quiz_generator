import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// F-08: DB reconnect strategy
// ---------------------------------------------------------------------------

const RECONNECT_DELAY_MS = 5000;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const attachConnectionListeners = (): void => {
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected — scheduling reconnect');
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        try {
          await mongoose.connect(process.env.MONGODB_URI!);
          logger.info('MongoDB reconnected');
        } catch (err) {
          logger.error({ err }, 'MongoDB reconnect failed');
        }
      }, RECONNECT_DELAY_MS);
    }
  });

  mongoose.connection.on('reconnected', () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    logger.info('MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });
};

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000, // F-08: fail fast on initial connect
  });

  attachConnectionListeners();

  logger.info(`MongoDB connected: ${conn.connection.host}`);
};
