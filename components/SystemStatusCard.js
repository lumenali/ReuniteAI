import { useEffect, useState } from "react";
import StatusPill from "./StatusPill";

export default function SystemStatusCard({ compact = false, initialHealth = null, refreshKey = 0 }) {
  const [health, setHealth] = useState(initialHealth);
  const [loading, setLoading] = useState(!initialHealth);

  useEffect(() => {
    let active = true;
    async function loadHealth() {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        if (active) setHealth(data);
      } catch (error) {
        if (active) {
          setHealth({
            ok: true,
            geminiConfigured: false,
            message: "AI extraction is offline. Safety redaction and rule-based matching are still active."
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHealth();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const active = Boolean(health?.geminiConnected);
  const configured = Boolean(health?.geminiConfigured);

  return (
    <section className="panel p-3" aria-labelledby="system-status-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="small-caps">System Status</p>
          <h2 id="system-status-heading" className="mt-0.5 text-base font-bold text-slate-50">
            Readiness
          </h2>
        </div>
        <StatusPill tone={active ? "green" : configured ? "amber" : "amber"}>
          {loading ? "Checking" : active ? "AI active" : "Fallback"}
        </StatusPill>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {active
          ? "AI extraction is active. Matching remains reviewer-gated."
          : "Fallback rules active. Redaction and matching still run."}
      </p>

      <dl className={compact ? "mt-2 grid gap-1.5 sm:grid-cols-2" : "mt-4 grid gap-2 sm:grid-cols-2"}>
        <StatusRow
          label="AI extraction"
          value={active ? "Active" : "Fallback"}
          tone={active ? "green" : "amber"}
        />
        <StatusRow label="Redaction" value="Active" tone="green" />
        <StatusRow label="Rule-based matching" value="Active" tone="green" />
        <StatusRow label="Data mode" value="Synthetic demo data" tone="blue" />
      </dl>

      {!compact && health?.message ? (
        <p className="glass-card mt-4 p-3 text-xs font-semibold leading-5 text-slate-500">
          {health.message}
          {health.model ? ` Model: ${health.model}.` : ""}
        </p>
      ) : null}
    </section>
  );
}

function StatusRow({ label, value, tone }) {
  return (
    <div className="glass-card flex items-center justify-between gap-3 px-2.5 py-1.5">
      <dt className="text-xs font-semibold text-slate-400">{label}</dt>
      <dd>
        <StatusPill tone={tone}>{value}</StatusPill>
      </dd>
    </div>
  );
}
