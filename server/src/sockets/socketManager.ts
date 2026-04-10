import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { RoomSession } from '../models/RoomSession';

interface CustomSocket extends Socket {
  roomCode?: string;
  role?: string;
}

export function configureSockets(httpServer: HttpServer) {
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ];

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: CustomSocket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a room (Host or Student)
    socket.on('room:join', async ({ code, role, userId, name }) => {
      try {
        const room = await RoomSession.findOne({ code, status: { $in: ['lobby', 'live'] } });
        if (!room) return socket.emit('error', { message: 'Room not found or not active.' });
        
        socket.join(code);
        
        // Store session context on socket
        socket.roomCode = code;
        socket.role = role; 

        if (role === 'student') {
          // Check if already in participants list
          const exists = room.participants.find(p => p.userId === userId || p.socketId === socket.id);
          if (!exists) {
            room.participants.push({
               userId: userId || socket.id, 
               name: name || 'Guest', 
               socketId: socket.id, 
               joinedAt: new Date(), 
               isConnected: true,
               score: 0 
            });
            await room.save();
            io.to(code).emit('room:participant-joined', { userId: userId || socket.id, name: name || 'Guest' });
          }
        } else if (role === 'host') {
           // Host joined
           await room.save();
        }
      } catch (err) {
        console.error('Socket join error:', err);
      }
    });

    // Start Quiz
    socket.on('room:host:start', async ({ code }) => {
       const room = await RoomSession.findOne({ code });
       if (!room) return;
       room.status = 'live';
       room.startedAt = new Date();
       
       // Let's assume we start with the first question
       io.to(code).emit('room:started', { message: 'Quiz is starting now!' });
       io.to(code).emit('room:next-question', { questionIndex: 0 }); // MVP simplistic implementation
       
       await room.save();
    });

    // Next Question
    socket.on('room:host:next', async ({ code, nextIndex }) => {
       io.to(code).emit('room:next-question', { questionIndex: nextIndex });
    });

    // End Quiz
    socket.on('room:host:end', async ({ code }) => {
       const room = await RoomSession.findOne({ code });
       if (!room) return;
       room.status = 'completed';
       room.endedAt = new Date();
       await room.save();
       io.to(code).emit('room:ended', { message: 'Quiz has finished' });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const code = socket.roomCode;
      
      if (code) {
        const room = await RoomSession.findOne({ code });
        if (room) {
           // Technically we could remove or mark participant as disconnected
           const participantIndex = room.participants.findIndex(p => p.socketId === socket.id);
           if (participantIndex > -1) {
             const participant = room.participants[participantIndex];
             // room.participants.splice(participantIndex, 1);
             // await room.save();
             io.to(code).emit('room:participant-left', { userId: participant.userId });
           }
        }
      }
    });
  });

  return io;
}
