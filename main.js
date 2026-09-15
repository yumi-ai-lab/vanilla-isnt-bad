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
const copyAnimations = new Set();
const sceneAnimations = new Set();
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
  const animation = element.animate(keyframes, {
    duration: 1000,
    easing: "cubic-bezier(.22,.61,.36,1)",
    fill: "backwards",
    ...options
  });
  sceneAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => sceneAnimations.delete(animation));
}

function revealHero() {
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
    ], { duration, delay });
  }
}

function openShop() {
  document.querySelector(".kiosk-wrap").classList.add("is-open");
  for (const [selector, direction] of [[".window-glass-left", -1], [".window-glass-right", 1]]) {
    playScene(document.querySelector(selector), [
      { transform: "translateX(0)", opacity: 1 },
      { transform: `translateX(${direction * 98}%)`, opacity: .65 }
    ], { duration: 1200, delay: 100 });
  }
}

function revealAbout() {
  for (const [selector, delay] of [["#about-title", 0], [".about-copy", 120]]) {
    playScene(document.querySelector(selector), [
      { opacity: .08, transform: "translateX(calc(-1 * var(--copy-travel)))", filter: "blur(3px)" },
      { opacity: 1, transform: "translateX(0)", filter: "blur(0)" }
    ], { duration: 900, delay });
  }
}

function observeEntrance(element, reveal) {
  // Content stays visible until a real intersection starts a finite animation.
  // A missing or silent observer must never leave a blank section behind.
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    reveal();
    observer.disconnect();
  }, { threshold: .14 });
  observer.observe(element);
}

function updateAir() {
  grid.dataset.airActive = String(shelfInView && !document.hidden && !reduced());
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
    for (const animation of sceneAnimations) animation.cancel();
    sceneAnimations.clear();
  }
  updateAir();
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
document.addEventListener("visibilitychange", updateAir);

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
revealHero();
observeEntrance(document.querySelector(".serving-window"), openShop);
observeEntrance(document.querySelector(".about-section"), revealAbout);

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
