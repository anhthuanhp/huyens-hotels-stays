import { createClient } from "@supabase/supabase-js";

type Language = "vi" | "en";

type DbHotel = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
  nearby_vi?: string | null;
  nearby_en?: string | null;
  description_vi?: string | null;
  description_en?: string | null;
  business_model?: string | null;
  status?: string | null;
};

type DbRoom = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  max_guests: number | null;
  base_price_daily?: number | null;
  base_price_monthly?: number | null;
  base_price?: number | null;
  quantity: number | null;
  status?: string | null;
};

type DbBookingRoom = {
  room_id: number | string | null;
  quantity: number | string | null;
};

type DbBooking = {
  id: number | string;
  hotel_id: number | string;
  stay_type?: string | null;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
  booking_rooms: DbBookingRoom[] | null;
};

export type AiBookingStayType = "day" | "month";

export type AiBookingRoom = {
  roomSlug: string;
  quantity: number;
};

export type AiRoomOption = {
  roomId: number;
  roomSlug: string;
  nameVi: string;
  nameEn: string;
  maxGuests: number | null;
  availableQuantity: number;
  pricePerUnit: number | null;
  estimatedTotal: number | null;
};

export type AiBookingDraft = {
  stayType: AiBookingStayType;
  hotelSlug: string | null;
  hotelNameVi: string | null;
  hotelNameEn: string | null;
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
  months: number;
  adults: number;
  children: number;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  rooms: AiBookingRoom[];
  confirmed: boolean;
};

export type AiBookingResult = {
  success: boolean;
  bookingCode?: string;
  bookingId?: number;
  totalAmount?: number;
  error?: string;
  booking?: unknown;
};

export type AiBookingAction =
  | "collecting"
  | "show_rooms"
  | "confirm_booking"
  | "booking_created"
  | "changed"
  | "cancelled"
  | "none";

export type AiAvailabilityResult = {
  availableRooms: AiRoomOption[];
  hotel: DbHotel;
};

export type AiBookingRequest = {
  message: string;
  language: Language;
  hotelSlug?: string | null;
  selectedRoomSlug?: string | null;
  bookingDraft?: Partial<AiBookingDraft> | null;
};

export type AiBookingResponse = {
  handled: boolean;
  answer: string;
  bookingDraft: AiBookingDraft | null;
  availableRooms: AiRoomOption[];
  bookingResult: AiBookingResult | null;
  action: AiBookingAction;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/* =========================================================
   TEXT
========================================================= */

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInt(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

/*
 * Luôn lấy ngày theo múi giờ Việt Nam.
 * Không dùng toISOString() vì có thể lệch ngày khi server chạy UTC.
 */
function getTodayVietnam(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (year && month && day) {
    return `${year}-${month}-${day}`;
  }

  return formatDate(new Date());
}

function dateDiffNights(
  checkIn: string | null,
  checkOut: string | null
): number {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) return 0;

  return Math.round(diff / 86400000);
}

/* =========================================================
   DATE PARSER
   Hỗ trợ:
   - hôm nay
   - ngày mai / mai
   - ngày kia / mốt
   - 05/10
   - 05/10/2026
   - 5-10
   - 2026-10-05
   - ngày 5 tháng 10
   - 5 tháng 10
   - "từ mai đến 05/10"
   - "mai nhận, thuê 1 ngày"
   - "ở 2 đêm"
   - "thuê 3 ngày"
========================================================= */

type ParsedDate = {
  value: string;
  index: number;
  length: number;
  explicitYear: boolean;
};

function validDate(
  year: number,
  month: number,
  day: number
): string | null {
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function inferYear(month: number, today: string): number {
  const todayYear = Number(today.slice(0, 4));
  const todayMonth = Number(today.slice(5, 7));
  return month < todayMonth ? todayYear + 1 : todayYear;
}

function parseNumericDates(text: string): ParsedDate[] {
  const result: ParsedDate[] = [];

  const isoRegex = /\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/g;
  for (const match of text.matchAll(isoRegex)) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const value = validDate(year, month, day);

    if (value && match.index !== undefined) {
      result.push({
        value,
        index: match.index,
        length: match[0].length,
        explicitYear: true,
      });
    }
  }

  const slashRegex = /\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](20\d{2}))?\b/g;
  const today = getTodayVietnam();

  for (const match of text.matchAll(slashRegex)) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const explicitYear = Boolean(match[3]);
    const year = explicitYear
      ? Number(match[3])
      : inferYear(month, today);

    const value = validDate(year, month, day);

    if (value && match.index !== undefined) {
      result.push({
        value,
        index: match.index,
        length: match[0].length,
        explicitYear,
      });
    }
  }

  const monthNameRegex =
    /\b(?:ngày\s*)?(\d{1,2})\s*(?:tháng|thang)\s*(\d{1,2})(?:\s*(?:năm|nam)\s*(20\d{2}))?\b/gi;

  for (const match of text.matchAll(monthNameRegex)) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const explicitYear = Boolean(match[3]);
    const year = explicitYear
      ? Number(match[3])
      : inferYear(month, today);

    const value = validDate(year, month, day);

    if (value && match.index !== undefined) {
      result.push({
        value,
        index: match.index,
        length: match[0].length,
        explicitYear,
      });
    }
  }

  return result
    .sort((a, b) => a.index - b.index)
    .filter(
      (item, index, array) =>
        index === 0 || item.value !== array[index - 1].value
    );
}

function parseRelativeDates(text: string): ParsedDate[] {
  const normalized = normalizeText(text);
  const today = getTodayVietnam();

  const result: ParsedDate[] = [];

  const addRelative = (
    value: string,
    aliases: string[],
    days: number
  ) => {
    const index = aliases
      .map((alias) => normalized.indexOf(alias))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0];

    if (index !== undefined) {
      result.push({
        value: addDays(today, days),
        index,
        length: aliases[0].length,
        explicitYear: false,
      });
    }
  };

  addRelative("today", ["hom nay", "hôm nay"], 0);
  addRelative("tomorrow", ["ngay mai", "mai"], 1);
  addRelative("day-after-tomorrow", ["ngay kia", "kia", "mot", "mốt"], 2);

  return result.sort((a, b) => a.index - b.index);
}

function extractNights(text: string): number | null {
  const normalized = normalizeText(text);

  const patterns = [
    /\b(?:o|ở|thue|thuê|stay|staying)\s+(\d+)\s*(?:dem|đem|ngay|ngày)\b/i,
    /\b(\d+)\s*(?:dem|đem|nights?)\b/i,
    /\b(\d+)\s*(?:ngay|ngày)\b/i,
    /\b(?:trong|for)\s+(\d+)\s*(?:dem|ngay|nights?|days?)\b/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const nights = Number(match[1]);
      if (Number.isInteger(nights) && nights > 0 && nights <= 365) {
        return nights;
      }
    }
  }

  return null;
}

function extractMonths(text: string): number | null {
  const normalized = normalizeText(text);

  const match = normalized.match(
    /\b(\d+)\s*(?:thang|tháng|month|months)\b/i
  );

  if (!match) return null;

  const months = Number(match[1]);
  return Number.isInteger(months) && months > 0 && months <= 24
    ? months
    : null;
}

function parseStayDates(
  text: string,
  existingCheckIn?: string | null
): {
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
} {
  const relative = parseRelativeDates(text);
  const numeric = parseNumericDates(text);

  const allDates = [...relative, ...numeric]
    .sort((a, b) => a.index - b.index)
    .filter(
      (item, index, array) =>
        index === 0 || item.value !== array[index - 1].value
    );

  const extractedNights = extractNights(text);

  /*
   * "ngày mai nhận, thuê 1 ngày":
   * - checkIn = ngày mai
   * - nights = 1
   * - checkOut = ngày kia
   */
  if (allDates.length >= 1 && extractedNights) {
    const checkIn = allDates[0].value;
    return {
      checkIn,
      checkOut: addDays(checkIn, extractedNights),
      nights: extractedNights,
    };
  }

  /*
   * "mai nhận đến 05/10"
   */
  if (allDates.length >= 2) {
    const checkIn = allDates[0].value;
    const checkOut = allDates[1].value;
    const nights = dateDiffNights(checkIn, checkOut);

    if (nights > 0) {
      return {
        checkIn,
        checkOut,
        nights,
      };
    }
  }

  /*
   * Chỉ nói "ở 2 đêm" sau khi check-in đã có ở draft.
   */
  if (existingCheckIn && extractedNights) {
    return {
      checkIn: existingCheckIn,
      checkOut: addDays(existingCheckIn, extractedNights),
      nights: extractedNights,
    };
  }

  /*
   * Chỉ nói "ngày mai nhận phòng".
   */
  if (allDates.length === 1) {
    return {
      checkIn: allDates[0].value,
      checkOut: null,
      nights: null,
    };
  }

  return {
    checkIn: null,
    checkOut: null,
    nights: null,
  };
}

/* =========================================================
   GUEST / CONTACT EXTRACTION
========================================================= */

function extractAdults(text: string): number | null {
  const normalized = normalizeText(text);

  const patterns = [
    /\b(\d+)\s*(?:nguoi|người)\b/i,
    /\b(\d+)\s*(?:adult|adults)\b/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (Number.isInteger(value) && value > 0 && value <= 20) {
        return value;
      }
    }
  }

  return null;
}

function extractChildren(text: string): number | null {
  const normalized = normalizeText(text);

  const match = normalized.match(
    /\b(\d+)\s*(?:tre em|trẻ em|child|children|kids?)\b/i
  );

  if (!match) return null;

  const value = Number(match[1]);
  return Number.isInteger(value) && value >= 0 && value <= 20
    ? value
    : null;
}

function extractRoomQuantity(text: string): number | null {
  const normalized = normalizeText(text);

  const match = normalized.match(
    /\b(\d+)\s*(?:phong|phòng|room|rooms)\b/i
  );

  if (!match) return null;

  const value = Number(match[1]);
  return Number.isInteger(value) && value > 0 && value <= 20
    ? value
    : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(/(?:\+84|0)\s*\d(?:[\s.-]*\d){8,10}/);

  if (!match) return null;

  const normalized = match[0].replace(/[^\d+]/g, "");

  if (normalized.startsWith("+84")) {
    return normalized;
  }

  if (/^0\d{9,10}$/.test(normalized)) {
    return normalized;
  }

  return null;
}

function extractEmail(text: string): string | null {
  const match = text.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  );

  return match ? match[0].trim() : null;
}

function extractName(text: string): string | null {
  const original = clean(text);
  const normalized = normalizeText(original);

  const patterns = [
    /(?:ten toi la|toi ten la|ten minh la|my name is|name is)\s+(.+)$/i,
    /(?:ho ten|full name)\s*[:\-]?\s*(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;

    const raw = match[1]
      .replace(/\b(?:va|and)\b.*$/i, "")
      .trim();

    if (raw.length >= 2 && raw.length <= 80) {
      return raw
        .split(/\s+/)
        .map((part) =>
          part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join(" ");
    }
  }

  /*
   * Người dùng thường chỉ gõ tên, ví dụ:
   * "Nguyễn Anh Thuấn"
   * Không bắt buộc phải nói "tên tôi là...".
   */
  const words = original
    .replace(/[^\p{L}\p{M}\s'-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2 && words.length <= 6) {
    const blocked = new Set([
      "toi",
      "minh",
      "muon",
      "can",
      "dat",
      "phong",
      "khach",
      "san",
      "hom",
      "nay",
      "mai",
      "ngay",
      "dem",
      "nguoi",
      "lon",
      "tre",
      "em",
      "chon",
      "chua",
      "cho",
      "xin",
      "vui",
      "long",
      "phone",
      "email",
      "khu",
      "bui",
      "vien",
      "quan",
      "q1",
      "district",
      "hotel",
      "guesthouse",
      "homestay",
      "house",
      "anh",
      "kim",
      "ae",
      "huyen",
      "ngay",
      "thang",
      "thue",
      "stay",
      "book",
    ]);

    const normalizedWords = words.map((word) =>
      normalizeText(word)
    );

    const looksLikeName =
      normalizedWords.every((word) =>
        /^[\p{L}\p{M}'-]+$/u.test(word)
      ) &&
      !normalizedWords.some((word) => blocked.has(word));

    if (looksLikeName) {
      return words
        .map((part) =>
          part.charAt(0).toUpperCase() +
          part.slice(1).toLowerCase()
        )
        .join(" ");
    }
  }

  return null;
}

/* =========================================================
   HOTEL MATCHING
========================================================= */

function hotelSearchText(hotel: DbHotel): string {
  return normalizeText(
    [
      hotel.name_vi,
      hotel.name_en,
      hotel.slug,
      hotel.address_vi,
      hotel.address_en,
      hotel.nearby_vi,
      hotel.nearby_en,
      hotel.description_vi,
      hotel.description_en,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function hotelLocationScore(
  text: string,
  hotel: DbHotel
): number {
  const normalized = normalizeText(text);
  const haystack = hotelSearchText(hotel);

  let score = 0;

  const aliases = [
    hotel.name_vi,
    hotel.name_en,
    hotel.slug,
  ].filter(Boolean) as string[];

  for (const alias of aliases) {
    const value = normalizeText(alias);
    if (value && normalized.includes(value)) {
      score += 100 + value.length;
    }
  }

  /*
   * Địa điểm người dùng thường dùng thay cho tên khách sạn.
   * Những từ này được so với address/nearby/description của DB.
   */
  const landmarks = [
    "bui vien",
    "pho bui vien",
    "pho tay",
    "pham ngu lao",
    "do quang dau",
    "ben thanh",
    "cho ben thanh",
    "nguyen thai hoc",
    "nguyen thai binh",
    "co bac",
    "co giang",
    "cau ong lanh",
  ];

  for (const landmark of landmarks) {
    if (!normalized.includes(landmark)) continue;

    if (haystack.includes(landmark)) {
      score += landmark.length >= 8 ? 70 : 50;
    }

    /*
     * A&E nằm trên Đỗ Quang Đẩu, khu Bùi Viện.
     * Nếu DB có address Đỗ Quang Đẩu nhưng nearby chưa có
     * chữ "Bùi Viện", vẫn hiểu đây là cùng cụm khu vực.
     */
    if (
      landmark === "bui vien" &&
      haystack.includes("do quang dau")
    ) {
      score += 85;
    }

    /*
     * Anh Kim ở Cô Bắc/Cầu Ông Lãnh cũng thuộc vùng trung tâm
     * nhưng xa Bùi Viện hơn Đỗ Quang Đẩu, nên chỉ cộng điểm vừa phải.
     */
    if (
      landmark === "bui vien" &&
      (haystack.includes("co bac") ||
        haystack.includes("cau ong lanh"))
    ) {
      score += 25;
    }
  }

  const queryTokens = normalized
    .split(/\s+/)
    .filter((token) => token.length >= 3);

  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      score += 3;
    }
  }

  return score;
}

async function loadHotels(): Promise<DbHotel[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("hotels")
    .select(
      `
        id,
        slug,
        name_vi,
        name_en,
        address_vi,
        address_en,
        nearby_vi,
        nearby_en,
        description_vi,
        description_en,
        business_model,
        status
      `
    )
    .eq("status", "active")
    .order("id", { ascending: true });

  if (error) {
    console.error("AI booking loadHotels error:", error);
    return [];
  }

  return (data || []) as DbHotel[];
}

function chooseHotel(
  message: string,
  hotels: DbHotel[],
  currentSlug?: string | null
): DbHotel | null {
  if (!hotels.length) return null;

  if (currentSlug) {
    const current = hotels.find(
      (hotel) => hotel.slug === currentSlug
    );

    if (current) return current;
  }

  let best: DbHotel | null = null;
  let bestScore = 0;
  let secondScore = 0;

  for (const hotel of hotels) {
    const score = hotelLocationScore(message, hotel);

    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      best = hotel;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  /*
   * Nếu người dùng nói tên khách sạn rõ ràng, score >= 100.
   * Nếu chỉ nói vị trí, cần đạt ngưỡng đủ rõ.
   */
  if (!best || bestScore < 20) return null;

  /*
   * Nếu hai khách sạn có điểm ngang nhau và người dùng chỉ
   * nói khu vực chung, không tự đoán.
   */
  if (
    bestScore < 100 &&
    secondScore > 0 &&
    bestScore - secondScore < 10
  ) {
    return null;
  }

  return best;
}

/* =========================================================
   ROOM / AVAILABILITY
========================================================= */

async function getRooms(
  hotelId: number
): Promise<DbRoom[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
        id,
        hotel_id,
        slug,
        name_vi,
        name_en,
        description_vi,
        description_en,
        max_guests,
        base_price_daily,
        base_price_monthly,
        base_price,
        quantity,
        status
      `
    )
    .eq("hotel_id", hotelId)
    .eq("status", "active")
    .order("id", { ascending: true });

  if (error) {
    console.error("AI booking getRooms error:", error);
    return [];
  }

  return (data || []) as DbRoom[];
}

async function getBookedQuantity(
  hotelId: number,
  checkIn: string,
  checkOut: string
): Promise<Map<number, number>> {
  const booked = new Map<number, number>();

  if (!supabase) return booked;

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        hotel_id,
        stay_type,
        check_in,
        check_out,
        status,
        booking_rooms (
          room_id,
          quantity
        )
      `
    )
    .eq("hotel_id", hotelId)
    .eq("status", "confirmed")
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);

  if (error) {
    console.error("AI booking getBookedQuantity error:", error);
    return booked;
  }

  for (const booking of (data || []) as unknown as DbBooking[]) {
    for (const item of booking.booking_rooms || []) {
      const roomId = Number(item.room_id);
      const quantity = Number(item.quantity);

      if (
        Number.isInteger(roomId) &&
        roomId > 0 &&
        Number.isFinite(quantity) &&
        quantity > 0
      ) {
        booked.set(
          roomId,
          (booked.get(roomId) || 0) + Math.floor(quantity)
        );
      }
    }
  }

  return booked;
}

function roomPrice(
  room: DbRoom,
  stayType: AiBookingStayType
): number | null {
  if (stayType === "month") {
    return room.base_price_monthly ?? null;
  }

  return room.base_price_daily ?? room.base_price ?? null;
}

async function searchAiRooms(
  hotel: DbHotel,
  draft: AiBookingDraft
): Promise<AiRoomOption[]> {
  if (!draft.checkIn || !draft.checkOut) return [];

  const rooms = await getRooms(hotel.id);
  const booked = await getBookedQuantity(
    hotel.id,
    draft.checkIn,
    draft.checkOut
  );

  const requiredGuests = Math.max(
    1,
    draft.adults + draft.children
  );

  const result: AiRoomOption[] = [];

  for (const room of rooms) {
    const totalQuantity = Math.max(
      0,
      Math.floor(Number(room.quantity) || 0)
    );

    const availableQuantity = Math.max(
      0,
      totalQuantity - (booked.get(room.id) || 0)
    );

    const maxGuests =
      room.max_guests === null
        ? null
        : Number(room.max_guests);

    if (
      maxGuests !== null &&
      Number.isFinite(maxGuests) &&
      maxGuests < requiredGuests
    ) {
      continue;
    }

    if (availableQuantity <= 0) continue;

    const price = roomPrice(room, draft.stayType);

    const units =
      draft.stayType === "month"
        ? Math.max(1, draft.months)
        : Math.max(1, draft.nights || 0);

    const estimatedTotal =
      price !== null && units > 0
        ? price * units
        : null;

    result.push({
      roomId: Number(room.id),
      roomSlug: clean(room.slug),
      nameVi: clean(room.name_vi) || clean(room.name_en),
      nameEn: clean(room.name_en) || clean(room.name_vi),
      maxGuests,
      availableQuantity,
      pricePerUnit: price,
      estimatedTotal,
    });
  }

  return result;
}

/* =========================================================
   DRAFT
========================================================= */

function normalizeRooms(
  rooms: unknown
): AiBookingRoom[] {
  if (!Array.isArray(rooms)) return [];

  return rooms
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const value = item as {
        roomSlug?: unknown;
        quantity?: unknown;
      };

      const roomSlug = clean(value.roomSlug);
      const quantity = positiveInt(value.quantity, 1);

      if (!roomSlug) return null;

      return {
        roomSlug,
        quantity,
      };
    })
    .filter(Boolean) as AiBookingRoom[];
}

function createDraft(
  input?: Partial<AiBookingDraft> | null
): AiBookingDraft {
  const stayType: AiBookingStayType =
    input?.stayType === "month" ? "month" : "day";

  return {
    stayType,
    hotelSlug: clean(input?.hotelSlug) || null,
    hotelNameVi: clean(input?.hotelNameVi) || null,
    hotelNameEn: clean(input?.hotelNameEn) || null,
    checkIn: clean(input?.checkIn) || null,
    checkOut: clean(input?.checkOut) || null,
    nights:
      Number.isInteger(input?.nights) && Number(input?.nights) > 0
        ? Number(input?.nights)
        : null,
    months: positiveInt(input?.months, 1),
    adults: positiveInt(input?.adults, 1),
    children:
      Number.isInteger(input?.children) &&
      Number(input?.children) >= 0
        ? Number(input?.children)
        : 0,
    fullName: clean(input?.fullName) || null,
    phone: clean(input?.phone) || null,
    email: clean(input?.email) || null,
    note: clean(input?.note) || null,
    rooms: normalizeRooms(input?.rooms),
    confirmed: input?.confirmed === true,
  };
}

function updateDraftFromMessage(
  draft: AiBookingDraft,
  message: string,
  hotel?: DbHotel | null,
  selectedRoomSlug?: string | null
): AiBookingDraft {
  const next: AiBookingDraft = {
    ...draft,
    rooms: [...draft.rooms],
  };

  if (hotel) {
    next.hotelSlug = hotel.slug;
    next.hotelNameVi = clean(hotel.name_vi);
    next.hotelNameEn = clean(hotel.name_en);
  }

  const dates = parseStayDates(
    message,
    next.checkIn
  );

  if (dates.checkIn) {
    next.checkIn = dates.checkIn;
  }

  if (dates.checkOut) {
    next.checkOut = dates.checkOut;
  }

  if (dates.nights) {
    next.nights = dates.nights;
  }

  const months = extractMonths(message);

  if (months) {
    next.stayType = "month";
    next.months = months;
    next.checkIn = next.checkIn || getTodayVietnam();
    next.checkOut = null;
    next.nights = null;
  }

  const adults = extractAdults(message);
  if (adults !== null) {
    next.adults = adults;
  }

  const children = extractChildren(message);
  if (children !== null) {
    next.children = children;
  }

  const roomQuantity = extractRoomQuantity(message);

  if (roomQuantity !== null && next.rooms.length > 0) {
    next.rooms = next.rooms.map((room) => ({
      ...room,
      quantity: roomQuantity,
    }));
  }

  if (selectedRoomSlug) {
    const existing = next.rooms.find(
      (room) => room.roomSlug === selectedRoomSlug
    );

    if (!existing) {
      next.rooms = [
        {
          roomSlug: selectedRoomSlug,
          quantity: roomQuantity || 1,
        },
      ];
    }
  }

  const phone = extractPhone(message);
  if (phone) next.phone = phone;

  const email = extractEmail(message);
  if (email) next.email = email;

  const fullName = extractName(message);
  if (fullName) next.fullName = fullName;

  return next;
}

/* =========================================================
   INTENT / CONFIRMATION
========================================================= */

function looksLikeBookingIntent(text: string): boolean {
  const normalized = normalizeText(text);

  return [
    "dat phong",
    "đặt phòng",
    "book phong",
    "book a room",
    "booking",
    "muon dat",
    "muốn đặt",
    "can dat",
    "cần đặt",
    "reserve",
    "reservation",
    "thue phong",
    "thuê phòng",
  ].some((item) => normalized.includes(normalizeText(item)));
}

function looksLikeChange(text: string): boolean {
  const normalized = normalizeText(text);

  return [
    "doi ngay",
    "đổi ngày",
    "doi phong",
    "đổi phòng",
    "doi so dem",
    "đổi số đêm",
    "doi khach san",
    "đổi khách sạn",
    "them nguoi",
    "thêm người",
    "bot nguoi",
    "bớt người",
    "change date",
    "change room",
    "change hotel",
    "change guests",
  ].some((item) => normalized.includes(normalizeText(item)));
}

function looksLikeCancel(text: string): boolean {
  const normalized = normalizeText(text);

  return [
    "huy dat",
    "hủy đặt",
    "cancel booking",
    "cancel reservation",
    "khong dat nua",
    "không đặt nữa",
    "thoi khong dat",
    "thôi không đặt",
  ].some((item) => normalized.includes(normalizeText(item)));
}

function looksLikeConfirmation(text: string): boolean {
  const normalized = normalizeText(text);

  return [
    "xac nhan",
    "xác nhận",
    "dong y",
    "đồng ý",
    "ok",
    "oke",
    "okay",
    "yes",
    "confirm",
    "tien hanh",
    "tiến hành",
    "dat luon",
    "đặt luôn",
    "book it",
  ].some((item) => normalized === normalizeText(item));
}

/* =========================================================
   MISSING FIELDS
========================================================= */

function missingFields(
  draft: AiBookingDraft
): string[] {
  const missing: string[] = [];

  if (!draft.hotelSlug) missing.push("hotel");

  if (draft.stayType === "day") {
    if (!draft.checkIn) missing.push("checkIn");
    if (!draft.checkOut) missing.push("checkOut");
  } else {
    if (!draft.months || draft.months < 1) {
      missing.push("months");
    }
  }

  if (!draft.adults || draft.adults < 1) {
    missing.push("adults");
  }

  if (!draft.rooms.length) {
    missing.push("room");
  }

  if (!draft.fullName) missing.push("fullName");
  if (!draft.phone) missing.push("phone");

  return missing;
}

/* =========================================================
   ANSWERS
========================================================= */

function formatDateVi(value: string | null): string {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function hotelName(
  draft: AiBookingDraft,
  language: Language
): string {
  return (
    (language === "vi"
      ? draft.hotelNameVi
      : draft.hotelNameEn) ||
    draft.hotelNameVi ||
    draft.hotelNameEn ||
    draft.hotelSlug ||
    "khách sạn"
  );
}

function roomName(
  room: AiRoomOption,
  language: Language
): string {
  return language === "vi"
    ? room.nameVi
    : room.nameEn;
}

function priceText(
  value: number | null,
  language: Language
): string {
  if (value === null || !Number.isFinite(value)) {
    return language === "vi"
      ? "chưa có giá"
      : "price unavailable";
  }

  return `${new Intl.NumberFormat("vi-VN").format(
    value
  )} ${language === "vi" ? "đ" : "VND"}`;
}

function missingAnswer(
  draft: AiBookingDraft,
  missing: string[],
  language: Language
): string {
  const hotel = hotelName(draft, language);

  if (missing.includes("hotel")) {
    return language === "vi"
      ? "Bạn muốn đặt phòng tại khách sạn nào hoặc khu vực nào? Ví dụ: Bùi Viện, Quận 1 hoặc Anh Kim Hotel."
      : "Which hotel or area would you like to stay in? For example: Bui Vien, District 1, or Anh Kim Hotel.";
  }

  if (
    missing.includes("checkIn") ||
    missing.includes("checkOut")
  ) {
    return language === "vi"
      ? "Bạn cho mình ngày nhận phòng và số đêm nhé. Ví dụ: “ngày mai nhận, thuê 2 ngày” hoặc “05/10 đến 07/10”."
      : "Please give me your check-in date and length of stay. For example: “check in tomorrow for 2 nights” or “05/10 to 07/10”.";
  }

  if (missing.includes("months")) {
    return language === "vi"
      ? "Bạn muốn thuê trong bao nhiêu tháng?"
      : "How many months would you like to stay?";
  }

  if (missing.includes("adults")) {
    return language === "vi"
      ? "Bạn đặt phòng cho bao nhiêu người lớn?"
      : "How many adults will be staying?";
  }

  if (missing.includes("room")) {
    return language === "vi"
      ? `Mình đã xác định ${hotel}. Mình sẽ kiểm tra các phòng còn trống cho bạn.`
      : `I have identified ${hotel}. I will check the available rooms for you.`;
  }

  if (missing.includes("fullName")) {
    return language === "vi"
      ? "Bạn cho mình họ tên người đặt phòng nhé."
      : "May I have the guest's full name?";
  }

  if (missing.includes("phone")) {
    return language === "vi"
      ? "Bạn cho mình số điện thoại liên hệ để hoàn tất đặt phòng nhé."
      : "Please provide a phone number so I can complete the booking.";
  }

  return language === "vi"
    ? "Mình đã có các thông tin chính. Bạn muốn tiếp tục đặt phòng không?"
    : "I have the main details. Would you like to continue with the booking?";
}

function roomsAnswer(
  draft: AiBookingDraft,
  rooms: AiRoomOption[],
  language: Language
): string {
  if (!rooms.length) {
    return language === "vi"
      ? `Mình đã kiểm tra ${hotelName(
          draft,
          language
        )} nhưng hiện không còn phòng phù hợp với thông tin bạn đưa. Bạn có thể đổi ngày, số khách hoặc khách sạn.`
      : `I checked ${hotelName(
          draft,
          language
        )}, but there are currently no suitable rooms for your request. You can change the dates, number of guests, or hotel.`;
  }

  const lines = rooms.slice(0, 8).map((room, index) => {
    const quantityText =
      language === "vi"
        ? `còn ${room.availableQuantity} phòng`
        : `${room.availableQuantity} available`;

    const price =
      room.pricePerUnit !== null
        ? priceText(room.pricePerUnit, language)
        : language === "vi"
        ? "chưa có giá"
        : "price unavailable";

    return `${index + 1}. ${roomName(
      room,
      language
    )} — ${price}/${draft.stayType === "month" ? "tháng" : "đêm"} — ${quantityText}`;
  });

  return language === "vi"
    ? `Mình tìm được các phòng còn trống tại ${hotelName(
        draft,
        language
      )}:\n\n${lines.join(
        "\n"
      )}\n\nBạn chọn tên phòng nào?`
    : `I found these available rooms at ${hotelName(
        draft,
        language
      )}:\n\n${lines.join(
        "\n"
      )}\n\nWhich room would you like?`;
}

function summaryAnswer(
  draft: AiBookingDraft,
  selectedRoom: AiRoomOption | null,
  language: Language
): string {
  const hotel = hotelName(draft, language);
  const room = selectedRoom
    ? roomName(selectedRoom, language)
    : draft.rooms[0]?.roomSlug || "chưa chọn";

  const stay =
    draft.stayType === "month"
      ? language === "vi"
        ? `${draft.months} tháng`
        : `${draft.months} month(s)`
      : language === "vi"
      ? `${formatDateVi(draft.checkIn)} → ${formatDateVi(
          draft.checkOut
        )} (${draft.nights || 0} đêm)`
      : `${draft.checkIn} → ${draft.checkOut} (${draft.nights || 0} night(s))`;

  return language === "vi"
    ? `Thông tin đặt phòng của bạn:\n\n- Khách sạn: ${hotel}\n- Phòng: ${room}\n- Thời gian: ${stay}\n- Khách: ${draft.adults} người lớn${
        draft.children
          ? ` + ${draft.children} trẻ em`
          : ""
      }\n- Họ tên: ${draft.fullName}\n- Điện thoại: ${draft.phone}${
        draft.email
          ? `\n- Email: ${draft.email}`
          : ""
      }\n\nNếu thông tin trên chính xác, bạn hãy trả lời “xác nhận” để mình tiến hành đặt phòng.`
    : `Your booking details:\n\n- Hotel: ${hotel}\n- Room: ${room}\n- Stay: ${stay}\n- Guests: ${draft.adults} adult(s)${
        draft.children
          ? ` + ${draft.children} child(ren)`
          : ""
      }\n- Name: ${draft.fullName}\n- Phone: ${draft.phone}${
        draft.email
          ? `\n- Email: ${draft.email}`
          : ""
      }\n\nIf everything is correct, reply “confirm” and I will proceed with the booking.`;
}

/* =========================================================
   ESTIMATE
========================================================= */

function calculateAiEstimatedTotal(
  draft: AiBookingDraft,
  room: AiRoomOption,
  quantity: number
): number | null {
  if (room.pricePerUnit === null) return null;

  const units =
    draft.stayType === "month"
      ? Math.max(1, draft.months)
      : Math.max(1, draft.nights || 0);

  if (!units) return null;

  return room.pricePerUnit * units * quantity;
}

/* =========================================================
   BOOKING REQUEST
========================================================= */

function buildBookingRequest(
  draft: AiBookingDraft
) {
  return {
    hotelSlug: draft.hotelSlug,
    stayType: draft.stayType,
    checkIn: draft.checkIn,
    checkOut: draft.checkOut,
    months: draft.months,
    adults: draft.adults,
    children: draft.children,
    fullName: draft.fullName,
    phone: draft.phone,
    email: draft.email || "",
    note: draft.note || "",
    rooms: draft.rooms.map((room) => ({
      roomSlug: room.roomSlug,
      quantity: room.quantity,
    })),
  };
}

async function createAiBooking(
  draft: AiBookingDraft
): Promise<AiBookingResult> {
  /*
   * Chỉ được gọi sau khi người dùng đã trả lời "xác nhận".
   * Gọi API booking hiện tại để giữ nguyên logic atomic booking.
   */
  try {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_SITE_URL ||
          "http://localhost:3000";

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/bookings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildBookingRequest(draft)
        ),
        cache: "no-store",
      }
    );

    const data = (await response.json()) as {
      success?: boolean;
      error?: string;
      booking?: {
        id?: number;
        bookingCode?: string;
        totalAmount?: number;
      };
    };

    if (!response.ok || !data.success) {
      return {
        success: false,
        error:
          data.error ||
          "Booking API returned an error.",
      };
    }

    return {
      success: true,
      bookingCode:
        data.booking?.bookingCode,
      bookingId:
        data.booking?.id,
      totalAmount:
        data.booking?.totalAmount,
      booking: data.booking,
    };
  } catch (error: unknown) {
    console.error(
      "AI create booking error:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

/* =========================================================
   FINAL AVAILABILITY CHECK
========================================================= */

async function hasEnoughAvailability(
  hotel: DbHotel,
  draft: AiBookingDraft
): Promise<{
  ok: boolean;
  rooms: AiRoomOption[];
  error?: string;
}> {
  const rooms = await searchAiRooms(
    hotel,
    draft
  );

  for (const requested of draft.rooms) {
    const found = rooms.find(
      (room) =>
        room.roomSlug === requested.roomSlug
    );

    if (!found) {
      return {
        ok: false,
        rooms,
        error: requested.roomSlug,
      };
    }

    if (
      requested.quantity >
      found.availableQuantity
    ) {
      return {
        ok: false,
        rooms,
        error: requested.roomSlug,
      };
    }
  }

  return {
    ok: true,
    rooms,
  };
}

/* =========================================================
   PREPARE / FINALIZE
========================================================= */

async function prepareAiBooking(
  draft: AiBookingDraft,
  language: Language
): Promise<AiBookingResponse> {
  if (!draft.hotelSlug) {
    return {
      handled: true,
      answer: missingAnswer(
        draft,
        ["hotel"],
        language
      ),
      bookingDraft: draft,
      availableRooms: [],
      bookingResult: null,
      action: "collecting",
    };
  }

  if (
    draft.stayType === "day" &&
    (!draft.checkIn || !draft.checkOut)
  ) {
    return {
      handled: true,
      answer: missingAnswer(
        draft,
        ["checkIn", "checkOut"],
        language
      ),
      bookingDraft: draft,
      availableRooms: [],
      bookingResult: null,
      action: "collecting",
    };
  }

  if (
    draft.stayType === "month" &&
    draft.months < 1
  ) {
    return {
      handled: true,
      answer: missingAnswer(
        draft,
        ["months"],
        language
      ),
      bookingDraft: draft,
      availableRooms: [],
      bookingResult: null,
      action: "collecting",
    };
  }

  if (draft.adults < 1) {
    return {
      handled: true,
      answer: missingAnswer(
        draft,
        ["adults"],
        language
      ),
      bookingDraft: draft,
      availableRooms: [],
      bookingResult: null,
      action: "collecting",
    };
  }

  const hotels = await loadHotels();
  const hotel = hotels.find(
    (item) =>
      item.slug === draft.hotelSlug
  );

  if (!hotel) {
    return {
      handled: true,
      answer:
        language === "vi"
          ? "Mình chưa tìm thấy khách sạn đó trong hệ thống. Bạn cho mình tên khách sạn hoặc khu vực gần đó nhé."
          : "I couldn't find that hotel in the system. Please give me the hotel name or nearby area.",
      bookingDraft: {
        ...draft,
        hotelSlug: null,
        hotelNameVi: null,
        hotelNameEn: null,
      },
      availableRooms: [],
      bookingResult: null,
      action: "collecting",
    };
  }

  const rooms = await searchAiRooms(
    hotel,
    draft
  );

  if (!rooms.length) {
    return {
      handled: true,
      answer: roomsAnswer(
        draft,
        rooms,
        language
      ),
      bookingDraft: draft,
      availableRooms: [],
      bookingResult: null,
      action: "show_rooms",
    };
  }

  if (!draft.rooms.length) {
    return {
      handled: true,
      answer: roomsAnswer(
        draft,
        rooms,
        language
      ),
      bookingDraft: draft,
      availableRooms: rooms,
      bookingResult: null,
      action: "show_rooms",
    };
  }

  const selected = rooms.find(
    (room) =>
      room.roomSlug ===
      draft.rooms[0]?.roomSlug
  );

  if (!selected) {
    return {
      handled: true,
      answer: roomsAnswer(
        draft,
        rooms,
        language
      ),
      bookingDraft: {
        ...draft,
        rooms: [],
      },
      availableRooms: rooms,
      bookingResult: null,
      action: "show_rooms",
    };
  }

  const missing = missingFields(draft);

  if (missing.length) {
    const needsRoom = missing.includes("room");

    return {
      handled: true,
      answer: missingAnswer(
        draft,
        missing,
        language
      ),
      bookingDraft: draft,
      /*
       * Chỉ trả danh sách phòng khi khách CHƯA chọn phòng.
       * Nếu đã chọn phòng mà đang bổ sung họ tên/số điện thoại,
       * không được render lại toàn bộ danh sách phòng ở giao diện.
       */
      availableRooms: needsRoom ? rooms : [],
      bookingResult: null,
      action: needsRoom ? "show_rooms" : "collecting",
    };
  }

  return {
    handled: true,
    answer: summaryAnswer(
      draft,
      selected,
      language
    ),
    bookingDraft: draft,
    availableRooms: rooms,
    bookingResult: null,
    action: "confirm_booking",
  };
}

async function finalizeAiBooking(
  draft: AiBookingDraft,
  language: Language
): Promise<AiBookingResponse> {
  const hotels = await loadHotels();

  const hotel = hotels.find(
    (item) =>
      item.slug === draft.hotelSlug
  );

  if (!hotel) {
    return {
      handled: true,
      answer:
        language === "vi"
          ? "Mình không tìm thấy khách sạn để tiếp tục đặt phòng."
          : "I couldn't find the hotel to continue the booking.",
      bookingDraft: draft,
      availableRooms: [],
      bookingResult: null,
      action: "collecting",
    };
  }

  const availability =
    await hasEnoughAvailability(
      hotel,
      draft
    );

  if (!availability.ok) {
    return {
      handled: true,
      answer:
        language === "vi"
          ? "Phòng bạn chọn vừa thay đổi tình trạng. Mình đã kiểm tra lại và hiện phòng đó không còn đủ số lượng. Mình sẽ hiển thị các phòng còn trống để bạn chọn lại."
          : "The room availability has just changed. I rechecked it and the selected room is no longer available in the requested quantity. I will show you the available rooms again.",
      bookingDraft: {
        ...draft,
        rooms: [],
        confirmed: false,
      },
      availableRooms:
        availability.rooms,
      bookingResult: null,
      action: "show_rooms",
    };
  }

  const bookingResult =
    await createAiBooking(draft);

  if (!bookingResult.success) {
    return {
      handled: true,
      answer:
        language === "vi"
          ? `Mình chưa thể hoàn tất đặt phòng lúc này. ${
              bookingResult.error
                ? "Hệ thống báo lỗi, bạn vui lòng thử lại."
                : ""
            }`
          : "I couldn't complete the booking right now. Please try again.",
      bookingDraft: {
        ...draft,
        confirmed: false,
      },
      availableRooms:
        availability.rooms,
      bookingResult,
      action: "collecting",
    };
  }

  const code =
    bookingResult.bookingCode ||
    "";

  const total =
    bookingResult.totalAmount;

  return {
    handled: true,
    answer:
      language === "vi"
        ? `Đặt phòng thành công${
            code
              ? `! Mã đặt phòng của bạn là **${code}**.`
              : "!"
          }${
            total !== undefined
              ? ` Tổng tiền dự kiến: ${new Intl.NumberFormat(
                  "vi-VN"
                ).format(total)} đ.`
              : ""
          }`
        : `Your booking has been created successfully${
            code
              ? `! Your booking code is **${code}**.`
              : "!"
          }${
            total !== undefined
              ? ` Estimated total: ${new Intl.NumberFormat(
                  "vi-VN"
                ).format(total)} VND.`
              : ""
          }`,
    bookingDraft: {
      ...draft,
      confirmed: true,
    },
    availableRooms:
      availability.rooms,
    bookingResult,
    action: "booking_created",
  };
}

/* =========================================================
   MAIN HANDLER
========================================================= */

export async function handleAiBooking(
  request: AiBookingRequest
): Promise<AiBookingResponse> {
  const message = clean(request.message);

  const initialDraft =
    createDraft(
      request.bookingDraft
    );

  const bookingSignal =
    looksLikeBookingIntent(message) ||
    looksLikeChange(message) ||
    Boolean(request.bookingDraft);

  if (!bookingSignal) {
    return {
      handled: false,
      answer: "",
      bookingDraft:
        request.bookingDraft
          ? initialDraft
          : null,
      availableRooms: [],
      bookingResult: null,
      action: "none",
    };
  }

  if (looksLikeCancel(message)) {
    const resetDraft = createDraft();

    return {
      handled: true,
      answer:
        request.language === "vi"
          ? "Được, mình chưa tạo booking nào. Bạn có thể bắt đầu lại bất cứ lúc nào."
          : "Okay, I have not created any booking. You can start again anytime.",
      bookingDraft: resetDraft,
      availableRooms: [],
      bookingResult: null,
      action: "cancelled",
    };
  }

  const hotels = await loadHotels();

  const conversationForHotel =
    message;

  const resolvedHotel =
    chooseHotel(
      conversationForHotel,
      hotels,
      request.hotelSlug ||
        initialDraft.hotelSlug
    );

  let draft =
    updateDraftFromMessage(
      initialDraft,
      message,
      resolvedHotel,
      request.selectedRoomSlug
    );

  /*
   * Nếu route gửi hotelSlug từ trang chi tiết,
   * giữ hotel đó ngay cả khi câu hiện tại chỉ nói
   * "ngày mai nhận".
   */
  if (
    request.hotelSlug &&
    !draft.hotelSlug
  ) {
    const hotelFromSlug =
      hotels.find(
        (hotel) =>
          hotel.slug ===
          request.hotelSlug
      );

    if (hotelFromSlug) {
      draft =
        updateDraftFromMessage(
          draft,
          "",
          hotelFromSlug,
          request.selectedRoomSlug
        );
    }
  }

  /*
   * Nếu người dùng nói "đồng ý/xác nhận",
   * KHÔNG tạo booking nếu draft chưa đủ.
   */
  if (looksLikeConfirmation(message)) {
    const missing =
      missingFields(draft);

    if (missing.length) {
      return {
        handled: true,
        answer: missingAnswer(
          draft,
          missing,
          request.language
        ),
        bookingDraft: draft,
        availableRooms: [],
        bookingResult: null,
        action: "collecting",
      };
    }

    return finalizeAiBooking(
      draft,
      request.language
    );
  }

  /*
   * Nếu người dùng vừa đổi thông tin,
   * kiểm tra lại từ đầu thay vì dùng kết quả cũ.
   */
  if (
    looksLikeChange(message) ||
    looksLikeBookingIntent(message)
  ) {
    /*
     * Chỉ hiển thị phòng khi đã có đủ khách sạn + ngày.
     * Nếu chưa đủ thì hỏi đúng trường còn thiếu.
     */
    return prepareAiBooking(
      draft,
      request.language
    );
  }

  /*
   * Trường hợp request.bookingDraft đã tồn tại nhưng
   * message chỉ là dữ liệu tiếp theo:
   * "mai nhận", "2 đêm", "090...", "Nguyễn Văn A".
   */
  if (request.bookingDraft) {
    return prepareAiBooking(
      draft,
      request.language
    );
  }

  return {
    handled: false,
    answer: "",
    bookingDraft: null,
    availableRooms: [],
    bookingResult: null,
    action: "none",
  };
}

/* =========================================================
   PUBLIC DATE HELPER
   Dùng để test nhanh từ nơi khác nếu cần.
========================================================= */

export function parseAiBookingDates(
  text: string,
  existingCheckIn?: string | null
) {
  return parseStayDates(
    text,
    existingCheckIn
  );
}
