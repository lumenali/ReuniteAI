import { generateMatches } from "../../lib/matching";
import { getReports, getReviews } from "../../lib/storage";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, message: "Use GET to view possible leads." });
  }

  const reports = getReports();
  if (!reports.length) {
    return res.status(200).json({
      ok: true,
      matches: [],
      message: "No possible leads yet. Add reports or load demo data."
    });
  }

  const matches = generateMatches(reports, getReviews());
  return res.status(200).json({
    ok: true,
    matches,
    message: matches.length
      ? "Possible leads loaded for human review."
      : "No possible leads yet. Add reports or load demo data."
  });
}
