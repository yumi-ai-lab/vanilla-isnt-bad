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
      sample: record.sample === true,
      flavor: Number.isInteger(record.flavor) && record.flavor >= 0 && record.flavor < 6 ? record.flavor : 0,
      featured: ["new", "picked", "seasonal"].includes(record.featured) ? record.featured : "",
      categories: Array.isArray(record.categories) ? [...new Set(record.categories.filter(x => typeof x === "string" && /^[a-z][a-z0-9-]*$/.test(x)))].slice(0, 5) : [],
      features: Array.isArray(record.features) ? record.features.filter(x => localized(x).trim()).slice(0, 5) : [],
      screenshots: Array.isArray(record.screenshots) ? record.screenshots.flatMap(x => x && imageUrl(x.src) ? [{src:imageUrl(x.src), alt:x.alt || ""}] : []).slice(0, 4) : [],
      platforms: Array.isArray(record.platforms) ? record.platforms.filter((x) => typeof x === "string").slice(0, 4) : []
    }];
  });
}

// Three genuinely available apps, never three copies or empty category doors.
export function featuredApps(records) {
  const selected = [];
  for (const slot of ["new", "picked", "seasonal"]) {
    const app = records.find(item => item.featured === slot && !selected.includes(item));
    if (app) selected.push(app);
  }
  for (const app of records) {
    if (selected.length >= 3) break;
    if (!selected.includes(app)) selected.push(app);
  }
  return selected;
}

export function resolveLanguage({query, saved, browser = "en"} = {}) {
  if (query === "en" || query === "ja") return query;
  if (saved === "en" || saved === "ja") return saved;
  return browser.toLowerCase().startsWith("ja") ? "ja" : "en";
}

// Keep the chosen cup on the table when switching between phone and desktop.
export function tablePage(count, index = 0, capacity = 3) {
  const size = Math.max(1, Math.floor(capacity));
  const total = Math.max(0, Math.floor(count));
  const cursor = Math.max(0, Math.min(total - 1, Math.floor(index)));
  const start = Math.floor(cursor / size) * size;
  const end = Math.min(total, start + size);
  return {start, end, previous:Math.max(0, start - size), next:Math.min(Math.max(0, total - 1), start + size), atStart:start === 0, atEnd:end >= total};
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
