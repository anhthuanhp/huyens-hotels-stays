import { roomDecisions } from "../data/room-decisions";
import { localizedHref } from "../lib/localized-path";
export default function RoomChoiceGuide({ hotelSlug, roomSlug, language }: { hotelSlug: string; roomSlug: string; language: "vi" | "en" }) {
  const advice = roomDecisions[hotelSlug + "/" + roomSlug];
  if (!advice) return null;
  return <section className="mt-10 rounded-2xl border border-sky-100 bg-sky-50 p-5"><h2 className="text-xl font-semibold text-slate-950">{language === "vi" ? "Phòng này phù hợp với nhu cầu nào?" : "Is this room right for your stay?"}</h2><p className="mt-3 leading-8 text-slate-700">{advice[language]}</p><a className="mt-3 inline-flex min-h-12 items-center font-semibold text-sky-800 underline" href={localizedHref("/khach-san/" + encodeURIComponent(hotelSlug) + "/phong/" + encodeURIComponent(advice.alternative), language)}>{language === "vi" ? "So sánh hạng phòng thay thế" : "Compare the alternative room category"}</a></section>;
}
