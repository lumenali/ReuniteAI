import { resetDemoData } from "../../lib/storage";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, message: "Use POST to load demo data." });
  }

  const data = resetDemoData();
  return res.status(200).json({
    ok: true,
    reports: data.reports,
    reviews: data.reviews,
    message: "Synthetic demo data loaded. No real missing-person data is used."
  });
}
