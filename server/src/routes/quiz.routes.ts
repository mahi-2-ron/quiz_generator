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
import { validate } from '../middleware/validate';
import { createQuizSchema, updateQuizSchema } from '../schemas/quiz.schema';

const router = Router();

router.use(protect);
router.use(adminOnly);

router.route('/').post(validate(createQuizSchema), createQuiz).get(getQuizzes);
router
  .route('/:quizId')
  .get(getQuizById)
  .patch(validate(updateQuizSchema), updateQuiz)  // F-05: schema validates & limits update fields
  .delete(deleteQuiz);
router.patch('/:quizId/publish', publishQuiz);

export default router;
