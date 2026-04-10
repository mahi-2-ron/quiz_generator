import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.status ?? 500);

  logger.error({ err, path: req.path, method: req.method }, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404);
  next(new Error(`Not Found — ${req.originalUrl}`));
};
