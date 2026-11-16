import { getRoomsData } from "../phong/rooms-data";
import FindRoomsClient from "./FindRoomsClient";

export default async function FindRoomsPage() {
  const { rooms, roomCovers } = await getRoomsData();
  return <FindRoomsClient catalog={rooms} covers={roomCovers} />;
}
