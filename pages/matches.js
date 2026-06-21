import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import MatchCard from "../components/MatchCard";
import StatusPill from "../components/StatusPill";
import useSound from "../hooks/useSound";

const filters = ["All", "High", "Medium", "Low", "Needs review", "Conflicts"];
const confidenceOrder = { High: 0, Medium: 1, Low: 2 };

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("strength");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const playSound = useSound();

  useEffect(() => {
    let active = true;
    async function loadMatches() {
      try {
        const response = await fetch("/api/match");
        const data = await response.json();
        if (active) {
          const nextMatches = data.matches || [];
          setMatches(nextMatches);
          setSelectedId(nextMatches[0]?.id || "");
          setMessage(data.message || "");
        }
      } catch (error) {
        if (active) setMessage("No possible leads yet. Add reports or load demo data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMatches();
    return () => {
      active = false;
    };
  }, []);

  const visibleMatches = useMemo(() => {
    let next = [...matches];
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      next = next.filter((match) =>
        [
          match.id,
          match.missingReportId,
          match.foundReportId,
          match.missingReport?.name,
          match.foundReport?.name,
          match.foundReport?.broadLocation,
          match.missingReport?.broadLocation
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery))
      );
    }
    if (filter === "High" || filter === "Medium" || filter === "Low") {
      next = next.filter((match) => match.confidenceLabel === filter);
    }
    if (filter === "Needs review") {
      next = next.filter((match) => match.reviewRequired || match.reviewStatus === "Not reviewed");
    }
    if (filter === "Conflicts") {
      next = next.filter((match) => match.conflicts?.length);
    }
    if (sort === "recent") {
      next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      next.sort(
        (a, b) =>
          confidenceOrder[a.confidenceLabel] - confidenceOrder[b.confidenceLabel] ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return next;
  }, [matches, filter, sort, query]);

  const selectedMatch = visibleMatches.find((match) => match.id === selectedId) || visibleMatches[0];
  const shownMatches = visibleMatches.slice(0, 5);

  return (
    <Layout title="Leads">
      <div className="grid gap-3 pb-8">
        <div className="flex items-end justify-between gap-3">
          <div>
          <p className="small-caps">Review queue</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-50">Leads</h1>
          </div>
          <StatusPill tone="slate">{visibleMatches.length} visible</StatusPill>
        </div>

        {loading ? <LoadingState label="Loading leads" /> : null}

        {!loading && !visibleMatches.length ? (
          <EmptyState
            title="No possible leads yet"
            message={message || "No possible leads yet. Add reports or load demo data."}
            actionHref="/submit"
            actionLabel="Submit a report"
          />
        ) : null}

        {!loading && visibleMatches.length ? (
          <section className="grid gap-3 xl:grid-cols-[330px_minmax(0,1fr)]" aria-label="Lead workspace">
            <aside className="panel overflow-hidden xl:sticky xl:top-[72px] xl:self-start">
              <div className="border-b border-white/[0.045] p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="small-caps">Queue</p>
                    <h2 className="mt-0.5 text-sm font-semibold text-slate-50">Queue</h2>
                  </div>
                  <StatusPill tone="slate">{matches.length} total</StatusPill>
                </div>
                <label className="mt-2 block">
                  <span className="sr-only">Search queue</span>
                  <input
                    className="field-input mt-0"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search ID, name, location"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {filters.map((item) => (
                    <button
                      key={item}
                      type="button"
                      data-sound="select"
                      className={[
                        "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition duration-200 active:scale-[0.98]",
                        filter === item
                          ? "border border-red-500/25 bg-red-500/[0.16] text-red-100 shadow-[inset_2px_0_0_rgba(239,35,60,0.9),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl"
                          : "border border-white/[0.07] bg-white/[0.045] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-white/[0.075] hover:text-slate-100"
                      ].join(" ")}
                      onClick={() => {
                        setFilter(item);
                        playSound("select");
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <label className="mt-2 block">
                  <span className="sr-only">Sort leads</span>
                  <select
                    className="field-input mt-0"
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value);
                      playSound("select");
                    }}
                  >
                    <option value="strength">Strongest first</option>
                    <option value="recent">Newest first</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-1.5 p-2">
                {shownMatches.map((match) => (
                  <LeadRow
                    key={match.id}
                    match={match}
                    active={selectedMatch?.id === match.id}
                    onSelect={() => {
                      setSelectedId(match.id);
                      playSound("select");
                    }}
                  />
                ))}
              </div>
            </aside>

            <div className="min-w-0">
              <MatchCard match={selectedMatch} />
            </div>
          </section>
        ) : null}
      </div>
    </Layout>
  );
}

function LeadRow({ match, active, onSelect }) {
  return (
    <button
      type="button"
      data-sound="select"
      className={[
        "relative w-full rounded-xl p-2 text-left transition-all duration-200 ease-out hover:bg-white/[0.045] active:scale-[0.99]",
        active
          ? "border border-red-500/18 bg-red-500/[0.08] shadow-[inset_3px_0_0_rgba(239,35,60,0.9),inset_0_1px_0_rgba(255,255,255,0.10),0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl"
          : "border border-white/[0.06] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
      ].join(" ")}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-50">{match.id}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
            {match.missingReport?.name || "Missing report"} / {match.foundReport?.broadLocation || "restricted area"}
          </p>
        </div>
        <span className="rounded-md border border-white/[0.07] bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          {match.confidenceLabel}
        </span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
        <span>{match.reviewStatus || "Not reviewed"}</span>
        <span className="text-right">{match.conflictCount || 0} conflicts</span>
      </div>
    </button>
  );
}
