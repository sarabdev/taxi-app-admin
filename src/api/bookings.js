import { http } from "./http";

export function fetchBookings() {
  return http("/api/bookings");
}

export function assignBooking(id, driverId) {
  return http(`/api/bookings/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ driverId }),
  });
}

export function updateBookingStatus(id, status) {
  return http(`/api/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function createBooking(payload) {
  return http("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function fetchBooking(id) {
  return http(`/api/bookings/${id}`);
}
