import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { Loader2, Lock } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import ConfettiBackground from '../../components/ConfettiBackground';
import type { RoomSession, Quiz, Question } from '../../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';
const DEFAULT_TIMER_SECONDS = 30;

/** Tailwind colour classes cycling across to four answer options. */
const OPTION_BG_COLORS = [
  'bg-[var(--blue)]',
  'bg-[var(--pink)]',
  'bg-[var(--yellow)]',
  'bg-[var(--green)]',
] as const;

const OPTION_HOVER_CLASSES =
  'hover:scale-105 active:scale-95 border-[var(--blue-d)]';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LiveRoomStudent() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const socketRef = useRef<Socket | null>(null);
  const [roomState, setRoomState] = useState<RoomSession | null>(null);
  const [quizDetails, setQuizDetails] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_SECONDS);

  // ---------------------------------------------------------------------------
  // Initialise room + socket
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!code) return;
    let isMounted = true;

    const init = async () => {
      try {
        const roomRes = await apiClient.get<{ data: RoomSession }>(`/rooms/${code}`);
        if (!isMounted) return;

        const room = roomRes.data.data;
        setRoomState(room);

        const socket = io(SOCKET_URL, { withCredentials: true });
        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('room:join', {
            code,
            role: 'student',
            userId: user?._id ?? socket.id,
            name: user?.name ?? 'Guest',
          });
        });

        socket.on('room:started', () => {
          setRoomState((prev) => prev ? { ...prev, status: 'live' } : prev);
        });

        socket.on('room:ended', () => {
          setRoomState((prev) => prev ? { ...prev, status: 'completed' } : prev);
        });

        socket.on('room:next-question', ({ questionIndex }: { questionIndex: number }) => {
          setCurrentQuestionIndex(questionIndex);
          setHasSubmitted(false);
          setSelectedOption(null);
          setTimeLeft(DEFAULT_TIMER_SECONDS);
        });

        const quizId = typeof room.quizId === 'string' ? room.quizId : room.quizId._id;
        const quizRes = await apiClient.get<{ data: Quiz }>(`/quizzes/${quizId}`);
        if (isMounted) setQuizDetails(quizRes.data.data);
      } catch (err) {
        console.error('Failed to initialise live room:', err);
        if (isMounted) navigate('/student/join');
      }
    };

    init();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, [code, navigate, user]);

  // ---------------------------------------------------------------------------
  // Countdown timer
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (currentQuestionIndex < 0 || timeLeft <= 0 || hasSubmitted) return;

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex, timeLeft, hasSubmitted]);

  // ---------------------------------------------------------------------------
  // Submit answer
  // ---------------------------------------------------------------------------
  const onSubmitAnswer = useCallback(async () => {
    if (selectedOption === null || currentQuestionIndex < 0 || !quizDetails || !roomState) return;

    setHasSubmitted(true);
    const question: Question = quizDetails.questions[currentQuestionIndex];

    try {
      await apiClient.post(`/attempts/${roomState._id}/answers`, {
        questionId: question._id,
        submittedValue: selectedOption,
        timeTakenMs: (DEFAULT_TIMER_SECONDS - timeLeft) * 1000,
      });
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  }, [selectedOption, currentQuestionIndex, quizDetails, roomState, timeLeft]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (!roomState || !quizDetails) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg)]">
        <Loader2 className="animate-spin text-[var(--purple)] w-12 h-12 mb-4" aria-hidden="true" />
        <p className="font-black text-[var(--muted)]">Entering the arena…</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // End screen
  // ---------------------------------------------------------------------------
  if (roomState.status === 'completed') {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden bg-[linear-gradient(145deg,#F8F4FF_0%,#FFF0F8_50%,#F0FAFF_100%)]">
        <ConfettiBackground />
        <div className="card max-w-xl w-full p-12 text-center relative z-10 animate-pop">
          <div className="w-24 h-24 bg-[var(--green-l)] text-[var(--green-d)] rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg animate-floating-1" aria-hidden="true">
            🏆
          </div>
          <h1 className="text-4xl font-heading text-[var(--text)]">Well Done!</h1>
          <p className="text-[var(--muted)] font-bold mt-4 text-lg">
            Quiz completed successfully. Check the dashboard for your score and rank! 🎉
          </p>
          <button
            onClick={() => navigate('/student/profile')}
            className="mt-10 btn btn-p w-full py-4 text-lg"
          >
            See My Stats
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Lobby screen
  // ---------------------------------------------------------------------------
  if (roomState.status === 'lobby' || currentQuestionIndex === -1) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden bg-[linear-gradient(145deg,#F8F4FF_0%,#FFF0F8_50%,#F0FAFF_100%)]">
        <ConfettiBackground />
        <div className="card max-w-xl w-full p-12 text-center relative z-10 animate-slide-in">
          <div className="flex justify-center gap-4 mb-6 text-4xl" aria-hidden="true">
            <span className="animate-floating-1">🎮</span>
            <span className="animate-floating-2">🔥</span>
            <span className="animate-floating-3">💪</span>
          </div>
          <h1 className="text-4xl font-heading text-[var(--purple)]">You're in the Game!</h1>
          <p className="text-[var(--muted)] font-black mt-4 text-lg">
            Get ready {user?.name.split(' ')[0]}…{' '}
            <br />
            The battle starts as soon as the host is ready! 🚀
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 text-[var(--pink)] font-black text-sm uppercase tracking-widest bg-[var(--pink-l)] py-3 px-6 rounded-full inline-flex mx-auto border-2 border-[var(--pink)]">
            <div className="w-2 h-2 rounded-full bg-[var(--pink)] animate-ping" aria-hidden="true" />
            Waiting for host
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Live quiz screen
  // ---------------------------------------------------------------------------
  const currentQuestion = quizDetails.questions[currentQuestionIndex];
  const circumference = 176; // 2π × 28 ≈ 176
  const strokeOffset = circumference - (circumference * timeLeft) / DEFAULT_TIMER_SECONDS;

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8 px-4 flex flex-col gap-6 animate-slide-in">
      {/* HUD bar */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center bg-white p-4 rounded-[25px] shadow-[var(--sh)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--purple-l)] flex items-center justify-center text-xl font-bold text-[var(--purple)]">
            {currentQuestionIndex + 1}
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">
              Question
            </p>
            <p className="text-sm font-black text-[var(--text)]">
              {currentQuestionIndex + 1} of {quizDetails.questions.length}
            </p>
          </div>
        </div>

        {/* SVG countdown timer */}
        <div className="relative w-16 h-16" role="timer" aria-label={`${timeLeft} seconds remaining`}>
          <svg className="w-16 h-16 transform -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r="28" stroke="var(--purple-l)" strokeWidth="4" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="var(--purple)"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-[var(--purple)]">
            {timeLeft}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-right">
          <div>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Score</p>
            <p className="text-sm font-black text-[var(--text)]">1,240 pts</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[var(--yellow-l)] flex items-center justify-center text-xl animate-floating-1" aria-hidden="true">
            💎
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center items-center py-8">
        <div className="w-full card p-8 sm:p-12 mb-8 bg-white text-center border-none shadow-[0_20px_60px_rgba(155,93,229,0.1)] relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--purple)] text-white p-3 rounded-full text-2xl shadow-lg" aria-hidden="true">
            🧠
          </div>
          <h2 className="text-2xl sm:text-4xl font-heading text-[var(--text)] leading-tight">
            {currentQuestion.prompt}
          </h2>
        </div>

        {/* Answer options */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Answer options">
          {currentQuestion.options?.map((opt, i) => (
            <button
              key={i}
              disabled={hasSubmitted || timeLeft === 0}
              onClick={() => setSelectedOption(i)}
              aria-pressed={selectedOption === i}
              className={cn(
                'relative p-6 px-10 rounded-[20px] text-left font-black text-lg transition-all border-4 shadow-lg group overflow-hidden',
                selectedOption === i ? 'border-white ring-4 ring-[var(--purple)]' : 'border-white',
                !hasSubmitted && `${OPTION_BG_COLORS[i % OPTION_BG_COLORS.length]} text-white ${OPTION_HOVER_CLASSES}`,
                hasSubmitted && selectedOption === i && 'bg-[var(--purple-d)] border-[var(--purple)] text-white scale-95',
                hasSubmitted && selectedOption !== i && 'opacity-40 grayscale'
              )}
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-black/10" aria-hidden="true" />
              <div className="flex items-center gap-6">
                <span className="text-3xl opacity-20" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {selectedOption === i && hasSubmitted && (
                  <Lock className="animate-pop text-white" size={24} aria-hidden="true" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <div className="max-w-4xl mx-auto w-full pb-8">
        <button
          disabled={selectedOption === null || hasSubmitted || timeLeft === 0}
          onClick={onSubmitAnswer}
          className={cn(
            'w-full btn py-5 text-xl font-black gap-3 shadow-lg transition-all transform active:scale-95',
            hasSubmitted ? 'bg-[var(--green)] text-white cursor-default' : 'btn-p'
          )}
        >
          {hasSubmitted
            ? '✅ LOCKED IN! WAITING…'
            : timeLeft === 0
            ? "⏰ TIME'S UP!"
            : '🔥 SUBMIT MY ANSWER'}
        </button>
      </div>
    </div>
  );
}
