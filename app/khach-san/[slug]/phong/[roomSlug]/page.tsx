"use client";

import Link from "next/link";
import {
use,
useEffect,
useMemo,
useRef,
useState,
useCallback,
} from "react";
import {
AirVent,
Bath,
BedDouble,
Check,
ChevronLeft,
ChevronRight,
Coffee,
Dumbbell,
Fan,
LockKeyhole,
Minus,
Microwave,
Plus,
Refrigerator,
ShowerHead,
Tv,
Utensils,
WashingMachine,
Wifi,
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";

type Language = "vi" | "en";

type Props = {
params: Promise<{
slug: string;
roomSlug: string;
}>;
};

type Hotel = {
id: number;
slug: string;
name_vi: string;
name_en: string;
address_vi: string | null;
address_en: string | null;
description_vi: string | null;
description_en: string | null;
image: string | null;
status: "active" | "inactive";
};

type Room = {
id: number;
hotel_id: number;
slug: string;
name_vi: string;
name_en: string;
description_vi: string | null;
description_en: string | null;
base_price: number | null;
quantity: number | null;
size: number | null;
max_guests: number | null;
beds_vi: string | null;
beds_en: string | null;
status: "active" | "inactive";
};

type Media = {
id: number;
bucket: string;
path: string;
file_name: string;
public_url: string;
entity_type: string;
entity_id: number | null;
alt_vi: string | null;
alt_en: string | null;
is_cover: boolean;
sort_order: number;
status: "active" | "inactive";
};

type AmenityCatalog = {
id: number;
name_vi: string;
name_en: string;
icon: string | null;
};

type RoomAmenity = {
id: number;
room_id: number;
amenity_id: number | null;
name_vi: string;
name_en: string;
icon: string | null;
sort_order: number;
status: "active" | "inactive";
amenity_catalog?: AmenityCatalog | AmenityCatalog[] | null;
};

// ========== UTILS ==========

function formatPrice(price: number | null, language: Language) {
if (price === null) {
return language === "vi" ? "Liên hệ" : "Contact";
}

return new Intl.NumberFormat(
language === "vi" ? "vi-VN" : "en-US",
{
style: "currency",
currency: "VND",
maximumFractionDigits: 0,
}
).format(price);
}

function getCatalog(
amenity: RoomAmenity
): AmenityCatalog | null {
if (!amenity.amenity_catalog) return null;

if (Array.isArray(amenity.amenity_catalog)) {
return amenity.amenity_catalog[0] ?? null;
}

return amenity.amenity_catalog;
}

function normalizeText(value: string | null | undefined) {
return (value ?? "")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.toLowerCase()
.trim();
}

function getAmenityIcon(
iconKey: string | null | undefined,
nameVi: string,
nameEn: string
) {
const key = normalizeText(iconKey)
.replace(/_/g, "-")
.replace(/\s+/g, "-");

const vi = normalizeText(nameVi);
const en = normalizeText(nameEn);

const value = `${key} ${vi} ${en}`;

if (
value.includes("wifi") ||
value.includes("wi-fi") ||
value.includes("internet")
) {
return (
<Wifi className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("air-condition") ||
value.includes("aircondition") ||
value.includes("may-lanh") ||
value.includes("dieu-hoa") ||
value.includes("air conditioning")
) {
return (
<AirVent className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("tv") ||
value.includes("television") ||
value.includes("tivi")
) {
return (
<Tv className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("bed") ||
value.includes("giuong") ||
value.includes("king") ||
value.includes("queen")
) {
return (
<BedDouble className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("bath") ||
value.includes("bathtub") ||
value.includes("bon-tam")
) {
return (
<Bath className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("shower") ||
value.includes("tam-voi") ||
value.includes("voi-sen")
) {
return (
<ShowerHead className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("refrigerator") ||
value.includes("fridge") ||
value.includes("tu-lanh")
) {
return (
<Refrigerator className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("microwave") ||
value.includes("lo-vi-song")
) {
return (
<Microwave className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("washing") ||
value.includes("washer") ||
value.includes("may-giat")
) {
return (
<WashingMachine className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("coffee") ||
value.includes("cafe") ||
value.includes("ca-phe")
) {
return (
<Coffee className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("gym") ||
value.includes("fitness") ||
value.includes("the-duc")
) {
return (
<Dumbbell className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("fan") ||
value.includes("quat")
) {
return (
<Fan className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("safe") ||
value.includes("security") ||
value.includes("khoa") ||
value.includes("ket")
) {
return (
<LockKeyhole className="h-5 w-5" strokeWidth={1.8} />
);
}

if (
value.includes("kitchen") ||
value.includes("bep") ||
value.includes("dining") ||
value.includes("an-uong") ||
value.includes("restaurant")
) {
return (
<Utensils className="h-5 w-5" strokeWidth={1.8} />
);
}

return (
<Check className="h-5 w-5" strokeWidth={2.2} />
);
}

// ========== MAIN COMPONENT ==========

export default function RoomDetailPage({
params,
}: Props) {
const { slug, roomSlug } = use(params);

const [language, setLanguage] =
useState<Language>("vi");

const [hotel, setHotel] =
useState<Hotel | null>(null);

const [room, setRoom] =
useState<Room | null>(null);

const [media, setMedia] =
useState<Media[]>([]);

const [roomAmenities, setRoomAmenities] =
useState<RoomAmenity[]>([]);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState("");

const [selectedImage, setSelectedImage] =
useState(0);

const [checkIn, setCheckIn] =
useState("");

const [checkOut, setCheckOut] =
useState("");

const [adults, setAdults] =
useState(1);

const [children, setChildren] =
useState(0);

const [roomQuantity, setRoomQuantity] =
useState(1);

const [bookingError, setBookingError] =
useState("");

const checkInRef =
useRef<HTMLInputElement>(null);

const checkOutRef =
useRef<HTMLInputElement>(null);

const today =
new Date().toISOString().split("T")[0];

// --- Language ---

useEffect(() => {
const saved =
typeof window !== "undefined"
? window.localStorage.getItem(
"huyen-language"
)
: null;

if (
  saved === "en" ||
  saved === "vi"
) {
  setLanguage(saved);
}

}, []);

useEffect(() => {
const handler = () => {
const saved =
window.localStorage.getItem(
"huyen-language"
);

  if (
    saved === "en" ||
    saved === "vi"
  ) {
    setLanguage(saved);
  }
};

window.addEventListener(
  "language-change",
  handler
);

return () =>
  window.removeEventListener(
    "language-change",
    handler
  );

}, []);

// --- Load Data ---

useEffect(() => {
let cancelled = false;

async function loadData() {
  setLoading(true);
  setError("");

  try {
    const {
      data: hotelData,
      error: hotelError,
    } = await supabase
      .from("hotels")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (hotelError) {
      throw hotelError;
    }

    if (!hotelData) {
      throw new Error(
        "Không tìm thấy khách sạn."
      );
    }

    const {
      data: roomData,
      error: roomError,
    } = await supabase
      .from("rooms")
      .select("*")
      .eq("hotel_id", hotelData.id)
      .eq("slug", roomSlug)
      .eq("status", "active")
      .maybeSingle();

    if (roomError) {
      throw roomError;
    }

    if (!roomData) {
      throw new Error(
        "Không tìm thấy phòng."
      );
    }

    const {
      data: mediaData,
      error: mediaError,
    } = await supabase
      .from("media")
      .select("*")
      .eq("entity_type", "room")
      .eq("entity_id", roomData.id)
      .eq("status", "active")
      .order("is_cover", {
        ascending: false,
      })
      .order("sort_order", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (mediaError) {
      throw mediaError;
    }

    const {
      data: amenityData,
      error: amenityError,
    } = await supabase
      .from("room_amenities")
      .select(`
        id,
        room_id,
        amenity_id,
        name_vi,
        name_en,
        icon,
        sort_order,
        status,
        amenity_catalog (
          id,
          name_vi,
          name_en,
          icon
        )
      `)
      .eq("room_id", roomData.id)
      .eq("status", "active")
      .order("sort_order", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (amenityError) {
      throw amenityError;
    }

    if (!cancelled) {
      setHotel(hotelData as Hotel);
      setRoom(roomData as Room);
      setMedia(
        (mediaData ?? []) as Media[]
      );
      setRoomAmenities(
        (amenityData ??
          []) as RoomAmenity[]
      );
    }
  } catch (err) {
    console.error(err);

    if (!cancelled) {
      setError(
        language === "vi"
          ? "Không thể tải thông tin phòng."
          : "Unable to load room information."
      );
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

loadData();

return () => {
  cancelled = true;
};

}, [slug, roomSlug]);

// --- Derived Data ---

const images = useMemo(() => {
if (
media.length === 0 &&
hotel?.image
) {
return [
{
id: 0,
public_url: hotel.image,
alt_vi: hotel.name_vi,
alt_en: hotel.name_en,
},
];
}

return media.map((item) => ({
  id: item.id,
  public_url: item.public_url,
  alt_vi: item.alt_vi,
  alt_en: item.alt_en,
}));

}, [media, hotel]);

useEffect(() => {
setSelectedImage(0);
}, [room?.id]);

const activeAmenities = useMemo(() => {
return roomAmenities.map((item) => {
const catalog = getCatalog(item);

  return {
    id: item.id,
    nameVi:
      catalog?.name_vi ||
      item.name_vi,
    nameEn:
      catalog?.name_en ||
      item.name_en,
    iconKey:
      catalog?.icon ||
      item.icon ||
      null,
  };
});

}, [roomAmenities]);

const availableRooms =
room?.quantity ?? 0;

// Giới hạn số phòng

useEffect(() => {
setRoomQuantity((curr) => {
if (availableRooms <= 0) {
return 1;
}

  return Math.min(
    Math.max(curr, 1),
    availableRooms
  );
});

}, [availableRooms]);

// Tính số đêm

const nights = useMemo(() => {
if (!checkIn || !checkOut) {
return 0;
}

const start = new Date(
  `${checkIn}T00:00:00`
);

const end = new Date(
  `${checkOut}T00:00:00`
);

const diffMs =
  end.getTime() -
  start.getTime();

if (diffMs <= 0) {
  return 0;
}

return Math.ceil(
  diffMs /
    (1000 * 60 * 60 * 24)
);

}, [checkIn, checkOut]);

const totalPrice = useMemo(() => {
if (
!room?.base_price ||
nights <= 0
) {
return 0;
}

return (
  room.base_price *
  nights *
  roomQuantity
);

}, [
room?.base_price,
nights,
roomQuantity,
]);

// Tổng số khách

const totalGuests = useMemo(
() => adults + children,
[adults, children]
);

const maxGuests =
room?.max_guests ?? Infinity;

// --- Handlers ---

const openDatePicker =
useCallback(
(
inputRef: React.RefObject<
HTMLInputElement | null
>
) => {
const input =
inputRef.current;

    if (!input) return;

    input.focus();

    if ("showPicker" in input) {
      try {
        (
          input as HTMLInputElement & {
            showPicker: () => void;
          }
        ).showPicker();
      } catch {}
    }
  },
  []
);

const handlePreviousImage =
useCallback(() => {
setSelectedImage((curr) =>
images.length <= 1
? curr
: curr === 0
? images.length - 1
: curr - 1
);
}, [images.length]);

const handleNextImage =
useCallback(() => {
setSelectedImage((curr) =>
images.length <= 1
? curr
: curr ===
images.length - 1
? 0
: curr + 1
);
}, [images.length]);

const handleDecreaseRooms =
useCallback(() => {
setRoomQuantity((curr) =>
Math.max(1, curr - 1)
);
setBookingError("");
}, []);

const handleIncreaseRooms =
useCallback(() => {
setRoomQuantity((curr) =>
Math.min(
availableRooms,
curr + 1
)
);
setBookingError("");
}, [availableRooms]);

const handleDecreaseAdults =
useCallback(() => {
setAdults((curr) =>
Math.max(1, curr - 1)
);
setBookingError("");
}, []);

const handleIncreaseAdults =
useCallback(() => {
setAdults((curr) =>
Math.min(
maxGuests,
curr + 1
)
);
setBookingError("");
}, [maxGuests]);

const handleDecreaseChildren =
useCallback(() => {
setChildren((curr) =>
Math.max(0, curr - 1)
);
setBookingError("");
}, []);

const handleIncreaseChildren =
useCallback(() => {
setChildren((curr) =>
Math.min(
maxGuests - adults,
curr + 1
)
);
setBookingError("");
}, [maxGuests, adults]);

const handleBooking =
useCallback(() => {
setBookingError("");

  if (!room || !hotel) {
    return;
  }

  if (availableRooms <= 0) {
    setBookingError(
      language === "vi"
        ? "Phòng này hiện đã hết phòng."
        : "This room is currently sold out."
    );
    return;
  }

  if (!checkIn || !checkOut) {
    setBookingError(
      language === "vi"
        ? "Vui lòng chọn ngày nhận và trả phòng."
        : "Please select check-in and check-out dates."
    );
    return;
  }

  const start = new Date(
    `${checkIn}T00:00:00`
  );

  const end = new Date(
    `${checkOut}T00:00:00`
  );

  if (end <= start) {
    setBookingError(
      language === "vi"
        ? "Ngày trả phòng phải sau ngày nhận phòng."
        : "Check-out must be after check-in."
    );
    return;
  }

  if (
    roomQuantity >
    availableRooms
  ) {
    setBookingError(
      language === "vi"
        ? `Chỉ còn ${availableRooms} phòng.`
        : `Only ${availableRooms} rooms are available.`
    );
    return;
  }

  if (
    totalGuests >
    maxGuests
  ) {
    setBookingError(
      language === "vi"
        ? `Tổng số khách không được vượt quá ${maxGuests} người.`
        : `Total guests must not exceed ${maxGuests} people.`
    );
    return;
  }

  const rooms =
    JSON.stringify([
      {
        roomSlug: room.slug,
        quantity:
          roomQuantity,
      },
    ]);

  const params =
    new URLSearchParams();

  params.set(
    "hotel",
    hotel.slug
  );

  params.set(
    "checkIn",
    checkIn
  );

  params.set(
    "checkOut",
    checkOut
  );

  params.set(
    "adults",
    String(adults)
  );

  params.set(
    "children",
    String(children)
  );

  params.set(
    "rooms",
    rooms
  );

  window.location.href =
    `/dat-phong?${params.toString()}`;
}, [
  room,
  hotel,
  availableRooms,
  checkIn,
  checkOut,
  roomQuantity,
  totalGuests,
  maxGuests,
  adults,
  children,
  language,
]);

// --- Render States ---

if (loading) {
return (
<main className="min-h-screen bg-white">
<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
<div className="animate-pulse space-y-8">
<div className="h-[360px] rounded-2xl bg-slate-100" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="h-5 w-1/2 rounded bg-slate-100" />
            <div className="h-32 rounded-2xl bg-slate-100" />
          </div>

          <div className="h-[500px] rounded-3xl bg-slate-100" />
        </div>
      </div>
    </div>
  </main>
);

}

if (
error ||
!hotel ||
!room
) {
return (
<main className="min-h-screen bg-white">
<div className="mx-auto max-w-4xl px-4 py-24 text-center">
<h1 className="text-2xl font-bold text-slate-900">
{error ||
(language === "vi"
? "Không tìm thấy phòng."
: "Room not found.")}
</h1>

      <Link
        href={`/khach-san/${slug}`}
        className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        {language === "vi"
          ? "Quay lại khách sạn"
          : "Back to hotel"}
      </Link>
    </div>
  </main>
);

}

const currentImage =
images[selectedImage] ||
images[0];

// --- MAIN RENDER ---

return (
<main className="min-h-screen bg-white text-slate-900">
<div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">

    {/* BREADCRUMB */}

    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <Link
        href="/"
        className="transition hover:text-slate-900"
      >
        {language === "vi"
          ? "Trang chủ"
          : "Home"}
      </Link>

      <span>/</span>

      <Link
        href={`/khach-san/${hotel.slug}`}
        className="transition hover:text-slate-900"
      >
        {language === "vi"
          ? hotel.name_vi
          : hotel.name_en}
      </Link>

      <span>/</span>

      <span className="font-medium text-slate-900">
        {language === "vi"
          ? room.name_vi
          : room.name_en}
      </span>
    </div>

    {/* GALLERY */}

    <section className="overflow-hidden rounded-2xl bg-slate-100">
      <div className="relative aspect-[16/6] w-full overflow-hidden">
        {currentImage ? (
          <>
            <img
              src={
                currentImage.public_url
              }
              alt={
                language === "vi"
                  ? currentImage.alt_vi ||
                    room.name_vi
                  : currentImage.alt_en ||
                    room.name_en
              }
              className="h-full w-full object-cover"
              decoding="async"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={
                    handlePreviousImage
                  }
                  aria-label={
                    language === "vi"
                      ? "Ảnh trước"
                      : "Previous image"
                  }
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={
                    handleNextImage
                  }
                  aria-label={
                    language === "vi"
                      ? "Ảnh tiếp theo"
                      : "Next image"
                  }
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            {language === "vi"
              ? "Chưa có hình ảnh"
              : "No image"}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-white p-3">
          {images.map(
            (image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() =>
                  setSelectedImage(
                    index
                  )
                }
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  selectedImage ===
                  index
                    ? "border-slate-900"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={
                    image.public_url
                  }
                  alt={
                    language === "vi"
                      ? image.alt_vi ||
                        room.name_vi
                      : image.alt_en ||
                        room.name_en
                  }
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            )
          )}
        </div>
      )}
    </section>

    {/* CONTENT */}

    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px]">

      {/* LEFT */}

      <div className="min-w-0">
        <div>
          <Link
            href={`/khach-san/${hotel.slug}`}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            {language === "vi"
              ? hotel.name_vi
              : hotel.name_en}
          </Link>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {language === "vi"
              ? room.name_vi
              : room.name_en}
          </h1>

          {(
            hotel.address_vi ||
            hotel.address_en
          ) && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {language === "vi"
                ? hotel.address_vi
                : hotel.address_en}
            </p>
          )}
        </div>

        {/* SPECS */}

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {room.size !== null && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {language === "vi"
                  ? "Diện tích"
                  : "Size"}
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {room.size} m²
              </p>
            </div>
          )}

          {room.max_guests !== null && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {language === "vi"
                  ? "Sức chứa"
                  : "Guests"}
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {room.max_guests}{" "}
                {language === "vi"
                  ? "khách"
                  : "guests"}
              </p>
            </div>
          )}

          {(
            room.beds_vi ||
            room.beds_en
          ) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {language === "vi"
                  ? "Giường"
                  : "Bed"}
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {language === "vi"
                  ? room.beds_vi
                  : room.beds_en}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {language === "vi"
                ? "Phòng còn lại"
                : "Rooms left"}
            </p>

            <p
              className={`mt-2 font-semibold ${
                availableRooms > 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {availableRooms > 0
                ? language === "vi"
                  ? `Còn ${availableRooms} phòng`
                  : `${availableRooms} left`
                : language === "vi"
                ? "Hết phòng"
                : "Sold out"}
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}

        {(
          room.description_vi ||
          room.description_en
        ) && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-950">
              {language === "vi"
                ? "Thông tin phòng"
                : "Room information"}
            </h2>

            <div className="mt-4 whitespace-pre-line text-[15px] leading-8 text-slate-600">
              {language === "vi"
                ? room.description_vi
                : room.description_en}
            </div>
          </section>
        )}

        {/* AROUND AREA */}

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-950">
            {language === "vi"
              ? "Khu vực xung quanh"
              : "Around the area"}
          </h2>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-[15px] leading-7 text-slate-600">
              {language === "vi"
                ? `Khách sạn nằm tại ${
                    hotel.address_vi ||
                    "khu vực trung tâm"
                  }. Bạn có thể dễ dàng tiếp cận các điểm tham quan, khu mua sắm, nhà hàng và các tiện ích xung quanh.`
                : `The hotel is located at ${
                    hotel.address_en ||
                    "a central area"
                  }. Guests can easily access nearby attractions, shopping areas, restaurants and local amenities.`}
            </p>
          </div>
        </section>

        {/* AMENITIES */}

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-950">
            {language === "vi"
              ? "Tiện nghi phòng"
              : "Room amenities"}
          </h2>

          {activeAmenities.length >
          0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {activeAmenities.map(
                (amenity) => (
                  <div
                    key={
                      amenity.id
                    }
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      {getAmenityIcon(
                        amenity.iconKey,
                        amenity.nameVi,
                        amenity.nameEn
                      )}
                    </span>

                    <span className="text-sm font-medium text-slate-800">
                      {language ===
                      "vi"
                        ? amenity.nameVi
                        : amenity.nameEn}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              {language === "vi"
                ? "Chưa có thông tin tiện nghi."
                : "No amenity information available."}
            </p>
          )}
        </section>
      </div>

      {/* BOOKING CARD */}

      <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">

          {/* PRICE */}

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {language === "vi"
                  ? "Giá phòng"
                  : "Room price"}
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                {formatPrice(
                  room.base_price,
                  language
                )}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {language === "vi"
                  ? "mỗi đêm"
                  : "per night"}
              </p>
            </div>

            <div
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                availableRooms >
                0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {availableRooms >
              0
                ? language ===
                  "vi"
                  ? `Còn ${availableRooms} phòng`
                  : `${availableRooms} left`
                : language ===
                  "vi"
                ? "Hết phòng"
                : "Sold out"}
            </div>
          </div>

          <div className="my-6 h-px bg-slate-200" />

          {/* DATES */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                {language === "vi"
                  ? "Nhận phòng"
                  : "Check-in"}
              </label>

              <div
                onClick={() =>
                  openDatePicker(
                    checkInRef
                  )
                }
                className="relative flex h-12 w-full cursor-pointer items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-400 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100"
              >
                <input
                  ref={checkInRef}
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    const val =
                      e.target.value;

                    setCheckIn(val);

                    if (
                      checkOut &&
                      val >=
                        checkOut
                    ) {
                      setCheckOut(
                        ""
                      );
                    }

                    setBookingError(
                      ""
                    );
                  }}
                  className="h-full w-full cursor-pointer border-0 bg-transparent px-4 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                {language === "vi"
                  ? "Trả phòng"
                  : "Check-out"}
              </label>

              <div
                onClick={() =>
                  openDatePicker(
                    checkOutRef
                  )
                }
                className="relative flex h-12 w-full cursor-pointer items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-400 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100"
              >
                <input
                  ref={
                    checkOutRef
                  }
                  type="date"
                  min={
                    checkIn ||
                    today
                  }
                  value={
                    checkOut
                  }
                  onChange={(e) => {
                    setCheckOut(
                      e.target.value
                    );
                    setBookingError(
                      ""
                    );
                  }}
                  className="h-full w-full cursor-pointer border-0 bg-transparent px-4 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* GUESTS */}

          <div className="mt-5 grid grid-cols-2 gap-4">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                {language === "vi"
                  ? "Người lớn"
                  : "Adults"}
              </label>

              <div className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2">

                <button
                  type="button"
                  onClick={
                    handleDecreaseAdults
                  }
                  disabled={
                    adults <= 1
                  }
                  aria-label={
                    language ===
                    "vi"
                      ? "Giảm người lớn"
                      : "Decrease adults"
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="min-w-[32px] text-center text-sm font-semibold text-slate-900">
                  {adults}
                </span>

                <button
                  type="button"
                  onClick={
                    handleIncreaseAdults
                  }
                  disabled={
                    adults >=
                    maxGuests
                  }
                  aria-label={
                    language ===
                    "vi"
                      ? "Tăng người lớn"
                      : "Increase adults"
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                {language === "vi"
                  ? "Trẻ em"
                  : "Children"}
              </label>

              <div className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-2">

                <button
                  type="button"
                  onClick={
                    handleDecreaseChildren
                  }
                  disabled={
                    children <= 0
                  }
                  aria-label={
                    language ===
                    "vi"
                      ? "Giảm trẻ em"
                      : "Decrease children"
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="min-w-[32px] text-center text-sm font-semibold text-slate-900">
                  {children}
                </span>

                <button
                  type="button"
                  onClick={
                    handleIncreaseChildren
                  }
                  disabled={
                    adults +
                      children >=
                    maxGuests
                  }
                  aria-label={
                    language ===
                    "vi"
                      ? "Tăng trẻ em"
                      : "Increase children"
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ROOM QTY */}

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                {language === "vi"
                  ? "Số phòng"
                  : "Rooms"}
              </span>

              <span className="text-xs text-slate-500">
                {language ===
                "vi"
                  ? `Tối đa ${availableRooms}`
                  : `Max ${availableRooms}`}
              </span>
            </div>

            <div className="flex h-12 items-center justify-between rounded-xl border border-slate-200 px-2">

              <button
                type="button"
                onClick={
                  handleDecreaseRooms
                }
                disabled={
                  roomQuantity <=
                  1
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="font-semibold text-slate-900">
                {roomQuantity}
              </span>

              <button
                type="button"
                onClick={
                  handleIncreaseRooms
                }
                disabled={
                  availableRooms <=
                    0 ||
                  roomQuantity >=
                    availableRooms
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* TOTAL */}

          {nights > 0 &&
            room.base_price !==
              null && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {formatPrice(
                      room.base_price,
                      language
                    )}{" "}
                    × {nights}{" "}
                    {language ===
                    "vi"
                      ? "đêm"
                      : "nights"}
                  </span>

                  <span className="font-medium text-slate-800">
                    {formatPrice(
                      room.base_price *
                        nights,
                      language
                    )}
                  </span>
                </div>

                {roomQuantity >
                  1 && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      ×{" "}
                      {
                        roomQuantity
                      }{" "}
                      {language ===
                      "vi"
                        ? "phòng"
                        : "rooms"}
                    </span>

                    <span className="font-medium text-slate-800">
                      {formatPrice(
                        totalPrice,
                        language
                      )}
                    </span>
                  </div>
                )}

                <div className="my-3 h-px bg-slate-200" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    {language ===
                    "vi"
                      ? "Tổng cộng"
                      : "Total"}
                  </span>

                  <span className="text-xl font-bold text-slate-950">
                    {formatPrice(
                      totalPrice,
                      language
                    )}
                  </span>
                </div>
              </div>
            )}

          {bookingError && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
              {bookingError}
            </div>
          )}

          <button
            type="button"
            onClick={
              handleBooking
            }
            disabled={
              availableRooms <=
                0 ||
              totalGuests >
                maxGuests
            }
            className="mt-5 flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {availableRooms <=
            0
              ? language ===
                "vi"
                ? "Hết phòng"
                : "Sold out"
              : language ===
                "vi"
              ? "Đặt phòng"
              : "Book now"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            {language === "vi"
              ? "Bạn sẽ được chuyển đến trang xác nhận đặt phòng."
              : "You will be redirected to the booking confirmation page."}
          </p>
        </div>
      </aside>
    </div>
  </div>
</main>

);
}