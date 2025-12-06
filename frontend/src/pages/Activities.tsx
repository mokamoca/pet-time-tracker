import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, useActivityStore } from "../store/activities";
import { usePetStore } from "../store/pets";

const activityLabels: Record<string, string> = {
  walk: "散歩",
  play: "あそび",
  meal: "ごはん",
  treat: "おやつ",
  poop: "うんち",
  care: "ケア",
};

const activityIcons: Record<string, string> = {
  walk: "🚶",
  play: "▶",
  meal: "🍽",
  treat: "🦴",
  poop: "💩",
  care: "🐾",
};

const toTimeInput = (iso: string) => {
  const d = new Date(iso);
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mm = `${d.getMinutes()}`.padStart(2, "0");
  return `${hh}:${mm}`;
};

const applyTimeToIso = (iso: string, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const base = new Date(iso);
  base.setHours(hours);
  base.setMinutes(minutes);
  return base.toISOString();
};

const displayDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
};

const ActivitiesPage = () => {
  const { activities, load, update, remove } = useActivityStore();
  const { pets, selectedPetId, load: loadPets } = usePetStore();
  const [limit] = useState(20);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  useEffect(() => {
    load(selectedPetId ?? undefined);
  }, [load, selectedPetId]);

  if (!selectedPetId || pets.length === 0) {
    return (
      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-lg border border-primary/10">
        <p className="text-sm text-slate-600">ペットが未選択です。ホーム画面でペットを選択してください。</p>
      </div>
    );
  }

  const recentActivities = useMemo(() => activities.slice(0, limit), [activities, limit]);

  return (
    <div className="relative">
      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-lg border border-primary/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <h2 className="text-lg font-semibold text-primary">最近の記録</h2>
        </div>
        <div className="space-y-3">
          {recentActivities.length === 0 && <p className="text-sm text-slate-600">まだ記録がありません</p>}
          {recentActivities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} onSave={update} onDelete={remove} />
          ))}
        </div>
      </div>
      <Link
        to="/"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white text-3xl shadow-xl border border-primary/20 active:scale-95 transition"
        aria-label="新規記録（ホームへ）"
      >
        +
      </Link>
    </div>
  );
};

const ActivityRow = ({
  activity,
  onSave,
  onDelete,
}: {
  activity: Activity;
  onSave: (id: number, payload: Partial<Pick<Activity, "amount" | "started_at">>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) => {
  const [amount, setAmount] = useState(activity.amount.toString());
  const [time, setTime] = useState(toTimeInput(activity.started_at));
  const dirtyRef = useRef(false);

  useEffect(() => {
    setAmount(activity.amount.toString());
    setTime(toTimeInput(activity.started_at));
    dirtyRef.current = false;
  }, [activity.amount, activity.started_at]);

  const persist = useCallback(async () => {
    if (!dirtyRef.current) return;
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      dirtyRef.current = false;
      setAmount("1");
      return;
    }
    dirtyRef.current = false;
    await onSave(activity.id, {
      amount: parsedAmount,
      started_at: applyTimeToIso(activity.started_at, time),
    });
  }, [activity.id, activity.started_at, amount, time, onSave]);

  useEffect(() => {
    dirtyRef.current = true;
    const timer = window.setTimeout(() => {
      void persist();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [amount, time, persist]);

  const handleDelete = async () => {
    await onDelete(activity.id);
  };

  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-3 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
          {activityIcons[activity.type] ?? "📝"}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {displayDate(activity.started_at)} / {toTimeInput(activity.started_at)}
              </p>
              <p className="text-xs text-slate-500">{activityLabels[activity.type] ?? activity.type}</p>
            </div>
            <span className="text-primary text-lg">✏️</span>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="text-xs text-slate-600">
              量 / 回数
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => {
                  const n = Number(amount);
                  if (!Number.isFinite(n) || n <= 0) setAmount("1");
                }}
                className="mt-1 w-full rounded-md border border-primary/20 bg-white p-2 text-slate-800"
              />
            </label>
            <label className="text-xs text-slate-600">
              時間
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded-md border border-primary/20 bg-white p-2 text-slate-800"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 shadow-sm transition active:scale-95 active:translate-y-[1px]"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
