import { FaqPage, supportMetadata } from "../../support/pages";

export const revalidate = 300;

export const metadata = supportMetadata("cau-hoi-thuong-gap", "en");

export default function Page() {
  return <FaqPage language="en" />;
}
