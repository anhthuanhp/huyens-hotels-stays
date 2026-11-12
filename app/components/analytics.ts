/** No email, phone, guest name, booking notes, or other personal data in events. */
type AnalyticsEvent =
  | 'search_rooms'
  | 'view_room'
  | 'begin_booking'
  | 'submit_booking_request'
  | 'contact_click'
  | 'outbound_ota_click';

type EventParameters = {
  hotel_slug?: string;
  room_slug?: string;
  language?: 'vi' | 'en';
  stay_type?: 'night' | 'month';
  contact_channel?: 'zalo' | 'whatsapp' | 'phone' | 'email' | 'other';
  ota_name?: string;
  // Only non-identifying counts; no dates or user-generated strings.
  guest_count?: number;
  room_count?: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Public GA4 stream ID (not a secret). Vercel may override it with the
// NEXT_PUBLIC_GA_MEASUREMENT_ID environment variable.
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-3S58RPCTSB';

export function trackEvent(name: AnalyticsEvent, params: EventParameters = {}) {
  if (
  typeof window === 'undefined' ||
  !/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)
) return;

const gaWindow = window as Window & {
  dataLayer?: unknown[][];
};

gaWindow.dataLayer = gaWindow.dataLayer || [];
window.gtag = window.gtag || ((...args: unknown[]) => {
  gaWindow.dataLayer!.push(args);
});
  const allowed = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null));
  window.gtag('event', name, allowed);
}
