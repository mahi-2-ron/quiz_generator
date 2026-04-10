import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';

// ---------------------------------------------------------------------------
// Helper — ownership check
// ---------------------------------------------------------------------------
const isOwner = (resourceCreatedBy: unknown, userId: unknown): boolean =>
  String(resourceCreatedBy) === String(userId);

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

export const createQuiz = async (req: Request, res: Response): Promise<void> => {
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
};

export const getQuizzes = async (req: Request, res: Response): Promise<void> => {
  const quizzes = await Quiz.find({ createdBy: req.user!._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: quizzes });
};

export const getQuizById = async (req: Request, res: Response): Promise<void> => {
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
};

export const updateQuiz = async (req: Request, res: Response): Promise<void> => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  if (!isOwner(quiz.createdBy, req.user!._id)) {
    res.status(403).json({ success: false, message: 'Not authorized to update this quiz' });
    return;
  }

  Object.assign(quiz, req.body);
  await quiz.save();

  res.json({ success: true, data: quiz });
};

export const publishQuiz = async (req: Request, res: Response): Promise<void> => {
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
};

export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {
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
};
