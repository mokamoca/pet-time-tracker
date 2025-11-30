import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { addDays, startOfDay } from "../utils/date";

export type DailyStat = {
  date: string;
  walk_min: number;
  play_min: number;
  treat_count: number;
  care_count: number;
  streak_info?: number | null;
};

type State = {
  daily?: DailyStat;
  range?: RangeResponse;
  lastPeriod: "week" | "month" | "year" | "all";
  loadDaily: (date: string) => Promise<void>;
  loadRange: (period: "week" | "month" | "year" | "all") => Promise<void>;
};

type RangeResponse = {
  start: string;
  end: string;
  days: Array<DailyStat & { change_vs_last_week?: number | null }>;
};

export const useStatsStore = create<State>((set) => ({
  daily: undefined,
  range: undefined,
  lastPeriod: "week",
  loadDaily: async (date) => {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .gte("started_at", start.toISOString())
      .lt("started_at", end.toISOString());
    if (error) {
      console.error(error);
      return;
    }
    const aggregate = { walk_min: 0, play_min: 0, treat_count: 0, care_count: 0 };
    data?.forEach((a) => {
      if (a.type === "walk") aggregate.walk_min += a.amount ?? 0;
      if (a.type === "play") aggregate.play_min += a.amount ?? 0;
      if (a.type === "treat") aggregate.treat_count += a.amount ?? 0;
      if (a.type === "care") aggregate.care_count += a.amount ?? 0;
    });
    set({
      daily: {
        date,
        ...aggregate,
        streak_info: null,
      },
    });
  },
  loadRange: async (period) => {
    set({ lastPeriod: period });
    const today = startOfDay(new Date());
    const tomorrowIso = addDays(today, 1).toISOString(); // include today fully
    let startDate = addDays(today, -6); // default: past 7 days including today
    let daysToFetch = 7;

    if (period === "month") {
      startDate = addDays(today, -29);
      daysToFetch = 30;
    }
    if (period === "year") {
      startDate = addDays(today, -364);
      daysToFetch = 365;
    }
    if (period === "all") {
      // fetch last 400 days to avoid huge payload; adjust if needed
      startDate = addDays(today, -399);
      daysToFetch = 400;
    }

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .gte("started_at", startOfDay(startDate).toISOString())
      .lt("started_at", tomorrowIso);
    if (error) {
      console.error(error);
      return;
    }
    const days: State["range"]["days"] = [];
    for (let i = 0; i < daysToFetch; i++) {
      const day = addDays(startDate, i);
      const dayStr = day.toISOString().slice(0, 10);
      const dayActs = data?.filter((a) => a.started_at.slice(0, 10) === dayStr) ?? [];
      const agg = { walk_min: 0, play_min: 0, treat_count: 0, care_count: 0 };
      dayActs.forEach((a) => {
        if (a.type === "walk") agg.walk_min += a.amount ?? 0;
        if (a.type === "play") agg.play_min += a.amount ?? 0;
        if (a.type === "treat") agg.treat_count += a.amount ?? 0;
        if (a.type === "care") agg.care_count += a.amount ?? 0;
      });
      days.push({ date: dayStr, ...agg, streak_info: null, change_vs_last_week: null });
    }
    set({ range: { start: startDate.toISOString(), end: nowIso, days } });
  },
}));
