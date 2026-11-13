import RoomPage from "../../../../../khach-san/[slug]/phong/[roomSlug]/page";
import { englishRouteMetadata } from "../../../../../lib/english-route-metadata";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string; roomSlug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug, roomSlug } = await params;
  return englishRouteMetadata(["khach-san", slug, "phong", roomSlug]);
}
export default function EnglishRoom(props: Props) { return <RoomPage {...props} />; }
