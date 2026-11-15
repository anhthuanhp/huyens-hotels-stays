import "server-only";

import { createClient } from "@supabase/supabase-js";
import { normalizeFeedUrl, parseCalendar, type Calendar } from "./gohost-calendar";

export const sourceFields = "id,room_id,unit_code,feed_url,enabled,last_success_at,last_error,verified_from,verified_before,verified_blocked_dates";
export type GoHostSource = {
  id: number;
  room_id: number;
  unit_code: string;
  feed_url: string;
  enabled: boolean;
  last_success_at: string | null;
  last_error: string | null;
  verified_from: string | null;
  verified_before: string | null;
  verified_blocked_dates: string[];
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

export function calendarFailureReason(error: unknown) {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") return "feed_timeout";
    if (/^(invalid_calendar|invalid_url|calendar_too_large|too_many_calendars|calendar_queue_timeout|stale_calendar|missing_calendar_body|feed_http_[45][0-9]{2})$/.test(error.message)) {
      return error.message;
    }
  }
  return "feed_transport_or_encoding_error";
}

async function fetchCalendar(url: string) {
  const response = await fetch(url, {
    redirect: "error",
    cache: "no-store",
    headers: { Accept: "text/calendar", "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(5_000),
  });
  const age = Number(response.headers.get("age")) || 0;
  const responseDate = Date.parse(response.headers.get("date") ?? "");
  const apparentAgeMs = Math.max(age * 1000, Number.isFinite(responseDate) ? Date.now() - responseDate : 0);
  const responseProblem = !response.ok ? "feed_http_" + response.status
    : !response.body ? "missing_calendar_body"
    : Number(response.headers.get("content-length")) > MAX_BYTES ? "calendar_too_large"
    : apparentAgeMs >= CACHE_TTL ? "stale_calendar"
    : null;
  if (responseProblem || !response.body) {
    if (response.body) void response.body.cancel().catch(() => {});
    throw new Error(responseProblem ?? "missing_calendar_body");
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
      maxCacheMs: CACHE_TTL - apparentAgeMs,
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
