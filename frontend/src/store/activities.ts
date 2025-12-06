import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useStatsStore } from "./stats";
import { usePetStore } from "./pets";

const activityTypes = ["walk", "play", "meal", "treat", "poop", "care"] as const;
const activityUnits = ["min", "count"] as const;
const activitySources = ["quick", "manual"] as const;

type ActivityType = (typeof activityTypes)[number];
type ActivityUnit = (typeof activityUnits)[number];
type ActivitySource = (typeof activitySources)[number];

export type Activity = {
  id: number;
  pet_id?: number;
  type: ActivityType;
  amount: number;
  unit: ActivityUnit;
  started_at: string;
  ended_at?: string | null;
  note?: string;
  source: ActivitySource;
};

type State = {
  activities: Activity[];
  load: (petId?: number | null) => Promise<void>;
  logQuick: (
    type: ActivityType,
    amount: number,
    unit: ActivityUnit,
    pet_id?: number,
    started_at?: string,
    ended_at?: string,
  ) => Promise<void>;
  update: (id: number, payload: Partial<Pick<Activity, "amount" | "started_at" | "ended_at">>) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

export const useActivityStore = create<State>((set, get) => ({
  activities: [],
  load: async (petId) => {
    let query = supabase.from("activities").select("*").order("started_at", { ascending: false });
    if (petId) query = query.eq("pet_id", petId);
    const { data, error } = await query;
    if (error) {
      console.error(error);
      return;
    }
    set({ activities: data ?? [] });
  },
  logQuick: async (type, amount, unit, pet_id, started_at, ended_at) => {
    // 型安全なバリデーション（想定外の値を排除）
    if (!activityTypes.includes(type)) return;
    const expectedUnit: ActivityUnit = type === "walk" || type === "play" ? "min" : "count";
    const useUnit = activityUnits.includes(unit) ? unit : expectedUnit;
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

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
        unit: useUnit,
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

    const today = new Date().toISOString().slice(0, 10);
    const stats = useStatsStore.getState();
    const selectedPetId = usePetStore.getState().selectedPetId;
    stats.loadDaily(today, selectedPetId);
    stats.loadRange(stats.lastPeriod ?? "week", selectedPetId);
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
    const selectedPetId = usePetStore.getState().selectedPetId;
    const today = new Date().toISOString().slice(0, 10);
    dates.add(today);
    if (prev?.started_at) dates.add(prev.started_at.slice(0, 10));
    if (data?.started_at) dates.add(data.started_at.slice(0, 10));
    for (const date of dates) {
      stats.loadDaily(date, selectedPetId);
    }
    stats.loadRange(stats.lastPeriod ?? "week", selectedPetId);
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
    const selectedPetId = usePetStore.getState().selectedPetId;
    const dates = new Set<string>([today]);
    if (prev?.started_at) dates.add(prev.started_at.slice(0, 10));
    for (const date of dates) {
      stats.loadDaily(date, selectedPetId);
    }
    stats.loadRange(stats.lastPeriod ?? "week", selectedPetId);
  },
}));
