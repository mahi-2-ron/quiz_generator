import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';

export const createQuiz = async (req: any, res: Response) => {
  const { title, description, category, difficulty, timerSeconds, questions } = req.body;

  const quiz = new Quiz({
    title,
    description,
    category,
    difficulty,
    timerSeconds,
    status: 'draft',
    createdBy: req.user!._id,
    questions: questions || [],
  });

  await quiz.save();

  res.status(201).json({ success: true, data: quiz });
};

export const getQuizzes = async (req: any, res: Response) => {
  const quizzes = await Quiz.find({ createdBy: req.user!._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: quizzes });
};

export const getQuizById = async (req: any, res: Response) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  // Ensure user owns it
  if (quiz.createdBy.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized to view this quiz' });
    return;
  }

  res.json({ success: true, data: quiz });
};

export const updateQuiz = async (req: any, res: Response) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  if (quiz.createdBy.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized to update this quiz' });
    return;
  }

  const updatedFields = req.body;
  Object.assign(quiz, updatedFields);
  await quiz.save();

  res.json({ success: true, data: quiz });
};

export const publishQuiz = async (req: any, res: Response) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  if (quiz.createdBy.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return;
  }

  // Basic validation before publishing
  if (quiz.questions.length === 0) {
    res.status(400).json({ success: false, message: 'Cannot publish a quiz with 0 questions' });
    return;
  }

  quiz.status = 'published';
  await quiz.save();

  res.json({ success: true, data: quiz });
};

export const deleteQuiz = async (req: any, res: Response) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  if (quiz.createdBy.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized to delete this quiz' });
    return;
  }

  await quiz.deleteOne();

  res.json({ success: true, message: 'Quiz removed' });
};
