import { http } from "./http";

export const fetchDashboard = () => http("/api/dashboard/admin");

export const fetchDriverDashboard = () => http("/api/dashboard/driver");
