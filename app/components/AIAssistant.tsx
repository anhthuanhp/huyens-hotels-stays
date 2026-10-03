
"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Check,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type Language = "vi" | "en";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AIAssistantProps = {
  language?: Language;
};

type AiRoomOption = {
  hotelId: number;
  hotelSlug: string;
  hotelNameVi: string;
  hotelNameEn: string;
  roomId: number;
  roomSlug: string;
  roomNameVi: string;
  roomNameEn: string;
  descriptionVi: string | null;
  descriptionEn: string | null;
  image: string | null;
  maxGuests: number | null;
  basePriceDaily: number | null;
  basePriceMonthly: number | null;
  totalQuantity: number;
  availableQuantity: number;
  bedsVi: string | null;
  bedsEn: string | null;
  amenitiesVi: string[] | null;
  amenitiesEn: string[] | null;
};

type BookingDraftRoom = {
  roomSlug: string;
  roomName: string;
  quantity: number;
  pricePerNight: number;
};

type BookingDraft = {
  hotelSlug: string | null;
  hotelName: string | null;
  stayType: "day" | "month";
  checkIn: string | null;
  checkOut: string | null;
  months: number | null;
  adults: number | null;
  children: number | null;
  rooms: BookingDraftRoom[];
  fullName: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  availabilityChecked: boolean;
  customerConfirmed: boolean;
  awaitingConfirmation?: boolean;
  bookingCompleted?: boolean;
};

type BookingResult = {
  success?: boolean;
  bookingCode?: string;
  booking_code?: string;
  booking?: {
    bookingCode?: string;
    booking_code?: string;
    id?: number;
  };
  [key: string]: unknown;
};

type AIResponse = {
  answer?: unknown;
  error?: unknown;
  bookingDraft?: BookingDraft | null;
  availableRooms?: AiRoomOption[];
  bookingResult?: BookingResult | null;
  action?:
    | "none"
    | "check_availability"
    | "select_room"
    | "collect_guest"
    | "confirm"
    | "booked";
};

type SendOptions = {
  selectedRoomSlug?: string | null;
};

declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
    "open-ai-assistant": Event;
  }
}

const INITIAL_MESSAGE_VI =
  "Xin chào! Tôi là trợ lý của Huyen's. Tôi có thể giúp bạn tìm thông tin về khách sạn, phòng, tiện nghi, giá phòng và đặt phòng.";

const INITIAL_MESSAGE_EN =
  "Hello! I'm Huyen's assistant. I can help you find information about our hotels, rooms, amenities, room prices, and booking.";

const QUICK_QUESTIONS_VI = [
  "Có những khách sạn nào?",
  "Khách sạn nào có thang máy?",
  "Khách sạn nào có Wi-Fi miễn phí?",
  "Khách sạn nào có máy lạnh?",
];

const QUICK_QUESTIONS_EN = [
  "Which hotels are available?",
  "Which hotels have an elevator?",
  "Which hotels offer free Wi-Fi?",
  "Which hotels have air conditioning?",
];

const HOTEL_QUESTIONS_VI = [
  "Khách sạn này có những loại phòng nào?",
  "Khách sạn này có những tiện nghi gì?",
  "Địa chỉ khách sạn này ở đâu?",
  "Tôi muốn liên hệ khách sạn này.",
];

const HOTEL_QUESTIONS_EN = [
  "What room types does this hotel have?",
  "What amenities does this hotel offer?",
  "Where is this hotel located?",
  "I want to contact this hotel.",
];

function formatPrice(
  value: number | null | undefined,
  language: Language
) {
  if (value == null || !Number.isFinite(value)) {
    return language === "vi"
      ? "Liên hệ"
      : "Contact us";
  }

  return new Intl.NumberFormat(
    language === "vi" ? "vi-VN" : "en-US"
  ).format(value);
}

function getBookingCode(
  result: BookingResult | null | undefined
) {
  if (!result) return null;

  return (
    result.bookingCode ??
    result.booking_code ??
    result.booking?.bookingCode ??
    result.booking?.booking_code ??
    null
  );
}

function getRoomName(
  room: AiRoomOption,
  language: Language
) {
  if (language === "vi") {
    return room.roomNameVi || room.roomNameEn;
  }

  return room.roomNameEn || room.roomNameVi;
}

function getHotelName(
  room: AiRoomOption,
  language: Language
) {
  if (language === "vi") {
    return room.hotelNameVi || room.hotelNameEn;
  }

  return room.hotelNameEn || room.hotelNameVi;
}

export default function AIAssistant({
  language: languageProp,
}: AIAssistantProps) {
  const [language, setLanguage] =
    useState<Language>(
      languageProp === "en" ? "en" : "vi"
    );

  const [isOpen, setIsOpen] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [pagePath, setPagePath] =
    useState("");

  const [messages, setMessages] =
    useState<ChatMessage[]>([
      {
        role: "assistant",
        content: INITIAL_MESSAGE_VI,
      },
    ]);

  const [bookingDraft, setBookingDraft] =
    useState<BookingDraft | null>(null);

  const [availableRooms, setAvailableRooms] =
    useState<AiRoomOption[]>([]);

  const [bookingResult, setBookingResult] =
    useState<BookingResult | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(null);

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setPagePath(window.location.pathname);

    const saved =
      localStorage.getItem("huyen-language");

    if (saved === "vi" || saved === "en") {
      setLanguage(saved);
    }

    const handleLangChange = (
      e: CustomEvent<Language>
    ) => {
      setLanguage(e.detail);
    };

    const handleOpenAI = () => {
      setPagePath(window.location.pathname);
      setIsOpen(true);
    };

    window.addEventListener(
      "language-change",
      handleLangChange
    );

    window.addEventListener(
      "open-ai-assistant",
      handleOpenAI
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handleLangChange
      );

      window.removeEventListener(
        "open-ai-assistant",
        handleOpenAI
      );
    };
  }, []);

  useEffect(() => {
    if (
      languageProp === "vi" ||
      languageProp === "en"
    ) {
      setLanguage(languageProp);
    }
  }, [languageProp]);

  const isVi = language === "vi";

  useEffect(() => {
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0].role === "assistant"
      ) {
        return [
          {
            role: "assistant",
            content: isVi
              ? INITIAL_MESSAGE_VI
              : INITIAL_MESSAGE_EN,
          },
        ];
      }

      return prev;
    });
  }, [isVi]);

  /*
   * Chỉ scroll phần hội thoại.
   * Header và footer không bị cuộn.
   */
  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      const container =
        messagesContainerRef.current;

      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      } else {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 50);

    return () => window.clearTimeout(timer);
  }, [
    messages,
    isOpen,
    availableRooms,
    bookingDraft,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  /*
   * Khóa scroll trang phía sau khi AI mở trên mobile.
   * Như vậy người dùng không bị cuộn cả trang web
   * khi đang vuốt đoạn hội thoại.
   */
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow =
      document.body.style.overflow;

    const originalTouchAction =
      document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow =
        originalOverflow;

      document.body.style.touchAction =
        originalTouchAction;
    };
  }, [isOpen]);

  async function sendMessage(
    messageText: string,
    options?: SendOptions
  ): Promise<void> {
    const text = messageText.trim();

    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
    };

    const newHistory = [
      ...messages,
      userMessage,
    ];

    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          language,
          hotelSlug:
            pagePath.match(
              /^\/khach-san\/([^/]+)/
            )?.[1] ?? null,
          selectedRoomSlug:
            options?.selectedRoomSlug ?? null,
          bookingDraft,
          history: newHistory
            .slice(-10)
            .map((turn) => ({
              role: turn.role,
              content: turn.content.slice(0, 600),
            })),
        }),
      });

      let data: AIResponse | null = null;

      try {
        data =
          (await response.json()) as AIResponse;
      } catch {
        data = null;
      }

      if (!response.ok) {
        console.error("AI API ERROR:", {
          status: response.status,
          data,
        });

        throw new Error(
          typeof data?.answer === "string"
            ? data.answer
            : typeof data?.error === "string"
              ? data.error
              : isVi
                ? `Trợ lý AI gặp lỗi (${response.status}). Vui lòng thử lại.`
                : `The AI assistant encountered an error (${response.status}). Please try again.`
        );
      }

      const answer =
        typeof data?.answer === "string"
          ? data.answer.trim()
          : "";

      if (!answer) {
        throw new Error(
          isVi
            ? "Trợ lý AI chưa trả về nội dung."
            : "The AI assistant returned no answer."
        );
      }

      if (
        data?.bookingDraft !== undefined
      ) {
        setBookingDraft(
          data.bookingDraft ?? null
        );
      }

      setAvailableRooms(
        Array.isArray(data?.availableRooms)
          ? data.availableRooms
          : []
      );

      if (data?.bookingResult) {
        setBookingResult(
          data.bookingResult
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (err) {
      console.error("AI error:", err);

      const fallback = isVi
        ? "Xin lỗi, hiện tại tôi chưa thể trả lời câu hỏi này. Vui lòng thử lại sau."
        : "Sorry, I cannot answer this question right now. Please try again later.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error &&
            err.message &&
            err.message !== "Failed to fetch"
              ? err.message
              : fallback,
        },
      ]);
    } finally {
      setIsLoading(false);

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }

  function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    void sendMessage(input);
  }

  function handleQuickQuestion(q: string) {
    if (!isLoading) {
      void sendMessage(q);
    }
  }

  function handleSelectRoom(
    room: AiRoomOption
  ) {
    if (isLoading) return;

    const roomName = getRoomName(
      room,
      language
    );

    const message = isVi
      ? `Tôi chọn phòng ${roomName}.`
      : `I choose the ${roomName} room.`;

    setAvailableRooms([]);

    void sendMessage(message, {
      selectedRoomSlug: room.roomSlug,
    });
  }

  function handleConfirmBooking() {
    if (
      isLoading ||
      !bookingDraft?.awaitingConfirmation
    ) {
      return;
    }

    const message = isVi
      ? "Tôi xác nhận đặt phòng."
      : "I confirm the booking.";

    void sendMessage(message);
  }

  if (!mounted || !isOpen) {
    return null;
  }

  const isHotelPage =
    /^\/khach-san\/[^/]+/.test(
      pagePath
    );

  const quickQuestions =
    isHotelPage
      ? isVi
        ? HOTEL_QUESTIONS_VI
        : HOTEL_QUESTIONS_EN
      : isVi
        ? QUICK_QUESTIONS_VI
        : QUICK_QUESTIONS_EN;

  const bookingCode =
    getBookingCode(bookingResult);

  const assistantUI = (
    <div
      className="
        fixed
        inset-x-2
        bottom-2
        z-[9999]
        flex
        h-[calc(100dvh-16px)]
        max-h-[760px]
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-2xl
        sm:inset-x-auto
        sm:bottom-5
        sm:right-5
        sm:h-[min(700px,calc(100dvh-40px))]
        sm:w-[min(420px,calc(100vw-24px))]
      "
    >
      {/* HEADER - LUÔN CỐ ĐỊNH */}
      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          bg-blue-600
          px-4
          py-3
          text-white
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Bot size={23} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 font-semibold">
              Huyen&apos;s
              <Sparkles size={14} />
            </div>

            <div className="truncate text-xs text-blue-100">
              {isVi
                ? "Trợ lý thông tin lưu trú"
                : "Stay information assistant"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label={
            isVi
              ? "Đóng trợ lý"
              : "Close assistant"
          }
          className="
            ml-2
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            transition
            hover:bg-white/10
            active:bg-white/20
          "
        >
          <X size={21} />
        </button>
      </div>

      {/* CHAT BODY - CHỈ PHẦN NÀY CUỘN */}
      <div
        ref={messagesContainerRef}
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          bg-gray-50
          px-3
          py-4
          [scrollbar-width:thin]
        "
      >
        {messages.map((msg, idx) => {
          const isUser =
            msg.role === "user";

          return (
            <div
              key={`msg-${idx}`}
              className={`mb-3 flex ${
                isUser
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bot size={17} />
                </div>
              )}

              <div
                className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                  isUser
                    ? "rounded-br-md bg-blue-600 text-white"
                    : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {availableRooms.length > 0 &&
          (bookingDraft?.rooms?.length ?? 0) ===
            0 && (
            <div className="mb-4 ml-10 space-y-2">
              <div className="text-xs font-medium text-gray-500">
                {isVi
                  ? "Phòng đang còn trống"
                  : "Available rooms"}
              </div>

              {availableRooms.map((room) => {
                const roomName =
                  getRoomName(
                    room,
                    language
                  );

                const hotelName =
                  getHotelName(
                    room,
                    language
                  );

                const price =
                  room.basePriceDaily;

                return (
                  <div
                    key={room.roomId}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    {room.image && (
                      <img
                        src={room.image}
                        alt={roomName}
                        loading="lazy"
                        className="h-32 w-full object-cover"
                      />
                    )}

                    <div className="p-3">
                      <div className="font-semibold text-gray-800">
                        {roomName}
                      </div>

                      <div className="mt-0.5 text-xs text-gray-500">
                        {hotelName}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-blue-600">
                            {formatPrice(
                              price,
                              language
                            )}
                            {isVi
                              ? " đ/đêm"
                              : " VND/night"}
                          </div>

                          <div className="mt-0.5 text-xs text-gray-500">
                            {room.maxGuests
                              ? isVi
                                ? `Tối đa ${room.maxGuests} khách`
                                : `Up to ${room.maxGuests} guests`
                              : ""}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            handleSelectRoom(
                              room
                            )
                          }
                          className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isVi
                            ? "Chọn phòng"
                            : "Choose"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {bookingDraft?.awaitingConfirmation &&
          !bookingDraft.bookingCompleted && (
            <div className="mb-4 ml-10 rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
              <div className="mb-2 text-xs font-medium text-gray-500">
                {isVi
                  ? "Xác nhận đặt phòng"
                  : "Confirm booking"}
              </div>

              <div className="space-y-1.5 text-sm text-gray-700">
                {bookingDraft.hotelName && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Khách sạn:"
                        : "Hotel:"}
                    </span>{" "}
                    {bookingDraft.hotelName}
                  </div>
                )}

                {bookingDraft.checkIn && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Nhận phòng:"
                        : "Check-in:"}
                    </span>{" "}
                    {bookingDraft.checkIn}
                  </div>
                )}

                {bookingDraft.checkOut && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Trả phòng:"
                        : "Check-out:"}
                    </span>{" "}
                    {bookingDraft.checkOut}
                  </div>
                )}

                {bookingDraft.months && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Thời gian:"
                        : "Duration:"}
                    </span>{" "}
                    {bookingDraft.months}{" "}
                    {isVi
                      ? "tháng"
                      : "months"}
                  </div>
                )}

                {bookingDraft.adults != null && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Người lớn:"
                        : "Adults:"}
                    </span>{" "}
                    {bookingDraft.adults}
                  </div>
                )}

                {bookingDraft.children != null && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Trẻ em:"
                        : "Children:"}
                    </span>{" "}
                    {bookingDraft.children}
                  </div>
                )}

                {bookingDraft.rooms.length >
                  0 && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Phòng:"
                        : "Room:"}
                    </span>{" "}
                    {bookingDraft.rooms
                      .map(
                        (room) =>
                          `${room.roomName} × ${room.quantity}`
                      )
                      .join(", ")}
                  </div>
                )}

                {bookingDraft.fullName && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Khách:"
                        : "Guest:"}
                    </span>{" "}
                    {bookingDraft.fullName}
                  </div>
                )}

                {bookingDraft.phone && (
                  <div>
                    <span className="font-medium">
                      {isVi
                        ? "Điện thoại:"
                        : "Phone:"}
                    </span>{" "}
                    {bookingDraft.phone}
                  </div>
                )}

                {bookingDraft.email && (
                  <div>
                    <span className="font-medium">
                      Email:
                    </span>{" "}
                    {bookingDraft.email}
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={
                  handleConfirmBooking
                }
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={16} />
                )}

                {isVi
                  ? "Xác nhận đặt phòng"
                  : "Confirm booking"}
              </button>
            </div>
          )}

        {bookingDraft?.bookingCompleted &&
          bookingCode && (
            <div className="mb-4 ml-10 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-green-700">
                <Check size={18} />

                {isVi
                  ? "Đặt phòng thành công"
                  : "Booking confirmed"}
              </div>

              <div className="mt-2 text-sm text-gray-700">
                {isVi
                  ? "Mã đặt phòng:"
                  : "Booking code:"}

                <span className="ml-1 font-bold text-gray-900">
                  {bookingCode}
                </span>
              </div>
            </div>
          )}

        {isLoading && (
          <div className="mb-3 flex justify-start">
            <div className="mr-2 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Bot size={17} />
            </div>

            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
              <Loader2
                size={16}
                className="animate-spin"
              />

              <span>
                {isVi
                  ? "Đang tìm thông tin..."
                  : "Finding information..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK QUESTIONS - KHÔNG CUỘN CÙNG CHAT */}
      {messages.length <= 1 &&
        !isLoading && (
          <div className="shrink-0 border-t bg-white px-3 py-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Sparkles size={13} />

              <span>
                {isVi
                  ? "Câu hỏi gợi ý"
                  : "Suggested questions"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() =>
                    handleQuickQuestion(q)
                  }
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-left text-xs text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* INPUT - LUÔN NẰM DƯỚI */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t bg-white p-3 pb-[max(12px,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 transition focus-within:border-blue-400 focus-within:bg-white">
          <input
            ref={inputRef}
            type="text"
            maxLength={1000}
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            disabled={isLoading}
            placeholder={
              isVi
                ? "Bạn muốn biết điều gì?"
                : "What would you like to know?"
            }
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={
              isLoading ||
              !input.trim()
            }
            aria-label={
              isVi
                ? "Gửi câu hỏi"
                : "Send question"
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Send size={17} />
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-gray-400">
          <span>
            {isVi
              ? "Thông tin được lấy từ hệ thống Huyen's"
              : "Information is retrieved from Huyen's system"}
          </span>
        </div>
      </form>
    </div>
  );

  return createPortal(
    assistantUI,
    document.body
  );
}
