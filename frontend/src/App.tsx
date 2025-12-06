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
    <div className="min-h-screen bg-gradient-to-br from-bg to-[#fdf3e6]">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-[#fdf3e6]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary tracking-tight">
            <img src="/logo.png" alt="PetLeaf" className="h-[52px] w-auto object-contain" />
          </Link>
          {authed ? (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-md border border-primary/10 active:scale-95 transition"
              aria-label="メニュー"
            >
              <span className="text-xl">☰</span>
            </button>
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
    </div>
  );
};

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
