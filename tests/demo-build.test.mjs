import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { versionSiteFiles } from "../scripts/version-site-files.mjs";

test("the app menu invalidates with its own content without changing the main page",()=>{
  const source={
    "index.html":'<script type="module" src="./main.js"></script>',
    "apps.html":'<script type="module" src="./menu-demo.js"></script>',
    "main.js":'export const stable = true;',
    "menu-demo.js":'import { notes } from "./demo-content.js";',
    "demo-content.js":'export const notes = "first";'
  };
  const before=versionSiteFiles(source);
  const after=versionSiteFiles({...source,"demo-content.js":'export const notes = "next";'});
  assert.match(before["apps.html"],/menu-demo\.js\?v=[a-f0-9]+/);
  assert.notEqual(after["apps.html"],before["apps.html"]);
  assert.equal(after["index.html"],before["index.html"]);
});

test("old demo links replace the history entry and preserve language, query and selected app",async()=>{
  const source=await readFile(new URL("../menu-redirect.js",import.meta.url),"utf8");
  for (const suffix of ["","?lang=ja&v=450f5f6#app-notes","?lang=en#app-trip"]) {
    const origin=new URL(`https://example.test/vanilla-isnt-bad/menu-demo.html${suffix}`);
    let destination;
    runInNewContext(source,{URL,location:{href:origin.href,search:origin.search,hash:origin.hash,replace:value=>destination=value}});
    assert.equal(destination,`https://example.test/vanilla-isnt-bad/apps.html${suffix}`);
  }
});
