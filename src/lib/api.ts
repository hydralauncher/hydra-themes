import ky from "ky";

export const api = ky.create({
  prefixUrl: import.meta.env.PUBLIC_API_URL,
  credentials: "include",
});
