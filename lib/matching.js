import { hoursBetween } from "./dates";
import {
  keywordOverlap,
  languageOverlap,
  locationOverlap,
  nameSimilarity,
  normalizeText
} from "./scoring";
import { normalizeAgeRange } from "./validation";

const CONFIDENCE_ORDER = { High: 0, Medium: 1, Low: 2 };

export function generateMatches(reports = [], reviews = []) {
  const missingReports = reports.filter((report) =>
    String(report.reportType || "").toLowerCase().includes("missing")
  );
  const foundReports = reports.filter((report) => {
    const type = String(report.reportType || "").toLowerCase();
    return type.includes("found") || type.includes("sighting");
  });

  const matches = [];
  for (const missing of missingReports) {
    for (const found of foundReports) {
      const result = compareReports(missing, found);
      if (shouldShowLead(result)) {
        matches.push(result);
      }
    }
  }

  return matches
    .sort((a, b) => {
      const confidence = CONFIDENCE_ORDER[a.confidenceLabel] - CONFIDENCE_ORDER[b.confidenceLabel];
      if (confidence !== 0) return confidence;
      return b.internalScore - a.internalScore;
    })
    .map((match, index) => {
      const id = `MATCH-${1001 + index}`;
      const latestReview = latestReviewForMatch(id, reviews);
      return {
        id,
        missingReportId: match.missingReportId,
        foundReportId: match.foundReportId,
        missingReport: match.missingReport,
        foundReport: match.foundReport,
        confidenceLabel: match.confidenceLabel,
        leadStrengthText: leadStrengthText(match.confidenceLabel),
        reasons: match.reasons,
        conflicts: match.conflicts,
        missingInfo: match.missingInfo,
        evidenceCount: match.reasons.length,
        conflictCount: match.conflicts.length,
        missingInfoCount: match.missingInfo.length,
        whyThisLeadAppeared: whyThisLeadAppeared(match),
        reviewRequired: true,
        reviewStatus: latestReview ? latestReview.decision : "Not reviewed",
        latestReview,
        safetyNotice: "This is a possible lead, not a confirmed identity.",
        createdAt: match.createdAt
      };
    });
}

export function compareReports(missing, found) {
  const reasons = [];
  const conflicts = [];
  const missingInfo = [];
  let score = 0;
  let strongSignals = 0;
  let seriousConflict = false;
  let nameSignal = false;

  const name = nameSimilarity(missing.name, found.name);
  if (name === null) {
    missingInfo.push("Missing name or nickname");
  } else if (name >= 0.82) {
    reasons.push("Name or nickname is similar");
    score += name >= 0.9 ? 3 : 2;
    strongSignals += 1;
    nameSignal = true;
  }

  const ageResult = compareAge(missing.ageRange, found.ageRange);
  score += ageResult.score;
  strongSignals += ageResult.strong ? 1 : 0;
  seriousConflict = seriousConflict || ageResult.seriousConflict;
  pushAll(reasons, ageResult.reasons);
  pushAll(conflicts, ageResult.conflicts);
  pushAll(missingInfo, ageResult.missingInfo);

  const locationResult = compareLocation(missing.broadLocation, found.broadLocation);
  score += locationResult.score;
  strongSignals += locationResult.strong ? 1 : 0;
  pushAll(reasons, locationResult.reasons);
  pushAll(conflicts, locationResult.conflicts);
  pushAll(missingInfo, locationResult.missingInfo);

  const timelineResult = compareTimeline(missing.dateTime, found.dateTime);
  score += timelineResult.score;
  strongSignals += timelineResult.strong ? 1 : 0;
  seriousConflict = seriousConflict || timelineResult.seriousConflict;
  pushAll(reasons, timelineResult.reasons);
  pushAll(conflicts, timelineResult.conflicts);
  pushAll(missingInfo, timelineResult.missingInfo);

  const detailResult = compareDetails(missing, found);
  score += detailResult.score;
  strongSignals += detailResult.strongSignals;
  pushAll(reasons, detailResult.reasons);
  pushAll(conflicts, detailResult.conflicts);
  pushAll(missingInfo, detailResult.missingInfo);

  const sourceResult = compareSource(found.sourceReliability);
  score += sourceResult.score;
  pushAll(reasons, sourceResult.reasons);
  pushAll(conflicts, sourceResult.conflicts);
  pushAll(missingInfo, sourceResult.missingInfo);

  const confidenceLabel = labelConfidence(score, strongSignals, seriousConflict, nameSignal);

  return {
    missingReportId: missing.id,
    foundReportId: found.id,
    missingReport: summarizeReport(missing),
    foundReport: summarizeReport(found),
    confidenceLabel,
    reasons: unique(reasons),
    conflicts: unique(conflicts),
    missingInfo: unique(missingInfo),
    internalScore: score,
    strongSignals,
    seriousConflict,
    createdAt: new Date().toISOString()
  };
}

function compareAge(missingAge, foundAge) {
  const missing = normalizeAgeRange(missingAge);
  const found = normalizeAgeRange(foundAge);
  if (missing.min === null || missing.max === null || found.min === null || found.max === null) {
    return result({ missingInfo: ["Missing age"] });
  }
  if (missing.max < found.min || found.max < missing.min) {
    const gap = Math.max(found.min - missing.max, missing.min - found.max);
    return result({
      score: gap > 3 ? -3 : -1,
      conflicts: ["Age ranges do not overlap"],
      seriousConflict: gap > 3
    });
  }
  return result({ score: 2, reasons: ["Age ranges overlap"], strong: true });
}

function compareLocation(missingLocation, foundLocation) {
  if (!missingLocation || !foundLocation) {
    return result({ missingInfo: ["Missing broad location"] });
  }
  const overlap = locationOverlap(missingLocation, foundLocation);
  if (overlap.level === "high") {
    return result({ score: 2, reasons: ["Broad location matches"], strong: true });
  }
  if (overlap.level === "medium") {
    return result({ score: 1, reasons: ["Nearby location words overlap"] });
  }
  return result({ score: -1, conflicts: ["Different broad locations"] });
}

function compareTimeline(missingDateTime, foundDateTime) {
  const hours = hoursBetween(missingDateTime, foundDateTime);
  if (hours === null) {
    return result({ missingInfo: ["Missing exact time"] });
  }
  if (hours < 0) {
    return result({
      score: hours < -1 ? -4 : -2,
      conflicts: ["Sighting happened before last-seen time"],
      seriousConflict: hours < -1
    });
  }
  if (hours <= 72) {
    return result({ score: 2, reasons: ["Timeline is possible"], strong: true });
  }
  if (hours <= 168) {
    return result({ score: 1, reasons: ["Timeline is possible but farther apart"] });
  }
  return result({ missingInfo: ["Timeline is far apart"] });
}

function compareDetails(missing, found) {
  const reasons = [];
  const conflicts = [];
  const missingInfo = [];
  let score = 0;
  let strongSignals = 0;

  const clothingOverlap = keywordOverlap(missing.clothing, found.clothing);
  if (!missing.clothing || !found.clothing) {
    missingInfo.push("Missing clothing");
  } else if (clothingOverlap.length >= 2) {
    reasons.push("Clothing keywords overlap");
    score += 2;
    strongSignals += 1;
  } else if (clothingOverlap.length === 1) {
    reasons.push("One clothing detail overlaps");
    score += 1;
  }

  const languageMatches = languageOverlap(missing.languages, found.languages);
  if (!missing.languages?.length || !found.languages?.length) {
    missingInfo.push("Missing language");
  } else if (languageMatches.filter((language) => language !== "english").length > 0) {
    reasons.push("Language matches");
    score += 1.5;
    strongSignals += 1;
  }

  const descriptionText = [missing.description, missing.summary, missing.redactedNotes].join(" ");
  const foundText = [found.description, found.summary, found.redactedNotes].join(" ");
  const sharedDetails = keywordOverlap(descriptionText, foundText);
  const rareDetails = sharedDetails.filter((word) =>
    ["scar", "glasses", "cane", "notebook", "mother", "beard", "backpack"].includes(word)
  );
  if (!normalizeText(descriptionText) || !normalizeText(foundText)) {
    missingInfo.push("Missing description");
  } else if (rareDetails.length > 0) {
    reasons.push("Specific description detail overlaps");
    score += 2;
    strongSignals += 1;
  }

  if (!reasons.length && !conflicts.length) {
    missingInfo.push("Limited descriptive overlap");
  }

  return { reasons, conflicts, missingInfo, score, strongSignals };
}

function compareSource(sourceReliability) {
  if (["Direct witness", "Shelter staff", "Family or friend"].includes(sourceReliability)) {
    return result({ score: 0.5 });
  }
  if (["Social media", "Unknown"].includes(sourceReliability)) {
    return result({ score: -1, conflicts: ["Weak source reliability"] });
  }
  return result({ missingInfo: ["Missing source reliability"] });
}

function labelConfidence(score, strongSignals, seriousConflict, nameSignal) {
  if (!seriousConflict && nameSignal && strongSignals >= 4 && score >= 9) return "High";
  if (!seriousConflict && ((strongSignals >= 2 && score >= 4) || score >= 6)) return "Medium";
  return "Low";
}

function shouldShowLead(match) {
  return (
    match.confidenceLabel === "High" ||
    match.confidenceLabel === "Medium" ||
    (match.seriousConflict && match.strongSignals >= 2)
  );
}

function summarizeReport(report) {
  return {
    id: report.id,
    reportType: report.reportType,
    name: report.name || "Name not provided",
    ageRange: report.ageRange,
    broadLocation: report.broadLocation || "Location not provided",
    dateTime: report.dateTime || "",
    description: report.description || "",
    clothing: report.clothing || "",
    languages: report.languages || [],
    summary: report.summary || "",
    privacyLevel: report.privacyLevel || "Restricted",
    sourceReliability: report.sourceReliability || "Unknown",
    redactedNotes: report.redactedNotes || "",
    risks: report.risks || [],
    missingFields: report.missingFields || []
  };
}

function result({
  score = 0,
  reasons = [],
  conflicts = [],
  missingInfo = [],
  strong = false,
  seriousConflict = false
} = {}) {
  return { score, reasons, conflicts, missingInfo, strong, seriousConflict };
}

function pushAll(target, items = []) {
  target.push(...items);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function latestReviewForMatch(matchId, reviews = []) {
  return reviews
    .filter((review) => review.matchId === matchId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

function leadStrengthText(label) {
  if (label === "High") return "High lead strength - still unconfirmed";
  if (label === "Medium") return "Medium lead strength - human review required";
  return "Low lead strength - needs more information";
}

function whyThisLeadAppeared(match) {
  const shared = match.reasons.slice(0, 4).join(", ").toLowerCase();
  if (match.conflicts.length) {
    return "This lead has conflicts and should not be escalated without more information.";
  }
  if (match.confidenceLabel === "Low") {
    return "This lead is weak. It is shown so reviewers can decide whether more information is needed.";
  }
  return `This lead appeared because the reports share ${shared || "reviewable details"}. A reviewer must still verify identity manually.`;
}
