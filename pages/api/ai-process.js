import { buildFallbackStructuredReport, processReportWithGemini } from "../../lib/gemini";
import { generateMatches } from "../../lib/matching";
import { detectSensitiveInfo, hidePreciseLocation, redactSensitiveInfo } from "../../lib/redaction";
import { getReports, saveReport } from "../../lib/storage";
import {
  collectMissingFields,
  normalizeReportType,
  validateReportInput
} from "../../lib/validation";

const FALLBACK_MESSAGE =
  "AI extraction is offline. Safety redaction and rule-based matching are still active.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, message: "Use POST to process a report." });
  }

  const validation = validateReportInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      ok: false,
      errors: validation.errors,
      message: "Please add the required report details."
    });
  }

  try {
    const aiResult = await processReportWithGemini(req.body);
    const report = normalizeProcessedReport(req.body, aiResult.data);
    const savedReport = saveReport(report);
    const matches = generateMatches(getReports());

    return res.status(200).json({
      ok: true,
      aiAvailable: aiResult.aiAvailable,
      processingMode: aiResult.processingMode,
      model: aiResult.model,
      report: savedReport,
      possibleLeadCount: matches.length,
      message: aiResult.aiAvailable
        ? "AI extraction active. Gemini structured the report before rule-based matching."
        : FALLBACK_MESSAGE
    });
  } catch (error) {
    const fallbackReport = normalizeProcessedReport(req.body, buildFallbackStructuredReport(req.body));
    const savedReport = saveReport(fallbackReport);
    return res.status(200).json({
      ok: true,
      aiAvailable: false,
      processingMode: "Fallback rules",
      model: null,
      report: savedReport,
      message: FALLBACK_MESSAGE
    });
  }
}

function normalizeProcessedReport(raw, structured) {
  const combinedOriginal = [
    raw.notes,
    raw.location,
    raw.description,
    raw.clothing,
    raw.reporterRelationship
  ]
    .filter(Boolean)
    .join(" ");
  const sensitive = detectSensitiveInfo(combinedOriginal);
  const report = {
    reportType: normalizeReportType(raw.reportType),
    name: redactSensitiveInfo(structured.name || raw.name || ""),
    ageRange: structured.ageRange,
    broadLocation: hidePreciseLocation(structured.broadLocation || raw.location || ""),
    dateTime: structured.dateTime || raw.dateTime || "",
    description: redactSensitiveInfo(structured.description || raw.description || ""),
    clothing: redactSensitiveInfo(structured.clothing || raw.clothing || ""),
    languages: structured.languages || [],
    summary: redactSensitiveInfo(structured.summary || ""),
    privacyLevel: structured.privacyLevel || raw.privacyLevel || "Restricted",
    sourceReliability: structured.sourceReliability || raw.sourceReliability || "Unknown",
    redactedNotes: redactSensitiveInfo(structured.redactedNotes || raw.notes || ""),
    risks: unique([
      ...(structured.risks || []),
      ...(sensitive.length ? ["Sensitive info removed"] : []),
      "Lead, not confirmation"
    ]),
    missingFields: [],
    sensitiveInfoRemoved: Boolean(structured.sensitiveInfoRemoved || sensitive.length),
    createdAt: new Date().toISOString()
  };
  report.missingFields = unique([...(structured.missingFields || []), ...collectMissingFields(report)]);
  return report;
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}
