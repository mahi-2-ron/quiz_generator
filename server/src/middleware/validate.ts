import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal Server Error' });
      return;
    }
  };
};
