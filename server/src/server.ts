import dotenv from 'dotenv';
dotenv.config();

// ---------------------------------------------------------------------------
// F-01: Startup assertion — fail fast if NODE_ENV is unset
// Without this, the app runs in an ambiguous state where dev-only code paths
// could inadvertently activate in production.
// ---------------------------------------------------------------------------
if (!process.env.NODE_ENV) {
  console.error(
    '[FATAL] NODE_ENV environment variable is not set.\n' +
      'Set it to "production" or "development" before starting the server.'
  );
  process.exit(1);
}

import http from 'http';
import app from './app';
import { connectDB } from './db/connect';
import { configureSockets } from './sockets/socketManager';
import { logger } from './utils/logger';
import { PORT } from './config';

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception — shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection — shutting down');
  process.exit(1);
});

const server = http.createServer(app);

export const io = configureSockets(server);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    logger.error({ err }, 'Failed to connect to database');
    process.exit(1);
  });
