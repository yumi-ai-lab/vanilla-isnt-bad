import test from "node:test";
import assert from "node:assert/strict";
import { tablePage } from "../model.js";

test("the terrace reaches every app, including a partial last table", () => {
  for (const capacity of [1,3]) {
    for (const count of [0,1,2,3,6,7,20]) {
      const visited = [];
      let page = tablePage(count,0,capacity);
      assert.equal(page.atStart,true);
      for (;;) {
        for (let i=page.start;i<page.end;i++) visited.push(i);
        if (page.atEnd) break;
        page = tablePage(count,page.next,capacity);
      }
      assert.deepEqual(visited,Array.from({length:count},(_,i)=>i));
      assert.equal(tablePage(count,page.next,capacity).start,page.start);
      while (!page.atStart) page = tablePage(count,page.previous,capacity);
      assert.equal(page.start,0);
    }
  }
});

test("resize and deep links keep the selected app in view without empty slots", () => {
  for (const index of [0,1,2,3,6]) {
    for (const capacity of [1,3]) {
      const page=tablePage(7,index,capacity);
      assert.ok(page.start<=index && page.end>index);
      assert.ok(page.end-page.start<=capacity);
    }
  }
  assert.equal(tablePage(7,900,3).start,6);
  assert.equal(tablePage(7,-9,3).start,0);
});
