import RoomsPage from "../../phong/page";
import { englishRouteMetadata } from "../../lib/english-route-metadata";

export const revalidate = 60;
export async function generateMetadata() { return englishRouteMetadata(["phong"]); }
export default function EnglishRooms() { return <RoomsPage />; }
