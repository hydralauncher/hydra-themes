import axios from "axios";

export const api = axios.create({
  baseURL: "https://hydra-api-us-east-1.losbroxas.org",
});
