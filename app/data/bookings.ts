export type BookingRoom = {
  roomSlug: string;
  quantity: number;
};

export type Booking = {
  id: string;
  hotelSlug: string;

  checkIn: string;
  checkOut: string;

  status: "confirmed" | "pending" | "cancelled";

  rooms: BookingRoom[];
};

export const bookings: Booking[] = [];