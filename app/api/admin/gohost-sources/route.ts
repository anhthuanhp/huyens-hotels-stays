import { supabase } from "../../../lib/supabase";
import { normalizeFeedUrl } from "../../../lib/gohost-calendar";
import { getServerSupabase, loadCalendar, sourceConfiguration, sourceFields, type GoHostSource } from "../../../lib/gohost-server";

const table = "gohost_ical_sources";

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

function failure(message: string, status: number) {
  return reply({ error: message }, status);
}

function validId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function publicSourceForAdmin(source: GoHostSource) {
  const { last_error, ...fields } = source;
  return { ...fields, last_error: last_error ? "Lần kiểm tra gần nhất thất bại." : null };
}

async function handle(request: Request) {
  const token = /^Bearer ([^\s]+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return failure("Cần đăng nhập.", 401);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return failure("Phiên đăng nhập không hợp lệ.", 401);
  if (user.app_metadata.role !== "admin") return failure("Bạn không có quyền quản trị.", 403);

  const db = getServerSupabase();
  const url = new URL(request.url);
  const roomId = Number(url.searchParams.get("roomId"));
  if (!validId(roomId)) return failure("Loại phòng không hợp lệ.", 400);
  const { data: room, error: roomError } = await db.from("rooms")
    .select("id,quantity,hotels!inner(id)").eq("id", roomId).maybeSingle();
  if (roomError) return failure("Không thể kiểm tra loại phòng.", 503);
  if (!room) return failure("Không tìm thấy loại phòng.", 404);

  const { data, error } = await db.from(table).select(sourceFields)
    .eq("room_id", roomId).order("id").limit(101);
  if (error || !data || data.length > 100) return failure("Không thể đọc danh sách nguồn GoHost.", 503);
  const sources = data as GoHostSource[];
  if (request.method === "GET") {
    const { active, duplicate, complete } = sourceConfiguration(sources, room.quantity);
    return reply({ quantity: room.quantity, sources: sources.map(publicSourceForAdmin),
      active: active.length, duplicate, complete });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return failure("Dữ liệu không hợp lệ.", 400);
  const sourceId = Number(url.searchParams.get("sourceId"));
  if (url.searchParams.has("sourceId") && !validId(sourceId)) return failure("Mã nguồn không hợp lệ.", 400);
  const source = sources.find((item) => item.id === sourceId);
  if (sourceId && !source) return failure("Không tìm thấy nguồn của loại phòng này.", 404);

  if (request.method === "DELETE") {
    if (!source || body.confirm !== true) return failure("Cần xác nhận xóa nguồn.", 400);
    const result = await db.from(table).delete().eq("id", source.id).eq("room_id", roomId).select("id");
    if (result.error) return failure("Không thể xóa nguồn GoHost.", 409);
    if (!result.data?.length) return failure("Nguồn đã thay đổi. Hãy tải lại.", 409);
    return reply({ ok: true });
  }

  if (request.method === "POST" && body.action === "test") {
    if (!source) return failure("Hãy lưu nguồn trước khi kiểm tra.", 400);
    let ok = false;
    try {
      await loadCalendar(source, true);
      ok = true;
    } catch {
      // A fetch error can contain the secret calendar URL.
    }
    const result = await db.from(table).update(ok
      ? { last_success_at: new Date().toISOString(), last_error: null }
      : { last_error: "connection_failed" })
      .eq("id", source.id).eq("room_id", roomId).eq("feed_url", source.feed_url).select("id");
    if (result.error) return failure("Không thể lưu kết quả kiểm tra.", 503);
    if (!result.data?.length) return failure("Nguồn đã thay đổi. Hãy kiểm tra lại.", 409);
    return reply({ ok });
  }

  const creating = request.method === "POST";
  if (creating ? url.searchParams.has("sourceId") : !source) return failure("Mã nguồn không hợp lệ.", 400);
  if (creating && sources.length >= room.quantity) return failure("Đã đủ số phòng vật lý. Hãy tăng số lượng phòng trước.", 409);
  const unitCode = typeof body.unit_code === "string" ? body.unit_code.trim().toUpperCase() : "";
  const feedUrl = typeof body.feed_url === "string" ? normalizeFeedUrl(body.feed_url.trim()) : null;
  if (!/^[A-Z0-9][A-Z0-9_-]{0,39}$/.test(unitCode)) return failure("Số phòng không hợp lệ.", 400);
  if (!feedUrl || typeof body.enabled !== "boolean") return failure("URL lịch export GoHost iCal hoặc trạng thái không hợp lệ.", 400);
  const existing = sources.filter((item) => item.id !== source?.id);
  if (existing.some((item) => item.unit_code.trim().toUpperCase() === unitCode)) {
    return failure("Số phòng đã được khai báo trong loại phòng này.", 409);
  }
  const legacyUrl = feedUrl.replace("platform.gohost.vn/", "platform.gohost.vn:443/");
  const duplicateQuery = db.from(table).select("id").in("feed_url", [feedUrl, legacyUrl]).limit(1);
  if (source) duplicateQuery.neq("id", source.id);
  const duplicate = await duplicateQuery;
  if (duplicate.error) return failure("Không thể kiểm tra URL trùng.", 503);
  if (duplicate.data?.length) return failure("URL iCal đã được khai báo.", 409);

  const payload = { unit_code: unitCode, feed_url: feedUrl, enabled: body.enabled };
  const result = source
    ? await db.from(table).update({ ...payload, ...(normalizeFeedUrl(source.feed_url) === feedUrl
        ? {} : { last_error: null, last_success_at: null }) })
        .eq("id", source.id).eq("room_id", roomId)
        .eq("feed_url", source.feed_url).eq("unit_code", source.unit_code).eq("enabled", source.enabled).select("id")
    : await db.from(table).insert({ ...payload, room_id: roomId }).select("id");
  if (result.error?.code === "23505") return failure("Số phòng hoặc URL iCal đã được khai báo.", 409);
  if (result.error?.code === "23514") return failure("Khai báo vượt số phòng hoặc dữ liệu không hợp lệ.", 409);
  if (result.error) return failure("Không thể lưu nguồn GoHost.", 503);
  if (!result.data?.length) return failure("Nguồn đã thay đổi. Hãy tải lại.", 409);
  return reply({ ok: true }, creating ? 201 : 200);
}

async function route(request: Request) {
  try {
    return await handle(request);
  } catch {
    return failure("Không thể xử lý cấu hình GoHost.", 503);
  }
}

export { route as GET, route as POST, route as PATCH, route as DELETE };
