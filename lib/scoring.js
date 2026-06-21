const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "boy",
  "girl",
  "child",
  "center",
  "centre",
  "community",
  "evacuation",
  "for",
  "from",
  "he",
  "her",
  "him",
  "in",
  "is",
  "near",
  "of",
  "on",
  "or",
  "person",
  "said",
  "seen",
  "shelter",
  "she",
  "site",
  "the",
  "to",
  "was",
  "with"
]);

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter(Boolean);
}

export function keywordSet(value) {
  return new Set(
    tokenize(value).filter((token) => token.length > 2 && !STOPWORDS.has(token))
  );
}

export function intersection(a, b) {
  const second = b instanceof Set ? b : new Set(b);
  return [...a].filter((item) => second.has(item));
}

export function keywordOverlap(first, second) {
  return intersection(keywordSet(first), keywordSet(second));
}

export function nameSimilarity(first, second) {
  const a = normalizeText(first);
  const b = normalizeText(second);
  if (!a || !b) return null;
  if (a === b) return 1;

  const aParts = a.split(" ");
  const bParts = b.split(" ");
  if (aParts.some((part) => bParts.includes(part))) return 0.88;
  if (a.includes(b) || b.includes(a)) return 0.82;

  const distance = levenshtein(a, b);
  const longest = Math.max(a.length, b.length);
  return longest === 0 ? 0 : 1 - distance / longest;
}

export function locationOverlap(first, second) {
  const overlap = keywordOverlap(first, second).filter(
    (word) => !["area", "road", "street", "avenue", "main"].includes(word)
  );
  if (overlap.length >= 2) return { level: "high", words: overlap };
  if (overlap.length === 1) return { level: "medium", words: overlap };
  return { level: "none", words: [] };
}

export function languageOverlap(first = [], second = []) {
  const a = parseList(first).map(normalizeText).filter(Boolean);
  const b = parseList(second).map(normalizeText).filter(Boolean);
  return intersection(new Set(a), new Set(b));
}

export function parseList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[,;/]|\band\b/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j - 1] + cost,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1
      );
    }
  }

  return matrix[b.length][a.length];
}
