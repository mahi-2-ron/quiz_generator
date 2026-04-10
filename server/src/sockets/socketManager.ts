import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { RoomSession } from '../models/RoomSession';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { ALLOWED_ORIGINS } from '../config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
  roomCode?: string;
}

interface JwtPayload {
  id: string;
}

interface JoinPayload {
  code: string;
  role: 'host' | 'student';
}

interface CodePayload {
  code: string;
}

interface NextPayload {
  code: string;
  nextIndex: number;
}

// ---------------------------------------------------------------------------
// Socket Manager
// ---------------------------------------------------------------------------

export function configureSockets(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS, // F-10: single source from config
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // -------------------------------------------------------------------------
  // F-04: Authenticate every socket on handshake using the access JWT
  // -------------------------------------------------------------------------
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) return next(new Error('Server misconfiguration'));

      const decoded = jwt.verify(token, secret) as JwtPayload;
      const user = await User.findById(decoded.id).select('_id name');
      if (!user) return next(new Error('User not found'));

      (socket as AuthenticatedSocket).userId = user._id.toString();
      (socket as AuthenticatedSocket).userName = user.name;

      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    logger.debug({ socketId: socket.id, userId: socket.userId }, 'Socket connected');

    // -----------------------------------------------------------------------
    // Join room
    // -----------------------------------------------------------------------
    socket.on('room:join', async ({ code, role }: JoinPayload) => {
      try {
        const room = await RoomSession.findOne({ code, status: { $in: ['lobby', 'live'] } });
        if (!room) {
          socket.emit('error', { message: 'Room not found or not active.' });
          return;
        }

        socket.join(code);
        socket.roomCode = code;

        if (role === 'student') {
          const userId = socket.userId!;
          const alreadyInRoom = room.participants.some(
            (p) => String(p.userId) === userId || p.socketId === socket.id
          );

          if (!alreadyInRoom) {
            room.participants.push({
              userId: userId as unknown as any,
              name: socket.userName ?? 'Guest',
              socketId: socket.id,
              joinedAt: new Date(),
              isConnected: true,
              score: 0,
            });
            await room.save();
            io.to(code).emit('room:participant-joined', {
              userId,
              name: socket.userName ?? 'Guest',
            });
          }
        }
      } catch (err) {
        logger.error({ err, code }, 'Error handling room:join');
      }
    });

    // -----------------------------------------------------------------------
    // Host: start quiz — F-04: verified against room.hostId
    // -----------------------------------------------------------------------
    socket.on('room:host:start', async ({ code }: CodePayload) => {
      try {
        const room = await RoomSession.findOne({ code });
        if (!room) return;

        // F-04: ensure the emitting socket is the actual host
        if (socket.userId !== room.hostId.toString()) {
          socket.emit('error', { message: 'Not authorised: host only action.' });
          return;
        }

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
    // Host: advance — F-04: verified against room.hostId
    // -----------------------------------------------------------------------
    socket.on('room:host:next', async ({ code, nextIndex }: NextPayload) => {
      try {
        const room = await RoomSession.findOne({ code });
        if (!room) return;

        if (socket.userId !== room.hostId.toString()) {
          socket.emit('error', { message: 'Not authorised: host only action.' });
          return;
        }

        io.to(code).emit('room:next-question', { questionIndex: nextIndex });
      } catch (err) {
        logger.error({ err, code }, 'Error handling room:host:next');
      }
    });

    // -----------------------------------------------------------------------
    // Host: end quiz — F-04: verified against room.hostId
    // -----------------------------------------------------------------------
    socket.on('room:host:end', async ({ code }: CodePayload) => {
      try {
        const room = await RoomSession.findOne({ code });
        if (!room) return;

        if (socket.userId !== room.hostId.toString()) {
          socket.emit('error', { message: 'Not authorised: host only action.' });
          return;
        }

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
