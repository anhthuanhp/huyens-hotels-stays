'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { trackEvent } from './analytics';

/** One GA4 instance. Does not initialize when no measurement ID is configured. */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const enabled = Boolean(measurementId && /^G-[A-Z0-9]+$/.test(measurementId));

  useEffect(() => {
    if (!enabled || !pathname || pathname.startsWith('/admin')) return;
    const match = pathname.match(/^\/(?:en\/)?khach-san\/([^/]+)\/phong\/([^/]+)\/?$/);
    if (match) {
      trackEvent('view_room', {
        hotel_slug: decodeURIComponent(match[1]),
        room_slug: decodeURIComponent(match[2]),
        language: pathname.startsWith('/en/') ? 'en' : 'vi',
      });
    }
  }, [enabled, pathname]);

  // Delegated outbound/contact tracking without reading customer data.
  useEffect(() => {
    if (!enabled) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute('href') || '';
      const url = (() => { try { return new URL(href, window.location.origin); } catch { return null; } })();
      if (!url) return;
      const path = window.location.pathname;
      const match = path.match(/^\/(?:en\/)?khach-san\/([^/]+)/);
      const hotel_slug = match ? decodeURIComponent(match[1]) : undefined;
      const host = url.hostname.toLowerCase();
      const scheme = url.protocol.toLowerCase();
      let contact_channel: 'zalo' | 'whatsapp' | 'phone' | 'email' | undefined;
      if (host === 'zalo.me' || host.endsWith('.zalo.me')) contact_channel = 'zalo';
      else if (host === 'wa.me' || host === 'api.whatsapp.com' || host.endsWith('.whatsapp.com')) contact_channel = 'whatsapp';
      else if (scheme === 'tel:') contact_channel = 'phone';
      else if (scheme === 'mailto:') contact_channel = 'email';
      if (contact_channel) {
        trackEvent('contact_click', { hotel_slug, contact_channel });
        return;
      }
      const isExternal = ['http:', 'https:'].includes(scheme) && host !== window.location.hostname;
      if (isExternal && /(booking\.com|agoda\.|traveloka\.|expedia\.|trip\.com|airbnb\.)/i.test(host)) {
        trackEvent('outbound_ota_click', { hotel_slug, ota_name: host });
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled]);

  if (!enabled) return null;
  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    <Script id="huyen-ga4-init" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){dataLayer.push(arguments);};
      gtag('js', new Date());
      gtag('config', '${measurementId}', { send_page_view: true });
    `}</Script>
  </>;
}
