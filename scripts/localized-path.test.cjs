const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const result = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("app/lib/localized-path.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: result.exports });
const { localizedHref, languageAlternates } = result.exports;
test("English navigation preserves booking query parameters and anchors", () => {
  assert.equal(localizedHref("/tim-phong?hotel=anh-kim-hotel&room=standard-double", "en"), "/en/tim-phong?hotel=anh-kim-hotel&room=standard-double");
  assert.equal(localizedHref("/#hotels", "en"), "/en/#hotels");
  assert.equal(localizedHref("/dat-phong?rooms=a%2Cb", "en"), "/en/dat-phong?rooms=a%2Cb");
});
test("Vietnamese, external URLs, APIs and already localized paths stay unchanged", () => {
  for (const path of ["https://example.com", "//example.com", "/api/bookings", "/admin", "/en/blog", "/icons/social/facebook.svg"]) assert.equal(localizedHref(path, "en"), path);
  assert.equal(localizedHref("/blog", "vi"), "/blog");
});
test("alternates point to distinct canonical pairs without translating slugs", () => {
  const result = languageAlternates("/khach-san/anh-kim-hotel/phong/deluxe%20double");
  assert.equal(result.languages.en, "https://huyenhotels.com/en/khach-san/anh-kim-hotel/phong/deluxe%20double");
  assert.equal(result.canonical, result.languages["vi-VN"]);
  assert.equal(result.languages["x-default"], result.canonical);
});
