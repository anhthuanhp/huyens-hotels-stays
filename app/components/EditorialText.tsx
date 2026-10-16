import Link from "next/link";
import { localizedHref } from "../lib/localized-path";
export default function EditorialText({ text, language = "vi" }: { text: string; language?: "vi" | "en" }) {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]*)\)/g;
  const parts: React.ReactNode[] = [];
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    parts.push(text.slice(end, match.index));
    const href = localizedHref(match[2], language);
    parts.push(<Link key={match.index} href={href} className="font-medium text-sky-800 underline underline-offset-4">{match[1]}</Link>);
    end = match.index! + match[0].length;
  }
  parts.push(text.slice(end));
  return <>{parts}</>;
}
