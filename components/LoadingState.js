export default function LoadingState({ label = "Loading" }) {
  return (
    <div className="glass-panel flex items-center gap-3 p-3 text-sm font-semibold text-slate-200">
      <span className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <span className="block h-full w-16 rounded-full bg-red-600 shadow-[0_0_18px_rgba(239,35,60,0.55)]" style={{ animation: "bar-load 1.1s ease-in-out infinite" }} />
      </span>
      <span>{label}</span>
    </div>
  );
}
