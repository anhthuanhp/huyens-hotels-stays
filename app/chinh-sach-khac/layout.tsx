import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/chinh-sach-khac");

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
