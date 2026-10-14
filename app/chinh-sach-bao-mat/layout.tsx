import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/chinh-sach-bao-mat");

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
