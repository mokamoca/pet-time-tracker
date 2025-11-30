import { useActivityStore } from "../store/activities";
import { useState } from "react";

type QuickActionProps = {
  petId?: number;
};

type Action = {
  type: "walk" | "play" | "meal" | "treat" | "poop" | "care";
  label: string;
  unit: "min" | "count";
  color: string;
};

const sections: { title: string; actions: Action[] }[] = [
  {
    title: "なにしよう？",
    actions: [
      { type: "walk", label: "おさんぽ", unit: "min", color: "bg-primary/80" },
      { type: "play", label: "あそび", unit: "min", color: "bg-mint" },
    ],
  },
  {
    title: "おなかすいた？",
    actions: [
      { type: "meal", label: "ごはん", unit: "count", color: "bg-[#ffcf8d]" },
      { type: "treat", label: "おやつ", unit: "count", color: "bg-accent" },
    ],
  },
  {
    title: "げんきかな？",
    actions: [
      { type: "poop", label: "うんち", unit: "count", color: "bg-[#f4c1d9]" },
      { type: "care", label: "ケア", unit: "count", color: "bg-[#9ad0ff]" },
    ],
  },
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

  const handleCount = async (type: "meal" | "treat" | "poop" | "care") => {
    const nowIso = new Date().toISOString();
    await logQuick(type, 1, "count", petId, nowIso, nowIso);
  };

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="text-sm font-semibold text-primary/80">{section.title}</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {section.actions.map((action) => {
              const isTimer = action.type === "walk" || action.type === "play";
              const isWalk = action.type === "walk";
              const isPlay = action.type === "play";
              const label = action.label;
              const active = (isWalk && walkStart) || (isPlay && playStart);
              return (
                <button
                  key={action.type}
                  className={`${action.color} rounded-xl py-3 text-base sm:py-4 sm:text-lg font-semibold text-white shadow-md active:scale-95 transition-transform border border-black/5`}
                  onClick={() =>
                    isTimer ? handleTimerToggle(action.type) : handleCount(action.type as "meal" | "treat" | "poop" | "care")
                  }
                >
                  {isTimer ? (active ? "ストップ" : label) : label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
