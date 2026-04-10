import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { type Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { Copy, Play, Users, ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { cn } from '../../utils/cn';
import type { Quiz, Participant, RoomSession } from '../../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';
const COPY_RESET_DELAY_MS = 2000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RoomSetup() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const isExistingRoom = !!code;

  const socketRef = useRef<Socket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomState, setRoomState] = useState<RoomSession | null>(null);
  const [copied, setCopied] = useState(false);

  // ---------------------------------------------------------------------------
  // Quiz list (new-room mode only)
  // ---------------------------------------------------------------------------
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ['published-quizzes'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Quiz[] }>('/quizzes');
      return res.data.data;
    },
    enabled: !isExistingRoom,
  });

  // ---------------------------------------------------------------------------
  // Socket & room initialisation (lobby mode)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isExistingRoom || !code) return;

    let isMounted = true;

    const init = async () => {
      try {
        const res = await apiClient.get<{ data: RoomSession }>(`/rooms/${code}`);
        if (!isMounted) return;

        const room = res.data.data;
        setRoomState(room);
        setParticipants(room.participants);

        const socket = io(SOCKET_URL, { withCredentials: true });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('room:join', { code, role: 'host' });
        });

        socket.on('room:participant-joined', (p: Participant) => {
          setParticipants((prev) => {
            if (prev.some((x) => x.userId === p.userId)) return prev;
            return [...prev, p];
          });
        });

        socket.on('room:participant-left', ({ userId }: { userId: string }) => {
          setParticipants((prev) => prev.filter((x) => x.userId !== userId));
        });
      } catch (err) {
        console.error('Failed to initialise room:', err);
      }
    };

    init();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, [code, isExistingRoom]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const onCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quizId = formData.get('quizId') as string;
    if (!quizId) return;

    try {
      const res = await apiClient.post<{ data: RoomSession }>('/rooms', { quizId, mode: 'score' });
      navigate(`/admin/rooms/${res.data.data.code}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const onStartQuiz = async () => {
    if (!roomState) return;
    try {
      await apiClient.patch(`/rooms/${roomState._id}/status`, { status: 'live' });
      socketRef.current?.emit('room:host:start', { code });
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Failed to start quiz:', err);
    }
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
    });
  };

  // ---------------------------------------------------------------------------
  // Render: new-room picker
  // ---------------------------------------------------------------------------
  if (!isExistingRoom) {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-slide-in">
        <div className="flex justify-center gap-4 text-3xl mb-2" aria-hidden="true">
          <span className="animate-floating-1">🛰️</span>
          <span className="animate-floating-2">📡</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-heading text-[var(--text)]">Launch Live Room</h1>
          <p className="text-[var(--muted)] font-bold">Pick a quiz and start a live play session!</p>
        </div>

        <div className="card p-8">
          <form onSubmit={onCreateRoom} className="space-y-6">
            <div className="input-group">
              <label htmlFor="room-quiz-select" className="label">Select your Quiz 📚</label>
              <select id="room-quiz-select" name="quizId" className="input pr-10" required>
                <option value="">-- Choose a quiz --</option>
                {quizzes?.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loadingQuizzes} className="w-full btn btn-p py-4 text-lg">
              {loadingQuizzes ? <Loader2 className="animate-spin" aria-hidden="true" /> : '🚀 Create Live Room'}
            </button>

            <Link to="/admin/dashboard" className="w-full btn btn-outline py-3">
              Cancel
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: lobby view
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2 font-black text-[var(--muted)] hover:text-[var(--purple)] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <ArrowLeft size={18} />
          </div>
          Back to Dashboard
        </Link>

        <div className="flex gap-2">
          <div className="bg-[var(--green-l)] text-[var(--green-d)] px-4 py-2 rounded-full font-black text-xs border-2 border-[var(--green)] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" aria-hidden="true" />
            SERVER LIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Room code */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-8 text-center bg-gradient-to-br from-white to-[var(--blue-l)] border-none relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-2xl opacity-10 animate-floating-1" aria-hidden="true">🔗</div>
            <h2 className="text-[14px] font-black text-[var(--blue-d)] uppercase tracking-[3px] mb-4">
              Join Room Code
            </h2>
            <div
              onClick={copyCode}
              role="button"
              tabIndex={0}
              aria-label={`Room code ${code}. Click to copy.`}
              onKeyDown={(e) => e.key === 'Enter' && copyCode()}
              className="text-6xl font-heading font-black tracking-widest text-[var(--text)] mb-6 cursor-pointer hover:scale-105 transition-transform select-all"
            >
              {code}
            </div>

            <button
              onClick={copyCode}
              className={cn(
                'w-full btn py-4 text-sm gap-2 transition-all',
                copied
                  ? 'bg-[var(--green)] text-white'
                  : 'btn-outline border-[var(--blue)] text-[var(--blue-d)] bg-white'
              )}
            >
              {copied ? '✅ Copied to clipboard!' : <><Copy size={16} aria-hidden="true" /> Copy Join Link</>}
            </button>

            <p className="mt-5 text-xs font-bold text-[var(--muted)]">
              Students can join at <span className="text-[var(--purple)]">smartquiz.app/join</span>
            </p>
          </div>

          <div className="card p-6 border-none bg-[var(--orange-l)]/30 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl animate-floating-2" aria-hidden="true">
              🚀
            </div>
            <div>
              <h3 className="font-heading text-[var(--orange-d)]">Quick Tip</h3>
              <p className="text-xs font-bold text-[var(--text)]">
                Wait for all players to join before starting. You can't add more later!
              </p>
            </div>
          </div>
        </div>

        {/* Participant list */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card p-8 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-heading flex items-center gap-3">
                <span className="bg-[var(--purple-l)] text-[var(--purple)] p-2 rounded-xl">
                  <Users size={24} />
                </span>
                Players Waiting ({participants.length})
              </h2>
              <div className="flex -space-x-3 overflow-hidden" aria-hidden="true">
                {participants.slice(0, 5).map((_, i) => (
                  <div
                    key={i}
                    className="inline-block h-8 w-8 rounded-full border-2 border-white bg-[var(--pink)]"
                  />
                ))}
                {participants.length > 5 && (
                  <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-white bg-slate-200 text-[10px] font-black">
                    +{participants.length - 5}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {participants.length === 0 ? (
                <div className="col-span-full h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="text-4xl mb-4 animate-bounce" aria-hidden="true">⏳</div>
                  <p className="font-black text-[var(--muted)] italic">Waiting for your first player...</p>
                </div>
              ) : (
                participants.map((p) => (
                  <div
                    key={p.userId}
                    className="animate-pop bg-[var(--bg)] p-3 rounded-[15px] border-2 border-white shadow-sm flex items-center gap-2 group hover:border-[var(--pink)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--pink-l)] flex items-center justify-center text-sm" aria-hidden="true">
                      👤
                    </div>
                    <div className="font-black text-xs text-[var(--text)] truncate">{p.name}</div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t-2 border-[var(--bg)]">
              <button
                disabled={participants.length === 0}
                onClick={onStartQuiz}
                className="w-full btn btn-p py-5 text-xl gap-3 shadow-[0_10px_30px_rgba(155,93,229,0.4)]"
              >
                <Play size={24} fill="currentColor" aria-hidden="true" /> START THE BATTLE!
              </button>
              <p className="text-center mt-4 text-xs font-black text-[var(--muted)]">
                The quiz will start for all players simultaneously.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
