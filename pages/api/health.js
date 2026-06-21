import { checkGeminiConnection } from "../../lib/gemini";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, message: "Use GET to check system health." });
  }

  const health = await checkGeminiConnection();
  return res.status(200).json(health);
}
