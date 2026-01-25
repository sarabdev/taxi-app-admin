import { http } from "./http";

export function fetchMyWallet() {
  return http("/api/wallet/me");
}
