import { getSettingsStatus } from "../../lib/settings";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, settings: getSettingsStatus() });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ ok: false, message: "Settings are managed by deployment environment." });
}
