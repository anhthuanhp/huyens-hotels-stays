import { Suspense } from "react";
import BookingPage from "../../tim-phong/page";
export const metadata = { title: "Find a room | Huyen's Hotels & Stays", description: "Check your stay details and request a room directly with Huyen's Hotels & Stays.", robots: { index: false, follow: true }, alternates: { canonical: "https://huyenhotels.com/en/tim-phong" }, openGraph: { locale: "en_US", title: "Find a room", description: "Book directly with Huyen's Hotels & Stays.", url: "https://huyenhotels.com/en/tim-phong" } };
export default function Page() { return <div lang="en"><Suspense fallback={<p className="p-8">Loading booking details…</p>}><BookingPage /></Suspense></div>; }
