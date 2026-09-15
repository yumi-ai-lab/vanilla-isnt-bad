import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRoot = fileURLToPath(new URL("../", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

export function createSiteServer(root = defaultRoot) {
  const siteRoot = path.resolve(root);
  return http.createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("Cache-Control", "no-cache");
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
      return;
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      if (pathname.includes("\0") || pathname.includes("\\")) throw new Error("Invalid path");
      const relative = pathname.endsWith("/") ? pathname + "index.html" : pathname;
      const target = path.resolve(siteRoot, "." + relative);
      if (target !== siteRoot && !target.startsWith(siteRoot + path.sep)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      if (!types[path.extname(target)]) {
        response.writeHead(404).end("Not found");
        return;
      }
      const file = await stat(target);
      if (!file.isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }
      response.writeHead(200, { "Content-Type": types[path.extname(target)], "Content-Length": file.size });
      if (request.method === "HEAD") response.end();
      else {
        const stream = createReadStream(target);
        stream.on("error", () => response.destroy());
        stream.pipe(response);
      }
    } catch (error) {
      const code = ["ENOENT", "ENOTDIR"].includes(error.code) ? 404 : 400;
      response.writeHead(code).end(code === 404 ? "Not found" : "Bad request");
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const portIndex = process.argv.indexOf("--port");
  const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : 4173);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid port");
  const server = createSiteServer();
  server.on("error", (error) => { process.stderr.write(error.message + "\n"); process.exitCode = 1; });
  server.listen(port, "127.0.0.1", () => {
    process.stdout.write("VANILLA ISN'T BAD. preview: http://127.0.0.1:" + port + "\n");
  });
}
