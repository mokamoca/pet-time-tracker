import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

export type Pet = {
  id: number;
  name: string;
};

type PetState = {
  pets: Pet[];
  loaded: boolean;
  selectedPetId: number | null;
  load: () => Promise<void>;
  add: (name: string) => Promise<void>;
  update: (id: number, name: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
  selectPet: (id: number | null) => void;
};

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: [],
      loaded: false,
      selectedPetId: null,
      load: async () => {
        const { data, error } = await supabase.from("pets").select("*").order("created_at", { ascending: true });
        if (error) {
          console.error(error);
          return;
        }
        const pets = data ?? [];
        const current = get().selectedPetId;
        const hasCurrent = pets.some((p) => p.id === current);
        const nextSelected = hasCurrent ? current : pets[0]?.id ?? null;
        set({ pets, loaded: true, selectedPetId: nextSelected });
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
        set((state) => {
          const pets = [...state.pets, data];
          const selectedPetId = state.selectedPetId ?? data.id;
          return { pets, loaded: true, selectedPetId };
        });
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
        set((state) => {
          const pets = state.pets.filter((p) => p.id !== id);
          const selectedPetId = state.selectedPetId === id ? pets[0]?.id ?? null : state.selectedPetId;
          return { pets, loaded: true, selectedPetId };
        });
      },
      selectPet: (id) => set({ selectedPetId: id }),
    }),
    { name: "pet-data", partialize: (state) => ({ selectedPetId: state.selectedPetId }) },
  ),
);
