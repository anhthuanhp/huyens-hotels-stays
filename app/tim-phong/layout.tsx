import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/tim-phong");

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
