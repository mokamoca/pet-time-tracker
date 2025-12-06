import { useEffect, useMemo, useRef, useState } from "react";
import QuickActions from "../components/QuickActions";
import { usePetStore } from "../store/pets";
import { useStatsStore } from "../store/stats";

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
    <div className="space-y-5 pb-4">
      <div className="rounded-2xl bg-white shadow p-4 sm:p-5 border border-primary/10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">🐕</div>
        <div>
          <h2 className="text-lg font-semibold text-primary">今日のわんメモ</h2>
          <p className="text-xs text-slate-600">すぐ書ける、すぐ振り返る。</p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border border-primary/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">なにしよう？</h2>
        </div>
        <QuickActions petId={activePetId} />
      </section>

      <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border border-primary/10">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-primary">本日の記録</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm text-slate-700">
          <StatCard label="散歩" value={`${daily?.walk_min ?? 0} 分`} flashValue={daily?.walk_min ?? 0} />
          <StatCard label="遊び" value={`${daily?.play_min ?? 0} 分`} flashValue={daily?.play_min ?? 0} />
          <StatCard label="おやつ" value={`${daily?.treat_count ?? 0} 回`} flashValue={daily?.treat_count ?? 0} />
          <StatCard label="ケア" value={`${daily?.care_count ?? 0} 回`} flashValue={daily?.care_count ?? 0} />
        </div>
        <p className="mt-2 text-xs text-green-600">
          {daily?.streak_info ? `連続 ${daily.streak_info} 日目！` : "最初の記録をつけてみよう"}
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
    <div className="rounded-xl bg-white p-3 sm:p-4 border border-primary/10 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-semibold text-primary transition ${flash ? "animate-pulse drop-shadow-sm" : ""}`}>
        {value}
      </p>
    </div>
  );
};

export default HomePage;
