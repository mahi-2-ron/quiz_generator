import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';
import { catchAsync } from '../utils/catchAsync';
import type { UpdateQuizBody } from '../schemas/quiz.schema';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const isOwner = (resourceCreatedBy: unknown, userId: unknown): boolean =>
  String(resourceCreatedBy) === String(userId);

/** Permitted fields for update — explicitly excludes createdBy, status, totalPoints (F-05) */
const pickUpdateFields = (body: UpdateQuizBody) => ({
  ...(body.title !== undefined && { title: body.title }),
  ...(body.description !== undefined && { description: body.description }),
  ...(body.category !== undefined && { category: body.category }),
  ...(body.difficulty !== undefined && { difficulty: body.difficulty }),
  ...(body.timerSeconds !== undefined && { timerSeconds: body.timerSeconds }),
  ...(body.questions !== undefined && { questions: body.questions }),
});

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

export const createQuiz = catchAsync(async (req: Request, res: Response) => {
  const { title, description, category, difficulty, timerSeconds, questions } = req.body;

  const quiz = await Quiz.create({
    title,
    description,
    category,
    difficulty,
    timerSeconds,
    status: 'draft',
    createdBy: req.user!._id,
    questions: questions ?? [],
  });

  res.status(201).json({ success: true, data: quiz });
});

export const getQuizzes = catchAsync(async (req: Request, res: Response) => {
  const quizzes = await Quiz.find({ createdBy: req.user!._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: quizzes });
});

export const getQuizById = catchAsync(async (req: Request, res: Response) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  if (!isOwner(quiz.createdBy, req.user!._id)) {
    res.status(403).json({ success: false, message: 'Not authorized to view this quiz' });
    return;
  }

  res.json({ success: true, data: quiz });
});

/**
 * PATCH /quizzes/:quizId
 * F-05: Only permitted fields are applied — never Object.assign(quiz, req.body).
 */
export const updateQuiz = catchAsync(async (req: Request, res: Response) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  if (!isOwner(quiz.createdBy, req.user!._id)) {
    res.status(403).json({ success: false, message: 'Not authorized to update this quiz' });
    return;
  }

  const safeFields = pickUpdateFields(req.body as UpdateQuizBody);
  Object.assign(quiz, safeFields);
  await quiz.save();

  res.json({ success: true, data: quiz });
});

export const publishQuiz = catchAsync(async (req: Request, res: Response) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  if (!isOwner(quiz.createdBy, req.user!._id)) {
    res.status(403).json({ success: false, message: 'Not authorized to publish this quiz' });
    return;
  }

  if (quiz.questions.length === 0) {
    res.status(400).json({ success: false, message: 'Cannot publish a quiz with no questions' });
    return;
  }

  quiz.status = 'published';
  await quiz.save();

  res.json({ success: true, data: quiz });
});

export const deleteQuiz = catchAsync(async (req: Request, res: Response) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  if (!isOwner(quiz.createdBy, req.user!._id)) {
    res.status(403).json({ success: false, message: 'Not authorized to delete this quiz' });
    return;
  }

  await quiz.deleteOne();

  res.json({ success: true, message: 'Quiz deleted successfully' });
});
