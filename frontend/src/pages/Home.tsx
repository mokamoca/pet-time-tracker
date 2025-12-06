import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import QuickActions from "../components/QuickActions";
import { usePetStore } from "../store/pets";
import { useStatsStore } from "../store/stats";

const HomePage = () => {
  const { pets, load, selectedPetId, selectPet } = usePetStore();
  const { daily, loadDaily } = useStatsStore();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedPetId || pets.length > 0) {
      const petId = selectedPetId ?? pets[0]?.id;
      if (petId) {
        selectPet(petId);
        loadDaily(today, petId);
      }
    }
  }, [selectedPetId, pets, loadDaily, today, selectPet]);

  const activePetId = selectedPetId ?? pets[0]?.id;

  return (
    <div className="space-y-5 pb-4">
      {pets.length === 0 ? (
        <div className="rounded-2xl bg-white shadow p-4 sm:p-5 border border-primary/10 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-primary">ペットを登録しましょう</h2>
          <p className="text-sm text-slate-600">まずはペット登録ページから追加してください。</p>
          <Link
            to="/setup"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow"
          >
            ペットを登録する
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow p-4 sm:p-5 border border-primary/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center border border-primary/10">
              {pets.find((p) => p.id === activePetId)?.photo_url ? (
                <img
                  src={pets.find((p) => p.id === activePetId)!.photo_url!}
                  alt={pets.find((p) => p.id === activePetId)!.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl">🐾</span>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500">表示中のペット</p>
              <h2 className="text-lg font-semibold text-primary">
                {pets.find((p) => p.id === activePetId)?.name ?? "ペット未選択"}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPet(p.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition ${
                  p.id === activePetId ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary/30"
                }`}
              >
                <span className="h-6 w-6 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    "🐾"
                  )}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border border-primary/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">なにしよう？</h2>
        </div>
        <QuickActions petId={activePetId ?? undefined} />
      </section>

      <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border border-primary/10">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-primary">本日の記録</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm text-slate-700">
          <StatCard label="散歩" value={`${daily?.walk_min ?? 0} 分`} flashValue={daily?.walk_min ?? 0} />
          <StatCard label="遊び" value={`${daily?.play_min ?? 0} 分`} flashValue={daily?.play_min ?? 0} />
          <StatCard
            label="ごはん"
            value={`${daily?.meal_count ?? 0} 回`}
            flashValue={daily?.meal_count ?? 0}
            note={`目標2回: ${(daily?.meal_count ?? 0)} / 2`}
            emphasize={daily ? (daily.meal_count ?? 0) < 2 : false}
          />
          <StatCard label="おやつ" value={`${daily?.treat_count ?? 0} 回`} flashValue={daily?.treat_count ?? 0} />
          <StatCard label="うんち" value={`${daily?.poop_count ?? 0} 回`} flashValue={daily?.poop_count ?? 0} />
          <StatCard label="ケア" value={`${daily?.care_count ?? 0} 回`} flashValue={daily?.care_count ?? 0} />
        </div>
        <p className="mt-2 text-xs text-green-600">
          {daily?.streak_info ? `連続 ${daily.streak_info} 日目！` : "最初の記録をつけてみよう"}
        </p>
      </section>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  flashValue,
  note,
  emphasize = false,
}: {
  label: string;
  value: string;
  flashValue: number;
  note?: string;
  emphasize?: boolean;
}) => {
  const [flash, setFlash] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setFlash(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setFlash(false), 400);
  }, [flashValue]);

  return (
    <div
      className={`rounded-xl p-3 sm:p-4 border border-primary/10 shadow-sm ${
        emphasize ? "bg-accent/10" : "bg-white"
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-semibold text-primary transition ${flash ? "animate-pulse drop-shadow-sm" : ""}`}>
        {value}
      </p>
      {note && <p className="text-[11px] text-slate-500 mt-1">{note}</p>}
    </div>
  );
};

export default HomePage;
