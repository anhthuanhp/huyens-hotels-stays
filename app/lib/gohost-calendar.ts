const DAY_MS = 86_400_000;
const vietnamDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
});

export const MAX_STAY_NIGHTS = 90;
export const MAX_REQUESTED_ROOMS = 30;

export type Stay = { start: string; end: string };
export type Calendar = Stay[];

export function validDate(value: string) {
  const time = Date.parse(value + "T00:00:00Z");
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === value;
}

export function todayInVietnam(now = new Date()) {
  return vietnamDate.format(now);
}

export function stayIsCovered(stay: Stay, coverageDays: number, today = todayInVietnam()) {
  if (!Number.isInteger(coverageDays) || coverageDays < 1 || coverageDays > MAX_STAY_NIGHTS ||
      !validDate(stay.start) || !validDate(stay.end) || stay.start < today || stay.end <= stay.start) return false;
  const end = new Date(Date.parse(today) + coverageDays * DAY_MS).toISOString().slice(0, 10);
  return stay.end <= end;
}

export function normalizeFeedUrl(value: string) {
  const match = /^https:\/\/platform\.gohost\.vn(?::443)?(\/pms\/app\/[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}\/calendar\/export\/[A-Za-z0-9_-]{1,256}\.ics)$/.exec(value);
  return match && match[0] === value ? "https://platform.gohost.vn" + match[1] : null;
}

function invalidCalendar(): never {
  throw new Error("invalid_calendar");
}

function eventDate(value: string, parameters: string) {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T([01]\d|2[0-3])([0-5]\d)([0-5]\d)(Z)?)?$/.exec(value);
  if (!match) invalidCalendar();
  const [, year, month, day, hour, minute, second, utc] = match;
  const date = year + "-" + month + "-" + day;
  if (!validDate(date)) invalidCalendar();
  const format = parameters.toUpperCase();
  if (!hour) {
    if (format && format !== ";VALUE=DATE") invalidCalendar();
    return date;
  }
  if (format && format !== ";VALUE=DATE-TIME" &&
      (utc || !/^;(?:VALUE=DATE-TIME;)?TZID=(?:"ASIA\/HO_CHI_MINH"|ASIA\/HO_CHI_MINH)(?:;VALUE=DATE-TIME)?$/.test(format))) invalidCalendar();
  return utc ? todayInVietnam(new Date(date + "T" + hour + ":" + minute + ":" + second + "Z")) : date;
}

export function parseCalendar(text: string): Calendar {
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n|\r/g, "\n")
    .replace(/\n[ \t]/g, "").trim().split("\n");
  if (lines[0]?.toUpperCase() !== "BEGIN:VCALENDAR" ||
      lines.at(-1)?.toUpperCase() !== "END:VCALENDAR") invalidCalendar();

  const events = new Map<string, Stay>();
  const components: string[] = ["VCALENDAR"];
  let event: Map<string, { value: string; parameters: string }> | undefined;
  const eventFields = new Set(["DTSTART", "DTEND", "STATUS", "RRULE", "RDATE", "EXRULE", "EXDATE", "RECURRENCE-ID", "DURATION"]);
  let version = false;
  for (const line of lines.slice(1, -1)) {
    if (!line) continue;
    const property = /^([A-Z0-9-]+)((?:;[^:]*)?):(.*)$/i.exec(line);
    if (!property) invalidCalendar();
    const [, rawKey, parameters, value] = property;
    const key = rawKey.toUpperCase();
    const parent = components.at(-1);
    if (key === "BEGIN") {
      const component = value.toUpperCase();
      if (parent === "VCALENDAR" && component === "VEVENT") event = new Map();
      else if (!(parent === "VCALENDAR" && component === "VTIMEZONE") &&
               !(parent === "VTIMEZONE" && ["STANDARD", "DAYLIGHT"].includes(component)) &&
               !(parent === "VEVENT" && component === "VALARM")) invalidCalendar();
      components.push(component);
      continue;
    }
    if (key === "END") {
      if (components.length === 1 || value.toUpperCase() !== parent) invalidCalendar();
      components.pop();
      if (parent !== "VEVENT" || !event) continue;
      if (event.get("STATUS")?.value.toUpperCase() !== "CANCELLED") {
        if (["RRULE", "RDATE", "EXRULE", "EXDATE", "RECURRENCE-ID", "DURATION"].some((name) => event!.has(name))) invalidCalendar();
        const start = event.get("DTSTART");
        const end = event.get("DTEND");
        if (!start || !end) invalidCalendar();
        const stay = { start: eventDate(start.value, start.parameters), end: eventDate(end.value, end.parameters) };
        if (stay.end <= stay.start) invalidCalendar();
        events.set(stay.start + "/" + stay.end, stay);
      } else if (event.has("RECURRENCE-ID")) {
        invalidCalendar();
      }
      event = undefined;
      continue;
    }
    if (parent === "VCALENDAR" && key === "VERSION") {
      if (version || value !== "2.0") invalidCalendar();
      version = true;
    }
    if (parent === "VEVENT" && event && eventFields.has(key)) {
      if (event.has(key)) invalidCalendar();
      event.set(key, { value, parameters });
    }
  }
  if (!version || components.length !== 1) invalidCalendar();
  return [...events.values()];
}

export function countFreeUnits(calendars: Calendar[], stay: Stay) {
  return calendars.filter((calendar) =>
    !calendar.some((busy) => busy.start < stay.end && stay.start < busy.end)
  ).length;
}
