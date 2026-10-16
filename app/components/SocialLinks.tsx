import Image from "next/image";
import { FACEBOOK_PAGE_URL, INSTAGRAM_PAGE_URL, THREADS_PAGE_URL } from "../lib/social";

const profiles = [
  { name: "Facebook", href: FACEBOOK_PAGE_URL, icon: "facebook" },
  { name: "Instagram", href: INSTAGRAM_PAGE_URL, icon: "instagram" },
  { name: "Threads", href: THREADS_PAGE_URL, icon: "threads" },
];

export default function SocialLinks({ label }: { label: string }) {
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-3 pt-2">
      {profiles.filter(profile => profile.href).map(profile => (
        <a
          key={profile.icon}
          href={profile.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={profile.name + " — Huyen's Hotels & Stays"}
          title={profile.name}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 transition hover:border-white/70 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Image
            src={"/icons/social/" + profile.icon + ".svg"}
            alt=""
            width={22}
            height={22}
            unoptimized
            aria-hidden="true"
            className="h-[22px] w-[22px] brightness-0 invert"
          />
        </a>
      ))}
    </nav>
  );
}
