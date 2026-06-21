import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import useSound from "../hooks/useSound";

async function fetchWorkspace() {
  const [reportsResponse, matchesResponse] = await Promise.all([
    fetch("/api/reports"),
    fetch("/api/match")
  ]);
  const reportsData = await reportsResponse.json();
  const matchesData = await matchesResponse.json();
  return {
    reports: reportsData.reports || [],
    matches: matchesData.matches || []
  };
}

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const playSound = useSound();

  const applyWorkspace = useCallback((nextReports, nextMatches) => {
    setReports(nextReports || []);
    setMatches(nextMatches || []);
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await fetchWorkspace();
        if (active) applyWorkspace(data.reports, data.matches);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [applyWorkspace]);

  const stats = useMemo(() => {
    const redacted = reports.filter(
      (report) =>
        report.sensitiveInfoRemoved ||
        report.risks?.some((risk) => risk.toLowerCase().includes("sensitive"))
    ).length;
    return {
      reports: reports.length,
      matches: matches.length,
      review: matches.filter((match) => match.reviewRequired).length,
      redacted
    };
  }, [reports, matches]);

  return (
    <Layout title="Home">
      <div className="app-mode-home relative grid max-w-full gap-3 pb-8">
        <section className="mx-auto grid w-full max-w-6xl gap-3 pt-1">
          <div
            className="panel interactive-lift relative min-h-[220px] overflow-hidden p-4 sm:p-5"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(7,7,9,0.94) 0%, rgba(7,7,9,0.78) 42%, rgba(7,7,9,0.28) 76%, rgba(7,7,9,0.68) 100%), linear-gradient(180deg, rgba(255,255,255,0.10), transparent 28%), url('/images/red-network-banner.png')",
              backgroundPosition: "center",
              backgroundSize: "cover"
            }}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-red-500/20" />
            <div className="pointer-events-none absolute inset-x-6 top-6 h-24 rounded-full bg-white/[0.035] blur-3xl" aria-hidden="true" />
            <div className="hero-red-glow" aria-hidden="true" />
            <div className="hero-particles" aria-hidden="true">
              <span style={{ left: "58%", top: "26%", animationDelay: "0.2s" }} />
              <span style={{ left: "72%", top: "38%", animationDelay: "1.1s" }} />
              <span style={{ left: "84%", top: "19%", animationDelay: "1.7s" }} />
              <span style={{ left: "66%", top: "66%", animationDelay: "2.4s" }} />
              <span style={{ left: "91%", top: "58%", animationDelay: "3.1s" }} />
            </div>
            <div className="relative z-10 flex min-h-[188px] max-w-3xl flex-col justify-center">
              <h1 className="text-3xl font-semibold leading-[1.06] tracking-[-0.02em] text-white sm:text-4xl">
                Turn crisis reports into <span className="text-red-500">reviewed</span> leads.
              </h1>
              <p className="mt-3 max-w-xl text-xs leading-5 text-slate-300">
                Structure reports, hide sensitive details, and keep every decision human-reviewed.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/submit" className="btn-primary no-underline" onClick={() => playSound("click")}>
                  <ActionIcon path="M12 5v14M5 12h14" />
                  Start report
                </Link>
                <Link href="/matches" className="btn-secondary no-underline" onClick={() => playSound("click")}>
                  <ActionIcon path="M4 7h16M4 12h16M4 17h10" />
                  Open leads
                </Link>
                <Link href="/settings" className="btn-secondary no-underline" onClick={() => playSound("click")}>
                  <ActionIcon path="M12 8v4l3 2M4 12a8 8 0 1016 0 8 8 0 00-16 0Z" />
                  Check AI status
                </Link>
              </div>
            </div>
          </div>

          <div className="grid overflow-hidden rounded-2xl border border-white/[0.085] bg-white/[0.052] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_46px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <GuideStep icon="M7 4h10v16H7V4Zm3 4h4M10 12h4M10 16h3" number="01" title="Collect" text="Intake from any source." />
            <StepArrow />
            <GuideStep icon="M7 11V8a5 5 0 0110 0v3M6 11h12v9H6v-9Zm6 3v3" number="02" title="Protect" text="Redact and minimize risk." />
            <StepArrow />
            <GuideStep icon="M12 12a4 4 0 100-8 4 4 0 000 8Zm-7 8a7 7 0 0114 0M17 14l2 2 4-5" number="03" title="Review" text="Human decisions only." />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard metrics">
          <StatCard label="Reports" value={loading ? "..." : stats.reports} icon="M7 4h10v16H7V4Zm3 4h4M10 12h4M10 16h3" />
          <StatCard label="Leads" value={loading ? "..." : stats.matches} icon="M4 7h16M4 12h16M4 17h10" />
          <StatCard label="Review" value={loading ? "..." : stats.review} icon="M9 12l2 2 4-5M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <StatCard label="Redactions" value={loading ? "..." : stats.redacted} icon="M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Zm8 3a3 3 0 100-6 3 3 0 000 6ZM4 4l16 16" />
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-3 xl:grid-cols-[1fr_1fr_1fr]" aria-label="Case workspace preview">
          <RecentCaseActivity reports={reports} matches={matches} loading={loading} />
          <LeadQueuePreview matches={matches} loading={loading} />
          <ReviewProtocol />
        </section>
      </div>
    </Layout>
  );
}

function RecentCaseActivity({ reports, matches, loading }) {
  const items = [
    {
      title: "Report submitted",
      detail: reports[0] ? `Case #${reports[0].id} submitted` : "Intake queue ready",
      time: reports[0] ? "12m ago" : "Now",
      icon: "M7 4h10v16H7V4Zm3 4h4M10 12h4M10 16h3"
    },
    {
      title: "Lead reviewed",
      detail: matches[0] ? `Lead #${matches[0].id} marked reviewed` : "No review notes yet",
      time: matches[0] ? "27m ago" : "Pending",
      icon: "M9 12l2 2 4-5M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
    },
    {
      title: "Redaction applied",
      detail: "Location details redacted",
      time: "45m ago",
      icon: "M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Zm8 3a3 3 0 100-6 3 3 0 000 6ZM4 4l16 16"
    },
    {
      title: "Match generated",
      detail: matches.length ? "Possible lead found" : "Waiting for reports",
      time: loading ? "..." : "1h ago",
      icon: "M4 7h16M4 12h16M4 17h10"
    }
  ];

  return (
    <section className="panel p-4">
      <PanelHeader icon="M5 5h14v14H5V5Zm4 0v14M5 9h14" title="Recent Case Activity" href="/review" />
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <TimelineItem key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

function LeadQueuePreview({ matches, loading }) {
  const preview = matches.slice(0, 3);
  const fallback = [
    { id: "L-2025-0048", missingReport: { broadLocation: "Austin, TX" }, confidenceLabel: "High", reviewStatus: "Submitted 1h ago" },
    { id: "L-2025-0047", missingReport: { broadLocation: "Phoenix, AZ" }, confidenceLabel: "Medium", reviewStatus: "Submitted 2h ago" },
    { id: "L-2025-0046", missingReport: { broadLocation: "Denver, CO" }, confidenceLabel: "Needs review", reviewStatus: "Submitted 3h ago" }
  ];
  const rows = loading || preview.length === 0 ? fallback : preview;

  return (
    <section className="panel p-4">
      <PanelHeader icon="M4 7h16M4 12h16M4 17h10" title="Lead Queue Preview" href="/matches" />
      <div className="mt-4 grid gap-2">
        {rows.map((match) => (
          <Link key={match.id} href="/matches" className="glass-card group grid grid-cols-[1fr_auto_auto] items-center gap-3 p-3 no-underline">
            <div>
              <p className="text-sm font-semibold text-slate-100">{match.id}</p>
              <p className="mt-1 text-xs leading-4 text-slate-500">
                {match.missingReport?.broadLocation || match.foundReport?.broadLocation || "Restricted area"}
              </p>
            </div>
            <span className={[
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold",
              match.confidenceLabel === "High"
                ? "border-red-500/25 bg-red-500/[0.16] text-red-100"
                : "border-white/[0.08] bg-white/[0.06] text-slate-300"
            ].join(" ")}>
              {match.confidenceLabel || "Review"}
            </span>
            <ActionIcon path="m9 6 6 6-6 6" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ReviewProtocol() {
  const items = [
    { title: "Human review required", detail: "Every lead is verified by trained coordinators.", icon: "M12 12a4 4 0 100-8 4 4 0 000 8Zm-7 8a7 7 0 0114 0" },
    { title: "Exact locations hidden", detail: "Sensitive location details are minimized.", icon: "M7 11V8a5 5 0 0110 0v3M6 11h12v9H6v-9Z" },
    { title: "No auto-contact", detail: "We never contact potential matches.", icon: "M4 4l16 16M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" },
    { title: "Sensitive details redacted", detail: "Names, contacts, and IDs are protected.", icon: "M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" }
  ];

  return (
    <section className="panel p-4">
      <PanelHeader icon="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" title="Review Protocol" href="/about" />
      <div className="mt-4 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.07]">
        {items.map((item) => (
          <div key={item.title} className="grid grid-cols-[34px_1fr] gap-3 bg-black/20 p-3">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-red-500/20 bg-red-500/[0.1] text-red-100">
              <ActionIcon path={item.icon} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">{item.title}</p>
              <p className="mt-1 text-xs leading-4 text-slate-500">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PanelHeader({ icon, title, href }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.045] text-slate-200">
          <ActionIcon path={icon} />
        </span>
        <h2 className="text-sm font-semibold text-slate-50">{title}</h2>
      </div>
      <Link href={href} className="text-xs font-semibold text-red-400 no-underline hover:text-red-200">
        View all
      </Link>
    </div>
  );
}

function TimelineItem({ item }) {
  return (
    <div className="grid grid-cols-[30px_1fr_auto] gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.08] bg-black/30 text-slate-300">
        <ActionIcon path={item.icon} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-100">{item.title}</p>
        <p className="mt-1 text-xs leading-4 text-slate-500">{item.detail}</p>
      </div>
      <p className="text-xs text-slate-500">{item.time}</p>
    </div>
  );
}

function ActionIcon({ path }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GuideStep({ icon, number, title, text }) {
  return (
    <article className="card-enter grid grid-cols-[34px_1fr] gap-2 p-3 transition duration-200 hover:bg-white/[0.035]">
      <div className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.095] bg-white/[0.045] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
        <ActionIcon path={icon} />
      </div>
      <div>
        <h2 className="text-xs font-semibold text-white">
          <span className="mr-1.5 text-red-500">{number}</span>
          {title}
        </h2>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{text}</p>
      </div>
    </article>
  );
}

function StepArrow() {
  return (
    <div className="hidden w-px items-center justify-center bg-white/[0.04] text-slate-700 md:flex">
      <svg className="h-5 w-5 translate-x-1/2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
