import { useState } from "react";
import { useActivityStore } from "../store/activities";

type QuickActionProps = {
  petId?: number;
};

const QuickActions = ({ petId }: QuickActionProps) => {
  const logQuick = useActivityStore((s) => s.logQuick);
  const [walkStart, setWalkStart] = useState<Date | null>(null);
  const [playStart, setPlayStart] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  // 軽いタイマー更新用
  useState(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  });

  const formatElapsed = (start: Date | null) => {
    if (!start) return "";
    const diffSec = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

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
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <ActionCard
          color="bg-[#d07355]"
          title="Meal"
          subtitle="Start"
          onClick={() => handleCount("meal")}
          icon="🍽"
        />
        <ActionCard
          color="bg-[#4b89dc]"
          title="Walk"
          subtitle={walkStart ? `経過 ${formatElapsed(walkStart)}` : "Start"}
          onClick={() => handleTimerToggle("walk")}
          icon={walkStart ? "⏹" : "▶"}
          active={Boolean(walkStart)}
        />
        <ActionCard
          color="bg-[#e6b43c]"
          title="Play"
          subtitle={playStart ? `経過 ${formatElapsed(playStart)}` : "Start"}
          onClick={() => handleTimerToggle("play")}
          icon={playStart ? "⏹" : "▶"}
          active={Boolean(playStart)}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MiniAction label="Treat" icon="🦴" onClick={() => handleCount("treat")} />
        <MiniAction label="Poop" icon="💩" onClick={() => handleCount("poop")} />
        <MiniAction label="Care" icon="🐾" onClick={() => handleCount("care")} />
      </div>
    </div>
  );
};

const ActionCard = ({
  color,
  title,
  subtitle,
  onClick,
  icon,
  active,
}: {
  color: string;
  title: string;
  subtitle: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`${color} rounded-2xl px-3 py-4 text-left text-white shadow-md border border-black/5 active:scale-95 transition ${
      active ? "brightness-110" : ""
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      {active && (
        <span className="rounded-full bg-white/30 px-2 py-0.5 text-[10px] font-semibold text-white/90">
          Recording
        </span>
      )}
    </div>
    <p className="mt-3 text-lg font-bold leading-none">{title}</p>
    <p className={`text-sm opacity-90 ${active ? "text-white" : ""}`}>{subtitle}</p>
    {active && (
      <p className="mt-1 text-xs font-semibold text-white/90 flex items-center gap-1">
        ⏹ 停止するにはもう一度タップ
      </p>
    )}
  </button>
);

const MiniAction = ({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="rounded-2xl border border-primary/15 bg-white px-3 py-3 shadow-sm flex flex-col items-center gap-1 text-primary active:scale-95 transition"
  >
    <span className="text-xl">{icon}</span>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

export default QuickActions;
