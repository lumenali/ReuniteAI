import { formatDateTime } from "../lib/dates";
import { ageRangeLabel } from "../lib/validation";
import RiskBadge from "./RiskBadge";
import StatusPill from "./StatusPill";

export default function ReportSummary({ report, compact = false }) {
  if (!report) return null;
  return (
    <article className="glass-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="small-caps">{report.reportType}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-50">
            {report.name || "Name not provided"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{report.summary}</p>
        </div>
        <StatusPill tone="slate">{report.privacyLevel || "Restricted"}</StatusPill>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Age or range" value={ageRangeLabel(report.ageRange)} />
        <Field label="Broad location" value={report.broadLocation || "Not provided"} />
        <Field label="Date and time" value={formatDateTime(report.dateTime)} />
        <Field label="Clothing" value={report.clothing || "Not provided"} />
        <Field
          label="Languages"
          value={report.languages?.length ? report.languages.join(", ") : "Not provided"}
        />
        <Field label="Source" value={report.sourceReliability || "Unknown"} />
      </dl>

      {!compact ? (
        <>
          <div className="glass-card mt-5 p-4">
            <p className="text-sm font-bold text-slate-100">Redacted notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {report.redactedNotes || "No notes provided."}
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <BadgeGroup title="Risks detected" items={report.risks} empty="No risks listed." />
            <BadgeGroup
              title="Missing information"
              items={report.missingFields}
              empty="No missing fields listed."
            />
          </div>
        </>
      ) : null}
    </article>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-slate-300">{value}</dd>
    </div>
  );
}

function BadgeGroup({ title, items = [], empty }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-100">{title}</p>
      {items?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <RiskBadge key={item} label={item} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      )}
    </div>
  );
}
