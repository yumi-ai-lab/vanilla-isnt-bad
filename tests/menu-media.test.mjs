import test from "node:test";
import assert from "node:assert/strict";
import { observeImage } from "../menu-media.js";

class ImageStub extends EventTarget {
  complete = false;
  naturalWidth = 0;
  src = "./image.png";
  getAttribute(name) { return name === "src" ? this.src : null; }
  decode() { return Promise.resolve(); }
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test("the actual image is revealed only after decoding, including a cache hit", async () => {
  const image = new ImageStub();
  let finish;
  image.decode = () => new Promise(resolve => { finish = resolve; });
  image.complete = true;
  image.naturalWidth = 1536;
  let ready = 0;
  observeImage(image, {ready:()=>ready++,failed:()=>assert.fail("valid image failed")});
  assert.equal(ready,0);
  finish();
  await settle();
  assert.equal(ready,1);
});

test("switching apps discards a pending decode instead of revealing the old screenshot", async () => {
  const image = new ImageStub();
  let finish;
  image.decode = () => new Promise(resolve => { finish = resolve; });
  const stop = observeImage(image,{ready:()=>assert.fail("stale preview shown"),failed:()=>assert.fail("stale failure shown")});
  image.complete = true;
  image.naturalWidth = 900;
  image.dispatchEvent(new Event("load"));
  stop();
  finish();
  await settle();
  image.dispatchEvent(new Event("error"));
});

test("an image error cancels a pending decode and a later successful retry can recover", async () => {
  const image = new ImageStub();
  let finish;
  image.decode = () => new Promise(resolve => { finish = resolve; });
  const states = [];
  observeImage(image,{ready:()=>states.push("ready"),failed:()=>states.push("failed")});
  image.complete = true;
  image.naturalWidth = 900;
  image.dispatchEvent(new Event("load"));
  image.dispatchEvent(new Event("error"));
  finish();
  await settle();
  assert.deepEqual(states,["failed"]);
  image.decode = () => Promise.resolve();
  image.dispatchEvent(new Event("load"));
  await settle();
  assert.deepEqual(states,["failed","ready"]);
});

test("decode rejection only falls back for a complete, usable image", async () => {
  for (const width of [0,900]) {
    const image = new ImageStub();
    const states = [];
    image.decode = () => Promise.reject(new Error("decode unavailable"));
    observeImage(image,{ready:()=>states.push("ready"),failed:()=>states.push("failed")});
    image.complete = true;
    image.naturalWidth = width;
    image.dispatchEvent(new Event("load"));
    await settle();
    assert.deepEqual(states,[width ? "ready" : "failed"]);
  }
});
