import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { RoomSession } from '../models/RoomSession';
import { Quiz } from '../models/Quiz';
import { catchAsync } from '../utils/catchAsync';

// ---------------------------------------------------------------------------
// Helper — F-07: cryptographically secure room code
// ---------------------------------------------------------------------------

/** Generates a 6-character uppercase hex code using crypto.randomBytes. */
const generateRoomCode = (): string =>
  randomBytes(3).toString('hex').toUpperCase();

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

export const createRoom = catchAsync(async (req: Request, res: Response) => {
  const { quizId, mode } = req.body as { quizId: string; mode?: string };

  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.status !== 'published') {
    res.status(400).json({ success: false, message: 'Quiz not found or is not published' });
    return;
  }

  const code = generateRoomCode();
  const room = await RoomSession.create({
    code,
    quizId,
    hostId: req.user!._id,
    mode: mode ?? 'score',
    status: 'lobby',
    participants: [],
  });

  res.status(201).json({ success: true, data: room });
});

export const getRoomByCode = catchAsync(async (req: Request, res: Response) => {
  const room = await RoomSession.findOne({ code: req.params.code }).populate(
    'quizId',
    'title description totalPoints'
  );

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  res.json({ success: true, data: room });
});

export const joinRoom = catchAsync(async (req: Request, res: Response) => {
  const room = await RoomSession.findOne({ code: req.params.code });

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (room.status !== 'lobby') {
    res.status(400).json({ success: false, message: 'Room is no longer accepting participants' });
    return;
  }

  const alreadyJoined = room.participants.some(
    (p) => p.userId.toString() === req.user!._id.toString()
  );

  if (!alreadyJoined) {
    room.participants.push({
      userId: req.user!._id,
      name: req.user!.name,
      joinedAt: new Date(),
      isConnected: true,
      score: 0,
    });
    await room.save();
  }

  res.json({ success: true, data: room });
});

export const updateRoomStatus = catchAsync(async (req: Request, res: Response) => {
  const room = await RoomSession.findById(req.params.roomId);

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (room.hostId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized — host only' });
    return;
  }

  const { status } = req.body as { status: string };

  if (status === 'live' && room.status === 'lobby') {
    room.status = 'live';
    room.startedAt = new Date();
  } else if (status === 'completed' || status === 'closed') {
    room.status = status;
    room.endedAt = new Date();
  }

  await room.save();
  res.json({ success: true, data: room });
});
