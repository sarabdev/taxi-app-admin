import { http } from "./http";

export function fetchMyBookings() {
  return http("/api/bookings/me");
}

export function completeBooking(id, { note = "" } = {}) {
  return http(`/api/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "COMPLETED", note }),
  });
}
