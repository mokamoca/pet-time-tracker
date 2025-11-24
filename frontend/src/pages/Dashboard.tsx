import { useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useStatsStore } from "../store/stats";
import { startOfWeek } from "../utils/date";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, BarElement);

const DashboardPage = () => {
  const { weekly, loadWeekly } = useStatsStore();
  const start = useMemo(() => startOfWeek(new Date()).toISOString().slice(0, 10), []);

  useEffect(() => {
    loadWeekly(start);
  }, [loadWeekly, start]);

  const data = weekly?.days ?? [];
  const labels = data.map((d) => d.date.slice(5));
  const walkPlay = {
    labels,
    datasets: [
      {
        label: "散歩(分)",
        data: data.map((d) => d.walk_min ?? 0),
        borderColor: "#ff9eb0",
        backgroundColor: "rgba(255,158,176,0.2)",
      },
      {
        label: "あそび(分)",
        data: data.map((d) => d.play_min ?? 0),
        borderColor: "#a7e6c2",
        backgroundColor: "rgba(167,230,194,0.2)",
      },
    ],
  };
  const treatCare = {
    labels,
    datasets: [
      {
        label: "おやつ(回)",
        data: data.map((d) => d.treat_count ?? 0),
        backgroundColor: "#ffd166",
      },
      {
        label: "ケア(回)",
        data: data.map((d) => d.care_count ?? 0),
        backgroundColor: "#9ad0ff",
      },
    ],
  };

  const bestDay = data.reduce(
    (acc, d) => {
      const score = (d.walk_min ?? 0) + (d.play_min ?? 0) + (d.treat_count ?? 0);
      return score > acc.score ? { score, label: d.date } : acc;
    },
    { score: 0, label: "" },
  );

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-lg border border-primary/10">
      <h2 className="text-lg font-semibold text-primary">ダッシュボード（がんばり記録）</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="散歩合計" value={`${Math.round(data.reduce((s, d) => s + (d.walk_min ?? 0), 0))} 分`} />
        <SummaryCard title="遊び合計" value={`${Math.round(data.reduce((s, d) => s + (d.play_min ?? 0), 0))} 分`} />
        <SummaryCard title="おやつ合計" value={`${Math.round(data.reduce((s, d) => s + (d.treat_count ?? 0), 0))} 回`} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-3 rounded-xl border border-primary/10 shadow-sm">
          <p className="mb-2 text-sm text-slate-600">散歩・あそびの推移</p>
          <Line data={walkPlay} />
        </div>
        <div className="bg-white p-3 rounded-xl border border-primary/10 shadow-sm">
          <p className="mb-2 text-sm text-slate-600">おやつ・ケアの回数</p>
          <Bar data={treatCare} />
        </div>
      </div>
      {bestDay.label && (
        <div className="rounded-xl bg-primary/10 p-3 text-sm text-primary">
          いちばん充実した日: {bestDay.label}（スコア {Math.round(bestDay.score)}）
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value }: { title: string; value: string }) => (
  <div className="rounded-xl bg-white border border-primary/10 shadow-sm p-3">
    <p className="text-xs text-slate-500">{title}</p>
    <p className="text-lg font-semibold text-primary">{value}</p>
  </div>
);

export default DashboardPage;
