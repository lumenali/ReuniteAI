export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || "";
}

export function getSettingsStatus() {
  const key = getGeminiApiKey();
  return {
    geminiConfigured: Boolean(key),
    maskedKey: maskKey(key),
    source: key ? "Vercel environment" : "not configured"
  };
}

function maskKey(key) {
  if (!key) return "";
  if (key.length <= 8) return "saved";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
