import test from "node:test";
import assert from "node:assert/strict";
import { appMockup } from "../app-mockups.js";

test("concept screens never substitute for real apps or registered screenshots", () => {
  const concept = {id:"focus", name:{ja:"集中",en:"Focus"}, sample:true, screenshots:[]};
  assert.equal(appMockup(concept,"ja").name,"集中");
  assert.equal(appMockup(concept,"en").name,"Focus");
  assert.notEqual(appMockup(concept,"ja").alt,appMockup(concept,"en").alt);
  for (const app of [
    {...concept,sample:false},
    {id:"focus",name:"A real Focus app"},
    {...concept,screenshots:[{src:"./assets/apps/real-screen.png"}]},
    {...concept,id:"future-app"},
    {...concept,id:"constructor"},
    null
  ]) assert.equal(appMockup(app),null);
});
