import fs from "fs";
import path from "path";
import { seedReports, seedReviews } from "./seedData";

const DATA_DIR =
  process.env.REUNITEAI_DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

const memoryStore = {
  reports: structuredCloneSafe(seedReports),
  reviews: structuredCloneSafe(seedReviews)
};

export function getReports() {
  return readJson(REPORTS_FILE, "reports", seedReports);
}

export function saveReport(report) {
  const reports = getReports();
  const nextReport = {
    ...report,
    id: report.id || nextId("REP", reports),
    createdAt: report.createdAt || new Date().toISOString()
  };
  reports.push(nextReport);
  writeJson(REPORTS_FILE, "reports", reports);
  return nextReport;
}

export function resetDemoData() {
  const reports = structuredCloneSafe(seedReports);
  const reviews = structuredCloneSafe(seedReviews);
  writeJson(REPORTS_FILE, "reports", reports);
  writeJson(REVIEWS_FILE, "reviews", reviews);
  return { reports, reviews };
}

export function getReviews() {
  return readJson(REVIEWS_FILE, "reviews", seedReviews);
}

export function resetReviewsOnly() {
  writeJson(REVIEWS_FILE, "reviews", []);
  return [];
}

export function saveReview(review) {
  const reviews = getReviews();
  const nextReview = {
    ...review,
    id: review.id || nextId("REV", reviews),
    createdAt: review.createdAt || new Date().toISOString()
  };
  reviews.push(nextReview);
  writeJson(REVIEWS_FILE, "reviews", reviews);
  return nextReview;
}

function readJson(filePath, key, fallback) {
  try {
    ensureFile(filePath, fallback);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) throw new Error("Data file must contain an array.");
    if (key === "reports" && parsed.length === 0 && fallback.length > 0) {
      writeJson(filePath, key, fallback);
      return structuredCloneSafe(fallback);
    }
    memoryStore[key] = structuredCloneSafe(parsed);
    return parsed;
  } catch (error) {
    return structuredCloneSafe(memoryStore[key] || fallback);
  }
}

function writeJson(filePath, key, value) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    memoryStore[key] = structuredCloneSafe(value);
  } catch (error) {
    memoryStore[key] = structuredCloneSafe(value);
  }
}

function ensureFile(filePath, fallback) {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${JSON.stringify(fallback, null, 2)}\n`, "utf8");
  }
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function nextId(prefix, items) {
  const max = items.reduce((highest, item) => {
    const number = Number(String(item.id || "").replace(`${prefix}-`, ""));
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 1000);
  return `${prefix}-${max + 1}`;
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}
