import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/chinh-sach-dat-phong");

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
