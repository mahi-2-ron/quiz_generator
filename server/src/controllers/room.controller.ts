import { Request, Response } from 'express';
import { RoomSession } from '../models/RoomSession';
import { Quiz } from '../models/Quiz';

export const createRoom = async (req: any, res: Response) => {
  const { quizId, mode } = req.body;

  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.status !== 'published') {
    res.status(400).json({ success: false, message: 'Invalid or unpublished quiz' });
    return;
  }

  // Generate a random 6 character code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const room = await RoomSession.create({
    code,
    quizId,
    hostId: req.user!._id,
    mode: mode || 'score',
    status: 'lobby',
    participants: [],
  });

  res.status(201).json({ success: true, data: room });
};

export const getRoomByCode = async (req: any, res: Response) => {
  const room = await RoomSession.findOne({ code: req.params.code }).populate('quizId', 'title description totalPoints');

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  res.json({ success: true, data: room });
};

export const joinRoom = async (req: any, res: Response) => {
  // Usually this runs from a student trying to enter the lobby
  const room = await RoomSession.findOne({ code: req.params.code });

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (room.status !== 'lobby') {
    res.status(400).json({ success: false, message: 'Room is no longer accepting participants' });
    return;
  }

  const existingParticipant = room.participants.find(p => p.userId.toString() === req.user!._id.toString());
  if (!existingParticipant) {
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

export const updateRoomStatus = async (req: any, res: Response) => {
  const room = await RoomSession.findById(req.params.roomId);

  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (room.hostId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { status } = req.body;
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
