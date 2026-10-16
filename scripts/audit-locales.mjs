import assert from "node:assert/strict";
const base = process.argv[2] || "http://localhost:3105";
const site = "https://huyenhotels.com";
const decode = text => text.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'");
const get = async path => { const response = await fetch(base + path); assert.equal(response.status, 200, path); return response.text(); };
const sitemap = await get("/sitemap.xml");
const enPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(decode(m[1])).pathname).filter(p => p === "/en" || p.startsWith("/en/"));
assert.ok(enPaths.length >= 20, "English sitemap routes are missing");
for (const path of enPaths) {
  const en = await get(path);
  const viPath = path.replace(/^\/en/, "") || "/";
  const vi = await get(viPath);
  assert.match(en, /<html[^>]*lang="en"/, path + " document language");
  assert.equal([...en.matchAll(/<h1(?:\s|>)/g)].length, 1, path + " H1 count");
  assert.ok(en.includes('rel="canonical" href="' + site + path + '"'), path + " canonical");
  assert.ok(en.includes('hrefLang="vi-VN"') || en.includes('hreflang="vi-VN"'), path + " VI alternate");
  assert.ok(vi.includes('hrefLang="en" href="' + site + path + '"') || vi.includes('hreflang="en" href="' + site + path + '"'), viPath + " reciprocal EN alternate");
  assert.match(en, /<meta name="description" content="[^"]+"/, path + " description");
}
const guidePath = "/blog/nhung-dieu-nen-biet-khi-du-lich-ho-chi-minh-city";
for (const prefix of ["", "/en"]) {
  const guide = await get(prefix + guidePath);
  for (const slug of ["anh-kim-hotel", "ae-guesthouse", "huyen-house", "huyenhomestay"]) assert.ok(guide.includes('href="' + prefix + '/khach-san/' + slug + '"'), "Contextual hotel link missing: " + prefix + slug);
  assert.ok(guide.includes('href="' + prefix + '/tim-phong"'), "Localized booking link missing");
}
assert.ok(!(await get("/en/khach-san/anh-kim-hotel/phong/standard-double")).includes("Phòng này phù hợp"));
console.log(JSON.stringify({ englishPages: enPaths.length, reciprocalPairs: enPaths.length, guideHotelLinks: 8, result: "PASS" }, null, 2));
