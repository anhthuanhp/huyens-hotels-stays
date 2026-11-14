import "server-only";

import { createClient } from "@supabase/supabase-js";
import { normalizeFeedUrl, parseCalendar, type Calendar } from "./gohost-calendar";

export const sourceFields = "id,room_id,unit_code,feed_url,enabled,last_success_at,last_error";
export type GoHostSource = {
  id: number;
  room_id: number;
  unit_code: string;
  feed_url: string;
  enabled: boolean;
  last_success_at: string | null;
  last_error: string | null;
};

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("missing_server_config");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function sourceConfiguration(sources: GoHostSource[], quantity: number) {
  const active = sources.filter((source) => source.enabled);
  const urls = sources.map((source) => normalizeFeedUrl(source.feed_url));
  const codes = sources.map((source) => source.unit_code.trim().toUpperCase());
  const duplicate = new Set(urls.filter(Boolean)).size < urls.filter(Boolean).length ||
    new Set(codes).size !== codes.length;
  return {
    active,
    duplicate,
    complete: active.length === quantity && sources.length === quantity &&
      urls.every(Boolean) && codes.every(Boolean) && !duplicate,
  };
}

const MAX_BYTES = 512 * 1024;
const MAX_CONCURRENT = 6;
const MAX_PENDING = 48;
const CACHE_TTL = 30_000;
const MAX_CACHE_ENTRIES = 256;
const cache = new Map<string, { calendar: Calendar; expires: number }>();
const inFlight = new Map<string, Promise<Calendar>>();
const waiting: Array<() => void> = [];
let activeDownloads = 0;

async function fetchCalendar(url: string) {
  const response = await fetch(url, {
    redirect: "error",
    cache: "no-store",
    headers: { Accept: "text/calendar", "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok || !response.body || Number(response.headers.get("content-length")) > MAX_BYTES ||
      Number(response.headers.get("age")) > CACHE_TTL / 1000) {
    if (response.body) void response.body.cancel().catch(() => {});
    throw new Error("unavailable_calendar");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let length = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) throw new Error("calendar_too_large");
      text += decoder.decode(value, { stream: true });
    }
    return {
      calendar: parseCalendar(text + decoder.decode()),
      maxCacheMs: CACHE_TTL - (Number(response.headers.get("age")) || 0) * 1000,
    };
  } finally {
    void reader.cancel().catch(() => {});
  }
}

async function limitedDownload(url: string) {
  if (activeDownloads < MAX_CONCURRENT) {
    activeDownloads++;
  } else {
    if (waiting.length >= MAX_PENDING) throw new Error("too_many_calendars");
    await new Promise<void>((resolve, reject) => {
      const begin = () => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        waiting.splice(waiting.indexOf(begin), 1);
        reject(new Error("calendar_queue_timeout"));
      }, 5_000);
      waiting.push(begin);
    });
  }
  try {
    return await fetchCalendar(url);
  } finally {
    const next = waiting.shift();
    if (next) next();
    else activeDownloads--;
  }
}

export async function loadCalendar(source: GoHostSource, fresh = false) {
  const url = normalizeFeedUrl(source.feed_url);
  if (!url) throw new Error("invalid_url");
  const key = source.room_id + "/" + source.id + "/" + url;
  if (fresh) cache.delete(key);
  const pending = inFlight.get(key);
  if (pending) return pending;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.calendar;
  cache.delete(key);

  const download = limitedDownload(url).then(({ calendar, maxCacheMs }) => {
    if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value!);
    cache.set(key, { calendar, expires: Date.now() + Math.min(CACHE_TTL, maxCacheMs) });
    return calendar;
  }).finally(() => inFlight.delete(key));
  inFlight.set(key, download);
  return download;
}
