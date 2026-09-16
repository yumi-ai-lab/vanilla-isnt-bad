import test from "node:test";
import assert from "node:assert/strict";
import { versionSiteFiles } from "../scripts/version-site-files.mjs";

const source = {
  "index.html": '<link href="./styles.css"><script src="./main.js"></script>',
  "styles.css": "body { color: black; }",
  "main.js": 'import { copy } from "./content.js";\nimport { localized } from "./model.js";',
  "content.js": 'export const copy = { title: "First" };',
  "model.js": "export const localized = value => value;"
};
const scriptURL = html => html.match(/src="([^"]+)"/)[1];
const styleURL = html => html.match(/href="([^"]+)"/)[1];

test("the browser receives new module URLs when a transitive dependency changes", () => {
  const initial = versionSiteFiles(source);
  for (const dependency of ["content.js", "model.js"]) {
    const next = versionSiteFiles({ ...source, [dependency]: source[dependency] + "\n// Changed" });
    assert.notEqual(scriptURL(next["index.html"]), scriptURL(initial["index.html"]));
    assert.notEqual(next["main.js"], initial["main.js"]);
    assert.equal(styleURL(next["index.html"]), styleURL(initial["index.html"]));
  }
  assert.equal(source["main.js"].includes("?v="), false);
});

test("style-only changes refresh CSS, while unchanged builds keep stable URLs", () => {
  const initial = versionSiteFiles(source);
  assert.deepEqual(versionSiteFiles(source), initial);
  const next = versionSiteFiles({ ...source, "styles.css": "body { color: blue; }" });
  assert.notEqual(styleURL(next["index.html"]), styleURL(initial["index.html"]));
  assert.equal(scriptURL(next["index.html"]), scriptURL(initial["index.html"]));
  assert.match(scriptURL(next["index.html"]), /^\.\/main\.js\?v=[a-f0-9]{12}$/);
});

test("Windows and Linux checkouts produce the same files and cache keys", () => {
  const windowsSource = Object.fromEntries(Object.entries(source).map(([name, text]) => [name, text.replace(/\n/g, "\r\n")]));
  assert.deepEqual(versionSiteFiles(windowsSource), versionSiteFiles(source));
});

test("both pages update when their shared gallery or nested data changes", () => {
  const multiPage = {...source, "apps.html":source["index.html"] + '<link href="./showcase.css">', "showcase.css":".showcase {}", "main.js":source["main.js"] + '\nimport { createGallery } from "./gallery.js";', "gallery.js":'import { localized } from "./model.js"; export const createGallery = () => {};'};
  const initial = versionSiteFiles(multiPage);
  for (const dependency of ["model.js","content.js","gallery.js"]) {
    const next = versionSiteFiles({...multiPage, [dependency]:multiPage[dependency] + "\n// Changed"});
    for (const page of ["index.html","apps.html"]) assert.notEqual(scriptURL(next[page]),scriptURL(initial[page]));
  }
  assert.match(initial["gallery.js"], /model\.js\?v=[a-f0-9]{12}/);
  assert.match(initial["apps.html"], /showcase\.css\?v=[a-f0-9]{12}/);
});
