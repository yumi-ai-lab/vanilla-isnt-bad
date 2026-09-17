import test from "node:test";
import assert from "node:assert/strict";
import { versionSiteFiles } from "../scripts/version-site-files.mjs";

test("a separate demo entry invalidates with its own content without changing the main page",()=>{
  const source={
    "index.html":'<script type="module" src="./main.js"></script>',
    "menu-demo.html":'<script type="module" src="./menu-demo.js"></script>',
    "main.js":'export const stable = true;',
    "menu-demo.js":'import { notes } from "./demo-content.js";',
    "demo-content.js":'export const notes = "first";'
  };
  const before=versionSiteFiles(source);
  const after=versionSiteFiles({...source,"demo-content.js":'export const notes = "next";'});
  assert.match(before["menu-demo.html"],/menu-demo\.js\?v=[a-f0-9]+/);
  assert.notEqual(after["menu-demo.html"],before["menu-demo.html"]);
  assert.equal(after["index.html"],before["index.html"]);
});
