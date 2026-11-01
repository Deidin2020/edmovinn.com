import type { Room } from "./api";

export function bookingUnavailableMessage(room: Room): string | null {
  if (room.bookable && room.price !== null && Number.isFinite(room.price) && room.capacity > 0) return null;
  return room.booking_unavailable_reason || (room.review_required
    ? "Booking for this room is awaiting approval. Please contact the residence."
    : "This room is currently unavailable. Please choose another room.");
}
