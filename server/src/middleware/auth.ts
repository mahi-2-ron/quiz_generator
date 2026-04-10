import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured');

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      return;
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Forbidden — admin access required' });
  }
};
