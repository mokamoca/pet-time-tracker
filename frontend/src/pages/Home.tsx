import { useEffect, useMemo } from "react";
import QuickActions from "../components/QuickActions";
import { usePetStore } from "../store/pets";
import { useStatsStore } from "../store/stats";
import { useState, useRef } from "react";

const HomePage = () => {
  const { pets, load } = usePetStore();
  const { daily, loadDaily } = useStatsStore();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    load();
    loadDaily(today);
  }, [load, loadDaily, today]);

  const activePetId = pets[0]?.id;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow p-6 border border-primary/10">
        <div className="relative max-w-xl">
          <h2 className="text-xl font-semibold text-primary">こんにちは！</h2>
          <p className="text-sm text-slate-700">ワンちゃんとの大切な時間を1タップでメモしよう。</p>
          <p className="mt-2 text-xs text-slate-500">ちょっとした瞬間も、今日の思い出に。</p>
        </div>
      </div>
      <section className="rounded-2xl bg-white p-4 shadow-lg border border-primary/10">
        <h2 className="mb-3 text-lg font-semibold text-primary">今日の「いいコ」をサッと記録</h2>
        <QuickActions petId={activePetId} />
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-lg border border-primary/10">
        <h3 className="text-lg font-semibold text-primary">今日のサマリ</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
          <StatCard label="散歩" value={`${daily?.walk_min ?? 0} 分`} flashValue={daily?.walk_min ?? 0} />
          <StatCard label="遊び" value={`${daily?.play_min ?? 0} 分`} flashValue={daily?.play_min ?? 0} />
          <StatCard label="おやつ" value={`${daily?.treat_count ?? 0} 回`} flashValue={daily?.treat_count ?? 0} />
          <StatCard label="ケア" value={`${daily?.care_count ?? 0} 回`} flashValue={daily?.care_count ?? 0} />
        </div>
        <p className="mt-2 text-xs text-green-600">
          {daily?.streak_info ? `連続 ${daily.streak_info} 日キープ中！` : "最初の記録をつけてみよう"}
        </p>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, flashValue }: { label: string; value: string; flashValue: number }) => {
  const [flash, setFlash] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setFlash(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setFlash(false), 400);
  }, [flashValue]);

  return (
    <div className="rounded-xl bg-white p-3 border border-primary/10 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`text-lg font-semibold text-primary transition ${
          flash ? "animate-pulse drop-shadow-sm" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default HomePage;
