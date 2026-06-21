import { buildFallbackStructuredReport } from "../../lib/gemini";
import { hidePreciseLocation, redactSensitiveInfo } from "../../lib/redaction";
import { getReports, saveReport } from "../../lib/storage";
import { collectMissingFields, normalizeReportType, validateReportInput } from "../../lib/validation";

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, reports: getReports() });
  }

  if (req.method === "POST") {
    const validation = validateReportInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
        message: "Please add the required report details."
      });
    }

    const structured = buildFallbackStructuredReport(req.body);
    const report = {
      reportType: normalizeReportType(req.body.reportType),
      name: redactSensitiveInfo(structured.name || req.body.name || ""),
      ageRange: structured.ageRange,
      broadLocation: hidePreciseLocation(structured.broadLocation || req.body.location || ""),
      dateTime: structured.dateTime || req.body.dateTime || "",
      description: redactSensitiveInfo(structured.description || ""),
      clothing: redactSensitiveInfo(structured.clothing || ""),
      languages: structured.languages || [],
      summary: redactSensitiveInfo(structured.summary || ""),
      privacyLevel: structured.privacyLevel,
      sourceReliability: structured.sourceReliability,
      redactedNotes: redactSensitiveInfo(structured.redactedNotes || ""),
      risks: structured.risks || ["Lead, not confirmation"],
      missingFields: collectMissingFields(structured),
      sensitiveInfoRemoved: structured.sensitiveInfoRemoved,
      createdAt: new Date().toISOString()
    };

    return res.status(200).json({
      ok: true,
      report: saveReport(report),
      message: "Report saved with deterministic redaction."
    });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, message: "Unsupported method." });
}
