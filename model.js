export function localized(value, language = "en") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  for (const key of [language, "en", "ja"]) {
    if (typeof value[key] === "string" && value[key]) return value[key];
  }
  return "";
}

export function externalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function imageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  if (/^\.?\/?assets\/[a-zA-Z0-9_./%-]+$/.test(value) && !value.includes("..")) {
    return value;
  }
  return externalUrl(value);
}

export function normalizeApps(records) {
  if (!Array.isArray(records)) return [];
  const seen = new Set();
  return records.flatMap((record) => {
    if (!record || typeof record !== "object") return [];
    const id = String(record.id || "").trim();
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || seen.has(id) || !localized(record.name).trim()) return [];
    seen.add(id);
    return [{
      id,
      name: record.name,
      tagline: record.tagline || "",
      description: record.description || record.tagline || "",
      icon: imageUrl(record.icon),
      url: externalUrl(record.url),
      platforms: Array.isArray(record.platforms) ? record.platforms.filter((x) => typeof x === "string").slice(0, 4) : []
    }];
  });
}

export function resolveLanguage({query, saved, browser = "en"} = {}) {
  if (query === "en" || query === "ja") return query;
  if (saved === "en" || saved === "ja") return saved;
  return browser.toLowerCase().startsWith("ja") ? "ja" : "en";
}

// All counter bays have the same responsive width. Keep navigation bounded:
// fractional last positions must not repeat or skip the final app.
export function shelfState(count, itemWidth, viewportWidth, scrollLeft = 0) {
  if (count < 1 || itemWidth <= 0 || viewportWidth <= 0) {
    return { first: 0, last: 0, max: 0, previous: 0, next: 0, nearest: 0, atStart: true, atEnd: true };
  }
  const max = Math.max(0, count * itemWidth - viewportWidth);
  const left = Math.max(0, Math.min(max, scrollLeft));
  const bounded = value => Math.max(0, Math.min(max, value));
  const first = Math.min(count, Math.floor((left + itemWidth * .5) / itemWidth) + 1);
  const last = Math.max(first, Math.min(count, Math.floor((left + viewportWidth - itemWidth * .5) / itemWidth) + 1));
  return {
    first, last, max,
    previous: bounded((Math.ceil((left - 1) / itemWidth) - 1) * itemWidth),
    next: bounded((Math.floor((left + 1) / itemWidth) + 1) * itemWidth),
    nearest: bounded(Math.round(left / itemWidth) * itemWidth),
    atStart: left <= 1,
    atEnd: max - left <= 1
  };
}
