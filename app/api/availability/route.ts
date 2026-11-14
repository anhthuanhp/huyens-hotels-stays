import { legacyRoomSlug } from "../../lib/room-seo-slugs";
import { countFreeUnits, MAX_REQUESTED_ROOMS, MAX_STAY_NIGHTS, stayIsCovered, todayInVietnam, validDate } from "../../lib/gohost-calendar";
import { getServerSupabase, loadCalendar, sourceConfiguration, sourceFields, type GoHostSource } from "../../lib/gohost-server";

const MAX_HOTELS = 5;
const MAX_ROOM_TYPES = 30;
const MAX_SOURCES = 48;

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function monthlyCheckout(start: string, months: number) {
  const date = new Date(start + "T00:00:00Z");
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months + 1, 0);
  date.setUTCDate(Math.min(day, date.getUTCDate()));
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "Dữ liệu không hợp lệ." }, 400);
    const hotels = Array.isArray(body.hotelSlugs) ? body.hotelSlugs : [body.hotelSlug];
    const roomSlug = body.roomSlug ?? "";
    const requestedRooms = body.requestedRooms ?? 1;
    if (!hotels.length || hotels.length > MAX_HOTELS ||
        hotels.some((slug: unknown) => typeof slug !== "string" || !slug.trim() || slug.length > 150) ||
        typeof roomSlug !== "string" || roomSlug.length > 150 || (roomSlug && hotels.length !== 1) ||
        !Number.isInteger(requestedRooms) || requestedRooms < 1 || requestedRooms > MAX_REQUESTED_ROOMS) {
      return reply({ error: "Khách sạn, loại phòng hoặc số phòng yêu cầu không hợp lệ." }, 400);
    }

    const today = todayInVietnam();
    const monthly = body.stayType === "month";
    const months = Number(body.months);
    if (monthly && (!Number.isInteger(months) || months < 1 || months > 60)) {
      return reply({ error: "Số tháng thuê không hợp lệ." }, 400);
    }
    const start = monthly ? today : body.checkIn;
    const end = monthly ? monthlyCheckout(today, months) : body.checkOut;
    if (typeof start !== "string" || typeof end !== "string" || !validDate(start) || !validDate(end) || end <= start) {
      return reply({ error: "Ngày nhận/trả phòng không hợp lệ." }, 400);
    }

    const db = getServerSupabase();
    const { data: hotelRows, error: hotelError } = await db.from("hotels").select("id,slug")
      .eq("status", "active").in("slug", hotels).limit(MAX_HOTELS);
    if (hotelError) return reply({ error: "Không thể kiểm tra khách sạn." }, 503);
    if (!hotelRows.length) return reply({ error: "Không tìm thấy khách sạn đang hoạt động." }, 404);
    const hotelSlugs = new Map(hotelRows.map((hotel) => [hotel.id, hotel.slug]));
    const roomQuery = db.from("rooms")
      .select("id,hotel_id,slug,name_vi,name_en,base_price_daily,base_price_monthly,quantity")
      .eq("status", "active").in("hotel_id", [...hotelSlugs.keys()]).order("id").limit(MAX_ROOM_TYPES + 1);
    if (roomSlug) roomQuery.eq("slug", legacyRoomSlug(hotelRows[0].slug, roomSlug));
    const { data: rooms, error: roomError } = await roomQuery;
    if (roomError) return reply({ error: "Không thể đọc danh sách loại phòng." }, 503);
    if (rooms.length > MAX_ROOM_TYPES) return reply({ error: "Hãy thu hẹp phạm vi tìm kiếm." }, 400);

    // The old 90-day snapshot was a processing window, not a GoHost export guarantee.
    // Set only after verifying the window on all published feeds.
    const coverageDays = Number(process.env.GOHOST_ICAL_VERIFIED_COVERAGE_DAYS);
    const covered = stayIsCovered({ start, end }, coverageDays, today);
    const withinSearchWindow = stayIsCovered({ start, end }, MAX_STAY_NIGHTS, today);
    const roomIds = rooms.map((room) => room.id);
    const sourceByRoom = new Map<number, GoHostSource[]>();
    const bookedByRoom = new Map<number, { total: number; changes: Map<string, number> }>();
    let completeReads = false;

    if (withinSearchWindow && roomIds.length) {
      const [sources, bookings] = await Promise.all([
        db.from("gohost_ical_sources").select(sourceFields).in("room_id", roomIds).limit(MAX_SOURCES + 1),
        db.from("booking_rooms")
          .select("room_id,quantity,bookings!inner(id,check_in,check_out)")
          .in("room_id", roomIds).in("bookings.hotel_id", [...hotelSlugs.keys()])
          .neq("bookings.status", "cancelled")
          .lt("bookings.check_in", end).gt("bookings.check_out", start).limit(501),
      ]);
      completeReads = !sources.error && !bookings.error &&
        sources.data.length <= MAX_SOURCES && bookings.data.length <= 500;
      if (completeReads) {
        for (const source of (sources.data ?? []) as GoHostSource[]) {
          const list = sourceByRoom.get(source.room_id) ?? [];
          list.push(source);
          sourceByRoom.set(source.room_id, list);
        }
        for (const booking of bookings.data ?? []) {
          const quantity = Number(booking.quantity);
          const detail = Array.isArray(booking.bookings) ? booking.bookings[0] : booking.bookings;
          if (!Number.isSafeInteger(quantity) || quantity < 1 || !detail ||
              !validDate(detail.check_in) || !validDate(detail.check_out) || detail.check_out <= detail.check_in) {
            completeReads = false;
            break;
          }
          const occupied = bookedByRoom.get(booking.room_id) ?? { total: 0, changes: new Map<string, number>() };
          occupied.total += quantity;
          occupied.changes.set(detail.check_in, (occupied.changes.get(detail.check_in) ?? 0) + quantity);
          occupied.changes.set(detail.check_out, (occupied.changes.get(detail.check_out) ?? 0) - quantity);
          bookedByRoom.set(booking.room_id, occupied);
        }
      }
    }

    const results = await Promise.all(rooms.map(async (room) => {
      const totalQuantity = room.quantity;
      const { active, complete } = sourceConfiguration(sourceByRoom.get(room.id) ?? [], totalQuantity);
      let availableQuantity: number | null = totalQuantity === 0 ? 0 : null;
      if (totalQuantity > 0 && completeReads && complete) {
        try {
          const calendars = await Promise.all(active.map((source) => loadCalendar(source)));
          const goHostFree = countFreeUnits(calendars, { start, end });
          const internal = bookedByRoom.get(room.id);
          if (goHostFree === 0) {
            availableQuantity = 0;
          } else if (covered && (!internal || goHostFree === totalQuantity)) {
            // Internal bookings have no feed UID or physical-unit assignment.
            // With overlapping occupancy in both systems, the same booking
            // may appear twice. Leave the result unverified in that case.
            let peak = 0;
            let concurrent = 0;
            if (internal) {
              for (const [, change] of [...internal.changes].sort(([a], [b]) => a.localeCompare(b))) {
                concurrent += change;
                peak = Math.max(peak, concurrent);
              }
            }
            const minimum = Math.max(0, goHostFree - (internal?.total ?? 0));
            const maximum = Math.min(goHostFree, Math.max(0, totalQuantity - peak));
            if (minimum === maximum) availableQuantity = minimum;
          }
        } catch {
          // Unreachable, stale, or unsupported feeds cannot establish availability.
        }
      }
      return {
        roomId: room.id,
        roomSlug: room.slug,
        hotelId: room.hotel_id,
        hotelSlug: hotelSlugs.get(room.hotel_id),
        nameVi: room.name_vi,
        nameEn: room.name_en,
        basePrice: Number(monthly ? room.base_price_monthly : room.base_price_daily) || 0,
        basePriceDaily: Number(room.base_price_daily) || 0,
        basePriceMonthly: Number(room.base_price_monthly) || 0,
        totalQuantity,
        bookedQuantity: availableQuantity === null ? null : totalQuantity - availableQuantity,
        availableQuantity,
        availabilityStatus: availableQuantity === null ? "unverified" : availableQuantity > 0 ? "available" : "sold_out",
      };
    }));

    return reply({ hotel: hotelRows.length === 1 ? hotelRows[0] : null, checkIn: start, checkOut: end, rooms: results });
  } catch {
    return reply({ error: "Không thể xác minh tình trạng phòng." }, 503);
  }
}
