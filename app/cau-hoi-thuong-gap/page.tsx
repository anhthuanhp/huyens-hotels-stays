import { FaqPage, supportMetadata } from "../support/pages";

export const revalidate = 300;

export const metadata = supportMetadata("cau-hoi-thuong-gap", "vi");

export default function Page() {
  return <FaqPage language="vi" />;
}
