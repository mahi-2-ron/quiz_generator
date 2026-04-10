import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Zap, ShieldCheck } from 'lucide-react';
import { type AxiosError } from 'axios';
import apiClient from '../../api/apiClient';
import { cn } from '../../utils/cn';
import ConfettiBackground from '../../components/ConfettiBackground';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_CODE_LENGTH = 2;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function JoinRoom() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const onJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;

    setLoading(true);
    setError('');

    try {
      await apiClient.post(`/rooms/${trimmedCode}/join`);
      navigate(`/room/${trimmedCode}/lobby`);
    } catch (err) {
      const message =
        (err as AxiosError<{ message: string }>).response?.data?.message ??
        "That code doesn't seem right! 🧐";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
  };

  const isSubmitDisabled = loading || code.trim().length < MIN_CODE_LENGTH;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      <ConfettiBackground />

      <div className="w-full max-w-md space-y-12 relative z-10 animate-slide-in">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-white shadow-xl animate-floating-1 mb-4">
            <Zap size={48} className="text-[var(--yellow)] fill-[var(--yellow)]" aria-hidden="true" />
          </div>
          <h1 className="text-5xl font-heading text-[var(--text)] tracking-tight">Ready to Battle?</h1>
          <p className="text-[var(--muted)] font-black text-lg">Enter the secret code to join the arena!</p>
        </div>

        <div className="card p-10 bg-white/90 backdrop-blur-sm border-none shadow-[0_30px_60px_rgba(155,93,229,0.15)]">
          {error && (
            <div role="alert" className="mb-6 animate-pop text-sm font-black text-[var(--red)] bg-[var(--red-l)] p-4 rounded-2xl border-2 border-[var(--red)] flex items-center gap-3">
              <span aria-hidden="true">⚠️</span> {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={onJoin} noValidate>
            <div className="input-group">
              <label htmlFor="room-code" className="label text-center block w-full mb-4">
                Game Pin
              </label>
              <input
                id="room-code"
                type="text"
                inputMode="text"
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-label="Room code"
                className="w-full bg-[var(--bg)] text-center text-4xl font-black tracking-[0.3em] py-6 px-4 rounded-2xl border-4 border-white shadow-inner focus:border-[var(--purple)] focus:ring-0 transition-all uppercase placeholder:opacity-20"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={cn(
                'w-full btn btn-p py-5 text-2xl font-black gap-3 shadow-[0_15px_30px_rgba(155,93,229,0.3)] transform active:scale-95 transition-all',
                isSubmitDisabled && 'opacity-50 grayscale cursor-not-allowed'
              )}
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" aria-label="Joining room..." />
              ) : (
                <>
                  <ShieldCheck size={28} aria-hidden="true" /> ENTER ARENA
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex justify-center gap-8 opacity-40 grayscale blur-[1px]" aria-hidden="true">
          <span className="text-4xl animate-floating-2">🚀</span>
          <span className="text-4xl animate-floating-1">💎</span>
          <span className="text-4xl animate-floating-3">👑</span>
        </div>
      </div>
    </div>
  );
}
