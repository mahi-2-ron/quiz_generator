import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { RoomSession } from '../models/RoomSession';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoomSocket extends Socket {
  roomCode?: string;
  role?: 'host' | 'student';
}

interface JoinPayload {
  code: string;
  role: 'host' | 'student';
  userId?: string;
  name?: string;
}

interface CodePayload {
  code: string;
}

interface NextPayload {
  code: string;
  nextIndex: number;
}

// ---------------------------------------------------------------------------
// CORS origins (must mirror app.ts)
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL ?? 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

// ---------------------------------------------------------------------------
// Socket Manager
// ---------------------------------------------------------------------------

export function configureSockets(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as RoomSocket;
    logger.debug({ socketId: socket.id }, 'Socket connected');

    // -----------------------------------------------------------------------
    // Join room (host or student)
    // -----------------------------------------------------------------------
    socket.on('room:join', async ({ code, role, userId, name }: JoinPayload) => {
      try {
        const room = await RoomSession.findOne({ code, status: { $in: ['lobby', 'live'] } });
        if (!room) {
          socket.emit('error', { message: 'Room not found or not active.' });
          return;
        }

        socket.join(code);
        socket.roomCode = code;
        socket.role = role;

        if (role === 'student') {
          const effectiveUserId = userId ?? socket.id;
          const alreadyInRoom = room.participants.some(
            (p) => String(p.userId) === effectiveUserId || p.socketId === socket.id
          );

          if (!alreadyInRoom) {
            room.participants.push({
              userId: effectiveUserId as any,
              name: name ?? 'Guest',
              socketId: socket.id,
              joinedAt: new Date(),
              isConnected: true,
              score: 0,
            });
            await room.save();
            io.to(code).emit('room:participant-joined', {
              userId: effectiveUserId,
              name: name ?? 'Guest',
            });
          }
        }
        // Host joining requires no extra persistence — just socket room membership
      } catch (err) {
        logger.error({ err, code }, 'Error handling room:join');
      }
    });

    // -----------------------------------------------------------------------
    // Host: start quiz
    // -----------------------------------------------------------------------
    socket.on('room:host:start', async ({ code }: CodePayload) => {
      try {
        const room = await RoomSession.findOne({ code });
        if (!room) return;

        room.status = 'live';
        room.startedAt = new Date();
        await room.save();

        io.to(code).emit('room:started', { message: 'Quiz is starting now!' });
        io.to(code).emit('room:next-question', { questionIndex: 0 });
      } catch (err) {
        logger.error({ err, code }, 'Error handling room:host:start');
      }
    });

    // -----------------------------------------------------------------------
    // Host: advance to next question
    // -----------------------------------------------------------------------
    socket.on('room:host:next', ({ code, nextIndex }: NextPayload) => {
      io.to(code).emit('room:next-question', { questionIndex: nextIndex });
    });

    // -----------------------------------------------------------------------
    // Host: end quiz
    // -----------------------------------------------------------------------
    socket.on('room:host:end', async ({ code }: CodePayload) => {
      try {
        const room = await RoomSession.findOne({ code });
        if (!room) return;

        room.status = 'completed';
        room.endedAt = new Date();
        await room.save();

        io.to(code).emit('room:ended', { message: 'Quiz has finished' });
      } catch (err) {
        logger.error({ err, code }, 'Error handling room:host:end');
      }
    });

    // -----------------------------------------------------------------------
    // Disconnect
    // -----------------------------------------------------------------------
    socket.on('disconnect', async () => {
      logger.debug({ socketId: socket.id }, 'Socket disconnected');
      const { roomCode } = socket;
      if (!roomCode) return;

      try {
        const room = await RoomSession.findOne({ code: roomCode });
        if (!room) return;

        const participant = room.participants.find((p) => p.socketId === socket.id);
        if (participant) {
          io.to(roomCode).emit('room:participant-left', { userId: participant.userId });
        }
      } catch (err) {
        logger.error({ err, roomCode }, 'Error handling disconnect');
      }
    });
  });

  return io;
}
