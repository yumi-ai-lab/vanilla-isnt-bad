import test from "node:test";
import assert from "node:assert/strict";
import { normalizeApps } from "../model.js";
import { previewApps } from "../content.js";
import { availableCategories, filterApps, menuPage, searchText } from "../catalog.js";
const samples = normalizeApps(previewApps);

test("search accepts names, purposes, width variants and either language", () => {
  assert.deepEqual(filterApps(samples,"ＦＯＣＵＳ").map(app=>app.id),["focus"]);
  assert.deepEqual(filterApps(samples,"ﾒﾓ").map(app=>app.id),["notes"]);
  assert.deepEqual(filterApps(samples,"めも").map(app=>app.id),["notes"]);
  assert.deepEqual(filterApps(samples,"  TRIP　旅  ").map(app=>app.id),["trip"]);
  assert.deepEqual(filterApps(samples,"集中","record"),[]);
  assert.equal(filterApps(samples,"","record").length,3);
  assert.equal(filterApps(samples,"<script>no-results</script>").length,0);
  assert.equal(searchText("メモ　 ABC"),"めも abc");
});

test("categories do not hide unclassified apps or manufacture empty sections", () => {
  const records=normalizeApps([{id:"one",name:"One"},{id:"two",name:"Two",categories:["unknown","unknown",null,7]},{id:"three",name:"Three",categories:["focus","focus"]}]);
  assert.deepEqual(availableCategories(records).map(item=>item.id),["focus","other"]);
  assert.equal(filterApps(records,"","all").length,3);
  assert.deepEqual(filterApps(records,"","other").map(app=>app.id),["one","two"]);
  assert.deepEqual(records[2].categories,["focus"]);
  assert.deepEqual(availableCategories([]),[]);
});

test("large menus keep every matching app reachable without duplicate records", () => {
  const records=normalizeApps(Array.from({length:41},(_,i)=>({id:`app-${i}`,name:`App ${i}`,tagline:i%2?"Travel":"Notes",categories:i%2?["organize"]:["record"]})));
  assert.equal(menuPage(records,"","all").shown.length,12);
  assert.equal(menuPage(records,"","all",24).remaining,17);
  assert.equal(menuPage(records,"","all",36).remaining,5);
  const final=menuPage(records,"","all",48);
  assert.equal(final.shown.length,41);
  assert.equal(final.remaining,0);
  assert.equal(new Set(final.shown.map(app=>app.id)).size,41);
  assert.equal(menuPage(records,"Notes","record",48).count,21);
  assert.equal(menuPage(records,"Notes","organize",48).count,0);
});
