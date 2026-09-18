import { localized, normalizeApps } from "./model.js";

export const categories = [
  {id:"focus", label:{en:"Focus", ja:"集中する"}},
  {id:"record", label:{en:"Write & record", ja:"書く・記録する"}},
  {id:"organize", label:{en:"Organize", ja:"暮らしを整える"}},
  {id:"other", label:{en:"More", ja:"そのほか"}}
];
const knownIds = categories.filter(item => item.id !== "other").map(item => item.id);
const inCategory = (app, category) => category === "all" || (category === "other"
  ? !app.categories.some(id => knownIds.includes(id))
  : app.categories.includes(category));

// Normalize width and kana so phone keyboards do not change search results.
export function searchText(value) {
  return String(value).normalize("NFKC").toLowerCase()
    .replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(/\s+/g, " ").trim();
}

export function availableCategories(records) {
  return categories.filter(category => records.some(app => inCategory(app, category.id)));
}

// Search-only words are optional metadata. Sample specifications and aliases
// must never become claims about a real app with the same ID.
export function menuRecords(source, sampleNotes = {}) {
  const originals = new Map();
  for (const app of Array.isArray(source) ? source : []) {
    if (app && !originals.has(app.id)) originals.set(app.id, app);
  }
  return normalizeApps(source).map(app => {
    const notes = app.sample ? sampleNotes[app.id] : null;
    const extra = originals.get(app.id)?.searchTerms;
    return {
      ...app,
      searchTerms: [...(Array.isArray(extra) ? extra : []), ...(notes?.searchTerms || [])]
        .filter(word => typeof word === "string" && word.trim()).slice(0, 24),
      features: [...app.features, ...(notes?.specs || []).map(spec => spec.label)]
    };
  });
}

export function readMenuFilters(href, records) {
  const url = new URL(href);
  const requested = url.searchParams.get("category");
  return {
    query: (url.searchParams.get("q") || "").slice(0, 200),
    category: availableCategories(records).some(item => item.id === requested) ? requested : "all"
  };
}

export function menuFilterUrl(href, {query, category}) {
  const url = new URL(href);
  if (query.trim()) url.searchParams.set("q", query.trim().slice(0, 200));
  else url.searchParams.delete("q");
  if (category !== "all") url.searchParams.set("category", category);
  else url.searchParams.delete("category");
  return url;
}

export function filterApps(records, query = "", category = "all") {
  const normalized = searchText(query);
  const terms = normalized.split(" ").filter(Boolean);
  const candidates = records.filter(app => inCategory(app, category));
  if (!terms.length) return candidates;
  const texts = words => words.flatMap(word => [localized(word, "ja"),localized(word, "en")]).map(searchText);
  return candidates.map((app, index) => {
    const names = texts([app.name]);
    const groups = [
      [names, 60], [texts([app.tagline]), 35],
      [texts(app.searchTerms || []), 30], [texts(app.features), 20],
      [texts([app.description]), 5]
    ];
    let score = 0;
    for (const term of terms) {
      const matches = groups.flatMap(([words, weight]) => words.filter(word => word.includes(term)).map(word => weight + (word === term ? 10 : 0)));
      if (!matches.length) return null;
      score += Math.max(...matches);
    }
    if (names.includes(normalized)) score += 200;
    else if (names.some(name => name.startsWith(normalized))) score += 80;
    return {app, score, index};
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.index - b.index).map(match => match.app);
}

export function menuPage(records, query, category, limit = 12) {
  const matches = filterApps(records, query, category);
  const shown = matches.slice(0, Math.max(12, Math.floor(limit) || 12));
  const allCount = category !== "all" && searchText(query) && !matches.length ? filterApps(records, query).length : matches.length;
  return {shown, count:matches.length, remaining:matches.length - shown.length, allCount};
}
