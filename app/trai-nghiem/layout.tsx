import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/trai-nghiem");

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
