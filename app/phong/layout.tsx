import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/phong");

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
