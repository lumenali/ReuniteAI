export default function StatCard({ label, value, detail, icon }) {
  return (
    <article className="rounded-2xl border border-white/[0.085] bg-white/[0.055] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_34px_rgba(0,0,0,0.20)] backdrop-blur-2xl transition duration-200 hover:-translate-y-px hover:border-white/[0.13] hover:bg-white/[0.075]">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-red-500/25 bg-red-500/[0.10] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_24px_rgba(239,35,60,0.08)]" aria-hidden="true">
          {icon ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d={icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-red-500/80" />
          )}
        </span>
        <div>
          <p className="text-[11px] font-medium text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-50">{value}</p>
        </div>
      </div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </article>
  );
}
