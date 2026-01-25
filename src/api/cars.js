import { http } from "./http";

export const fetchCars = () => http("/api/cars");
export const createCar = (payload) =>
  http("/api/cars", { method: "POST", body: JSON.stringify(payload) });

export const updateCar = (id, payload) =>
  http(`/api/cars/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteCar = (id) =>
  http(`/api/cars/${id}`, { method: "DELETE" });
