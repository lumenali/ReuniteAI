import { GoogleGenAI } from "@google/genai";
import { detectSensitiveInfo, hidePreciseLocation, redactSensitiveInfo } from "./redaction";
import { getGeminiApiKey } from "./settings";
import {
  collectMissingFields,
  normalizeAgeRange,
  normalizePrivacyLevel,
  normalizeSourceReliability
} from "./validation";
import { parseList } from "./scoring";

export const GEMINI_MODEL = "gemini-2.5-flash-lite";
export const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash";
const GEMINI_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  GEMINI_MODEL,
  GEMINI_FALLBACK_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash"
].filter(Boolean);

export async function processReportWithGemini(report) {
  const fallback = buildFallbackStructuredReport(report);
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      aiAvailable: false,
      processingMode: "Fallback rules",
      model: null,
      data: fallback,
      error: "Missing Gemini API key"
    };
  }

  try {
    const result = await runGeminiJson(buildPrompt(report));

    return {
      aiAvailable: true,
      processingMode: "Gemini extraction",
      model: result.model,
      data: normalizeGeminiOutput(result.data, report),
      error: null
    };
  } catch (error) {
    safeServerLog("Gemini report processing failed", error);
    return {
      aiAvailable: false,
      processingMode: "Fallback rules",
      model: null,
      data: fallback,
      error: safeErrorMessage(error)
    };
  }
}

export async function checkGeminiConnection() {
  const apiKey = getGeminiApiKey();
  const lastCheck = new Date().toISOString();
  if (!apiKey) {
    return {
      ok: true,
      geminiConfigured: false,
      geminiConnected: false,
      model: GEMINI_MODEL,
      fallbackModel: GEMINI_FALLBACK_MODEL,
      lastCheck,
      message: "GEMINI_API_KEY missing"
    };
  }

  try {
    const result = await runGeminiJson(
      'Return JSON only: {"status":"ok"}',
      {
        expectedObject: true,
        maxOutputTokens: 64
      }
    );
    return {
      ok: true,
      geminiConfigured: true,
      geminiConnected: true,
      model: result.model,
      fallbackModel: GEMINI_FALLBACK_MODEL,
      lastCheck,
      message: "Gemini connected"
    };
  } catch (error) {
    safeServerLog("Gemini health check failed", error);
    return {
      ok: true,
      geminiConfigured: true,
      geminiConnected: false,
      model: GEMINI_MODEL,
      fallbackModel: GEMINI_FALLBACK_MODEL,
      lastCheck,
      message: safeErrorMessage(error)
    };
  }
}

export function buildFallbackStructuredReport(report) {
  const combinedText = [
    report.notes,
    report.description,
    report.clothing,
    report.location,
    report.name,
    report.languages
  ]
    .filter(Boolean)
    .join(" ");
  const sensitive = detectSensitiveInfo(combinedText);
  const redactedNotes = redactSensitiveInfo(report.notes || combinedText);
  const location = report.broadLocation || report.location || "";
  const base = {
    name: String(report.name || "").trim(),
    ageRange: normalizeAgeRange(report.ageRange || report.age),
    broadLocation: hidePreciseLocation(location),
    dateTime: report.dateTime || "",
    description: redactSensitiveInfo(report.description || ""),
    clothing: redactSensitiveInfo(report.clothing || ""),
    languages: parseList(report.languages),
    summary: makeFallbackSummary(report),
    privacyLevel: normalizePrivacyLevel(report.privacyLevel),
    sourceReliability: normalizeSourceReliability(report.sourceReliability),
    redactedNotes,
    risks: buildRisks(report, sensitive),
    missingFields: [],
    sensitiveInfoRemoved: sensitive.length > 0 || redactedNotes !== String(report.notes || combinedText)
  };
  base.missingFields = collectMissingFields(base);
  return base;
}

function normalizeGeminiOutput(output, originalReport) {
  const merged = {
    ...buildFallbackStructuredReport(originalReport),
    ...output,
    ageRange: normalizeAgeRange(output.ageRange || originalReport.ageRange || originalReport.age),
    broadLocation: hidePreciseLocation(output.broadLocation || originalReport.location || ""),
    privacyLevel: normalizePrivacyLevel(output.privacyLevel || originalReport.privacyLevel),
    sourceReliability: normalizeSourceReliability(
      output.sourceReliability || originalReport.sourceReliability
    ),
    languages: parseList(output.languages || originalReport.languages),
    redactedNotes: redactSensitiveInfo(output.redactedNotes || originalReport.notes || ""),
    description: redactSensitiveInfo(output.description || originalReport.description || ""),
    clothing: redactSensitiveInfo(output.clothing || originalReport.clothing || "")
  };
  const sensitive = detectSensitiveInfo(
    [originalReport.notes, output.redactedNotes, output.summary].filter(Boolean).join(" ")
  );
  merged.risks = unique([...(output.risks || []), ...buildRisks(originalReport, sensitive)]);
  merged.missingFields = unique([...(output.missingFields || []), ...collectMissingFields(merged)]);
  merged.sensitiveInfoRemoved =
    Boolean(output.sensitiveInfoRemoved) ||
    sensitive.length > 0 ||
    merged.redactedNotes !== String(output.redactedNotes || originalReport.notes || "");
  return merged;
}

function buildPrompt(report) {
  return `You are helping structure crisis reports for a disaster reunification support tool. You do not identify people. You do not confirm matches. Extract structured fields, summarize the report, redact sensitive information, and flag risks. Return JSON only. Do not include markdown.

Return exactly this JSON shape:
{
  "name": "",
  "ageRange": { "min": null, "max": null },
  "broadLocation": "",
  "dateTime": "",
  "description": "",
  "clothing": "",
  "languages": [],
  "summary": "",
  "privacyLevel": "",
  "sourceReliability": "",
  "redactedNotes": "",
  "risks": [],
  "missingFields": [],
  "sensitiveInfoRemoved": false
}

Rules:
- Use broad locations only. Do not expose exact addresses, room numbers, phone numbers, or emails.
- If a field is unknown, use an empty string, empty array, or null values.
- Use plain language.
- Do not confirm identity or decide whether reports match.

Report:
${JSON.stringify(report, null, 2)}`;
}

async function runGeminiJson(prompt, options = {}) {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const models = [...new Set(GEMINI_MODEL_CANDIDATES)];
  let lastError;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: options.maxOutputTokens || 1200
        }
      });
      const text = getResponseText(response);
      const data = parseJsonObject(text);
      if (!data) throw new Error("Gemini returned malformed JSON.");
      return { model, data };
    } catch (error) {
      lastError = error;
      safeServerLog(`Gemini model failed: ${model}`, error);
    }
  }

  throw lastError || new Error("Gemini request failed.");
}

function getResponseText(response) {
  if (!response) return "";
  if (typeof response.text === "function") return response.text();
  if (typeof response.text === "string") return response.text;
  return JSON.stringify(response);
}

function parseJsonObject(text) {
  if (!text) return null;
  const cleaned = String(text)
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (error) {
    const jsonCandidate = extractJsonCandidate(cleaned);
    if (!jsonCandidate) return null;
    try {
      return JSON.parse(jsonCandidate);
    } catch (innerError) {
      return null;
    }
  }
}

function extractJsonCandidate(text) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return "";
  return text.slice(first, last + 1);
}

function makeFallbackSummary(report) {
  const type = report.reportType || "Report";
  const location = report.location || report.broadLocation || "an unknown area";
  const name = report.name ? `${report.name} ` : "";
  return `${type} for ${name}near ${hidePreciseLocation(location)}. Sensitive details are redacted where detected.`;
}

function buildRisks(report, sensitive) {
  const risks = [];
  if (sensitive.length) risks.push("Sensitive info removed");
  if (report.privacyLevel === "Private") risks.push("Private report");
  if (report.sourceReliability === "Social media" || report.sourceReliability === "Unknown") {
    risks.push("Weak source");
  }
  const age = normalizeAgeRange(report.ageRange || report.age);
  if (age.max !== null && age.max < 18) risks.push("Minor report");
  if (!report.location && !report.broadLocation) risks.push("Vague location");
  risks.push("Lead, not confirmation");
  return unique(risks);
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function safeErrorMessage(error) {
  const message = String(error?.message || "Gemini unavailable");
  if (/api[_ -]?key|credential|token/i.test(message)) return "Gemini API key could not be used.";
  if (/quota|rate/i.test(message)) return "Gemini quota or rate limit was reached.";
  if (/network|fetch|socket|timeout|certificate/i.test(message)) return "Gemini network connection failed.";
  return message.slice(0, 180);
}

function safeServerLog(label, error) {
  if (typeof console === "undefined") return;
  const message = safeErrorMessage(error);
  if (process.env.NODE_ENV === "production") {
    console.warn(`${label}: ${message}`);
  } else {
    console.warn(`${label}: ${message}`);
  }
}
