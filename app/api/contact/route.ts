import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ContactRequest = {
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  language?: "vi" | "en";
};

function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(supabaseUrl, supabaseSecretKey);
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatTelegramText(data: {
  name: string;
  phone: string;
  email: string | null;
  message: string;
  language: "vi" | "en";
}) {
  const submittedAt = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  if (data.language === "en") {
    return [
      "📩 <b>NEW CONTACT MESSAGE</b>",
      "",
      `👤 <b>Name:</b> ${escapeTelegramHtml(data.name)}`,
      `📞 <b>Phone:</b> ${escapeTelegramHtml(data.phone)}`,
      `📧 <b>Email:</b> ${data.email ? escapeTelegramHtml(data.email) : "—"}`,
      "",
      `📝 <b>Message:</b>`,
      escapeTelegramHtml(data.message),
      "",
      `🕐 <b>Received:</b> ${escapeTelegramHtml(submittedAt)}`,
    ].join("\n");
  }

  return [
    "📩 <b>LIÊN HỆ MỚI</b>",
    "",
    `👤 <b>Khách:</b> ${escapeTelegramHtml(data.name)}`,
    `📞 <b>SĐT:</b> ${escapeTelegramHtml(data.phone)}`,
    `📧 <b>Email:</b> ${data.email ? escapeTelegramHtml(data.email) : "—"}`,
    "",
    `📝 <b>Nội dung:</b>`,
    escapeTelegramHtml(data.message),
    "",
    `🕐 <b>Thời gian:</b> ${escapeTelegramHtml(submittedAt)}`,
  ].join("\n");
}

async function sendTelegramNotification(data: {
  name: string;
  phone: string;
  email: string | null;
  message: string;
  language: "vi" | "en";
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error(
      "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID."
    );

    return false;
  }

  const telegramMessage = formatTelegramText(data);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error(
        "Telegram API error:",
        JSON.stringify(result)
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Telegram notification error:",
      error
    );

    return false;
  }
}

function validatePhone(value: string) {
  return /^(0\d{9}|\+84\d{9})$/.test(value.trim());
}

function validateEmail(value: string | null) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]{2,}$/.test(value.trim());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequest;

    const cleanName = String(body.name ?? "").trim();
    const cleanPhone = String(body.phone ?? "").trim();
    const cleanEmail =
      String(body.email ?? "").trim() || null;
    const cleanMessage = String(body.message ?? "").trim();

    const language =
      body.language === "en" ? "en" : "vi";

    if (!cleanName) {
      return NextResponse.json(
        {
          success: false,
          message:
            language === "vi"
              ? "Vui lòng nhập họ và tên."
              : "Please enter your full name.",
        },
        { status: 400 }
      );
    }

    if (!cleanPhone || !validatePhone(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            language === "vi"
              ? "Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0 hoặc +84xxxxxxxxx."
              : "Invalid phone number. Please enter 10 digits starting with 0 or +84xxxxxxxxx.",
        },
        { status: 400 }
      );
    }

    if (!validateEmail(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          message:
            language === "vi"
              ? "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại."
              : "Invalid email address. Please check it again.",
        },
        { status: 400 }
      );
    }

    if (!cleanMessage) {
      return NextResponse.json(
        {
          success: false,
          message:
            language === "vi"
              ? "Vui lòng nhập nội dung liên hệ."
              : "Please enter your message.",
        },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        message: cleanMessage,
        language,
        status: "new",
      });

    if (insertError) {
      console.error(
        "Lỗi lưu thông tin liên hệ:",
        insertError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            language === "vi"
              ? "Không thể gửi thông tin. Vui lòng thử lại sau."
              : "Unable to send your message. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Telegram chỉ là bước thông báo.
    // Nếu Telegram lỗi thì dữ liệu liên hệ vẫn đã được lưu thành công.
    await sendTelegramNotification({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      message: cleanMessage,
      language,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Contact API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process your request.",
      },
      { status: 500 }
    );
  }
}