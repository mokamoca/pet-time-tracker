import { useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/Auth";
import PetSetupPage from "./pages/PetSetup";
import HomePage from "./pages/Home";
import DashboardPage from "./pages/Dashboard";
import ActivitiesPage from "./pages/Activities";
import { useAuthStore } from "./store/auth";
import { usePetStore } from "./store/pets";

const navItems = [
  { to: "/", label: "ホーム", icon: "🏠" },
  { to: "/setup", label: "ペット登録", icon: "🐾" },
  { to: "/activities", label: "記録編集", icon: "✏️" },
  { to: "/dashboard", label: "ダッシュボード", icon: "📊" },
];

const App = () => {
  const { session, logout, restoreSession } = useAuthStore();
  const location = useLocation();
  const authed = Boolean(session);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg to-[#fdf3e6] pb-20">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-[#fdf3e6]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary tracking-tight">
            <img src="/logo.png" alt="PetLeaf" className="h-[52px] w-auto object-contain" />
          </Link>
          {authed ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-md border border-primary/10 active:scale-95 transition"
                aria-label="アカウント"
              >
                <IconUser />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20 bg-black/25"
                    onClick={() => setMenuOpen(false)}
                    role="presentation"
                  />
                  <div className="absolute right-0 mt-2 z-30 w-40 rounded-2xl bg-white p-2 shadow-2xl border border-primary/10">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 text-left"
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {navItems
                .filter((i) => i.to === "/")
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow"
                  >
                    {item.label}
                  </Link>
                ))}
            </div>
          )}
        </div>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-20 bg-black/25"
              onClick={() => setMenuOpen(false)}
              role="presentation"
            />
            <div className="fixed right-3 top-16 z-30 w-[82vw] max-w-xs rounded-2xl bg-white p-4 shadow-2xl border border-primary/10">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      location.pathname === item.to
                        ? "bg-primary text-white shadow-md"
                        : "bg-primary/5 text-primary border border-primary/10"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-primary border border-primary/10 shadow-sm active:scale-95 transition"
                >
                  <span className="text-lg">🚪</span>
                  <span>ログアウト</span>
                </button>
              </nav>
            </div>
          </>
        )}
      </header>
      <main className="mx-auto max-w-3xl p-4 pb-10">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/setup" element={<Protected authed={authed} element={<PetSetupPage />} />} />
          <Route path="/" element={<Protected authed={authed} element={<HomePage />} />} />
          <Route path="/activities" element={<Protected authed={authed} element={<ActivitiesPage />} />} />
          <Route path="/dashboard" element={<Protected authed={authed} element={<DashboardPage />} />} />
        </Routes>
      </main>
      {authed && (
        <nav className="fixed bottom-2 left-1/2 z-40 w-[94%] max-w-3xl -translate-x-1/2 rounded-full border border-primary/10 bg-white/90 shadow-lg backdrop-blur px-4 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const iconMap: Record<string, JSX.Element> = {
              "/": <IconHome />,
              "/setup": <IconPaw />,
              "/activities": <IconEdit />,
              "/dashboard": <IconChart />,
            };
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center text-[11px] font-semibold transition ${
                  active ? "text-primary" : "text-slate-500"
                }`}
              >
                <span className="leading-none">{iconMap[item.to] ?? <IconHome />}</span>
                <span className="leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5 12 3l9 6.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
  </svg>
);

const IconPaw = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="8" r="2.5" />
    <circle cx="19" cy="8" r="2.5" />
    <circle cx="8.5" cy="5" r="2" />
    <circle cx="15.5" cy="5" r="2" />
    <path d="M12 13c-3.5-1.5-7 1-6 4 1 3 5 3 6 0 1 3 5 3 6 0 1-3-2.5-5.5-6-4Z" />
  </svg>
);

const IconEdit = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z" />
  </svg>
);

const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="4" height="8" rx="1" />
    <rect x="10" y="8" width="4" height="12" rx="1" />
    <rect x="17" y="4" width="4" height="16" rx="1" />
  </svg>
);

const Protected = ({ authed, element }: { authed: boolean; element: JSX.Element }) => {
  const { pets, load, loaded } = usePetStore();
  const location = useLocation();
  const hasPets = pets.length > 0;
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (authed && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      load();
    }
  }, [authed, load]);

  if (!authed) return <Navigate to="/auth" replace />;

  // ペット未登録時はセットアップページへ誘導し、それ以外の遷移を防ぐ
  if (loaded && !hasPets && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return element;
};

export default App;

const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);
