"use client";
import type { ImageLoaderProps } from "next/image";
export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.startsWith("data:")) return src;
  if (/\.svg(?:\?|$)/.test(src)) return src + (src.includes("?") ? "&" : "?") + "w=" + width;
  return "/media/optimized?" + new URLSearchParams({ src, w: String(Math.min(width, 1920)) });
}
