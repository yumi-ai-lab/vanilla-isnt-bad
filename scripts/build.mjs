import { mkdir, cp, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { versionSiteFiles } from "./version-site-files.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
await mkdir(path.join(dist, "assets"), { recursive: true });
const names = ["index.html", "apps.html", "terrace-preview.html", "menu-demo.html", "styles.css", "showcase.css", "terrace.css", "menu-demo.css", "main.js", "gallery.js", "app-details.js", "terrace.js", "catalog.js", "content.js", "model.js", "menu-demo.js", "demo-content.js", "menu-redirect.js", "menu-media.js"];
const source = Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(path.join(root, name), "utf8")])));
for (const [name, contents] of Object.entries(versionSiteFiles(source))) {
  await writeFile(path.join(dist, name), contents);
}
await cp(path.join(root, "assets"), path.join(dist, "assets"), {
  recursive: true,
  filter: (source) => !source.endsWith("art-direction.png") && !source.endsWith(".prompt.txt")
});
await writeFile(path.join(dist, ".nojekyll"), "");
process.stdout.write("Static site written to " + dist + "\n");
