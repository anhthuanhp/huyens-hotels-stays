import { HotelDetails, type PageProps } from "./HotelDetails";

export { generateMetadata, generateStaticParams } from "./HotelDetails";
export const revalidate = 60;

export default function HotelDetailPage(props: PageProps) {
  return <HotelDetails {...props} language="vi" />;
}
