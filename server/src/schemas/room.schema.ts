import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Quiz ID'),
    mode: z.enum(['score', 'time', 'battle']).optional(),
  }),
});

export const updateRoomStatusSchema = z.object({
  params: z.object({
    roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Room ID'),
  }),
  body: z.object({
    status: z.enum(['lobby', 'live', 'completed', 'closed']),
  }),
});

export const joinRoomSchema = z.object({
  params: z.object({
    code: z.string().length(6, 'Room code must be 6 characters'),
  }),
});
