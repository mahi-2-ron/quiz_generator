import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { Copy, Play, Users, ArrowLeft, Loader2 } from 'lucide-react';
import io from 'socket.io-client';
import { cn } from '../../utils/cn';

export default function RoomSetup() {
  const { code } = useParams();
  const navigate = useNavigate();
  const isExistingRoom = !!code;

  const [socket, setSocket] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [roomState, setRoomState] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery({
    queryKey: ['published-quizzes'],
    queryFn: async () => {
      if (isExistingRoom) return null;
      const res = await apiClient.get('/quizzes');
      return res.data.data;
    },
    enabled: !isExistingRoom
  });

  const onCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const quizId = formData.get('quizId');
    if (!quizId) return;

    try {
      const res = await apiClient.post('/rooms', { quizId, mode: 'score' });
      navigate(`/admin/rooms/${res.data.data.code}`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isExistingRoom) return;

    const loadRoom = async () => {
      try {
        const res = await apiClient.get(`/rooms/${code}`);
        setRoomState(res.data.data);
        setParticipants(res.data.data.participants);

        const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
          withCredentials: true,
        });

        newSocket.on('connect', () => {
          newSocket.emit('room:join', { code, role: 'host' });
        });

        newSocket.on('room:participant-joined', (p) => {
          setParticipants(prev => {
            if (prev.find(x => x.userId === p.userId)) return prev;
            return [...prev, p];
          });
        });

        newSocket.on('room:participant-left', ({ userId }) => {
          setParticipants(prev => prev.filter(x => x.userId !== userId));
        });

        setSocket(newSocket);
      } catch (err) {
        console.error(err);
      }
    };
    loadRoom();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [code, isExistingRoom]);

  const onStartQuiz = async () => {
    try {
      await apiClient.patch(`/rooms/${roomState._id}/status`, { status: 'live' });
      socket?.emit('room:host:start', { code });
      navigate('/admin/dashboard'); 
    } catch (err) {
      console.error(err);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isExistingRoom) {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-slide-in">
        <div className="flex justify-center gap-4 text-3xl mb-2">
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
              <label className="label">Select your Quiz 📚</label>
              <select name="quizId" className="input pr-10" required>
                <option value="">-- Choose a quiz --</option>
                {quizzes?.map((q: any) => (
                  <option key={q._id} value={q._id}>{q.title}</option>
                ))}
              </select>
            </div>
            
            <button type="submit" disabled={loadingQuizzes} className="w-full btn btn-p py-4 text-lg">
              {loadingQuizzes ? <Loader2 className="animate-spin" /> : "🚀 Create Live Room"}
            </button>

            <Link to="/admin/dashboard" className="w-full btn btn-outline py-3">
               Cancel
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-black text-[var(--muted)] hover:text-[var(--purple)] transition-colors">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
               <ArrowLeft size={18} />
            </div>
            Back to Dashboard
          </Link>

          <div className="flex gap-2">
             <div className="bg-[var(--green-l)] text-[var(--green-d)] px-4 py-2 rounded-full font-black text-xs border-2 border-[var(--green)] flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
               SERVER LIVE
             </div>
          </div>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Code Display */}
          <div className="lg:col-span-5 space-y-6">
             <div className="card p-8 text-center bg-gradient-to-br from-white to-[var(--blue-l)] border-none relative overflow-hidden group">
                <div className="absolute top-4 right-4 text-2xl opacity-10 animate-floating-1">🔗</div>
                <h2 className="text-[14px] font-black text-[var(--blue-d)] uppercase tracking-[3px] mb-4">Join Room Code</h2>
                <div 
                   onClick={copyCode}
                   className="text-6xl font-heading font-black tracking-widest text-[var(--text)] mb-6 cursor-pointer hover:scale-105 transition-transform select-all"
                >
                  {code}
                </div>
                
                <button 
                  onClick={copyCode}
                  className={cn(
                    "w-full btn py-4 text-sm gap-2 transition-all",
                    copied ? "bg-[var(--green)] text-white" : "btn-outline border-[var(--blue)] text-[var(--blue-d)] bg-white"
                  )}
                >
                  {copied ? "✅ Copied to clipboard!" : <><Copy size={16} /> Copy Join Link</>}
                </button>

                <p className="mt-5 text-xs font-bold text-[var(--muted)]">Students can join at <span className="text-[var(--purple)]">smartquiz.app/join</span></p>
             </div>

             <div className="card p-6 border-none bg-[var(--orange-l)]/30 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl animate-floating-2">🚀</div>
                <div>
                   <h4 className="font-heading text-[var(--orange-d)]">Quick Tip</h4>
                   <p className="text-xs font-bold text-[var(--text)]">Wait for all players to join before starting. You can't add more later!</p>
                </div>
             </div>
          </div>

          {/* Right Side: Participant List */}
          <div className="lg:col-span-7 space-y-6">
             <div className="card p-8 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-heading flex items-center gap-3">
                     <span className="bg-[var(--purple-l)] text-[var(--purple)] p-2 rounded-xl"><Users size={24} /></span>
                     Players Waiting ({participants.length})
                   </h3>
                   <div className="flex -space-x-3 overflow-hidden">
                      {participants.slice(0, 5).map((_, i) => (
                         <div key={i} className="inline-block h-8 w-8 rounded-full border-2 border-white bg-[var(--pink)]" />
                      ))}
                      {participants.length > 5 && (
                         <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-white bg-slate-200 text-[10px] font-black">+{participants.length - 5}</div>
                      )}
                   </div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {participants.length === 0 ? (
                     <div className="col-span-full h-full flex flex-col items-center justify-center text-center py-10">
                        <div className="text-4xl mb-4 animate-bounce">⏳</div>
                        <p className="font-black text-[var(--muted)] italic">Waiting for your first player...</p>
                     </div>
                   ) : (
                     participants.map(p => (
                       <div key={p.userId || p._id} className="animate-pop bg-[var(--bg)] p-3 rounded-[15px] border-2 border-white shadow-sm flex items-center gap-2 group hover:border-[var(--pink)] transition-colors">
                         <div className="w-8 h-8 rounded-full bg-[var(--pink-l)] flex items-center justify-center text-sm">👤</div>
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
                     <Play size={24} fill="currentColor" /> START THE BATTLE!
                   </button>
                   <p className="text-center mt-4 text-xs font-black text-[var(--muted)]">The quiz will start for all players simultaneously.</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
