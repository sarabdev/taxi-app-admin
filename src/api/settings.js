import { http } from "./http";

export function fetchSettings() {
  return http("/api/settings");
}

export function updateSettings(payload) {
  return http("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
