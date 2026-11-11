const aliases = [
  {
    hotel: "anh-kim-hotel",
    old: "deluxe double",
    current: "deluxe-double-balcony",
  },
  {
    hotel: "ae-guesthouse",
    old: "deluxe-windown",
    current: "deluxe-window",
  },
];

export function canonicalRoomSlug(
  hotel: string,
  slug: string
): string {
  return (
    aliases.find(
      (a) => a.hotel === hotel && a.old === slug
    )?.current ?? slug
  );
}

export function legacyRoomSlug(
  hotel: string,
  slug: string
): string {
  return (
    aliases.find(
      (a) => a.hotel === hotel && a.current === slug
    )?.old ?? slug
  );
}

export function canonicalSeoPath(path: string): string {
  const match = path.match(
    /^\/khach-san\/([^/]+)\/phong\/([^/]+)\/?$/
  );

  if (!match) return path;

  const hotel = decodeURIComponent(match[1]);
  const slug = decodeURIComponent(match[2]);
  const normalized = canonicalRoomSlug(hotel, slug);

  if (normalized === slug) return path;

  return (
    "/khach-san/" +
    encodeURIComponent(hotel) +
    "/phong/" +
    encodeURIComponent(normalized)
  );
}
