"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLanguage } from "../lib/use-language";
import { localizedHref } from "../lib/localized-path";
export default function LocalizedLink(props: ComponentProps<typeof NextLink>) { const language = useLanguage(); return <NextLink {...props} href={typeof props.href === "string" ? localizedHref(props.href, language) : props.href} />; }
