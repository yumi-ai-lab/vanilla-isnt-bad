// Optional authoring tool; the normal site build has no package dependency.
// Use an installed sharp package or pass --sharp-module /absolute/path/to/sharp/index.cjs.
import { stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
const argument = process.argv.indexOf("--sharp-module");
const moduleName = argument >= 0 ? pathToFileURL(path.resolve(process.argv[argument + 1])).href : "sharp";
const { default: sharp } = await import(moduleName);
const assets = fileURLToPath(new URL("../assets/", import.meta.url));
for (const name of ["terrace-open-park-v8", "flavor-cutouts-v2", "flavor-scoops-top-v2"]) {
  const options = name.startsWith("terrace-")
    ? { quality: 96, alphaQuality: 100, effort: 6, smartSubsample: true }
    : { lossless: true, effort: 6 };
  await sharp(path.join(assets, name + ".png")).webp(options).toFile(path.join(assets, name + ".webp"));
}
// The scene uses only this image's alpha. Removing its unused RGB saves most
// of the transfer, while lossless encoding preserves every leaf edge.
const { data, info } = await sharp(path.join(assets, "terrace-park-foreground-v1.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) data[i] = data[i + 1] = data[i + 2] = 255;
await sharp(data, { raw: info }).webp({ lossless: true, effort: 6 }).toFile(path.join(assets, "terrace-park-mask-v1.webp"));
for (const name of ["terrace-open-park-v8", "flavor-cutouts-v2", "flavor-scoops-top-v2", "terrace-park-mask-v1"]) {
  console.log(`${name}.webp: ${(await stat(path.join(assets, name + ".webp"))).size} bytes`);
}
