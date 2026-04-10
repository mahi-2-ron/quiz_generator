import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import ConfettiBackground from '../../components/ConfettiBackground';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'student']),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'student' }
  });

  const role = watch('role');

  const onSubmit = async (data: SignupForm) => {
    setServerError('');
    try {
      const response = await apiClient.post('/auth/signup', data);
      setAuth(response.data.data.user, response.data.data.accessToken);
      if (response.data.data.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/student/profile');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to sign up');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden bg-[linear-gradient(145deg,#F8F4FF_0%,#FFF0F8_50%,#F0FAFF_100%)]">
      <ConfettiBackground />
      
      <div className="w-full max-w-[480px] relative z-10 animate-slide-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-[var(--purple)] leading-none">
            Join Smart<span className="text-[var(--pink)]">Quiz</span>
          </h1>
          <p className="text-[15px] text-[var(--muted)] font-bold mt-2">Start your learning adventure today! 🚀</p>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(155,93,229,0.15)] p-6 sm:p-8">
          {serverError && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-sm font-bold flex items-center gap-2">
              <span>⚠️</span> {serverError}
            </div>
          )}

          <div className="flex gap-4 mb-8">
            <button 
              type="button"
              onClick={() => setValue('role', 'student')}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-3 rounded-[15px] border-2 transition-all",
                role === 'student' ? "border-[var(--pink)] bg-[var(--pink-l)]" : "border-[#E8E0FF] hover:border-[var(--pink)]"
              )}
            >
              <span className="text-2xl">🎮</span>
              <span className={cn("text-xs font-black", role === 'student' ? "text-[var(--pink-d)]" : "text-[var(--muted)]")}>STUDENT</span>
            </button>
            <button 
              type="button"
              onClick={() => setValue('role', 'admin')}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-3 rounded-[15px] border-2 transition-all",
                role === 'admin' ? "border-[var(--purple)] bg-[var(--purple-l)]" : "border-[#E8E0FF] hover:border-[var(--purple)]"
              )}
            >
              <span className="text-2xl">🎓</span>
              <span className={cn("text-xs font-black", role === 'admin' ? "text-[var(--purple-d)]" : "text-[var(--muted)]")}>TEACHER</span>
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label className="label">Full Name ✨</label>
              <div className="relative">
                <input
                  {...register('name')}
                  placeholder="John Doe"
                  className={cn("input", errors.name && "border-red-400")}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            <div className="input-group">
              <label className="label">Email Address 📧</label>
              <input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className={cn("input", errors.email && "border-red-400")}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <label className="label">Password 🔒</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className={cn("input pr-12", errors.password && "border-red-400")}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--muted)] hover:text-[var(--purple)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full btn mt-2",
                role === 'admin' ? "btn-p" : "btn-pk"
              )}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "✨ Create My Account"}
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            <span className="text-[var(--muted)] font-bold">Already have an account? </span>
            <Link to="/login" className="font-black text-[var(--purple)] hover:text-[var(--purple-d)] underline decoration-2 underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
