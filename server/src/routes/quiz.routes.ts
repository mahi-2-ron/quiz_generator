import { Router } from 'express';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  publishQuiz,
  deleteQuiz,
} from '../controllers/quiz.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(adminOnly);

router.route('/').post(createQuiz).get(getQuizzes);
router.route('/:quizId').get(getQuizById).patch(updateQuiz).delete(deleteQuiz);
router.patch('/:quizId/publish', publishQuiz);

export default router;
