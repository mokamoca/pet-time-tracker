import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useStatsStore } from "./stats";
import { startOfWeek } from "../utils/date";

export type Activity = {
  id: number;
  pet_id?: number;
  type: string;
  amount: number;
  unit: string;
  started_at: string;
  ended_at?: string | null;
  note?: string;
  source: string;
};

type State = {
  activities: Activity[];
  logQuick: (
    type: string,
    amount: number,
    unit: string,
    pet_id?: number,
    started_at?: string,
    ended_at?: string,
  ) => Promise<void>;
  load: () => Promise<void>;
  update: (id: number, payload: Partial<Pick<Activity, "amount" | "started_at" | "ended_at">>) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

export const useActivityStore = create<State>((set, get) => ({
  activities: [],
  load: async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("started_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    set({ activities: data ?? [] });
  },
  logQuick: async (type, amount, unit, pet_id, started_at, ended_at) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error(userError ?? "No user");
      return;
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("activities")
      .insert({
        type,
        amount,
        unit,
        pet_id,
        started_at: started_at ?? now,
        ended_at: ended_at ?? started_at ?? now,
        source: "quick",
        user_id: user.id,
      })
      .select()
      .single();
    if (error) {
      console.error(error);
      return;
    }
    set((state) => ({ activities: [data, ...state.activities] }));

    // 直後にサマリを更新
    const today = new Date().toISOString().slice(0, 10);
    const start = startOfWeek(new Date()).toISOString().slice(0, 10);
    const stats = useStatsStore.getState();
    stats.loadDaily(today);
    stats.loadWeekly(start);
  },
  update: async (id, payload) => {
    const { data, error } = await supabase.from("activities").update(payload).eq("id", id).select().single();
    if (error) {
      console.error(error);
      return;
    }
    const prev = get().activities.find((a) => a.id === id);
    set((state) => ({
      activities: state.activities.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
    const dates = new Set<string>();
    const stats = useStatsStore.getState();
    const today = new Date().toISOString().slice(0, 10);
    dates.add(today);
    if (prev?.started_at) dates.add(prev.started_at.slice(0, 10));
    if (data?.started_at) dates.add(data.started_at.slice(0, 10));
    for (const date of dates) {
      stats.loadDaily(date);
      const weekStart = startOfWeek(new Date(date)).toISOString().slice(0, 10);
      stats.loadWeekly(weekStart);
    }
  },
  remove: async (id) => {
    const prev = get().activities.find((a) => a.id === id);
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    set((state) => ({ activities: state.activities.filter((a) => a.id !== id) }));
    const today = new Date().toISOString().slice(0, 10);
    const stats = useStatsStore.getState();
    const dates = new Set<string>([today]);
    if (prev?.started_at) dates.add(prev.started_at.slice(0, 10));
    for (const date of dates) {
      stats.loadDaily(date);
      const weekStart = startOfWeek(new Date(date)).toISOString().slice(0, 10);
      stats.loadWeekly(weekStart);
    }
  },
}));
