import { apps, copy } from "./content.js";
import { localized, normalizeApps, resolveLanguage } from "./model.js";

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
let floorInView = !("IntersectionObserver" in window);
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
      { transform: "translateX(0)", opacity: 1 },
      { transform: `translateX(${direction * 98}%)`, opacity: .35 }
    ], { duration: 1600, delay: 240, group: "window" });
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
    const outside = box.bottom <= 0 || box.top >= height;
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
    const visible = Math.max(0, Math.min(box.bottom, height) - Math.max(box.top, 0));
    const ratio = visible / Math.max(1, Math.min(box.height, height));
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
  document.querySelector(".floor-mist").dataset.airActive = String(floorInView && !document.hidden && !reduced());
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
  grid.replaceChildren();
  grid.removeAttribute("aria-hidden");
  grid.removeAttribute("aria-describedby");
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
    const pane = document.createElement("div");
    pane.className = "glass-pane";
    pane.append(makeIcon(app));
    frame.append(pane);
    const meta = document.createElement("div");
    meta.className = "app-meta";
    const name = document.createElement("h3");
    stableCopy(name, { en: localized(app.name, "en"), ja: localized(app.name, "ja") });
    const description = document.createElement("p");
    stableCopy(description, { en: localized(app.tagline, "en"), ja: localized(app.tagline, "ja") });
    const detail = document.createElement("span");
    detail.className = "app-detail-label";
    detail.textContent = text("app.details") + " ↗";
    meta.append(name, description, detail);
    button.append(frame, meta);
    button.addEventListener("click", () => openApp(app, button));
    item.append(button);
    grid.append(item);
    if (dialog.open && activeApp?.id === app.id) {
      activeTrigger = button;
      button.classList.add("is-selected");
    }
  }
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

if ("IntersectionObserver" in window) {
  const shelfObserver = new IntersectionObserver((entries) => {
    shelfInView = entries.some((entry) => entry.isIntersecting);
    updateAir();
  });
  shelfObserver.observe(grid);
  const floorObserver = new IntersectionObserver((entries) => {
    floorInView = entries.some(entry => entry.isIntersecting);
    updateAir();
  });
  floorObserver.observe(document.querySelector(".floor-mist"));
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
