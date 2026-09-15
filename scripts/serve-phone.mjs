import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { stat } from "node:fs/promises";
import { createSiteServer } from "./serve.mjs";

export function phoneAddresses(interfaces) {
  return [...new Set(Object.values(interfaces).flat().filter((entry) => {
    if (!entry || entry.internal || entry.family !== "IPv4") return false;
    const [first, second] = entry.address.split(".").map(Number);
    return first === 10 || (first === 192 && second === 168) || (first === 172 && second >= 16 && second <= 31);
  }).map((entry) => entry.address))];
}

export function choosePhoneAddress(interfaces, preferred) {
  const addresses = phoneAddresses(interfaces);
  if (preferred && addresses.includes(preferred)) return preferred;
  if (preferred) throw new Error("Choose this PC's Wi-Fi IPv4 address with --host.");
  if (addresses.length === 0) throw new Error("Connect this PC to Wi-Fi, then try again.");
  if (addresses.length > 1) throw new Error("Several networks are connected. Choose one with --host: " + addresses.join(", "));
  return addresses[0];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const valueOf = (flag) => {
    const index = process.argv.indexOf(flag);
    if (index < 0) return undefined;
    const value = process.argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error("Missing value for " + flag);
    return value;
  };
  try {
    const host = choosePhoneAddress(networkInterfaces(), valueOf("--host"));
    const port = Number(valueOf("--port") || 4173);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid port");
    const dist = fileURLToPath(new URL("../dist/", import.meta.url));
    await stat(path.join(dist, "index.html"));
    const server = createSiteServer(dist);
    server.on("error", (error) => {
      process.stderr.write(error.message + "\n");
      process.exitCode = 1;
    });
    server.listen(port, host, () => {
      process.stdout.write("Phone preview: http://" + host + ":" + port + "/?lang=ja\n");
      process.stdout.write("Connect your phone to the same Wi-Fi. Keep this PC awake. Ctrl+C stops the preview.\n");
    });
  } catch (error) {
    process.stderr.write(error.code === "ENOENT" ? "Run npm run build before starting the phone preview.\n" : error.message + "\n");
    process.exitCode = 1;
  }
}
