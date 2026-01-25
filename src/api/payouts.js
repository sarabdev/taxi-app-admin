import { http } from "./http";

export function fetchAdminPayouts() {
  return http("/api/payouts/admin");
}

export function createPayout(payload) {
  return http("/api/payouts/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMyPayouts() {
  return http("/api/payouts/me");
}
