import { apps, previewApps } from "./content.js";
import { localized, normalizeApps, resolveLanguage } from "./model.js";
import { availableCategories, menuPage } from "./catalog.js";
import { demoNotes, demoCopy } from "./demo-content.js";

const records = normalizeApps(apps.length ? apps : previewApps).map(app => ({
  ...app,
  features:[...app.features,...(app.sample ? demoNotes[app.id]?.specs || [] : []).map(spec=>spec.label)]
}));
const $ = selector => document.querySelector(selector);
const narrow = matchMedia("(max-width:900px)");
const motionQuery = matchMedia("(prefers-reduced-motion:reduce)");
const readPreference = key => { try { return localStorage.getItem(key); } catch { return null; } };
const savePreference = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
let language = resolveLanguage({query:new URL(location.href).searchParams.get("lang"),saved:readPreference("vanilla-language"),browser:navigator.language});
let query = "";
let category = "all";
let limit = 12;
let selected = records[0];
let detailOpen = false;
let menuScroll = 0;
let menuAnchor = "";
let searchTimer;
let userReduced = readPreference("vanilla-motion") === "off";
const animations = new Set();
const text = key => demoCopy[language][key];
const reduced = () => motionQuery.matches || userReduced;
const node = (tag, className, value) => {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (value !== undefined) item.textContent = value;
  return item;
};

// A small, consistent line-icon set. Only these local paths are rendered.
const paths = {
  timer:["M9 2h6M12 2v3M17 5l2 2M12 9v5l3 2","M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0"],
  pause:["M8 5v14M16 5v14"],
  adjust:["M4 6h5m4 0h7M4 12h10m4 0h2M4 18h2m4 0h10M9 3v6M14 9v6M10 15v6"],
  write:["M14 4l6 6M4 20l5-1L21 7l-6-6L3 13l-1 5z"],
  search:["M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0"],
  export:["M12 15V3m-4 4 4-4 4 4M4 13v7h16v-7"],
  pin:["M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0z","M14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0"],
  calendar:["M4 5h16v16H4zM4 10h16M8 2v6M16 2v6M8 14h3M8 17h7"],
  reorder:["M7 3v18m-3-3 3 3 3-3M14 6h6M14 12h6M14 18h6"],
  list:["M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"],
  check:["m4 12 5 5L20 6"],
  receipt:["M5 3h14v18l-3-2-4 2-4-2-3 2zM9 7h6M9 11h6M9 15h3"],
  chart:["M4 3v17h17M9 16v-5M14 16V7M19 16V4"],
  tag:["M3 3h8l10 10-8 8L3 11z","M8 7h.01"]
};
function icon(id) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox","0 0 24 24");
  svg.setAttribute("aria-hidden","true");
  for (const d of paths[id] || paths.check) {
    const path = document.createElementNS(svg.namespaceURI,"path");
    path.setAttribute("d",d);
    svg.append(path);
  }
  return svg;
}
function flavor(item, app) {
  item.style.setProperty("--flavor-x",`${app.flavor % 3 * 50}%`);
  item.style.setProperty("--flavor-y",`${Math.floor(app.flavor / 3) * 100}%`);
}
function cancelMotion() {
  for (const animation of animations) animation.cancel();
  animations.clear();
}
function fitSelection() {
  if (narrow.matches) return;
  const panel=$("#demo-selection");
  // A tall panel can scroll up until its bottom is visible, then stay beside
  // the menu. This avoids an inaccessible lower half or a second scrollbar.
  panel.style.setProperty("--selection-top",`${Math.min(98,innerHeight-panel.getBoundingClientRect().height-24)}px`);
}
function fade(item) {
  if (reduced() || document.hidden || !item.animate) return;
  const animation = item.animate([{opacity:.55},{opacity:1}],{duration:180,easing:"ease-out"});
  animations.add(animation);
  animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));
}
function updateMotion() {
  if (reduced() || document.hidden) cancelMotion();
  document.documentElement.dataset.reducedMotion = String(reduced());
  $("#demo-motion").textContent = text(reduced() ? "motionOff" : "motionOn");
  $("#demo-motion").setAttribute("aria-pressed",String(!reduced()));
  $("#demo-motion").disabled = motionQuery.matches;
}
function updateCurrent() {
  for (const button of $("#demo-list").querySelectorAll("button")) {
    if ((!narrow.matches || detailOpen) && button.dataset.appId === selected?.id) button.setAttribute("aria-current","true");
    else button.removeAttribute("aria-current");
  }
}
function renderCategories() {
  const group = $("#demo-categories");
  group.replaceChildren();
  for (const choice of [{id:"all",label:text("all")},...availableCategories(records)]) {
    const button = node("button","demo-category",localized(choice.label,language));
    button.type = "button";
    button.dataset.category = choice.id;
    button.setAttribute("aria-pressed",String(choice.id === category));
    button.addEventListener("click",()=>{
      category=choice.id;
      limit=12;
      menuAnchor="";
      renderMenu();
    });
    group.append(button);
  }
}
function renderMenu() {
  const page = menuPage(records,query,category,limit);
  const list = $("#demo-list");
  list.replaceChildren();
  for (const app of page.shown) {
    const li = node("li");
    const button = node("button","demo-menu-item");
    button.type="button";
    button.id=`demo-app-${app.id}`;
    button.dataset.appId=app.id;
    button.setAttribute("aria-controls","demo-selection");
    const art=node("span","demo-flavor");
    art.setAttribute("aria-hidden","true");
    flavor(art,app);
    const words=node("span","demo-menu-copy");
    words.append(node("span","demo-menu-name",localized(app.name,language)),node("span","demo-menu-purpose",localized(app.tagline,language)));
    const arrow=node("span","demo-menu-arrow","›");
    arrow.setAttribute("aria-hidden","true");
    button.append(art,words,arrow);
    button.addEventListener("click",()=>choose(app));
    li.append(button);
    list.append(li);
  }
  $("#demo-results").textContent=language === "ja" ? `${page.count}件${page.remaining ? ` · ${page.shown.length}件を表示` : ""}` : `${page.count} ${page.count===1 ? "app" : "apps"}${page.remaining ? ` · ${page.shown.length} shown` : ""}`;
  $("#demo-more").hidden=!page.remaining;
  $("#demo-empty").hidden=page.count>0;
  $("#demo-reset").hidden=!query && category==="all";
  $("#demo-clear").hidden=!query;
  for (const button of $("#demo-categories").children) button.setAttribute("aria-pressed",String(button.dataset.category===category));
  updateCurrent();
}
function renderSelection() {
  if (!selected) { $("#demo-selection").hidden=true; return; }
  const notes=selected.sample ? demoNotes[selected.id] : null;
  const specs=notes?.specs || selected.features.slice(0,3).map(label=>({icon:"check",label}));
  flavor($("#demo-cup"),selected);
  $("#demo-app-name").textContent=localized(selected.name,language);
  $("#demo-purpose").textContent=localized(selected.tagline,language);
  $(".demo-sample-label").hidden=!selected.sample;
  const launch=$("#demo-open");
  const canOpen=Boolean(selected.url && !selected.sample);
  launch.hidden=!canOpen;
  if (canOpen) launch.href=selected.url;
  else launch.removeAttribute("href");
  $("#demo-unavailable").hidden=canOpen;
  $("#demo-launch-status").hidden=canOpen;
  $("#demo-launch-status").textContent=text(selected.sample ? "unavailable" : "soon");
  const list=$("#demo-specs");
  list.replaceChildren();
  list.hidden=!specs.length;
  for (const spec of specs) {
    const li=node("li","demo-spec");
    li.append(icon(spec.icon),node("span","",localized(spec.label,language)));
    list.append(li);
  }
  $("#demo-craft").hidden=!notes?.lead;
  $("#demo-craft-lead").textContent=localized(notes?.lead,language);
  $("#demo-craft-more").open=false;
  $("#demo-craft-more").hidden=!notes?.points?.length;
  $("#demo-craft-points").replaceChildren(...(notes?.points || []).slice(0,2).map(point=>node("li","",localized(point,language))));
}
function renderView() {
  document.body.dataset.view=detailOpen ? "detail" : "menu";
  updateCurrent();
}
function choose(app) {
  cancelMotion();
  menuScroll=window.scrollY;
  menuAnchor=`demo-app-${app.id}`;
  const wasOpen=detailOpen;
  selected=app;
  detailOpen=true;
  const url=new URL(location.href);
  url.hash=`app-${app.id}`;
  const ownsEntry=!wasOpen || history.state?.vanillaMenuDemo===true;
  history[wasOpen ? "replaceState" : "pushState"]({...history.state,vanillaMenuDemo:ownsEntry},"",url);
  renderSelection();
  renderView();
  if (narrow.matches) {
    window.scrollTo({top:0,behavior:"instant"});
    $("#demo-app-name").focus({preventScroll:true});
  } else {
    const bounds=$("#demo-selection").getBoundingClientRect();
    if (bounds.bottom<100 || bounds.top>innerHeight-100) $("#demo-selection").scrollIntoView({block:"start",behavior:"instant"});
  }
  fade($("#demo-cup .demo-flavor"));
  fade($(".demo-app-copy"));
  $("#demo-announcement").textContent=language==="ja" ? `${localized(app.name,language)}の説明を表示しました。` : `Showing ${localized(app.name,language)}.`;
}
function restoreMenu() {
  cancelMotion();
  detailOpen=false;
  renderView();
  const target=document.getElementById(menuAnchor) || $("#demo-search");
  target.focus({preventScroll:true});
  window.scrollTo({top:menuScroll,behavior:"instant"});
}
function backToMenu() {
  if (!detailOpen) { restoreMenu(); return; }
  if (history.state?.vanillaMenuDemo) history.back();
  else {
    const url=new URL(location.href);
    url.hash="";
    history.replaceState(history.state,"",url);
    restoreMenu();
  }
}
function syncLocation() {
  const id=location.hash.startsWith("#app-") ? location.hash.slice(5) : "";
  const app=records.find(item=>item.id===id);
  if (app) {
    if (detailOpen && selected?.id===id) return;
    cancelMotion();
    selected=app;
    detailOpen=true;
    renderSelection();
    renderView();
    if (narrow.matches) { window.scrollTo({top:0,behavior:"instant"}); $("#demo-app-name").focus({preventScroll:true}); }
  } else if (detailOpen) restoreMenu();
}
function renderLanguage() {
  const focused=document.activeElement?.id;
  document.documentElement.lang=language;
  for (const item of document.querySelectorAll("[data-copy]")) item.textContent=text(item.dataset.copy);
  for (const button of document.querySelectorAll("[data-language]")) button.setAttribute("aria-pressed",String(button.dataset.language===language));
  $("#demo-search").placeholder=text("placeholder");
  $("#demo-clear").setAttribute("aria-label",text("clear"));
  $("#demo-categories").setAttribute("aria-label",text("categories"));
  $("#demo-specs").setAttribute("aria-label",text("specs"));
  $("#demo-shop-return").href=`./?lang=${language}&return=shop#shop`;
  $(".demo-brand").href=`./?lang=${language}`;
  $(".demo-disclaimer").hidden=!records.some(app=>app.sample);
  renderCategories();
  renderMenu();
  renderSelection();
  renderView();
  updateMotion();
  if (focused?.startsWith("demo-app-")) document.getElementById(focused)?.focus({preventScroll:true});
}

function updateSearch() {
  clearTimeout(searchTimer);
  query=$("#demo-search").value;
  limit=12;
  menuAnchor="";
  renderMenu();
}
$("#demo-search").addEventListener("input",event=>{
  clearTimeout(searchTimer);
  if (!event.isComposing) searchTimer=setTimeout(updateSearch,100);
});
$("#demo-search").addEventListener("compositionend",updateSearch);
$("#demo-search-form").addEventListener("submit",event=>{ event.preventDefault(); updateSearch(); });
$("#demo-clear").addEventListener("click",()=>{ $("#demo-search").value=""; updateSearch(); $("#demo-search").focus({preventScroll:true}); });
$("#demo-reset").addEventListener("click",()=>{ category="all"; $("#demo-search").value=""; updateSearch(); $("#demo-search").focus({preventScroll:true}); });
$("#demo-more").addEventListener("click",()=>{
  const count=$("#demo-list").children.length;
  limit+=12;
  renderMenu();
  const firstAdded=$("#demo-list").children[count]?.querySelector("button");
  firstAdded?.focus({preventScroll:true});
  firstAdded?.scrollIntoView({block:"nearest",behavior:"instant"});
});
$("#demo-menu-back").addEventListener("click",backToMenu);
$("#demo-browse").addEventListener("click",backToMenu);
for (const button of document.querySelectorAll("[data-language]")) button.addEventListener("click",()=>{
  cancelMotion();
  language=button.dataset.language;
  savePreference("vanilla-language",language);
  const url=new URL(location.href);
  url.searchParams.set("lang",language);
  history.replaceState(history.state,"",url);
  renderLanguage();
});
$("#demo-motion").addEventListener("click",()=>{
  userReduced=!userReduced;
  savePreference("vanilla-motion",userReduced ? "off" : "on");
  updateMotion();
});
motionQuery.addEventListener("change",updateMotion);
document.addEventListener("visibilitychange",updateMotion);
document.addEventListener("keydown",event=>{ if (event.key==="Escape" && detailOpen && event.target!==$("#demo-search")) { event.preventDefault(); backToMenu(); } });
narrow.addEventListener("change",()=>{
  cancelMotion();
  renderView();
  if (narrow.matches && detailOpen) window.scrollTo({top:0,behavior:"instant"});
});
if ("ResizeObserver" in window) new ResizeObserver(fitSelection).observe($("#demo-selection"));
window.addEventListener("resize",fitSelection);
window.addEventListener("popstate",syncLocation);
window.addEventListener("hashchange",syncLocation);
renderLanguage();
syncLocation();
fitSelection();
