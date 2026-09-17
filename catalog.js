import { localized } from "./model.js";

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

export function filterApps(records, query = "", category = "all") {
  const terms = searchText(query).split(" ").filter(Boolean);
  return records.filter(app => {
    if (!inCategory(app, category)) return false;
    const words = [app.name, app.tagline, app.description, ...app.features];
    const haystack = searchText(words.flatMap(word => [localized(word, "ja"),localized(word, "en")]).join(" "));
    return terms.every(term => haystack.includes(term));
  });
}

export function menuPage(records, query, category, limit = 12) {
  const matches = filterApps(records, query, category);
  const shown = matches.slice(0, Math.max(12, Math.floor(limit) || 12));
  return {shown, count:matches.length, remaining:matches.length - shown.length};
}
