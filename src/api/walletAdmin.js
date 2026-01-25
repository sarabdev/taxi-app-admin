import { http } from "./http";

export const fetchWalletSummary = () => http("/api/wallet/admin/summary");
export const fetchDriverLedger = (driverId) => http(`/api/wallet/admin/${driverId}`);
