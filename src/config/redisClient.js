import { createClient } from "redis";

let client;

// Shared Redis client for request handlers. Connects on first use, so
// importing a module that needs Redis never requires it to be running.
export const getRedis = async () => {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    client.on("error", (error) => console.error("Redis client error:", error.message));
  }
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};
