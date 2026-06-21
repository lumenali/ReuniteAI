export default function RiskBadge({ label }) {
  const tone = getTone(label);
  return (
    <span
      className={[
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-semibold uppercase tracking-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl",
        tone
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function getTone(label = "") {
  const value = label.toLowerCase();
  if (value.includes("conflict") || value.includes("weak")) {
    return "border-red-500/20 bg-red-500/[0.12] text-red-100";
  }
  if (value.includes("sensitive") || value.includes("private") || value.includes("minor")) {
    return "border-red-500/20 bg-red-500/[0.12] text-red-100";
  }
  return "border-white/[0.08] bg-white/[0.06] text-slate-300";
}
