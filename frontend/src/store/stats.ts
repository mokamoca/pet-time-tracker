import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { addDays, startOfDay } from "../utils/date";

export type DailyStat = {
  date: string;
  walk_min: number;
  play_min: number;
  meal_count: number;
  treat_count: number;
  poop_count: number;
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

const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ローカル日付の境界をUTCに補正した範囲を返す
const getLocalDayRangeUtc = (date: string) => {
  const localStart = startOfDay(new Date(date));
  const offsetMs = localStart.getTimezoneOffset() * 60000;
  const utcStart = new Date(localStart.getTime() - offsetMs);
  const utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000);
  return { utcStart, utcEnd };
};

// ISO文字列をローカル日付(YYYY-MM-DD)に変換
const isoToLocalDateStr = (iso: string) => {
  const d = new Date(iso);
  const offsetMs = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offsetMs);
  return local.toISOString().slice(0, 10);
};

export const useStatsStore = create<State>((set) => ({
  daily: undefined,
  range: undefined,
  lastPeriod: "week",
  // YYYY-MM-DD をローカルタイムで取得するユーティリティ
  formatLocalDate: (date: Date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  },
  loadDaily: async (date) => {
    const { utcStart, utcEnd } = getLocalDayRangeUtc(date);
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .gte("started_at", utcStart.toISOString())
      .lt("started_at", utcEnd.toISOString());
    if (error) {
      console.error(error);
      return;
    }
    const aggregate = { walk_min: 0, play_min: 0, meal_count: 0, treat_count: 0, poop_count: 0, care_count: 0 };
    data?.forEach((a) => {
      if (a.type === "walk") aggregate.walk_min += a.amount ?? 0;
      if (a.type === "play") aggregate.play_min += a.amount ?? 0;
      if (a.type === "meal") aggregate.meal_count += a.amount ?? 0;
      if (a.type === "treat") aggregate.treat_count += a.amount ?? 0;
      if (a.type === "poop") aggregate.poop_count += a.amount ?? 0;
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
    const todayLocal = startOfDay(new Date());
    const offsetMs = todayLocal.getTimezoneOffset() * 60000;
    const todayUtcStart = new Date(todayLocal.getTime() - offsetMs);
    const tomorrowUtc = new Date(todayUtcStart.getTime() + 24 * 60 * 60 * 1000); // include today fully

    let startDateLocal = addDays(todayLocal, -6); // default: past 7 days including today
    let daysToFetch = 7;

    if (period === "month") {
      startDateLocal = addDays(todayLocal, -29);
      daysToFetch = 30;
    }
    if (period === "year") {
      startDateLocal = addDays(todayLocal, -364);
      daysToFetch = 365;
    }
    if (period === "all") {
      // fetch last 400 days to avoid huge payload; adjust if needed
      startDateLocal = addDays(todayLocal, -399);
      daysToFetch = 400;
    }

    const startUtc = new Date(startDateLocal.getTime() - offsetMs);

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .gte("started_at", startUtc.toISOString())
      .lt("started_at", tomorrowUtc.toISOString());
    if (error) {
      console.error(error);
      return;
    }

    const days: State["range"]["days"] = [];
    for (let i = 0; i < daysToFetch; i++) {
      const dayLocal = addDays(startDateLocal, i);
      const dayStr = formatLocalDate(dayLocal);
      const dayActs = data?.filter((a) => isoToLocalDateStr(a.started_at) === dayStr) ?? [];
      const agg = { walk_min: 0, play_min: 0, meal_count: 0, treat_count: 0, poop_count: 0, care_count: 0 };
      dayActs.forEach((a) => {
        if (a.type === "walk") agg.walk_min += a.amount ?? 0;
        if (a.type === "play") agg.play_min += a.amount ?? 0;
        if (a.type === "meal") agg.meal_count += a.amount ?? 0;
        if (a.type === "treat") agg.treat_count += a.amount ?? 0;
        if (a.type === "poop") agg.poop_count += a.amount ?? 0;
        if (a.type === "care") agg.care_count += a.amount ?? 0;
      });
      days.push({ date: dayStr, ...agg, streak_info: null, change_vs_last_week: null });
    }
    set({ range: { start: startUtc.toISOString(), end: tomorrowUtc.toISOString(), days } });
  },
}));
