import { bookings } from "../data/bookings";
import { rooms } from "../data/rooms";

export type RoomAvailability = {
  roomSlug: string;
  hotelSlug: string;
  totalQuantity: number;
  bookedQuantity: number;
  availableQuantity: number;
};

function datesOverlap(
  checkInA: string,
  checkOutA: string,
  checkInB: string,
  checkOutB: string
) {
  return checkInA < checkOutB && checkOutA > checkInB;
}

export function getBookedQuantity(
  hotelSlug: string,
  roomSlug: string,
  checkIn: string,
  checkOut: string
) {
  return bookings
    .filter((booking) => {
      if (booking.hotelSlug !== hotelSlug) {
        return false;
      }

      if (booking.status === "cancelled") {
        return false;
      }

      return datesOverlap(
        booking.checkIn,
        booking.checkOut,
        checkIn,
        checkOut
      );
    })
    .reduce((total, booking) => {
      const room = booking.rooms.find(
        (item) => item.roomSlug === roomSlug
      );

      return total + (room?.quantity ?? 0);
    }, 0);
}

export function getRoomAvailability(
  roomSlug: string,
  hotelSlug: string,
  checkIn: string,
  checkOut: string
): RoomAvailability {
  const room = rooms.find(
    (item) =>
      item.slug === roomSlug &&
      item.hotelSlug === hotelSlug
  );

  if (!room) {
    return {
      roomSlug,
      hotelSlug,
      totalQuantity: 0,
      bookedQuantity: 0,
      availableQuantity: 0,
    };
  }

  const bookedQuantity = getBookedQuantity(
    hotelSlug,
    roomSlug,
    checkIn,
    checkOut
  );

  return {
    roomSlug,
    hotelSlug,
    totalQuantity: room.quantity,
    bookedQuantity,
    availableQuantity: Math.max(
      room.quantity - bookedQuantity,
      0
    ),
  };
}