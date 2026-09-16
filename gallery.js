import { localized, featuredApps } from "./model.js";

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function createGallery({records, isShowcase, language, text, stableCopy}) {
  const grid = document.querySelector("#app-grid");
  const dialog = document.querySelector("#app-dialog");
  let activeApp = null;
  let activeTrigger = null;
  let triggerScroll = 0;
  const displayRecords = isShowcase ? records : featuredApps(records);
  const findButton = id => [...grid.querySelectorAll("[data-app-id]")].find(button => button.dataset.appId === id);

  function flavor(app) {
    const art = element("span", "flavor-art");
    art.setAttribute("aria-hidden", "true");
    art.style.setProperty("--flavor-x", `${(app.flavor % 3) * 50}%`);
    art.style.setProperty("--flavor-y", `${Math.floor(app.flavor / 3) * 100}%`);
    return art;
  }

  function render() {
    grid.replaceChildren();
    for (const [index, app] of displayRecords.entries()) {
      const item = element("li");
      const button = element("button", isShowcase ? "catalog-button" : "featured-button");
      button.type = "button";
      button.id = `app-${app.id}-button`;
      button.dataset.appId = app.id;
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-controls", "app-dialog");
      if (isShowcase) {
        const niche = element("span", "catalog-niche");
        niche.append(flavor(app));
        button.append(niche);
      } else {
        const tray = element("span", "tray-hit");
        tray.style.setProperty("--tray-index", index);
        tray.setAttribute("aria-hidden", "true");
        const words = element("span", "tray-words");
        words.append(element("span", "tray-name", localized(app.name, language())), element("span", "tray-purpose", localized(app.tagline, language())));
        tray.append(words);
        button.append(tray);
      }
      const meta = element("span", isShowcase ? "catalog-placard" : "featured-copy");
      if (app.featured) meta.append(element("span", "feature-badge", text(`featured.${app.featured}`)));
      else if (!isShowcase) meta.append(element("span", "feature-badge", "\u00a0"));
      const name = element("span", "app-name");
      stableCopy(name, {en:localized(app.name, "en"), ja:localized(app.name, "ja")});
      const description = element("span", "app-purpose");
      stableCopy(description, {en:localized(app.tagline, "en"), ja:localized(app.tagline, "ja")});
      meta.append(name, description);
      const action = element("span", "card-action", "↗");
      action.setAttribute("aria-hidden", "true");
      meta.append(action);
      button.append(meta, element("span", "sr-only", text("app.details")));
      button.addEventListener("click", () => openApp(app, button));
      item.append(button);
      grid.append(item);
      if (activeApp?.id === app.id && dialog.open) {
        activeTrigger = button;
        button.classList.add("is-selected");
      }
    }
    document.querySelectorAll("[data-preview-note]").forEach(note => { note.hidden = !records.some(app => app.sample); });
    const count = document.querySelector("#app-count");
    if (count) count.textContent = `${records.length}${language() === "ja" ? "" : " "}${text("showcase.count")}`;
    document.querySelectorAll("[data-showcase-link]").forEach(link => { link.href = `./apps.html?lang=${language()}`; });
    document.querySelectorAll("[data-store-return]").forEach(link => { link.href = `./?lang=${language()}&return=shop#shop`; });
    if (activeApp && dialog.open) fillDialog(activeApp);
  }

  function makeDemo(app) {
    const ja = language() === "ja";
    const screen = element("div", `sample-screen sample-${app.id}`);
    screen.setAttribute("aria-label", `${localized(app.name, language())} — ${text("dialog.preview")}`);
    screen.append(element("div", "sample-topline", app.name));
    const specs = {
      focus: {title:ja ? "いまは、ひとつだけ。" : "Just one thing.", metric:"25:00", rows:ja ? ["読む時間", "次は、ひと休み。"] : ["Time to read", "A little break, next."]},
      notes: {title:ja ? "ふと思ったこと" : "A passing thought", metric:"", rows:ja ? ["帰りに、花を買う。", "週末は新しいカフェへ。", "思いつきは、ここに。"] : ["Pick up some flowers.", "A new café this weekend.", "Keep the thought here."]},
      trip: {title:ja ? "週末の、小さな旅" : "A little weekend away", metric:"SAT", rows:ja ? ["10:00　公園を歩く", "12:00　気になるカフェ", "15:00　寄り道の時間"] : ["10:00  A walk in the park", "12:00  That little café", "15:00  Time for a detour"]},
      tasks: {title:ja ? "今日の、ひとつずつ" : "A few things for today", metric:"2 / 3", rows:ja ? ["✓　本を返す", "✓　散歩する", "○　ひと言、連絡する"] : ["✓  Return the book", "✓  Go for a walk", "○  Send a little hello"]},
      budget: {title:ja ? "今月の記録" : "This month", metric:ja ? "¥12,400" : "$124.00", rows:ja ? ["食事　　¥6,800", "移動　　¥2,400", "楽しみ　¥3,200"] : ["Food       $68.00", "Travel     $24.00", "Little joys  $32.00"]},
      journal: {title:ja ? "今日の、一行" : "A line about today", metric:"17", rows:ja ? ["いつもと違う道を歩いた。", "帰り道の空が、きれいだった。"] : ["Took a different way home.", "The evening sky was lovely."]}
    };
    const spec = specs[app.id] || specs.notes;
    screen.append(element("p", "sample-heading", spec.title));
    if (spec.metric) screen.append(element("div", "sample-metric", spec.metric));
    const lines = element("div", "sample-lines");
    spec.rows.forEach(line => lines.append(element("p", "sample-line", line)));
    screen.append(lines, element("div", "sample-foot", "VANILLA ISN’T BAD."));
    return screen;
  }

  function fillDialog(app) {
    document.querySelector("#dialog-title").textContent = localized(app.name, language());
    document.querySelector("#dialog-title").lang = typeof app.name === "string" && /^[\x00-\x7f]+$/.test(app.name) ? "en" : language();
    const icon = document.querySelector("#dialog-icon");
    icon.replaceChildren();
    icon.hidden = !app.icon;
    if (app.icon) {
      const img = element("img");
      img.src = app.icon;
      img.alt = "";
      img.width = 44;
      img.height = 44;
      img.addEventListener("error", () => { if (img.isConnected) icon.hidden = true; }, {once:true});
      icon.append(img);
    }
    document.querySelector("#dialog-tagline").textContent = localized(app.tagline, language());
    document.querySelector("#dialog-description").textContent = localized(app.description, language()) || text("dialog.soon");
    const preview = document.querySelector("#dialog-preview");
    preview.replaceChildren();
    if (app.sample) {
      preview.append(makeDemo(app), element("p", "screen-caption", text("dialog.preview")));
    } else if (app.screenshots.length) {
      for (const shot of app.screenshots) {
        const img = element("img", "app-screenshot");
        img.src = shot.src;
        img.alt = localized(shot.alt, language());
        img.loading = "lazy";
        preview.append(img);
      }
    } else {
      preview.append(flavor(app));
    }
    const features = document.querySelector("#dialog-features");
    features.replaceChildren();
    app.features.forEach(feature => features.append(element("li", "", localized(feature, language()))));
    document.querySelector("#dialog-features-heading").hidden = app.features.length === 0;
    const platforms = document.querySelector("#dialog-platforms");
    platforms.replaceChildren();
    app.platforms.forEach(platform => platforms.append(element("span", "", platform)));
    const status = document.querySelector("#dialog-status");
    status.textContent = app.sample ? text("dialog.sample") : text("dialog.soon");
    status.hidden = !app.sample && Boolean(app.url);
    const link = document.querySelector("#dialog-link");
    link.hidden = app.sample || !app.url;
    if (!link.hidden) link.href = app.url;
    else link.removeAttribute("href");
  }

  function showApp(app, trigger) {
    activeApp = app;
    activeTrigger?.classList.remove("is-selected");
    activeTrigger = trigger || findButton(app.id);
    activeTrigger?.classList.add("is-selected");
    triggerScroll = window.scrollY;
    fillDialog(app);
    if (!dialog.open) dialog.showModal();
  }

  function openApp(app, trigger) {
    if (location.hash !== `#app-${app.id}`) {
      history.pushState({...history.state, vanillaDialog:true, returnHash:location.hash}, "", `#app-${app.id}`);
    }
    showApp(app, trigger);
  }

  function closeApp() {
    if (history.state?.vanillaDialog) history.back();
    else {
      const url = new URL(location.href);
      url.hash = isShowcase ? "" : "shop";
      history.replaceState(history.state, "", url);
      dialog.close();
    }
  }

  function syncLocation() {
    const id = location.hash.startsWith("#app-") ? location.hash.slice(5) : "";
    const app = records.find(record => record.id === id);
    if (app) showApp(app, findButton(id));
    else if (dialog.open) dialog.close();
  }

  document.querySelector(".dialog-close").addEventListener("click", closeApp);
  dialog.addEventListener("cancel", event => { event.preventDefault(); closeApp(); });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeApp();
  });
  dialog.addEventListener("close", () => {
    activeTrigger?.classList.remove("is-selected");
    (activeTrigger?.isConnected ? activeTrigger : grid).focus({preventScroll:true});
    window.scrollTo({top:triggerScroll, behavior:"instant"});
    activeTrigger = null;
    activeApp = null;
  });
  window.addEventListener("popstate", syncLocation);
  window.addEventListener("hashchange", syncLocation);

  document.querySelectorAll("[data-showcase-link]").forEach(link => link.addEventListener("click", () => {
    if (isShowcase) return;
    try { sessionStorage.setItem("vanilla-shop-return", JSON.stringify({y:window.scrollY, width:window.innerWidth, focus:link.id})); } catch {}
  }));

  function restoreShop() {
    if (isShowcase || new URLSearchParams(location.search).get("return") !== "shop") return;
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem("vanilla-shop-return")); } catch {}
    const url = new URL(location.href);
    url.searchParams.delete("return");
    history.replaceState(history.state, "", url);
    if (!saved || !Number.isFinite(saved.y)) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.getElementById(saved.focus);
      if (target && Number.isFinite(saved.width) && Math.abs(saved.width - window.innerWidth) > 30) target.scrollIntoView({block:"center",behavior:"instant"});
      else window.scrollTo({top:Math.max(0, saved.y), behavior:"instant"});
      target?.focus({preventScroll:true});
    }));
  }

  return {render, syncLocation, restoreShop};
}
