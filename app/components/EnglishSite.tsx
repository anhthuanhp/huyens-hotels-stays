import Link from "next/link";
import Head from "next/head";
import RoomChoiceGuide from "./RoomChoiceGuide";
import HotelAreaAdvice from "./HotelAreaAdvice";
import Image from "next/image";
import type { EnglishData } from "../lib/english-data";
import type { Hotel, Room } from "../khach-san/[slug]/hotel-data";
import { parseBlogContent, splitBlogLinks } from "../lib/blog-content";
import { CITY_GUIDE_SLUG } from "../data/city-guide";
import CityTravelGuide from "./CityTravelGuide";
import SocialLinks from "./SocialLinks";
import { localizedHref } from "../lib/localized-path";

const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com").replace(/\/$/, "");
const hotelPath = (hotel: Hotel) => "/en/khach-san/" + encodeURIComponent(hotel.slug);
const roomPath = (hotel: Hotel, room: Room) => hotelPath(hotel) + "/phong/" + encodeURIComponent(room.slug);
const money = (value: number | null) => value && value > 0 ? new Intl.NumberFormat("en-US").format(value) + " VND" : "Ask for a quote";
const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const button = "inline-flex min-h-12 items-center justify-center rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800";
function Cover({ src, alt }: { src: string | null; alt: string }) {
  return src ? <Image src={src} alt={alt} width={960} height={640} sizes="(max-width: 767px) 100vw, 50vw" className="mb-5 aspect-[3/2] w-full rounded-xl object-cover" /> : null;
}
function RoomCard({ hotel, room }: { hotel: Hotel; room: Room }) {
  return <article className={card}><Cover src={room.image} alt={room.name_en || "Guest room"} /><h3 className="text-xl font-semibold"><Link className="hover:underline" href={roomPath(hotel, room)}>{room.name_en}</Link></h3><p className="mt-2 text-sm text-slate-500">{hotel.name_en} · {room.size} m² · Up to {room.max_guests} guests</p><p className="mt-2">{room.beds_en || "Confirm bed arrangement with the property"}</p><p className="mt-3">Nightly: {money(room.base_price_daily)} · Monthly: {money(room.base_price_monthly)}</p><p className="mt-3 leading-7 text-slate-600">{room.description_en}</p><Link className="mt-4 inline-flex min-h-12 items-center font-semibold text-sky-800 underline" href={roomPath(hotel, room)}>View room details</Link></article>;
}
export default function EnglishSite({ data }: { data: EnglishData }) {
  const canonical = origin + localizedHref(data.path, "en");
  const vietnamese = origin + (data.path === "/" ? "" : data.path);
  const fullTitle = data.title + " | Huyen's Hotels & Stays";
  const hotel = data.hotel;
  const room = data.room;
  const post = data.post;
  const booking = "/en/tim-phong" + (hotel ? "?hotel=" + encodeURIComponent(hotel.slug) + (room ? "&room=" + encodeURIComponent(room.slug) : "") : "");
  const schema = { "@context": "https://schema.org", "@type": post ? "BlogPosting" : "WebPage", url: canonical, name: data.title, inLanguage: "en", description: data.description, ...(post ? { headline: post.title_en, datePublished: post.date, ...(post.image ? { image: post.image } : {}), author: { "@type": "Organization", name: "Huyen's Hotels & Stays", url: origin } } : {}) };
  return <>
    <Head><title>{fullTitle}</title><meta name="description" content={data.description} /><meta name="robots" content="index,follow,max-image-preview:large" /><link rel="canonical" href={canonical} /><link rel="alternate" hrefLang="vi-VN" href={vietnamese} /><link rel="alternate" hrefLang="en" href={canonical} /><link rel="alternate" hrefLang="x-default" href={vietnamese} /><meta property="og:type" content={post ? "article" : "website"} /><meta property="og:locale" content="en_US" /><meta property="og:title" content={fullTitle} /><meta property="og:description" content={data.description} /><meta property="og:url" content={canonical} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\u003c") }} /></Head>
    <header className="border-b border-slate-200 bg-white px-4 py-4"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><Link className="inline-flex min-h-12 items-center py-2 font-bold text-sky-900" href="/en">Huyen&apos;s Hotels &amp; Stays</Link><nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold"><Link className="py-3" href="/en">Hotels</Link><Link className="py-3" href="/en/phong">Rooms &amp; rates</Link><Link className="py-3" href="/en/blog">Travel guides</Link><Link className="py-3" href="/en/tim-phong">Find a room</Link><Link className="py-3" href={data.path} lang="vi" hrefLang="vi-VN" onClick={() => { try { localStorage.setItem("huyen-language", "vi"); localStorage.setItem("language", "vi"); } catch { /* Storage is optional. */ } }}>VI</Link><span aria-current="page">EN</span></nav></div></header>
    <main lang="en" className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="max-w-4xl text-3xl font-bold leading-tight text-slate-950 sm:text-5xl">{data.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{data.description}</p>
      {hotel && <p className="mt-4 text-slate-600">{hotel.address_en}</p>}
      {(data.kind === "home" || data.kind === "hotel" || data.kind === "room") && <Link className={button + " mt-6"} href={booking}>Check dates &amp; availability</Link>}
      {data.kind === "home" && <section className="mt-12"><h2 className="mb-6 text-2xl font-bold">Choose your base in central Saigon</h2><div className="grid gap-6 md:grid-cols-2">{data.hotels.map(h => <article className={card} key={h.id}><Cover src={h.image} alt={h.name_en || "Hotel"} /><h3 className="text-2xl font-semibold"><Link href={hotelPath(h)}>{h.name_en}</Link></h3><p className="mt-2 text-sm text-slate-500">{h.address_en}</p><p className="mt-4 leading-7 text-slate-600">{h.description_en}</p><Link className="mt-4 inline-flex min-h-12 items-center font-semibold text-sky-800 underline" href={hotelPath(h)}>Explore rooms at {h.name_en}</Link></article>)}</div></section>}
      {data.kind === "hotel" && hotel && <><Cover src={hotel.image} alt={hotel.name_en || "Hotel"} /><p className="my-6 whitespace-pre-line text-lg leading-8 text-slate-600">{hotel.description_en}</p><h2 className="mb-6 mt-10 text-2xl font-bold">Compare room types</h2></>}
      {data.kind === "rooms" && <h2 className="mt-10 text-2xl font-bold">Room types and rates</h2>}
      {(data.kind === "hotel" || data.kind === "rooms") && <div className="mt-8 grid gap-6 md:grid-cols-2">{data.rooms.map(r => { const h = hotel || data.hotels.find(h => h.id === r.hotel_id); return h ? <RoomCard hotel={h} room={r} key={r.id} /> : null; })}</div>}
      {data.kind === "room" && room && hotel && <section className="mt-8"><Cover src={room.image} alt={room.name_en || "Guest room"} /><h2 className="text-2xl font-bold">Room details</h2><p className="mt-4 whitespace-pre-line text-lg leading-8">{room.description_en}</p><dl className="my-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-4"><div><dt>Floor area</dt><dd className="font-bold">{room.size} m²</dd></div><div><dt>Maximum guests</dt><dd className="font-bold">{room.max_guests}</dd></div><div><dt>Nightly rate</dt><dd className="font-bold">{money(room.base_price_daily)}</dd></div><div><dt>Monthly rate</dt><dd className="font-bold">{money(room.base_price_monthly)}</dd></div></dl><p>Confirm dates, total guests, bed arrangements and cancellation conditions before booking. Rates and availability depend on your selected stay.</p><Link className={button + " mt-5"} href={booking}>Find availability for this room</Link><RoomChoiceGuide hotelSlug={hotel.slug} roomSlug={room.slug} language="en" /><section className="mt-10"><h2 className="mb-4 text-2xl font-bold">Around the area</h2><HotelAreaAdvice slug={hotel.slug} language="en" /></section><h2 className="mb-5 mt-12 text-2xl font-bold">Other rooms at {hotel.name_en}</h2><div className="grid gap-5 md:grid-cols-2">{data.rooms.filter(r => r.id !== room.id).map(r => <RoomCard key={r.id} hotel={hotel} room={r} />)}</div></section>}
      {(data.kind === "home" || data.kind === "blog") && <section className="mt-14"><h2 className="mb-6 text-2xl font-bold">Plan your stay in Ho Chi Minh City</h2><div className="grid gap-5 md:grid-cols-2">{data.posts.map(p => <article className={card} key={p.slug}><h3 className="text-xl font-semibold"><Link href={"/en/blog/" + encodeURIComponent(p.slug)}>{p.title_en}</Link></h3><p className="mt-3 leading-7 text-slate-600">{p.excerpt_en}</p><Link className="mt-4 inline-flex min-h-12 items-center font-semibold text-sky-800 underline" href={"/en/blog/" + encodeURIComponent(p.slug)}>Read the guide</Link></article>)}</div></section>}
      {post && <article className="mx-auto mt-10 max-w-3xl"><Cover src={post.image} alt={post.title_en} />{parseBlogContent(post.content_en || "").map((block, i) => block.type === "heading" ? <h2 className="mb-4 mt-10 text-2xl font-bold" key={i}>{block.text}</h2> : <p className="my-5 whitespace-pre-line text-lg leading-9 text-slate-700" key={i}>{splitBlogLinks(block.text).map((part, j) => part.href ? <span key={j}><Link href={part.href.startsWith(origin) ? localizedHref(part.href.slice(origin.length), "en") : part.href} className="text-sky-800 underline">{part.text}</Link>{part.suffix}</span> : part.text)}</p>)}{post.slug === CITY_GUIDE_SLUG && <CityTravelGuide language="en" />}<Link className={button + " mt-10"} href="/en/tim-phong">Find a room for your trip</Link></article>}
    </main>
    <footer className="mt-12 bg-sky-900 px-4 py-10 text-white"><div className="mx-auto max-w-7xl"><p className="font-semibold">Huyen&apos;s Hotels &amp; Stays</p><p className="mt-3">Contact: <Link href="mailto:contact@huyenhotels.com">contact@huyenhotels.com</Link> · <Link href="tel:+84902095669">+84 902 095 669</Link></p><SocialLinks label="Social media" /><p className="mt-5 text-sm text-white/70">© {new Date().getFullYear()} Huyen Group</p></div></footer>
  </>;
}
