import fs from "node:fs/promises";

const base = (process.argv[2] || "http://localhost:3100").replace(/\/+$/, "");
const expectedOrigin = process.argv[3] || "https://huyenhotels.com";
const decode = (value = "") => value.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const get = async (path) => {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
  return { response, html: await response.text() };
};
const xml = (await get("/sitemap.xml")).html;
const paths = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(decode(m[1])).pathname).concat(["/tim-phong", "/dat-phong"]))];
const results = [];
for (let offset = 0; offset < paths.length; offset += 4) {
  results.push(...await Promise.all(paths.slice(offset, offset + 4).map(async (path) => {
    const { response, html } = await get(path);
    const titles = [...html.matchAll(/<title>(.*?)<\/title>/gs)].map((m) => decode(m[1]));
    const descriptions = [...html.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => decode(m[1]));
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => decode(m[1]));
    const headings = [...html.matchAll(/<h([1-6])(?:\s|>)/g)].map((m) => Number(m[1]));
    const expected = new URL(path, expectedOrigin).href.replace(/\/$/, "");
    return { path, status: response.status, title: titles[0], description: descriptions[0], canonical: canonicals[0], h1: headings.filter((n) => n === 1).length, headings,
      issues: [response.status !== 200 && "HTTP status", titles.length !== 1 && "title count", descriptions.length !== 1 && "description count", !descriptions[0] && "empty description", canonicals.length !== 1 && "canonical count", canonicals[0] && new URL(canonicals[0]).href.replace(/\/$/, "") !== expected && "canonical target", headings.filter((n) => n === 1).length !== 1 && "H1 count", headings.some((n, i) => i > 0 && n > headings[i - 1] + 1) && "heading level skipped"].filter(Boolean) };
  })));
}
for (const field of ["title", "description"]) {
  const used = new Map();
  for (const row of results) {
    if (used.has(row[field])) row.issues.push(`duplicate ${field}: ${used.get(row[field])}`);
    used.set(row[field], row.path);
  }
}
await fs.mkdir("docs/seo", { recursive: true });
await fs.writeFile("docs/seo/public-seo-audit.json", JSON.stringify({ base, checked: results.length, passed: results.filter((row) => !row.issues.length).length, pages: results }, null, 2));
const report = "# Title, Meta Description và heading\n\nKiểm tra bản production local. URL canonical dùng domain production.\n\n" + results.map((row) => `## ${row.path}\n\n- Title: ${row.title}\n- Description: ${row.description}\n- Canonical: ${row.canonical}\n- H1: ${row.h1}; headings: ${row.headings.join(" → ")}\n- Kết quả: ${row.issues.length ? row.issues.join(", ") : "PASS"}\n`).join("\n");
await fs.writeFile("docs/seo/title-description-inventory.md", report);
const issues = results.filter((row) => row.issues.length);
console.log(JSON.stringify({ checked: results.length, passed: results.length - issues.length, issues }, null, 2));
if (issues.length) process.exitCode = 1;
