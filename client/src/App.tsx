import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

const AuthLayout = ({ children }: any) => <div className="min-h-screen font-body selection:bg-[var(--purple-l)] selection:text-[var(--purple-d)]">{children}</div>;

const AdminLayout = ({ children }: any) => (
  <div className="min-h-screen bg-[var(--bg)] font-body selection:bg-[var(--purple-l)]">
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b-2 border-[var(--purple-l)] px-4 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
         <Link to="/admin/dashboard" className="text-2xl font-heading text-[var(--purple)]">
           Smart<span className="text-[var(--pink)]">Quiz</span>
         </Link>
         <nav className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="text-sm font-black text-[var(--muted)] hover:text-[var(--purple)] transition-colors">Dashboard</Link>
            <div className="w-10 h-10 rounded-full bg-[var(--purple-l)] border-2 border-white shadow-sm flex items-center justify-center text-xl">👨‍🏫</div>
         </nav>
      </div>
    </header>
    <main className="p-6 md:p-10">{children}</main>
  </div>
);

const StudentLayout = ({ children }: any) => (
  <div className="min-h-screen bg-[var(--bg)] font-body selection:bg-[var(--pink-l)]">
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b-2 border-[var(--pink-l)] px-4 py-3">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
         <Link to="/student/profile" className="text-2xl font-heading text-[var(--purple)]">
           Smart<span className="text-[var(--pink)]">Quiz</span>
         </Link>
         <div className="flex items-center gap-4">
            <Link to="/student/join" className="text-xs font-black text-[var(--pink-d)] bg-[var(--pink-l)] px-4 py-2 rounded-full border-2 border-[var(--pink)] hover:bg-[var(--pink)] hover:text-white transition-all">JOIN ROOM</Link>
            <div className="w-10 h-10 rounded-full bg-[var(--pink-l)] border-2 border-white shadow-sm flex items-center justify-center text-xl">👤</div>
         </div>
      </div>
    </header>
    <main className="p-4 md:p-8">{children}</main>
  </div>
);

const ProtectedRoute = ({ children, role }: { children: any, role?: 'admin' | 'student' }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/profile'} />;
  return children;
};

// Pages
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Dashboard from './pages/admin/Dashboard';
import QuizBuilder from './pages/admin/QuizBuilder';
import RoomSetup from './pages/admin/RoomSetup';
import JoinRoom from './pages/student/JoinRoom';
import LiveRoomStudent from './pages/student/LiveRoomStudent';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />

        <Route path="/admin/*" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="quizzes/new" element={<QuizBuilder />} />
                <Route path="quizzes/:quizId/edit" element={<QuizBuilder />} />
                <Route path="rooms/new" element={<RoomSetup />} />
                <Route path="rooms/:code" element={<RoomSetup />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/room/:code/lobby" element={
           <ProtectedRoute role="student">
              <StudentLayout>
                <LiveRoomStudent />
              </StudentLayout>
           </ProtectedRoute>
        } />

        <Route path="/student/*" element={
          <ProtectedRoute role="student">
            <StudentLayout>
              <Routes>
                <Route path="profile" element={<JoinRoom />} />
                <Route path="join" element={<JoinRoom />} />
                <Route path="*" element={<Navigate to="profile" />} />
              </Routes>
            </StudentLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
