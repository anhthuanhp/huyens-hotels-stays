import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/lien-he");

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
