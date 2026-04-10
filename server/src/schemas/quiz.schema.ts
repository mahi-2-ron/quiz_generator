import { z } from 'zod';

const questionBodySchema = z.object({
  type: z.enum(['mcq', 'tf', 'text']),
  prompt: z.string().min(1).max(1000),
  options: z.array(z.string().max(500)).optional(),
  correctOptionIndex: z.number().int().min(0).optional(),
  correctBoolean: z.boolean().optional(),
  correctText: z.string().max(500).optional(),
  points: z.number().int().min(1).max(1000),
  order: z.number().int().min(0),
});

// Fields allowed on create
export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    category: z.string().max(100).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    timerSeconds: z.number().int().min(5).max(300).optional(),
    questions: z.array(questionBodySchema).optional(),
  }),
});

// Only the mutable subset — protected fields (createdBy, status, totalPoints) are excluded
export const updateQuizSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    category: z.string().max(100).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    timerSeconds: z.number().int().min(5).max(300).optional(),
    questions: z.array(questionBodySchema).optional(),
  }),
});

export type UpdateQuizBody = z.infer<typeof updateQuizSchema>['body'];
