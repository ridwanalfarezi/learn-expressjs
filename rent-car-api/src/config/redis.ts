import { createClient } from "redis";
import { REDIS_URL } from "../env";

const redisClient = createClient({
  url: REDIS_URL || "redis://localhost:6379",
});

let isConnected = false;

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
  isConnected = false;
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
  isConnected = true;
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Could not connect to Redis", err);
    console.warn("Application will run without caching");
  }
})();

// Safe wrapper functions
export const safeRedisGet = async (key: string): Promise<string | null> => {
  if (!isConnected) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error("Redis GET error:", err);
    return null;
  }
};

export const safeRedisSet = async (
  key: string,
  value: string,
  options?: any
): Promise<void> => {
  if (!isConnected) return;
  try {
    await redisClient.set(key, value, options);
  } catch (err) {
    console.error("Redis SET error:", err);
  }
};

export const safeRedisDel = async (pattern: string): Promise<void> => {
  if (!isConnected) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Redis DEL error:", err);
  }
};

export default redisClient;
