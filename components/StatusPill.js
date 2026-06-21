export default function StatusPill({ tone = "slate", children }) {
  const tones = {
    blue: "border-white/[0.08] bg-white/[0.065] text-slate-200",
    green: "border-white/[0.08] bg-white/[0.065] text-slate-100",
    amber: "border-red-500/20 bg-red-500/[0.115] text-red-100",
    red: "border-red-500/24 bg-red-500/[0.13] text-red-100",
    violet: "border-red-500/20 bg-red-500/[0.105] text-red-100",
    slate: "border-white/[0.075] bg-white/[0.055] text-slate-300"
  };

  return (
    <span
      className={[
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-semibold uppercase tracking-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl",
        tones[tone] || tones.slate
      ].join(" ")}
    >
      <span className="h-1 w-1 rounded-full bg-current opacity-70" aria-hidden="true" />
      {children}
    </span>
  );
}
