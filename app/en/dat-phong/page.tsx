import { Suspense } from "react";
import BookingPage from "../../dat-phong/page";
export const metadata = { title: "Complete your booking request | Huyen's Hotels & Stays", description: "Check your stay details and request a room directly with Huyen's Hotels & Stays.", robots: { index: false, follow: true }, alternates: { canonical: "https://huyenhotels.com/en/dat-phong" }, openGraph: { locale: "en_US", title: "Complete your booking request", description: "Book directly with Huyen's Hotels & Stays.", url: "https://huyenhotels.com/en/dat-phong" } };
export default function Page() { return <div lang="en"><Suspense fallback={<p className="p-8">Loading booking details…</p>}><BookingPage /></Suspense></div>; }
