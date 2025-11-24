import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { usePetStore } from "../store/pets";

const AuthPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const loadPets = usePetStore((s) => s.load);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "signup") {
        await signup(email, password);
      }
      await login(email, password);
      await loadPets();
      const hasPets = usePetStore.getState().pets.length > 0;
      navigate(hasPets ? "/" : "/setup");
    } catch (err: any) {
      setError(err?.message ?? "Failed to authenticate");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-xl border border-primary/10">
      <h1 className="text-2xl font-bold text-primary mb-2">
        {mode === "login" ? "おかえり！" : "ようこそ！"}
      </h1>
      <p className="text-sm text-slate-700 mb-4">今日の記録からスタートしよう。</p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="w-full rounded-lg border border-primary/20 bg-white p-3 text-slate-800 placeholder-slate-400"
          type="email"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード（6文字以上）"
          className="w-full rounded-lg border border-primary/20 bg-white p-3 text-slate-800 placeholder-slate-400"
          type="password"
          required
          minLength={6}
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button className="w-full rounded-lg bg-primary py-3 font-semibold text-white">
          {mode === "login" ? "ログイン" : "アカウント作成"}
        </button>
      </form>
      <button
        className="mt-4 text-sm text-slate-600 underline"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "初めての方はこちら" : "すでにアカウントをお持ちですか？"}
      </button>
    </div>
  );
};

export default AuthPage;
