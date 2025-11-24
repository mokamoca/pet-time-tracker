import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePetStore } from "../store/pets";

const PetSetupPage = () => {
  const { pets, add, load, update, remove } = usePetStore();
  const [name, setName] = useState("");
  const [edits, setEdits] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setEdits((prev) => {
      const next = { ...prev };
      pets.forEach((p) => {
        if (next[p.id] === undefined) next[p.id] = p.name;
      });
      return next;
    });
  }, [pets]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await add(name);
    navigate("/");
  };

  const handleUpdate = async (id: number) => {
    const newName = edits[id]?.trim();
    if (!newName) return;
    await update(id, newName);
  };

  const handleDelete = async (id: number) => {
    await remove(id);
  };

  const hasPets = useMemo(() => pets.length > 0, [pets.length]);

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow-lg border border-primary/10">
      <div className="flex items-center gap-2">
        <span className="text-xl">🐾</span>
        <h2 className="text-lg font-semibold text-primary">うちのコカード</h2>
      </div>
      <p className="text-sm text-slate-700">名前だけでOK。あとで増やせます。</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ペットの名前（例: もも / ぽち）"
          className="w-full rounded-lg border border-primary/20 bg-white p-3 text-slate-800 placeholder-slate-400"
          required
        />
        <button className="w-full rounded-lg bg-primary py-3 font-semibold text-white shadow">
          保存してはじめる
        </button>
      </form>
      {hasPets && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">登録済みのペット</p>
          <div className="space-y-2">
            {pets.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2"
              >
                <input
                  value={edits[p.id] ?? ""}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="flex-1 rounded-md border border-primary/20 bg-white p-2 text-slate-800"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdate(p.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white text-lg shadow-sm active:scale-95 transition"
                    aria-label="名前を更新"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 text-lg shadow-sm active:scale-95 transition"
                    aria-label="削除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetSetupPage;
