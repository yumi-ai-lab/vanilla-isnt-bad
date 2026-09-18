import test from "node:test";
import assert from "node:assert/strict";
import { normalizeApps } from "../model.js";
import { previewApps } from "../content.js";
import { availableCategories, filterApps, menuPage, searchText, menuRecords, readMenuFilters, menuFilterUrl } from "../catalog.js";
import { demoNotes } from "../demo-content.js";
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

test("familiar words find the sample apps without adding sample claims to real apps", () => {
  const menu=menuRecords(previewApps,demoNotes);
  for (const [word,id] of [["旅行","trip"],["家計簿","budget"],["TODO","tasks"],["日記","journal"],["ﾎﾟﾓﾄﾞｰﾛ","focus"]]) {
    assert.deepEqual(filterApps(menu,word).map(app=>app.id),[id]);
  }
  const real=menuRecords([{id:"focus",name:"Focus",features:["独自の機能"],searchTerms:["仕事",42,null]}],demoNotes);
  assert.deepEqual(real[0].features,["独自の機能"]);
  assert.deepEqual(real[0].searchTerms,["仕事"]);
  assert.equal(filterApps(real,"仕事").length,1);
  assert.equal(filterApps(real,"ポモドーロ").length,0);
});

test("a named app ranks above incidental description matches while browsing keeps its order", () => {
  const menu=menuRecords([
    {id:"incidental",name:"Another app",description:"Export notes from your journal"},
    {id:"purpose",name:"Writing",tagline:"Keep notes"},
    {id:"exact",name:"Notes"},
    {id:"prefix",name:"Notes Plus"}
  ]);
  assert.deepEqual(filterApps(menu,"notes").map(app=>app.id),["exact","prefix","purpose","incidental"]);
  assert.deepEqual(filterApps(menu,"").map(app=>app.id),["incidental","purpose","exact","prefix"]);
  assert.deepEqual(filterApps(menu,"notes journal").map(app=>app.id),["incidental"]);
});

test("an empty category search still exposes matching apps elsewhere without changing its terms", () => {
  const menu=menuRecords(previewApps,demoNotes);
  const restricted=menuPage(menu,"旅行","focus");
  assert.equal(restricted.count,0);
  assert.equal(restricted.allCount,1);
  assert.deepEqual(menuPage(menu,"旅行","all").shown.map(app=>app.id),["trip"]);
  assert.equal(menuPage(menu,"not-a-real-app","focus").allCount,0);
});

test("filter URLs retain language and selected app and safely restore a copied or reloaded menu", () => {
  const original="https://example.com/apps.html?lang=ja&v=build#app-notes";
  const url=menuFilterUrl(original,{query:"  メモ & note  ",category:"record"});
  assert.equal(url.searchParams.get("lang"),"ja");
  assert.equal(url.searchParams.get("v"),"build");
  assert.equal(url.hash,"#app-notes");
  assert.deepEqual(readMenuFilters(url,samples),{query:"メモ & note",category:"record"});
  assert.deepEqual(readMenuFilters(original+"",samples),{query:"",category:"all"});
  assert.equal(readMenuFilters("https://example.com/?q="+"a".repeat(250)+"&category=missing",samples).query.length,200);
  assert.equal(readMenuFilters("https://example.com/?category=missing",samples).category,"all");
  const cleared=menuFilterUrl(url,{query:"",category:"all"});
  assert.equal(cleared.searchParams.has("q"),false);
  assert.equal(cleared.searchParams.has("category"),false);
});
