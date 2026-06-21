import { getReviews, resetReviewsOnly, saveReview } from "../../lib/storage";

const DECISIONS = ["Needs more information", "Escalate to coordinator", "Reject lead"];
const ROLES = [
  "Shelter staff",
  "Trained volunteer",
  "Family liaison",
  "School/community center staff",
  "Emergency responder partner"
];

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, reviews: getReviews() });
  }

  if (req.method === "DELETE") {
    resetReviewsOnly();
    return res.status(200).json({ ok: true, message: "Saved review notes cleared." });
  }

  if (req.method === "POST") {
    const review = req.body || {};
    if (!review.acknowledgedUnconfirmed) {
      return res.status(400).json({
        ok: false,
        message: "A reviewer must acknowledge that this is not a confirmed identity."
      });
    }
    if (!review.checkedEvidence) {
      return res.status(400).json({
        ok: false,
        message: "A reviewer must check evidence, conflicts, and missing information."
      });
    }
    if (
      !review.matchId ||
      !review.reviewerName ||
      !ROLES.includes(review.reviewerRole) ||
      !DECISIONS.includes(review.decision)
    ) {
      return res.status(400).json({
        ok: false,
        message: "Please enter a match ID, reviewer role, reviewer name, and review decision."
      });
    }

    const savedReview = saveReview({
      matchId: String(review.matchId).trim(),
      reviewerRole: review.reviewerRole,
      reviewerName: String(review.reviewerName).trim(),
      decision: review.decision,
      notes: String(review.notes || "").trim(),
      acknowledgedUnconfirmed: true,
      checkedEvidence: true
    });

    return res.status(200).json({
      ok: true,
      review: savedReview,
      message: "Review note saved. No one was auto-contacted."
    });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ ok: false, message: "Unsupported method." });
}
