import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { localized, normalizeApps, externalUrl, imageUrl, resolveLanguage } from "../model.js";
import { apps, copy } from "../content.js";
import { createSiteServer } from "../scripts/serve.mjs";

test("localization uses explicit language, stored preference, then browser language", () => {
  assert.equal(resolveLanguage({query:"ja", saved:"en", browser:"en"}), "ja");
  assert.equal(resolveLanguage({query:"fr", saved:"ja", browser:"en"}), "ja");
  assert.equal(resolveLanguage({browser:"ja-JP"}), "ja");
  assert.equal(resolveLanguage({browser:"fr-FR"}), "en");
  assert.equal(localized({ja:"名前", en:"Name"}, "ja"), "名前");
  assert.equal(localized({en:"Name"}, "ja"), "Name");
  assert.equal(localized({ja:123, en:"Name"}, "ja"), "Name");
  assert.equal(localized({en:{unexpected:true}}), "");
});

test("unsafe destinations cannot become app links or image sources", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "file:///C:/private", "bad-url"]) {
    assert.equal(externalUrl(url), null);
    assert.equal(imageUrl(url), null);
  }
  assert.equal(externalUrl("https://example.com/app"), "https://example.com/app");
  assert.equal(imageUrl("./assets/apps/icon.png"), "./assets/apps/icon.png");
  assert.equal(imageUrl("./assets/../../secret.png"), null);
});

test("invalid and duplicate app records do not break the gallery", () => {
  const result = normalizeApps([
    null,
    { id:"", name:"Missing id" },
    { id:"invalid-name", name:{en:123} },
    { id:"good-app", name:{en:"Good app", ja:"アプリ"}, icon:"./assets/apps/good.png", url:"https://example.com" },
    { id:"good-app", name:"Duplicate" },
    { id:"no-url", name:"No URL", url:"javascript:alert(1)" }
  ]);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "good-app");
  assert.equal(result[1].url, null);
});

test("shipping catalog contains only valid app records and both languages cover the page", async () => {
  assert.equal(normalizeApps(apps).length, apps.length);
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const keys = [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map((x) => x[1]);
  for (const key of keys) {
    assert.equal(typeof copy.en[key], "string", "English: " + key);
    assert.equal(typeof copy.ja[key], "string", "Japanese: " + key);
  }
  assert.equal((await stat(new URL("../assets/kiosk.png", import.meta.url))).size > 0, true);
});

test("local preview serves routes and rejects non-static or malformed requests", async () => {
  const server = createSiteServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /VANILLA ISN[’']T BAD/);
    assert.match((await fetch(base + "/main.js")).headers.get("content-type"), /javascript/);
    assert.equal((await fetch(base + "/assets/kiosk.png", {method:"HEAD"})).status, 200);
    assert.equal((await fetch(base + "/missing.png")).status, 404);
    assert.equal((await fetch(base + "/package.json", {method:"POST"})).status, 405);
    assert.equal((await fetch(base + "/%00.png")).status, 400);
    assert.equal((await fetch(base + "/..%5csecret.png")).status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
