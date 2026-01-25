import { http } from "./http";

export function fetchBookingActivity(bookingId) {
  return http(`/api/activity/booking/${bookingId}`);
}
