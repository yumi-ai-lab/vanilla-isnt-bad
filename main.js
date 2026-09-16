import { apps, copy } from "./content.js";
import { localized, normalizeApps, resolveLanguage, shelfState } from "./model.js";

const readPreference = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
let language = resolveLanguage({
  query: new URLSearchParams(location.search).get("lang"),
  saved: readPreference("vanilla-language"),
  browser: navigator.language
});
const records = normalizeApps(apps);
const grid = document.querySelector("#app-grid");
const dialog = document.querySelector("#app-dialog");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let userReduced = readPreference("vanilla-motion") === "off";
let activeApp = null;
let activeTrigger = null;
let signHasPlayed = false;
let shelfInView = !("IntersectionObserver" in window);
let fontsReady = false;
let artworkReady = false;
let visualFrame = 0;
let lastScrollAt = -Infinity;
let scrollSettleTimer;
let lastReduced = null;
const entrances = [];
const copyAnimations = new Set();
const sceneAnimations = new Map();
const text = (key) => copy[language][key] ?? copy.en[key] ?? key;
const reduced = () => motionQuery.matches || userReduced;

function stableCopy(element, values, animate = false) {
  let stack = element.querySelector(".copy-stack");
  if (!stack) {
    stack = document.createElement("span");
    stack.className = "copy-stack";
    for (const locale of ["en", "ja"]) {
      const variant = document.createElement("span");
      variant.className = "copy-variant";
      variant.lang = locale;
      variant.textContent = values[locale];
      stack.append(variant);
    }
    element.replaceChildren(stack);
  }
  for (const variant of stack.children) {
    const current = variant.lang === language;
    variant.classList.toggle("is-current", current);
    variant.setAttribute("aria-hidden", String(!current));
    if (current && animate && !reduced() && variant.animate) {
      const style = getComputedStyle(document.documentElement);
      const animation = variant.animate([{ opacity: .65 }, { opacity: 1 }], {
        duration: parseFloat(style.getPropertyValue("--motion-press")),
        easing: style.getPropertyValue("--ease").trim()
      });
      copyAnimations.add(animation);
      animation.finished.catch(() => {}).finally(() => copyAnimations.delete(animation));
    }
  }
}

function stopCopyAnimations() {
  for (const animation of copyAnimations) animation.cancel();
  copyAnimations.clear();
}

function playScene(element, keyframes, options = {}) {
  if (reduced() || !element?.animate) return;
  const { group, ...timing } = options;
  const animation = element.animate(keyframes, {
    duration: 1000,
    easing: "cubic-bezier(.22,.61,.36,1)",
    fill: "backwards",
    ...timing
  });
  sceneAnimations.set(animation, group);
  animation.finished.catch(() => {}).finally(() => sceneAnimations.delete(animation));
}

function stopScenes(group) {
  for (const [animation, owner] of sceneAnimations) {
    if (group && owner !== group) continue;
    animation.cancel();
    sceneAnimations.delete(animation);
  }
}

function revealHero() {
  stopScenes("hero");
  const parts = [
    ["#hero-title", 52, 7, 1120, 0],
    [".hero-subtitle", 38, 4, 1040, 100],
    [".hero-description", 32, 3, 960, 220],
    [".hero-link", 18, 2, 800, 300]
  ];
  for (const [selector, distance, blur, duration, delay] of parts) {
    playScene(document.querySelector(selector), [
      { opacity: 0, transform: `translateY(${distance}px)`, filter: `blur(${blur}px)` },
      { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
    ], { duration, delay: delay + 160, group: "hero" });
  }
}

function resetWindow() {
  stopScenes("window");
  document.querySelector(".serving-window").dataset.state = reduced() ? "open" : "closed";
  document.querySelector(".kiosk-wrap").classList.toggle("is-open", reduced());
}

function openShop() {
  stopScenes("window");
  document.querySelector(".serving-window").dataset.state = "open";
  document.querySelector(".kiosk-wrap").classList.add("is-open");
  for (const [selector, direction] of [[".window-glass-left", -1], [".window-glass-right", 1]]) {
    playScene(document.querySelector(selector), [
      { transform: "translateX(0)" },
      { transform: `translateX(${direction * 98}%)` }
    ], { duration: 1600, delay: 240, easing: "cubic-bezier(.3,.05,.2,1)", group: "window" });
  }
}

function revealAbout() {
  for (const [selector, delay] of [["#about-title", 0], [".about-copy", 120]]) {
    playScene(document.querySelector(selector), [
      { opacity: .08, transform: "translateX(calc(-1 * var(--copy-travel)))", filter: "blur(3px)" },
      { opacity: 1, transform: "translateX(0)", filter: "blur(0)" }
    ], { duration: 900, delay, group: "about" });
  }
}

function checkEntrances() {
  const height = window.innerHeight;
  for (const entrance of entrances) {
    const box = entrance.element.getBoundingClientRect();
    const visible = Math.max(0, Math.min(box.bottom, height) - Math.max(box.top, 0));
    const ratio = visible / Math.max(1, Math.min(box.height, height));
    // A few pixels left at the viewport edge should not prevent replay when
    // the visitor returns to the sky, then scrolls back down to the window.
    const outside = ratio < .03;
    if (document.hidden || outside) {
      if (entrance.repeat && !entrance.armed) {
        stopScenes(entrance.name);
        entrance.armed = true;
        entrance.reset?.();
      }
      continue;
    }
    if (reduced() || !entrance.armed || !entrance.ready()) continue;
    // Let the eye arrive before playing; smooth anchor scrolling must not
    // spend the entrance while the destination is still moving past.
    if (performance.now() - lastScrollAt < 120) continue;
    if (ratio < entrance.threshold) continue;
    entrance.armed = false;
    entrance.playCount = (entrance.playCount ?? 0) + 1;
    entrance.element.dataset.entranceCount = String(entrance.playCount);
    entrance.reveal();
  }
}

function updateSky() {
  if (reduced()) {
    document.body.style.removeProperty("background-color");
    document.documentElement.style.setProperty("--sky-mix", "0");
    return;
  }
  const progress = Math.max(0, Math.min(1, window.scrollY / Math.max(1, window.innerHeight * .6)));
  const sky = [231, 237, 240];
  const cream = [247, 243, 237];
  const color = sky.map((value, index) => Math.round(value + (cream[index] - value) * progress));
  document.body.style.backgroundColor = `rgb(${color.join(", ")})`;
  document.documentElement.style.setProperty("--sky-mix", String(progress));
}

function scheduleVisuals() {
  if (visualFrame) return;
  visualFrame = requestAnimationFrame(() => {
    visualFrame = 0;
    updateSky();
    checkEntrances();
  });
}

function boundedReady(promise, milliseconds) {
  let timer;
  return Promise.race([
    promise.catch(() => {}),
    new Promise(resolve => { timer = setTimeout(resolve, milliseconds); })
  ]).finally(() => clearTimeout(timer));
}

function prepareEntrances() {
  entrances.push(
    { name: "hero", element: document.querySelector(".hero-copy"), reveal: revealHero, threshold: .6, repeat: true, armed: true, ready: () => fontsReady },
    { name: "window", element: document.querySelector(".serving-window"), reveal: openShop, reset: resetWindow, threshold: .65, repeat: true, armed: true, ready: () => artworkReady },
    { name: "about", element: document.querySelector(".about-section"), reveal: revealAbout, threshold: .25, repeat: false, armed: true, ready: () => fontsReady }
  );
  boundedReady(document.fonts?.ready ?? Promise.resolve(), 1500).then(() => {
    fontsReady = true;
    scheduleVisuals();
  });
  const art = new Image();
  art.src = document.querySelector(".kiosk-art image").getAttribute("href");
  boundedReady(art.decode(), 4000).then(() => {
    artworkReady = true;
    scheduleVisuals();
  });
}

function updateAir() {
  grid.dataset.airActive = String(shelfInView && !document.hidden && !reduced());
}

function readShelf() {
  return shelfState(grid.children.length, grid.firstElementChild?.getBoundingClientRect().width ?? 0, grid.clientWidth || 0, grid.scrollLeft || 0);
}

function updateShelf() {
  const state = readShelf();
  document.querySelector(".shelf-controls").hidden = state.max <= 1;
  document.querySelector("#shelf-prev").disabled = state.atStart;
  document.querySelector("#shelf-next").disabled = state.atEnd;
  const position = state.first === state.last ? `${state.first}` : `${state.first}–${state.last}`;
  const label = `${position} / ${grid.children.length}`;
  const output = document.querySelector("#shelf-position");
  if (output.textContent !== label) output.textContent = label;
}

function moveShelf(destination) {
  grid.scrollTo({ left: destination, behavior: reduced() ? "instant" : "smooth" });
}

function setupShelf() {
  let scrollFrame = 0;
  const schedule = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateShelf(); });
  };
  grid.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(grid);
  document.querySelector("#shelf-prev").addEventListener("click", () => moveShelf(readShelf().previous));
  document.querySelector("#shelf-next").addEventListener("click", () => moveShelf(readShelf().next));
  grid.addEventListener("keydown", event => {
    if (event.target !== grid || event.altKey || event.ctrlKey || event.metaKey) return;
    const state = readShelf();
    const destinations = { ArrowLeft: state.previous, ArrowRight: state.next, Home: 0, End: state.max };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    moveShelf(destinations[event.key]);
  });
  // Touch uses native horizontal scrolling. Mouse users can drag the same
  // glass surface; a drag must never activate the app underneath on release.
  let drag = null;
  let suppressClickUntil = 0;
  grid.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, left: grid.scrollLeft, moved: false };
  });
  grid.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (event.buttons === 0) { finishDrag(event); return; }
    const distance = event.clientX - drag.x;
    if (!drag.moved && Math.abs(distance) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      grid.classList.add("is-dragging");
      grid.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    grid.scrollLeft = drag.left - distance;
  });
  const finishDrag = event => {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    grid.classList.remove("is-dragging");
    if (grid.hasPointerCapture(event.pointerId)) grid.releasePointerCapture(event.pointerId);
    if (moved) {
      suppressClickUntil = performance.now() + 350;
      moveShelf(readShelf().nearest);
    }
  };
  grid.addEventListener("pointerup", finishDrag);
  grid.addEventListener("pointercancel", finishDrag);
  grid.addEventListener("lostpointercapture", finishDrag);
  grid.addEventListener("click", event => {
    if (performance.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  schedule();
}

function makeIcon(app) {
  const shell = document.createElement("span");
  shell.className = "app-icon";
  shell.setAttribute("aria-hidden", "true");
  shell.textContent = localized(app.name, language).slice(0, 1).toUpperCase();
  if (app.icon) {
    const image = document.createElement("img");
    image.src = app.icon;
    image.alt = "";
    image.loading = "lazy";
    image.width = 160;
    image.height = 160;
    image.addEventListener("error", () => image.remove(), { once: true });
    shell.append(image);
  }
  return shell;
}

function renderGallery() {
  if (records.length === 0) return;
  const previousScroll = grid.scrollLeft;
  grid.replaceChildren();
  grid.removeAttribute("data-preview");
  grid.removeAttribute("aria-hidden");
  grid.setAttribute("aria-describedby", "shelf-help");
  document.querySelector("#empty-note").hidden = true;
  for (const app of records) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "app-button";
    button.dataset.appId = app.id;
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "app-dialog");
    const frame = document.createElement("div");
    frame.className = "case-frame";
    frame.setAttribute("aria-hidden", "true");
    const pane = document.createElement("div");
    pane.className = "glass-pane";
    frame.append(pane);
    const meta = document.createElement("div");
    meta.className = "case-placard";
    const name = document.createElement("h3");
    stableCopy(name, { en: localized(app.name, "en"), ja: localized(app.name, "ja") });
    const description = document.createElement("p");
    stableCopy(description, { en: localized(app.tagline, "en"), ja: localized(app.tagline, "ja") });
    const detail = document.createElement("span");
    detail.className = "app-detail-label";
    detail.textContent = "↗";
    detail.setAttribute("aria-hidden", "true");
    const action = document.createElement("span");
    action.className = "sr-only";
    action.textContent = text("app.details");
    meta.append(name, description);
    button.append(frame, meta, detail, action);
    button.addEventListener("click", () => openApp(app, button));
    item.append(button);
    grid.append(item);
    if (dialog.open && activeApp?.id === app.id) {
      activeTrigger = button;
      button.classList.add("is-selected");
    }
  }
  grid.scrollLeft = previousScroll;
}

function fillDialog(app) {
  document.querySelector("#dialog-title").textContent = localized(app.name, language);
  document.querySelector("#dialog-tagline").textContent = localized(app.tagline, language);
  document.querySelector("#dialog-description").textContent = localized(app.description, language) || text("dialog.soon");
  document.querySelector("#dialog-icon").replaceChildren(makeIcon(app));
  const platforms = document.querySelector("#dialog-platforms");
  platforms.replaceChildren();
  for (const platform of app.platforms) {
    const badge = document.createElement("span");
    badge.textContent = platform;
    platforms.append(badge);
  }
  const link = document.querySelector("#dialog-link");
  link.hidden = !app.url;
  if (app.url) link.href = app.url;
  else link.removeAttribute("href");
}

function openApp(app, trigger) {
  activeApp = app;
  activeTrigger?.classList.remove("is-selected");
  activeTrigger = trigger;
  activeTrigger.classList.add("is-selected");
  const source = trigger.getBoundingClientRect();
  fillDialog(app);
  if (!dialog.open) dialog.showModal();
  const target = dialog.getBoundingClientRect();
  const origin = (center, start, size) => Math.max(0, Math.min(100, (center - start) / Math.max(size, 1) * 100));
  const x = origin(source.left + source.width / 2, target.left, target.width);
  const y = origin(source.top + source.height / 2, target.top, target.height);
  dialog.style.setProperty("--detail-origin", `${x}% ${y}%`);
}

function translate(animate = false) {
  stopCopyAnimations();
  document.documentElement.lang = language;
  document.title = text("page.title");
  document.querySelector('meta[name="description"]').content = text("page.description");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (element.hasAttribute("data-copy-stable")) {
      stableCopy(element, { en: copy.en[key] ?? key, ja: copy.ja[key] ?? copy.en[key] ?? key }, animate);
    } else {
      element.textContent = text(key);
    }
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", text(element.dataset.i18nAria));
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
  renderGallery();
  updateShelf();
  if (activeApp && dialog.open) fillDialog(activeApp);
  updateMotion();
}

function updateMotion() {
  const isReduced = reduced();
  document.documentElement.dataset.reducedMotion = String(isReduced);
  const toggle = document.querySelector("#motion-toggle");
  toggle.setAttribute("aria-pressed", String(!isReduced));
  toggle.disabled = motionQuery.matches;
  toggle.title = motionQuery.matches ? (language === "ja" ? "端末の「動きを減らす」設定を使用しています" : "Following your device's reduced-motion setting") : "";
  document.querySelector("#motion-state").textContent = text(isReduced ? "motion.off" : "motion.on");
  if (isReduced) {
    document.querySelector(".hanging-sign").classList.remove("sign-enter");
    stopCopyAnimations();
    stopScenes();
  }
  if (lastReduced !== isReduced) {
    resetWindow();
    for (const entrance of entrances) {
      if (entrance.repeat) entrance.armed = true;
    }
  }
  lastReduced = isReduced;
  updateAir();
  scheduleVisuals();
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    if (language === button.dataset.language) return;
    language = button.dataset.language;
    savePreference("vanilla-language", language);
    const url = new URL(location.href);
    url.searchParams.set("lang", language);
    history.replaceState(history.state, "", url);
    translate(true);
  });
});

document.querySelector("#motion-toggle").addEventListener("click", () => {
  userReduced = !userReduced;
  savePreference("vanilla-motion", userReduced ? "off" : "on");
  updateMotion();
});
motionQuery.addEventListener("change", updateMotion);
document.addEventListener("visibilitychange", () => {
  updateAir();
  // A hidden tab may suspend animation frames; re-arm immediately on hiding.
  if (document.hidden) checkEntrances();
  scheduleVisuals();
});
window.addEventListener("scroll", () => {
  lastScrollAt = performance.now();
  scheduleVisuals();
  clearTimeout(scrollSettleTimer);
  scrollSettleTimer = setTimeout(scheduleVisuals, 140);
}, { passive: true });
window.addEventListener("resize", scheduleVisuals);
window.addEventListener("pageshow", scheduleVisuals);

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener("close", () => {
  activeTrigger?.classList.remove("is-selected");
  const returnTarget = activeTrigger?.isConnected ? activeTrigger : document.querySelector("#apps");
  returnTarget.focus({ preventScroll: true });
  activeTrigger = null;
  activeApp = null;
  dialog.style.removeProperty("--detail-origin");
});

document.querySelector("#year").textContent = String(new Date().getFullYear());
translate();
prepareEntrances();
setupShelf();

if ("IntersectionObserver" in window) {
  const shelfObserver = new IntersectionObserver((entries) => {
    shelfInView = entries.some((entry) => entry.isIntersecting);
    updateAir();
  });
  shelfObserver.observe(grid);
}

const sign = document.querySelector(".hanging-sign");
if ("IntersectionObserver" in window) {
  const signObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    if (!signHasPlayed && !reduced()) sign.classList.add("sign-enter");
    signHasPlayed = true;
    signObserver.disconnect();
  }, { threshold: .9 });
  signObserver.observe(sign);
}
