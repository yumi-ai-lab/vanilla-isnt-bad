import { localized } from "./model.js";

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

  function makeDemo(app, language, text) {
    const ja = language === "ja";
    const screen = element("div", `sample-screen sample-${app.id}`);
    screen.setAttribute("aria-label", `${localized(app.name, language)} — ${text("dialog.preview")}`);
    screen.append(element("div", "sample-topline", localized(app.name, language)));
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

export function fillAppDetails(root, app, language, text) {
    root.querySelector("#dialog-title").textContent = localized(app.name, language);
    root.querySelector("#dialog-title").lang = typeof app.name === "string" && /^[\x00-\x7f]+$/.test(app.name) ? "en" : language;
    const icon = root.querySelector("#dialog-icon");
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
    root.querySelector("#dialog-tagline").textContent = localized(app.tagline, language);
    root.querySelector("#dialog-description").textContent = localized(app.description, language) || text("dialog.soon");
    const preview = root.querySelector("#dialog-preview");
    preview.replaceChildren();
    if (app.sample) {
      preview.append(makeDemo(app, language, text), element("p", "screen-caption", text("dialog.preview")));
    } else if (app.screenshots.length) {
      for (const shot of app.screenshots) {
        const img = element("img", "app-screenshot");
        img.src = shot.src;
        img.alt = localized(shot.alt, language);
        img.loading = "lazy";
        preview.append(img);
      }
    } else {
      const art = element("span", "flavor-art");
      art.setAttribute("aria-hidden", "true");
      art.style.setProperty("--flavor-x", `${(app.flavor % 3) * 50}%`);
      art.style.setProperty("--flavor-y", `${Math.floor(app.flavor / 3) * 100}%`);
      preview.append(art);
    }
    const features = root.querySelector("#dialog-features");
    features.replaceChildren();
    app.features.forEach(feature => features.append(element("li", "", localized(feature, language))));
    root.querySelector("#dialog-features-heading").hidden = app.features.length === 0;
    const platforms = root.querySelector("#dialog-platforms");
    platforms.replaceChildren();
    app.platforms.forEach(platform => platforms.append(element("span", "", platform)));
    const status = root.querySelector("#dialog-status");
    status.textContent = app.sample ? text("dialog.sample") : text("dialog.soon");
    status.hidden = !app.sample && Boolean(app.url);
    const link = root.querySelector("#dialog-link");
    link.hidden = app.sample || !app.url;
    if (!link.hidden) link.href = app.url;
    else link.removeAttribute("href");
  }
