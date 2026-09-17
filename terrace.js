import { localized, tablePage } from "./model.js";
import { fillAppDetails } from "./app-details.js";
import { availableCategories, menuPage } from "./catalog.js";

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
  const search = root.querySelector("#app-search");
  const categoryGroup = root.querySelector("#menu-categories");
  const more = root.querySelector("#menu-more");
  const detailJump = root.querySelector("#see-details");
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
  let query = "";
  let category = "all";
  let limit = 12;
  let menuOffset = -24;
  let menuAnchor = "";
  let searchTimer;
  let transitionId = 0;
  let transitionFrame = 0;
  const animations = new Set();
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
      const button = item.querySelector("button");
      const selected = activeApp?.id === button.dataset.appId;
      item.hidden = activeApp ? !selected : index < page.start || index >= page.end;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-expanded", String(selected));
    });
    root.classList.toggle("has-selection", Boolean(activeApp));
    grid.style.setProperty("--cup-count", activeApp ? 1 : page.end - page.start || 1);
    previous.disabled = page.atStart;
    next.disabled = page.atEnd;
    root.querySelector(".terrace-pager").hidden = Boolean(activeApp) || records.length <= (mobile.matches ? 1 : 3);
    detailJump.hidden = !activeApp;
    root.querySelector("#cup-position").textContent = `${page.start === page.end ? 0 : page.start + 1}${page.end - page.start > 1 ? `–${page.end}` : ""} / ${records.length}`;
    for (const button of menuList.querySelectorAll("button")) {
      if (button.dataset.menuApp === activeApp?.id) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
  }

  function render() {
    cancelTransition();
    const focusedId = document.activeElement?.id;
    grid.replaceChildren();
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

    }
    search.placeholder = text("menu.placeholder");
    renderCategories();
    renderMenu();
    root.querySelector("#app-count").textContent = language() === "ja" ? `全${records.length}件` : `${records.length} ${records.length === 1 ? "app" : "apps"}`;
    root.querySelectorAll("[data-preview-note]").forEach(note => { note.hidden = !records.some(app => app.sample); });
    root.querySelector("[data-store-return]").href = `./?lang=${language()}&return=shop#shop`;
    if (activeApp) fillAppDetails(detail, activeApp, language(), text);
    updateTable();
    if (focusedId?.startsWith("app-") || focusedId?.startsWith("menu-app-") || focusedId?.startsWith("category-")) document.getElementById(focusedId)?.focus({preventScroll:true});
  }

  function renderCategories() {
    categoryGroup.replaceChildren();
    const choices = [{id:"all",label:text("menu.all")}, ...availableCategories(records)];
    for (const choice of choices) {
      const button = element("button", "category-choice", localized(choice.label, language()));
      button.type = "button";
      button.id = `category-${choice.id}`;
      button.dataset.category = choice.id;
      button.setAttribute("aria-pressed", String(category === choice.id));
      button.addEventListener("click", () => {
        category = choice.id;
        limit = 12;
        menuOffset = -24;
        menuAnchor = "";
        renderMenu();
      });
      categoryGroup.append(button);
    }
  }

  function renderMenu() {
    const page = menuPage(records, query, category, limit);
    menuList.replaceChildren();
    for (const app of page.shown) {
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
      menuButton.addEventListener("click", () => {
        menuAnchor = menuButton.id;
        choose(app);
      });
      if (app.id === activeApp?.id) menuButton.setAttribute("aria-current", "true");
      menuItem.append(menuButton);
      menuList.append(menuItem);
    }
    root.querySelector("#menu-results").textContent = language() === "ja"
      ? `${page.count}件${page.remaining ? `・${page.shown.length}件を表示` : ""}`
      : `${page.count} ${page.count === 1 ? "app" : "apps"}${page.remaining ? ` · ${page.shown.length} shown` : ""}`;
    root.querySelector("#menu-empty").hidden = page.count > 0;
    root.querySelector("#search-clear").hidden = !query;
    root.querySelector("#menu-reset").hidden = !query && category === "all";
    more.hidden = page.remaining === 0;
    for (const button of categoryGroup.children) button.setAttribute("aria-pressed", String(button.dataset.category === category));
    return page;
  }

  function cancelTransition() {
    transitionId++;
    cancelAnimationFrame(transitionFrame);
    for (const animation of animations) animation.cancel();
    animations.clear();
    grid.querySelectorAll(".is-arriving").forEach(button => button.classList.remove("is-arriving"));
  }

  function animate(node, keyframes, options = {}) {
    if (reduced() || !node?.animate) return;
    const animation = node.animate(keyframes, {duration:380,easing:"cubic-bezier(.22,.61,.36,1)",...options});
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    return animation;
  }

  // Start the short physical response after the visitor reaches it, not while
  // the menu and table are still travelling outside the viewport.
  function afterScroll(callback) {
    const id = transitionId;
    const start = performance.now();
    let last = window.scrollY;
    let settled = 0;
    const frame = () => {
      if (id !== transitionId || reduced() || document.hidden) return;
      const y = window.scrollY;
      settled = Math.abs(last - y) < 1 ? settled + 1 : 0;
      last = y;
      if ((performance.now() - start > 120 && settled >= 3) || performance.now() - start > 900) callback();
      else transitionFrame = requestAnimationFrame(frame);
    };
    transitionFrame = requestAnimationFrame(frame);
  }

  function deliverCup(app) {
    const button = cupButton(app.id);
    button.focus({preventScroll:true});
    const top = window.scrollY + button.querySelector(".cup-photo").getBoundingClientRect().top - 24;
    window.scrollTo({top:Math.max(0,top), behavior:reduced() ? "instant" : "smooth"});
    afterScroll(() => {
      button.classList.add("is-arriving");
      const arrival = animate(button.querySelector(".flavor-art"), [
        {opacity:.65, transform:"translate(16px,-12px) rotate(.6deg)"},
        {opacity:1, transform:"translate(0,0) rotate(0)"}
      ]);
      animate(detail, [{opacity:.55,transform:"translateY(9px)"},{opacity:1,transform:"none"}], {duration:320,delay:140});
      arrival?.finished.catch(() => {}).finally(() => button.classList.remove("is-arriving"));
    });
  }

  function reveal(node) {
    requestAnimationFrame(() => {
      node.focus({preventScroll:true});
      node.scrollIntoView({block:"start", behavior:reduced() ? "instant" : "smooth"});
    });
  }

  function closeMenu(restore = true) {
    if (!menu.hidden) menuOffset = -menu.getBoundingClientRect().top;
    menu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    if (restore) {
      menuToggle.focus({preventScroll:true});
      window.scrollTo({top:menuScroll, behavior:reduced() ? "instant" : "smooth"});
    }
  }

  function openMenu() {
    cancelTransition();
    menuScroll = window.scrollY;
    menu.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    const target = document.getElementById(menuAnchor) || menu;
    target.focus({preventScroll:true});
    const top = window.scrollY + menu.getBoundingClientRect().top + menuOffset;
    window.scrollTo({top:Math.max(0,top),behavior:reduced() ? "instant" : "smooth"});
    afterScroll(() => animate(menu, [{opacity:.6,transform:"translateY(12px) rotate(-.25deg)"},{opacity:1,transform:"none"}], {duration:280}));
  }

  function showSelection(app, delivery = false) {
    cancelTransition();
    if (!activeApp) tableScroll = menu.hidden ? window.scrollY : menuScroll;
    closeMenu(false);
    cursor = records.indexOf(app);
    activeApp = app;
    fillAppDetails(detail, app, language(), text);
    detail.hidden = false;
    updateTable();
    if (delivery) deliverCup(app);
    else reveal(detail);
  }

  function choose(app) {
    if (location.hash !== `#app-${app.id}`) {
      const method = activeApp ? "replaceState" : "pushState";
      // A direct app URL has no table entry behind it. Replacing that app
      // must not make the close button navigate away from the terrace.
      const ownsEntry = method === "pushState" || history.state?.vanillaTerrace === true;
      history[method]({...history.state, vanillaTerrace:ownsEntry}, "", `#app-${app.id}`);
    }
    showSelection(app, true);
  }

  function hideSelection(restore = true) {
    cancelTransition();
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
    if (!menu.hidden) closeMenu(false);
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
    if (activeApp) return;
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    step(event.key === "ArrowLeft" ? -1 : 1);
    grid.querySelector("li:not([hidden]) button")?.focus({preventScroll:true});
  });
  menuToggle.addEventListener("click", () => {
    if (!menu.hidden) { cancelTransition(); closeMenu(); return; }
    openMenu();
  });
  root.querySelector("#menu-close").addEventListener("click", () => { cancelTransition(); closeMenu(); });
  root.querySelector("#browse-flavors").addEventListener("click", openMenu);
  detailJump.addEventListener("click", () => { cancelTransition(); reveal(detail); });
  const updateSearch = () => {
    clearTimeout(searchTimer);
    query = search.value;
    limit = 12;
    menuOffset = -24;
    menuAnchor = "";
    renderMenu();
  };
  search.addEventListener("input", event => {
    clearTimeout(searchTimer);
    if (!event.isComposing) searchTimer = setTimeout(updateSearch,160);
  });
  search.addEventListener("compositionend", updateSearch);
  root.querySelector(".menu-search").addEventListener("submit", event => { event.preventDefault(); updateSearch(); });
  root.querySelector("#search-clear").addEventListener("click", () => { search.value = ""; updateSearch(); search.focus({preventScroll:true}); });
  root.querySelector("#menu-reset").addEventListener("click", () => { category = "all"; search.value = ""; updateSearch(); search.focus({preventScroll:true}); });
  more.addEventListener("click", () => {
    const oldCount = menuList.children.length;
    limit += 12;
    renderMenu();
    const added = menuList.children[oldCount]?.querySelector("button");
    added?.focus({preventScroll:true});
    added?.scrollIntoView({block:"nearest",behavior:reduced() ? "instant" : "smooth"});
  });
  root.querySelector("#close-tasting").addEventListener("click", closeSelection);
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!menu.hidden) { event.preventDefault(); cancelTransition(); closeMenu(); }
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
    if (reduced() || document.hidden) cancelTransition();
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
