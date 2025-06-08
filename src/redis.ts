import { createClient } from "redis";

const url = process.env.REDIS_URL;

if (!url) {
  throw new Error("REDIS_URL environment variable is not set");
}

export const redisClient = createClient({ url });

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.connect();
