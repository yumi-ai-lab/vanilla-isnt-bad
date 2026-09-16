import test from "node:test";
import assert from "node:assert/strict";
import { shelfState } from "../model.js";

test("mobile shelf reaches every bay and stops at its fractional final offset", () => {
  let state = shelfState(6, 320, 375, 0);
  const stops = [];
  while (!state.atEnd && stops.length < 10) {
    stops.push(state.next);
    state = shelfState(6, 320, 375, state.next);
  }
  assert.deepEqual(stops, [320, 640, 960, 1280, 1545]);
  assert.equal(state.first, 6);
  assert.equal(state.last, 6);
  assert.equal(state.next, 1545);
  assert.equal(state.previous, 1280);
  assert.equal(shelfState(6, 320, 375, -15).atStart, true);
});

test("desktop shelf counts visible apps and clamps both ends without looping", () => {
  assert.equal(shelfState(12, 480, 1280, 0).last, 3);
  const end = shelfState(12, 480, 1280, 99999);
  assert.equal(end.max, 4480);
  assert.equal(end.first, 10);
  assert.equal(end.last, 12);
  assert.equal(end.atEnd, true);
  assert.equal(end.next, end.max);
  assert.equal(shelfState(12, 480, 1280, 255).nearest, 480);
});

test("short or unmeasured shelves need no navigation", () => {
  for (const state of [shelfState(0, 320, 375), shelfState(6, 0, 375), shelfState(1, 320, 375)]) {
    assert.equal(state.atStart, true);
    assert.equal(state.atEnd, true);
    assert.equal(state.previous, 0);
    assert.equal(state.next, 0);
  }
});
