const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const Module = require('node:module');
const ts = require('typescript');
const sharp = require('sharp');
const source = path.resolve('app/media/optimized/route.ts');
const mod = new Module(source, module);
mod.filename = source;
mod.paths = Module._nodeModulePaths(path.dirname(source));
mod._compile(ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, source);
const get = (src, w = 1920) => mod.exports.GET({ nextUrl: new URL('http://localhost/media/optimized?' + new URLSearchParams({ src, w: String(w) })) });
(async () => {
  assert.equal((await get('https://example.com/photo.jpg')).status, 400);
  assert.equal((await get('http://lltfkvpgzxybvzpqpjqk.supabase.co/storage/v1/object/public/a')).status, 400);
  assert.equal((await get('/images/../../../package.json')).status, 400);
  assert.equal((await get('/images/huyen-hotel-logo-v1.webp', 999999)).status, 400);
  const versioned = await get('/images/huyen-hotel-logo-v1.webp?v=2', 384);
  assert.equal(versioned.status, 200, 'local image query string must not become part of filename');
  const file = path.resolve('public/images/seo-budget-test.png');
  assert.equal(fs.existsSync(file), false);
  try {
    await sharp(crypto.randomBytes(1920 * 1280 * 3), { raw: { width: 1920, height: 1280, channels: 3 } }).png().toFile(file);
    for (const width of [384, 750, 1920]) {
      const response = await get('/images/seo-budget-test.png', width);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/webp');
      const data = Buffer.from(await response.arrayBuffer());
      assert.ok(data.length < 200000);
      assert.equal((await sharp(data).metadata()).format, 'webp');
      console.log(JSON.stringify({ width, bytes: data.length, format: 'webp' }));
    }
  } finally { fs.unlinkSync(file); }
  console.log('PASS: image budget, WebP encoding, width validation and source restrictions');
})().catch(error => { console.error(error); process.exitCode = 1; });
