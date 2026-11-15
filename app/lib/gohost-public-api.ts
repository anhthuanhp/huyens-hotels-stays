import "server-only";

export type GoHostApiMapping = {
  propertyId: string;
  roomTypes: Record<string, string>;
  continuousInventoryVerified: boolean;
};

const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function goHostApiMapping(hotelSlug: string): GoHostApiMapping | undefined {
  const raw = process.env.GOHOST_PUBLIC_API_MAPPING;
  if (!raw) return;
  const mappings: unknown = JSON.parse(raw);
  if (!mappings || typeof mappings !== "object" || Array.isArray(mappings)) {
    throw new Error("invalid_gohost_mapping");
  }
  if (!Object.hasOwn(mappings, hotelSlug)) return;
  const entry = (mappings as Record<string, GoHostApiMapping>)[hotelSlug];
  if (!entry || typeof entry.propertyId !== "string" || !UUID.test(entry.propertyId) ||
      !entry.roomTypes || typeof entry.roomTypes !== "object" || Array.isArray(entry.roomTypes) ||
      typeof entry.continuousInventoryVerified !== "boolean") {
    throw new Error("invalid_gohost_mapping");
  }
  const ids = Object.values(entry.roomTypes);
  if (ids.some((id) => typeof id !== "string" || !UUID.test(id)) ||
      new Set(ids.map((id) => id.toLowerCase())).size !== ids.length) {
    throw new Error("invalid_gohost_room_type_mapping");
  }
  return entry;
}

export async function loadGoHostInventory(propertyId: string, start: string, end: string) {
  const token = process.env.GOHOST_PUBLIC_API_TOKEN?.trim();
  if (!token) throw new Error("missing_gohost_api_token");
  const url = new URL(
    "https://platform.gohost.vn/pms/api/public/v1/properties/" + encodeURIComponent(propertyId) + "/room_types/search",
  );
  url.searchParams.set("checkin_date", start);
  url.searchParams.set("checkout_date", end);
  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("gohost_api_failed");
  const body = await response.json();
  if (body?.success !== true || !Array.isArray(body.data)) throw new Error("invalid_gohost_response");

  const quantities = new Map<string, number>();
  for (const item of body.data) {
    const room = item?.room_types;
    if (typeof room?.id !== "string" || !UUID.test(room.id) ||
        !Number.isSafeInteger(room.quantity) || room.quantity < 0 ||
        quantities.has(room.id.toLowerCase())) {
      throw new Error("invalid_gohost_room_type");
    }
    quantities.set(room.id.toLowerCase(), room.quantity);
  }
  return quantities;
}
