import ky from "ky";

export const api = ky.create({
  prefixUrl: "https://hydra-api-us-east-1.losbroxas.org",
  credentials: "include",
});
