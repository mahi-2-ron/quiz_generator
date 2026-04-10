import { Router } from 'express';
import { submitAnswer, completeAttempt, getMyAttempts, getAttemptById } from '../controllers/attempt.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/:roomSessionId/answers', submitAnswer);
router.post('/:roomSessionId/complete', completeAttempt);
router.get('/me', getMyAttempts);
router.get('/:attemptId', getAttemptById);

export default router;
