import { create } from "zustand";
import { supabase } from "../lib/supabase";

export type Pet = {
  id: number;
  name: string;
};

type PetState = {
  pets: Pet[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (name: string) => Promise<void>;
  update: (id: number, name: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

export const usePetStore = create<PetState>((set) => ({
  pets: [],
  loaded: false,
  load: async () => {
    const { data, error } = await supabase.from("pets").select("*").order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    set({ pets: data ?? [], loaded: true });
  },
  add: async (name: string) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error(userError ?? "No user");
      return;
    }
    const { data, error } = await supabase
      .from("pets")
      .insert({ name, user_id: user.id })
      .select()
      .single();
    if (error) {
      console.error(error);
      return;
    }
    set((state) => ({ pets: [...state.pets, data], loaded: true }));
  },
  update: async (id, name) => {
    const { data, error } = await supabase.from("pets").update({ name }).eq("id", id).select().single();
    if (error) {
      console.error(error);
      return;
    }
    set((state) => ({ pets: state.pets.map((p) => (p.id === id ? data : p)), loaded: true }));
  },
  remove: async (id) => {
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    set((state) => ({ pets: state.pets.filter((p) => p.id !== id), loaded: true }));
  },
}));
