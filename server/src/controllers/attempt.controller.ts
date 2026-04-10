import { Request, Response } from 'express';
import { Attempt } from '../models/Attempt';
import { RoomSession } from '../models/RoomSession';
import { Quiz } from '../models/Quiz';

export const submitAnswer = async (req: any, res: Response) => {
  const { roomSessionId } = req.params;
  const { questionId, submittedValue, timeTakenMs } = req.body;

  let attempt = await Attempt.findOne({ roomSessionId, studentId: req.user!._id });

  if (!attempt) {
    const room = await RoomSession.findById(roomSessionId);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }
    attempt = new Attempt({
      roomSessionId,
      quizId: room.quizId,
      studentId: req.user!._id,
      answers: [],
      status: 'in_progress',
    });
  }

  // Load quiz to check answer
  const quiz = await Quiz.findById(attempt.quizId);
  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  const question = quiz.questions.find((q: any) => q._id.toString() === questionId);
  if (!question) {
    res.status(404).json({ success: false, message: 'Question not found' });
    return;
  }

  let isCorrect = false;
  if (question.type === 'mcq') {
    isCorrect = Number(submittedValue) === question.correctOptionIndex;
  } else if (question.type === 'tf') {
    isCorrect = Boolean(submittedValue) === question.correctBoolean;
  } else if (question.type === 'text') {
    // Simple text match
    isCorrect = String(submittedValue).trim().toLowerCase() === String(question.correctText).trim().toLowerCase();
  }

  const pointsAwarded = isCorrect ? question.points || 10 : 0;

  // Check if answer already exists
  const existingAnswerIndex = attempt.answers.findIndex((a: any) => a.questionId.toString() === questionId);
  if (existingAnswerIndex !== -1) {
    res.status(400).json({ success: false, message: 'Answer already submitted for this question' });
    return;
  }

  attempt.answers.push({
    questionId: question._id!,
    submittedValue,
    isCorrect,
    pointsAwarded,
    timeTakenMs: timeTakenMs || 0,
  });

  attempt.score += pointsAwarded;
  if (isCorrect) attempt.correctCount += 1;
  else attempt.wrongCount += 1;

  await attempt.save();

  res.json({ success: true, data: { isCorrect, pointsAwarded } });
};

export const completeAttempt = async (req: any, res: Response) => {
  const { roomSessionId } = req.params;

  const attempt = await Attempt.findOne({ roomSessionId, studentId: req.user!._id });
  if (!attempt) {
    res.status(404).json({ success: false, message: 'Attempt not found' });
    return;
  }

  attempt.status = 'completed';
  attempt.completedAt = new Date();
  await attempt.save();

  res.json({ success: true, data: attempt });
};

export const getMyAttempts = async (req: any, res: Response) => {
  const attempts = await Attempt.find({ studentId: req.user!._id }).populate('quizId', 'title description totalPoints');
  res.json({ success: true, data: attempts });
};

export const getAttemptById = async (req: any, res: Response) => {
  const attempt = await Attempt.findById(req.params.attemptId).populate('quizId');
  if (!attempt) {
    res.status(404).json({ success: false, message: 'Attempt not found' });
    return;
  }

  if (attempt.studentId.toString() !== req.user!._id.toString()) {
    // Check if admin? Admins can view it but maybe restrict simple student endpoint
    if (req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
  }

  res.json({ success: true, data: attempt });
};
