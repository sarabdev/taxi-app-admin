import { http } from "./http";

export function calculatePrice(payload) {
  return http("/api/pricing/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
