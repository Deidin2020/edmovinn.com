import fs from "node:fs/promises";
import path from "node:path";

// S3 website origins need an index document in each published route directory.
// These are app entry points; all content is still loaded from the live owner API.
const output = path.resolve("dist");
const html = await fs.readFile(path.join(output, "index.html"), "utf8");
const router = await fs.readFile("src/App.tsx", "utf8");
const routes = new Set(
  [...router.matchAll(/\bpath="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((route) => route.startsWith("/") && !/[:*]/.test(route)),
);
const api = (process.env.VITE_API_URL || "https://api.edmovinn.com").replace(/\/$/, "");
if (!/^https?:\/\//.test(api)) throw new Error("Invalid public API URL");

function addResource(prefix, record, legacyPrefix) {
  if (!Number.isSafeInteger(record.id) || record.id < 1 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
    throw new Error("Invalid published catalogue route");
  }
  routes.add(`/${prefix}/${record.slug}`);
  routes.add(`/${legacyPrefix}/${record.id}`);
}

let page = 1;
while (true) {
  const response = await fetch(`${api}/api/v1/public/catalog?per_page=100&page=${page}`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Catalogue request failed: ${response.status}`);
  const { data } = await response.json();
  if (!Array.isArray(data?.rooms) || !Array.isArray(data?.accommodations)) {
    throw new Error("Invalid public catalogue response");
  }
  for (const room of data.rooms) addResource("rooms", room, "room");
  for (const property of data.accommodations) addResource("accommodations", property, "dormitory");
  if (!data.rooms_pagination.has_more && !data.accommodations_pagination.has_more) break;
  if (++page > 1000) throw new Error("Unexpected catalogue pagination");
}

for (const route of [...routes]) {
  for (const language of ["ar", "tr", "en"]) routes.add(`/${language}${route === "/" ? "" : route}`);
}
for (const route of routes) {
  const directory = path.resolve(output, `.${route}`);
  if (directory !== output && !directory.startsWith(`${output}${path.sep}`)) {
    throw new Error("Route is outside the build directory");
  }
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, "index.html"), html);
}
console.log(`Generated ${routes.size} static route entry points from the router and published catalogue.`);
