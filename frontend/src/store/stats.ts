import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { addDays } from "../utils/date";

export type DailyStat = {
  date: string;
  walk_min: number;
  play_min: number;
  treat_count: number;
  care_count: number;
  streak_info?: number | null;
};

export type WeeklyResponse = {
  start: string;
  end: string;
  days: Array<DailyStat & { change_vs_last_week?: number | null }>;
};

type State = {
  daily?: DailyStat;
  weekly?: WeeklyResponse;
  loadDaily: (date: string) => Promise<void>;
  loadWeekly: (start: string) => Promise<void>;
};

export const useStatsStore = create<State>((set) => ({
  daily: undefined,
  weekly: undefined,
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
  loadWeekly: async (start) => {
    const startDate = new Date(start);
    const endDate = addDays(startDate, 7);
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .gte("started_at", startDate.toISOString())
      .lt("started_at", endDate.toISOString());
    if (error) {
      console.error(error);
      return;
    }
    const days: WeeklyResponse["days"] = [];
    for (let i = 0; i < 7; i++) {
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
    set({ weekly: { start: startDate.toISOString(), end: endDate.toISOString(), days } });
  },
}));
