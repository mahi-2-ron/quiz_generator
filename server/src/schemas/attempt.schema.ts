import { z } from 'zod';

export const submitAnswerSchema = z.object({
  params: z.object({
    roomSessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Room Session ID'),
  }),
  body: z.object({
    questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Question ID'),
    submittedValue: z.union([z.string(), z.number(), z.boolean()]),
    timeTakenMs: z.number().int().min(0).optional(),
  }),
});

export const completeAttemptSchema = z.object({
  params: z.object({
    roomSessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Room Session ID'),
  }),
});

export const getAttemptByIdSchema = z.object({
  params: z.object({
    attemptId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Attempt ID'),
  }),
});
