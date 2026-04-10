import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_SALT_ROUNDS = 10;
const DEFAULT_TOKEN_TTL = '30d';

const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured');

  return jwt.sign({ id: userId }, secret, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? DEFAULT_TOKEN_TTL) as any,
  });
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'student';
  };

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with that email already exists' });
    return;
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? String(DEFAULT_SALT_ROUNDS), 10);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await User.create({ name, email, passwordHash, role: role ?? 'student' });

  res.status(201).json({
    success: true,
    message: 'Sign up successful',
    data: {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken: generateAccessToken(user._id.toString()),
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email });

  // ------------------------------------------------------------------
  // Development-only bypass: allow any credentials when no DB user exists.
  // This is intentionally guarded behind NODE_ENV === 'development'.
  // ------------------------------------------------------------------
  if (!user && process.env.NODE_ENV === 'development') {
    const devUser = {
      _id: '000000000000000000000000',
      name: 'Dev Demo User',
      email,
      role: 'admin' as const,
    };
    res.json({
      success: true,
      message: 'Login successful (dev mode)',
      data: {
        user: devUser,
        accessToken: generateAccessToken(devUser._id),
      },
    });
    return;
  }

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken: generateAccessToken(user._id.toString()),
    },
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, data: { user } });
};
