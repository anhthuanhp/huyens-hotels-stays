import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/kham-pha-huyens");

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
