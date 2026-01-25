import { http } from "./http";

export function login(payload) {
  return http("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
