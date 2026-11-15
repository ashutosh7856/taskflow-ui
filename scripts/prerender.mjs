// Build step: renders every public page to static HTML so search engines and
// AI crawlers (which often don't run JavaScript) see real content, then writes
// the sitemap. App screens get an empty, noindex SPA shell (dist/spa.html).
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssrEntry = join(root, "dist-ssr", "entry-server.js");

const template = await readFile(join(dist, "index.html"), "utf8");
const { render, headTags, metaFor, indexablePaths } = await import(
  pathToFileURL(ssrEntry).href
);

function page(path, body = "", styles = "") {
  return template
    .replace(/<!--seo-start-->[\s\S]*?<!--seo-end-->/, headTags(metaFor(path)))
    .replace("<!--ssr-styles-->", styles)
    .replace("<!--ssr-html-->", body);
}

let count = 0;
for (const path of indexablePaths) {
  const result = await render(path);
  if (!result) throw new Error(`Prerender produced a redirect for ${path}`);
  const file =
    path === "/" ? join(dist, "index.html") : join(dist, path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page(path, result.html, result.styles));
  count += 1;
}

// Shell for signed-in app screens and private client portals.
await writeFile(join(dist, "spa.html"), page("/app"));

const today = new Date().toISOString().slice(0, 10);
const urls = indexablePaths
  .map((path) => {
    const priority =
      path === "/" ? "1.0" : path.startsWith("/guides") || path === "/pricing" ? "0.8" : "0.4";
    return `  <url><loc>https://danto.app${path === "/" ? "" : path}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
  })
  .join("\n");
await writeFile(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

await rm(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`Prerendered ${count} pages + spa.html + sitemap.xml`);
