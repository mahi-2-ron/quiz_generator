import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (result.success) {
      const data = result.data as any;
      if (data.body) req.body = data.body;
      if (data.query) req.query = data.query;
      if (data.params) req.params = data.params;
      next();
      return;
    }

    const errors = (result.error as ZodError).issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  };
