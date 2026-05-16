import { http } from "./http";

/**
 * Fetch all drivers
 */
export function fetchDrivers() {
  return http("/api/drivers");
}

/**
 * Create a new driver
 */
export function createDriver(payload) {
  return http("/api/drivers", {
    method: "POST",
    body: payload,
  });
}

/**
 * Update driver profile
 */
export function updateDriver(driverId, payload) {
  return http(`/api/drivers/${driverId}`, {
    method: "PUT",
    body: payload,
  });
}

/**
 * Activate / Deactivate driver
 */
export function updateDriverStatus(driverId, isActive) {
  return http(`/api/drivers/${driverId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

/**
 * Delete driver
 */
export function deleteDriver(driverId) {
  return http(`/api/drivers/${driverId}`, {
    method: "DELETE",
  });
}