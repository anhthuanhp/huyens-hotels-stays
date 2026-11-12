'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { GA_MEASUREMENT_ID, trackEvent } from './analytics';

/** One GA4 instance. Does not initialize when no measurement ID is configured. */
export default function GoogleAnalytics() {
  const measurementId = GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const enabled = Boolean(measurementId && /^G-[A-Z0-9]+$/.test(measurementId));

  useEffect(() => {
    if (!enabled || !measurementId || pathname?.startsWith('/admin')) return;

    const gaWindow = window as Window & {
      dataLayer?: unknown[][];
      __huyenGa4Configured?: boolean;
    };

    if (gaWindow.__huyenGa4Configured) return;
    gaWindow.__huyenGa4Configured = true;

    gaWindow.dataLayer = gaWindow.dataLayer || [];
    window.gtag = window.gtag || ((...args: unknown[]) => {
      gaWindow.dataLayer!.push(args);
    });

    const script = document.createElement('script');
    script.id = 'huyen-ga4-loader';
    script.async = true;
    script.src =
      'https://www.googletagmanager.com/gtag/js?id=' +
      encodeURIComponent(measurementId);
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  }, [enabled, measurementId, pathname]);
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

  return null;
}
