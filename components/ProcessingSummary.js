import { ageRangeLabel } from "../lib/validation";
import RiskBadge from "./RiskBadge";
import StatusPill from "./StatusPill";

export default function ProcessingSummary({ result }) {
  const report = result?.report;
  if (!report) return null;
  const gemini = result.processingMode === "Gemini extraction" || result.aiAvailable;

  return (
    <section className="panel overflow-hidden" aria-labelledby="processing-summary-heading">
      <div className="border-b border-white/[0.06] bg-white/[0.04] p-3 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="small-caps">Processing Summary</p>
            <h2 id="processing-summary-heading" className="mt-0.5 text-lg font-bold text-slate-50">
              Report structured for review
            </h2>
          </div>
          <StatusPill tone={gemini ? "green" : "amber"}>
            {gemini ? "Processed by Gemini" : "Processed by fallback rules"}
          </StatusPill>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Extraction complete. Redaction and matching rules run next.
        </p>
      </div>

      <div className="grid gap-3 p-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card p-3">
          <p className="text-sm font-bold text-slate-200">Redacted messy report</p>
          <p className="mt-2 line-clamp-4 text-xs leading-5 text-slate-400">
            {report.redactedNotes || "No notes provided."}
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-200">Extracted fields</p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <Field label="Name or nickname" value={report.name || "Not provided"} />
            <Field label="Age or range" value={ageRangeLabel(report.ageRange)} />
            <Field label="Broad location" value={report.broadLocation || "Not provided"} />
            <Field label="Date and time" value={report.dateTime || "Not provided"} />
            <Field label="Clothing" value={report.clothing || "Not provided"} />
            <Field
              label="Languages"
              value={report.languages?.length ? report.languages.join(", ") : "Not provided"}
            />
          </dl>
        </div>
      </div>

      <div className="grid gap-3 border-t border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur-xl md:grid-cols-3">
        <BadgeGroup title="Risk flags" items={report.risks} />
        <BadgeGroup title="Missing fields" items={report.missingFields} />
        <div>
          <p className="text-sm font-bold text-slate-200">Sensitive details removed</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {report.sensitiveInfoRemoved
              ? "Detected sensitive details were redacted."
              : "No sensitive details were detected by the rules."}
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-normal text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-slate-200">{value}</dd>
    </div>
  );
}

function BadgeGroup({ title, items = [] }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-200">{title}</p>
      {items?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <RiskBadge key={item} label={item} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">None listed.</p>
      )}
    </div>
  );
}
