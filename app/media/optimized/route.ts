import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
const LIMIT = 199_000;
const HOST = "lltfkvpgzxybvzpqpjqk.supabase.co";
const WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920];

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src") || "";
  const requestedWidth = Number(request.nextUrl.searchParams.get("w"));
  if (!WIDTHS.includes(requestedWidth)) return new Response("Invalid width", { status: 400 });
  try {
    let input: Buffer;
    if (src.startsWith("/images/") || src.startsWith("/icons/")) {
      const root = path.resolve(process.cwd(), "public");
      // Query strings version images; they are not part of the disk filename.
      const pathname = src.split(/[?#]/, 1)[0];
      const file = path.resolve(root, "." + decodeURIComponent(pathname));
      if (!file.startsWith(root + path.sep)) return new Response("Invalid path", { status: 400 });
      input = await readFile(file);
    } else {
      const url = new URL(src);
      if (url.protocol !== "https:" || url.hostname !== HOST || url.port || url.username || url.password || !url.pathname.startsWith("/storage/v1/object/public/")) {
        return new Response("Image source not allowed", { status: 400 });
      }
      const upstream = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15000), cache: "no-store" });
      if (!upstream.ok) return new Response("Image unavailable", { status: 502 });
      if (Number(upstream.headers.get("content-length")) > 20_000_000) return new Response("Image too large", { status: 413 });
      // Bound streamed input even when upstream has no Content-Length.
      const reader = upstream.body?.getReader();
      if (!reader) return new Response("Empty image", { status: 502 });
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 20_000_000) { await reader.cancel(); return new Response("Image too large", { status: 413 }); }
        chunks.push(value);
      }
      input = Buffer.concat(chunks);
    }
    let output: Buffer | undefined;
    for (const quality of [75, 60, 45, 30]) {
      output = await sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({ width: requestedWidth, withoutEnlargement: true }).webp({ quality }).toBuffer();
      if (output.length < LIMIT) break;
    }
    // No oversized response: reduce dimensions for unusually complex images.
    let width = requestedWidth;
    while (output && output.length >= LIMIT && width > 64) {
      width = Math.max(64, Math.floor(width * 0.75));
      output = await sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 45 }).toBuffer();
    }
    if (!output || output.length >= LIMIT) return new Response("Image cannot fit budget", { status: 422 });
    return new Response(new Uint8Array(output), { headers: {
      "Content-Type": "image/webp", "Content-Length": String(output.length),
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response("Image unavailable", { status: 502 });
  }
}
