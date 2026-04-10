import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { type AxiosError } from 'axios';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import ConfettiBackground from '../../components/ConfettiBackground';
import type { ApiResponse, User } from '../../types';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Login() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'student'>('admin');

  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    try {
      const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>(
        '/auth/login',
        data
      );
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/profile', { replace: true });
    } catch (err) {
      const message =
        (err as AxiosError<{ message: string }>).response?.data?.message ??
        'Failed to connect to server';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden bg-[linear-gradient(145deg,#F8F4FF_0%,#FFF0F8_50%,#F0FAFF_100%)]">
      <ConfettiBackground />

      <div className="w-full max-w-[440px] relative z-10 animate-slide-in">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-4 mb-3 text-3xl" aria-hidden="true">
            <span className="animate-floating-1">🎯</span>
            <span className="animate-floating-2">🧠</span>
            <span className="animate-floating-3">🏆</span>
          </div>
          <h1 className="text-4xl font-heading text-[var(--purple)] leading-none">
            Smart<span className="text-[var(--pink)]">Quiz</span>
          </h1>
          <p className="text-[15px] text-[var(--muted)] font-bold mt-2">Play. Learn. Win! 🎉</p>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(155,93,229,0.15)] p-6 sm:p-8">
          {/* Role toggle */}
          <div role="group" aria-label="Select login role" className="flex gap-1.5 bg-[var(--purple-l)] rounded-full p-1.5 mb-6">
            <button
              type="button"
              aria-pressed={role === 'admin'}
              className={cn(
                'flex-1 py-2.5 rounded-full font-bold text-sm transition-all',
                role === 'admin' ? 'bg-[var(--purple)] text-white shadow-lg' : 'text-[var(--muted)]'
              )}
              onClick={() => setRole('admin')}
            >
              🎓 Admin Login
            </button>
            <button
              type="button"
              aria-pressed={role === 'student'}
              className={cn(
                'flex-1 py-2.5 rounded-full font-bold text-sm transition-all',
                role === 'student'
                  ? 'bg-[var(--pink)] text-white shadow-lg'
                  : 'text-[var(--muted)]'
              )}
              onClick={() => setRole('student')}
            >
              🎮 Student Join
            </button>
          </div>

          {/* Server error */}
          {serverError && (
            <div role="alert" className="mb-4 bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-sm font-bold flex items-center gap-2">
              <span aria-hidden="true">⚠️</span> {serverError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="input-group">
              <label htmlFor="login-email" className="label">Email Address 📧</label>
              <input
                id="login-email"
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                className={cn('input', errors.email && 'border-red-400')}
              />
              {errors.email && (
                <p id="login-email-error" role="alert" className="mt-1 text-xs text-red-500 font-bold ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="login-password" className="label">Password 🔒</label>
              <div className="relative">
                <input
                  id="login-password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  className={cn('input pr-12', errors.password && 'border-red-400')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--muted)] hover:text-[var(--purple)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p id="login-password-error" role="alert" className="mt-1 text-xs text-red-500 font-bold ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn('w-full btn mt-2', role === 'admin' ? 'btn-p' : 'btn-pk')}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : role === 'admin' ? (
                '🚀 Admin Login'
              ) : (
                "🔥 Let's Play!"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-[12px] font-bold text-[var(--muted)] before:content-[''] before:flex-1 before:h-[1.5px] before:bg-[#E8E0FF] after:content-[''] after:flex-1 after:h-[1.5px] after:bg-[#E8E0FF]">
            or
          </div>

          <Link to="/signup" className="w-full btn btn-outline flex items-center justify-center gap-2">
            ✨ Create New Account
          </Link>

          <p className="text-center mt-5 text-[11px] text-[var(--muted)] font-bold">
            Demo: any email + password works if database is in testing mode! 🧪
          </p>
        </div>
      </div>
    </div>
  );
}
