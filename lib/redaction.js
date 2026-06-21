const PHONE_REGEX = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g;
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const STREET_ADDRESS_REGEX = /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Court|Ct\.?|Way|Place|Pl\.?)\b(?:\s*,?\s*(?:Apt|Apartment|Unit|Suite|#)\s*[A-Za-z0-9-]+)?/gi;
const UNIT_REGEX = /\b(?:Apt|Apartment|Unit|Suite|#)\s*[A-Za-z0-9-]+\b/gi;
const ROOM_REGEX = /\b(shelter|hotel|hospital|clinic|school|gym|center|centre)\s+(?:room|rm|unit)\s+[A-Za-z0-9-]+\b/gi;
const POSTAL_REGEX = /\b(?:\d{5}(?:-\d{4})?|[A-Z]\d[A-Z][ -]?\d[A-Z]\d)\b/gi;

export function redactSensitiveInfo(text) {
  if (!text) return "";
  let redacted = String(text);
  const addressLike = hasStreetAddress(redacted);

  redacted = redacted.replace(EMAIL_REGEX, "[REDACTED EMAIL]");
  redacted = redacted.replace(PHONE_REGEX, "[REDACTED PHONE]");
  redacted = redacted.replace(STREET_ADDRESS_REGEX, "[REDACTED ADDRESS]");
  redacted = redacted.replace(ROOM_REGEX, (_, place) => `${place} [REDACTED ROOM]`);
  redacted = redacted.replace(UNIT_REGEX, "[REDACTED ROOM]");

  if (addressLike || /\b(address|street|st\.?|apt|unit|suite|zip|postal)\b/i.test(text)) {
    redacted = redacted.replace(POSTAL_REGEX, "[REDACTED ADDRESS]");
  }

  return redacted.replace(/\s{2,}/g, " ").trim();
}

export function detectSensitiveInfo(text) {
  const value = String(text || "");
  const detected = [];
  if (EMAIL_REGEX.test(value)) detected.push("Email detected");
  if (PHONE_REGEX.test(value)) detected.push("Phone number detected");
  if (hasStreetAddress(value) || UNIT_REGEX.test(value) || POSTAL_REGEX.test(value)) {
    detected.push("Precise address detected");
  }
  if (ROOM_REGEX.test(value)) detected.push("Room number detected");
  resetRegexes();
  return detected;
}

export function hidePreciseLocation(location) {
  const value = String(location || "").trim();
  if (!value) return "";

  if (hasStreetAddress(value)) {
    const afterAddress = value
      .replace(STREET_ADDRESS_REGEX, " ")
      .replace(ROOM_REGEX, " ")
      .replace(/\b(?:apt|apartment|unit|suite|room|rm|shelter|hotel|hospital)\b/gi, " ")
      .replace(/[0-9#,-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const city = afterAddress.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/);
    resetRegexes();
    return city ? `${city[0]} area` : "Nearby area";
  }

  const namedStreet = value.match(
    /\b([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,2})\s+(Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Way|Place|Pl\.?)\b/i
  );
  if (namedStreet) {
    return `${toTitleCase(namedStreet[1])} ${normalizeStreetType(namedStreet[2])} area`;
  }

  const downtown = value.match(/\b(Downtown(?:\s+[A-Za-z]+)?)/i);
  if (downtown) return `${toTitleCase(downtown[1])} area`;

  const broad = value
    .replace(/\b(?:evacuation|shelter|school|gym|community|center|centre|hospital|clinic|hotel|room|rm|unit|pickup|site)\b/gi, " ")
    .replace(/[0-9#,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!broad) return "Nearby area";
  if (/\barea$/i.test(broad)) {
    return `${toTitleCase(broad.replace(/\barea$/i, "").trim())} area`;
  }
  return `${toTitleCase(broad)} area`;
}

function hasStreetAddress(value) {
  const result = STREET_ADDRESS_REGEX.test(value);
  resetRegexes();
  return result;
}

function resetRegexes() {
  PHONE_REGEX.lastIndex = 0;
  EMAIL_REGEX.lastIndex = 0;
  STREET_ADDRESS_REGEX.lastIndex = 0;
  UNIT_REGEX.lastIndex = 0;
  ROOM_REGEX.lastIndex = 0;
  POSTAL_REGEX.lastIndex = 0;
}

function normalizeStreetType(value) {
  const text = value.toLowerCase().replace(".", "");
  const map = {
    st: "Street",
    street: "Street",
    ave: "Avenue",
    avenue: "Avenue",
    rd: "Road",
    road: "Road",
    blvd: "Boulevard",
    boulevard: "Boulevard",
    dr: "Drive",
    drive: "Drive",
    ln: "Lane",
    lane: "Lane",
    way: "Way",
    pl: "Place",
    place: "Place"
  };
  return map[text] || toTitleCase(value);
}

function toTitleCase(value) {
  return String(value || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
