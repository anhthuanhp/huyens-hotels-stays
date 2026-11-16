import RoomsClient from "./RoomsClient";
import { getRoomsData } from "./rooms-data";

export const revalidate = 60;

export default async function RoomsPage() {
  const { rooms, roomCovers } = await getRoomsData();
  return <RoomsClient rooms={rooms} roomCovers={roomCovers} />;
}
