import { Router } from 'express';
import { submitAnswer, completeAttempt, getMyAttempts, getAttemptById } from '../controllers/attempt.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { submitAnswerSchema, completeAttemptSchema, getAttemptByIdSchema } from '../schemas/attempt.schema';

const router = Router();

router.use(protect);

router.post('/:roomSessionId/answers', validate(submitAnswerSchema), submitAnswer);
router.post('/:roomSessionId/complete', validate(completeAttemptSchema), completeAttempt);
router.get('/me', getMyAttempts);
router.get('/:attemptId', validate(getAttemptByIdSchema), getAttemptById);

export default router;
