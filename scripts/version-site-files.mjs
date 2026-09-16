import { createHash } from "node:crypto";

const hash = value => createHash("sha256").update(value).digest("hex").slice(0, 12);

export function versionSiteFiles(files) {
  const normalized = Object.fromEntries(Object.entries(files).map(([name, text]) => [name, text.replace(/\r\n/g, "\n")]));
  const versioned = {};
  function module(name) {
    if (versioned[name]) return versioned[name];
    versioned[name] = normalized[name].replace(/"\.\/([a-z-]+\.js)"/g, (match, dependency) => {
      if (!(dependency in normalized)) return match;
      return `"./${dependency}?v=${hash(module(dependency))}"`;
    });
    return versioned[name];
  }
  for (const name of Object.keys(normalized).filter(name => name.endsWith(".js"))) module(name);
  for (const [name, source] of Object.entries(normalized)) {
    if (!name.endsWith(".html")) continue;
    versioned[name] = source
      .replace(/href="\.\/([a-z-]+\.css)"/g, (match, sheet) => sheet in normalized ? `href="./${sheet}?v=${hash(normalized[sheet])}"` : match)
      .replace('src="./main.js"', `src="./main.js?v=${hash(versioned["main.js"])}"`);
  }
  return { ...normalized, ...versioned };
}
