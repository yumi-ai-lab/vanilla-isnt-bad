import { mkdir, cp, copyFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
await mkdir(path.join(dist, "assets"), { recursive: true });
for (const name of ["index.html", "styles.css", "main.js", "content.js", "model.js"]) {
  await copyFile(path.join(root, name), path.join(dist, name));
}
await cp(path.join(root, "assets"), path.join(dist, "assets"), {
  recursive: true,
  filter: (source) => !source.endsWith("art-direction.png") && !source.endsWith(".prompt.txt")
});
await writeFile(path.join(dist, ".nojekyll"), "");
process.stdout.write("Static site written to " + dist + "\n");
