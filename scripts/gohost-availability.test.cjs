const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { createRequire } = require("node:module");
const { resolve } = require("node:path");
const ts = require("typescript");

// Load the real route modules with synthetic Supabase/GoHost responses.
function load(path, dependencies = {}, globals = {}) {
  const filename = resolve(path);
  const realRequire = createRequire(filename);
  const mod = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  new Function("require", "module", "exports", ...Object.keys(globals), outputText)(
    (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : realRequire(name),
    mod, mod.exports, ...Object.values(globals),
  );
  return mod.exports;
}

const calendar = load("app/lib/gohost-calendar.ts");
const roomSlugs = load("app/lib/room-seo-slugs.ts");
const path = "/pms/app/01234567-0000-0000-0000-000000000000/calendar/export/";
const feedUrl = "https://platform.gohost.vn" + path + "synthetic.ics";
const ical = (...events) => ["BEGIN:VCALENDAR", "VERSION:2.0", ...events, "END:VCALENDAR"].join("\r\n");
const busy = (start, end, extra = "") => ["BEGIN:VEVENT", "DTSTART;VALUE=DATE:" + start,
  "DTEND;VALUE=DATE:" + end, extra, "END:VEVENT"].filter(Boolean).join("\r\n");
const stay = { start: "2026-11-16", end: "2026-11-19" };
const source = (id, roomId = 11) => ({
  id, room_id: roomId, unit_code: String(200 + id), feed_url: feedUrl.replace("synthetic", "unit-" + id),
  enabled: true, last_success_at: null, last_error: null,
});

test("counts physical units for the entire stay, including checkout boundaries", () => {
  const first = calendar.parseCalendar(ical(busy("20261117", "20261118")));
  const second = calendar.parseCalendar(ical(busy("20261116", "20261117"), busy("20261118", "20261119")));
  assert.equal(calendar.countFreeUnits([first, second], stay), 0);
  assert.equal(calendar.countFreeUnits([first, second], { start: "2026-11-17", end: "2026-11-18" }), 1);
  assert.equal(calendar.countFreeUnits([first], { start: "2026-11-18", end: "2026-11-19" }), 1);
  assert.equal(calendar.countFreeUnits([first], { start: "2026-11-16", end: "2026-11-17" }), 1);
});

test("parses empty calendars, ignores cancelled events and deduplicates busy ranges", () => {
  const event = busy("20261117", "20261118");
  assert.deepEqual(calendar.parseCalendar(ical()), []);
  assert.deepEqual(calendar.parseCalendar(ical(busy("20261116", "20261119", "STATUS:CANCELLED"))), []);
  assert.equal(calendar.parseCalendar(ical(event, event)).length, 1);
  assert.equal(calendar.countFreeUnits([calendar.parseCalendar(ical(event, event, busy("20261116", "20261118")))], stay), 0);
});

test("rejects broken structure, invalid dates, reversed stays and unsupported recurrences", () => {
  for (const text of [ical().replace("END:VCALENDAR", ""), "<html/>", ical(busy("20261131", "20261201")),
    ical(busy("20261118", "20261117")), ical(busy("20261117", "20261118", "RRULE:FREQ=DAILY")),
    ical("BEGIN:VEVENT\r\nDTSTART:20261116")]) {
    assert.throws(() => calendar.parseCalendar(text), /invalid_calendar/);
  }
  const utc = "BEGIN:VEVENT\r\nDTSTART:20261116T180000Z\r\nDTEND:20261117T180000Z\r\nEND:VEVENT";
  assert.deepEqual(calendar.parseCalendar(ical(utc)), [{ start: "2026-11-17", end: "2026-11-18" }]);
});

test("allows only the exact GoHost HTTPS export path", () => {
  assert.equal(calendar.normalizeFeedUrl(feedUrl.replace(".vn/", ".vn:443/")), feedUrl);
  for (const invalid of [feedUrl.replace("https:", "http:"), feedUrl + "?secret=value", feedUrl + "#fragment",
    feedUrl.replace(".vn/", ".vn.example.com/"), feedUrl.replace(".vn/", ".vn:444/"),
    feedUrl.replace("//", "//user:pass@"), feedUrl.replace("/export/", "/export/%2e%2e/"),
    feedUrl.replace("/export/", "/other/"), feedUrl + "\n"]) {
    assert.equal(calendar.normalizeFeedUrl(invalid), null);
  }
});

function server(fetchImpl, db) {
  return load("app/lib/gohost-server.ts", {
    "./gohost-calendar": calendar, "server-only": {}, "@supabase/supabase-js": { createClient: () => db },
  }, { fetch: fetchImpl, process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://mock.invalid", SUPABASE_SECRET_KEY: "mock-secret" } } });
}

test("coalesces simultaneous downloads, uses short cache and separates source identities", async () => {
  let calls = 0;
  const client = server(async (_, options) => {
    calls++;
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    return new Response(ical());
  });
  await Promise.all([client.loadCalendar(source(1)), client.loadCalendar(source(1))]);
  await client.loadCalendar(source(1));
  assert.equal(calls, 1);
  await client.loadCalendar(source(1, 12));
  await client.loadCalendar(source(1), true);
  assert.equal(calls, 3);
});

test("rejects redirects, oversized/stale feeds and timeouts without caching failures", async () => {
  const replies = [
    () => Response.redirect("https://example.invalid"),
    () => new Response("x".repeat(512 * 1024 + 1)),
    () => new Response(ical(), { headers: { age: "31" } }),
    () => { throw new DOMException("timed out", "TimeoutError"); },
    () => new Response(ical()),
  ];
  const client = server(async () => replies.shift()());
  for (let i = 0; i < 4; i++) await assert.rejects(client.loadCalendar(source(1)));
  assert.deepEqual(await client.loadCalendar(source(1)), []);
});

function database(rows) {
  const requests = [];
  const db = { from(table) {
    const request = { table, filters: [], op: "read" };
    requests.push(request);
    const query = {
      select() { return query; }, order() { return query; }, limit() { return query; },
      eq(key, value) { request.filters.push(["eq", key, value]); return query; },
      neq(key, value) { request.filters.push(["neq", key, value]); return query; },
      in(key, value) { request.filters.push(["in", key, value]); return query; },
      lt(key, value) { request.filters.push(["lt", key, value]); return query; },
      gt(key, value) { request.filters.push(["gt", key, value]); return query; },
      update(value) { request.op = "update"; request.value = value; return query; },
      insert(value) { request.op = "insert"; request.value = value; return query; },
      delete() { request.op = "delete"; return query; },
      maybeSingle() { return Promise.resolve({ data: rows(request)[0] ?? null, error: null }); },
      then(resolve) { return Promise.resolve({ data: rows(request), error: null }).then(resolve); },
    };
    return query;
  } };
  return { db, requests };
}

const room = { id: 11, hotel_id: 2, slug: "balcony", quantity: 2 };
function availability({ sources = [source(1), source(2)], coverage = "90", fetchImpl, bookings = [] } = {}) {
  const { db, requests } = database((q) => ({
    hotels: [{ id: 2, slug: "ae-guesthouse" }],
    rooms: [room],
    gohost_ical_sources: sources,
    booking_rooms: bookings,
  })[q.table]);
  const client = server(fetchImpl ?? (async () => new Response(ical())), db);
  const route = load("app/api/availability/route.ts", {
    "../../lib/room-seo-slugs": roomSlugs,
    "../../lib/gohost-calendar": { ...calendar, todayInVietnam: () => "2026-11-13" },
    "../../lib/gohost-server": client,
  }, { process: { env: { GOHOST_ICAL_VERIFIED_COVERAGE_DAYS: coverage } } });
  function search(extra = {}) {
    return route.POST(new Request("http://localhost/api/availability", {
      method: "POST", body: JSON.stringify({ hotelSlug: "ae-guesthouse", roomSlug: "balcony",
        checkIn: stay.start, checkOut: stay.end, ...extra }),
    }));
  }
  return { search, requests };
}

test("public API scopes sources by hotel/room and subtracts overlapping internal bookings", async () => {
  const { search, requests } = availability({ bookings: [{ room_id: 11, quantity: 1,
    bookings: { check_in: stay.start, check_out: stay.end } }] });
  const response = await search();
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.rooms[0].availableQuantity, 1);
  assert.equal(result.rooms[0].availabilityStatus, "available");
  assert.doesNotMatch(JSON.stringify(result), /mock-secret|platform\.gohost|unit_code|feed_url/);
  assert.deepEqual(requests.find((q) => q.table === "hotels").filters.at(-1), ["in", "slug", ["ae-guesthouse"]]);
  assert.deepEqual(requests.find((q) => q.table === "rooms").filters.at(-1), ["eq", "slug", "balcony"]);
  assert.deepEqual(requests.find((q) => q.table === "gohost_ical_sources").filters[0], ["in", "room_id", [11]]);
  assert.deepEqual(requests.find((q) => q.table === "booking_rooms").filters.slice(-2),
    [["lt", "bookings.check_in", stay.end], ["gt", "bookings.check_out", stay.start]]);
});

test("does not double-count internal bookings that may already be in GoHost", async () => {
  const booking = (start, end) => ({ room_id: 11, quantity: 1, bookings: { check_in: start, check_out: end } });
  const firstBusy = async (url) => new Response(url === source(1).feed_url
    ? ical(busy("20261116", "20261119")) : ical());
  const potentiallyDuplicated = availability({ fetchImpl: firstBusy, bookings: [booking(stay.start, stay.end)] });
  const fragmentedInternal = availability({ bookings: [
    booking("2026-11-16", "2026-11-17"), booking("2026-11-17", "2026-11-18"),
  ] });
  const bothSystemsShowOccupancy = availability({ fetchImpl: firstBusy, bookings: [
    { ...booking(stay.start, stay.end), quantity: 2 },
  ] });
  for (const input of [potentiallyDuplicated, fragmentedInternal, bothSystemsShowOccupancy]) {
    const { rooms: [result] } = await (await input.search()).json();
    assert.equal(result.availabilityStatus, "unverified");
    assert.equal(result.availableQuantity, null);
  }
});

test("public API distinguishes sold out from unverified and bounds searches", async () => {
  const allBusy = async () => new Response(ical(busy("20261116", "20261119")));
  const cases = [
    [{ fetchImpl: allBusy }, {}, "sold_out", 0],
    [{ sources: [source(1)] }, {}, "unverified", null],
    [{ sources: [source(1), { ...source(2), enabled: false }] }, {}, "unverified", null],
    [{ fetchImpl: async () => { throw new DOMException("timed out", "TimeoutError"); } }, {}, "unverified", null],
    [{ fetchImpl: async () => new Response("not calendar") }, {}, "unverified", null],
    [{ coverage: "" }, {}, "unverified", null],
    [{}, { checkOut: "2027-12-31" }, "unverified", null],
  ];
  for (const [options, input, status, count] of cases) {
    const response = await availability(options).search(input);
    const { rooms: [result] } = await response.json();
    assert.equal(result.availabilityStatus, status);
    assert.equal(result.availableQuantity, count);
  }
  assert.equal((await availability().search({ requestedRooms: 31 })).status, 400);
});

test("Admin API rejects unauthorized sessions, bad URLs and duplicates, and scopes writes by room", async () => {
  const { db, requests } = database((q) => {
    if (q.table === "rooms") return [room];
    if (q.op !== "read") return [{ id: 1 }];
    if (q.filters.some(([op]) => op === "in")) {
      return q.filters[0][2].includes(feedUrl) ? [{ id: 42 }] : [];
    }
    return [source(1)];
  });
  const client = server(async () => new Response(ical()), db);
  const route = load("app/api/admin/gohost-sources/route.ts", {
    "../../../lib/supabase": { supabase: { auth: { async getUser(token) {
      return { data: { user: token === "invalid" ? null : { app_metadata: { role: token } } } };
    } } } },
    "../../../lib/gohost-calendar": calendar,
    "../../../lib/gohost-server": client,
  });
  function admin(method = "GET", token = "admin", payload, suffix = "") {
    return route[method](new Request("http://localhost/api/admin/gohost-sources?roomId=11" + suffix, {
      method, headers: token ? { authorization: "Bearer " + token } : {},
      body: payload ? JSON.stringify(payload) : undefined,
    }));
  }
  assert.equal((await admin("GET", "")).status, 401);
  assert.equal((await admin("GET", "invalid")).status, 401);
  assert.equal((await admin("GET", "member")).status, 403);
  assert.equal(requests.length, 0);
  assert.equal((await (await admin()).json()).complete, false);
  assert.equal((await admin("POST", "admin", { ...source(3), feed_url: feedUrl + "?" })).status, 400);
  assert.equal((await admin("POST", "admin", { ...source(3), unit_code: source(1).unit_code })).status, 409);
  assert.equal((await admin("POST", "admin", { ...source(3), feed_url: feedUrl })).status, 409);
  assert.equal((await admin("POST", "admin", { ...source(3), room_id: 999 })).status, 201);
  assert.equal(requests.at(-1).value.room_id, 11);
  assert.equal((await admin("PATCH", "admin", { ...source(1), unit_code: "301", enabled: false }, "&sourceId=1")).status, 200);
  assert.equal(requests.at(-1).value.enabled, false);
  assert.ok(requests.at(-1).filters.some(([op, key, value]) => op === "eq" && key === "room_id" && value === 11));
  assert.equal((await admin("PATCH", "admin", source(1), "&sourceId=999")).status, 404);
  assert.equal((await admin("DELETE", "admin", {}, "&sourceId=1")).status, 400);
  assert.equal((await admin("DELETE", "admin", { confirm: true }, "&sourceId=1")).status, 200);
  assert.equal((await (await admin("POST", "admin", { action: "test" }, "&sourceId=1")).json()).ok, true);
});

test("Admin panel renders its create-room instruction and existing-room controls", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const list = { quantity: 2, active: 1, duplicate: false, complete: false, sources: [source(1)] };
  const adminPanel = (dependencies) => load("app/admin/(dashboard)/phong/GoHostSources.tsx", {
    "../../../lib/supabase": { supabase: {} },
    ...dependencies,
  }).default;
  const newRoom = renderToStaticMarkup(React.createElement(adminPanel({}), { quantity: 2 }));
  assert.match(newRoom, /Lưu loại phòng trước/);
  const existingRoom = renderToStaticMarkup(React.createElement(adminPanel({
    react: { ...React, useState: (initial) => React.useState(initial === undefined ? list : initial) },
  }), { roomId: 11, quantity: 2 }));
  assert.match(existingRoom, /Đã khai báo 1\/2/);
  assert.match(existingRoom, /Kiểm tra kết nối/);
  assert.match(existingRoom, /Thêm phòng vật lý/);
  assert.doesNotMatch(existingRoom, /platform\.gohost/);
});
