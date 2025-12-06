import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePetStore, Pet } from "../store/pets";
import { supabase } from "../lib/supabase";

const bucket = "pet-photos";

const PetSetupPage = () => {
  const { pets, add, load, update, remove, selectedPetId, selectPet } = usePetStore();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [weight, setWeight] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    return;
  }, [photoFile]);

  const handleUpload = async (file: File): Promise<string | null> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      console.error(error ?? "No user");
      return null;
    }
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) {
      console.error(uploadError);
      return null;
    }
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicData.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    let photo_url: string | null = null;
    if (photoFile) {
      photo_url = await handleUpload(photoFile);
    }
    await add({
      name: name.trim(),
      species: species.trim() || undefined,
      birthdate: birthdate || undefined,
      weight: weight ? Number(weight) : undefined,
      photo_url: photo_url ?? undefined,
    });
    setSaving(false);
    setName("");
    setSpecies("");
    setBirthdate("");
    setWeight("");
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const hasPets = useMemo(() => pets.length > 0, [pets.length]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-lg border border-primary/10">
        <h2 className="text-lg font-semibold text-primary mb-3">ペットプロフィール</h2>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-slate-600">名前</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="もも / ぽち"
              className="w-full rounded-lg border border-primary/20 bg-white p-3 text-slate-800 placeholder-slate-400"
              required
            />
            <label className="text-xs text-slate-600">種類</label>
            <input
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="Golden Retriever / Siamese"
              className="w-full rounded-lg border border-primary/20 bg-white p-3 text-slate-800 placeholder-slate-400"
            />
            <label className="text-xs text-slate-600">誕生日</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full rounded-lg border border-primary/20 bg-white p-3 text-slate-800"
            />
            <label className="text-xs text-slate-600">体重(kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-lg border border-primary/20 bg-white p-3 text-slate-800"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs text-slate-600">写真</label>
            <div className="flex items-center gap-3">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-500">No Photo</span>
                )}
              </div>
              <label className="rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm font-semibold text-primary shadow cursor-pointer">
                画像を選択
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhotoFile(file);
                  }}
                />
              </label>
            </div>
            <button
              className="w-full rounded-lg bg-primary py-3 font-semibold text-white shadow disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "保存中..." : "保存して追加"}
            </button>
          </div>
        </form>
      </div>

      {hasPets && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">登録済みのペット</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {pets.map((p) => (
              <PetCard
                key={p.id}
                pet={p}
                active={p.id === selectedPetId}
                onSelect={() => selectPet(p.id)}
                onDelete={() => void remove(p.id)}
                onUpdate={async (payload) => {
                  await update(p.id, payload);
                  await load();
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PetCard = ({
  pet,
  active,
  onSelect,
  onDelete,
  onUpdate,
}: {
  pet: Pet;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (payload: Partial<Pet>) => Promise<void>;
}) => {
  const [editingName, setEditingName] = useState(pet.name);
  const [updating, setUpdating] = useState(false);
  const hasSpecies = pet.species;

  useEffect(() => {
    setEditingName(pet.name);
  }, [pet.name]);

  const handleSave = async () => {
    setUpdating(true);
    await onUpdate({ name: editingName });
    setUpdating(false);
  };

  return (
    <div className="rounded-2xl border border-primary/15 bg-white p-3 shadow-sm flex gap-3 items-center">
      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-primary/10 flex items-center justify-center">
        {pet.photo_url ? (
          <img src={pet.photo_url} alt={pet.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-slate-500">No Photo</span>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          className="w-full rounded-md border border-primary/20 bg-white px-2 py-1 text-sm font-semibold text-slate-800"
        />
        <p className="text-xs text-slate-500">{hasSpecies ? pet.species : "登録なし"}</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSelect}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active ? "bg-primary text-white" : "bg-primary/10 text-primary"
            }`}
          >
            {active ? "Active" : "選択"}
          </button>
          <button
            onClick={handleSave}
            disabled={updating}
            className="rounded-full px-3 py-1 text-xs font-semibold border border-primary/30 text-primary bg-white"
          >
            {updating ? "保存中..." : "名前を保存"}
          </button>
          <button
            onClick={onDelete}
            className="rounded-full px-3 py-1 text-xs font-semibold border border-red-200 text-red-500 bg-white"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetSetupPage;
