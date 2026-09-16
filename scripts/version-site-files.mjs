import { createHash } from "node:crypto";

const hash = value => createHash("sha256").update(value).digest("hex").slice(0, 12);

export function versionSiteFiles(files) {
  const normalized = Object.fromEntries(Object.entries(files).map(([name, text]) => [name, text.replace(/\r\n/g, "\n")]));
  const main = normalized["main.js"]
    .replaceAll('"./content.js"', `"./content.js?v=${hash(normalized["content.js"])}"`)
    .replaceAll('"./model.js"', `"./model.js?v=${hash(normalized["model.js"])}"`);
  const html = normalized["index.html"]
    .replace('href="./styles.css"', `href="./styles.css?v=${hash(normalized["styles.css"])}"`)
    .replace('src="./main.js"', `src="./main.js?v=${hash(main)}"`);
  return { ...normalized, "index.html": html, "main.js": main };
}
