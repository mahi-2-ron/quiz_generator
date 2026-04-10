import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Wraps an async Express handler and forwards any rejected promise to next(),
 * routing it through the global error handler instead of crashing the process.
 * Eliminates the need for try/catch boilerplate in every controller.
 */
export const catchAsync =
  (fn: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
