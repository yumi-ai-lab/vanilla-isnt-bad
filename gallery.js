import { fillAppDetails } from "./app-details.js";
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
      const button = element(isShowcase ? "button" : "a", isShowcase ? "catalog-button" : "featured-button");
      if (isShowcase) button.type = "button";
      else button.href = `./apps.html?lang=${language()}#app-${app.id}`;
      button.id = `app-${app.id}-button`;
      button.dataset.appId = app.id;
      if (isShowcase) {
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-controls", "app-dialog");
      }
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
      button.addEventListener("click", () => {
        if (isShowcase) openApp(app, button);
        else rememberShop(button);
      });
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

  function fillDialog(app) {
    fillAppDetails(dialog, app, language(), text);
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

  function rememberShop(link) {
    if (isShowcase) return;
    try { sessionStorage.setItem("vanilla-shop-return", JSON.stringify({y:window.scrollY, width:window.innerWidth, focus:link.id})); } catch {}
  }
  document.querySelectorAll("[data-showcase-link]").forEach(link => link.addEventListener("click", () => rememberShop(link)));

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
