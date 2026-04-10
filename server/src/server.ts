import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './db/connect';
import { configureSockets } from './sockets/socketManager';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 5000;

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
        `Server running in ${process.env.NODE_ENV ?? 'development'} mode on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    logger.error({ err }, 'Failed to connect to database');
    process.exit(1);
  });
