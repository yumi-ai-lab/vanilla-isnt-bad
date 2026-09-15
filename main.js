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
const text = (key) => copy[language][key] ?? copy.en[key] ?? key;
const reduced = () => motionQuery.matches || userReduced;

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
    name.textContent = localized(app.name, language);
    const description = document.createElement("p");
    description.textContent = localized(app.tagline, language);
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

function translate() {
  document.documentElement.lang = language;
  document.title = text("page.title");
  document.querySelector('meta[name="description"]').content = text("page.description");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = text(element.dataset.i18n);
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

const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.12, rootMargin: "0px 0px 16px 0px" }) : null;

function observeReveal(element) {
  if (reduced() || !revealObserver || element.getBoundingClientRect().top < innerHeight) return;
  element.classList.add("will-reveal");
  revealObserver.observe(element);
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
    document.querySelectorAll(".will-reveal").forEach((element) => {
      element.classList.add("is-visible");
      revealObserver?.unobserve(element);
    });
  }
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    savePreference("vanilla-language", language);
    const url = new URL(location.href);
    url.searchParams.set("lang", language);
    history.replaceState(history.state, "", url);
    translate();
  });
});

document.querySelector("#motion-toggle").addEventListener("click", () => {
  userReduced = !userReduced;
  savePreference("vanilla-motion", userReduced ? "off" : "on");
  updateMotion();
});
motionQuery.addEventListener("change", updateMotion);

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
observeReveal(document.querySelector(".about-section"));

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
