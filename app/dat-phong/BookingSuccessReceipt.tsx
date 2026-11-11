
"use client";

import { useEffect, useState } from "react";
import Link from "@/app/components/LocalizedLink";
import { supabase } from "@/app/lib/supabase";

type Language = "vi" | "en";

type Booking = {
  bookingCode: string;
  hotelSlug: string;
  hotelNameVi: string;
  hotelNameEn: string;
  stayType?: "day" | "month";
  months?: number;
  nights?: number;
  checkIn?: string;
  checkOut?: string;
  fullName: string;
  phone: string;
  totalAmount: number;
  rooms: { room_id: number; quantity: number }[];
};

type Room = {
  id: number;
  name_vi: string;
  name_en: string;
};

type Props = {
  booking: Booking;
  rooms: Room[];
  language: Language;
};

const money = (amount: number, lang: Language) =>
  `${new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US").format(amount || 0)} VND`;

function dateText(value: string | undefined) {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match
    ? `${match[3]}/${match[2]}/${match[1]}`
    : value;
}

export default function BookingSuccessReceipt({
  booking,
  rooms,
  language,
}: Props) {
  const vi = language === "vi";
  const t = (v: string, e: string) => (vi ? v : e);

  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    let active = true;

    supabase
      .from("hotels")
      .select("address_vi,address_en")
      .eq("slug", booking.hotelSlug)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setAddress(
          (vi ? data?.address_vi : data?.address_en) ||
          (vi ? data?.address_en : data?.address_vi) ||
          ""
        );
        setLoadingAddress(false);
      });

    return () => {
      active = false;
    };
  }, [booking.hotelSlug, vi]);

  const hotelName =
    (vi ? booking.hotelNameVi : booking.hotelNameEn) ||
    booking.hotelNameVi ||
    booking.hotelNameEn;

  const months = Number(booking.months) || 1;
  const nights = Number(booking.nights) || 0;
  const monthly = booking.stayType === "month";

  const duration = monthly
    ? `${months} ${months === 1 ? "month" : "months"}`
    : `${nights} ${nights === 1 ? "night" : "nights"}`;

  const roomLines = booking.rooms.map((item) => {
    const room = rooms.find(
      (r) => Number(r.id) === Number(item.room_id)
    );

    const name =
      (vi ? room?.name_vi : room?.name_en) ||
      room?.name_vi ||
      room?.name_en ||
      `Room #${item.room_id}`;

    const count = Number(item.quantity) || 0;

    return `${name} x ${count} ${
      count === 1 ? "room" : "rooms"
    } x ${duration}`;
  });

  const notice = t(
    "Vui lòng chụp màn hình hoặc tải phiếu để đối chiếu khi đến nhận phòng.",
    "Please take a screenshot or download this receipt to present at check-in."
  );

  const rows: [string, string][] = [
    [t("Mã đặt phòng", "Booking code"), booking.bookingCode],
    [t("Cơ sở lưu trú", "Property"), hotelName],
    ...(address
      ? [[t("Địa chỉ", "Address"), address] as [string, string]]
      : []),
    [t("Khách hàng", "Guest"), booking.fullName],
    [t("Điện thoại", "Phone"), booking.phone],
    ...(monthly
      ? [[t("Thời gian thuê", "Rental period"),
          `${months} ${t("tháng", "months")}`] as [string, string]]
      : []),
    ...(booking.checkIn
      ? [[t("Nhận phòng", "Check-in"),
          dateText(booking.checkIn)] as [string, string]]
      : []),
    ...(booking.checkOut
      ? [[t("Trả phòng", "Check-out"),
          dateText(booking.checkOut)] as [string, string]]
      : []),
    ...roomLines.map(
      (line): [string, string] =>
        [t("Loại phòng", "Room type"), line]
    ),
    [t("Tổng tiền", "Total amount"),
      money(booking.totalAmount, language)],
  ];

  function downloadPNG() {
    setDownloadError("");

    try {
      const width = 840;
      const margin = 40;
      const scale = 2;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas unavailable");

      const contents = [
        "HUYEN'S HOTELS & STAYS",
        t("ĐÃ NHẬN YÊU CẦU ĐẶT PHÒNG", "BOOKING REQUEST RECEIVED"),
        `${t("Liên hệ hỗ trợ", "Support")}: +84 902 095 669 (WhatsApp/Zalo)`,
        ...rows.map(([key, value]) => `${key}: ${value}`),
        notice,
        t(
          "Phiếu ghi nhận yêu cầu đặt phòng, không xác nhận đã thanh toán.",
          "Booking request receipt. Payment is not confirmed."
        ),
      ];

      ctx.font = "22px Arial";

      const wrapped: string[][] = contents.map((text) => {
        const lines: string[] = [];
        let line = "";

        for (const word of text.split(/\s+/)) {
          const test = line ? `${line} ${word}` : word;

          if (
            ctx.measureText(test).width > width - margin * 2 &&
            line
          ) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }

        if (line) lines.push(line);
        return lines;
      });

      const lineHeight = 34;
      const height =
        margin * 2 +
        wrapped.reduce(
          (sum, lines) => sum + lines.length * lineHeight + 18,
          0
        );

      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.textBaseline = "top";

      let y = margin;

      wrapped.forEach((lines, i) => {
        ctx.font = i < 2 ? "bold 22px Arial" : "22px Arial";
        ctx.fillStyle = i < 2 ? "#103A29" : "#17392A";

        for (const line of lines) {
          ctx.fillText(line, margin, y);
          y += lineHeight;
        }
        y += 18;
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          setDownloadError(t(
            "Không thể tạo ảnh phiếu.",
            "Could not create receipt image."
          ));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download =
          `Huyens-${booking.bookingCode.replace(/[^a-zA-Z0-9_-]/g, "")}.png`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }, "image/png");
    } catch {
      setDownloadError(t(
        "Không thể tải phiếu.",
        "Unable to download receipt."
      ));
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F6F1] px-3 py-6">
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body * { visibility: hidden !important; }
          #booking-receipt, #booking-receipt * {
            visibility: visible !important;
          }
          #booking-receipt {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
          }
          .receipt-actions { display: none !important; }
          .receipt-colors {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <section
        id="booking-receipt"
        className="mx-auto max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-sm"
      >
        <header className="receipt-colors bg-[#103A29] px-5 py-4 text-white">
          <h1 className="text-lg font-bold">
            ✓ {t(
              "Đã nhận yêu cầu đặt phòng",
              "Booking request received"
            )}
          </h1>

          <p className="mt-2 text-sm">
            {t("Liên hệ hỗ trợ", "Support")}:{" "}
            <a
              href="tel:+84902095669"
              className="font-semibold underline"
            >
              +84 902 095 669
            </a>{" "}
            (WhatsApp/Zalo)
          </p>

          <p className="mt-1 text-xs text-[#DDEADF]">
            {t(
              "Chúng tôi sẽ liên hệ với bạn sớm nhất.",
              "We will contact you as soon as possible."
            )}
          </p>
        </header>

        <div className="space-y-3 px-5 py-4 text-sm text-[#17392A]">
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 text-[#56645A]">
              {t("Mã đặt phòng", "Booking code")}:
            </span>
            <strong className="min-w-0 break-all">
              {booking.bookingCode}
            </strong>
          </div>

          <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-2 sm:grid-cols-[120px_minmax(0,1fr)]">
            <span className="text-[#56645A]">
              {t("Cơ sở lưu trú", "Property")}:
            </span>

            <div className="min-w-0">
              <p className="font-semibold">{hotelName}</p>
              {address && (
                <p className="mt-1 text-xs leading-5 text-[#56645A]">
                  {address}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
            <div>
              <span className="text-[#56645A]">
                {t("Khách hàng", "Guest")}:
              </span>{" "}
              <strong>{booking.fullName}</strong>
            </div>

            <div>
              <span className="text-[#56645A]">
                {t("Điện thoại", "Phone")}:
              </span>{" "}
              <strong>{booking.phone}</strong>
            </div>

            {monthly && (
              <div className="col-span-2">
                {t("Thời gian thuê", "Rental period")}:{" "}
                <strong>
                  {months} {t("tháng", "months")}
                </strong>
              </div>
            )}

            {booking.checkIn && (
              <div>
                {t("Nhận phòng", "Check-in")}:{" "}
                <strong>{dateText(booking.checkIn)}</strong>
              </div>
            )}

            {booking.checkOut && (
              <div>
                {t("Trả phòng", "Check-out")}:{" "}
                <strong>{dateText(booking.checkOut)}</strong>
              </div>
            )}
          </div>

          <div className="space-y-1 border-t border-gray-200 pt-3">
            {roomLines.map((line, index) => (
              <div
                key={index}
                className="grid grid-cols-[85px_minmax(0,1fr)] gap-2"
              >
                <span className="text-[#56645A]">
                  {t("Loại phòng", "Room type")}:
                </span>
                <strong>{line}</strong>
              </div>
            ))}
          </div>

          <div className="receipt-colors flex items-center justify-between gap-3 rounded-lg bg-[#103A29] p-3 text-white">
            <span>{t("Tổng tiền", "Total amount")}:</span>
            <strong className="text-base">
              {money(booking.totalAmount, language)}
            </strong>
          </div>

          <p className="receipt-colors rounded-lg border border-[#E8D7AB] bg-[#FFF8E6] p-3 leading-6 text-[#805915]">
            ⚠ {notice}
          </p>

          <p className="text-xs text-[#56645A]">
            {t(
              "Đây là phiếu ghi nhận yêu cầu đặt phòng, không phải xác nhận đã thanh toán.",
              "This receipt records a booking request and does not confirm payment."
            )}
          </p>

          <div className="receipt-actions grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loadingAddress}
              onClick={downloadPNG}
              className="rounded-lg bg-[#24603F] px-2 py-3 font-semibold text-white disabled:opacity-50"
            >
              {t("Tải phiếu (PNG)", "Download PNG")}
            </button>

            <button
              type="button"
              disabled={loadingAddress}
              onClick={() => window.print()}
              className="rounded-lg border px-2 py-3 font-semibold disabled:opacity-50"
            >
              {t("In / Lưu PDF", "Print / Save PDF")}
            </button>
          </div>

          {downloadError && (
            <p role="alert" className="receipt-actions text-red-600">
              {downloadError}
            </p>
          )}

          <div className="receipt-actions flex justify-center gap-5 pt-2 text-xs text-[#24603F]">
            <Link href="/#booking-search">
              {t("Đặt phòng khác", "Make another booking")}
            </Link>
            <Link href="/">
              {t("Về trang chủ", "Back to home")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}