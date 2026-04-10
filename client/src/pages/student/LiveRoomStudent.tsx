import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';
import ConfettiBackground from '../../components/ConfettiBackground';

export default function LiveRoomStudent() {
  const { code } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [socket, setSocket] = useState<any>(null);
  const [roomState, setRoomState] = useState<any>(null);
  const [quizDetails, setQuizDetails] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30); // Demo default

  useEffect(() => {
    if (!code) return;

    const init = async () => {
      try {
        const roomRes = await apiClient.get(`/rooms/${code}`);
        setRoomState(roomRes.data.data);
        
        const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
          withCredentials: true,
        });

        newSocket.on('connect', () => {
          newSocket.emit('room:join', { 
            code, 
            role: 'student', 
            userId: user?._id || newSocket.id,
            name: user?.name || 'Guest'
          });
        });

        newSocket.on('room:started', () => {
          setRoomState((prev: any) => ({ ...prev, status: 'live' }));
        });

        newSocket.on('room:ended', () => {
          setRoomState((prev: any) => ({ ...prev, status: 'completed' }));
        });

        newSocket.on('room:next-question', ({ questionIndex }) => {
          setCurrentQuestionIndex(questionIndex);
          setHasSubmitted(false);
          setSelectedOption(null);
          setTimeLeft(30); // Reset timer for new question
        });

        setSocket(newSocket);
        
        const quizRes = await apiClient.get(`/quizzes/${roomRes.data.data.quizId}`);
        setQuizDetails(quizRes.data.data);
         
      } catch (err) {
        console.error(err);
        navigate('/student/join');
      }
    };
    init();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [code]);

  // Demo timer effect
  useEffect(() => {
    if (currentQuestionIndex >= 0 && timeLeft > 0 && !hasSubmitted) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, timeLeft, hasSubmitted]);

  const onSubmitAnswer = async () => {
    if (selectedOption === null || currentQuestionIndex === -1 || !quizDetails) return;
    
    setHasSubmitted(true);
    const q = quizDetails.questions[currentQuestionIndex];
    
    try {
       await apiClient.post(`/attempts/${roomState._id}/submit`, {
         questionId: q._id,
         answer: selectedOption,
         roomId: roomState._id
       });
    } catch(err) {
       console.error("Failed to submit", err);
    }
  };

  if (!roomState || !quizDetails) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg)]">
      <Loader2 className="animate-spin text-[var(--purple)] w-12 h-12 mb-4" />
      <p className="font-black text-[var(--muted)]">Entering the arena...</p>
    </div>
  );

  if (roomState.status === 'completed') {
    return (
       <div className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden bg-[linear-gradient(145deg,#F8F4FF_0%,#FFF0F8_50%,#F0FAFF_100%)]">
          <ConfettiBackground />
          <div className="card max-w-xl w-full p-12 text-center relative z-10 animate-pop">
             <div className="w-24 h-24 bg-[var(--green-l)] text-[var(--green-d)] rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg animate-floating-1">🏆</div>
             <h2 className="text-4xl font-heading text-[var(--text)]">Well Done!</h2>
             <p className="text-[var(--muted)] font-bold mt-4 text-lg">Quiz completed successfully. Check the dashboard for your score and rank! 🎉</p>
             <button onClick={() => navigate('/student/profile')} className="mt-10 btn btn-p w-full py-4 text-lg">See My Stats</button>
          </div>
       </div>
    );
  }

  if (roomState.status === 'lobby' || currentQuestionIndex === -1) {
    return (
       <div className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden bg-[linear-gradient(145deg,#F8F4FF_0%,#FFF0F8_50%,#F0FAFF_100%)]">
          <ConfettiBackground />
          <div className="card max-w-xl w-full p-12 text-center relative z-10 animate-slide-in">
             <div className="flex justify-center gap-4 mb-6 text-4xl">
               <span className="animate-floating-1">🎮</span>
               <span className="animate-floating-2">🔥</span>
               <span className="animate-floating-3">💪</span>
             </div>
             <h2 className="text-4xl font-heading text-[var(--purple)]">You're in the Game!</h2>
             <p className="text-[var(--muted)] font-black mt-4 text-lg">Get ready {user?.name.split(' ')[0]}... <br/> The battle starts as soon as the host is ready! 🚀</p>
             
             <div className="mt-10 flex items-center justify-center gap-3 text-[var(--pink)] font-black text-sm uppercase tracking-widest bg-[var(--pink-l)] py-3 px-6 rounded-full inline-flex mx-auto border-2 border-[var(--pink)]">
               <div className="w-2 h-2 rounded-full bg-[var(--pink)] animate-ping" />
               Waiting for host
             </div>
          </div>
       </div>
    );
  }

  // Live Quiz State
  const currentQ = quizDetails.questions[currentQuestionIndex];
  const optionColors = ['bg-[var(--blue)]', 'bg-[var(--pink)]', 'bg-[var(--yellow)]', 'bg-[var(--green)]'];
  const optionHoverColors = ['hover:scale-105 active:scale-95 border-[var(--blue-d)]', 'hover:scale-105 active:scale-95 border-[var(--pink-d)]', 'hover:scale-105 active:scale-95 border-[var(--orange-d)]', 'hover:scale-105 active:scale-95 border-[var(--green-d)]'];

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8 px-4 flex flex-col gap-6 animate-slide-in">
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center bg-white p-4 rounded-[25px] shadow-[var(--sh)]">
         <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-[var(--purple-l)] flex items-center justify-center text-xl font-bold text-[var(--purple)]">
               {currentQuestionIndex + 1}
             </div>
             <div>
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">Question</p>
                <p className="text-sm font-black text-[var(--text)]">{currentQuestionIndex + 1} of {quizDetails.questions.length}</p>
             </div>
         </div>
         
         {/* Animated SVG Timer */}
         <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle 
                cx="32" cy="32" r="28" 
                stroke="var(--purple-l)" 
                strokeWidth="4" 
                fill="transparent" 
              />
              <circle 
                cx="32" cy="32" r="28" 
                stroke="var(--purple)" 
                strokeWidth="4" 
                fill="transparent"
                strokeDasharray={176}
                strokeDashoffset={176 - (176 * timeLeft) / 30}
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
            <div className="w-12 h-12 rounded-full bg-[var(--yellow-l)] flex items-center justify-center text-xl animate-floating-1">💎</div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center items-center py-8">
         <div className="w-full card p-8 sm:p-12 mb-8 bg-white text-center border-none shadow-[0_20px_60px_rgba(155,93,229,0.1)] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--purple)] text-white p-3 rounded-full text-2xl shadow-lg">🧠</div>
            <h2 className="text-2xl sm:text-4xl font-heading text-[var(--text)] leading-tight">{currentQ.prompt}</h2>
         </div>

         <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options?.map((opt: string, i: number) => (
               <button 
                 key={i}
                 disabled={hasSubmitted || timeLeft === 0}
                 onClick={() => setSelectedOption(i)}
                 className={cn(
                   "relative p-6 px-10 rounded-[20px] text-left font-black text-lg transition-all border-4 shadow-lg group overflow-hidden",
                   selectedOption === i ? "border-white ring-4 ring-[var(--purple)]" : "border-white",
                   !hasSubmitted && optionColors[i % 4] + " text-white " + optionHoverColors[i % 4],
                   hasSubmitted && selectedOption === i && "bg-[var(--purple-d)] border-[var(--purple)] text-white scale-95",
                   hasSubmitted && selectedOption !== i && "opacity-40 grayscale"
                 )}
               >
                 <div className="absolute top-0 left-0 w-2 h-full bg-black/10" />
                 <div className="flex items-center gap-6">
                    <span className="text-3xl opacity-20">{String.fromCharCode(65 + i)}</span>
                    <span className="flex-1">{opt}</span>
                    {selectedOption === i && hasSubmitted && <Lock className="animate-pop text-white" size={24} />}
                 </div>
               </button>
            ))}
         </div>
      </div>

      <div className="max-w-4xl mx-auto w-full pb-8">
        <button 
          disabled={selectedOption === null || hasSubmitted || timeLeft === 0} 
          onClick={onSubmitAnswer}
          className={cn(
            "w-full btn py-5 text-xl font-black gap-3 shadow-lg transition-all transform active:scale-95",
            hasSubmitted ? "bg-[var(--green)] text-white cursor-default" : "btn-p"
          )}
        >
          {hasSubmitted ? "✅ LOCKED IN! WAITING..." : (timeLeft === 0 ? "⏰ TIME'S UP!" : "🔥 SUBMIT MY ANSWER")}
        </button>
      </div>
    </div>
  );
}
