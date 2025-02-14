import { createClient } from "redis";
import { REDIS_URL } from "../env";

const redisClient = createClient({
  url: REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Could not connect to Redis", err);
  }
})();

export default redisClient;
