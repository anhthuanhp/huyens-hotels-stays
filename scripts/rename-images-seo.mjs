import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { createClient } from "@supabase/supabase-js";
import { buildSeoImageName, slugifyImageName } from "../app/lib/image-seo.ts";

loadEnvConfig(process.cwd());
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (new URL(projectUrl).hostname !== "lltfkvpgzxybvzpqpjqk.supabase.co") throw new Error("Unexpected Supabase project");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!key) throw new Error("Server-side Supabase key required");
const client = createClient(projectUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
const planFile = "docs/seo/image-rename-plan.json";
const progressFile = "docs/seo/image-rename-progress.json";
const selections = {
  media: "id,bucket,path,file_name,public_url,entity_type,entity_id,alt_vi,alt_en,is_cover,sort_order,status",
  hotels: "id,slug,name_vi,name_en,image",
  rooms: "id,hotel_id,slug,name_vi,name_en,image",
  activities: "id,title_vi,title_en,hotel_id",
  hero_slides: "id,position,title_vi,title_en,image_url,storage_path",
  homepage_hero: "id,position,title_vi,title_en,image_url,storage_path",
  blog_posts: "id,slug,title_vi,title_en,image",
  hotel_nearby_places: "id,hotel_id,name_vi,name_en,image",
};
function parseStorage(url) {
  if (!url || !url.startsWith(projectUrl + "/storage/v1/object/public/")) return null;
  const rest = decodeURIComponent(new URL(url).pathname.split("/storage/v1/object/public/")[1]);
  const slash = rest.indexOf("/");
  return { bucket: rest.slice(0, slash), path: rest.slice(slash + 1) };
}
async function verifyUrl(url) {
  const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(20000) });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`Image inaccessible: ${url} (${response.status})`);
  return { bytes: response.headers.get("content-length"), mime: response.headers.get("content-type") };
}
async function readSnapshot() {
  const rows = await Promise.all(Object.entries(selections).map(async ([table, columns]) => {
    const { data, error } = await client.from(table).select(columns).order("id").limit(1000);
    if (error) throw new Error(`${table}: ${error.message}`);
    if (data.length === 1000) throw new Error("Pagination required before proceeding");
    return [table, data];
  }));
  return Object.fromEntries(rows);
}
async function makePlan() {
  const snapshot = await readSnapshot();
  const hotels = new Map(snapshot.hotels.map((h) => [h.id, h]));
  const rooms = new Map(snapshot.rooms.map((r) => [r.id, r]));
  const activities = new Map(snapshot.activities.map((a) => [a.id, a]));
  const copies = [], patches = [], urlMap = new Map();
  function addImage(url, folder, parts, id, originalName) {
    const source = parseStorage(url);
    if (!source) return null;
    if (urlMap.has(url)) return urlMap.get(url);
    const name = buildSeoImageName(parts, originalName || source.path.split("/").pop(), id);
    const path = folder + "/" + name;
    const newUrl = client.storage.from(source.bucket).getPublicUrl(path).data.publicUrl;
    const copy = { ...source, oldUrl: url, newPath: path, newUrl, name };
    copies.push(copy); urlMap.set(url, copy); return copy;
  }
  const sequence = new Map();
  for (const m of snapshot.media) {
    const room = m.entity_type === "room" ? rooms.get(m.entity_id) : null;
    const hotel = hotels.get(room?.hotel_id || (m.entity_type === "hotel" ? m.entity_id : null));
    const activity = m.entity_type === "experience" ? activities.get(m.entity_id) : null;
    if (!hotel && !activity) throw new Error(`Unknown image entity: ${m.id}`);
    const group = m.entity_type + ":" + m.entity_id;
    const number = (sequence.get(group) || 0) + 1; sequence.set(group, number);
    const labelVi = room?.name_vi || hotel?.name_vi || activity?.title_vi;
    const labelEn = room?.name_en || hotel?.name_en || activity?.title_en || labelVi;
    const parts = [hotel?.slug || "huyens-hotels-stays", room?.name_vi || room?.name_en || (activity ? activity.title_vi : "khach-san"), m.is_cover ? "anh-dai-dien" : "anh", String(number).padStart(2, "0")];
    const folder = room ? `rooms/${slugifyImageName(hotel.slug)}/${slugifyImageName(room.slug)}` : hotel ? `hotels/${slugifyImageName(hotel.slug)}` : `activities/${activity.id}-${slugifyImageName(activity.title_vi)}`;
    const copy = addImage(m.public_url, folder, parts, "m" + m.id, m.path);
    if (!copy) throw new Error(`Media URL not in this project: ${m.id}`);
    if (parseStorage(m.public_url).path !== m.path || copy.bucket !== m.bucket) throw new Error(`Media path/URL mismatch: ${m.id}`);
    const next = { path: copy.newPath, file_name: copy.name, public_url: copy.newUrl };
    if (!m.alt_vi?.trim()) next.alt_vi = `${labelVi}${room ? " tại " + hotel.name_vi : ""} – ảnh ${String(number).padStart(2, "0")}`;
    if (!m.alt_en?.trim()) next.alt_en = `${labelEn}${room ? " at " + hotel.name_en : ""} – photo ${String(number).padStart(2, "0")}`;
    patches.push({ table: "media", id: m.id, guard: { public_url: m.public_url }, before: Object.fromEntries(Object.keys(next).map((k) => [k, m[k]])), next });
  }
  for (const table of ["hero_slides", "homepage_hero"]) for (const row of snapshot[table]) {
    const copy = addImage(row.image_url, "hero", ["huyens-hotels-stays", row.title_vi || row.title_en || "khach-san-tp-hcm", "hero", String(row.position)], table + "-" + row.id);
    if (copy) patches.push({ table, id: row.id, guard: { image_url: row.image_url }, before: { image_url: row.image_url, storage_path: row.storage_path }, next: { image_url: copy.newUrl, storage_path: copy.newPath } });
  }
  for (const row of snapshot.blog_posts) {
    const copy = addImage(row.image, "blog", [row.slug, "anh-bai-viet"], "b" + row.id);
    if (copy) patches.push({ table: "blog_posts", id: row.id, guard: { image: row.image }, before: { image: row.image }, next: { image: copy.newUrl } });
  }
  for (const row of snapshot.hotel_nearby_places) {
    const copy = addImage(row.image, "nearby", [hotels.get(row.hotel_id)?.slug || "huyens-hotels-stays", row.name_vi || row.name_en], "p" + row.id);
    if (copy) patches.push({ table: "hotel_nearby_places", id: row.id, guard: { image: row.image }, before: { image: row.image }, next: { image: copy.newUrl } });
  }
  for (const table of ["hotels", "rooms"]) for (const row of snapshot[table]) {
    const type = table === "hotels" ? "hotel" : "room";
    const cover = snapshot.media.filter((m) => m.entity_type === type && m.entity_id === row.id && m.status === "active").sort((a,b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order || a.id - b.id)[0];
    const mapped = urlMap.get(row.image);
    const nextUrl = mapped?.newUrl || (cover && urlMap.get(cover.public_url)?.newUrl);
    if (nextUrl && nextUrl !== row.image) patches.push({ table, id: row.id, guard: { image: row.image }, before: { image: row.image }, next: { image: nextUrl } });
  }
  if (new Set(copies.map((c) => c.bucket + ":" + c.newPath)).size !== copies.length) throw new Error("Destination collision");
  for (const copy of copies) copy.source = await verifyUrl(copy.oldUrl);
  const plan = { projectUrl, createdAt: new Date().toISOString(), snapshot, copies, patches };
  await fs.mkdir("docs/seo", { recursive: true });
  await fs.writeFile(planFile, JSON.stringify(plan, null, 2));
  console.log(JSON.stringify({ mode: "plan", images: copies.length, rows: patches.length, media: snapshot.media.length, examples: copies.slice(0,3).map((c)=>({old:c.path,new:c.newPath})) }));
}
async function applyPlan() {
  const plan = JSON.parse(await fs.readFile(planFile, "utf8"));
  if (plan.projectUrl !== projectUrl) throw new Error("Plan project mismatch");
  const progress = { copied: [], patched: [], failed: [] };
  const save = () => fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
  // Prepare and verify every new object before changing any database references.
  for (const copy of plan.copies) {
    const folder = copy.newPath.slice(0, copy.newPath.lastIndexOf("/"));
    const listing = await client.storage.from(copy.bucket).list(folder, { search: copy.name, limit: 100 });
    if (listing.error) throw listing.error;
    if (!listing.data.some((file) => file.name === copy.name)) { const result = await client.storage.from(copy.bucket).copy(copy.path, copy.newPath); if (result.error) throw result.error; }
    const verified = await verifyUrl(copy.newUrl);
    if (copy.source.bytes && verified.bytes && copy.source.bytes !== verified.bytes) throw new Error("Copy size differs: " + copy.newPath);
    progress.copied.push(copy.newUrl); await save();
    if (progress.copied.length % 20 === 0) console.log("Copied " + progress.copied.length + "/" + plan.copies.length);
  }
  for (const patch of plan.patches) {
    let query = client.from(patch.table).update(patch.next).eq("id", patch.id);
    for (const [field,value] of Object.entries(patch.guard)) query = value === null ? query.is(field, null) : query.eq(field,value);
    const result = await query.select("id");
    if (!result.error && result.data.length === 0) {
      const current = await client.from(patch.table).select(Object.keys(patch.next).join(",")).eq("id", patch.id).maybeSingle();
      if (!current.error && current.data && Object.entries(patch.next).every(([field, value]) => current.data[field] === value)) {
        progress.patched.push({ table: patch.table, id: patch.id }); await save(); continue;
      }
    }
    if (result.error || result.data.length !== 1) { progress.failed.push({ table:patch.table,id:patch.id,error:result.error?.message||"Reference changed concurrently" }); await save(); continue; }
    progress.patched.push({table:patch.table,id:patch.id}); await save();
  }
  if (progress.failed.length) throw new Error("Some references were not updated; see progress report");
  const after = await readSnapshot();
  for (const patch of plan.patches) {
    const row = after[patch.table].find((r)=>r.id===patch.id);
    for (const [field,value] of Object.entries(patch.next)) if (row[field] !== value) throw new Error("Verification failed: " + patch.table + ":" + patch.id + ":" + field);
  }
  for (const copy of plan.copies) { await verifyUrl(copy.oldUrl); await verifyUrl(copy.newUrl); }
  const digest = createHash("sha256").update(JSON.stringify(plan)).digest("hex");
  await fs.writeFile("docs/seo/image-rename-result.json", JSON.stringify({images:plan.copies.length,rows:plan.patches.length,verified:true,oldUrlsRetained:true,planSha256:digest,finishedAt:new Date().toISOString()},null,2));
  console.log(JSON.stringify({ mode:"applied", images:plan.copies.length, rows:plan.patches.length, verified:true, oldUrlsRetained:true }));
}
if (process.argv.includes("--apply")) await applyPlan(); else await makePlan();
