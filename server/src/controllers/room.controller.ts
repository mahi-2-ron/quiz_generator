import { Request, Response } from 'express';
import { RoomSession } from '../models/RoomSession';
import { Quiz } from '../models/Quiz';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const generateRoomCode = (): string =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

export const createRoom = async (req: Request, res: Response): Promise<void> => {
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
};

export const getRoomByCode = async (req: Request, res: Response): Promise<void> => {
  const room = await RoomSession.findOne({ code: req.params.code }).populate(
    'quizId',
    'title description totalPoints'
  );

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  res.json({ success: true, data: room });
};

export const joinRoom = async (req: Request, res: Response): Promise<void> => {
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
};

export const updateRoomStatus = async (req: Request, res: Response): Promise<void> => {
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
};
