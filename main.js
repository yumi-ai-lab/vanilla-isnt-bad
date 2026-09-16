import { createGallery } from "./gallery.js";
import { apps, previewApps, copy } from "./content.js";
import { normalizeApps, resolveLanguage } from "./model.js";

const readPreference = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
let language = resolveLanguage({
  query: new URLSearchParams(location.search).get("lang"),
  saved: readPreference("vanilla-language"),
  browser: navigator.language
});
const registered = normalizeApps(apps);
const records = registered.length ? registered : normalizeApps(previewApps);
const isShowcase = document.body.dataset.page === "showcase";

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let userReduced = readPreference("vanilla-motion") === "off";


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
  if (isShowcase) return;
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
      { transform: `translateX(${direction * 86}%)` }
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
  if (isShowcase) return;
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
  const artwork = document.querySelector(".kiosk-art");
  art.src = artwork.currentSrc || artwork.getAttribute("src");
  boundedReady(art.decode(), 4000).then(() => {
    artworkReady = true;
    scheduleVisuals();
  });
}

function updateAir() {
  if (isShowcase) return;
  const active = String(shelfInView && !document.hidden && !reduced());
  document.querySelector(".cabinet-atmosphere").dataset.airActive = active;
}

const gallery = createGallery({records, isShowcase, language: () => language, text, stableCopy});

function translate(animate = false) {
  stopCopyAnimations();
  document.documentElement.lang = language;
  document.title = isShowcase ? `${text("showcase.title")} — VANILLA ISN’T BAD.` : text("page.title");
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
  gallery.render();
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

document.querySelector("#year").textContent = String(new Date().getFullYear());
translate();
if (!isShowcase) prepareEntrances();
gallery.syncLocation();
gallery.restoreShop();
if (isShowcase && !reduced()) playScene(document.querySelector(".showcase-main"), [{opacity:.3, transform:"translateY(12px)"}, {opacity:1, transform:"none"}], {duration:360});

if (!isShowcase && "IntersectionObserver" in window) {
  const shelfObserver = new IntersectionObserver((entries) => {
    shelfInView = entries.some((entry) => entry.isIntersecting);
    updateAir();
  });
  shelfObserver.observe(document.querySelector(".kiosk-scene"));
}
