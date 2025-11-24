import { useEffect, useRef } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/Auth";
import PetSetupPage from "./pages/PetSetup";
import HomePage from "./pages/Home";
import DashboardPage from "./pages/Dashboard";
import ActivitiesPage from "./pages/Activities";
import { useAuthStore } from "./store/auth";
import { usePetStore } from "./store/pets";

const App = () => {
  const { session, logout, restoreSession } = useAuthStore();
  const location = useLocation();
  const authed = Boolean(session);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const navItems = [
    { to: "/", label: "ホーム" },
    { to: "/setup", label: "ペット登録" },
    { to: "/activities", label: "記録編集" },
    { to: "/dashboard", label: "ダッシュボード" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg to-[#fdf3e6]">
      <header className="flex items-center justify-between p-4">
        <Link to="/" className="text-lg font-bold text-primary">
          ぺっとじかん
        </Link>
        <nav className="flex items-center gap-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-1 rounded-full text-sm ${
                location.pathname === item.to
                  ? "bg-primary text-bg shadow-lg"
                  : "bg-white text-primary border border-primary/30 shadow-sm"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {authed && (
            <button
              onClick={() => logout()}
              className="rounded-full bg-white px-3 py-1 text-sm text-primary border border-primary/30 shadow-sm hover:bg-primary/10"
            >
              ログアウト
            </button>
          )}
        </nav>
      </header>
      <main className="p-4">
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

  // ペット未登録時はセットアップへ案内（それ以外は遷移を許可）
  if (loaded && !hasPets && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return element;
};

export default App;
