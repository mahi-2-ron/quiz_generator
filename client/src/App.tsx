import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import type { UserRole } from './types';

// ---------------------------------------------------------------------------
// Lazy-loaded pages (code-split by route)
// ---------------------------------------------------------------------------
const Login = lazy(() => import('./pages/public/Login'));
const Signup = lazy(() => import('./pages/public/Signup'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const QuizBuilder = lazy(() => import('./pages/admin/QuizBuilder'));
const RoomSetup = lazy(() => import('./pages/admin/RoomSetup'));
const JoinRoom = lazy(() => import('./pages/student/JoinRoom'));
const LiveRoomStudent = lazy(() => import('./pages/student/LiveRoomStudent'));

// ---------------------------------------------------------------------------
// Layout wrappers
// ---------------------------------------------------------------------------

interface LayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: LayoutProps) => (
  <div className="min-h-screen font-body selection:bg-[var(--purple-l)] selection:text-[var(--purple-d)]">
    {children}
  </div>
);

const AdminLayout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-[var(--bg)] font-body selection:bg-[var(--purple-l)]">
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b-2 border-[var(--purple-l)] px-4 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/admin/dashboard" className="text-2xl font-heading text-[var(--purple)]">
          Smart<span className="text-[var(--pink)]">Quiz</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/admin/dashboard"
            className="text-sm font-black text-[var(--muted)] hover:text-[var(--purple)] transition-colors"
          >
            Dashboard
          </Link>
          <div
            aria-label="Admin avatar"
            className="w-10 h-10 rounded-full bg-[var(--purple-l)] border-2 border-white shadow-sm flex items-center justify-center text-xl"
            role="img"
          >
            👨‍🏫
          </div>
        </nav>
      </div>
    </header>
    <main className="p-6 md:p-10">{children}</main>
  </div>
);

const StudentLayout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-[var(--bg)] font-body selection:bg-[var(--pink-l)]">
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b-2 border-[var(--pink-l)] px-4 py-3">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/student/profile" className="text-2xl font-heading text-[var(--purple)]">
          Smart<span className="text-[var(--pink)]">Quiz</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/student/join"
            className="text-xs font-black text-[var(--pink-d)] bg-[var(--pink-l)] px-4 py-2 rounded-full border-2 border-[var(--pink)] hover:bg-[var(--pink)] hover:text-white transition-all"
          >
            JOIN ROOM
          </Link>
          <div
            aria-label="Student avatar"
            className="w-10 h-10 rounded-full bg-[var(--pink-l)] border-2 border-white shadow-sm flex items-center justify-center text-xl"
            role="img"
          >
            👤
          </div>
        </div>
      </div>
    </header>
    <main className="p-4 md:p-8">{children}</main>
  </div>
);

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    const redirect = user.role === 'admin' ? '/admin/dashboard' : '/student/profile';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// Minimal loading fallback for Suspense
// ---------------------------------------------------------------------------
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--purple)]" />
  </div>
);

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="quizzes/new" element={<QuizBuilder />} />
                    <Route path="quizzes/:quizId/edit" element={<QuizBuilder />} />
                    <Route path="rooms/new" element={<RoomSetup />} />
                    <Route path="rooms/:code" element={<RoomSetup />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/room/:code/lobby"
            element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <LiveRoomStudent />
                </StudentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/*"
            element={
              <ProtectedRoute role="student">
                <StudentLayout>
                  <Routes>
                    <Route path="profile" element={<JoinRoom />} />
                    <Route path="join" element={<JoinRoom />} />
                    <Route path="*" element={<Navigate to="profile" replace />} />
                  </Routes>
                </StudentLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
