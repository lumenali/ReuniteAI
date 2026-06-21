export function nowIso() {
  return new Date().toISOString();
}

export function parseReportDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function hoursBetween(startValue, endValue) {
  const start = parseReportDate(startValue);
  const end = parseReportDate(endValue);
  if (!start || !end) return null;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

export function formatDateTime(value) {
  const date = parseReportDate(value);
  if (!date) return "Not provided";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function sortNewestFirst(items) {
  return [...items].sort((a, b) => {
    const aTime = parseReportDate(a.createdAt)?.getTime() || 0;
    const bTime = parseReportDate(b.createdAt)?.getTime() || 0;
    return bTime - aTime;
  });
}
