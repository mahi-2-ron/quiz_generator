import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const protect = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        return;
      }
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
    return;
  }
};

export const adminOnly = (req: any, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    return;
  }
};
