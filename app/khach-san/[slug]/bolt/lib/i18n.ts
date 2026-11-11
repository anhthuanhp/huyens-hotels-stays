import type { Bilingual, Locale } from '../types/hotel';

export const t = (value: Bilingual, locale: Locale): string => value[locale];

export const formatPrice = (
  amount: number | undefined,
  currency: string | undefined,
  locale: Locale,
): string | null => {
  if (amount === undefined || amount === null || amount <= 0) return null;
  const cur = currency ?? 'VND';
  const formatted = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  if (cur === 'VND') return `${formatted}₫`;
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 0,
  }).format(amount);
};
