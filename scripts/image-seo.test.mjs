import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSeoImageName, slugifyImageName } from "../app/lib/image-seo.ts";

test("Vietnamese names become readable ASCII slugs", () => {
  assert.equal(slugifyImageName("Phòng đôi có ban công – Đỗ Quang Đẩu"), "phong-doi-co-ban-cong-do-quang-dau");
});
test("room context replaces a camera filename", () => {
  assert.equal(buildSeoImageName(["Anh Kim Hotel", "Phòng Family with City View", "ảnh", "01"], "_HKT5645_23_11zon.WEBP", "m88"), "anh-kim-hotel-phong-family-with-city-view-anh-01-m88.webp");
});
test("a unique suffix avoids overwriting another photo", () => {
  assert.notEqual(buildSeoImageName(["Anh Kim Hotel"], "DSC_1.jpg", "m1"), buildSeoImageName(["Anh Kim Hotel"], "DSC_1.jpg", "m2"));
});
test("JPEG/JFIF use the standard jpg suffix", () => {
  assert.equal(buildSeoImageName(["Khách sạn"], "photo.jfif", "p1"), "khach-san-p1.jpg");
});
test("names cannot introduce storage path traversal", () => {
  assert.equal(buildSeoImageName(["../Đôi/ban công"], "photo.png", "../m1"), "doi-ban-cong-m1.png");
});
test("unsupported extensions and empty unique keys fail before upload", () => {
  assert.throws(() => buildSeoImageName(["Hotel"], "photo.exe", "p1"));
  assert.throws(() => buildSeoImageName(["Hotel"], "photo.webp", ""));
});
