import { useEffect, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { useStatsStore } from "../store/stats";
import { usePetStore } from "../store/pets";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, BarElement);

const periodLabel: Record<"week" | "month" | "year" | "all", string> = {
  week: "1週間",
  month: "1か月",
  year: "1年",
  all: "ぜんぶ",
};

const palette = {
  text: "#2f2a25",
  accent: "#c2aa8e",
  primary: "#5c8f6b",
  bar: "#8ab38a",
  line: "#b58f66",
  bgPill: "#e5d7c5",
  grid: "#e9dfd2",
};

const DashboardPage = () => {
  const { range, loadRange } = useStatsStore();
  const { selectedPetId, pets, load: loadPets } = usePetStore();
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all">("week");

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  useEffect(() => {
    loadRange(period, selectedPetId ?? undefined);
  }, [loadRange, period, selectedPetId]);

  const data = range?.days ?? [];
  const labels = data.map((d) => d.date.slice(5));
  const activePet = pets.find((p) => p.id === selectedPetId);
  const mealTarget = 2;

  const walkPlay = {
    labels,
    datasets: [
      {
        label: "散歩(分)",
        data: data.map((d) => d.walk_min ?? 0),
        borderColor: palette.primary,
        backgroundColor: "rgba(92,143,107,0.35)",
        borderWidth: 0,
      },
      {
        label: "あそび(分)",
        data: data.map((d) => d.play_min ?? 0),
        borderColor: palette.accent,
        backgroundColor: "rgba(194,170,142,0.35)",
        borderWidth: 0,
      },
    ],
  };

  const mealChart = {
    labels,
    datasets: [
      {
        label: "ごはん(回)",
        data: data.map((d) => d.meal_count ?? 0),
        backgroundColor: palette.accent,
      },
      {
        type: "line" as const,
        label: "目標(2回)",
        data: labels.map(() => mealTarget),
        borderColor: palette.line,
        borderWidth: 1.5,
        pointRadius: 0,
        borderDash: [6, 4],
        yAxisID: "y",
      },
    ],
  };

  const counts = {
    labels,
    datasets: [
      {
        label: "おやつ(回)",
        data: data.map((d) => d.treat_count ?? 0),
        backgroundColor: "#d4b46b",
      },
      {
        label: "うんち(回)",
        data: data.map((d) => d.poop_count ?? 0),
        backgroundColor: "#d7b3a1",
      },
      {
        label: "ケア(回)",
        data: data.map((d) => d.care_count ?? 0),
        backgroundColor: "#9ab8cc",
      },
    ],
  };

  const bestDay = data.reduce(
    (acc, d) => {
      const score =
        (d.walk_min ?? 0) +
        (d.play_min ?? 0) +
        (d.meal_count ?? 0) +
        (d.treat_count ?? 0) +
        (d.poop_count ?? 0) +
        (d.care_count ?? 0);
      return score > acc.score ? { score, label: d.date } : acc;
    },
    { score: 0, label: "" },
  );

  return (
    <div className="space-y-4 rounded-3xl bg-white p-4 shadow-lg border border-primary/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{periodLabel[period]}</p>
          <h2 className="text-lg font-semibold text-ink">{activePet?.name ?? "ペット未選択"}</h2>
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-full p-1" style={{ background: palette.bgPill }}>
          {(["week", "month", "year", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold transition whitespace-nowrap ${
                period === p ? "bg-primary text-white shadow" : "text-primary"
              }`}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <SummaryCard title="散歩合計" value={`${Math.round(data.reduce((s, d) => s + (d.walk_min ?? 0), 0))} 分`} tone="bar" />
        <SummaryCard title="遊び合計" value={`${Math.round(data.reduce((s, d) => s + (d.play_min ?? 0), 0))} 分`} tone="accent" />
        <SummaryCard title="ごはん合計" value={`${Math.round(data.reduce((s, d) => s + (d.meal_count ?? 0), 0))} 回`} tone="meal" />
        <SummaryCard title="おやつ合計" value={`${Math.round(data.reduce((s, d) => s + (d.treat_count ?? 0), 0))} 回`} tone="treat" />
        <SummaryCard title="うんち合計" value={`${Math.round(data.reduce((s, d) => s + (d.poop_count ?? 0), 0))} 回`} tone="poop" />
        <SummaryCard title="ケア合計" value={`${Math.round(data.reduce((s, d) => s + (d.care_count ?? 0), 0))} 回`} tone="care" />
      </div>

      <div className="grid gap-4">
        <div className="bg-white p-3 rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
          <p className="mb-2 text-base font-semibold text-ink">Walk & Play Duration</p>
          <div className="h-64 w-full overflow-x-auto">
            <Bar
              data={walkPlay}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, min: 0, grid: { color: palette.grid } },
                  x: { grid: { color: "transparent" } },
                },
                plugins: { legend: { labels: { color: palette.text } } },
              }}
            />
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
          <p className="mb-2 text-base font-semibold text-ink">Meals</p>
          <div className="h-64 w-full overflow-x-auto">
            <Line
              data={mealChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, min: 0, suggestedMax: 3, grid: { color: palette.grid } },
                  x: { grid: { color: "transparent" } },
                },
                plugins: { legend: { labels: { color: palette.text } } },
              }}
            />
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
          <p className="mb-2 text-base font-semibold text-ink">Other Counts</p>
          <div className="h-64 w-full overflow-x-auto">
            <Bar
              data={counts}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, min: 0, grid: { color: palette.grid } },
                  x: { grid: { color: "transparent" } },
                },
                plugins: { legend: { labels: { color: palette.text } } },
              }}
            />
          </div>
        </div>
      </div>

      {bestDay.label && (
        <div className="rounded-xl bg-[#f6efe6] text-ink p-3 text-sm">
          ベストな日: {bestDay.label} (スコア {Math.round(bestDay.score)})
        </div>
      )}
    </div>
  );
};

const toneBg: Record<string, string> = {
  bar: "bg-[#f0efe8] text-[#2f2a25]",
  accent: "bg-[#f3ede5] text-[#2f2a25]",
  meal: "bg-[#f6ebe2] text-[#2f2a25]",
  treat: "bg-[#f7f0e2] text-[#2f2a25]",
  poop: "bg-[#f4ede7] text-[#2f2a25]",
  care: "bg-[#eaf1f6] text-[#2f2a25]",
};

const SummaryCard = ({ title, value, tone = "bar" }: { title: string; value: string; tone?: string }) => (
  <div className={`rounded-2xl border border-primary/10 shadow-sm p-4 text-ink ${toneBg[tone] ?? toneBg.bar}`}>
    <p className="text-sm text-slate-600">{title}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default DashboardPage;
