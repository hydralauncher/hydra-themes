import { createClient } from "redis";

export const redis = createClient({
  url: import.meta.env.REDIS_URL,
});

redis.connect();
