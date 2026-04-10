import dotenv from 'dotenv';
dotenv.config();

process.on('uncaughtException', (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

import http from 'http';
import app from './app';
import { connectDB } from './db/connect';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

import { configureSockets } from './sockets/socketManager';

export const io = configureSockets(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error("DB Connect error:", err);
});
