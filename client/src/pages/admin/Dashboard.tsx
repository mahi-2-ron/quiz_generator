import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, Play, LogOut, ChevronRight } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import type { Quiz } from '../../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DashboardTab = 'overview' | 'ai' | 'rooms' | 'stats';

interface TabItem {
  id: DashboardTab;
  icon: string;
  label: string;
}

type StatColor = 'blue' | 'pink' | 'green' | 'yellow';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: StatColor;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS: TabItem[] = [
  { id: 'overview', icon: '🏠', label: 'Overview' },
  { id: 'ai', icon: '✨', label: 'AI Generator' },
  { id: 'rooms', icon: '📡', label: 'Live Rooms' },
  { id: 'stats', icon: '📊', label: 'Analytics' },
];

const QUIZ_ICONS = ['📚', '🧪', '🌍', '🎨', '💻'] as const;

const STAT_COLOR_MAP: Record<StatColor, string> = {
  blue: 'bg-[var(--blue-l)] text-[var(--blue-d)]',
  pink: 'bg-[var(--pink-l)] text-[var(--pink-d)]',
  green: 'bg-[var(--green-l)] text-[var(--green-d)]',
  yellow: 'bg-[var(--yellow-l)] text-[var(--orange-d)]',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClass = STAT_COLOR_MAP[color];
  return (
    <div className="card p-6 border-none relative overflow-hidden group">
      <div className="relative z-10">
        <div className={cn('inline-flex p-3 rounded-[15px] mb-4 text-2xl animate-floating-2', colorClass)}>
          {icon}
        </div>
        <h3 className="text-3xl font-black text-[var(--text)] mb-0.5">{value}</h3>
        <p className="text-xs font-black text-[var(--muted)] uppercase tracking-wider">{label}</p>
      </div>
      <div className={cn('absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150', colorClass)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ['admin-quizzes'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Quiz[] }>('/quizzes');
      return res.data.data;
    },
  });

  const switchToAiTab = useCallback(() => setActiveTab('ai'), []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[25px] shadow-[var(--sh)]">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="w-16 h-16 rounded-full bg-[var(--purple-l)] flex items-center justify-center text-3xl border-4 border-white shadow-lg animate-floating-1"
          >
            👨‍🏫
          </div>
          <div>
            <h1 className="text-2xl font-heading text-[var(--text)]">
              Hello, {user?.name ?? 'Admin'}! 👋
            </h1>
            <p className="text-[var(--muted)] font-bold text-sm">
              Ready to create something amazing today?
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="btn border-2 border-[var(--red-l)] text-[var(--red)] hover:bg-[var(--red-l)] px-4"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Dashboard sections" className="flex flex-wrap gap-2 p-1.5 bg-[var(--purple-l)] rounded-[20px] w-full max-w-2xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            aria-controls={`tab-panel-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[15px] font-black text-sm transition-all',
              activeTab === t.id
                ? 'bg-[var(--purple)] text-white shadow-lg'
                : 'text-[var(--muted)] hover:text-[var(--purple)]'
            )}
          >
            <span aria-hidden="true">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Overview panel */}
      {activeTab === 'overview' && (
        <div id="tab-panel-overview" role="tabpanel" className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Quizzes" value={quizzes?.length ?? 0} icon="📚" color="blue" />
            <StatCard label="Active Rooms" value="0" icon="⚡" color="pink" />
            <StatCard label="Participants" value="-" icon="👥" color="green" />
            <StatCard label="Avg Score" value="-%" icon="🏆" color="yellow" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-xl font-heading text-[var(--text)] flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">⚡</span> Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <Link
                  to="/admin/quizzes/new"
                  className="flex items-center justify-between p-5 bg-white rounded-[20px] shadow-[var(--sh)] hover:shadow-[var(--sh2)] hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[15px] bg-[var(--purple-l)] text-[var(--purple)] flex items-center justify-center text-xl">
                      <Plus />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[var(--text)]">Create Manual</p>
                      <p className="text-xs font-bold text-[var(--muted)]">Build your questions</p>
                    </div>
                  </div>
                  <ChevronRight className="text-[var(--muted)] group-hover:text-[var(--purple)] transition-colors" />
                </Link>

                <button
                  onClick={switchToAiTab}
                  className="flex items-center justify-between p-5 bg-white rounded-[20px] shadow-[var(--sh)] hover:shadow-[var(--sh2)] hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[15px] bg-[var(--blue-l)] text-[var(--blue)] flex items-center justify-center text-xl">
                      <Sparkles />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[var(--text)]">AI Generator</p>
                      <p className="text-xs font-bold text-[var(--muted)]">Topic to Quiz in 10s</p>
                    </div>
                  </div>
                  <ChevronRight className="text-[var(--muted)] group-hover:text-[var(--blue)] transition-colors" />
                </button>

                <Link
                  to="/admin/rooms/new"
                  className="flex items-center justify-between p-5 bg-white rounded-[20px] shadow-[var(--sh)] hover:shadow-[var(--sh2)] hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[15px] bg-[var(--pink-l)] text-[var(--pink)] flex items-center justify-center text-xl">
                      <Play />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[var(--text)]">Host Live</p>
                      <p className="text-xs font-bold text-[var(--muted)]">Start a room now</p>
                    </div>
                  </div>
                  <ChevronRight className="text-[var(--muted)] group-hover:text-[var(--pink)] transition-colors" />
                </Link>
              </div>
            </div>

            {/* Quiz list */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-heading text-[var(--text)] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">📝</span> Your Quizzes
                </span>
                <Link to="/admin/quizzes/new" className="text-sm font-black text-[var(--purple)] hover:underline">
                  View All
                </Link>
              </h2>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="p-12 text-center card">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--purple)] mx-auto mb-4" aria-hidden="true" />
                    <p className="font-bold text-[var(--muted)]">Summoning your quizzes...</p>
                  </div>
                ) : quizzes && quizzes.length > 0 ? (
                  quizzes.map((quiz, idx) => (
                    <div key={quiz._id} className="card p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div
                          aria-hidden="true"
                          className="w-12 h-12 rounded-[15px] bg-[#F4F1FF] flex items-center justify-center text-2xl group-hover:bg-[var(--purple-l)] transition-colors"
                        >
                          {QUIZ_ICONS[idx % QUIZ_ICONS.length]}
                        </div>
                        <div>
                          <h4 className="font-black text-[var(--text)]">{quiz.title}</h4>
                          <p className="text-xs font-bold text-[var(--muted)]">
                            {quiz.questions.length} Questions • {quiz.status}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/admin/quizzes/${quiz._id}/edit`}
                        className="btn border-2 border-[var(--purple-l)] text-[var(--purple)] hover:bg-[var(--purple)] hover:text-white px-5 py-2"
                      >
                        Edit
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center card">
                    <div className="text-5xl mb-4" aria-hidden="true">📭</div>
                    <p className="font-black text-[var(--text)] text-lg">No Quizzes Found</p>
                    <p className="text-[var(--muted)] font-bold text-sm mb-6">
                      Your library is currently empty.
                    </p>
                    <Link to="/admin/quizzes/new" className="btn btn-p">
                      ✨ Create Your First Quiz
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator panel */}
      {activeTab === 'ai' && (
        <div id="tab-panel-ai" role="tabpanel" className="animate-pop p-12 text-center card bg-gradient-to-br from-white to-[var(--blue-l)]">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-5xl mx-auto mb-6 animate-floating-1" aria-hidden="true">
            ✨
          </div>
          <h2 className="text-2xl font-heading text-[var(--text)] mb-2">AI Question Generator</h2>
          <p className="max-w-md mx-auto text-[var(--muted)] font-bold mb-8">
            Enter a topic and our AI will craft the perfect quiz for you in seconds!
          </p>
          <div className="max-w-xl mx-auto flex gap-3">
            <label htmlFor="ai-topic" className="sr-only">Quiz topic</label>
            <input
              id="ai-topic"
              className="input"
              placeholder="e.g. World War II History or Photosynthesis..."
            />
            <button className="btn btn-p whitespace-nowrap">Generate ✨</button>
          </div>
          <div className="mt-12 opacity-40 grayscale flex justify-center gap-8 text-3xl" aria-hidden="true">
            <span>📝</span><span>🤖</span><span>✅</span>
          </div>
        </div>
      )}
    </div>
  );
}
