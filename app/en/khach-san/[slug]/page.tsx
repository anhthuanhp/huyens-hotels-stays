import HotelPage from "../../../khach-san/[slug]/page";
import { englishRouteMetadata } from "../../../lib/english-route-metadata";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return englishRouteMetadata(["khach-san", slug]);
}
export default function EnglishHotel(props: Props) { return <HotelPage {...props} />; }
