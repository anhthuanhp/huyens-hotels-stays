"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ContactFloat = dynamic(() => import("./ContactFloat"), { ssr: false });
const AIAssistant = dynamic(() => import("./AIAssistant"), { ssr: false });

export default function LazyWidgets() {
  const pathname = usePathname();
  const [assistantRequested, setAssistantRequested] = useState(false);
  useEffect(() => {
    const open = () => setAssistantRequested(true);
    window.addEventListener("open-ai-assistant", open);
    return () => window.removeEventListener("open-ai-assistant", open);
  }, []);
  if (pathname?.startsWith("/admin")) return null;
  return <><ContactFloat />{assistantRequested && <AIAssistant initiallyOpen />}</>;
}
