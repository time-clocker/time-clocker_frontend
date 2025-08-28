export const API = import.meta.env.VITE_API_URL ?? "https://time-clocker-backend.onrender.com";

export const TOKEN_KEY = "authToken";
export const ROLE_KEY = "role";
export const USER_DATA_KEY = "userData";

export const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};