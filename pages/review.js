import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import HumanReviewChecklist from "../components/HumanReviewChecklist";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import StatusPill from "../components/StatusPill";
import Toast from "../components/Toast";
import WarningBanner from "../components/WarningBanner";
import useSound from "../hooks/useSound";
import { formatDateTime } from "../lib/dates";

const INITIAL_FORM = {
  matchId: "",
  reviewerRole: "Trained volunteer",
  reviewerName: "",
  decision: "Needs more information",
  notes: "",
  acknowledgedUnconfirmed: false,
  checkedEvidence: false
};

const reviewerRoles = [
  "Shelter staff",
  "Trained volunteer",
  "Family liaison",
  "School/community center staff",
  "Emergency responder partner"
];

export default function ReviewPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [reviews, setReviews] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState(null);
  const playSound = useSound();
  const routeMatchId = useMemo(
    () => (typeof router.query.matchId === "string" ? router.query.matchId : ""),
    [router.query.matchId]
  );

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [reviewsResponse, matchesResponse] = await Promise.all([
          fetch("/api/review"),
          fetch("/api/match")
        ]);
        const reviewsData = await reviewsResponse.json();
        const matchesData = await matchesResponse.json();
        if (active) {
          setReviews(reviewsData.reviews || []);
          setMatches(matchesData.matches || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const activeMatchId = form.matchId || routeMatchId || matches[0]?.id || "";
  const selectedMatch = matches.find((match) => match.id === activeMatchId) || null;

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function saveReview(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setReceipt(null);
    setToast(null);
    playSound("click");
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, matchId: activeMatchId })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.message || "Please check the review note.");
        playSound("warning");
        return;
      }
      const nextMessage = "Review saved. No one was auto-contacted.";
      setToast({ message: nextMessage, tone: "success" });
      playSound("success");
      setReceipt(data.review);
      setForm({ ...INITIAL_FORM, matchId: activeMatchId });
      const reviewsResponse = await fetch("/api/review");
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData.reviews || []);
    } catch (saveError) {
      setError("Review note could not be saved. Please try again.");
      playSound("warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Review Desk">
      <div className="grid gap-3 pb-8">
        <div className="flex items-end justify-between gap-3">
          <div>
          <p className="small-caps">Decision desk</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-50">Review Desk</h1>
          </div>
        </div>

        {routeMatchId && loading ? <LoadingState label="Loading selected lead" /> : null}

        <div className="grid gap-3 xl:grid-cols-[minmax(0,0.92fr)_minmax(380px,1fr)]">
          <div className="grid gap-3 xl:sticky xl:top-[72px] xl:self-start">
            <SelectedLeadPanel match={selectedMatch} activeMatchId={activeMatchId} />
            <HumanReviewChecklist />
            <RecentReviews reviews={reviews} loading={loading} />
          </div>

          <section className="panel p-3" aria-labelledby="review-form-heading">
            <p className="small-caps">Decision</p>
            <h2 id="review-form-heading" className="mt-1 text-xl font-semibold text-slate-50">
              Save review
            </h2>

            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              {["Check evidence", "Check conflicts", "Choose", "Save"].map((step) => (
                <div key={step} className="rounded-lg border border-white/[0.075] bg-white/[0.045] px-3 py-2 text-xs font-semibold text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                  {step}
                </div>
              ))}
            </div>

            <form className="mt-3 grid gap-2.5" onSubmit={saveReview}>
              <div className="grid gap-2 md:grid-cols-2">
                <label className="block">
                  <span className="field-label">Lead</span>
                  <select
                    className="field-input"
                    name="matchId"
                    value={activeMatchId}
                    onChange={(event) => {
                      updateField(event);
                      playSound("select");
                    }}
                  >
                    <option value="">Select lead</option>
                    {matches.map((match) => (
                      <option key={match.id} value={match.id}>
                        {match.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Decision</span>
                  <select className="field-input" name="decision" value={form.decision} onChange={updateField}>
                    <option>Needs more information</option>
                    <option>Escalate to coordinator</option>
                    <option>Reject lead</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <label className="block">
                  <span className="field-label">Reviewer role</span>
                  <select
                    className="field-input"
                    name="reviewerRole"
                    value={form.reviewerRole}
                    onChange={updateField}
                  >
                    {reviewerRoles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Reviewer name</span>
                  <input
                    className="field-input"
                    name="reviewerName"
                    value={form.reviewerName}
                    onChange={updateField}
                  />
                </label>
              </div>
              <label className="block">
                <span className="field-label">Decision notes</span>
                <textarea
                  className="field-input"
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={updateField}
                />
              </label>
              <RequiredCheck
                name="acknowledgedUnconfirmed"
                checked={form.acknowledgedUnconfirmed}
                onChange={updateField}
              >
                I understand this is not a confirmed identity.
              </RequiredCheck>
              <RequiredCheck name="checkedEvidence" checked={form.checkedEvidence} onChange={updateField}>
                I checked evidence, conflicts, and missing information.
              </RequiredCheck>
              {error ? <WarningBanner variant="danger">{error}</WarningBanner> : null}
              <button
                type="submit"
                className="btn-primary"
                disabled={
                  saving ||
                  !form.reviewerName.trim() ||
                  !activeMatchId ||
                  !form.acknowledgedUnconfirmed ||
                  !form.checkedEvidence
                }
              >
                {saving ? (
                  <>
                    <span className="busy-dot" />
                    Saving review
                  </>
                ) : (
                  "Save review"
                )}
              </button>
              {receipt ? (
                <p className="glass-card p-3 text-xs leading-5 text-slate-400">
                  Saved {receipt.id} for {receipt.matchId} at {formatDateTime(receipt.createdAt)}.
                </p>
              ) : null}
            </form>
          </section>
        </div>
        <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
      </div>
    </Layout>
  );
}

function SelectedLeadPanel({ match, activeMatchId }) {
  if (!match) {
    return (
    <section className="panel p-3" aria-labelledby="selected-lead-heading">
        <p className="small-caps">Selected lead</p>
        <h2 id="selected-lead-heading" className="mt-1 text-xl font-semibold text-slate-50">
          {activeMatchId || "No lead selected"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Choose a lead to review.</p>
      </section>
    );
  }

  return (
    <section className="panel overflow-hidden" aria-labelledby="selected-lead-heading">
      <div className="border-b border-white/[0.045] bg-white/[0.025] p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="small-caps">Selected lead</p>
            <h2 id="selected-lead-heading" className="mt-0.5 text-xl font-semibold tracking-tight text-slate-50">
              {match.id}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {match.missingReport?.name || "Missing report"} / {match.foundReport?.broadLocation || "restricted area"}
            </p>
          </div>
          <StatusPill tone={match.confidenceLabel === "High" ? "red" : "slate"}>
            {match.confidenceLabel || "Low"}
          </StatusPill>
        </div>
      </div>
      <div className="grid gap-2 p-3">
        <CompactList title="Evidence" items={match.reasons} empty="No evidence listed." open />
        <CompactList title="Conflicts" items={match.conflicts} empty="No conflicts listed." />
        <CompactList title="Missing" items={match.missingInfo} empty="No missing information listed." />
      </div>
    </section>
  );
}

function CompactList({ title, items = [], empty, open = false }) {
  const visibleItems = items.slice(0, 3);
  return (
    <details className="glass-card p-2.5" open={open}>
      <summary className="cursor-pointer text-xs font-semibold text-slate-100">{title}</summary>
      {visibleItems.length ? (
        <ul className="mt-2 grid gap-1.5 text-xs leading-5 text-slate-400">
          {visibleItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-red-500/55" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      )}
    </details>
  );
}

function RecentReviews({ reviews, loading }) {
  return (
    <section className="panel p-3" aria-labelledby="recent-reviews-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="small-caps">Audit</p>
          <h2 id="recent-reviews-heading" className="mt-0.5 text-base font-semibold text-slate-50">Recent notes</h2>
        </div>
        <StatusPill tone="slate">{reviews.length}</StatusPill>
      </div>
      {loading ? <LoadingState label="Loading notes" /> : null}
      {!loading && reviews.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No review notes yet.</p>
      ) : null}
      <div className="mt-2 grid gap-1.5">
        {reviews.slice(0, 2).map((review) => (
          <article key={review.id} className="glass-card p-2.5">
            <p className="text-xs font-semibold text-slate-100">
              {review.matchId} / {review.decision}
            </p>
            <p className="mt-1 text-xs text-slate-500">{formatDateTime(review.createdAt)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RequiredCheck({ children, name, checked, onChange }) {
  return (
    <label className="glass-card flex items-start gap-2.5 p-2.5">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="mt-1" />
      <span className="text-xs font-semibold leading-5 text-slate-300">{children}</span>
    </label>
  );
}
