import Link from "next/link";
import { useState } from "react";
import { formatDateTime } from "../lib/dates";
import { ageRangeLabel } from "../lib/validation";
import useSound from "../hooks/useSound";
import RiskBadge from "./RiskBadge";
import StatusPill from "./StatusPill";

const tabs = ["Evidence", "Conflicts", "Missing", "Actions"];

export default function MatchCard({ match }) {
  const [tabState, setTabState] = useState({ matchId: "", tab: "Evidence" });
  const playSound = useSound();

  if (!match) return null;

  const activeTab = tabState.matchId === match.id ? tabState.tab : "Evidence";

  return (
    <article className="panel min-w-0 overflow-hidden">
      <div className="border-b border-white/[0.045] bg-white/[0.025] p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="small-caps">Selected lead</p>
            <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-50">{match.id}</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
              {match.missingReport?.name || "Missing report"} matched with{" "}
              {match.foundReport?.broadLocation || "restricted area"}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={strengthTone(match.confidenceLabel)}>{match.confidenceLabel || "Low"}</StatusPill>
            <StatusPill tone="slate">{match.reviewStatus || "Not reviewed"}</StatusPill>
            <Link href={`/review?matchId=${match.id}`} className="btn-primary min-h-9 px-3 py-1.5 text-xs no-underline">
              Review this lead
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        <ReportMini title="Missing" report={match.missingReport} id={match.missingReportId} />
        <ReportMini title="Sighting" report={match.foundReport} id={match.foundReportId} borderLeft />
      </div>

      <div className="border-t border-white/[0.045] p-3">
        <div className="flex flex-wrap gap-2 border-b border-white/[0.045] pb-2" role="tablist" aria-label="Lead details">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              data-sound="select"
              aria-selected={activeTab === tab}
              className={[
                "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-out active:scale-[0.98]",
                activeTab === tab
                  ? "border border-red-500/25 bg-red-500/[0.14] text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-2px_0_rgba(239,35,60,0.9)] backdrop-blur-xl"
                  : "border border-white/[0.07] bg-white/[0.045] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-white/[0.075] hover:text-slate-100"
              ].join(" ")}
              onClick={() => {
                setTabState({ matchId: match.id, tab });
                playSound("select");
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div key={`${match.id}-${activeTab}`} className="card-enter mt-2.5">
          <TabContent match={match} activeTab={activeTab} />
        </div>
      </div>
    </article>
  );
}

function ReportMini({ title, report, id, borderLeft = false }) {
  return (
    <section className={`p-3 ${borderLeft ? "border-t border-white/[0.045] md:border-l md:border-t-0" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="small-caps">{title}</p>
          <h3 className="mt-0.5 truncate text-base font-semibold text-slate-50">{report?.name || "Name not provided"}</h3>
        </div>
        <span className="rounded-md border border-white/[0.07] bg-white/[0.055] px-2 py-1 text-[10px] font-semibold text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          {id}
        </span>
      </div>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        <Field label="Age" value={ageRangeLabel(report?.ageRange)} />
        <Field label="Area" value={report?.broadLocation || "Not provided"} />
        <Field label="Time" value={formatDateTime(report?.dateTime)} />
        <Field label="Source" value={report?.sourceReliability || "Unknown"} />
      </dl>
      <p className="mt-2 line-clamp-1 text-xs leading-5 text-slate-500">
        {report?.summary || "No summary provided."}
      </p>
      {report?.risks?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {report.risks.slice(0, 2).map((risk) => (
            <RiskBadge key={risk} label={risk} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-normal text-slate-600">{label}</dt>
      <dd className="mt-0.5 text-xs leading-4 text-slate-300">{value}</dd>
    </div>
  );
}

function List({ items = [], empty }) {
  if (!items.length) return <p className="mt-3 text-sm text-slate-500">{empty}</p>;
  const visibleItems = items.slice(0, 4);
  return (
    <ul className="mt-2 grid gap-1.5 text-xs leading-5 text-slate-400">
      {visibleItems.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-red-500/55" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TabContent({ match, activeTab }) {
  if (activeTab === "Evidence") {
    return (
      <div className="grid gap-3">
        <section className="glass-card p-3">
          <p className="text-sm font-semibold text-slate-100">Why it appeared</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{match.whyThisLeadAppeared}</p>
        </section>
        <PanelList title="Evidence to verify" items={match.reasons} empty="No strong evidence listed." />
      </div>
    );
  }

  if (activeTab === "Conflicts") {
    return (
      <PanelList
        title="Possible conflicts"
        items={match.conflicts}
        empty="No conflicts listed by the matcher."
      />
    );
  }

  if (activeTab === "Missing") {
    return (
      <PanelList
        title="Missing information"
        items={match.missingInfo}
        empty="No missing information listed."
      />
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
      <PanelList
        title="Before escalation"
        items={[
          "Check evidence.",
          "Check conflicts.",
          "Confirm missing details.",
          "Record reviewer decision."
        ]}
      />
      <aside className="rounded-xl bg-red-500/[0.09] p-3">
        <p className="text-sm font-semibold text-red-100">Decision required</p>
        <p className="mt-2 text-xs leading-5 text-red-100/75">No contact is triggered by this app.</p>
        <Link href={`/review?matchId=${match.id}`} className="btn-primary mt-3 w-full no-underline">
          Review this lead
        </Link>
      </aside>
    </div>
  );
}

function PanelList({ title, items = [], empty = "None listed." }) {
  return (
    <section className="glass-card p-2.5">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <List items={items} empty={empty} />
    </section>
  );
}

function strengthTone(label) {
  if (label === "High") return "red";
  return "slate";
}
