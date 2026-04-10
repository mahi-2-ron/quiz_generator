import { Request, Response } from 'express';
import { Attempt } from '../models/Attempt';
import { RoomSession } from '../models/RoomSession';
import { Quiz, IQuestion } from '../models/Quiz';
import { catchAsync } from '../utils/catchAsync';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AnswerValue = string | number | boolean;

const scoreAnswer = (question: IQuestion, submittedValue: AnswerValue): boolean => {
  switch (question.type) {
    case 'mcq':
      return Number(submittedValue) === question.correctOptionIndex;
    case 'tf':
      return Boolean(submittedValue) === question.correctBoolean;
    case 'text':
      return (
        String(submittedValue).trim().toLowerCase() ===
        String(question.correctText).trim().toLowerCase()
      );
    default:
      return false;
  }
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /attempts/:roomSessionId/answers
 * F-11: Rejects submissions when room is not 'live'.
 */
export const submitAnswer = catchAsync(async (req: Request, res: Response) => {
  const { roomSessionId } = req.params;
  const { questionId, submittedValue, timeTakenMs } = req.body as {
    questionId: string;
    submittedValue: AnswerValue;
    timeTakenMs?: number;
  };

  // F-11: Load room first and check status before accepting any answer
  const room = await RoomSession.findById(roomSessionId);
  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }
  if (room.status !== 'live') {
    res.status(400).json({ success: false, message: 'Room is not currently accepting answers' });
    return;
  }

  let attempt = await Attempt.findOne({ roomSessionId, studentId: req.user!._id });

  if (!attempt) {
    attempt = new Attempt({
      roomSessionId,
      quizId: room.quizId, // use the already-loaded room
      studentId: req.user!._id,
      answers: [],
      status: 'in_progress',
    });
  }

  const quiz = await Quiz.findById(attempt.quizId);
  if (!quiz) {
    res.status(404).json({ success: false, message: 'Quiz not found' });
    return;
  }

  const question = quiz.questions.find((q) => q._id!.toString() === questionId);
  if (!question) {
    res.status(404).json({ success: false, message: 'Question not found' });
    return;
  }

  const alreadyAnswered = attempt.answers.some(
    (a) => a.questionId.toString() === questionId
  );
  if (alreadyAnswered) {
    res.status(409).json({ success: false, message: 'Answer already submitted for this question' });
    return;
  }

  const isCorrect = scoreAnswer(question, submittedValue);
  const pointsAwarded = isCorrect ? (question.points ?? 10) : 0;

  attempt.answers.push({
    questionId: question._id!,
    submittedValue,
    isCorrect,
    pointsAwarded,
    timeTakenMs: timeTakenMs ?? 0,
  });

  attempt.score += pointsAwarded;
  if (isCorrect) {
    attempt.correctCount += 1;
  } else {
    attempt.wrongCount += 1;
  }

  await attempt.save();

  res.json({ success: true, data: { isCorrect, pointsAwarded } });
});

export const completeAttempt = catchAsync(async (req: Request, res: Response) => {
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
});

export const getMyAttempts = catchAsync(async (req: Request, res: Response) => {
  const attempts = await Attempt.find({ studentId: req.user!._id }).populate(
    'quizId',
    'title description totalPoints'
  );
  res.json({ success: true, data: attempts });
});

export const getAttemptById = catchAsync(async (req: Request, res: Response) => {
  const attempt = await Attempt.findById(req.params.attemptId).populate('quizId');
  if (!attempt) {
    res.status(404).json({ success: false, message: 'Attempt not found' });
    return;
  }

  const isOwner = attempt.studentId.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({ success: false, message: 'Not authorized to view this attempt' });
    return;
  }

  res.json({ success: true, data: attempt });
});
