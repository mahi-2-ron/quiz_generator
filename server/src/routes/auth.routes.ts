import { Router } from 'express';
import { signup, login, getMe } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema } from '../schemas/auth.schema';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
