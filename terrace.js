import { localized, tablePage } from "./model.js";
import { fillAppDetails } from "./app-details.js";

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function createTerrace({records, language, text, stableCopy, reduced}) {
  const root = document.querySelector(".terrace");
  const scene = root.querySelector(".terrace-scene");
  const grid = root.querySelector("#app-grid");
  const detail = root.querySelector("#app-detail");
  const menu = root.querySelector("#all-flavors");
  const menuToggle = root.querySelector("#menu-toggle");
  const menuList = root.querySelector("#flavor-menu-list");
  const previous = root.querySelector("#previous-cups");
  const next = root.querySelector("#next-cups");
  const mobile = window.matchMedia("(max-width:680px)");
  let cursor = 0;
  let activeApp = null;
  let tableScroll = 0;
  let menuScroll = 0;
  let inView = true;
  let swipe = null;
  let suppressClickUntil = 0;
  const currentPage = () => tablePage(records.length, cursor, mobile.matches ? 1 : 3);
  const cupButton = id => document.getElementById(`app-${id}-button`);

  function flavor(app) {
    const art = element("span", "flavor-art");
    art.setAttribute("aria-hidden", "true");
    art.style.setProperty("--flavor-x", `${(app.flavor % 3) * 50}%`);
    art.style.setProperty("--flavor-y", `${Math.floor(app.flavor / 3) * 100}%`);
    return art;
  }

  function updateTable() {
    const page = currentPage();
    [...grid.children].forEach((item, index) => {
      item.hidden = index < page.start || index >= page.end;
      const button = item.querySelector("button");
      const selected = activeApp?.id === button.dataset.appId;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-expanded", String(selected));
    });
    root.classList.toggle("has-selection", Boolean(activeApp));
    grid.style.setProperty("--cup-count", page.end - page.start || 1);
    previous.disabled = page.atStart;
    next.disabled = page.atEnd;
    root.querySelector(".terrace-pager").hidden = records.length <= (mobile.matches ? 1 : 3);
    root.querySelector("#cup-position").textContent = `${page.start === page.end ? 0 : page.start + 1}${page.end - page.start > 1 ? `–${page.end}` : ""} / ${records.length}`;
    for (const button of menuList.querySelectorAll("button")) {
      if (button.dataset.menuApp === activeApp?.id) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
  }

  function render() {
    const focusedId = document.activeElement?.id;
    grid.replaceChildren();
    menuList.replaceChildren();
    for (const app of records) {
      const item = element("li");
      const button = element("button", "cup-button");
      button.type = "button";
      button.id = `app-${app.id}-button`;
      button.dataset.appId = app.id;
      button.setAttribute("aria-controls", "app-detail");
      const cup = element("span", "cup-photo");
      cup.append(flavor(app));
      const label = element("span", "cup-label");
      const name = element("span", "app-name");
      stableCopy(name, {en:localized(app.name, "en"), ja:localized(app.name, "ja")});
      const purpose = element("span", "app-purpose");
      stableCopy(purpose, {en:localized(app.tagline, "en"), ja:localized(app.tagline, "ja")});
      label.append(name, purpose);
      button.append(cup, label, element("span", "sr-only", text("app.details")));
      button.addEventListener("click", () => {
        if (performance.now() < suppressClickUntil) return;
        if (activeApp?.id === app.id) closeSelection();
        else choose(app);
      });
      item.append(button);
      grid.append(item);

      const menuItem = element("li");
      const menuButton = element("button", "flavor-menu-item");
      menuButton.type = "button";
      menuButton.id = `menu-app-${app.id}`;
      menuButton.dataset.menuApp = app.id;
      const words = element("span", "flavor-menu-copy");
      words.append(element("span", "app-name", localized(app.name, language())), element("span", "app-purpose", localized(app.tagline, language())));
      const arrow = element("span", "menu-arrow", "↗");
      arrow.setAttribute("aria-hidden", "true");
      menuButton.append(flavor(app), words, arrow);
      menuButton.addEventListener("click", () => choose(app));
      menuItem.append(menuButton);
      menuList.append(menuItem);
    }
    root.querySelector("#app-count").textContent = `${records.length}${language() === "ja" ? "" : " "}${text("showcase.count")}`;
    root.querySelectorAll("[data-preview-note]").forEach(note => { note.hidden = !records.some(app => app.sample); });
    root.querySelector("[data-store-return]").href = `./?lang=${language()}&return=shop#shop`;
    if (activeApp) fillAppDetails(detail, activeApp, language(), text);
    updateTable();
    if (focusedId?.startsWith("app-") || focusedId?.startsWith("menu-app-")) document.getElementById(focusedId)?.focus({preventScroll:true});
  }

  function reveal(node) {
    requestAnimationFrame(() => {
      node.focus({preventScroll:true});
      node.scrollIntoView({block:"start", behavior:reduced() ? "instant" : "smooth"});
    });
  }

  function closeMenu(restore = true) {
    menu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    if (restore) {
      menuToggle.focus({preventScroll:true});
      window.scrollTo({top:menuScroll, behavior:reduced() ? "instant" : "smooth"});
    }
  }

  function showSelection(app, scroll = true) {
    if (!activeApp) tableScroll = menu.hidden ? window.scrollY : menuScroll;
    closeMenu(false);
    cursor = records.indexOf(app);
    activeApp = app;
    fillAppDetails(detail, app, language(), text);
    detail.hidden = false;
    updateTable();
    if (scroll) reveal(detail);
  }

  function choose(app) {
    if (location.hash !== `#app-${app.id}`) {
      const method = activeApp ? "replaceState" : "pushState";
      // A direct app URL has no table entry behind it. Replacing that app
      // must not make the close button navigate away from the terrace.
      const ownsEntry = method === "pushState" || history.state?.vanillaTerrace === true;
      history[method]({...history.state, vanillaTerrace:ownsEntry}, "", `#app-${app.id}`);
    }
    showSelection(app);
  }

  function hideSelection(restore = true) {
    const id = activeApp?.id;
    activeApp = null;
    detail.hidden = true;
    updateTable();
    if (restore && id) {
      cupButton(id)?.focus({preventScroll:true});
      window.scrollTo({top:tableScroll, behavior:reduced() ? "instant" : "smooth"});
    }
  }

  function closeSelection() {
    if (!activeApp) return;
    if (history.state?.vanillaTerrace) history.back();
    else {
      const url = new URL(location.href);
      url.hash = "";
      history.replaceState(history.state, "", url);
      hideSelection();
    }
  }

  function syncLocation() {
    const id = location.hash.startsWith("#app-") ? location.hash.slice(5) : "";
    const app = records.find(record => record.id === id);
    if (app && activeApp?.id !== id) showSelection(app);
    else if (!app && activeApp) hideSelection();
  }

  function step(direction) {
    const page = currentPage();
    if ((direction < 0 && page.atStart) || (direction > 0 && page.atEnd)) return;
    cursor = direction < 0 ? page.previous : page.next;
    if (activeApp) choose(records[cursor]);
    else updateTable();
  }
  previous.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  grid.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch") swipe = {x:event.clientX, y:event.clientY};
  }, {passive:true});
  grid.addEventListener("pointercancel", () => { swipe = null; });
  grid.addEventListener("pointerup", event => {
    if (!swipe) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 48 && Math.abs(dy) < 40) {
      suppressClickUntil = performance.now() + 400;
      step(dx < 0 ? 1 : -1);
    }
  }, {passive:true});
  grid.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    step(event.key === "ArrowLeft" ? -1 : 1);
    grid.querySelector("li:not([hidden]) button")?.focus({preventScroll:true});
  });
  menuToggle.addEventListener("click", () => {
    if (!menu.hidden) { closeMenu(); return; }
    menuScroll = window.scrollY;
    menu.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    reveal(menu);
  });
  root.querySelector("#menu-close").addEventListener("click", () => closeMenu());
  root.querySelector("#close-tasting").addEventListener("click", closeSelection);
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!menu.hidden) { event.preventDefault(); closeMenu(); }
    else if (activeApp) { event.preventDefault(); closeSelection(); }
  });
  mobile.addEventListener("change", () => {
    if (activeApp) cursor = records.indexOf(activeApp);
    else {
      const focused = records.findIndex(app => app.id === document.activeElement?.dataset.appId);
      if (focused >= 0) cursor = focused;
    }
    updateTable();
  });
  window.addEventListener("popstate", syncLocation);
  window.addEventListener("hashchange", syncLocation);

  function updateMotion() {
    root.dataset.ambient = inView && !document.hidden && !reduced() ? "on" : "off";
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      updateMotion();
    }, {threshold:0}).observe(scene);
  }
  updateMotion();
  return {render, syncLocation, restoreShop() {}, updateMotion};
}
