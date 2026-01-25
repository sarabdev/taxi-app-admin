import { http } from "./http";

export const fetchCoupons = () => http("/api/coupons");

export const createCoupon = (payload) =>
  http("/api/coupons", { method: "POST", body: JSON.stringify(payload) });

export const toggleCoupon = (id) =>
  http(`/api/coupons/${id}/toggle`, { method: "PATCH" });

export const deleteCoupon = (id) =>
  http(`/api/coupons/${id}`, { method: "DELETE" });
