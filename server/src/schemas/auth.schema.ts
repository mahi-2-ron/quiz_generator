import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z.string().min(8),
    // role is intentionally excluded — new users are always 'student'.
    // Admins are promoted via PATCH /api/v1/auth/users/:id/role (admin-only).
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const promoteRoleSchema = z.object({
  body: z.object({
    role: z.enum(['admin', 'student']),
  }),
});
