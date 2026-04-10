import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { catchAsync } from '../utils/catchAsync';
import { IS_PRODUCTION } from '../config';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_SALT_ROUNDS = 10;
const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN ?? '1d';
const REFRESH_TOKEN_TTL_DAYS = 7;

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'strict' as const,
  maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured');
  return jwt.sign({ id: userId }, secret, {
    expiresIn: ACCESS_TOKEN_TTL as Parameters<typeof jwt.sign>[2] extends { expiresIn?: infer E } ? E : string,
  });
};

const issueRefreshToken = async (userId: string): Promise<string> => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ tokenHash, userId, expiresAt });
  return rawToken;
};

const buildUserPayload = (user: { _id: unknown; name: string; email: string; role: string }) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /auth/signup
 * F-02: role is always 'student' — never accepted from the request body.
 */
export const signup = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with that email already exists' });
    return;
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? String(DEFAULT_SALT_ROUNDS), 10);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Role is ALWAYS 'student' on self-registration.
  // Use PATCH /auth/users/:id/role to promote accounts (admin-only).
  const user = await User.create({ name, email, passwordHash, role: 'student' });

  const accessToken = generateAccessToken(user._id.toString());
  const rawRefreshToken = await issueRefreshToken(user._id.toString());

  res.cookie('refreshToken', rawRefreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({
    success: true,
    message: 'Sign up successful',
    data: {
      user: buildUserPayload(user),
      accessToken,
    },
  });
});

/**
 * POST /auth/login
 * F-01: dev bypass removed entirely. Seed the DB for test accounts instead.
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // Use an identical message for both cases to prevent user enumeration
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id.toString());
  const rawRefreshToken = await issueRefreshToken(user._id.toString());

  res.cookie('refreshToken', rawRefreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: buildUserPayload(user),
      accessToken,
    },
  });
});

/**
 * POST /auth/refresh
 * F-03: Issues a new access token using a valid httpOnly refresh token.
 * Implements rotation — old token is deleted and a new one is issued.
 */
export const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
  const rawToken: string | undefined = req.cookies?.refreshToken;
  if (!rawToken) {
    res.status(401).json({ success: false, message: 'No refresh token provided' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const storedToken = await RefreshToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!storedToken) {
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.status(401).json({ success: false, message: 'Refresh token invalid or expired' });
    return;
  }

  // Rotate: delete the used token, issue a new one
  await storedToken.deleteOne();
  const newRawToken = await issueRefreshToken(storedToken.userId.toString());
  res.cookie('refreshToken', newRawToken, REFRESH_COOKIE_OPTIONS);

  const accessToken = generateAccessToken(storedToken.userId.toString());
  res.json({ success: true, data: { accessToken } });
});

/**
 * POST /auth/logout
 * F-03: Revokes the refresh token immediately (not just clearing the cookie).
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  const rawToken: string | undefined = req.cookies?.refreshToken;
  if (rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await RefreshToken.deleteOne({ tokenHash });
  }
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /auth/me
 */
export const getMe = catchAsync(async (req: Request, res: Response) => {
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
});

/**
 * PATCH /auth/users/:userId/role
 * F-02: Admin-only endpoint for role promotion — the only legitimate way to create admins.
 */
export const promoteUserRole = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body as { role: 'admin' | 'student' };

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, select: '-passwordHash', runValidators: true }
  );

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, data: { user } });
});
