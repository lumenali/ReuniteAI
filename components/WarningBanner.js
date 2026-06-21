const styles = {
  info: "bg-white/[0.055] text-slate-200",
  warning: "bg-red-500/[0.12] text-red-50",
  danger: "bg-red-500/[0.14] text-red-50",
  success: "bg-white/[0.06] text-slate-100"
};

const labels = {
  info: "Information",
  warning: "Safety notice",
  danger: "Action needed",
  success: "Saved"
};

export default function WarningBanner({ variant = "info", title, children }) {
  const role = variant === "danger" || variant === "warning" ? "alert" : "status";
  return (
    <div
      className={`rounded-2xl border border-white/[0.09] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_32px_rgba(0,0,0,0.20)] backdrop-blur-2xl ${styles[variant] || styles.info}`}
      role={role}
      style={{ animation: "toast-in 0.18s ease-out" }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 flex-none rounded-full bg-current opacity-70" aria-hidden="true" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-normal">{title || labels[variant] || labels.info}</p>
          <div className="mt-1 text-sm leading-5 opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}
