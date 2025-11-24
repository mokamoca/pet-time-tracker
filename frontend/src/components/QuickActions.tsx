import { useActivityStore } from "../store/activities";
import { useState } from "react";

type QuickActionProps = {
  petId?: number;
};

const actions = [
  { type: "walk", label: "おさんぽ", unit: "min", color: "bg-primary/80" },
  { type: "play", label: "あそび", unit: "min", color: "bg-mint" },
  { type: "treat", label: "おやつ", unit: "count", color: "bg-accent" },
  { type: "care", label: "ケア", unit: "count", color: "bg-[#9ad0ff]" },
];

const QuickActions = ({ petId }: QuickActionProps) => {
  const logQuick = useActivityStore((s) => s.logQuick);
  const [walkStart, setWalkStart] = useState<Date | null>(null);
  const [playStart, setPlayStart] = useState<Date | null>(null);

  const handleTimerToggle = async (type: "walk" | "play") => {
    const isWalk = type === "walk";
    const startState = isWalk ? walkStart : playStart;
    if (!startState) {
      const start = new Date();
      isWalk ? setWalkStart(start) : setPlayStart(start);
      return;
    }
    const end = new Date();
    const minutes = Math.max(1, Math.round((end.getTime() - startState.getTime()) / 60000));
    await logQuick(type, minutes, "min", petId, startState.toISOString(), end.toISOString());
    isWalk ? setWalkStart(null) : setPlayStart(null);
  };

  const handleCount = async (type: "treat" | "care") => {
    const nowIso = new Date().toISOString();
    await logQuick(type, 1, "count", petId, nowIso, nowIso);
  };

  const Icon = ({ type }: { type: "walk" | "play" | "treat" | "care" }) => {
    if (type === "walk") {
      return (
        <svg className="absolute right-2 top-2 h-8 w-8 opacity-70" viewBox="0 0 64 64" fill="none">
          <path d="M18 26c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7Z" stroke="white" strokeWidth="4" />
          <path d="M32 20c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5Z" stroke="white" strokeWidth="4" />
          <path d="M41 28c-3 0-5 2-5 4.5S38 37 41 37s5-2.5 5-5-2-4-5-4Z" stroke="white" strokeWidth="4" />
        </svg>
      );
    }
    if (type === "play") {
      return (
        <svg className="absolute right-2 top-2 h-8 w-8 opacity-70" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="14" stroke="white" strokeWidth="4" />
          <path d="M26 26 40 32 26 38Z" fill="white" />
        </svg>
      );
    }
    if (type === "treat") {
      return (
        <svg className="absolute right-2 top-2 h-8 w-8 opacity-70" viewBox="0 0 64 64" fill="none">
          <path d="M16 32c0-6 5-11 11-11h10c6 0 11 5 11 11s-5 11-11 11H27C21 43 16 38 16 32Z" stroke="white" strokeWidth="4" />
          <path d="M26 24s-2-6-8-6-6 9 2 9" stroke="white" strokeWidth="4" />
          <path d="M38 40s2 6 8 6 6-9-2-9" stroke="white" strokeWidth="4" />
        </svg>
      );
    }
    return (
      <svg className="absolute right-2 top-2 h-8 w-8 opacity-70" viewBox="0 0 64 64" fill="none">
        <path d="M32 40c-6 6-14 4-16-3-2-6 2-11 6-12 3-1 7 0 10 3 3-3 7-4 10-3 4 1 8 6 6 12-2 7-10 9-16 3Z" stroke="white" strokeWidth="4" />
        <path d="M32 26v-6" stroke="white" strokeWidth="4" />
        <path d="M26 20h12" stroke="white" strokeWidth="4" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        className={`${actions[0].color} relative overflow-hidden rounded-xl py-4 text-lg font-semibold text-white shadow-md active:scale-95 transition-transform border border-black/5`}
        onClick={() => handleTimerToggle("walk")}
      >
        <Icon type="walk" />
        {walkStart ? "おさんぽ中…ここでゴール！" : "おさんぽスタート"}
      </button>
      <button
        className={`${actions[1].color} relative overflow-hidden rounded-xl py-4 text-lg font-semibold text-white shadow-md active:scale-95 transition-transform border border-black/5`}
        onClick={() => handleTimerToggle("play")}
      >
        <Icon type="play" />
        {playStart ? "あそび中…ここでストップ！" : "あそびスタート"}
      </button>
      <button
        className={`${actions[2].color} relative overflow-hidden rounded-xl py-4 text-lg font-semibold text-white shadow-md active:scale-95 transition-transform border border-black/5`}
        onClick={() => handleCount("treat")}
      >
        <Icon type="treat" />
        おやつあげた！
      </button>
      <button
        className={`${actions[3].color} relative overflow-hidden rounded-xl py-4 text-lg font-semibold text-white shadow-md active:scale-95 transition-transform border border-black/5`}
        onClick={() => handleCount("care")}
      >
        <Icon type="care" />
        ケアしたよ！
      </button>
    </div>
  );
};

export default QuickActions;
