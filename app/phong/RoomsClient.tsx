"use client";

import { useLanguage } from "../lib/use-language";
import BoltRoomsClient from "./bolt/RoomsClient";
import type { RoomsClientProps } from "./bolt/types";

export default function RoomsClient({
  rooms,
  roomCovers
}: RoomsClientProps) {
  const lang = useLanguage();

  return (
    <BoltRoomsClient
      rooms={rooms}
      roomCovers={roomCovers}
      lang={lang}
    />
  );
}
