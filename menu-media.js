// Observe the image that is actually painted, including cached images. A
// separate preloader finishing does not guarantee a CSS background is ready.
export function observeImage(image, { ready, failed }) {
  let revision = 0;
  let active = true;
  async function loaded() {
    const current = ++revision;
    try { await image.decode?.(); } catch {
      // Some browsers reject decode for an otherwise complete, usable image.
    }
    if (!active || current !== revision) return;
    if (image.complete && image.naturalWidth > 0) ready();
    else failed();
  }
  function error() { revision++; if (active) failed(); }
  image.addEventListener("load", loaded);
  image.addEventListener("error", error);
  if (image.complete && image.getAttribute("src")) {
    if (image.naturalWidth > 0) loaded();
    else error();
  }
  return () => {
    active = false;
    revision++;
    image.removeEventListener("load", loaded);
    image.removeEventListener("error", error);
  };
}
