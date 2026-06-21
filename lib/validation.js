import { parseList } from "./scoring";

export const REPORT_TYPES = ["Missing Person Report", "Found / Sighting Report"];
export const PRIVACY_LEVELS = ["Public", "Restricted", "Private"];
export const SOURCE_RELIABILITY = [
  "Direct witness",
  "Family or friend",
  "Shelter staff",
  "Volunteer",
  "Social media",
  "Unknown"
];

export function normalizeReportType(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("missing")) return "Missing Person Report";
  if (text.includes("found") || text.includes("sighting")) return "Found / Sighting Report";
  return "";
}

export function normalizePrivacyLevel(value) {
  return PRIVACY_LEVELS.includes(value) ? value : "Restricted";
}

export function normalizeSourceReliability(value) {
  return SOURCE_RELIABILITY.includes(value) ? value : "Unknown";
}

export function normalizeAgeRange(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const min = numberOrNull(value.min);
    const max = numberOrNull(value.max);
    return orderRange(min, max);
  }

  const text = String(value || "").toLowerCase().trim();
  if (!text) return { min: null, max: null };
  if (text.includes("teen")) return { min: 13, max: 19 };
  if (text.includes("child")) return { min: 3, max: 12 };
  if (text.includes("young adult")) return { min: 18, max: 25 };
  if (text.includes("older") || text.includes("senior")) return { min: 60, max: 90 };

  const range = text.match(/(\d{1,3})\s*(?:-|to|through)\s*(\d{1,3})/);
  if (range) return orderRange(numberOrNull(range[1]), numberOrNull(range[2]));

  const single = text.match(/\d{1,3}/);
  if (single) {
    const age = numberOrNull(single[0]);
    return { min: age, max: age };
  }

  return { min: null, max: null };
}

export function ageRangeLabel(ageRange) {
  const normalized = normalizeAgeRange(ageRange);
  if (normalized.min === null && normalized.max === null) return "Not provided";
  if (normalized.min === normalized.max) return String(normalized.min);
  if (normalized.min === null) return `Up to ${normalized.max}`;
  if (normalized.max === null) return `${normalized.min}+`;
  return `${normalized.min}-${normalized.max}`;
}

export function collectMissingFields(report) {
  const missing = [];
  const ageRange = normalizeAgeRange(report.ageRange || report.age);
  if (ageRange.min === null && ageRange.max === null) missing.push("Missing age");
  if (!report.broadLocation && !report.location) missing.push("Missing location");
  if (!report.dateTime) missing.push("Missing exact time");
  if (!report.description) missing.push("Missing description");
  if (!report.clothing) missing.push("Missing clothing");
  if (parseList(report.languages).length === 0) missing.push("Missing language");
  if (!report.sourceReliability || report.sourceReliability === "Unknown") {
    missing.push("Missing source reliability");
  }
  return unique(missing);
}

export function validateReportInput(input = {}) {
  const errors = {};
  const reportType = normalizeReportType(input.reportType);
  if (!reportType) errors.reportType = "Choose a report type.";

  const descriptiveFields = [
    input.name,
    input.age,
    input.ageRange,
    input.location,
    input.broadLocation,
    input.dateTime,
    input.description,
    input.clothing,
    input.languages,
    input.notes
  ];

  const hasDetail = descriptiveFields.some((value) => {
    if (!value) return false;
    if (typeof value === "object") {
      const ageRange = normalizeAgeRange(value);
      return ageRange.min !== null || ageRange.max !== null;
    }
    return String(value).trim().length > 0;
  });

  if (!hasDetail) {
    errors.notes = "This field needs more detail before matching will be useful.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    reportType
  };
}

function numberOrNull(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 120) return null;
  return Math.round(number);
}

function orderRange(min, max) {
  if (min !== null && max !== null && min > max) return { min: max, max: min };
  return { min, max };
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}
