/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type RefObject,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

type Language = "vi" | "en";
type StayType = "day" | "month";

type SelectedRoom = {
  hotelSlug: string;
  roomSlug: string;
  quantity: number;
};

type SelectedRoomMap = {
  [roomSlug: string]: number;
};

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
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
  base_price_daily: number | null;
  base_price_monthly: number | null;
  quantity: number | null;
  size: number | null;
  max_guests: number | null;
  beds_vi: string | null;
  beds_en: string | null;
  status: "active" | "inactive";
};

type Media = {
  id: number;
  entity_id: number | null;
  public_url: string;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
  status: "active" | "inactive";
};

type RoomAmenity = {
  id: number;
  room_id: number;
  name_vi: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  status: "active" | "inactive";
};

type AvailabilityRoom = {
  roomId: number;
  roomSlug: string;
  hotelSlug: string;
  totalQuantity: number;
  bookedQuantity: number;
  availableQuantity: number;
  basePrice?: number | null;
  basePriceDaily?: number | null;
  basePriceMonthly?: number | null;
};

type DisplayRoom = Room & {
  image: string;
  imageAlt: string;
  amenitiesVi: string[];
  amenitiesEn: string[];
  availableQuantity: number;
  bookedQuantity: number;
  totalQuantity: number;
};

const fallbackRoomImage = "/images/hero/hero-2.jpg";
const MAX_GUESTS_FALLBACK = 10;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

const formatDate = (value: string) =>
  value && value.length === 10
    ? value.split("-").reverse().join("/")
    : value;

const calculateNights = (
  inDate: string,
  outDate: string
) => {
  if (!inDate || !outDate) return 1;

  const d =
    new Date(outDate).getTime() -
    new Date(inDate).getTime();

  return d > 0
    ? Math.max(1, Math.ceil(d / 86400000))
    : 1;
};

function TimPhongContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hotelSlug =
    searchParams.get("hotel") || "";

  const stayTypeParam =
    searchParams.get("stayType");

  const stayType: StayType =
    stayTypeParam === "month"
      ? "month"
      : "day";

  const checkIn =
    searchParams.get("checkIn") || "";

  const checkOut =
    searchParams.get("checkOut") || "";

  const monthsFromUrl = Math.max(
    1,
    Number(searchParams.get("months")) || 1
  );

  const adults = Math.max(
    1,
    Number(searchParams.get("adults")) || 2
  );

  const children = Math.max(
    0,
    Number(searchParams.get("children")) || 0
  );

  const requestedRooms = Math.max(
    1,
    Number(searchParams.get("rooms")) || 1
  );

  const totalGuests =
    adults + children;

  const [language, setLanguage] =
    useState<Language>(() => {
      if (typeof window === "undefined") {
        return "vi";
      }

      const saved =
        window.localStorage.getItem(
          "huyen-language"
        );

      return saved === "vi" ||
        saved === "en"
        ? saved
        : "vi";
    });

  const [hotels, setHotels] =
    useState<Hotel[]>([]);

  const [loadingHotels, setLoadingHotels] =
    useState(true);

  const [hotel, setHotel] =
    useState<Hotel | null>(null);

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [roomMedia, setRoomMedia] =
    useState<Media[]>([]);

  const [roomAmenities, setRoomAmenities] =
    useState<RoomAmenity[]>([]);

  const [availabilityRooms, setAvailabilityRooms] =
    useState<AvailabilityRoom[]>([]);

  const [selectedRooms, setSelectedRooms] =
    useState<SelectedRoomMap>({});

  const [loading, setLoading] =
    useState(true);

  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [availabilityError, setAvailabilityError] =
    useState("");

  const [editHotel, setEditHotel] =
    useState(hotelSlug);

  const [editStayType, setEditStayType] =
    useState<StayType>(stayType);

  const [editCheckIn, setEditCheckIn] =
    useState(checkIn);

  const [editCheckOut, setEditCheckOut] =
    useState(checkOut);

  const [editMonths, setEditMonths] =
    useState(monthsFromUrl);

  const [editAdults, setEditAdults] =
    useState(adults);

  const [editChildren, setEditChildren] =
    useState(children);

  const [editError, setEditError] =
    useState("");

  const checkInRef =
    useRef<HTMLInputElement>(null);

  const checkOutRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    setLoadingHotels(true);

    (async () => {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("hotels")
          .select(
            "id,slug,name_vi,name_en,address_vi,address_en,status"
          )
          .eq("status", "active")
          .order("id");

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setHotels(
            (data || []) as unknown as Hotel[]
          );
        }
      } catch (error) {
        console.error(
          "Không tải được danh sách khách sạn:",
          error
        );

        if (!cancelled) {
          setHotels([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingHotels(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
    Đồng bộ URL với form.
  */
  useEffect(() => {
    setEditHotel(hotelSlug);
    setEditStayType(stayType);
    setEditCheckIn(checkIn);
    setEditCheckOut(checkOut);
    setEditMonths(monthsFromUrl);
    setEditAdults(adults);
    setEditChildren(children);
    setEditError("");
    setSelectedRooms({});
  }, [
    hotelSlug,
    stayType,
    checkIn,
    checkOut,
    monthsFromUrl,
    adults,
    children,
  ]);

  /*
    Đồng bộ ngôn ngữ.
  */
  useEffect(() => {
    const handleLanguageChange = () => {
      const current =
        window.localStorage.getItem(
          "huyen-language"
        );

      if (
        current === "vi" ||
        current === "en"
      ) {
        setLanguage(current);
      }
    };

    window.addEventListener(
      "language-change",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange
      );
    };
  }, []);

  /*
    Đồng bộ khách sạn hiện tại.
  */
  useEffect(() => {
    if (!hotelSlug) {
      setHotel(null);
      return;
    }

    const selectedHotel =
      hotels.find(
        (item) =>
          item.slug === hotelSlug
      ) || null;

    setHotel(selectedHotel);
  }, [
    hotelSlug,
    hotels,
  ]);

  /*
    Tải thông tin khách sạn + phòng.

    Day:
      cần checkIn/checkOut.

    Month:
      không cần checkIn/checkOut.
  */
  useEffect(() => {
    if (!hotelSlug) {
      setLoading(false);
      setHotel(null);
      setRooms([]);
      setRoomMedia([]);
      setRoomAmenities([]);
      return;
    }

    if (
      stayType === "day" &&
      (!checkIn || !checkOut)
    ) {
      setLoading(false);
      setRooms([]);
      setRoomMedia([]);
      setRoomAmenities([]);
      return;
    }

    let cancelled = false;

    setLoading(true);

    (async () => {
      try {
        const {
          data: hotelData,
          error: hotelError,
        } = await supabase
          .from("hotels")
          .select(
            "id,slug,name_vi,name_en,address_vi,address_en,status"
          )
          .eq("slug", hotelSlug)
          .eq("status", "active")
          .maybeSingle();

        if (hotelError) {
          throw hotelError;
        }

        if (!hotelData) {
          if (!cancelled) {
            setHotel(null);
            setRooms([]);
            setRoomMedia([]);
            setRoomAmenities([]);
          }

          return;
        }

        const currentHotel =
          hotelData as unknown as Hotel;

        if (!cancelled) {
          setHotel(currentHotel);
        }

        const {
          data: roomData,
          error: roomError,
        } = await supabase
          .from("rooms")
          .select(
            "id,hotel_id,slug,name_vi,name_en,description_vi,description_en,base_price_daily,base_price_monthly,quantity,size,max_guests,beds_vi,beds_en,status"
          )
          .eq(
            "hotel_id",
            currentHotel.id
          )
          .eq("status", "active")
          .order("id");

        if (roomError) {
          throw roomError;
        }

        const currentRooms =
          (roomData || []) as unknown as Room[];

        if (!cancelled) {
          setRooms(currentRooms);
        }

        if (!currentRooms.length) {
          if (!cancelled) {
            setRoomMedia([]);
            setRoomAmenities([]);
          }

          return;
        }

        const ids = currentRooms.map(
          (room) => room.id
        );

        const [
          mediaResult,
          amenitiesResult,
        ] = await Promise.all([
          supabase
            .from("media")
            .select(
              "id,entity_id,public_url,alt_vi,alt_en,is_cover,sort_order,status"
            )
            .eq("entity_type", "room")
            .in("entity_id", ids)
            .eq("status", "active")
            .order("is_cover", {
              ascending: false,
            })
            .order("sort_order"),

          supabase
            .from("room_amenities")
            .select(
              "id,room_id,name_vi,name_en,icon,sort_order,status"
            )
            .in("room_id", ids)
            .eq("status", "active")
            .order("sort_order"),
        ]);

        if (mediaResult.error) {
          throw mediaResult.error;
        }

        if (amenitiesResult.error) {
          throw amenitiesResult.error;
        }

        if (!cancelled) {
          setRoomMedia(
            (mediaResult.data || []) as unknown as Media[]
          );

          setRoomAmenities(
            (amenitiesResult.data || []) as unknown as RoomAmenity[]
          );
        }
      } catch (error) {
        console.error(
          "Không tải được phòng:",
          error
        );

        if (!cancelled) {
          setHotel(null);
          setRooms([]);
          setRoomMedia([]);
          setRoomAmenities([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    hotelSlug,
    stayType,
    checkIn,
    checkOut,
  ]);

  /*
    Kiểm tra availability cho cả ngày và tháng.

    Day:
      gửi hotelSlug + checkIn + checkOut.

    Month:
      gửi hotelSlug + stayType=month + months.
      API tự xác định khoảng thời gian tháng
      dựa trên ngày hiện tại.
  */
  useEffect(() => {
    if (!hotelSlug) {
      setAvailabilityRooms([]);
      setLoadingAvailability(false);
      setAvailabilityError("");
      return;
    }

    if (
      stayType === "day" &&
      (!checkIn || !checkOut)
    ) {
      setAvailabilityRooms([]);
      setLoadingAvailability(false);
      setAvailabilityError("");
      return;
    }

    if (
      stayType === "month" &&
      monthsFromUrl < 1
    ) {
      setAvailabilityRooms([]);
      setLoadingAvailability(false);
      setAvailabilityError("");
      return;
    }

    let cancelled = false;

    setLoadingAvailability(true);
    setAvailabilityError("");
    setAvailabilityRooms([]);

    (async () => {
      try {
        const response = await fetch(
          "/api/availability",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              stayType === "month"
                ? {
                    hotelSlug,
                    stayType: "month",
                    months: monthsFromUrl,
                  }
                : {
                    hotelSlug,
                    stayType: "day",
                    checkIn,
                    checkOut,
                  }
            ),
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Không kiểm tra được tình trạng phòng"
          );
        }

        const apiRooms =
          Array.isArray(data?.rooms)
            ? data.rooms
            : [];

        if (!cancelled) {
          setAvailabilityRooms(
            apiRooms.filter(
              (room: AvailabilityRoom) =>
                room.hotelSlug ===
                hotelSlug
            )
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAvailabilityRooms([]);
          setAvailabilityError(
            error instanceof Error
              ? error.message
              : "Lỗi kiểm tra phòng"
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAvailability(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    stayType,
    hotelSlug,
    checkIn,
    checkOut,
    monthsFromUrl,
  ]);

  const roomCoverMap = useMemo(() => {
    const map: Record<
      number,
      Media
    > = {};

    for (const media of roomMedia) {
      if (
        media.entity_id === null
      ) {
        continue;
      }

      const current =
        map[media.entity_id];

      if (
        !current ||
        (media.is_cover &&
          !current.is_cover) ||
        (media.is_cover ===
          current.is_cover &&
          media.sort_order <
            current.sort_order)
      ) {
        map[media.entity_id] =
          media;
      }
    }

    return map;
  }, [roomMedia]);

  /*
    Danh sách phòng phù hợp.

    Cả Day và Month đều lấy
    availableQuantity từ API.

    Không còn lấy room.quantity trực tiếp
    cho thuê tháng.
  */
  const availableRooms =
    useMemo<DisplayRoom[]>(() => {
      if (!hotel) {
        return [];
      }

      return rooms
        .map((room) => {
          const availability =
            availabilityRooms.find(
              (item) =>
                item.roomId ===
                room.id
            );

          const cover =
            roomCoverMap[room.id];

          const amenities =
            roomAmenities.filter(
              (item) =>
                item.room_id ===
                room.id
            );

          const totalQuantity =
            Math.max(
              Number(
                availability?.totalQuantity ??
                  room.quantity ??
                  0
              ) || 0,
              0
            );

          const bookedQuantity =
            Math.max(
              Number(
                availability?.bookedQuantity ??
                  0
              ) || 0,
              0
            );

          const availableQuantity =
            Math.max(
              Number(
                availability?.availableQuantity ??
                  0
              ) || 0,
              0
            );

          return {
            ...room,
            image:
              cover?.public_url ||
              fallbackRoomImage,
            imageAlt:
              (
                language === "vi"
                  ? cover?.alt_vi
                  : cover?.alt_en
              ) ||
              room.name_vi ||
              room.name_en,
            amenitiesVi:
              amenities.map(
                (item) =>
                  item.name_vi
              ),
            amenitiesEn:
              amenities.map(
                (item) =>
                  item.name_en
              ),
            totalQuantity,
            bookedQuantity,
            availableQuantity,
          };
        })
        .filter((room) => {
          const maxGuests =
            room.max_guests ??
            MAX_GUESTS_FALLBACK;

          const price =
            stayType === "month"
              ? Number(
                  room.base_price_monthly
                ) || 0
              : Number(
                  room.base_price_daily
                ) || 0;

          return (
            room.status ===
              "active" &&
            room.hotel_id ===
              hotel.id &&
            maxGuests >=
              totalGuests &&
            room.availableQuantity >
              0 &&
            price > 0
          );
        })
        .sort((a, b) => {
          const priceA =
            stayType === "month"
              ? Number(
                  a.base_price_monthly
                ) || 0
              : Number(
                  a.base_price_daily
                ) || 0;

          const priceB =
            stayType === "month"
              ? Number(
                  b.base_price_monthly
                ) || 0
              : Number(
                  b.base_price_daily
                ) || 0;

          return priceA - priceB;
        });
    }, [
      rooms,
      hotel,
      totalGuests,
      availabilityRooms,
      roomCoverMap,
      roomAmenities,
      language,
      stayType,
    ]);

  const nights = useMemo(
    () =>
      calculateNights(
        checkIn,
        checkOut
      ),
    [checkIn, checkOut]
  );

  const selectedRoomCount =
    useMemo(
      () =>
        Object.values(
          selectedRooms
        ).reduce(
          (sum, quantity) =>
            sum + quantity,
          0
        ),
      [selectedRooms]
    );

  const selectedTotal =
    useMemo(() => {
      return availableRooms.reduce(
        (sum, room) => {
          const quantity =
            selectedRooms[
              room.slug
            ] || 0;

          const price =
            stayType === "month"
              ? Number(
                  room.base_price_monthly
                ) || 0
              : Number(
                  room.base_price_daily
                ) || 0;

          const duration =
            stayType === "month"
              ? monthsFromUrl
              : nights;

          return (
            sum +
            price *
              quantity *
              duration
          );
        },
        0
      );
    }, [
      availableRooms,
      selectedRooms,
      stayType,
      monthsFromUrl,
      nights,
    ]);

  const openDatePicker =
    useCallback(
      (
        ref: RefObject<
          HTMLInputElement | null
        >
      ) => {
        ref.current?.focus();

        try {
          (
            ref.current as
              | (HTMLInputElement & {
                  showPicker?: () => void;
                })
              | null
          )?.showPicker?.();
        } catch {}
      },
      []
    );

  /*
    Đổi loại thuê.
  */
  const handleStayTypeChange =
    useCallback(
      (value: StayType) => {
        setEditStayType(value);
        setEditError("");
        setSelectedRooms({});

        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        params.set(
          "stayType",
          value
        );

        if (value === "day") {
          params.delete("months");

          if (editCheckIn) {
            params.set(
              "checkIn",
              editCheckIn
            );
          }

          if (editCheckOut) {
            params.set(
              "checkOut",
              editCheckOut
            );
          }
        } else {
          params.delete("checkIn");
          params.delete("checkOut");

          params.set(
            "months",
            String(
              Math.max(
                1,
                Math.floor(
                  editMonths
                )
              )
            )
          );
        }

        router.replace(
          `/tim-phong?${params.toString()}`
        );
      },
      [
        searchParams,
        router,
        editCheckIn,
        editCheckOut,
        editMonths,
      ]
    );

  /*
    Áp dụng thay đổi tìm phòng.
  */
  const applyBookingChanges =
    useCallback(() => {
      setEditError("");

      if (!editHotel) {
        setEditError(
          language === "vi"
            ? "Vui lòng chọn khách sạn"
            : "Please select a hotel"
        );
        return;
      }

      if (
        editStayType === "day"
      ) {
        if (
          !editCheckIn ||
          !editCheckOut
        ) {
          setEditError(
            language === "vi"
              ? "Chọn ngày vào và ngày ra"
              : "Select check-in/out dates"
          );
          return;
        }

        if (
          editCheckOut <=
          editCheckIn
        ) {
          setEditError(
            language === "vi"
              ? "Ngày ra phải sau ngày vào"
              : "Check-out must be after check-in"
          );
          return;
        }

        if (
          calculateNights(
            editCheckIn,
            editCheckOut
          ) < 1
        ) {
          setEditError(
            language === "vi"
              ? "Khoảng thời gian không hợp lệ"
              : "Invalid date range"
          );
          return;
        }
      }

      if (
        editStayType === "month"
      ) {
        if (
          !Number.isFinite(
            editMonths
          ) ||
          editMonths < 1
        ) {
          setEditError(
            language === "vi"
              ? "Số tháng phải từ 1 tháng trở lên"
              : "Months must be at least 1"
          );
          return;
        }
      }

      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      params.set(
        "hotel",
        editHotel
      );

      params.set(
        "stayType",
        editStayType
      );

      if (
        editStayType === "day"
      ) {
        params.set(
          "checkIn",
          editCheckIn
        );

        params.set(
          "checkOut",
          editCheckOut
        );

        params.delete("months");
      } else {
        params.delete("checkIn");
        params.delete("checkOut");

        params.set(
          "months",
          String(
            Math.max(
              1,
              Math.floor(
                editMonths
              )
            )
          )
        );
      }

      params.set(
        "adults",
        String(
          Math.max(
            1,
            editAdults
          )
        )
      );

      params.set(
        "children",
        String(
          Math.max(
            0,
            editChildren
          )
        )
      );

      params.set(
        "rooms",
        String(
          requestedRooms
        )
      );

      router.replace(
        `/tim-phong?${params.toString()}`
      );
    }, [
      editHotel,
      editStayType,
      editCheckIn,
      editCheckOut,
      editMonths,
      editAdults,
      editChildren,
      searchParams,
      requestedRooms,
      router,
      language,
    ]);

  /*
    Khi đổi khách sạn.
  */
  const handleHotelChange =
    useCallback(
      (value: string) => {
        setEditHotel(value);
        setSelectedRooms({});
        setEditError("");

        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        if (value) {
          params.set(
            "hotel",
            value
          );
        } else {
          params.delete(
            "hotel"
          );
        }

        router.replace(
          params.toString()
            ? `/tim-phong?${params.toString()}`
            : "/tim-phong"
        );
      },
      [
        searchParams,
        router,
      ]
    );

  const changeRoomQuantity =
    useCallback(
      (
        room: DisplayRoom,
        delta: number
      ) => {
        setSelectedRooms(
          (previous) => {
            const current =
              previous[
                room.slug
              ] || 0;

            const next =
              Math.min(
                Math.max(
                  current +
                    delta,
                  0
                ),
                room.availableQuantity
              );

            const result = {
              ...previous,
            };

            if (next <= 0) {
              delete result[
                room.slug
              ];
            } else {
              result[
                room.slug
              ] = next;
            }

            return result;
          }
        );
      },
      []
    );

  /*
    Chuyển sang /dat-phong.
  */
  const continueBooking =
    useCallback(() => {
      if (
        selectedRoomCount <= 0 ||
        !hotel
      ) {
        return;
      }

      const selected: SelectedRoom[] =
        Object.entries(
          selectedRooms
        )
          .filter(
            ([, quantity]) =>
              quantity > 0
          )
          .map(
            ([slug, quantity]) => ({
              hotelSlug:
                hotel.slug,
              roomSlug: slug,
              quantity,
            })
          );

      if (!selected.length) {
        return;
      }

      const params =
        new URLSearchParams();

      params.set(
        "hotel",
        hotel.slug
      );

      params.set(
        "rooms",
        JSON.stringify(selected)
      );

      params.set(
        "stayType",
        stayType
      );

      if (
        stayType === "day"
      ) {
        params.set(
          "checkIn",
          checkIn
        );

        params.set(
          "checkOut",
          checkOut
        );
      } else {
        params.set(
          "months",
          String(
            monthsFromUrl
          )
        );
      }

      params.set(
        "adults",
        String(adults)
      );

      params.set(
        "children",
        String(children)
      );

      params.set(
        "roomsCount",
        String(requestedRooms)
      );

      router.push(
        `/dat-phong?${params.toString()}`
      );
    }, [
      selectedRoomCount,
      selectedRooms,
      hotel,
      stayType,
      checkIn,
      checkOut,
      monthsFromUrl,
      adults,
      children,
      requestedRooms,
      router,
    ]);

  const hotelName = hotel
    ? language === "vi"
      ? hotel.name_vi
      : hotel.name_en
    : "";

  const hotelAddress = hotel
    ? language === "vi"
      ? hotel.address_vi
      : hotel.address_en
    : "";

  const hasValidSearch =
    Boolean(hotelSlug) &&
    (stayType === "month"
      ? monthsFromUrl >= 1
      : Boolean(
          checkIn &&
            checkOut
        ));

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Huyen&apos;s Hotels & Stays
            </Link>

            {hotelName && (
              <p className="mt-1 text-sm text-neutral-500">
                {hotelName}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            ←{" "}
            {language === "vi"
              ? "Quay lại"
              : "Back"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {language === "vi"
              ? "Tìm phòng"
              : "Find a room"}
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {language === "vi"
              ? "Chọn phòng"
              : "Choose your room"}
          </h1>
        </div>

        <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              {language === "vi"
                ? "Thông tin đặt phòng"
                : "Booking information"}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {editStayType ===
              "month"
                ? language === "vi"
                  ? "Chọn khách sạn, số tháng và số khách."
                  : "Choose your hotel, number of months and guests."
                : language === "vi"
                  ? "Chọn khách sạn, ngày vào, ngày đi và số khách."
                  : "Choose your hotel, dates and guests."}
            </p>
          </div>

          <div className="mb-5">
            <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
              <button
                type="button"
                onClick={() =>
                  handleStayTypeChange(
                    "day"
                  )
                }
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                  editStayType ===
                  "day"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-neutral-500 hover:text-slate-900"
                }`}
              >
                {language === "vi"
                  ? "Theo ngày"
                  : "Daily"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStayTypeChange(
                    "month"
                  )
                }
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                  editStayType ===
                  "month"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-neutral-500 hover:text-slate-900"
                }`}
              >
                {language === "vi"
                  ? "Theo tháng"
                  : "Monthly"}
              </button>
            </div>
          </div>

          <div
            className={
              editStayType ===
              "month"
                ? "grid gap-4 lg:grid-cols-[1.25fr_1fr_1.5fr_auto]"
                : "grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr_1.5fr_auto]"
            }
          >
            <div>
              <label
                htmlFor="tim-phong-hotel"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                {language === "vi"
                  ? "Khách sạn"
                  : "Hotel"}
              </label>

              <select
                id="tim-phong-hotel"
                value={editHotel}
                onChange={(event) =>
                  handleHotelChange(
                    event.target.value
                  )
                }
                disabled={
                  loadingHotels
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/10 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
              >
                <option value="">
                  {loadingHotels
                    ? language === "vi"
                      ? "Đang tải khách sạn..."
                      : "Loading hotels..."
                    : language === "vi"
                      ? "Chọn khách sạn"
                      : "Select hotel"}
                </option>

                {hotels.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.slug}
                    >
                      {language ===
                      "vi"
                        ? item.name_vi
                        : item.name_en}
                    </option>
                  )
                )}
              </select>
            </div>

            {editStayType ===
            "day" ? (
              <>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {language === "vi"
                      ? "Ngày vào"
                      : "Check-in"}
                  </label>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      openDatePicker(
                        checkInRef
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {
                        event.preventDefault();

                        openDatePicker(
                          checkInRef
                        );
                      }
                    }}
                    className="relative flex h-12 w-full cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-4 hover:border-slate-400 focus-within:border-slate-500"
                  >
                    <input
                      ref={
                        checkInRef
                      }
                      type="date"
                      min={
                        new Date()
                          .toISOString()
                          .split(
                            "T"
                          )[0]
                      }
                      value={
                        editCheckIn
                      }
                      onChange={(
                        event
                      ) =>
                        setEditCheckIn(
                          event
                            .target
                            .value
                        )
                      }
                      className="h-full w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {language === "vi"
                      ? "Ngày đi"
                      : "Check-out"}
                  </label>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      openDatePicker(
                        checkOutRef
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {
                        event.preventDefault();

                        openDatePicker(
                          checkOutRef
                        );
                      }
                    }}
                    className="relative flex h-12 w-full cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-4 hover:border-slate-400 focus-within:border-slate-500"
                  >
                    <input
                      ref={
                        checkOutRef
                      }
                      type="date"
                      value={
                        editCheckOut
                      }
                      min={
                        editCheckIn ||
                        new Date()
                          .toISOString()
                          .split(
                            "T"
                          )[0]
                      }
                      onChange={(
                        event
                      ) =>
                        setEditCheckOut(
                          event
                            .target
                            .value
                        )
                      }
                      className="h-full w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {language === "vi"
                    ? "Thời gian thuê"
                    : "Rental period"}
                </label>

                <select
                  value={
                    editMonths
                  }
                  onChange={(
                    event
                  ) =>
                    setEditMonths(
                      Math.max(
                        1,
                        Number(
                          event
                            .target
                            .value
                        ) || 1
                      )
                    )
                  }
                  className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/10"
                >
                  {Array.from(
                    {
                      length: 12,
                    },
                    (
                      _,
                      index
                    ) => {
                      const value =
                        index +
                        1;

                      return (
                        <option
                          key={
                            value
                          }
                          value={
                            value
                          }
                        >
                          {value}{" "}
                          {language ===
                          "vi"
                            ? "tháng"
                            : value ===
                                1
                              ? "month"
                              : "months"}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {language === "vi"
                  ? "Khách"
                  : "Guests"}
              </label>

              <div className="flex h-12 items-center gap-4 rounded-xl border border-neutral-200 bg-white px-3">
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-sm text-neutral-600">
                    {language ===
                    "vi"
                      ? "Người lớn"
                      : "Adults"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditAdults(
                          (
                            value
                          ) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-slate-700 hover:bg-neutral-100"
                    >
                      −
                    </button>

                    <span className="w-5 text-center text-sm font-semibold text-slate-900">
                      {
                        editAdults
                      }
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setEditAdults(
                          (
                            value
                          ) =>
                            value + 1
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-slate-700 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="h-6 w-px bg-neutral-200" />

                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-sm text-neutral-600">
                    {language ===
                    "vi"
                      ? "Trẻ em"
                      : "Children"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditChildren(
                          (
                            value
                          ) =>
                            Math.max(
                              0,
                              value - 1
                            )
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-slate-700 hover:bg-neutral-100"
                    >
                      −
                    </button>

                    <span className="w-5 text-center text-sm font-semibold text-slate-900">
                      {
                        editChildren
                      }
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setEditChildren(
                          (
                            value
                          ) =>
                            value + 1
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-slate-700 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={
                  applyBookingChanges
                }
                className="h-12 w-full rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 lg:min-w-[120px]"
              >
                {language === "vi"
                  ? "Cập nhật"
                  : "Update"}
              </button>
            </div>
          </div>

          {editError && (
            <div
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              role="alert"
            >
              {editError}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-1.5 text-sm text-neutral-500">
              {hotelAddress && (
                <>
                  <span
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    📍
                  </span>

                  <span className="text-slate-700">
                    {hotelAddress}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-2 text-sm text-neutral-500 sm:justify-end">
              {stayType ===
              "day" ? (
                <>
                  <span>
                    {language ===
                    "vi"
                      ? "Vào:"
                      : "Check-in:"}{" "}
                    <strong className="text-slate-800">
                      {formatDate(
                        checkIn
                      )}
                    </strong>
                  </span>

                  <span>
                    {language ===
                    "vi"
                      ? "Đi:"
                      : "Check-out:"}{" "}
                    <strong className="text-slate-800">
                      {formatDate(
                        checkOut
                      )}
                    </strong>
                  </span>

                  <span>
                    {nights}{" "}
                    {language ===
                    "vi"
                      ? "đêm"
                      : "nights"}
                  </span>
                </>
              ) : (
                <span>
                  {monthsFromUrl}{" "}
                  {language ===
                  "vi"
                    ? "tháng"
                    : monthsFromUrl ===
                        1
                      ? "month"
                      : "months"}
                </span>
              )}

              <span>
                {totalGuests}{" "}
                {language ===
                "vi"
                  ? "khách"
                  : "guests"}
              </span>

              <span>
                {requestedRooms}{" "}
                {language ===
                "vi"
                  ? "phòng"
                  : "room(s)"}
              </span>
            </div>
          </div>
        </section>

        {!hasValidSearch ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              {language === "vi"
                ? "Chọn thông tin để tìm phòng"
                : "Enter your search details"}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-500">
              {stayType ===
              "month"
                ? language === "vi"
                  ? "Vui lòng chọn khách sạn và số tháng, sau đó bấm Cập nhật."
                  : "Please select a hotel and number of months, then click Update."
                : language === "vi"
                  ? "Vui lòng chọn khách sạn, ngày nhận phòng và ngày trả phòng, sau đó bấm Cập nhật."
                  : "Please select a hotel, check-in and check-out dates, then click Update."}
            </p>
          </div>
        ) : (
          <>
            {loading && (
              <div className="space-y-5">
                {[1, 2].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-72 animate-pulse rounded-2xl bg-neutral-200"
                    />
                  )
                )}
              </div>
            )}

            {!loading &&
              loadingAvailability && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-slate-800" />

                  {language === "vi"
                    ? "Đang kiểm tra phòng trống..."
                    : "Checking availability..."}
                </div>
              )}

            {!loading &&
              !loadingAvailability &&
              availabilityError && (
                <div
                  className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                  role="alert"
                >
                  {
                    availabilityError
                  }
                </div>
              )}

            {!loading &&
              !loadingAvailability &&
              !availabilityError &&
              availableRooms.length ===
                0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">
                    {language === "vi"
                      ? "Không còn phòng phù hợp"
                      : "No suitable rooms available"}
                  </h2>

                  <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-500">
                    {stayType ===
                    "month"
                      ? language === "vi"
                        ? "Không có phòng có giá tháng hoặc phòng phù hợp với số khách trong khoảng thời gian đã chọn."
                        : "No rooms with a monthly price are available for your guest count during the selected period."
                      : language === "vi"
                        ? "Thay đổi ngày hoặc số khách thử lại."
                        : "Try changing dates or guest count."}
                  </p>
                </div>
              )}

            {!loading &&
              !loadingAvailability &&
              !availabilityError &&
              availableRooms.length >
                0 && (
                <div className="space-y-6">
                  {availableRooms.map(
                    (room) => {
                      const quantity =
                        selectedRooms[
                          room.slug
                        ] || 0;

                      const roomName =
                        language ===
                        "vi"
                          ? room.name_vi
                          : room.name_en;

                      const description =
                        language ===
                        "vi"
                          ? room.description_vi
                          : room.description_en;

                      const beds =
                        language ===
                        "vi"
                          ? room.beds_vi
                          : room.beds_en;

                      const amenities =
                        language ===
                        "vi"
                          ? room.amenitiesVi
                          : room.amenitiesEn;

                      const roomPrice =
                        stayType ===
                        "month"
                          ? Number(
                              room.base_price_monthly
                            ) || 0
                          : Number(
                              room.base_price_daily
                            ) || 0;

                      return (
                        <article
                          key={
                            room.id
                          }
                          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                        >
                          <div className="grid lg:grid-cols-[360px_1fr]">
                            <div className="relative h-64 bg-neutral-100 sm:h-80 lg:h-full lg:min-h-[360px]">
                              <Image
                                src={
                                  room.image
                                }
                                alt={
                                  room.imageAlt
                                }
                                fill
                                unoptimized
                                sizes="(max-width: 1024px) 100vw, 360px"
                                className="object-cover"
                              />

                              {room.availableQuantity >
                                0 && (
                                <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800">
                                  {language ===
                                  "vi"
                                    ? `Còn ${room.availableQuantity} phòng`
                                    : `${room.availableQuantity} available`}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col p-5 sm:p-7">
                              <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                                <div>
                                  <h2 className="text-2xl font-bold text-slate-900">
                                    {
                                      roomName
                                    }
                                  </h2>

                                  {description && (
                                    <p className="mt-3 text-sm text-neutral-600">
                                      {
                                        description
                                      }
                                    </p>
                                  )}
                                </div>

                                <div className="shrink-0 text-left sm:text-right">
                                  <div className="text-xl font-bold text-slate-900">
                                    {formatPrice(
                                      roomPrice
                                    )}{" "}
                                    ₫
                                  </div>

                                  <div className="text-xs text-neutral-500">
                                    {stayType ===
                                    "month"
                                      ? language ===
                                        "vi"
                                        ? "/tháng"
                                        : "/month"
                                      : language ===
                                          "vi"
                                        ? "/đêm"
                                        : "/night"}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex flex-wrap gap-2">
                                {room.size && (
                                  <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs">
                                    {
                                      room.size
                                    }{" "}
                                    m²
                                  </span>
                                )}

                                {room.max_guests && (
                                  <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs">
                                    {language ===
                                    "vi"
                                      ? `Tối đa ${room.max_guests} khách`
                                      : `Up to ${room.max_guests}`}
                                  </span>
                                )}

                                {beds && (
                                  <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs">
                                    {
                                      beds
                                    }
                                  </span>
                                )}
                              </div>

                              {amenities.length >
                                0 && (
                                <div className="mt-6">
                                  <h3 className="text-sm font-semibold text-slate-900">
                                    {language ===
                                    "vi"
                                      ? "Tiện nghi"
                                      : "Amenities"}
                                  </h3>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {amenities.map(
                                      (
                                        amenity,
                                        index
                                      ) => (
                                        <span
                                          key={
                                            index
                                          }
                                          className="rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600"
                                        >
                                          {
                                            amenity
                                          }
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="mt-auto flex flex-col gap-4 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-between">
                                <Link
                                  href={`/khach-san/${hotelSlug}/phong/${room.slug}`}
                                  className="text-sm font-semibold text-slate-800 hover:text-slate-950"
                                >
                                  {language ===
                                  "vi"
                                    ? "Xem chi tiết"
                                    : "View details"}{" "}
                                  →
                                </Link>

                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-medium text-neutral-600">
                                    {language ===
                                    "vi"
                                      ? "Đặt phòng"
                                      : "Book now"}
                                  </span>

                                  <div className="flex items-center rounded-full border border-neutral-300">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        changeRoomQuantity(
                                          room,
                                          -1
                                        )
                                      }
                                      disabled={
                                        quantity <=
                                        0
                                      }
                                      className="flex h-10 w-10 items-center justify-center rounded-l-full disabled:opacity-40"
                                    >
                                      −
                                    </button>

                                    <span className="w-10 text-center text-sm font-bold">
                                      {
                                        quantity
                                      }
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        changeRoomQuantity(
                                          room,
                                          1
                                        )
                                      }
                                      disabled={
                                        quantity >=
                                        room.availableQuantity
                                      }
                                      className="flex h-10 w-10 items-center justify-center rounded-r-full disabled:opacity-40"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
          </>
        )}
      </div>

      {selectedRoomCount >
        0 && (
        <div className="sticky bottom-0 z-40 border-t border-neutral-200 bg-white/95 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="text-sm font-medium text-neutral-500">
                {
                  selectedRoomCount
                }{" "}
                {language ===
                "vi"
                  ? "phòng đã chọn"
                  : "room(s) selected"}
              </div>

              <div className="mt-1 text-xl font-bold text-slate-900">
                {
                  formatPrice(
                    selectedTotal
                  )
                }{" "}
                ₫
              </div>

              <div className="text-xs text-neutral-500">
                {stayType ===
                "month"
                  ? `${monthsFromUrl} ${
                      language ===
                      "vi"
                        ? "tháng"
                        : monthsFromUrl ===
                            1
                          ? "month"
                          : "months"
                    }`
                  : `${nights} ${
                      language ===
                      "vi"
                        ? "đêm"
                        : "nights"
                    }`}
              </div>
            </div>

            <button
              type="button"
              onClick={
                continueBooking
              }
              className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {language ===
              "vi"
                ? "Tiếp tục đặt phòng"
                : "Continue booking"}{" "}
              →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function TimPhongLoading() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-neutral-200" />

        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-neutral-200" />

        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-neutral-200" />
      </div>
    </main>
  );
}

export default function TimPhongPage() {
  return (
    <Suspense
      fallback={
        <TimPhongLoading />
      }
    >
      <TimPhongContent />
    </Suspense>
  );
}