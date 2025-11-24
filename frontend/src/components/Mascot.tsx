const Mascot = () => (
  <div className="flex items-center gap-3 rounded-2xl bg-white shadow p-3 border border-primary/20">
    <svg width="60" height="60" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="#fff3f8" stroke="#ff9eb0" strokeWidth="4" />
      <ellipse cx="60" cy="72" rx="28" ry="20" fill="#ffffff" stroke="#ff9eb0" strokeWidth="3" />
      <circle cx="45" cy="58" r="6" fill="#5b4b49" />
      <circle cx="75" cy="58" r="6" fill="#5b4b49" />
      <path d="M55 70 q5 6 10 0" stroke="#5b4b49" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M36 46 q-10 -8 0 -18" stroke="#ff9eb0" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M84 46 q10 -8 0 -18" stroke="#ff9eb0" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
    <div className="text-sm text-slate-700">
      <p className="font-semibold text-primary">ワンポイント</p>
      <p>「いまの記録、ぽちっと残そう！」</p>
    </div>
  </div>
);

export default Mascot;
