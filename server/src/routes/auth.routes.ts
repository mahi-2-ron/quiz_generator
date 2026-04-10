import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  signup,
  login,
  refreshAccessToken,
  logout,
  getMe,
  promoteUserRole,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, promoteRoleSchema } from '../schemas/auth.schema';
import { protect, adminOnly } from '../middleware/auth';

// ---------------------------------------------------------------------------
// F-09: Rate limiting — 10 attempts per 15 minutes per IP on auth endpoints
// ---------------------------------------------------------------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts — please try again later' },
});

const router = Router();

// Public routes with rate limiting
router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, refreshAccessToken);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

// Admin-only: role promotion (F-02)
router.patch('/users/:userId/role', protect, adminOnly, validate(promoteRoleSchema), promoteUserRole);

export default router;
